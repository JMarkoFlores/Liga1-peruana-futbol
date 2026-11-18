# Postman: colección y prueba del reparto

Ejecutar desde la raíz del repositorio los comandos PowerShell de esta guía.
Importar [Liga1-LoadBalancer.postman_collection.json](./Liga1-LoadBalancer.postman_collection.json)
con sus variables de colección. [Liga1-Local.postman_environment.json](./Liga1-Local.postman_environment.json)
es opcional y sigue siendo compatible.
La colección sólo hace GET; no crea ni elimina registros.

## Resultado visual aportado por el usuario

El usuario ejecutó manualmente el Runner y entregó
[ETAPA4-POSTMAN-RESULTADO.png](../docs/evidencias/ETAPA4-POSTMAN-RESULTADO.png).
El agente revisó la imagen sin modificarla: colección Liga1, carpeta 02, petición
GET equipos - medir reparto, Source Runner, No Environment, misma URL del Gateway,
53 tests aprobados, cero fallos/errores, iteración 12 y agregado A=6/B=6.
La ejecución visual queda corroborada con esta procedencia; los intentos fallidos
del agente que se describen abajo son históricos.

**Discrepancia conservada:** el encabezado dice **Iterations: 1**, mientras aparecen
la iteración 12, todas las iteraciones contabilizadas y doce respuestas en el agregado.
No se determinó la causa ni se retocó la imagen. La configuración inicial y el delay
de 100 ms no son visibles; no hay captura separada de configuración ni de un segundo
New Run. No se declaran capturas inexistentes. La captura de resultado también
contiene los conteos; no es necesario inventar un archivo separado de conteos.
Procedencia, hash y límites en [reporte del usuario](../docs/ETAPA4-POSTMAN-USUARIO.json)
y estado de entrega en [ESTADO.md](../docs/ESTADO.md). Los pasos siguientes sirven
para reproducir la prueba y completar evidencia adicional de configuración/repetición.

## Preparación y descubrimiento

La demo debe estar iniciada según el [README de Docker](../README.md).
Antes del Runner, ejecutar **en el modo del taller**:

```powershell
./demo-loadbalancer/scripts/Test-Demo.ps1 -TimeoutSeconds 180
```

El verificador espera Eureka y realiza un calentamiento acotado hasta observar
ambas réplicas desde Gateway. Debe terminar con código 0. Comprobar también en
<http://localhost:8760/> que Servicio01-A y Servicio01-B figuren UP bajo Servicio01.
No iniciar el Runner si hay 503 o sólo aparece una réplica. El calentamiento
es independiente: no escribe contadores de Postman.

## Importar y ejecutar el Runner

1. En Postman Desktop, **Import** (menú File > Import o Ctrl+O), elegir el archivo
   de colección actualizado. Se llama **Liga1 - Taller LoadBalancer**. Si existe,
   actualizar/reemplazar únicamente esa colección; conservar las demás. Verificar
   que la importación termine correctamente: en **Variables** deben aparecer las
   cuatro filas siguientes y los scripts deben leer mediante `pm.variables.get`.
   No asumir que la versión anterior abierta ya contiene el cambio.
2. Seleccionar **No Environment** para evitar el panel Environments y revisar en
   **Variables** de la colección los valores activos/locales:

   | Variable | Valor |
   | --- | --- |
   | `baseUrl` | `http://localhost:8080` (sin barra final) |
   | `runMode` | `balanceo` |
   | `expectedInstanceA` | `Servicio01-A` |
   | `expectedInstanceB` | `Servicio01-B` |

   Opcionalmente seleccionar **Liga1 - Demo local**, importando el entorno entregado
   si la interfaz lo permite. Sus valores prevalecen sobre los de colección. Con
   No Environment, modificar la colección; con entorno activo, modificar el entorno.
   Los scripts usan `pm.variables.get` para resolver ambos casos; el contador
   `__liga1_balanceo` permanece local al run.

   Si cambió el puerto de Gateway, cambiar únicamente `baseUrl`. No cambiar la
   URL entre iteraciones ni añadir query strings, scripts para cambiar IP o datos CSV.
