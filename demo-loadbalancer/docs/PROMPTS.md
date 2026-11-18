# Prompts por etapas para Antigravity

Ejecutar un prompt por vez. Revisar su diff y evidencia antes del siguiente. El análisis inicial está en `ALCANCE.md`; volver a comprobar el estado local antes de actuar porque puede haber cambiado.

## Reglas comunes: pegar al comenzar la sesión

```text
Trabajamos sobre Liga1-peruana-futbol para el taller Spring Cloud LoadBalancer.
Lee las instrucciones del workspace y demo-loadbalancer/docs/ALCANCE.md y ESTADO.md.
Conserva cambios ajenos. Trabaja por etapas; no hagas refactorizaciones generales.
Mantén Gateway Server Web MVC, contratos CRUD y reglas de negocio.
Usa el Wrapper de cada módulo: no hay POM agregador raíz.
No cambies versiones por intuición ni desactives el verificador de compatibilidad.
No imprimas credenciales ni incluyas secretos, .env, target o logs en el commit.
No resetees ni borres bases o volúmenes ajenos. Usa recursos exclusivos de demo.
No fabriques salidas, capturas o resultados. Distingue lo inspeccionado de lo ejecutado.
Al terminar cada etapa informa archivos, comandos/resultados, pendientes y actualiza ESTADO.md.
Ejecuta sólo la etapa solicitada; la publicación pertenece a la etapa final.
```

## Prompt 0: entorno, dependencias y rama

```text
Realiza la etapa 0. Lee los documentos del taller y comprueba git status, rama,
commit, remoto y ramas existentes. La inspección inicial partía de main en
4722fa7e98f0c40bd581ff1ed13c8ff5f240501d, sin cambios; no asumas que sigue igual.
Comprueba origin/main mediante fetch si la conectividad lo permite. No hagas reset,
merge o rebase de cambios ajenos. Crea taller-loadbalancer desde la base main
verificada si no existe; si ya existe, inspecciónala antes de reutilizarla.
Conserva los tres documentos nuevos de planificación en la rama de la actividad.

Comprueba JDK, JAVA_HOME, Docker daemon y Maven Wrapper. Se encontró un JDK 25
ejecutable por ruta explícita, pero los POM apuntan a Java 21. Prefiere JDK 21 para
reproducibilidad; si usas otro, explica y prueba su compatibilidad real. No alteres
la configuración global del equipo para resolver una invocación local.
En esta revisión dependency:tree falló primero al abrir un lock de .m2 y luego,
usando un repositorio temporal propio, por Unknown host repo.maven.apache.org.
Comprueba esos bloqueos; no los interpretes como incompatibilidad del proyecto.
Ejecuta mvnw.cmd -version y dependency:tree en Pasarela-Gateway, filtrando las
dependencias Spring Cloud, y package con -DskipTests en los cinco módulos para
separar compilación de pruebas dependientes de MySQL. Después ejecutaremos las
pruebas que correspondan; no presentes -DskipTests como tests aprobados.

Los POM declaran Boot 4.1.1 / Cloud 2025.1.3 y la fuente oficial confirma su línea
compatible. Verifica descarga y resolución efectivas antes de proponer cambios.
Determina si LoadBalancer llega transitivamente. Inspecciona los tests existentes
para identificar cuáles requieren BD o Eureka. Usa tiempos acotados para comandos;
si fallan por red/herramientas, registra el bloqueo y la salida, sin declarar éxito.
Actualiza ESTADO.md con herramientas, árbol y compilaciones reales. No implementes
todavía rutas, cabeceras ni Docker. Detente al entregar el reporte de esta etapa.
```

## Prompt 1: balanceo e identificación de réplicas

