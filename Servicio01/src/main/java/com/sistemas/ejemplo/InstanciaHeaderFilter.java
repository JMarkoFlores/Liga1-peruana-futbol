package com.sistemas.ejemplo;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Identifica al proceso que responde usando su mismo ID de registro en Eureka. */
@Component
public class InstanciaHeaderFilter extends OncePerRequestFilter {

    private final String instanceId;

    public InstanciaHeaderFilter(@Value("${eureka.instance.instance-id}") String instanceId) {
        this.instanceId = instanceId;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        response.setHeader("X-Instancia", instanceId);
        filterChain.doFilter(request, response);
    }
}
