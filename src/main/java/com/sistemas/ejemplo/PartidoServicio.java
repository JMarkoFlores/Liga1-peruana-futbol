package com.sistemas.ejemplo;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

    public List<EquipoStats> calcularTablaPosiciones() {
        List<Partido> partidos = partidoRepositorio.findAll();
        Map<String, EquipoStats> tabla = new LinkedHashMap<>();

        for (Partido p : partidos) {
            if (p.getEquipoLocal() == null || p.getEquipoVisitante() == null ||
                p.getGolesLocal() == null || p.getGolesVisitante() == null) {
                continue;
            }

            String local = p.getEquipoLocal().trim();
            String visitante = p.getEquipoVisitante().trim();

            if (local.isEmpty() || visitante.isEmpty()) {
                continue;
            }

            EquipoStats statsLocal = tabla.computeIfAbsent(local, k -> EquipoStats.builder()
                    .equipo(k)
                    .partidosJugados(0)
                    .ganados(0)
                    .empatados(0)
                    .perdidos(0)
                    .golesFavor(0)
                    .golesContra(0)
                    .diferenciaGoles(0)
                    .puntos(0)
                    .build());

            EquipoStats statsVisitante = tabla.computeIfAbsent(visitante, k -> EquipoStats.builder()
                    .equipo(k)
                    .partidosJugados(0)
                    .ganados(0)
                    .empatados(0)
                    .perdidos(0)
                    .golesFavor(0)
                    .golesContra(0)
                    .diferenciaGoles(0)
                    .puntos(0)
                    .build());

            int gl = p.getGolesLocal();
            int gv = p.getGolesVisitante();

            statsLocal.setPartidosJugados(statsLocal.getPartidosJugados() + 1);
            statsLocal.setGolesFavor(statsLocal.getGolesFavor() + gl);
            statsLocal.setGolesContra(statsLocal.getGolesContra() + gv);

            statsVisitante.setPartidosJugados(statsVisitante.getPartidosJugados() + 1);
            statsVisitante.setGolesFavor(statsVisitante.getGolesFavor() + gv);
            statsVisitante.setGolesContra(statsVisitante.getGolesContra() + gl);

            if (gl > gv) {
                statsLocal.setGanados(statsLocal.getGanados() + 1);
                statsLocal.setPuntos(statsLocal.getPuntos() + 3);

                statsVisitante.setPerdidos(statsVisitante.getPerdidos() + 1);
            } else if (gl < gv) {
                statsVisitante.setGanados(statsVisitante.getGanados() + 1);
                statsVisitante.setPuntos(statsVisitante.getPuntos() + 3);

                statsLocal.setPerdidos(statsLocal.getPerdidos() + 1);
            } else {
                statsLocal.setEmpatados(statsLocal.getEmpatados() + 1);
                statsLocal.setPuntos(statsLocal.getPuntos() + 1);

                statsVisitante.setEmpatados(statsVisitante.getEmpatados() + 1);
                statsVisitante.setPuntos(statsVisitante.getPuntos() + 1);
            }

            statsLocal.setDiferenciaGoles(statsLocal.getGolesFavor() - statsLocal.getGolesContra());
            statsVisitante.setDiferenciaGoles(statsVisitante.getGolesFavor() - statsVisitante.getGolesContra());
        }

        List<EquipoStats> lista = new ArrayList<>(tabla.values());
        lista.sort(
            Comparator.comparingInt(EquipoStats::getPuntos).reversed()
                .thenComparing(Comparator.comparingInt(EquipoStats::getDiferenciaGoles).reversed())
                .thenComparing(Comparator.comparingInt(EquipoStats::getGolesFavor).reversed())
                .thenComparing(EquipoStats::getEquipo, String.CASE_INSENSITIVE_ORDER)
        );

        return lista;
    }
}
