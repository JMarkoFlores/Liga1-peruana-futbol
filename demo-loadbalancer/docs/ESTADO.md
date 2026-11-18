# Estado del taller LoadBalancer

Actualizado: 17 de noviembre de 2026.

## Resultado vigente: evidencia del usuario y entrega para Prompt 5

El **17 de noviembre de 2026** el usuario confirmó que ejecutó manualmente el
Runner y aportó [ETAPA4-POSTMAN-RESULTADO.png](./evidencias/ETAPA4-POSTMAN-RESULTADO.png).
El agente abrió y revisó esa captura; **no operó ni ejecutó ese run**.
Se conserva la imagen original sin modificaciones y con SHA-256
**c322cd0aeb540b1a84196cfa0a87bf07fab320c0667e662eaa6bc52876b2b393**. Metadatos y límites de la evidencia en
[ETAPA4-POSTMAN-USUARIO.json](./ETAPA4-POSTMAN-USUARIO.json).

### Resultado visual corroborado y discrepancia conservada

La captura corresponde a **Liga1 - Taller LoadBalancer**, carpeta **02 - Serie de
balanceo**, solicitud **GET equipos - medir reparto**, Source **Runner**, entorno
**none / No Environment**, URL **http://localhost:8080/api/equipos**. Muestra:

- **All 53, Passed 53, Failed 0, Skipped 0, Errors 0**.
- Iteraciones **10, 11 y 12** visibles, con HTTP **200** y pruebas de contrato JSON,
  X-Instancia y ausencia de 429 aprobadas.
- En la iteración 12, pruebas agregadas aprobadas: Runner configurado con al menos
  12 iteraciones, todas las iteraciones contabilizadas, cero respuestas inválidas
  y cero 429; **Servicio01-A=6 y Servicio01-B=6** (doce respuestas contabilizadas).

**Discrepancia:** el encabezado muestra **Iterations: 1**, aunque aparecen la
iteración 12, los agregados y los conteos anteriores. **No se conoce su causa**;
no se afirma que sea un bug, un recorte ni una configuración concreta, y no se
corrigió la imagen. La captura dice Ran today at 05:53:07 PM; no se verificaron
independientemente fecha/huso del run. Tampoco muestra la configuración inicial
ni el **delay de 100 ms**. No hay captura separada de configuración ni de un segundo
New Run. Son límites documentales que se conservan explícitos; los dos Newman de
12 iteraciones/100 ms y la prueba de reinicio de conteos siguen siendo evidencia
complementaria, no sustitutos de esta captura visual.

**La ejecución visual manual queda corroborada con esas salvedades.** Los intentos
bloqueados del agente y los reportes que decían readyForPrompt5=false son históricos,
no descripciones del run posterior del usuario. No se reinterpretan sus resultados.
La reparación de acentos permanece cerrada y no se repitió.

### Matriz final vigente

| # | Criterio | Resultado y procedencia |
| --- | --- | --- |
| 1 | Dos instancias UP bajo Servicio01 | Verificado en mínimo/completo y captura Eureka; IDs A/B y hosts Docker propios |
| 2 | Única URL por Gateway | Colección y captura del usuario: http://localhost:8080/api/equipos |
| 3 | Doce GET válidos y sin 429 | Newman real y agregado del Runner del usuario: doce contabilizadas, cero inválidas/429; encabezado discrepante documentado |
| 4 | JSON con datos y contrato original | Pruebas de colección/CRUD aprobadas; reparación selectiva de ocho campos previamente verificada por SQL/API |
| 5 | X-Instancia originada en A/B | Código, directos, tests y captura del usuario con A=6/B=6 |
| 6 | Sin orden ni reparto exacto exigidos | Verificador acepta 11/1 en simulación; 6/6 es sólo resultado observado |
| 7 | Filtro habitual 200/200/429 | Newman separado, diez aserciones; ocho tests del filtro; modo taller restaurado |
| 8 | Detalle/CRUD y contratos | Auditoría real de 107 comprobaciones; limpieza exclusiva de los tres registros temporales |
| 9 | Sistema completo y datos | APIs, siete vistas y recursos verificados; 16 equipos/15 partidos; acentos corregidos con respaldo |
| 10 | Conteos nuevos y persistencia sin duplicados | Reinicio del contador validado y Newman repetido; parada/arranque con hashes iguales y cero duplicados; segundo New Run visual no capturado |
| 11 | Rama, alcance y exclusiones | Rama taller-loadbalancer confirmada; revisión selectiva antes de commit; .env, credenciales, target y logs excluidos |
| Docente | Runner de Postman atribuible | Usuario ejecutó; agente revisó captura real de Liga1 con 53 aprobados, cero fallos y agregado A/B; discrepancia/limitaciones arriba |

### Prompt 5: revisión y entrega antes del commit

Publicación **expresamente solicitada por el usuario** después de aportar la
captura. Rama activa **taller-loadbalancer**; base HEAD/main y main remoto
**4722fa7e98f0c40bd581ff1ed13c8ff5f240501d**. Consulta inicial
**git ls-remote --heads origin main taller-loadbalancer**: main coincide con la
base y **taller-loadbalancer no existe en el remoto**. No se reemplaza trabajo remoto.
Remoto verificado: **https://github.com/JMarkoFlores/Liga1-peruana-futbol.git**.

Se revisaron diff seguido, inventario completo de nuevos archivos, código/perfiles,
Docker, scripts de inicialización/auditoría/reparación, colección, documentación y
reportes. Se conservan los documentos de planificación y evidencias históricas.
No se añadieron credenciales locales: las dos claves generadas de .env no coinciden
con ningún candidato; .env está ignorado, .env.example sólo contiene sustitutos.
La captura de usuario permanece intacta; no se agregan logs ni compilados.
Los resultados Java/Docker/CRUD/filtro de etapas previas se conservan con sus fechas;
no se repiten builds ni pruebas que escriban datos por este cambio documental.

Este estado se actualiza **antes del commit**. Siguientes pasos autorizados:
selección explícita de archivos de la actividad, revisión del índice,
commit descriptivo y **git push -u origin taller-loadbalancer**, sin force, merge
ni PR. El resultado efectivo del push y la igualdad del SHA local/remoto se
comunican tras ejecutarlo; este texto previo no afirma un push aún no realizado.

### Comprobaciones de revisión final ejecutadas en Prompt 5

| Comprobación | Resultado nuevo |
| --- | --- |
| Validate-Postman.cjs | Código 0: 15 escenarios estructurales/simulados, no HTTP |
| node --check de Test-Audit.cjs y Repair-DemoEncoding.cjs | Código 0, sin ejecutar los scripts ni modificar datos |
| Parser PowerShell de los tres scripts .ps1 | Sin errores sintácticos |
| JSON de colección/entorno/reportes y enlaces Markdown relativos | Parseo válido y cero enlaces rotos |
| git diff --check | Sin errores de espacios |
| git check-ignore | .env y JAR de target excluidos |
| Test-Demo.ps1 -FullSystem -TimeoutSeconds 60 | **Código 1: Eureka: No es posible conectar con el servidor remoto**; no se acreditó disponibilidad actual ni se llegó a la serie HTTP |

El último fallo es de disponibilidad en esta revisión; **no se convierte en un
éxito nuevo ni se oculta**. Los resultados anteriores y el Runner del usuario
mantienen su procedencia/fecha. No se arrancaron/recrearon contenedores ni se
repitió reparación, CRUD o reinicialización del volumen. Para una demostración en
vivo posterior, iniciar la demo según README y repetir Test-Demo.ps1 antes del
Runner. La publicación autorizada entrega código y evidencias verificadas, con
esta disponibilidad actual pendiente; no declara todas las comprobaciones de
runtime nuevamente aprobadas.

