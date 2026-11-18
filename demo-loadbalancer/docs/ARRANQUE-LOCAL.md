# Etapa 1: dos réplicas locales

Preparación para ejecutar JVM locales; no es evidencia de un arranque realizado.
La etapa 1 se verificó con los tests descritos en [ESTADO.md](./ESTADO.md).
La ejecución como JVM locales continúa pendiente. La ejecución real con MySQL y
Eureka en Docker se comprobó en la etapa 2; ver [README de la demo](../README.md).

## Requisitos

- JDK 21 recomendado. En la etapa 1 se usó JDK 25.0.4.1 con compilación `release 21`.
- MySQL disponible, con datos de demo en un esquema exclusivo y accesible por ambas
  réplicas. Proporcionar `DB_URL`, `DB_USERNAME` y `DB_PASSWORD` sólo en los procesos
  de Servicio01; no versionar sus valores. La configuración habitual usa
  `ddl-auto=update`: no apuntar esta prueba a una BD ajena o de producción.
- Puertos libres 8760 (Eureka), 8761 (A), 8764 (B) y 8080 (Gateway).
- Ejecutar cada bloque en una terminal PowerShell distinta, iniciando en la raíz
  del repositorio. Establecer `JAVA_HOME` al JDK elegido sólo en esas terminales y
  anteponer su directorio `bin` al `PATH` si es necesario.

## Arranque preparado

Primero, el registro:

```powershell
Set-Location Servidor-Eureka
.\mvnw.cmd spring-boot:run
```

Réplica A, después de configurar las variables de BD en su terminal:

```powershell
$env:INSTANCE_ID = 'Servicio01-A'
Set-Location Servicio01
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=taller-replica-a'
```

Réplica B, con las mismas variables de BD y otro ID en su propia terminal:

```powershell
$env:INSTANCE_ID = 'Servicio01-B'
Set-Location Servicio01
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=taller-replica-b'
```

Gateway en modo de taller:

```powershell
Set-Location Pasarela-Gateway
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=taller-loadbalancer'
```

Los perfiles A/B conservan `spring.application.name=Servicio01`, anuncian
`127.0.0.1` y usan puertos 8761/8764. El registro y la cabecera `X-Instancia`
comparten `eureka.instance.instance-id`; `INSTANCE_ID` permite configurarlo por
proceso. Los valores predeterminados de estos perfiles ya son `Servicio01-A/B`.
Sin estos perfiles, el ID predeterminado es `Servicio01:<server.port>`.

La API del Gateway usa `lb://Servicio01` para `/api/equipos` y
`/api/equipos/**`, con la integración de [Gateway Server Web MVC](https://docs.spring.io/spring-cloud-gateway/reference/spring-cloud-gateway-server-webmvc/filters/loadbalancer.html).
Las otras rutas conservan su configuración previa; Servicio02/03 no se arrancan
con estos bloques.

## Comprobaciones manuales pendientes

Esperar a que ambas réplicas figuren `UP` bajo `SERVICIO01` en
<http://localhost:8760/> y a que el cliente Eureka del Gateway las descubra.
La propagación del registro no es instantánea; acotar la espera, por ejemplo a
120 segundos, y registrar un bloqueo si no aparecen ambas.

Consultar directamente los dos servicios:

```powershell
Invoke-WebRequest 'http://localhost:8761/api/equipos' -UseBasicParsing
Invoke-WebRequest 'http://localhost:8764/api/equipos' -UseBasicParsing
```

Comprobar HTTP 200, arreglo JSON de equipos y cabeceras `X-Instancia` distintas,
coincidentes con sus IDs Eureka. Usar un ID existente de la BD de demo para
comprobar también `/api/equipos/{id}` directamente y por Gateway.

Después, varias solicitudes idénticas a una única URL:

```powershell
1..12 | ForEach-Object {
    $response = Invoke-WebRequest 'http://localhost:8080/api/equipos' -UseBasicParsing
    [pscustomobject]@{
        Estado = $response.StatusCode
        Instancia = $response.Headers['X-Instancia']
        Cuerpo = $response.Content
    }
}
```

Comprobar ambas identidades, cuerpos válidos y ausencia de 429 sin exigir orden,
primer destino o reparto 6/6. Esto no sustituye la colección/Runner Postman de la
etapa 3. Un 503 obliga a revisar registros y descubrimiento; no acredita balanceo.

Para comprobar el modo habitual, detener sólo el proceso Gateway de esta prueba
con Ctrl+C y volver a iniciarlo sin el perfil `taller-loadbalancer`:

```powershell
# Desde Pasarela-Gateway; sin perfiles o variables externas que desactiven el filtro.
.\mvnw.cmd spring-boot:run
```

Con historial limpio, las primeras dos llamadas consecutivas a la misma API se
admiten y la tercera devuelve 429. El modo habitual sigue aplicando a `/api/`, por
cliente, método y URI; se reinicia al cambiar de endpoint o tras más de 30 segundos
sin peticiones. Las llamadas bloqueadas también actualizan la marca temporal.
El perfil de taller es el único archivo de configuración que desactiva
`liga1.gateway.consecutive-limit.enabled`; el valor predeterminado del código es
`true`.

Detener únicamente las JVM iniciadas para esta comprobación con Ctrl+C en sus
terminales. No borrar ni reinicializar bases de datos. Docker y publicación no
forman parte de esta etapa.
