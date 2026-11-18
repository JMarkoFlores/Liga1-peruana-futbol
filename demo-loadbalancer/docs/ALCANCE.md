# Liga 1: análisis y plan del taller LoadBalancer

Fecha: 17 de noviembre de 2026. Estado: planificación; funcionalidad aún no implementada.

## 1. Consigna y resultado esperado

La consigna de `Taller LoadBalancer.pdf` exige desarrollar una aplicación de microservicios que invoque Spring Cloud LoadBalancer y probar el balanceo con Postman. No exige expresamente Docker, Config Server, pruebas de rendimiento ni tolerancia a fallos.

Se propone integrar el taller en el sistema de fútbol existente: Postman envía solicitudes a una sola URL del Gateway; Spring Cloud LoadBalancer selecciona entre dos procesos reales de Servicio01 registrados en Eureka. Cada respuesta conserva el JSON de equipos e incluye una cabecera `X-Instancia` originada en el servicio.

El documento `Contexto_Liga1_LoadBalancer.pdf` es una propuesta previa. Se contrastó con los archivos locales, sin tomar sus pruebas pendientes como resultados obtenidos.

## 2. Estado local comprobado

| Elemento | Resultado de inspección |
| --- | --- |
| Carpeta | `C:\Users\Daniel\Downloads\Liga1-peruana-futbol` |
| Remoto | `https://github.com/JMarkoFlores/Liga1-peruana-futbol.git` |
| Rama al iniciar | `main` |
| Commit | `4722fa7e98f0c40bd581ff1ed13c8ff5f240501d` |
| Cambios al iniciar | Ninguno según `git status --short` |
| Comparación con PDF | Coincide el commit; no se hizo fetch, por lo que no se certifica que siga siendo el último remoto |
| Construcción | Cinco módulos Maven independientes; no hay POM agregador en la raíz |
| Docker / Postman | No hay Dockerfiles, Compose ni colección Postman entre los archivos versionados inspeccionados |
| Pruebas existentes | Un `contextLoads` por módulo; no prueban reparto, cabeceras ni el límite de tráfico |

## 3. Arquitectura existente

| Módulo | Puerto configurado | Responsabilidad | Cambio previsto |
| --- | --- | --- | --- |
| Servidor-Eureka | 8760 | Registro y descubrimiento | Dirección accesible desde contenedores |
| Pasarela-Gateway | 8080 | Gateway Server Web MVC y filtro de tráfico | LoadBalancer, ruta `lb://Servicio01`, configuración del filtro |
| Servicio01 | 8761 | CRUD de equipos | Identidad de réplica y cabecera; segundo proceso |
| Servicio02 | 8762 | Gestión de partidos | Configuración de entorno para ejecución completa en Docker |
| Servicio03 | 8763 | Tabla de posiciones, resumen y vistas | Configuración de entorno para ejecución completa en Docker |

Los cinco POM declaran Java 21, Spring Boot 4.1.1 y Spring Cloud BOM 2025.1.3. Los tres servicios de negocio utilizan JPA y MySQL, con variables `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` y esquema `sistema` por defecto.

`GET /api/equipos` devuelve `ResponseEntity<List<Equipo>>`, ordenado por nombre mediante el repositorio. Los campos de Equipo son `id`, `nombre`, `ciudad`, `estadio`. Mantener el contrato y las operaciones CRUD.

Servicio03 calcula la tabla consultando su repositorio de partidos; no se observó una llamada HTTP a Servicio01 en el servicio de cálculo revisado. Por ello no hace falta incorporar Feign o un cliente adicional para este taller.

## 4. Hallazgos y decisiones

### 4.1 Enrutamiento y dependencias

Todas las rutas del Gateway usan actualmente `http://localhost` y un puerto fijo. Eureka por sí solo no distribuye estas solicitudes. La ruta API de equipos se cambiará a `lb://Servicio01`, conservando el prefijo `/api/equipos` y sus subrutas. Se recomienda explicitar ambos patrones en la configuración y comprobar `/api/equipos` y `/api/equipos/{id}` en ejecución.

El POM del Gateway no declara explícitamente `spring-cloud-starter-loadbalancer`. Antes de concluir si falta en el classpath, obtener `dependency:tree`; después dejar la dependencia explícita sin versión propia, gestionada por el BOM. Mantener Gateway Web MVC y usar su integración `lb://`; no migrar a WebFlux ni añadir un RestClient global con `@LoadBalanced` para las rutas del Gateway.

