package com.sistemas.ejemplo;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EquipoServicio {

    private final EquipoRepositorio equipoRepositorio;

    public Equipo registrarEquipo(Equipo equipo) {
        if (equipo.getNombre() != null) {
            equipo.setNombre(equipo.getNombre().trim());
        }
        if (equipo.getCiudad() != null) {
            equipo.setCiudad(equipo.getCiudad().trim());
        }
        if (equipo.getEstadio() != null) {
            equipo.setEstadio(equipo.getEstadio().trim());
        }
        return equipoRepositorio.save(equipo);
    }

    public List<Equipo> obtenerEquipos() {
        return equipoRepositorio.findAllByOrderByNombreAsc();
    }

    public Optional<Equipo> obtenerEquipoPorId(int id) {
        return equipoRepositorio.findById(id);
    }

    public Optional<Equipo> actualizarEquipo(int id, Equipo datos) {
        return equipoRepositorio.findById(id).map(existente -> {
            if (datos.getNombre() != null && !datos.getNombre().isBlank()) {
                existente.setNombre(datos.getNombre().trim());
            }
            if (datos.getCiudad() != null) {
                existente.setCiudad(datos.getCiudad().trim());
            }
            if (datos.getEstadio() != null) {
                existente.setEstadio(datos.getEstadio().trim());
            }
            return equipoRepositorio.save(existente);
        });
    }

    public boolean eliminarEquipo(int id) {
        if (equipoRepositorio.existsById(id)) {
            equipoRepositorio.deleteById(id);
            return true;
        }
        return false;
    }
}
