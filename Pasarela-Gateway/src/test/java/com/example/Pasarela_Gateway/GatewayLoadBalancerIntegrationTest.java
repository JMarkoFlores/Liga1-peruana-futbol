package com.example.Pasarela_Gateway;

import static org.assertj.core.api.Assertions.assertThat;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/** HTTP real del Gateway con dos destinos controlados; no sustituye una prueba con Eureka/MySQL. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "eureka.client.enabled=false")
@ActiveProfiles("taller-loadbalancer")
class GatewayLoadBalancerIntegrationTest {

    private static final String EQUIPO = "{\"id\":1,\"nombre\":\"Equipo de prueba\",\"ciudad\":\"Lima\",\"estadio\":\"Estadio de prueba\"}";
    private static final HttpServer REPLICA_A = backend("Servicio01-A");
    private static final HttpServer REPLICA_B = backend("Servicio01-B");

    @LocalServerPort
    private int port;

    @DynamicPropertySource
    static void instances(DynamicPropertyRegistry registry) {
        registry.add("spring.cloud.discovery.client.simple.instances.Servicio01[0].uri",
                () -> "http://127.0.0.1:" + REPLICA_A.getAddress().getPort());
        registry.add("spring.cloud.discovery.client.simple.instances.Servicio01[1].uri",
                () -> "http://127.0.0.1:" + REPLICA_B.getAddress().getPort());
    }

    @AfterAll
    static void stopBackends() {
        REPLICA_A.stop(0);
        REPLICA_B.stop(0);
    }

    @Test
    void workshopProfileRoutesRepeatedRequestsToBothInstancesAndPreservesTheJson() throws Exception {
        Set<String> identities = new HashSet<>();
        try (HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build()) {
            for (int i = 0; i < 12; i++) {
                HttpResponse<String> response = send(client, "GET", "/api/equipos", null);
                assertThat(response.statusCode()).isEqualTo(200);
                assertThat(response.body()).isEqualTo("[" + EQUIPO + "]");
                identities.add(response.headers().firstValue("X-Instancia").orElseThrow());
            }
        }
        assertThat(identities).containsExactlyInAnyOrder("Servicio01-A", "Servicio01-B");
    }

    @Test
    void nestedRoutePreservesPathQueryMethodBodyAndStatus() throws Exception {
        try (HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build()) {
            HttpResponse<String> found = send(client, "GET", "/api/equipos/1?detalle=true", null);
            assertThat(found.statusCode()).isEqualTo(200);
            assertThat(found.body()).isEqualTo(EQUIPO);
            assertThat(found.headers().firstValue("X-Instancia")).hasValueSatisfying(
                    id -> assertThat(id).isIn("Servicio01-A", "Servicio01-B"));
            HttpResponse<String> missing = send(client, "GET", "/api/equipos/999", null);
            assertThat(missing.statusCode()).isEqualTo(404);
            assertThat(missing.body()).isEmpty();
            HttpResponse<String> created = send(client, "POST", "/api/equipos", EQUIPO);
            assertThat(created.statusCode()).isEqualTo(201);
            assertThat(created.body()).isEqualTo(EQUIPO);
            HttpResponse<String> updated = send(client, "PUT", "/api/equipos/1", EQUIPO);
            assertThat(updated.statusCode()).isEqualTo(200);
            assertThat(updated.body()).isEqualTo(EQUIPO);
            HttpResponse<String> deleted = send(client, "DELETE", "/api/equipos/1", null);
            assertThat(deleted.statusCode()).isEqualTo(204);
            assertThat(deleted.body()).isEmpty();
        }
    }

    private HttpResponse<String> send(HttpClient client, String method, String path, String body)
            throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .timeout(Duration.ofSeconds(10)).header("Content-Type", "application/json")
                .method(method, body == null ? HttpRequest.BodyPublishers.noBody()
                        : HttpRequest.BodyPublishers.ofString(body)).build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private static HttpServer backend(String identity) {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            server.createContext("/", exchange -> {
                String path = exchange.getRequestURI().getPath();
                String method = exchange.getRequestMethod();
                String body;
                int status;
                if ("GET".equals(method) && "/api/equipos".equals(path)) {
                    status = 200;
                    body = "[" + EQUIPO + "]";
                } else if ("GET".equals(method) && "/api/equipos/1".equals(path)
                        && "detalle=true".equals(exchange.getRequestURI().getQuery())) {
                    status = 200;
                    body = EQUIPO;
                } else if (("POST".equals(method) && "/api/equipos".equals(path))
                        || ("PUT".equals(method) && "/api/equipos/1".equals(path))) {
                    status = "POST".equals(method) ? 201 : 200;
                    body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                } else {
                    status = "DELETE".equals(method) && "/api/equipos/1".equals(path) ? 204 : 404;
                    body = "";
                }
                exchange.getResponseHeaders().set("X-Instancia", identity);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
                exchange.sendResponseHeaders(status, bytes.length == 0 ? -1 : bytes.length);
                try (var output = exchange.getResponseBody()) {
                    output.write(bytes);
                }
                exchange.close();
            });
            server.start();
            return server;
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo iniciar el destino HTTP de prueba", ex);
        }
    }
}