3. Expandir la colección, abrir el menú de la carpeta **02 - Serie de balanceo**
   y elegir **Run folder**. En las versiones que ofrecen Run en la colección,
   abrir el Runner y dejar seleccionada **únicamente** esa carpeta y su única
   solicitud **GET equipos - medir reparto**. Desmarcar lectura manual y filtro.
4. Comprobar que **Run order** muestre la solicitud y que **Start run** esté habilitado.
   Seleccionar ejecución **Functional / Local**, **No Environment** (o el entorno opcional),
   **Iterations = 12**, **Delay = 100 ms**, sin archivo de datos. Conservar las
   respuestas para poder inspeccionarlas. No activar una opción que aborte al
   primer fallo: interesa ver también el agregado de la última iteración.
5. Iniciar **Run Liga1 - Taller LoadBalancer** (el botón puede mostrar el nombre
   de la carpeta). Se envía siempre `GET {{baseUrl}}/api/equipos`.
6. Esperar **12 solicitudes, 12 HTTP 200, 53 aserciones aprobadas, cero fallos**.
   Cada respuesta valida arreglo no vacío, campos `id`, `nombre`, `ciudad`,
   `estadio` y `X-Instancia`. `id` es entero positivo; `nombre`, texto no vacío;
   `ciudad` y `estadio` admiten texto o null conforme al contrato existente.
7. En la **iteración 12**, revisar las cinco pruebas agregadas. La prueba
   **Ambas réplicas observadas: {...}** muestra los conteos. Deben aparecer A y B
   con al menos una respuesta cada una; no se exige alternancia, primera réplica
   concreta ni reparto 6/6. La consola incluye `RESUMEN_BALANCEO` con el detalle
   de las doce respuestas y sus posibles errores.
8. Usar **New Run** con la misma selección y configuración para repetir.
   La iteración 0 inicializa `__liga1_balanceo` mediante `pm.variables`, de alcance
   local al run. No se guardan contadores en entorno, colección ni globales.
   Cada ejecución nueva debe volver a mostrar doce respuestas, no veinticuatro.

Editar `runMode` en colección con No Environment, o en el entorno si está activo.
La lectura manual se usa aparte: `runMode=manual`, carpeta **01 - Lectura manual**,
solicitud **GET equipos - lectura**, botón **Send**. No usar Send sobre la solicitud
medida como prueba final: una ejecución de una iteración falla el mínimo de doce.
Volver a `runMode=balanceo` antes del Runner. Los modos distintos se omiten mediante
`pm.execution.skipRequest()`: ejecutar accidentalmente toda la colección en modo
balanceo tampoco añade lecturas manuales ni las tres llamadas del filtro.

## Histórico: bloqueo del Runner observado por el agente

**Estado del 17 de noviembre de 2026:** la alternativa sin entorno pasó el validador
(15 escenarios simulados) y Newman real. También pasó Newman con el entorno
entregado y una sobrescritura de baseUrl. Ambas series tuvieron 12 HTTP 200,
53 aserciones aprobadas, cero fallos y ambas identidades. El
[reporte nuevo](../docs/ETAPA4-VISUAL.json) conserva sus horas y URLs.
**Newman no acredita el Runner visual.**

En Postman Desktop 12.34.1, Environments sigue mostrando
**Panel content couldn't load.** Se intentó importar la colección actualizada y
actualizar sólo Liga1 mediante Replace. El panel de importación mostró
**2 of 3 elements, 2 failed**, con las dos entradas de colección Liga1 fallidas.
No se confirmó la actualización: Variables continuó sin las cuatro filas.
Run desde la carpeta y desde la colección, y arrastrar carpeta/colección, dejaron
**Run order vacío y Start run deshabilitado**. La causa interna no se determinó.
No se ejecutó el Runner ni se generaron capturas de éxito o conteos visuales.
No se borraron configuraciones, cerraron sesiones ni reinstaló Postman.

Capturas reales de este intento (documentan bloqueo):

