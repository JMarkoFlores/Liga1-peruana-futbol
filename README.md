# ⚽ FútbolStats — Liga 1 de Fútbol Peruano

Sistema distribuido para la gestión deportiva y generación en tiempo real de estadísticas y tabla de posiciones de la **Liga 1 del Fútbol Peruano**, desarrollado con una arquitectura de microservicios usando **Spring Boot**, **Spring Cloud** y **MySQL**.

---

## 🏛️ Arquitectura del Sistema

El ecosistema desacopla los dominios en 5 componentes independientes que se comunican entre sí:

```
[ Cliente / Postman / Navegador Web ]
                  │
                  ▼  (Puerto 8080)
      ┌─────────────────────────┐
      │    Pasarela-Gateway     │ ── Consulta registro ──┐
      └─────────────────────────┘                        │
         │           │           │                       ▼
         │           │           │               ┌────────────────┐
         │           │           │               │ Servidor-Eureka│ (Puerto 8760)
         ▼           ▼           ▼               └────────────────┘
    Servicio01  Servicio02  Servicio03           (Directorio de servicios)
     (:8761)     (:8762)     (:8763)
    (Equipos)   (Partidos)  (Tabla & UI)
         │           │           │
         └───────────┴───────────┴───▶ Base de Datos MySQL [sistema]
```

### Componentes:

| Componente | Puerto | Rol | Descripción |
| :--- | :---: | :--- | :--- |
| **`Servidor-Eureka`** | `8760` | Service Discovery | Directorio central y monitoreo de salud (*Heartbeat*) de microservicios con Netflix Eureka. |
| **`Pasarela-Gateway`** | `8080` | API Gateway | Punto de entrada único, enrutamiento, CORS y filtro de control de tráfico consecutivo. |
| **`Servicio01`** | `8761` | Microservicio de Negocio | CRUD completo de clubes de fútbol (tabla `equipos`). |
| **`Servicio02`** | `8762` | Microservicio de Negocio | Registro y consulta de partidos y marcadores (tabla `partidos`). |
| **`Servicio03`** | `8763` | Microservicio Analítico & UI | Algoritmo de cálculo de la tabla de posiciones y servidor de vistas web. |

---

## 🚀 Puesta en Marcha (Ejecución Local)

### 1. Requisitos Previos
* **Java 21 LTS**
* **MySQL 8.x** (por ejemplo, con WampServer o XAMPP en el puerto `3306`).
* Base de datos: Ejecutar el script [`Servicio01/script_sistema_bd.sql`](./Servicio01/script_sistema_bd.sql) en MySQL para crear la base de datos `sistema` con los datos iniciales de prueba.

### 2. Secuencia de Arranque (¡El orden es importante!)
Abra 5 terminales y ejecute los servicios en la siguiente secuencia:

```powershell
# 1. Servidor Eureka (Registro central - Iniciar primero)
cd Servidor-Eureka; .\mvnw.cmd spring-boot:run

# 2. Servicio01 (Gestión de Equipos)
cd Servicio01; .\mvnw.cmd spring-boot:run

# 3. Servicio02 (Registro de Partidos)
cd Servicio02; .\mvnw.cmd spring-boot:run

# 4. Servicio03 (Tabla de Posiciones y UI)
cd Servicio03; .\mvnw.cmd spring-boot:run

# 5. Pasarela-Gateway (API Gateway - Iniciar al final)
cd Pasarela-Gateway; .\mvnw.cmd spring-boot:run
```

---

## 📡 Catálogo de Endpoints (vía Gateway `:8080`)

### 🏆 Equipos (`Servicio01`)
* `GET /api/equipos` — Listar todos los clubes.
* `GET /api/equipos/{id}` — Consultar club por ID.
* `POST /api/equipos` — Registrar nuevo club (`{ "nombre": "...", "ciudad": "...", "estadio": "..." }`).
* `PUT /api/equipos/{id}` — Actualizar club existente.
* `DELETE /api/equipos/{id}` — Eliminar club.

### ⚽ Partidos (`Servicio02`)
* `GET /api/partidos` — Listar todos los partidos.
* `GET /api/partidos?jornada={num}` — Filtrar partidos por fecha/jornada.
* `GET /api/partidos/{id}` — Consultar partido por ID.
* `POST /api/partidos` — Registrar resultado (`{ "equipoLocal": "...", "equipoVisitante": "...", "golesLocal": 2, "golesVisitante": 1, "fecha": "2026-03-01", "jornada": 1 }`).
* `PUT /api/partidos/{id}` — Modificar resultado de partido.
* `DELETE /api/partidos/{id}` — Eliminar partido.

### 📊 Tabla de Posiciones y Estadísticas (`Servicio03`)
* `GET /api/tabla-posiciones` — Obtener la tabla clasificada (Puntos, DG, GF).
* `GET /api/partidos-resumen` — Resumen cronológico ordenado por jornada.

---

## 🛡️ Control de Tráfico Consecutivo (Rate Limiting)

Implementado en `Pasarela-Gateway` a través de [`ConsecutiveEndpointLimitFilter`](./Pasarela-Gateway/src/main/java/com/example/Pasarela_Gateway/ConsecutiveEndpointLimitFilter.java):
* **Regla:** Se permite un máximo de **2 peticiones consecutivas** hacia el mismo endpoint por cliente.
* **Bloqueo:** A la **3ra petición consecutiva** hacia el mismo endpoint, el Gateway rechaza la petición con código **`HTTP 429 Too Many Requests`**.
* **Desbloqueo:** Al cambiar a otro endpoint o tras 30 segundos de inactividad, el conteo se reinicia automáticamente.

---

## 🌐 Vistas Web en el Navegador

* **Portal Principal:** [http://localhost:8080/](http://localhost:8080/) o `/index.html`
* **Tabla de Posiciones:** [http://localhost:8080/tabla.html](http://localhost:8080/tabla.html)
* **Registro de Partidos:** [http://localhost:8080/registro.html](http://localhost:8080/registro.html)
* **Gestión de Equipos:** [http://localhost:8080/equipos.html](http://localhost:8080/equipos.html)
* **Dashboard:** [http://localhost:8080/dashboard.html](http://localhost:8080/dashboard.html)
* **Monitoreo Eureka:** [http://localhost:8760/](http://localhost:8760/)

---

## 📄 Documentación Técnica Completa

En la raíz del proyecto se incluyen los manuales formales detallados:
* 📕 **[`Documentacion_Sistema_Liga1.pdf`](./Documentacion_Sistema_Liga1.pdf)** (Versión PDF lista para imprimir/presentar).
* 📘 **[`Documentacion_Sistema_Liga1.docx`](./Documentacion_Sistema_Liga1.docx)** (Versión Word editable).