La documentación oficial confirma compatibilidad de Cloud 2025.1.3 con Boot 4.1.x. No hay fundamento para cambiar versiones preventivamente; aún se requiere resolver dependencias, compilar y arrancar.

### 4.2 Filtro que interfiere con Postman

`ConsecutiveEndpointLimitFilter` se registra como componente y aplica a `/api/`. Guarda historial por IP, compara método y URI, permite dos solicitudes y devuelve 429 desde la tercera consecutiva. El historial se reinicia al cambiar de endpoint o tras más de 30 segundos sin peticiones. Los intentos bloqueados también actualizan la marca de tiempo.

Propuesta: añadir una propiedad de habilitación con valor predeterminado `true`; desactivarla únicamente en el perfil `taller-loadbalancer` del Gateway. Probar ambos modos. No esquivar el filtro alterando query strings, IP o endpoint entre peticiones de la serie principal.

### 4.3 Identidad y cabecera

Dos procesos deben compartir `spring.application.name=Servicio01`, pero tener identificadores Eureka diferentes, por ejemplo `Servicio01-A` y `Servicio01-B`. El host y puerto anunciados deben ser alcanzables desde el Gateway.

La cabecera `X-Instancia` se genera en Servicio01 usando una identidad estable de configuración por proceso, alineada con su registro Eureka. Evitar valores aleatorios por petición y cabeceras inventadas por el Gateway. Comprobar cada instancia directamente y luego ambas a través del Gateway. No modificar el arreglo JSON ni añadir un endpoint artificial como única prueba.

### 4.4 Datos de la demo

Crear MySQL y un volumen exclusivos de la demo. Ambas réplicas acceden al mismo esquema para ofrecer los mismos datos. Reutilizar el SQL existente como inicialización de un volumen nuevo y comprobar su correspondencia con las entidades. `INSERT IGNORE` no evita repetir partidos sin una restricción única aplicable.

Esperar a la inicialización efectiva de esquema y datos antes de iniciar las réplicas. En el perfil Docker se recomienda `ddl-auto=validate` una vez verificada la correspondencia; conservar la configuración habitual fuera de la demo. No ejecutar reseteos contra MySQL del equipo.

### 4.5 Docker y sistema completo

La entrega tendrá dos alcances de ejecución:

- **Mínimo:** MySQL, Eureka, dos instancias de Servicio01 y Gateway. Permite evaluar el balanceo; las vistas y rutas que dependen de Servicio02/03 no se consideran disponibles en este modo.
- **Completo:** añade Servicio02 y Servicio03 mediante un perfil de Compose, por ejemplo `sistema-completo`. Es la opción recomendada para presentar también el proyecto grupal.

En Docker, `localhost` no comunica contenedores distintos. Usar DNS interno para Eureka, MySQL y las rutas que aún apunten directamente a un servicio. Aplicar cambios de entorno a todas las rutas HTML, CSS, JS y raíz correspondientes al modo completo. Las vistas inspeccionadas usan `API_BASE='/api'`; conservar ese acceso por el Gateway.

Los healthchecks deben utilizar herramientas presentes en la imagen y comprobar disponibilidad útil. No confundir un puerto abierto con una aplicación lista ni un contenedor sano con dos instancias ya visibles para el cliente Eureka del Gateway. Añadir una espera acotada de registro y descubrimiento antes del Runner.

## 5. Puertos propuestos

Los puertos existentes se leyeron de configuración; no se certificó disponibilidad en ejecución. Verificar conflictos antes del arranque.

| Componente | Host propuesto | Puerto interno Docker |
| --- | --- | --- |
| Gateway | 8080 | 8080 |
| Eureka | 8760 | 8760 |
| Servicio01-A | 8761, útil para diagnóstico | 8761 |
| Servicio01-B | 8764, útil para diagnóstico | 8761 |
| Servicio02, modo completo | 8762 si se necesita acceso directo | 8762 |
| Servicio03, modo completo | 8763 si se necesita acceso directo | 8763 |
| MySQL exclusivo | Sin publicar, salvo necesidad justificada | 3306 |

