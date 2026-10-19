package com.example.Servicio02;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PartidoServicio {

    private final PartidoRepositorio partidoRepositorio;

    public Partido registrarPartido(Partido partido) {
        return partidoRepositorio.save(partido);
    }

    public List<Partido> obtenerPartidos() {
        return partidoRepositorio.findAllByOrderByJornadaAscFechaAsc();
    }

    public List<Partido> obtenerPartidosPorJornada(int jornada) {
        return partidoRepositorio.findAllByJornadaOrderByFechaAsc(jornada);
    }

    public Optional<Partido> obtenerPartidoPorId(int id) {
        return partidoRepositorio.findById(id);
    }

    public boolean eliminarPartido(int id) {
        if (partidoRepositorio.existsById(id)) {
            partidoRepositorio.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Partido> actualizarPartido(int id, Partido partidoActualizado) {
        return partidoRepositorio.findById(id).map(existente -> {
            existente.setEquipoLocal(partidoActualizado.getEquipoLocal());
            existente.setEquipoVisitante(partidoActualizado.getEquipoVisitante());
            existente.setGolesLocal(partidoActualizado.getGolesLocal());
            existente.setGolesVisitante(partidoActualizado.getGolesVisitante());
            existente.setFecha(partidoActualizado.getFecha());
            existente.setJornada(partidoActualizado.getJornada());
            return partidoRepositorio.save(existente);
        });
    }
}
