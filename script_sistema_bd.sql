-- ==============================================================
-- Script de Base de Datos MySQL: sistema
-- Proyecto: FútbolStats - Gestión de Liga 1 de Fútbol Peruano
-- ==============================================================

-- 1. Creación de la base de datos si no existe
CREATE DATABASE IF NOT EXISTS `sistema`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `sistema`;

-- 2. Creación de la tabla 'partidos'
-- Nota: Esta tabla coincide exactamente con la entidad JPA 'Partido.java'
-- y la convención de nombres de Spring Boot (camelCase -> snake_case).
CREATE TABLE IF NOT EXISTS `partidos` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `equipo_local` VARCHAR(255) NOT NULL,
    `equipo_visitante` VARCHAR(255) NOT NULL,
    `goles_local` INT NOT NULL,
    `goles_visitante` INT NOT NULL,
    `fecha` DATE NOT NULL,
    `jornada` INT NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- 3. Datos de prueba iniciales (Liga 1 de Fútbol Peruano)
-- ==============================================================
-- Limpiar datos existentes si se desea reiniciar (opcional):
-- TRUNCATE TABLE `partidos`;

INSERT INTO `partidos` (`equipo_local`, `equipo_visitante`, `goles_local`, `goles_visitante`, `fecha`, `jornada`) VALUES
-- Jornada 1
('Universitario', 'FBC Melgar', 2, 1, '2026-02-01', 1),
('Alianza Lima', 'Sporting Cristal', 1, 1, '2026-02-02', 1),
('Cienciano', 'Sport Boys', 3, 0, '2026-02-02', 1),
('Cusco FC', 'César Vallejo', 2, 0, '2026-02-03', 1),
('ADT Tarma', 'Deportivo Garcilaso', 1, 0, '2026-02-03', 1),

-- Jornada 2
('Sporting Cristal', 'Universitario', 2, 2, '2026-02-08', 2),
('FBC Melgar', 'Alianza Lima', 1, 2, '2026-02-09', 2),
('Sport Boys', 'ADT Tarma', 1, 1, '2026-02-09', 2),
('César Vallejo', 'Cienciano', 0, 2, '2026-02-10', 2),
('Deportivo Garcilaso', 'Cusco FC', 1, 3, '2026-02-10', 2),

-- Jornada 3
('Universitario', 'Cienciano', 3, 1, '2026-02-15', 3),
('Alianza Lima', 'Cusco FC', 2, 1, '2026-02-16', 3),
('Sporting Cristal', 'FBC Melgar', 2, 0, '2026-02-16', 3),
('ADT Tarma', 'César Vallejo', 2, 1, '2026-02-17', 3),
('Sport Boys', 'Deportivo Garcilaso', 0, 0, '2026-02-17', 3);

-- ==============================================================
-- 4. Verificación
-- ==============================================================
SELECT * FROM `partidos` ORDER BY `jornada` ASC, `fecha` ASC;
