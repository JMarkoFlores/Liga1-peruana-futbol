# Demo Spring Cloud LoadBalancer

Dos procesos reales de Servicio01 comparten MySQL, se registran en Eureka y
responden a través de `http://localhost:8080/api/equipos`. Cada respuesta incluye
`X-Instancia`, generado por Servicio01 a partir de su ID Eureka.
Los resultados de ejecución se mantienen en [ESTADO.md](./docs/ESTADO.md).
La [guía de demostración](./docs/DEMOSTRACION.md) reúne el guion, Runner, regresión,
persistencia, capturas reales y pendientes de la auditoría de etapa 4.

## Requisitos y aislamiento

- Docker Desktop con Engine Linux y Compose; acceso a Docker Hub, Maven Central
  y repositorios Alpine durante la construcción inicial. Todas las imágenes Java
  se construyen con JDK 21 y ejecutan con JRE 21.
- Aproximadamente 4 GB disponibles para el modo completo, además de espacio para
  imágenes y caché Maven. Cada servicio tiene límite de 512 MB.
- Puertos del host 8080, 8760, 8761 y 8764 libres. Cambiarlos en el `.env` de esta
  demo si es necesario; los puertos internos permanecen iguales.
- Ejecutar los siguientes comandos PowerShell **desde la raíz del repositorio**.

Compose usa el proyecto `liga1-loadbalancer-demo`, su red
`liga1-loadbalancer-demo_demo` y el volumen
`liga1-loadbalancer-demo_mysql-data`. MySQL **no publica puertos** del host.
Las publicaciones HTTP están limitadas a 127.0.0.1. No se usa MySQL de Windows
ni se montan datos de otros proyectos. Las contraseñas son exclusivas de la demo.

## Preparar variables y construir

