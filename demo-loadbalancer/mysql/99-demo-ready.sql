-- Sólo se ejecuta en la inicialización del volumen NUEVO de esta demo,
-- después del SQL original montado como 10-sistema.sql.
USE sistema;
CREATE TABLE demo_initialization (
    id TINYINT NOT NULL PRIMARY KEY,
    seed_version VARCHAR(20) NOT NULL
);
INSERT INTO demo_initialization (id, seed_version) VALUES (1, 'liga1-v1');
