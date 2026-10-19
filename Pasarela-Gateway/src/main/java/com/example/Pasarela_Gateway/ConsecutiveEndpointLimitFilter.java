package com.example.Pasarela_Gateway;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filtro de control de tráfico en la Pasarela-Gateway.
 * Limita a un máximo de 2 peticiones consecutivas hacia el mismo endpoint por cliente.
 * A la 3ra petición consecutiva hacia el mismo endpoint, se rechaza la solicitud (HTTP 429).
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class ConsecutiveEndpointLimitFilter extends OncePerRequestFilter {

    private static final int MAX_CONSECUTIVE_ALLOWED = 2;
    private static final long COOLDOWN_MILLIS = 30_000; // 30 segundos de inactividad reinician el conteo

    // Mapa thread-safe para rastrear el estado de cada cliente (por IP)
    private final Map<String, ClientHistory> clientHistories = new ConcurrentHashMap<>();

    private static class ClientHistory {
        private String lastEndpoint = "";
        private int consecutiveCount = 0;
        private long lastRequestTimestamp = 0;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Aplicar la regla a todos los endpoints de API (/api/**)
        if (path.startsWith("/api/")) {
            String method = request.getMethod();
            String endpointKey = method + " " + path;
            String clientIp = getClientIp(request);

            ClientHistory history = clientHistories.computeIfAbsent(clientIp, k -> new ClientHistory());

            boolean blocked = false;
            int currentAttempts = 0;

            synchronized (history) {
                long now = System.currentTimeMillis();

                // Si ha pasado más de 30 segundos sin consultar, reiniciar el conteo consecutivo
                if (now - history.lastRequestTimestamp > COOLDOWN_MILLIS) {
                    history.lastEndpoint = endpointKey;
                    history.consecutiveCount = 1;
                    history.lastRequestTimestamp = now;
                } else if (endpointKey.equalsIgnoreCase(history.lastEndpoint)) {
                    // Es el mismo endpoint de manera consecutiva
                    history.consecutiveCount++;
                    history.lastRequestTimestamp = now;
                    currentAttempts = history.consecutiveCount;

                    if (history.consecutiveCount > MAX_CONSECUTIVE_ALLOWED) {
                        blocked = true;
                    }
                } else {
                    // El usuario cambió de endpoint: reiniciar contador para el nuevo endpoint
                    history.lastEndpoint = endpointKey;
                    history.consecutiveCount = 1;
                    history.lastRequestTimestamp = now;
                }
            }

            if (blocked) {
                response.setStatus(429); // 429 Too Many Requests
                response.setContentType("application/json;charset=UTF-8");

                String jsonError = String.format(
                    "{\n" +
                    "  \"timestamp\": \"%s\",\n" +
                    "  \"status\": 429,\n" +
                    "  \"error\": \"Too Many Requests\",\n" +
                    "  \"message\": \"No se permite realizar más de %d peticiones consecutivas al mismo endpoint (%s). Por favor consulte otro endpoint o espere 30 segundos.\",\n" +
                    "  \"endpoint\": \"%s\",\n" +
                    "  \"metodo\": \"%s\",\n" +
                    "  \"peticionesConsecutivas\": %d,\n" +
                    "  \"limitePermitido\": %d\n" +
                    "}",
                    Instant.now().toString(),
                    MAX_CONSECUTIVE_ALLOWED,
                    endpointKey,
                    path,
                    method,
                    currentAttempts,
                    MAX_CONSECUTIVE_ALLOWED
                );

                response.getWriter().write(jsonError);
                response.getWriter().flush();
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isEmpty() && !"unknown".equalsIgnoreCase(xfHeader)) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
