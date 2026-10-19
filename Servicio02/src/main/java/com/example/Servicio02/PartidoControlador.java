package com.example.Servicio02;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/partidos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PartidoControlador {

    private final PartidoServicio partidoServicio;

    @PostMapping
    public ResponseEntity<Partido> registrarPartido(@RequestBody Partido partido) {
        Partido guardado = partidoServicio.registrarPartido(partido);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }

    @GetMapping
    public ResponseEntity<List<Partido>> listarPartidos(@RequestParam(required = false) Integer jornada) {
        if (jornada != null) {
            return ResponseEntity.ok(partidoServicio.obtenerPartidosPorJornada(jornada));
        }
        return ResponseEntity.ok(partidoServicio.obtenerPartidos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Partido> obtenerPartidoPorId(@PathVariable int id) {
        return partidoServicio.obtenerPartidoPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Partido> actualizarPartido(@PathVariable int id, @RequestBody Partido partido) {
        return partidoServicio.actualizarPartido(id, partido)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPartido(@PathVariable int id) {
        boolean eliminado = partidoServicio.eliminarPartido(id);
        if (eliminado) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
