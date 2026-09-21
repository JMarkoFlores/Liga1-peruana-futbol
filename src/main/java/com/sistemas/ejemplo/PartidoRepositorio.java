package com.sistemas.ejemplo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartidoRepositorio extends JpaRepository<Partido, Integer> {

    List<Partido> findAllByOrderByJornadaAscFechaAsc();

    List<Partido> findAllByJornadaOrderByFechaAsc(Integer jornada);
}
