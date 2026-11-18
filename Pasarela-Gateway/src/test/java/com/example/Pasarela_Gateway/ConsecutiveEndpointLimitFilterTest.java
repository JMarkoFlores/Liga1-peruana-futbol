package com.example.Pasarela_Gateway;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class ConsecutiveEndpointLimitFilterTest {

    private final AtomicLong now = new AtomicLong(1_000_000);
    private final AtomicInteger forwarded = new AtomicInteger();
    private ConsecutiveEndpointLimitFilter filter;

    @BeforeEach
    void setUp() {
        filter = new ConsecutiveEndpointLimitFilter(true, now::get);
    }

    @Test
    void permitsTwoCallsAndRejectsTheThirdWithoutForwardingIt() throws Exception {
        assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(200);
        assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(200);
        MockHttpServletResponse blocked = call("GET", "/api/equipos");
        assertThat(blocked.getStatus()).isEqualTo(429);
        assertThat(blocked.getContentType()).isEqualTo("application/json;charset=UTF-8");
        assertThat(blocked.getContentAsString()).contains("\"peticionesConsecutivas\": 3", "\"limitePermitido\": 2");
        assertThat(forwarded).hasValue(2);
    }

    @Test
    void changingTheEndpointOrMethodResetsTheCount() throws Exception {
        call("GET", "/api/equipos");
        call("GET", "/api/equipos");
        assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(429);
        assertThat(call("GET", "/api/partidos").getStatus()).isEqualTo(200);
        assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(200);
        assertThat(call("POST", "/api/equipos").getStatus()).isEqualTo(200);
        assertThat(call("POST", "/api/equipos").getStatus()).isEqualTo(200);
        assertThat(call("POST", "/api/equipos").getStatus()).isEqualTo(429);
    }

    @Test
    void blockedAttemptsRefreshTheCooldownAndResetRequiresMoreThanThirtySeconds() throws Exception {
        call("GET", "/api/equipos");
        call("GET", "/api/equipos");
        assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(429);
        now.addAndGet(29_000);
        assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(429);
        now.addAndGet(30_000);
        assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(429);
        now.addAndGet(30_001);
        assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(200);
        assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(200);
        assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(429);
    }

    @Test
    void nonApiRequestsAreUnrestrictedAndDoNotResetApiHistory() throws Exception {
        call("GET", "/api/equipos");
        call("GET", "/api/equipos");
        for (int i = 0; i < 4; i++) {
            assertThat(call("GET", "/equipos.html").getStatus()).isEqualTo(200);
        }
        assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(429);
    }

    @Test
    void historiesRemainIndependentForDifferentClients() throws Exception {
        call("GET", "/api/equipos");
        call("GET", "/api/equipos");
        assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(429);
        MockHttpServletRequest otherClient = new MockHttpServletRequest("GET", "/api/equipos");
        otherClient.setRemoteAddr("127.0.0.2");
        assertThat(call(otherClient).getStatus()).isEqualTo(200);
        assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(429);
    }

    @Test
    void queryStringsDoNotBypassTheLimit() throws Exception {
        for (int i = 0; i < 3; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/equipos");
            request.setQueryString("page=" + i);
            assertThat(call(request).getStatus()).isEqualTo(i < 2 ? 200 : 429);
        }
    }

    @Test
    void disabledModePermitsTwelveIdenticalRequests() throws Exception {
        filter = new ConsecutiveEndpointLimitFilter(false, now::get);
        for (int i = 0; i < 12; i++) {
            assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(200);
        }
        assertThat(forwarded).hasValue(12);
    }

    @Test
    void defaultPropertyEnablesTheLimit() {
        new ApplicationContextRunner().withBean(ConsecutiveEndpointLimitFilter.class).run(context -> {
            assertThat(context).hasNotFailed();
            filter = context.getBean(ConsecutiveEndpointLimitFilter.class);
            assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(200);
            assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(200);
            assertThat(call("GET", "/api/equipos").getStatus()).isEqualTo(429);
        });
    }

    private MockHttpServletResponse call(String method, String path) throws Exception {
        return call(new MockHttpServletRequest(method, path));
    }

    private MockHttpServletResponse call(MockHttpServletRequest request) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, (req, res) -> {
            forwarded.incrementAndGet();
            res.getWriter().write("ok");
        });
        return response;
    }
}