```text
Realiza la etapa 1 sobre la rama del taller y la base validada en la etapa 0.
Declara explícitamente spring-cloud-starter-loadbalancer en el Gateway, sin versión
propia, gestionada por el BOM. Configura la API de equipos con lb://Servicio01 y
cobertura de /api/equipos y /api/equipos/**. Usa la integración de Gateway Web MVC;
no añadas un RestClient global con @LoadBalanced para el proxy.

En Servicio01 añade X-Instancia, generado desde una identidad estable y configurable
del proceso. Mantén JSON y códigos de respuesta. Alinea esa identidad con el registro
Eureka. Prepara dos arranques con el mismo spring.application.name=Servicio01 y
distintos instance-id; si son JVM locales deben tener puertos diferentes.

Haz configurable ConsecutiveEndpointLimitFilter, habilitado por defecto y desactivado
únicamente en el perfil taller-loadbalancer. Conserva límite, alcance y reinicios
actuales cuando está habilitado. No alteres query strings ni IP para evitar el filtro.

Añade pruebas enfocadas del filtro: primeras dos llamadas admitidas, tercera 429,
cambio de endpoint y modo deshabilitado. Comprueba cabecera estable sin modificar
el cuerpo. Evita tests que sólo repliquen propiedades escritas. Compila y ejecuta
las pruebas posibles, indicando cuáles necesitan infraestructura. Verifica las rutas
afectadas en ejecución si el entorno está disponible. Documenta cualquier pendiente.
Actualiza ESTADO.md y detente antes del despliegue Docker.
```

## Prompt 2: Docker y datos reproducibles

```text
Realiza la etapa 2. Implementa demo-loadbalancer/compose.yaml, .env.example sin
secretos reales, Dockerfiles y .dockerignore necesarios. Usa Java 21 en las imágenes
y empaquetados reales de los módulos. El modo mínimo debe levantar MySQL exclusivo,
Eureka, Servicio01-A, Servicio01-B y Gateway. Añade Servicio02 y Servicio03 como modo
opcional sistema-completo mediante perfil Compose; documenta sus límites.

Ambas réplicas usan el mismo nombre Servicio01 e IDs distintos y direcciones Eureka
alcanzables. Pueden escuchar 8761 dentro de contenedores diferentes; publica A en
8761 y B en 8764 sólo para diagnóstico. Gateway 8080 y Eureka 8760 parametrizables
si hay conflictos. MySQL no necesita puerto del host.

Usa DNS de Docker para Eureka, BD y rutas directas. En el modo completo adapta
todas las rutas de Servicio02/03 y HTML, CSS, JS y raíz; conserva API_BASE relativo.
Aplica configuración de demo sin romper los valores de ejecución local habitual.
Activa taller-loadbalancer en el Gateway para la serie de peticiones.

Usa red y volumen propios de esta demo. Reutiliza el SQL existente con inicialización
controlada de un volumen nuevo. Evita duplicar partidos al reiniciar. Espera esquema
y datos antes de las JVM; evita DDL concurrente, usando validate en demo si coincide
el esquema. No toques MySQL local ni volúmenes ajenos. Documenta parada conservando
datos y separa cualquier comando opcional que elimine sólo el volumen de demo.

Añade healthchecks que funcionen con herramientas presentes en las imágenes. Si
incorporas Actuator, justifica su uso y limita los endpoints expuestos. Verifica
docker compose config sin exponer secretos, build, arranque, datos y salud. Espera
de forma acotada a que el Gateway descubra ambas instancias; consulta Eureka y
prueba X-Instancia directamente en A/B y por Gateway. Registra el resultado real.
Documenta comandos PowerShell desde la raíz en demo-loadbalancer/README.md.
Actualiza ESTADO.md y detente.
```

## Prompt 3: colección Postman y prueba del reparto

```text
Realiza la etapa 3. Crea una colección Postman importable y un entorno sin secretos
en demo-loadbalancer/postman/. Usa baseUrl=http://localhost:8080 como variable;
la prueba principal llama siempre GET {{baseUrl}}/api/equipos.

Separa lectura manual, serie de balanceo y regresiones para que ejecutar toda la
colección no altere los conteos por accidente. En la serie incluye una solicitud
repetida por Runner durante al menos 12 iteraciones, con instrucciones exactas de
carpeta, selección, iteraciones y delay. Inicializa el conteo sólo al inicio de cada
run, usando variables del run y evitando valores persistidos de ejecuciones previas.
Si usas pm.info.iteration/iterationCount, verifica que el último paso agregue y
evalúe resultados también cuando alguna respuesta sea errónea o falte cabecera.

En cada respuesta valida HTTP 200, arreglo JSON con datos y campos id, nombre,
ciudad y estadio con tipos coherentes, y X-Instancia no vacía. Cuenta las respuestas
por réplica; al final exige ambas identidades esperadas y cero errores/429. No
exijas orden A-B, primera réplica fija ni reparto exacto 6/6. Las respuestas sin
cabecera o con JSON inválido deben fallar, no desaparecer del informe agregado.

Documenta la espera previa del descubrimiento y muestra cómo repetir el run con
contadores limpios. Añade prueba separada del filtro habitual: con historial limpio,
primeras dos llamadas válidas y tercera 429; luego restaura el modo del taller.
Usa BD de demo para cualquier CRUD y limpia sólo sus registros temporales.

Valida estructura JSON y ejecuta la colección cuando sea posible. Una ejecución
Newman puede complementar, pero distingue esa salida de la prueba en Postman que
pide el docente. Si la UI de Postman no está disponible, deja sus pasos y evidencia
pendientes con claridad. Actualiza ESTADO.md y detente.
```

