package com.example.Servicio03;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TablaPosicionesControlador {

    private final TablaPosicionesServicio tablaPosicionesServicio;

    @GetMapping(value = {"/tabla-posiciones", "/partidos/tabla-posiciones"})
    public ResponseEntity<List<EquipoStats>> obtenerTablaPosiciones() {
        return ResponseEntity.ok(tablaPosicionesServicio.calcularTablaPosiciones());
    }

    @GetMapping("/partidos-resumen")
    public ResponseEntity<List<Partido>> obtenerPartidosResumen() {
        return ResponseEntity.ok(tablaPosicionesServicio.obtenerPartidos());
    }
}