Dos contenedores pueden usar 8761 internamente porque tienen direcciones distintas. Si se ejecutan dos JVM en el host, la segunda sí requiere otro `server.port`, como 8764.

## 6. Plan por etapas

| Etapa | Trabajo | Condición de cierre |
| --- | --- | --- |
| 0. Base ejecutable y rama | Revisar Git, entorno, Wrapper y árbol de dependencias; crear rama de actividad desde la base verificada | Herramientas y dependencias comprobadas, o bloqueo descrito con salida real |
| 1. Integración | Ruta balanceada, dependencia, identidad, cabecera y filtro configurable | Compilación y pruebas enfocadas de lo cambiado |
| 2. Ejecución reproducible | Dockerfiles, Compose, entorno y MySQL aislado; modos mínimo/completo | Construcción, arranque y dos registros Eureka alcanzables |
| 3. Postman | Colección, entorno y Runner de 12 solicitudes | 12 respuestas válidas y ambas réplicas observadas |
| 4. Auditoría y exposición | Verificar regresiones, repetibilidad, documentación y evidencias | Matriz de aceptación con resultados reales |
| 5. GitHub | Revisar diff, commit y push de la rama nueva | Rama remota y commit verificables; main permanece sin merge |

## 7. Criterios de aceptación

1. Dos instancias `UP` registradas bajo un mismo servicio y con IDs distintos.
2. Una única URL de prueba: `http://localhost:8080/api/equipos`, parametrizable mediante `baseUrl`.
3. Doce GET consecutivos en el modo de taller, todos HTTP 200, sin 429.
4. Respuestas con arreglo JSON y campos del contrato, con datos iniciales disponibles.
5. `X-Instancia` presente y atribuible a los procesos A/B; ambos aparecen en la serie.
6. No exigir primer destino, alternancia exacta ni distribución 6/6. Un reparto observado no certifica rendimiento bajo carga.
7. En el modo habitual, el filtro conserva su límite: dos llamadas válidas y la tercera 429, partiendo de historial limpio.
8. `/api/equipos/{id}` y las funciones originales verificadas conservan su contrato. Para probar CRUD usar registros temporales de la demo y limpiar después.
9. En modo completo, verificar partidos, tabla, resumen, raíz y recursos de las vistas; registrar exactamente qué se comprobó.
10. Reiniciar la colección no reutiliza conteos anteriores. Documentar arranque, espera, prueba, parada y repetición sin duplicar datos.
11. No incluir secretos, `.env`, compilados ni logs indiscriminados en Git; publicar sólo en la rama de la actividad.

La prueba de caída de una réplica es opcional. Si se realiza, describir tiempos de convergencia y posibles errores transitorios; no prometer recuperación instantánea.

## 8. Archivos previstos

- Cambios en el POM y configuración del Gateway; filtro configurable.
- Configuración y componente de cabecera en Servicio01.
- Configuraciones de Docker/perfil de los módulos necesarios, sin sobrescribir los valores locales habituales.
- Dockerfiles y `.dockerignore` donde corresponda según contexto de construcción.
- `demo-loadbalancer/compose.yaml`, `.env.example` y documentación de uso.
- `demo-loadbalancer/postman/` con colección y entorno sin secretos.
- `demo-loadbalancer/docs/ESTADO.md`, `PROMPTS.md` y `DEMOSTRACION.md`.
- `demo-loadbalancer/README.md` y enlace desde el README principal al finalizar.
- Evidencias pequeñas y pertinentes de Eureka y Postman; no crear capturas o resultados ficticios.

## 9. Fuentes técnicas consultadas

- Spring Cloud 2025.1.3, compatibilidad: https://spring.io/blog/2026/08/20/spring-cloud-2025-1-3-has-been-released/
- Gateway Server Web MVC y filtro LoadBalancer: https://docs.spring.io/spring-cloud-gateway/reference/spring-cloud-gateway-server-webmvc/filters/loadbalancer.html
- Spring Cloud LoadBalancer: https://docs.spring.io/spring-cloud-commons/reference/spring-cloud-commons/loadbalancer.html

La referencia web de Gateway consultada muestra 5.0.4; el BOM del proyecto gestiona la línea 5.0.3. Verificar el árbol y comportamiento de la versión efectivamente resuelta.