## Prompt 4: auditoría, regresión y demostración

```text
Realiza la etapa 4. Contrasta el diff y resultados con ALCANCE.md y la consigna.
Corrige defectos dentro del alcance y repite las comprobaciones afectadas.
Comprueba arranque reproducible, dos instancias UP bajo Servicio01, acceso por
única URL del Gateway, origen de X-Instancia y serie de 12 respuestas válidas con
ambas réplicas. Verifica filtro habitual y perfil de taller por separado.

Prueba /api/equipos y /api/equipos/{id}, CRUD con datos temporales y modo completo:
partidos, tabla, resumen, raíz, vistas y sus recursos. Informa exactamente qué se
ejecutó. Comprueba que detener y reiniciar la demo no duplique los partidos.
No atribuyas a balanceo de carga una garantía de rendimiento ni recuperación
instantánea. La prueba de caída es opcional y requiere explicar convergencia.

Completa README de la demo y docs/DEMOSTRACION.md con prerrequisitos, comandos
PowerShell desde raíz, arranque mínimo/completo, espera, Runner, interpretación,
detención, repetición y solución de problemas 429/503/BD/Eureka. Añade enlace desde
README principal. Usa capturas y reportes reales de Eureka y Postman; si no se
pudieron obtener, anótalo. Prepara un guion breve para exponer quién registra,
quién selecciona la réplica y cómo se observa el resultado.

Actualiza ESTADO.md con una matriz final de criterios y evidencia. Revisa secretos,
archivos generados y cambios ajenos. No publiques todavía. Entrega diff resumido,
resultados y pendientes para auditoría; detente.
```

## Prompt 5: publicar en una rama nueva de GitHub

```text
Realiza la etapa final de publicación ya solicitada para esta actividad. Lee el
estado final y comprueba que las etapas requeridas están verificadas. Si falta una
evidencia obligatoria o hay un bloqueo, resuélvelo dentro del alcance o informa el
pendiente; no declares la actividad terminada ni ocultes fallos.

Comprueba rama, remoto, git status y diff completo. Trabaja en taller-loadbalancer,
nunca hagas commit en main. Verifica si la rama ya existe en el remoto; no la
sobrescribas con force push. Si contiene trabajo ajeno, inspecciona y conserva ese
trabajo; usa otro nombre inequívoco si es necesario.

Incluye sólo archivos de la actividad tras revisar cada uno; evita git add . si hay
cambios no relacionados. Excluye credenciales, .env, target, logs y archivos locales.
Crea un commit descriptivo y ejecuta git push -u origin taller-loadbalancer, o el
nombre seguro finalmente utilizado. Verifica el SHA remoto y proporciona la URL
de la rama y del commit. No hagas merge en main. Abrir PR sólo si se pide después.
Si el push falla por credenciales o permisos, conserva el commit local y comunica
el error sin exponer tokens ni afirmar que se publicó.
Actualiza el estado de entrega antes del commit; reporta SHA y enlace al terminar.
```

## Cómo revisar cada reporte

- Pedir evidencia concreta cuando sólo diga «funciona»: comando, salida relevante, test o captura real.
- Un `BUILD SUCCESS` con tests omitidos acredita construcción, no la serie Postman.
- Dos contenedores arrancados no acreditan dos registros descubribles ni balanceo.
- Doce 200 sin identidad de réplica no acreditan reparto.
- Un JSON de colección generado no acredita ejecución del Runner.
- Un commit local no acredita push ni existencia de la rama remota.