- [Runner vacío y Start run deshabilitado](../docs/evidencias/ETAPA4-VISUAL-RUNNER-BLOQUEADO.png).
- [Importación fallida y panel Environments](../docs/evidencias/ETAPA4-VISUAL-IMPORTACION-FALLIDA.png).

El informe del usuario sobre pruebas satisfactorias tiene procedencia distinta;
sigue pendiente precisar si fueron Send o Runner de doce iteraciones y verificar
sus capturas. Los reportes históricos, incluido
[ETAPA3-NEWMAN.json](../docs/ETAPA3-NEWMAN.json), se conservan sin reinterpretarlos.
No usar resultados de otras colecciones abiertas como evidencia.

## Cierre manual pendiente tras el nuevo bloqueo

**Sección histórica:** el usuario completó después el Runner y aportó la captura
de resultado revisada arriba. Este procedimiento se conserva para reproducción
y para las capturas adicionales; ya no significa que falte ejecutar el run principal.

**Primer paso que falta:** completar en la interfaz la actualización de
**Liga1 - Taller LoadBalancer** con el JSON entregado, verificar sus cuatro
variables y conseguir que **Run folder** sobre **02 - Serie de balanceo** cargue
**GET equipos - medir reparto** en **Run order**, con **Start run habilitado**.
La alternativa de variables está comprobada por scripts/Newman; todavía no se
pudo completar este paso en la UI. No necesita importar ni crear un entorno.
Si persiste la importación fallida o Run order vacío, conservar el bloqueo abierto;
no borrar datos/configuraciones ni cerrar sesión como parte de este procedimiento.

Después de ese paso, completar exactamente:

1. Comprobar A/B UP en Eureka y demo en modo taller; ver preparación anterior.
2. Elegir **No Environment**; revisar las cuatro variables de colección de la tabla.
   Seleccionar sólo carpeta 02 y su única solicitud; excluir 01/03.
3. Configurar **Functional / Local**, **Iterations = 12**, marcar **Add a delay**
   con **100 ms**, **Iteration data = None**, conservar respuestas y desmarcar
   **Stop run if an error occurs**. Guardar captura real de selección y configuración:
   nombre propuesto **ETAPA4-POSTMAN-CONFIGURACION.png**.
4. Iniciar **Start run**. Esperar doce solicitudes a la misma URL
   **http://localhost:8080/api/equipos**, doce HTTP 200, 53 aserciones aprobadas,
   cero fallos/errores/429. Guardar **ETAPA4-POSTMAN-RESULTADO.png**.
5. Abrir la **iteración 12** y el test **Ambas réplicas observadas: {...}**, o la
   consola con **RESUMEN_BALANCEO** expandido: total doce, cero errores y A/B
   con al menos una respuesta cada una. Guardar **ETAPA4-POSTMAN-CONTEOS.png**.
   Si la URL/cabeceras no se ven, añadir Headers de dos respuestas del mismo run,
   una con Servicio01-A y otra con Servicio01-B. No exigir 6/6 ni orden.
6. Usar **New Run** para comprobar que el total vuelve a doce; guardar evidencia
   adicional del reinicio. Registrar fecha, persona, selección y capturas en el estado.

Al redactar estos pasos faltaban las tres capturas. Ahora existe
**ETAPA4-POSTMAN-RESULTADO.png**, aportada por el usuario, con resultado y conteos.
La configuración inicial y un segundo New Run visual siguen sin captura separada;
son límites documentales registrados en el estado. La reparación de acentos sigue
cerrada. El usuario autorizó expresamente continuar con Prompt 5.

## Filtro habitual: prueba separada y restauración

Esta prueba recrea **sólo Gateway**, con historial limpio y sin perfil del taller.
Los datos y los demás contenedores siguen disponibles. No ejecutar simultáneamente
otra prueba de API. El healthcheck de Gateway consulta HTML y no consume este límite.

```powershell
docker compose --env-file demo-loadbalancer/.env -f demo-loadbalancer/compose.yaml -f demo-loadbalancer/compose.filtro.yaml up -d --no-deps --force-recreate --wait --wait-timeout 120 gateway
```