Generar el archivo ignorado `.env` con contraseñas aleatorias, sin mostrarlas:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File demo-loadbalancer/scripts/New-DemoEnv.ps1
```

El script conserva un `.env` existente y se niega a sobrescribirlo. Como alternativa,
copiar [.env.example](./.env.example) y sustituir sus dos valores de ejemplo.
No regenerar claves de un volumen ya inicializado: las variables de MySQL sólo se
aplican al crearlo por primera vez. No compartir ni versionar `.env`.

Validar sin imprimir las variables resueltas y construir los cinco módulos:

```powershell
docker compose --env-file demo-loadbalancer/.env -f demo-loadbalancer/compose.yaml --profile sistema-completo config --quiet
docker compose --env-file demo-loadbalancer/.env -f demo-loadbalancer/compose.yaml --profile sistema-completo build --parallel
```

El [Dockerfile compartido](./Dockerfile) usa el Wrapper de cada módulo. Servicio01
produce `target/demo-0.0.1-SNAPSHOT.jar`; los otros JAR conservan sus nombres.
Los builds ejecutan `package -DskipTests`: compilan tests, pero no los ejecutan.
Las imágenes de ejecución contienen JRE, aplicación y `curl`, sin Maven, y usan
un usuario sin privilegios. [.dockerignore](../.dockerignore) limita el contexto a
fuentes/POM/Wrapper, excluyendo `.env`, logs, compilados y documentos.

## Modo mínimo

Incluye MySQL, Eureka, Servicio01-A, Servicio01-B y Gateway:

```powershell
docker compose --env-file demo-loadbalancer/.env -f demo-loadbalancer/compose.yaml up -d --wait --wait-timeout 240
powershell -NoProfile -ExecutionPolicy Bypass -File demo-loadbalancer/scripts/Test-Demo.ps1 -TimeoutSeconds 180
```

En este modo se comprueban equipos y su vista. Partidos, tabla, resumen, portal
y vistas de Servicio02/03 necesitan el modo completo y no están disponibles aquí.

## Modo sistema completo

Añade Servicio02 y Servicio03. Puede activarse sobre el modo mínimo:

```powershell
docker compose --env-file demo-loadbalancer/.env -f demo-loadbalancer/compose.yaml --profile sistema-completo up -d --wait --wait-timeout 240
powershell -NoProfile -ExecutionPolicy Bypass -File demo-loadbalancer/scripts/Test-Demo.ps1 -FullSystem -TimeoutSeconds 180
```

El script comprueba, además, partidos, tabla, resumen, `/`, todas las vistas
originales y los recursos CSS/JS propios a través del Gateway. Las vistas conservan
su `API_BASE` relativo. Algunas usan Tailwind desde una CDN externa: comprobar HTTP
de las páginas no acredita su apariencia ni disponibilidad de esa CDN en navegador.

## Salud, descubrimiento y datos

```powershell
docker compose --env-file demo-loadbalancer/.env -f demo-loadbalancer/compose.yaml --profile sistema-completo ps
```

MySQL inicializa un **volumen nuevo** ejecutando el [SQL original](../Servicio01/script_sistema_bd.sql)
y, al terminar, una marca de inicialización de la demo. Su healthcheck utiliza
TCP y comprueba la marca y la presencia de equipos/partidos. Las JVM de negocio
esperan a MySQL sano y ejecutan `ddl-auto=validate`, sin crear tablas en paralelo.
El SQL inicial no se vuelve a ejecutar al reiniciar un volumen existente, lo que
evita duplicar partidos: `INSERT IGNORE` por sí solo no garantiza esa propiedad.

MySQL recibe `LANG=C.UTF-8`: su cliente usa charset automático y debe interpretar
el SQL original como UTF-8. La auditoría verificó una inicialización nueva en un
contenedor temporal aislado, con acentos correctos. El volumen creado en la etapa 2
contenía algunos acentos mal almacenados; esta configuración no transforma datos
existentes. Al cerrar la etapa 4 se repararon **sólo ocho campos identificados**,
con [respaldo previo](./docs/ETAPA4-ACENTOS-RESPALDO.json) y
[verificación SQL/API](./docs/ETAPA4-ACENTOS-REPARACION.json). Se conservaron IDs,
demás campos, 16 equipos y 15 partidos, sin borrar ni reinicializar el volumen.
El usuario aportó [evidencia visual real del Runner](./docs/evidencias/ETAPA4-POSTMAN-RESULTADO.png):
53 tests aprobados, cero fallos/errores, iteración 12 y A=6/B=6. Se conserva la
discrepancia del encabezado **Iterations: 1**, sin atribuirle causa ni retocar la
captura. La configuración inicial/delay no es visible; ver
[procedencia y límites](./docs/ETAPA4-POSTMAN-USUARIO.json).
La colección permite **No Environment** mediante cuatro variables y conserva
compatibilidad con el entorno entregado. Validador y Newman pasaron. Los bloqueos
anteriores del agente son históricos; el usuario autorizó continuar con Prompt 5.
El [estado de entrega](./docs/ESTADO.md) y la [guía Postman](./postman/README.md)
distinguen evidencia recibida, reproducción y capturas adicionales no disponibles.

Los healthchecks Java usan `curl` incluido en la imagen: Eureka consulta su API;
Servicio01/02/03 consultan APIs con acceso a datos; Gateway comprueba el proxy de
la vista de equipos sin consumir el historial `/api/` del filtro.
No se añadió Actuator ni se expusieron endpoints de administración adicionales.

`healthy` no acredita que ambas réplicas ya sean visibles para el cliente del
Gateway. [Test-Demo.ps1](./scripts/Test-Demo.ps1) espera de forma acotada dos IDs
`UP` en Eureka, verifica los nombres internos y realiza calentamiento hasta observar
ambos a través del Gateway. Luego inicia una serie **nueva** de doce GET idénticos,
exige HTTP 200 y ambas identidades sin imponer orden o reparto exacto, comprueba
el JSON compartido y una ruta por ID. Se detiene con error si no cumple el plazo.
No sustituye la ejecución del Runner de Postman. La colección y el entorno de la
etapa 3 están en [postman/](./postman/README.md), con selección exacta del Runner,
prueba separada del filtro y pasos para las capturas pendientes.

Diagnóstico directo, desde el host con puertos predeterminados:

```powershell
Invoke-WebRequest http://localhost:8761/api/equipos -UseBasicParsing
Invoke-WebRequest http://localhost:8764/api/equipos -UseBasicParsing
Invoke-WebRequest http://localhost:8080/api/equipos -UseBasicParsing
```

Esperar `X-Instancia: Servicio01-A/B`; Eureka está en <http://localhost:8760/>.
Dentro de la red ambas réplicas escuchan en 8761 y anuncian `servicio01-a` o
`servicio01-b`. Se activa **sólo** el perfil `docker` en ellas, nunca los perfiles
locales `taller-replica-a/b` que anuncian 127.0.0.1. Gateway activa
`docker,taller-loadbalancer`. Los perfiles Docker sustituyen las rutas fijas por
DNS interno, incluidas HTML, raíz, CSS y JS, sin alterar la configuración local.

Para diagnosticar errores sin imprimir variables de entorno:

```powershell
docker compose --env-file demo-loadbalancer/.env -f demo-loadbalancer/compose.yaml --profile sistema-completo logs --tail 60 eureka servicio01-a servicio01-b gateway
```

Un 503 puede indicar descubrimiento pendiente o un registro inaccesible. Un 429
obliga a revisar el perfil de taller. Si MySQL no está sano, revisar su log y la
inicialización antes de iniciar JVM manualmente. No borrar volúmenes como primer
intento de solución ni mostrar `compose config` completo, que incluye claves.

## Detener y repetir conservando los datos

La auditoría comprobó parada completa y nuevo arranque mínimo/completo: 16 equipos,
15 partidos, cero duplicados y hashes idénticos. Para reproducir el CRUD temporal
y la comparación de persistencia, consultar la
[guía de regresión](./docs/DEMOSTRACION.md#regresión-y-persistencia-reproducibles).
Al volver de completo a sólo mínimo, usar primero este `down`: quitar el perfil en
un `up` no elimina automáticamente Servicio02/03 si ya estaban ejecutándose.

```powershell
docker compose --env-file demo-loadbalancer/.env -f demo-loadbalancer/compose.yaml --profile sistema-completo down
```

Este comando elimina únicamente contenedores/red del proyecto de demo y conserva
su volumen. Para repetir, usar nuevamente el `up` del modo deseado y `Test-Demo.ps1`;
no ejecutar el SQL a mano. No usar `down -v` ni comandos globales de limpieza.

Si se desea explícitamente empezar con datos nuevos, **después de detener la demo**,
este comando opcional elimina únicamente su volumen y pierde sus datos:

```powershell
# OPCIONAL Y DESTRUCTIVO: sólo para reinicializar esta demo.
docker volume rm liga1-loadbalancer-demo_mysql-data
```

No se ejecuta automáticamente. Mantener el `.env` para que el próximo volumen
se cree con las mismas credenciales. Para JVM locales, ver [ARRANQUE-LOCAL.md](./docs/ARRANQUE-LOCAL.md).

Referencias: [orden de arranque y service_healthy](https://docs.docker.com/compose/how-tos/startup-order/),
[inicialización de la imagen MySQL](https://hub.docker.com/_/mysql) e
[imágenes Eclipse Temurin](https://hub.docker.com/_/eclipse-temurin).
