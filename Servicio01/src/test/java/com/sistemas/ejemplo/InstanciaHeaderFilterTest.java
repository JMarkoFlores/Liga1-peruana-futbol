package com.sistemas.ejemplo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class InstanciaHeaderFilterTest {

    private static final String JSON = "{\"id\":1,\"nombre\":\"Equipo de prueba\",\"ciudad\":\"Lima\",\"estadio\":\"Estadio de prueba\"}";
    private final EquipoServicio servicio = mock(EquipoServicio.class);
    private final Equipo equipo = new Equipo(1, "Equipo de prueba", "Lima", "Estadio de prueba");
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = mvc("Servicio01-A");
    }

    @Test
    void headerIsStableAndDoesNotChangeTheEquipmentArray() throws Exception {
        when(servicio.obtenerEquipos()).thenReturn(List.of(equipo));
        String firstBody = mvc.perform(get("/api/equipos"))
                .andExpect(status().isOk()).andExpect(header().string("X-Instancia", "Servicio01-A"))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].length()").value(4))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nombre").value("Equipo de prueba"))
                .andExpect(jsonPath("$[0].ciudad").value("Lima"))
                .andExpect(jsonPath("$[0].estadio").value("Estadio de prueba"))
                .andReturn().getResponse().getContentAsString();
        mvc.perform(get("/api/equipos"))
                .andExpect(header().string("X-Instancia", "Servicio01-A"))
                .andExpect(content().string(firstBody));
        mvc("Servicio01-B").perform(get("/api/equipos"))
                .andExpect(header().string("X-Instancia", "Servicio01-B"))
                .andExpect(content().string(firstBody));
    }

    @Test
    void detailAndMissingEquipmentKeepTheirBodiesAndStatusCodes() throws Exception {
        when(servicio.obtenerEquipoPorId(1)).thenReturn(Optional.of(equipo));
        when(servicio.obtenerEquipoPorId(999)).thenReturn(Optional.empty());
        mvc.perform(get("/api/equipos/1"))
                .andExpect(status().isOk()).andExpect(content().json(JSON))
                .andExpect(header().string("X-Instancia", "Servicio01-A"));
        mvc.perform(get("/api/equipos/999"))
                .andExpect(status().isNotFound()).andExpect(content().string(""))
                .andExpect(header().string("X-Instancia", "Servicio01-A"));
    }

    @Test
    void createUpdateDeleteAndValidationKeepTheirContracts() throws Exception {
        when(servicio.registrarEquipo(any(Equipo.class))).thenReturn(equipo);
        when(servicio.actualizarEquipo(org.mockito.ArgumentMatchers.eq(1), any(Equipo.class)))
                .thenReturn(Optional.of(equipo));
        when(servicio.eliminarEquipo(1)).thenReturn(true);
        mvc.perform(post("/api/equipos").contentType(MediaType.APPLICATION_JSON).content(JSON))
                .andExpect(status().isCreated()).andExpect(content().json(JSON))
                .andExpect(header().string("X-Instancia", "Servicio01-A"));
        mvc.perform(put("/api/equipos/1").contentType(MediaType.APPLICATION_JSON).content(JSON))
                .andExpect(status().isOk()).andExpect(content().json(JSON))
                .andExpect(header().string("X-Instancia", "Servicio01-A"));
        mvc.perform(delete("/api/equipos/1"))
                .andExpect(status().isNoContent()).andExpect(content().string(""))
                .andExpect(header().string("X-Instancia", "Servicio01-A"));
        mvc.perform(post("/api/equipos").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("El nombre del equipo es obligatorio."))
                .andExpect(header().string("X-Instancia", "Servicio01-A"));
    }

    @ParameterizedTest
    @CsvSource({"taller-replica-a,Servicio01-A,8761", "taller-replica-b,Servicio01-B,8764"})
    void localProfilesInjectTheEurekaIdentityIntoTheResponse(String profile, String expectedId, int port) {
        new ApplicationContextRunner()
                .withInitializer(new ConfigDataApplicationContextInitializer())
                .withPropertyValues("spring.profiles.active=" + profile)
                .withBean(InstanciaHeaderFilter.class)
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context.getEnvironment().getProperty("spring.application.name")).isEqualTo("Servicio01");
                    assertThat(context.getEnvironment().getProperty("server.port", Integer.class)).isEqualTo(port);
                    MockHttpServletResponse response = new MockHttpServletResponse();
                    context.getBean(InstanciaHeaderFilter.class).doFilter(
                            new MockHttpServletRequest("GET", "/api/equipos"), response,
                            (request, result) -> result.getWriter().write("[]"));
                    assertThat(response.getHeader("X-Instancia")).isEqualTo(expectedId)
                            .isEqualTo(context.getEnvironment().getProperty("eureka.instance.instance-id"));
                    assertThat(response.getContentAsString()).isEqualTo("[]");
                });
    }

    private MockMvc mvc(String identity) {
        return MockMvcBuilders.standaloneSetup(new EquipoControlador(servicio))
                .addFilters(new InstanciaHeaderFilter(identity)).build();
    }
}