Esperar unos 40 segundos para que su cliente Eureka actualice el registro. En este
modo **no** ejecutar el calentamiento ni GET manuales a `/api/equipos` antes del run,
pues alterarían el historial limpio. Cambiar en Postman `runMode=filtro` y ejecutar
**sólo** la carpeta **03 - Filtro habitual (aislado)**, con sus tres solicitudes en
orden, **Iterations=1**, **Delay=100 ms**, el mismo entorno, sin archivo de datos.
Cambiar `runMode` en colección si se usa No Environment, o en el entorno activo.
Las tres usan exactamente la misma URL. Esperar **200, 200, 429**, diez aserciones
aprobadas y `RESUMEN_FILTRO` en consola. El 429 lo genera Gateway y puede carecer de
`X-Instancia`; se valida su JSON y límite 2. Conservar captura separada de esta prueba.
Para repetirla, recrear de nuevo Gateway antes de las tres llamadas.

Restaurar siempre, incluso si falla la prueba:

```powershell
docker compose --env-file demo-loadbalancer/.env -f demo-loadbalancer/compose.yaml up -d --no-deps --force-recreate --wait --wait-timeout 120 gateway
./demo-loadbalancer/scripts/Test-Demo.ps1 -TimeoutSeconds 180
```

Volver a `runMode=balanceo` en Postman. El comando base restaura
`docker,taller-loadbalancer`; el override no modifica el Compose base.

## Newman: comprobación complementaria reproducible

Requiere Node/npm; se verificaron Node 24.15.0 y Newman 6.2.3. Los comandos no
crean dependencias npm dentro del repositorio. No usar `--bail`, para permitir el
agregado final aunque falle una respuesta. Guardar reportes completos fuera del
repositorio si se necesitan; se entrega un resumen pequeño sin credenciales.

Sin entorno, usando los valores de colección:

```powershell
npm.cmd exec --yes --package=newman@6.2.3 -- newman run demo-loadbalancer/postman/Liga1-LoadBalancer.postman_collection.json --folder "02 - Serie de balanceo" -n 12 --delay-request 100 --timeout-request 5000 --timeout-script 5000
```

Con el entorno entregado (compatible):

```powershell
npm.cmd exec --yes --package=newman@6.2.3 -- newman run demo-loadbalancer/postman/Liga1-LoadBalancer.postman_collection.json -e demo-loadbalancer/postman/Liga1-Local.postman_environment.json --folder "02 - Serie de balanceo" -n 12 --delay-request 100 --timeout-request 5000 --timeout-script 5000
```

Para el filtro, tras recrear Gateway con el override y sin llamadas intermedias:

```powershell
npm.cmd exec --yes --package=newman@6.2.3 -- newman run demo-loadbalancer/postman/Liga1-LoadBalancer.postman_collection.json -e demo-loadbalancer/postman/Liga1-Local.postman_environment.json --env-var runMode=filtro --folder "03 - Filtro habitual (aislado)" -n 1 --delay-request 100 --timeout-request 5000 --timeout-script 5000
```

Restaurar después con los comandos anteriores. El argumento `--env-var` sólo
sobrescribe esa ejecución: el archivo de entorno sigue entregándose en balanceo.

Validación adicional, sin servidor ni paquetes externos:

```powershell
node demo-loadbalancer/postman/Validate-Postman.cjs
```

Comprueba estructura y scripts y ejecuta quince escenarios **simulados**, incluidos valores de colección sin entorno
y prioridad de un entorno activo sobre la colección. Casos del agregado:
reparto desigual 11/1 aceptado, reinicio de conteos, última respuesta errónea,
JSON inválido, cabecera ausente/desconocida, tipos/campos inválidos y errores
anteriores. Estos escenarios prueban el verificador; no son respuestas reales de
la aplicación ni sustituyen la prueba HTTP. La colección también se validó contra
el [esquema oficial v2.1](https://schema.getpostman.com/json/collection/v2.1.0/collection.json).

Referencias: [Runner](https://learning.postman.com/docs/collections/running-collections/intro-to-collection-runs/),
[variables locales](https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-variables/)
y [Newman](https://learning.postman.com/docs/collections/using-newman-cli/command-line-integration-with-newman/).