Enlaces de entrega: [rama del taller](https://github.com/JMarkoFlores/Liga1-peruana-futbol/tree/taller-loadbalancer)
y [historial de la rama](https://github.com/JMarkoFlores/Liga1-peruana-futbol/commits/taller-loadbalancer).
Persisten como observaciones la discrepancia del encabezado, la falta de captura de
configuración/delay y del segundo New Run visual; prueba de caída y todos los
formularios no se ejecutaron (fuera de las verificaciones realizadas). No se afirma
una garantía de rendimiento ni recuperación instantánea.

## Histórico: intento de cierre visual de Postman del agente

Actualización posterior del **17 de noviembre de 2026**, limitada al pendiente
visual. Rama **taller-loadbalancer** confirmada antes de editar; HEAD/base main
conservados en **4722fa7e98f0c40bd581ff1ed13c8ff5f240501d**. Se conservaron todos
los cambios previos. No hubo commits, push, merge ni inicio de Prompt 5.
**La reparación de acentos no se repitió; no hubo escrituras en MySQL.**

**El Runner visual sigue pendiente. No listo para Prompt 5.** La alternativa sin
entorno funciona en las comprobaciones automatizadas, pero no se logró cargar la
solicitud en el Runner de la interfaz. No se presenta Newman como prueba visual.
Los resultados anteriores permanecen abajo como históricos.

### Cambios y comprobaciones nuevas

Se conservaron nombre, ID, cinco GET, única URL y guardas de modos de la
[colección](../postman/Liga1-LoadBalancer.postman_collection.json). Se añadieron
cuatro variables de colección: baseUrl=http://localhost:8080, runMode=balanceo,
expectedInstanceA=Servicio01-A y expectedInstanceB=Servicio01-B. Las **13 lecturas**
antes limitadas a pm.environment.get ahora usan **pm.variables.get**, permitiendo
No Environment y respetando la prioridad de un entorno activo. Los conteos siguen
locales al run, reiniciados en iteración 0. El archivo de entorno no se modificó.

| Comprobación ejecutada ahora | Resultado real |
| --- | --- |
| Eureka antes de intentar UI y al registrar el cierre | HTTP 200, Servicio01-A/B UP, hosts servicio01-a/b y puerto interno 8761 |
| Validate-Postman.cjs | Código 0, 15 escenarios simulados aprobados; incluye sin entorno y prioridad del entorno; no es prueba HTTP |
| Esquema oficial Postman Collection v2.1 | Colección válida con Ajv/draft-04; sin errores de editor en colección, validador y reporte |
| Newman 6.2.3 sin entorno, variables de colección | 17:28:02–17:28:04 UTC-05:00; 12 iteraciones/100 ms; doce HTTP 200 en http://localhost:8080/api/equipos; A=6/B=6; 53 aserciones, cero fallos |
| Newman 6.2.3 con entorno entregado y baseUrl sobrescrita | 17:28:19–17:28:22 UTC-05:00; 12 iteraciones/100 ms; doce HTTP 200 en http://127.0.0.1:8080/api/equipos; A=6/B=6; 53 aserciones, cero fallos |
| Interfaz Postman Desktop 12.34.1 | Importación actualizada fallida; Run order vacío y Start run deshabilitado; **Runner no ejecutado** |

Cada serie Newman mantuvo su URL idéntica durante las doce iteraciones. La segunda
serie demuestra prioridad del entorno sobre el valor localhost de colección.
A=6/B=6 es el reparto observado, no una condición de aceptación. El
[reporte nuevo](./ETAPA4-VISUAL.json) separa simulación, HTTP real, observación UI
y declaración histórica del usuario. No se repitieron compilaciones/JUnit: no
cambiaron aplicaciones Java ni POM.

### Bloqueo visual observado y capturas reales

Se intentó Import del JSON actualizado y Replace únicamente de la colección Liga1.
La interfaz mostró **2 of 3 elements, 2 failed**, con dos entradas de colección
Liga1 fallidas. No se confirmó la actualización: Variables siguió sin las cuatro
filas. Environments mantuvo **Panel content couldn't load.**. Run desde carpeta
02 y colección, y arrastrar carpeta/colección, dejaron el Runner vacío con Start
run deshabilitado. La causa interna no se determinó. No se borraron configuraciones,
cerraron sesiones ni reinstaló Postman; no se usaron otras colecciones como evidencia.

- [Importación fallida](./evidencias/ETAPA4-VISUAL-IMPORTACION-FALLIDA.png).
- [Runner vacío y botón deshabilitado](./evidencias/ETAPA4-VISUAL-RUNNER-BLOQUEADO.png).

Estas capturas **sólo documentan el bloqueo**. No hay capturas nuevas de configuración
12/100 completada, resultados ni conteos del Runner visual. El usuario informó
previamente pruebas satisfactorias; sin precisar Send frente a Runner ni aportar
sus capturas, ese informe conserva su procedencia y no cierra este criterio.

### Paso manual exacto pendiente y matriz vigente

Primero debe completarse la actualización de **Liga1 - Taller LoadBalancer** en
la UI, verificando las cuatro variables. **Run folder** de **02 - Serie de balanceo**
debe cargar **GET equipos - medir reparto** en Run order y habilitar Start run.
Después: No Environment, Functional/Local, 12 iteraciones, Add a delay 100 ms,
sin datos externos, conservar respuestas y sin detenerse en el primer fallo.
Guardar configuración, doce HTTP 200/cero fallos y conteos A/B de la iteración 12.
La [guía actualizada](../postman/README.md#cierre-manual-pendiente-tras-el-nuevo-bloqueo)
detalla la alternativa, las capturas y el reinicio de contadores. La alternativa
está validada por Newman; aún no pudo completarse en esta interfaz.

| Criterio / pendiente | Estado vigente |
| --- | --- |
| Variables sin Environments y compatibilidad del entorno entregado | Cerrado en archivos, validador y Newman; actualización en UI sin confirmar |
| Doce HTTP 200, contrato, ambas identidades, misma URL | Nuevamente aprobado en Newman; evidencia complementaria |
| Runner visual y capturas, criterios 3/10 y evidencia docente | **Pendiente por bloqueo UI documentado**; sin ejecución visual |
| Acentos, datos 16/15, CRUD, rutas completas y persistencia | Resultados anteriores conservados; no se repitieron en este intento limitado |
| Prompt 5 / publicación | **No iniciado; todavía no listo** |

Archivos de este intento: colección, [validador](../postman/Validate-Postman.cjs),
[guía Postman](../postman/README.md), este estado,
[demostración](./DEMOSTRACION.md), [README de demo](../README.md), reporte nuevo y
las dos capturas de bloqueo. Los documentos y reportes anteriores se conservaron.

## Histórico: cierre anterior de pendientes de etapa 4

Actualización posterior de **17 de noviembre de 2026**, reparación ejecutada a las
**17:11:18 UTC-05:00**. Rama `taller-loadbalancer` confirmada; HEAD y `main` siguen
en `4722fa7e98f0c40bd581ff1ed13c8ff5f240501d`. Todos los cambios anteriores se
conservaron. **No se inició Prompt 5 ni se hicieron commits, push o merge.**

**Acentos reparados y verificados. Runner visual todavía bloqueado: no listo para
Prompt 5.** Los resultados anteriores se conservan abajo como históricos; sus
referencias a acentos pendientes y hashes previos no representan el estado nuevo.

### Reparación selectiva ejecutada

Antes de escribir se verificaron proyecto/volumen exclusivos de demo, marca
`liga1-v1`, tablas InnoDB, ausencia de triggers y conteos **16 equipos/15 partidos**.
[Repair-DemoEncoding.cjs](../scripts/Repair-DemoEncoding.cjs) leyó el SQL original,
reconoció únicamente las correspondencias exactas entre texto UTF-8 mal interpretado
y valores canónicos de la misma tabla/columna, y preparó estos ocho cambios:

| Tabla | ID | Campo | Valor corregido, contrastado con SQL original |
| --- | --- | --- | --- |
| equipos | 8 | nombre | César Vallejo |
| equipos | 9 | estadio | Unión Tarma |
| equipos | 12 | estadio | Héroes de San Ramón |
| equipos | 13 | nombre | Atlético Grau |
| equipos | 16 | nombre | Alianza Atlético |
| partidos | 4 | equipo_visitante | César Vallejo |
| partidos | 9 | equipo_local | César Vallejo |
| partidos | 14 | equipo_visitante | César Vallejo |

Se escribió y sincronizó a disco **antes de los UPDATE** el
[respaldo JSON](./ETAPA4-ACENTOS-RESPALDO.json): valores afectados anteriores y
posteriores, HEX UTF-8, referencia al SQL original y copia completa de las 31 filas.
Se impidió sobrescribir un respaldo existente. SHA-256 del SQL original conservado:
`14f61602a35249482e262cce640354f204fa9e032d2569395859f9eab156adbc`.

Los ocho UPDATE se ejecutaron en **una transacción**, con bloqueo de filas,
predicados por ID y bytes anteriores exactos y guardas que compararon todas las
filas/campos antes y después. Cada UPDATE afectó exactamente una fila. Tras COMMIT
se comparó el estado completo con la copia esperada: **sólo cambiaron esos ocho
campos**, con IDs, goles, fechas, jornadas y demás datos intactos. No hubo DELETE,
INSERT en tablas de negocio, DDL persistente ni reinicialización del volumen.

| Comprobación nueva | Resultado real |
| --- | --- |
| `Repair-DemoEncoding.cjs --apply --backup ... --report ...` | Código 0, COMMIT, ocho campos reparados, estado exacto verificado |
| APIs equipos por Gateway y directos A/B | Tres HTTP 200, 16 equipos y todos los textos afectados correctos; cabeceras A/B correctas |
| APIs partidos y resumen por Gateway | Dos HTTP 200, 15 partidos y las tres referencias César Vallejo corregidas |
| Relaciones lógicas equipoLocal/equipoVisitante | Los 15 partidos siguen referenciando nombres de equipos existentes |
| Segunda inspección `Repair-DemoEncoding.cjs` sin `--apply` | Código 0, cero campos pendientes; sólo lectura |
| `Test-Demo.ps1 -FullSystem -TimeoutSeconds 180` | Código 0: ambas réplicas UP, doce 200 A=6/B=6 y todas las rutas completas 200 |
| `Test-Audit.cjs --snapshot` | Código 0, 22 comprobaciones, 16/15, cero duplicados y marca `liga1-v1` |
| Newman 6.2.3 carpeta 02 tras reparar, doce iteraciones | Código 0, 12 HTTP 200, 53 aserciones aprobadas, cero fallos/429 y A=6/B=6; complemento, no UI |
| Dashboard en navegador | Texto César Vallejo correcto y captura real nueva |

Evidencias nuevas: [reparación](./ETAPA4-ACENTOS-REPARACION.json),
[sistema completo](./ETAPA4-CIERRE-SISTEMA.json), [datos](./ETAPA4-CIERRE-DATOS.json),
[resumen de cierre](./ETAPA4-CIERRE.json) y
[Dashboard corregido](./evidencias/ETAPA4-CIERRE-DASHBOARD.png).
Los hashes nuevos difieren de los anteriores **por los ocho campos autorizados**.
No se sobreescribieron los reportes/capturas históricos para simular que ya estaban
corregidos. No se repitieron builds ni JUnit: no cambiaron aplicaciones Java/POM.

### Nuevo intento visual de Postman y pendiente preciso

Se abrió **Liga1 - Taller LoadBalancer** y se observaron sus tres carpetas.
La UI siguió bloqueada después de **Retry** y recarga **Ctrl+R**:

- Environments: **`Panel content couldn't load.`**
- Selector: **`No Environments found.`**
- Al intentar **Create one**: **`Environment not found`** y
  **`We could not find the Environment you are looking for.`**

Se guardó [captura real del bloqueo](./evidencias/ETAPA4-CIERRE-POSTMAN-BLOQUEO.png),
con Liga1 y carpeta 02 visibles. **No es configuración completada ni resultado del
Runner.** No se ejecutó el run visual ni existen capturas nuevas de su resultado o
conteos. No se usaron resultados de otras colecciones como evidencia. El informe
histórico del usuario sobre pruebas satisfactorias permanece registrado aparte.

La [guía Postman](../postman/README.md#cierre-manual-pendiente-tras-el-nuevo-bloqueo)
contiene importación/selección de entorno, las cuatro variables, carpeta y solicitud
exactas, 12 iteraciones/100 ms y las tres capturas que faltan. Deben demostrar doce
200, ambas identidades y cero fallos. Hasta completar/verificar esa evidencia
obligatoria **no se considera listo para el Prompt 5**.

### Matriz de cierre y archivos de este intento

| Pendiente anterior | Estado vigente |
| --- | --- |
| Acentuación de datos existentes, criterios 4 y 9 | **Cerrado**: respaldo previo, ocho campos reparados, SQL/API/navegador verificados |
| Runner visual y capturas, criterios 3/10 y evidencia docente | **Pendiente por bloqueo UI documentado**; Newman y pruebas PowerShell siguen siendo complementarias |
| Criterios técnicos restantes de auditoría | Resultados históricos conservados; sistema completo vuelve a pasar tras la reparación |
| Publicación | No iniciada, sin commits/push/merge |

Añadidos: script de reparación, respaldo, reporte de reparación, tres reportes
`ETAPA4-CIERRE*.json` y dos capturas nuevas. Actualizados: este estado,
[DEMOSTRACION.md](./DEMOSTRACION.md), [README de demo](../README.md) y
[guía Postman](../postman/README.md). No cambiaron colección/entorno, SQL original,
configuración Compose ni código de negocio. La demo completa sigue activa con
datos conservados. Trabajo detenido antes del Prompt 5.

## Resultado histórico: Prompt 4 — auditoría inicial

Auditoría ejecutada el **17 de noviembre de 2026**, sin publicación. Rama confirmada
antes de editar y al terminar: **`taller-loadbalancer`**. HEAD y `main` permanecen en
`4722fa7e98f0c40bd581ff1ed13c8ff5f240501d`. Se conservaron los cambios de las etapas
anteriores, incluidos documentos y pruebas. No se hicieron commits, push ni merge.

Las comprobaciones técnicas descritas abajo pasaron. **No se declara cerrada toda
la consigna:** falta corroborar el Runner visual de Postman y permanece el defecto
de acentos en los datos previamente cargados, que se conservaron.

### Discrepancia Postman: procedencia y alcance

| Evidencia disponible | Procedencia | Qué acredita / límite |
| --- | --- | --- |
| Dos series Newman de etapa 3, 12 GET/53 aserciones cada una, y filtro 200/200/429 | Ejecutado por agente; [ETAPA3-NEWMAN.json](./ETAPA3-NEWMAN.json) | Prueba automatizada de colección; no ejecución visual del Runner |
| Error de importación/Environments y `runnerExecuted=false` de etapa 3 | Observación del agente en aquella etapa | El agente no ejecutó el Runner entonces; no certifica ausencia de pruebas posteriores del usuario |
| Usuario informa pruebas satisfactorias posteriores en Postman desde su ordenador | Declaración del usuario al solicitar etapa 4 | Se registra como prueba informada; no se precisó si usó Send o Runner de 12 iteraciones, ni se aportaron capturas/exportación de ese run |
| Revisión de la ventana accesible en etapa 4 | Inspección real por agente mediante UI | Seguía mostrando error de entornos y un resultado abierto de otra colección, que no se usa como evidencia de Liga1; no se borró ni ejecutó esa colección |
| Serie y filtro Newman de esta auditoría | Ejecutado por agente; [ETAPA4-RESUMEN.json](./ETAPA4-RESUMEN.json) | Confirma nuevamente ambas réplicas y filtro; continúa siendo evidencia complementaria |

Se añadió alcance temporal/procedencia a los metadatos Postman de etapa 3,
**sin cambiar sus resultados de ejecución**. El reporte posterior del usuario se
conserva separado: no se afirma que sus pruebas no ocurrieron.

Una llamada **Send** acredita esa respuesta, cuerpo/cabecera y código; no demuestra
por sí sola un run de doce iteraciones con reinicio y agregado final. Para cerrar
el pendiente hacen falta configuración y resultado del **Runner**, misma URL,
doce iteraciones, ambas identidades y cero errores, con capturas/reportes atribuibles
a esa ejecución. La [guía Postman](../postman/README.md) y
[DEMOSTRACION.md](./DEMOSTRACION.md) indican exactamente cómo obtenerlos.

### Auditoría del cambio y corrección encontrada

- Dependencia LoadBalancer explícita sin versión propia y gestionada por el BOM;
  Gateway **Server Web MVC**, API `lb://Servicio01` con colección y subrutas.
  No se añadió RestClient global ni se cambiaron versiones Boot/Cloud/Java.
- `X-Instancia` sigue originándose en Servicio01, desde el ID de Eureka. Se
  contrastó por acceso directo A/B y por Gateway; el JSON conservó su contrato.
- El filtro conserva el límite, alcance, seguimiento y reinicios originales;
  habilitado por defecto y desactivado por el perfil del taller. **No se modificó
  su código en etapa 4**; sus ocho tests y ambas configuraciones reales pasaron.
- DNS Docker, JRE 21, MySQL/red/volumen de demo y credenciales ignoradas conservados.
  Se verificaron proyecto, volumen, salud y puerto del Gateway antes del CRUD.
- La inspección de las vistas detectó nombres como `CÃ©sar`. La consulta SQL
  comprobó bytes almacenados incorrectos: cliente sin locale usaba latin1 al
  cargar el SQL UTF-8. Se añadió **`LANG: C.UTF-8` exclusivamente a MySQL** en
  [compose.yaml](../compose.yaml). Nueva inicialización real en un contenedor
  temporal, sin red ni volumen persistente: 16 equipos/15 partidos y
  `César Vallejo` con HEX `43C3A97361722056616C6C656A6F`, cliente utf8mb4.
  [ETAPA4-CHARSET.json](./ETAPA4-CHARSET.json) conserva el resultado.
- Sólo se eliminó ese contenedor temporal, después de verificar su etiqueta de
  auditoría. El MySQL de demo se recreó con el locale sobre su volumen existente;
  **no se repararon ni borraron datos previos**. Su acentuación defectuosa sigue
  como pendiente explícito. El SQL original no cambió.

La primera consulta del verificador temporal de charset falló porque MySQL recibió
host `127` al invocar `-h127.0.0.1` desde PowerShell. Se corrigió a argumento largo
entre comillas y se repitió una inicialización nueva satisfactoria; el reporte
registra esa incidencia. No se presenta el intento fallido como aprobado.

### Comandos y resultados realmente ejecutados

Todos los Compose usaron `--env-file demo-loadbalancer/.env` y
`-f demo-loadbalancer/compose.yaml`; el filtro añadió `-f .../compose.filtro.yaml`.
Comandos completos reproducibles en [DEMOSTRACION.md](./DEMOSTRACION.md).

| Comprobación | Resultado |
| --- | --- |
| `node .../scripts/Test-Audit.cjs --output .../ETAPA4-AUDITORIA.json` | Código 0; **107 comprobaciones**, 0 fallos; CRUD real y rutas |
| Gateway Wrapper `test -Deureka.client.enabled=false` | Código 0, BUILD SUCCESS; **11 tests**, 0 fallos/errores/omitidos, Maven 13.262 s |
| Servicio01 Wrapper `test -Dtest=InstanciaHeaderFilterTest` | Código 0, BUILD SUCCESS; **5 tests**, 0 fallos/errores/omitidos, Maven 9.604 s |
| Compose completo `down`, **sin -v** | Código 0; contenedores/red detenidos y eliminados, volumen conservado |
| `up -d --wait --wait-timeout 240` mínimo + `Test-Demo.ps1 -TimeoutSeconds 180` | Código 0 ambos; cinco sanos, dos UP, directos A/B, doce 200 con ambas identidades, ruta por ID 200 |
| `--profile sistema-completo up -d --wait --wait-timeout 240` + `Test-Demo.ps1 -FullSystem` | Código 0 ambos; siete sanos, doce 200, rutas completas 200 |
| `Test-Audit.cjs --snapshot --compare .../ETAPA4-AUDITORIA.json` tras reinicio y nueva recreación de MySQL | Código 0; **23 comprobaciones**, 0 fallos; conteos/hashes idénticos y cero duplicados |
| Gateway recreado con override habitual; Newman carpeta 03, `runMode=filtro`, una iteración | Código 0; **200, 200, 429**, diez aserciones aprobadas |
| Gateway recreado de nuevo con Compose base | Código 0 y sano, `docker,taller-loadbalancer` restaurado |
| Newman carpeta 02, doce iteraciones, delay 100 ms | Código 0; **12 HTTP 200, 53 aserciones**, cero fallos/429, A=6/B=6 |
| Inicialización MySQL temporal con locale UTF-8, consulta final corregida | Código 0; 16/15, bytes UTF-8 correctos; contenedor temporal eliminado |
| `Test-Demo.ps1 -FullSystem` después de corregir locale/recrear MySQL (16:52:34 -05:00) | Código 0; datos, directos, ambas UP, doce 200 A=6/B=6 y las doce rutas completas 200 |
| Navegador integrado, siete vistas mediante Playwright | Siete 200, datos cargados, CSS/JS/API locales 200 y cero errores JavaScript observados; acentos defectuosos visibles |
| Compose `config --quiet`, `git diff --check`, diagnóstico del editor | Sin errores |

Los tests Maven se ejecutaron con **JDK 25.0.4.1 del host**, sin cambiar variables
globales, y conservaron `release 21`. Las aplicaciones Docker siguen usando JRE 21
de las imágenes construidas en etapa 2. No se reconstruyeron imágenes ni se ejecutó
`package` de los cinco módulos en etapa 4: no hubo cambios Java/POM en esta etapa.
Los `test` verificaron compilación actualizada y ejecución de las suites indicadas.
Los contextLoads originales de los tres servicios de negocio no se ejecutaron como
JUnit; sí se comprobaron sus contextos y operaciones con MySQL real en Docker.

### CRUD, limpieza y persistencia

[Test-Audit.cjs](../scripts/Test-Audit.cjs) es reproducible y usa un prefijo UUID por
ejecución. En esta prueba creó **equipos 17/18 y partido 16**, todos exclusivos.
Verificó:

- Equipos: POST 201, GET/PUT 200, actualización persistida y leída directamente
  en A/B con la cabecera correcta; nombre vacío devuelve el 400 original.
- Partidos: POST 201, GET/PUT 200, consulta por jornada, visibilidad en resumen y
  recálculo de tabla por Servicio03: victoria tres puntos, empate uno para cada uno.
- Limpieza de esos tres IDs: comprobación de prefijo, DELETE 204, GET posterior
  404, ausencia en resumen/tabla. Limpieza defensiva en `finally`; no borrado global.
- Antes/después quedaron **16 equipos y 15 partidos**. Hashes de todos sus campos
  iguales, antes de parar y después de arrancar/recrear contenedores; cero partidos
  repetidos por todos sus campos de negocio y marca de inicialización `liga1-v1`.
  No se reiniciaron contadores AUTO_INCREMENT ni se borró ningún volumen.

Evidencia: [CRUD](./ETAPA4-AUDITORIA.json), [mínimo](./ETAPA4-MINIMO.json),
[completo final](./ETAPA4-COMPLETO.json) y [persistencia](./ETAPA4-PERSISTENCIA.json).

### Matriz final de criterios de ALCANCE.md

| # | Criterio | Estado y evidencia |
| --- | --- | --- |
| 1 | Dos instancias UP, mismo servicio, IDs distintos | **Verificado**: mínimo/completo y captura Eureka, Servicio01-A/B bajo SERVICIO01 |
| 2 | Una única URL Gateway | **Verificado**: colección/Newman siempre `{{baseUrl}}/api/equipos`; directos sólo diagnóstico |
| 3 | Doce GET consecutivos, todos 200 y sin 429 | **Verificado automatizado**: series mínimo/completo y Newman; evidencia visual del Runner pendiente |
| 4 | Arreglo con datos y campos/tipos originales | **Verificado** por colección y CRUD; acentuación de ciertos datos históricos pendiente de reparación |
| 5 | Cabecera originada en procesos A/B y ambos observados | **Verificado**: implementación, directos, Gateway/Newman y tests |
| 6 | Sin orden ni reparto exacto exigidos | **Verificado** por auditoría del verificador; 6/6 observado y no impuesto; escenario 11/1 de etapa 3 aceptado |
| 7 | Filtro habitual 200/200/429 desde historial limpio | **Verificado**: Newman real separado, diez aserciones; ocho tests de comportamiento; taller restaurado |
| 8 | Detalle por ID y contratos/CRUD preservados | **Verificado**: 107 comprobaciones, equipos/partidos, validación 400, recálculo y limpieza exclusiva |
| 9 | Rutas y recursos del sistema completo | **Verificado HTTP y carga inicial en navegador**: 15 partidos, tabla 10, resumen 15, siete vistas y CSS/JS; no todos los formularios; defecto visible de acentos pendiente |
| 10 | Run nuevo con conteos limpios y reinicio sin duplicados | **Verificado automatizado**: dos runs Newman de etapa 3, simulación, parada/arranque real y hashes iguales; repetición visual Postman pendiente de evidencia |
| 11 | Sin secretos/generados impropios, rama del taller | **Verificado localmente**: credenciales generadas sin coincidencias en archivos candidatos, `.env`/target ignorados; `main` sin cambios de commit. Publicación no ejecutada por instrucción |
| Docente | Prueba en Postman con evidencia atribuible | **Informada por usuario, no corroborada**: falta distinguir Send/Runner y aportar/verificar capturas de doce iteraciones |

### Documentación, capturas, diff y pendientes

- Completada [DEMOSTRACION.md](./DEMOSTRACION.md): arquitectura/guion, requisitos,
  comandos raíz, dos modos, espera, Runner, interpretación, parada, repetición,
  CRUD/persistencia, filtro/restauración y problemas 429/503/BD/Eureka/charset.
- Capturas **reales sin retoques**: [Eureka](./evidencias/ETAPA4-EUREKA.png) y
  [Dashboard](./evidencias/ETAPA4-DASHBOARD.png). La última muestra también el
  defecto de acentuación. No se fabricaron capturas Postman.
- Actualizados: [README principal](../../README.md), [README de demo](../README.md),
  [guía Postman](../postman/README.md), metadatos de procedencia de
  [ETAPA3-NEWMAN.json](./ETAPA3-NEWMAN.json), este estado y locale de
  [compose.yaml](../compose.yaml).
- Añadidos: auditor HTTP, demostración, seis reportes `ETAPA4-*.json` y dos PNG
  de evidencia. El código Java, POM, SQL original, colección/entorno y cambios
  previos se conservaron. No se añadieron logs o compilados; se revisaron los
  archivos candidatos sin imprimir credenciales. Un `git diff` sólo de archivos
  seguidos no incluye los documentos nuevos aún sin seguimiento.
- **Pendientes:** corroborar Runner/capturas posteriores del usuario; reparar
  selectivamente los acentos del volumen anterior en una tarea separada que
  preserve otros datos; prueba exhaustiva de formularios y caída opcional no
  realizadas. La disponibilidad futura de Tailwind/CDN no se garantiza.
- Sistema completo dejado activo con siete contenedores sanos y datos conservados.
  **Fin de etapa 4. No se inicia publicación.**

## Resultado registrado: Prompt 3

Artefactos de la etapa 3 preparados y comprobados el 17 de noviembre de 2026;
**Runner de la interfaz Postman y sus capturas pendientes** por el fallo descrito
abajo. Rama confirmada antes de editar y al terminar: `taller-loadbalancer`.
Base/HEAD conservado: `4722fa7e98f0c40bd581ff1ed13c8ff5f240501d`.
Se conservaron todos los cambios y documentos anteriores. No hubo commits ni push,
cambios de versiones Java/Spring, modificaciones de negocio ni avance a la auditoría.

### Disponibilidad y colección entregada

- Antes de crear los archivos se comprobó que los siete contenedores de la demo
  seguían sanos, Eureka registraba **Servicio01-A y Servicio01-B UP**, con hosts
  `servicio01-a`/`servicio01-b`, y Gateway respondía HTTP 200 con `X-Instancia`.
  La comprobación final mantuvo siete contenedores sanos y ambos registros UP.
- Colección v2.1 y entorno sin secretos en [postman/](../postman/README.md).
  Las cinco solicitudes usan exclusivamente `GET {{baseUrl}}/api/equipos`.
  `baseUrl=http://localhost:8080`; entorno **Liga1 - Demo local**.
- Carpetas separadas para lectura manual, una única solicitud medida y tres pasos
  del filtro habitual. `runMode` y `pm.execution.skipRequest()` evitan enviar otras
  carpetas accidentalmente durante la serie; también se comprobó con la colección
  completa en Newman.
- La serie inicia sus contadores en la iteración 0 usando `pm.variables` local al
  run. Registra cada respuesta antes de las aserciones y conserva errores de JSON,
  cabecera y HTTP en el agregado final. Valida datos y tipos del contrato, HTTP 200,
  identidad esperada y cero 429; exige ambas réplicas sin imponer orden ni 6/6.
- [Guía Postman](../postman/README.md): importación, espera acotada de descubrimiento,
  carpeta **02 - Serie de balanceo**, única solicitud **GET equipos - medir reparto**,
  entorno, **12 iteraciones**, **delay 100 ms**, resultados, repetición y capturas.
  Documenta por separado el modo habitual y su restauración.

### Comprobaciones realmente ejecutadas

Node **24.15.0**, npm **11.12.1**, Newman **6.2.3** instalado mediante la caché
de `npm exec`, sin crear dependencias npm en el repositorio. Reportes JSON completos
fuera del repositorio; resumen derivado con respuestas y aserciones reales en
[ETAPA3-NEWMAN.json](./ETAPA3-NEWMAN.json). Horarios de la tabla en UTC-05:00.

| Comprobación | Resultado real |
| --- | --- |
| JSON colección contra esquema oficial Postman v2.1, mediante Ajv | Válido; sin errores |
| `node demo-loadbalancer/postman/Validate-Postman.cjs` | Código 0; estructura, sintaxis y 13 escenarios simulados aprobados |
| Newman, carpeta de balanceo, `-n 12 --delay-request 100` (16:14:26–16:14:28) | Código 0; 12 GET, 12 HTTP 200, 53 aserciones aprobadas, 0 fallos; A=6/B=6 |
| Compose con override `compose.filtro.yaml`, sólo Gateway, recreado con historial limpio | Código 0 y sano; perfil `docker`, sin perfil del taller |
| Newman, carpeta de filtro, `--env-var runMode=filtro -n 1` (16:19:04–16:19:05) | Código 0; HTTP **200, 200, 429**, 10 aserciones aprobadas, 0 fallos; las dos permitidas con identidad |
| Restauración de Gateway con Compose base, sin override | Código 0 y sano; modo de taller restaurado |
| Newman, colección completa, modo balanceo, `-n 12` (16:22:01–16:22:12) | Código 0; sólo 12 solicitudes reales, no 60; 12 HTTP 200, 53 aserciones aprobadas, 0 fallos; A=6/B=6 |
| Compose base + override `config --quiet`, diff y diagnóstico del editor | Sin errores |

Los dos runs independientes terminaron con doce respuestas contabilizadas cada uno,
no veinticuatro. No hubo JSON inválidos, cabeceras desconocidas/ausentes ni 429 en
las series medidas. El reparto 6/6 es observado, no una condición de aprobación.
La prueba del filtro tuvo tres GET consecutivos idénticos, sin llamadas a la API
entre recrear Gateway y comenzar su carpeta. Después se restauró el taller y se
verificó nuevamente con las doce peticiones del segundo run.

Los trece escenarios del validador son **simulados**, sin HTTP: aceptan 11/1 y
comprueban reinicio, JSON/cabecera/HTTP incorrectos en la última respuesta, errores
anteriores, tipos/campos/datos inválidos, una sola réplica y menos de doce iteraciones.
No se presentan como fallos reales de la aplicación. La primera versión del script
de Postman falló en Newman con `Identifier 'data' has already been declared` por el
global legado del sandbox; se encapsularon los scripts en funciones y se repitieron
las ejecuciones finales de arriba con éxito. El aviso de npm/Node sobre dependencias
obsoletas de Newman y `fs.F_OK` no impidió las ejecuciones.

No se recompilaron módulos Java ni imágenes en esta etapa: se usaron las imágenes
verificadas en la etapa 2. No se ejecutaron nuevos tests JUnit ni CRUD; la colección
sólo consulta equipos y no deja registros temporales que limpiar.

### Interfaz Postman: observado y pendiente

Se operó **Postman Desktop 12.34.1** mediante su interfaz. Se importó la colección
**Liga1 - Taller LoadBalancer**, visible en Local Items. La importación del entorno
falló y el panel **Environments** mostró **`Panel content couldn't load.`**; la
acción Retry mantuvo el mismo error. No se atribuye una causa de red/cuenta sin
evidencia adicional. No se modificaron ni ejecutaron colecciones anteriores.

**No se ejecutó el Runner de esta colección en Postman ni se obtuvieron capturas
de una ejecución visual.** Queda pendiente importar/seleccionar el entorno,
ejecutar la configuración indicada y obtener las capturas enumeradas en la guía.
Newman es evidencia complementaria y no sustituye esa prueba exigida por el docente.
Los archivos JSON entregados están validados y listos para esa revisión manual.

### Archivos de esta etapa y punto de parada

- Añadidos: [colección](../postman/Liga1-LoadBalancer.postman_collection.json),
  [entorno](../postman/Liga1-Local.postman_environment.json),
  [validador](../postman/Validate-Postman.cjs), [guía](../postman/README.md),
  [override del filtro](../compose.filtro.yaml) y
  [resumen Newman](./ETAPA3-NEWMAN.json).
- Actualizados: [README de demo](../README.md) con enlace a Postman y este estado.
  El historial siguiente conserva los resultados originales de etapas anteriores;
  sus pendientes se interpretan conforme a este resultado vigente.
- Demo completa dejada en ejecución, datos conservados y modo del taller restaurado.
  `.env` sigue ignorado y no se incorporaron credenciales a colección/entorno/reportes.
- Pendiente de esta etapa: Runner/capturas en la UI de Postman. La auditoría final,
  CRUD y publicación siguen reservados para sus etapas. **Trabajo detenido aquí.**

## Resultado registrado: Prompt 2

Etapa 2 implementada y verificada el 17 de noviembre de 2026. Rama activa
`taller-loadbalancer`, base/HEAD `4722fa7e98f0c40bd581ff1ed13c8ff5f240501d`.
Se conservaron los cambios y documentos de las etapas anteriores; no hubo commits,
push ni cambios de versiones del proyecto. Trabajo detenido antes de Postman.

### Entorno Docker y aislamiento

- Engine Linux 29.9.3 y Compose v5.7.0, con aproximadamente 8 GB de memoria del
  daemon. Las aplicaciones se construyeron desde fuentes con JDK 21 y ejecutan
  con Temurin **21.0.13+9**, comprobado dentro de Servicio01 y Gateway.
- MySQL **8.4.13**, imagen `mysql:8.4`; proyecto `liga1-loadbalancer-demo`.
  Red `liga1-loadbalancer-demo_demo` y volumen
  `liga1-loadbalancer-demo_mysql-data`, ambos con etiqueta del proyecto verificada.
  Estos recursos no existían al iniciar la etapa.
- MySQL no publica puertos del host. Las publicaciones HTTP sólo escuchan en
  127.0.0.1: 8080 Gateway, 8760 Eureka, 8761 A y 8764 B. Servicio02/03 sólo son
  accesibles dentro de la red de demo y a través del Gateway.
- Se generó `demo-loadbalancer/.env` con dos claves aleatorias exclusivas, sin
  imprimirlas. `git check-ignore` confirmó su exclusión; `.env.example` sólo
  contiene valores de sustitución. No se modificó MySQL de Windows ni datos ajenos.

### Implementación de esta etapa

- [compose.yaml](../compose.yaml): cinco contenedores en el modo mínimo; el perfil
  `sistema-completo` añade Servicio02 y Servicio03 (siete en total).
- [Dockerfile](../Dockerfile) multi-stage compartido por los cinco módulos,
  usando sus propios Wrappers. Servicio01 copia exactamente
  `target/demo-0.0.1-SNAPSHOT.jar`. JRE de ejecución sin Maven, usuario `app`
  (UID 10001), `curl` instalado para healthchecks y límite de 512 MB por servicio.
- [.dockerignore](../../.dockerignore) permite fuentes, POM y Wrapper; excluye
  compilados, `.env`, logs y documentos. En el build final se transfirieron
  contextos de aproximadamente 2–131 kB, sin reutilizar `target` del host.
- Perfiles `application-docker.properties` en los cinco módulos. Réplicas con
  IDs Servicio01-A/B, `spring.application.name=Servicio01`, mismo puerto interno
  8761 y hostnames `servicio01-a`/`servicio01-b`. No se activaron los perfiles de
  JVM locales que anuncian 127.0.0.1.
- Gateway activa `docker,taller-loadbalancer`; la API sigue usando `lb://Servicio01`.
  Las URLs fijas se parametrizaron en su configuración principal con valores
  predeterminados `localhost` equivalentes a los anteriores; el perfil Docker
  cambia esas bases a DNS interno para **todas** las rutas HTML/API/raíz/CSS/JS.
- MySQL inicializa el volumen nuevo mediante el SQL original, montado como
  `10-sistema.sql`, seguido por `99-demo-ready.sql`, que crea una marca de versión.
  El healthcheck espera acceso TCP, marca y datos antes de admitir las JVM.
  Los tres servicios de negocio usan `ddl-auto=validate` en Docker; arrancaron
  validando las tablas existentes, sin DDL concurrente.
- Healthchecks Java: API Eureka, equipos en A/B, partidos, tabla de posiciones y
  proxy de la vista de equipos en Gateway. No se añadió Actuator.
- [Test-Demo.ps1](../scripts/Test-Demo.ps1) espera dos registros UP, comprueba
  sus hosts/puertos, las respuestas directas y que el Gateway descubra ambas
  réplicas antes de iniciar la serie medida. Plazo de descubrimiento de 180 s,
  solicitudes con timeout de 5 s, sin cambiar URL, IP ni query en la serie.
- [README](../README.md) documenta preparación, modos, salud, espera, repetición,
  parada conservando datos y eliminación opcional limitada al volumen propio.

### Comandos y resultados reales

Todos los comandos de Compose se ejecutaron desde la raíz con
`--env-file demo-loadbalancer/.env -f demo-loadbalancer/compose.yaml`.

| Verificación | Resultado |
| --- | --- |
| `config --quiet`, mínimo y `--profile sistema-completo` | Código 0, sin mostrar variables resueltas |
| `--profile sistema-completo build --parallel` final | Código 0; cinco módulos con BUILD SUCCESS y JAR reempaquetado |
| `up -d --wait --wait-timeout 240`, mínimo, tras corrección | Código 0; cinco contenedores sanos |
| `Test-Demo.ps1 -TimeoutSeconds 180` | Código 0, terminado a las 15:59:27 -05:00 |
| `--profile sistema-completo up -d --force-recreate --wait --wait-timeout 240` | Código 0; siete contenedores sanos, incluido MySQL recreado sobre el mismo volumen |
| `Test-Demo.ps1 -FullSystem -TimeoutSeconds 180`, versión final | Código 0, terminado a las 16:01:56 -05:00 |
| Consultas SQL antes/después de recrear contenedores | 16 equipos, 15 partidos, marca `liga1-v1` en ambos casos |
| Gateway Wrapper `test`, con `-Deureka.client.enabled=false` | Código 0, BUILD SUCCESS; 11 tests, 0 fallos/errores/omitidos, 8.549 s; 16:00:58 -05:00 |
| `git diff --check` y diagnóstico del editor | Sin errores |

Los comandos completos de arranque y verificación están en el README. Las pruebas
JUnit de regresión se ejecutaron en el host con JDK 25.0.4.1, separadas de las
aplicaciones reales que se ejecutaron en Docker con JRE 21. No se presenta
`-DskipTests` de la construcción como aprobación de pruebas JUnit.

Build final desde fuentes limpias, `./mvnw -B -ntp -DskipTests package`:

| Módulo | Tiempo Maven | Resultado |
| --- | --- | --- |
| Servicio01 | 3.299 s | BUILD SUCCESS, fuentes/test compilados con release 21 |
| Servicio02 | 4.405 s | BUILD SUCCESS, fuentes/test compilados con release 21 |
| Servicio03 | 4.795 s | BUILD SUCCESS, fuentes/test compilados con release 21 |
| Servidor-Eureka | 4.062 s | BUILD SUCCESS, fuentes/test compilados con release 21 |
| Pasarela-Gateway | 4.232 s | BUILD SUCCESS, fuentes/test compilados con release 21 |

### Evidencia de ejecución con instancias reales

Se guardaron resultados generados por el verificador, sin credenciales:

- [ETAPA2-MINIMO.json](./ETAPA2-MINIMO.json).
- [ETAPA2-COMPLETO.json](./ETAPA2-COMPLETO.json).

En **ambos modos**:

| Comprobación | Observado |
| --- | --- |
| Eureka | Servicio01-A y Servicio01-B, ambos UP, hosts servicio01-a/b, puerto 8761 |
| Acceso directo A (host 8761) | HTTP 200, X-Instancia Servicio01-A, arreglo de 16 equipos |
| Acceso directo B (host 8764) | HTTP 200, X-Instancia Servicio01-B, mismo arreglo de 16 equipos |
| Serie nueva por Gateway | 12 GET a `/api/equipos`, 12 HTTP 200, cero 429, JSON idéntico al directo |
| Identidades observadas | Ambas; reparto observado 6/6, sin exigir ese reparto ni alternancia |
| Ruta `/api/equipos/{id}` existente | HTTP 200, ID esperado y cabecera de una réplica |

En **sistema-completo**, además:

| Ruta | Resultado |
| --- | --- |
| `/api/partidos` | HTTP 200, 15 registros |
| `/api/tabla-posiciones` | HTTP 200, 10 registros |
| `/api/partidos-resumen` | HTTP 200, 15 registros |
| `/`, `/index.html`, `/dashboard.html`, `/equipos.html`, `/registro.html`, `/tabla.html`, `/acerca.html` | HTTP 200 |
| `/css/styles.css`, `/js/common.js` | HTTP 200 |

La recreación incluyó el contenedor MySQL, conservando el volumen. Las consultas
SQL posteriores mantuvieron 16 equipos y 15 partidos: no se repitió la inserción
inicial de partidos. No se ejecutó el SQL manualmente ni se borró ningún volumen.

### Incidencias encontradas y corregidas

1. El primer arranque del Gateway falló (`up` código 1): el perfil Docker sólo
   sobrescribía URIs de una lista indexada y Spring informó elementos sin enlazar
   (`routes[1].uri` ... `routes[12].uri`). Se sustituyó esa configuración por URLs
   base parametrizadas, manteniendo la lista completa en el archivo habitual.
   Se reconstruyó y repitió el arranque satisfactoriamente.
2. El primer contexto de build incluía compilados del host (hasta ~79 MB) porque
   reabrir directorios en `.dockerignore` también permitía sus hijos. Se corrigió
   la lista permitida y se recompilaron los cinco módulos desde fuentes bajo JDK 21.
3. El primer verificador mínimo falló por la forma en que PowerShell 5.1 envuelve
   arreglos devueltos por `ConvertFrom-Json`; se corrigió el desempaquetado y pasó.
4. El primer verificador completo recibió 406 al exigir `Accept: application/json`
   en recursos HTML. Se ajustó la negociación para vistas/recursos y pasó la
   versión final. No se cambió la aplicación para ocultar esos errores del verificador.

### Archivos de esta etapa y pendientes

- Añadidos: `.dockerignore`; `application-docker.properties` en los cinco módulos;
  `demo-loadbalancer/Dockerfile`, `compose.yaml`, `.env.example`, `README.md`;
  `mysql/99-demo-ready.sql`, `mysql/healthcheck.sh`;
  `scripts/New-DemoEnv.ps1`, `scripts/Test-Demo.ps1` y los dos JSON de evidencia.
- Modificados en esta etapa: configuración principal del Gateway para parametrizar
  las URLs fijas, este estado y `ARRANQUE-LOCAL.md` para distinguir JVM locales de Docker.
  El SQL original, contratos CRUD, POM/versions y código de negocio se conservaron.
- No quedan bloqueos de construcción, salud o descubrimiento de la etapa 2.
  Quedan para etapas posteriores la colección y Runner Postman, auditoría CRUD
  con datos temporales, prueba real del filtro habitual y revisión visual/interactiva
  de las vistas. Sólo se comprobaron sus respuestas HTTP; usan una CDN externa
  de Tailwind cuya disponibilidad/apariencia en navegador no se certifica aquí.
- No se ejecutaron los `contextLoads` originales de los servicios de negocio como
  tests JUnit; sí arrancaron sus contextos reales con MySQL en Docker. Las imágenes
  usan etiquetas de la línea Java 21/MySQL 8.4; las versiones efectivas constan arriba.
- El sistema completo se deja **en ejecución para revisión**, con sus siete
  contenedores sanos y datos conservados. La parada de la demo está documentada.
  No se crearon colección Postman, commits ni publicaciones. Fin de la etapa 2.

Referencias de implementación: [Compose y service_healthy](https://docs.docker.com/compose/how-tos/startup-order/),
[inicialización de la imagen MySQL](https://hub.docker.com/_/mysql) e
[imágenes Eclipse Temurin](https://hub.docker.com/_/eclipse-temurin).

## Resultado registrado: Prompt 1

Etapa 1 implementada y comprobada el 17 de noviembre de 2026. Trabajo detenido
antes de Docker/etapa 2 y de la publicación. Los resultados previos se conservan
abajo como historial.

### Rama y cambios conservados

- Antes de editar se confirmó `git branch --show-current` = `taller-loadbalancer`,
  `HEAD` = `4722fa7e98f0c40bd581ff1ed13c8ff5f240501d`.
- Al iniciar sólo estaban los tres documentos de planificación sin seguimiento;
  no había cambios en archivos versionados. Se conservaron todos.
- `ALCANCE.md` y `PROMPTS.md` mantienen sus SHA-256 originales. No se hicieron
  commits, push ni operaciones sobre `main`.

### Implementación

- Gateway: starter LoadBalancer explícito, sin versión propia; el BOM existente
  resuelve 5.0.3. Se conserva Gateway Server Web MVC y sus otras rutas.
- La API de equipos usa `lb://Servicio01` con
  `Path=/api/equipos,/api/equipos/**`. No se añadió un cliente `@LoadBalanced`.
- `ConsecutiveEndpointLimitFilter` acepta
  `liga1.gateway.consecutive-limit.enabled`, con valor predeterminado `true`.
  Sólo `application-taller-loadbalancer.properties` lo desactiva. Se conserva la
  regla por cliente, método y URI, dos llamadas permitidas, tercera 429 y reinicios.
  Se añadió un reloj inyectable en el constructor de pruebas para comprobar el
  límite de 30 segundos sin esperas reales; producción usa el reloj del sistema.
- Servicio01: nuevo `InstanciaHeaderFilter`, que establece `X-Instancia` antes
  de continuar la cadena y toma su valor directamente de
  `eureka.instance.instance-id`. No cambia controladores, JSON ni lógica CRUD.
- ID habitual configurable mediante `INSTANCE_ID`, con valor predeterminado
  `Servicio01:<server.port>`. Perfiles locales `taller-replica-a` y
  `taller-replica-b`: mismo nombre Servicio01, IDs predeterminados Servicio01-A/B,
  puertos 8761/8764 e IP anunciada 127.0.0.1.
- Se prepararon comandos de dos JVM y verificaciones manuales en
  [ARRANQUE-LOCAL.md](./ARRANQUE-LOCAL.md). Son instrucciones, no evidencia de
  ejecución de esas JVM.

### Comprobaciones ejecutadas

Se usó JDK 25.0.4.1, con `JAVA_HOME`/`PATH` de proceso, y el Wrapper de cada
módulo. Se conserva el objetivo Java 21, Boot 4.1.1 y Cloud BOM 2025.1.3.
Cada comando de tests/package tuvo límite externo de 180 segundos; el árbol,
90 segundos. No hubo fallos ni timeouts en estas comprobaciones.

Desde `Pasarela-Gateway`:

```powershell
.\mvnw.cmd -B -ntp '-Dstyle.color=never' '-Deureka.client.enabled=false' test
.\mvnw.cmd -B -ntp '-Dstyle.color=never' '-Deureka.client.enabled=false' package
.\mvnw.cmd -B -ntp '-Dstyle.color=never' dependency:tree '-Dincludes=org.springframework.cloud:spring-cloud-starter-loadbalancer,org.springframework.cloud:spring-cloud-loadbalancer'
```

Desde `Servicio01`:

```powershell
.\mvnw.cmd -B -ntp '-Dstyle.color=never' '-Dtest=InstanciaHeaderFilterTest' test
.\mvnw.cmd -B -ntp '-Dstyle.color=never' '-Dtest=InstanciaHeaderFilterTest' package
```

| Comando | Resultado | Tiempo Maven | Finalización (-05:00) |
| --- | --- | --- | --- |
| Gateway test | Código 0, BUILD SUCCESS; 11 tests | 9.985 s | 15:40:00 |
| Servicio01 test enfocado | Código 0, BUILD SUCCESS; 5 tests | 8.020 s | 15:39:58 |
| Gateway package, con tests | Código 0, BUILD SUCCESS; 11 tests | 8.362 s | 15:41:17 |
| Servicio01 package, con selección de tests | Código 0, BUILD SUCCESS; 5 tests | 6.362 s | 15:41:15 |
| Gateway dependency:tree | Código 0, BUILD SUCCESS | 2.408 s | 15:41:39 |

Se ejecutaron **16 casos distintos**, sin fallos, errores ni omitidos en los
conjuntos seleccionados. Package volvió a ejecutar esos tests; no duplica el
número de casos distintos. Tras ampliar una aserción de estado HTTP en la prueba
del Gateway se verificó la versión final mediante package. Se generaron ambos
JAR ejecutables con `spring-boot:4.1.1:repackage`.

| Test | Casos | Qué comprobó / aislamiento |
| --- | --- | --- |
| `ConsecutiveEndpointLimitFilterTest` | 8 | Dos admisiones y tercera 429 sin reenvío; cambio de endpoint/método; bloqueo que refresca el plazo; reinicio sólo tras más de 30 s; alcance API; IPs independientes; query strings sin evasión; 12 llamadas admitidas en modo deshabilitado; habilitación por defecto mediante bean Spring |
| `GatewayLoadBalancerIntegrationTest` | 2 | Gateway real con Tomcat y perfil taller; dos servidores HTTP controlados mediante SimpleDiscoveryClient; 12 GET idénticos con HTTP 200, ambas identidades y JSON intacto; ruta por ID, query, POST/PUT/DELETE, cuerpos y estados 200/201/204/404 |
| `PasarelaGatewayApplicationTests` existente | 1 | Carga del contexto habitual, con Eureka deshabilitado sólo por opción de test |
| `InstanciaHeaderFilterTest` | 5 | MockMvc con controlador real y EquipoServicio simulado: cabecera estable A/B y contrato JSON; detalle/404; creación/actualización/borrado/validación; dos casos con perfiles locales cargados desde archivos reales e identidad de cabecera alineada con Eureka |

La prueba HTTP usa **destinos controlados de test**, no procesos Servicio01 con
BD ni registros Eureka reales. El Gateway sí arrancó durante el test y ejerció
su configuración productiva `lb://Servicio01`, con Eureka deshabilitado y
descubrimiento estático sólo en el entorno de prueba. No se agregó configuración
de descubrimiento estático a producción. El perfil del taller se cargó desde
el archivo real y permitió la serie sin 429; el test no desactiva el filtro con
una propiedad alternativa. No se exige alternancia ni reparto exacto.

Árbol final del balanceador:

```text
com.example:Pasarela-Gateway:jar:0.0.1-SNAPSHOT
\- org.springframework.cloud:spring-cloud-starter-loadbalancer:jar:5.0.3:compile
   \- org.springframework.cloud:spring-cloud-loadbalancer:jar:5.0.3:compile
```

Se inspeccionaron los JAR: Gateway contiene ambos artefactos LoadBalancer 5.0.3
y el perfil de taller; Servicio01 contiene el filtro y ambos perfiles de réplica.
Los reportes Surefire quedan en `target/surefire-reports/`, ignorados por Git.
`git diff --check` y el diagnóstico del editor no informaron errores.
No se repitieron compilaciones de Servicio02/03 ni Eureka porque no se modificaron.

Se observaron advertencias no fatales de Lombok/Unsafe, del agente dinámico de
Mockito/Byte Buddy y de la caché predeterminada del balanceador. No se cambiaron
dependencias ni opciones globales para ocultarlas.

### Archivos de la etapa 1

Modificados:

- [POM del Gateway](../../Pasarela-Gateway/pom.xml).
- [Filtro de tráfico](../../Pasarela-Gateway/src/main/java/com/example/Pasarela_Gateway/ConsecutiveEndpointLimitFilter.java).
- [Configuración del Gateway](../../Pasarela-Gateway/src/main/resources/application.properties).
- [Configuración de Servicio01](../../Servicio01/src/main/resources/application.properties).
- Este `ESTADO.md`.

Añadidos:

- [Perfil Gateway taller](../../Pasarela-Gateway/src/main/resources/application-taller-loadbalancer.properties).
- [Tests del filtro](../../Pasarela-Gateway/src/test/java/com/example/Pasarela_Gateway/ConsecutiveEndpointLimitFilterTest.java).
- [Test HTTP del Gateway](../../Pasarela-Gateway/src/test/java/com/example/Pasarela_Gateway/GatewayLoadBalancerIntegrationTest.java).
- [Filtro de identidad](../../Servicio01/src/main/java/com/sistemas/ejemplo/InstanciaHeaderFilter.java).
- [Perfil A](../../Servicio01/src/main/resources/application-taller-replica-a.properties).
- [Perfil B](../../Servicio01/src/main/resources/application-taller-replica-b.properties).
- [Tests de identidad y contrato](../../Servicio01/src/test/java/com/sistemas/ejemplo/InstanciaHeaderFilterTest.java).
- [Guía local](./ARRANQUE-LOCAL.md).

### Limitaciones y pendientes

- El servicio Windows `MySQL84` estaba detenido y no se detectaron listeners en
  3306, 8760, 8761, 8764 ni 8080 antes de las pruebas. No se creó una BD de demo
  ni se arrancó/tocó MySQL local. La infraestructura exclusiva se prepara en otra etapa.
- No se ejecutó el `DemoApplicationTests.contextLoads` original de Servicio01:
  requiere la configuración JPA/MySQL habitual. La selección por `-Dtest` está
  explícita arriba; no se presenta la suite completa de Servicio01 como aprobada.
- Pendientes dos procesos Servicio01 reales, registros UP y descubrimiento por
  Eureka, comprobación directa A/B y por Gateway con sus datos compartidos, y
  regresión CRUD contra BD de demo. Tampoco se ejecutó Runner Postman.
- JDK 21 continúa pendiente para reproducibilidad exacta. Los tests sí ejercieron
  el Gateway sobre JDK 25; no acreditan el arranque completo de Servicio01 con BD.
- No se implementaron Dockerfiles, Compose ni colección Postman; no se publicó.
  Se detiene esta etapa para revisar los cambios.

Referencia técnica consultada: [LoadBalancer en Gateway Server Web MVC](https://docs.spring.io/spring-cloud-gateway/reference/spring-cloud-gateway-server-webmvc/filters/loadbalancer.html)
y [SimpleDiscoveryClient](https://docs.spring.io/spring-cloud-commons/reference/spring-cloud-commons/common-abstractions.html).
La documentación vigente muestra 5.0.4; las comprobaciones anteriores ejercieron
los artefactos 5.0.3 realmente resueltos por el proyecto.

## Resultado registrado: Prompt 0

Etapa 0 ejecutada el 17 de noviembre de 2026, con compilaciones finalizadas entre
15:30:15 y 15:30:45 (America/Bogota). En esa etapa se detuvo el trabajo antes del Prompt 1.
Las secciones de antecedentes al final conservan los resultados de la revisión
anterior; sus bloqueos no representan el resultado vigente.

### Git y conservación del trabajo

- Leídos `ALCANCE.md`, `ESTADO.md`, `PROMPTS.md` y el README del proyecto. No se
  encontraron archivos `AGENTS.md` en el árbol del workspace ni en sus directorios
  ascendentes, ni instrucciones adicionales en `.github`.
- Estado inicial real: rama `main`, commit
  `4722fa7e98f0c40bd581ff1ed13c8ff5f240501d`; los tres documentos de planificación
  estaban **sin seguimiento**. No había modificaciones de archivos versionados.
- Remoto fetch/push: `origin`,
  `https://github.com/JMarkoFlores/Liga1-peruana-futbol.git`.
- `git fetch --no-tags origin` terminó con código 0 al ejecutarse con permisos
  fuera del sandbox. La primera consulta dentro del sandbox falló al abrir
  `.git/FETCH_HEAD` (`Permission denied`).
- Después del fetch, `main` y `origin/main` apuntan al SHA anterior;
  `git rev-list --left-right --count main...origin/main` devolvió `0 0`.
  `git branch -a -vv` no mostró una rama `taller-loadbalancer` local ni remota.
- Se ejecutó `git switch -c taller-loadbalancer main`, con código 0 fuera del
  sandbox, tras una denegación inicial sobre `.git/index.lock`. Se confirmó
  `git branch --show-current` = `taller-loadbalancer` y `git rev-parse HEAD` =
  `4722fa7e98f0c40bd581ff1ed13c8ff5f240501d` **antes de modificar archivos**.
- Se conservaron los tres documentos en el directorio de trabajo de la rama.
  `ALCANCE.md` y `PROMPTS.md` permanecen intactos. Sólo se actualizó este archivo;
  los tres siguen sin seguimiento, pendientes de la etapa final de publicación.
  No se hicieron commits, push, merge, reset, rebase ni stash.

### Herramientas verificadas

| Herramienta / comprobación | Resultado real |
| --- | --- |
| `JAVA_HOME` inicial | Vacío en el proceso inicial |
| `java -version` mediante PATH de Oracle | Código 0; Java 25.0.4.1, sin reproducir el bloqueo anterior |
| JDK explícito | `C:\Program Files\Java\jdk-25.0.4.1`; `java -version` y `javac -version`: 25.0.4.1 |
| JDK 21 | No encontrado en las ubicaciones habituales inspeccionadas: Java, Adoptium, Microsoft, Corretto, BellSoft, `.jdks`, `.jdk` y Scoop |
| Wrapper | Versión de script 3.3.4, `distributionType=only-script`, presente en los cinco módulos |
| `Pasarela-Gateway\mvnw.cmd -version` | Código 0; Apache Maven 3.10.0 con Java 25.0.4.1 |
| Maven de Servicio01 | 3.9.16, confirmado por su Wrapper con `-V` durante package |
| Maven de Gateway, Servicio02, Servicio03 y Eureka | 3.10.0, confirmado con `-V` durante package |
| `docker version` | Código 0 fuera del sandbox; cliente y Engine 29.9.3, Docker Desktop 4.99.0, servidor linux/amd64, contexto desktop-linux |
| `docker compose version` | Código 0; v5.7.0 |

Se seleccionó JDK 25 porque ya estaba disponible y no se encontró JDK 21. Se
establecieron `JAVA_HOME` y el prefijo de `PATH` únicamente para los procesos de
verificación. No se instaló un JDK ni se modificaron variables o políticas globales.
Las cinco compilaciones con `javac ... release 21` prueban compilación y empaquetado
con este JDK; no certifican todavía el arranque con Java 25 ni ejecución sobre JDK 21.

Las consultas se acotaron mediante un ejecutor temporal fuera del repositorio:
20 s para el alias Java, 45 s para versión del Wrapper, 30 s para Docker,
15 s para Compose y 180 s por comando Maven de dependencias/empaquetado.
Ninguna comprobación final agotó su tiempo. El ejecutor PowerShell necesitó
`-ExecutionPolicy Bypass` sólo en ese proceso; no se cambió la política del equipo.

### Dependencias y bloqueos anteriores

Desde `Pasarela-Gateway`, con el JDK explícito:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-25.0.4.1'
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
.\mvnw.cmd -version
.\mvnw.cmd -B '-Dstyle.color=never' '-Dmaven.wagon.http.connectionTimeout=15000' '-Dmaven.wagon.http.readTimeout=30000' dependency:tree '-Dincludes=org.springframework.cloud:*'
```

`dependency:tree` terminó con código 0, `BUILD SUCCESS`, tiempo Maven 7.321 s,
a las 15:29:44 -05:00. Árbol Spring Cloud obtenido:

```text
com.example:Pasarela-Gateway:jar:0.0.1-SNAPSHOT
+- org.springframework.cloud:spring-cloud-starter-gateway-server-webmvc:jar:5.0.3:compile
|  +- org.springframework.cloud:spring-cloud-starter:jar:5.0.3:compile
|  |  +- org.springframework.cloud:spring-cloud-context:jar:5.0.3:compile
|  |  \- org.springframework.cloud:spring-cloud-commons:jar:5.0.3:compile
|  \- org.springframework.cloud:spring-cloud-gateway-server-webmvc:jar:5.0.3:compile
\- org.springframework.cloud:spring-cloud-starter-netflix-eureka-client:jar:5.0.2:compile
   +- org.springframework.cloud:spring-cloud-netflix-eureka-client:jar:5.0.2:compile
   \- org.springframework.cloud:spring-cloud-starter-loadbalancer:jar:5.0.3:compile
      \- org.springframework.cloud:spring-cloud-loadbalancer:jar:5.0.3:compile
```

LoadBalancer **sí llega transitivamente por Eureka Client**. Sigue sin declararse
explícitamente en el POM del Gateway: esa modificación corresponde al Prompt 1.
Los cinco POM conservan Java 21, Boot 4.1.1 y BOM Cloud 2025.1.3. Maven pudo
resolverlos; el reempaquetado usó `spring-boot:4.1.1:repackage`. No se cambiaron
versiones ni se deshabilitó el verificador de compatibilidad.

El primer intento de Wrapper dentro del sandbox falló con
`icm: No se puede indizar en una matriz nula` / `Cannot start maven from wrapper`.
Fuera del sandbox arrancó usando el repositorio habitual `C:\Users\Daniel\.m2`.
No se reprodujo `Could not open file channel` del lock del parent. Hubo descargas
reales del plugin de dependencias y sus artefactos desde Maven Central; tampoco
se reprodujo `Unknown host repo.maven.apache.org`. No fue necesario volver a
usar un repositorio Maven temporal ni borrar locks o cachés.

Docker dentro del sandbox mostró `config.json: Acceso denegado` y
`permission denied ... npipe:////./pipe/docker_engine`; fuera del sandbox cliente
y servidor respondieron. No se crearon ni arrancaron contenedores de la demo.

### Compilaciones realizadas

Desde cada uno de los cinco directorios de módulo, con su propio Wrapper y el
mismo JDK explícito, se ejecutó el siguiente comando (sin POM agregador):

```powershell
.\mvnw.cmd -V -B -ntp '-Dstyle.color=never' '-Dmaven.wagon.http.connectionTimeout=15000' '-Dmaven.wagon.http.readTimeout=30000' package '-DskipTests'
```

| Directorio | Maven | Resultado | Tiempo Maven | Fin (-05:00) |
| --- | --- | --- | --- | --- |
| `Pasarela-Gateway` | 3.10.0 | Código 0, BUILD SUCCESS | 6.528 s | 15:30:15 |
| `Servicio01` | 3.9.16 | Código 0, BUILD SUCCESS | 5.700 s | 15:30:24 |
| `Servicio02` | 3.10.0 | Código 0, BUILD SUCCESS | 5.292 s | 15:30:31 |
| `Servicio03` | 3.10.0 | Código 0, BUILD SUCCESS | 5.306 s | 15:30:39 |
| `Servidor-Eureka` | 3.10.0 | Código 0, BUILD SUCCESS | 4.422 s | 15:30:45 |

Los cinco módulos recompilaron fuentes principales y su clase de test con
`release 21`, generaron JAR y completaron `repackage`. Todos indicaron
`Tests are skipped.`: **no se ejecutaron ni aprobaron tests**. Hubo advertencias
de Lombok sobre `sun.misc.Unsafe::objectFieldOffset` en Gateway y los tres
servicios de negocio; no impidieron el empaquetado. Los generados quedan en
`target/`, ignorados por Git.

### Tests inspeccionados y pendientes de ejecución

Los cinco tests existentes contienen únicamente `@SpringBootTest` y un método
vacío `contextLoads()`, sin perfiles de aislamiento ni mocks de infraestructura.

| Módulo | Infraestructura según código y configuración inspeccionados |
| --- | --- |
| Servicio01, Servicio02 y Servicio03 | JPA y MySQL del esquema `sistema`; requieren BD disponible para cargar el contexto habitual. Cliente Eureka configurado hacia localhost:8760 |
| Gateway | Sin JPA/MySQL; cliente Eureka configurado hacia localhost:8760. El test no exige explícitamente un registro UP ni prueba el enrutamiento |
| Eureka | Sin MySQL; servidor Eureka con registro propio y fetch desactivados. No requiere otro servidor Eureka según la configuración |

La disponibilidad de Eureka no está afirmada como requisito estricto de éxito
de los `contextLoads` clientes: no se ejecutaron y sus errores de conexión pueden
ser asíncronos. La ejecución posterior deberá aislar o proporcionar el registro.
No se arrancaron aplicaciones ni se conectó a MySQL durante esta etapa.

### Cierre de etapa y pendientes

- Sin bloqueo de resolución Maven o acceso al daemon en el contexto autorizado.
  Dentro del sandbox permanecen restricciones de acceso a Git, `.m2` y Docker;
  las verificaciones satisfactorias se hicieron con permisos fuera de él.
- Pendiente disponer de JDK 21 para reproducibilidad exacta y validar ejecución
  real con el runtime elegido. El éxito de package no acredita arranque ni balanceo.
- Tests, MySQL de demo, Dockerfiles/Compose de la demo, dos registros Eureka,
  cabecera `X-Instancia` y Runner Postman quedan para sus etapas posteriores.
- Único archivo de contenido modificado en esta etapa: `demo-loadbalancer/docs/ESTADO.md`.
  Se conservan los otros documentos de planificación. No se implementó funcionalidad
  ni se publicó en GitHub. La rama permanece en el commit base, sin nuevos commits.

## Antecedentes: revisión anterior a la etapa 0

Este registro histórico se conserva para explicar los errores que se volvieron
a verificar. El resultado vigente y los pendientes actuales figuran arriba.

### Comprobado en la revisión anterior

- Leídos los dos PDF: consigna y contexto de continuidad.
- Repositorio local en `main`, commit `4722fa7e98f0c40bd581ff1ed13c8ff5f240501d`, sin cambios al iniciar.
- Inspeccionados los cinco POM, sus propiedades, README, SQL, controlador y servicio de equipos, filtro del Gateway, cálculo de posiciones y referencias API de las vistas.
- Rutas fijas del Gateway, ausencia de dependencia explícita del balanceador y filtro 429 confirmados en código.
- Compatibilidad declarada de Cloud 2025.1.3 con Boot 4.1.x corroborada en fuente oficial. La resolución local aún no está certificada.
- Existe Java ejecutable en `C:\Program Files\Java\jdk-25.0.4.1\bin\java.exe`: `java -version` con ruta explícita devolvió 25.0.4.1.
- No se observó JAVA_HOME configurado. La invocación inicial mediante el alias Java de Oracle y Maven Wrapper no entregó resultado durante la revisión y se interrumpió. No se atribuye el problema a una causa todavía no demostrada.
- Docker está instalado según la ubicación de su ejecutable; la consulta del servidor no terminó durante la revisión. Disponibilidad del daemon pendiente.
- GitHub CLI `gh` no se encontró en PATH. Esto no impide usar Git si hay credenciales válidas; permisos de push pendientes de comprobar en la etapa de publicación.

### Pendiente en la revisión anterior

| Verificación | Estado |
| --- | --- |
| Maven Wrapper con entorno Java explícito | Arranca Maven, pero dependency:tree falló al abrir el lock del parent Boot 4.1.1 en el repositorio .m2 habitual |
| Árbol de dependencias y presencia transitiva de LoadBalancer | Sin resultado confirmado |
| Compilación de los cinco módulos | No ejecutada satisfactoriamente |
| Tests | No ejecutados |
| MySQL de demo | No creado |
| Docker build / Compose | No implementados |
| Dos instancias Eureka | No ejecutadas |
| GET por Gateway con X-Instancia | No implementado |
| Runner Postman | No creado ni ejecutado |
| Rama de actividad / push | Pendientes de etapas de implementación y cierre |

### Cambios de la revisión anterior

Se añadieron únicamente `ALCANCE.md`, `ESTADO.md` y `PROMPTS.md` en `demo-loadbalancer/docs/`. No se modificó código funcional ni se publicó al remoto.

### Diagnóstico de Maven de la revisión anterior

Con JAVA_HOME apuntando al JDK encontrado se ejecutó, desde Pasarela-Gateway:

```powershell
.\mvnw.cmd -B '-Dstyle.color=never' dependency:tree '-Dincludes=org.springframework.cloud:*'
```

El resultado fue código 1: `Could not open file channel` para el lock de
`spring-boot-starter-parent:4.1.1`, tras cinco intentos. Este error no demuestra
incompatibilidad de versiones ni ausencia del artefacto. Se intentó nuevamente
con un repositorio Maven exclusivo bajo TEMP para evitar escribir en .m2. El
segundo intento también terminó con código 1: `Unknown host repo.maven.apache.org`.
No se obtuvo árbol de dependencias ni compilación. Resolver acceso a Maven Central
en el entorno de ejecución antes de evaluar un cambio de versiones.

## Registro a mantener por etapa

Anotar comando, directorio, resultado, fecha, archivos afectados y limitaciones. Distinguir inspección estática, compilación, prueba automatizada y ejecución real. No marcar una etapa completada sólo porque se generaron sus archivos.
