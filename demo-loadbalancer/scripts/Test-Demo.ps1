param(
    [int]$TimeoutSeconds = 180,
    [switch]$FullSystem,
    [string]$OutputPath
)
$ErrorActionPreference = 'Stop'
$demoDirectory = Split-Path $PSScriptRoot -Parent
$settings = @{}
foreach ($line in Get-Content -LiteralPath (Join-Path $demoDirectory '.env')) {
    if ($line -match '^(GATEWAY_PORT|EUREKA_PORT|REPLICA_A_PORT|REPLICA_B_PORT)=(\d+)$') {
        $settings[$Matches[1]] = [int]$Matches[2]
    }
}
function Get-Port([string]$Name, [int]$Default) {
    if ($settings.ContainsKey($Name)) { return $settings[$Name] }
    return $Default
}
function Require([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw $Message }
}
function Get-Response([string]$Uri) {
    $accept = if ($Uri -match '/(api|eureka)/') { 'application/json' } else { '*/*' }
    return Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec 5 -Headers @{ Accept = $accept }
}
function Check-Teams($Response) {
    Require ($Response.StatusCode -eq 200) 'La API de equipos no devolvió 200.'
    Require ($Response.Content.TrimStart().StartsWith('[')) 'La respuesta no es un arreglo JSON.'
    $teams = $Response.Content | ConvertFrom-Json
    $teams = @($teams)
    Require ($teams.Count -gt 0) 'No hay equipos inicializados.'
    foreach ($team in $teams) {
        foreach ($field in @('id', 'nombre', 'ciudad', 'estadio')) {
            Require ($null -ne $team.PSObject.Properties[$field]) "Falta el campo $field."
        }
        Require ($team.id -gt 0 -and $team.nombre -is [string]) 'Contrato de equipos inválido.'
    }
    return $teams.Count
}
$gateway = 'http://localhost:' + (Get-Port 'GATEWAY_PORT' 8080)
$registry = 'http://localhost:' + (Get-Port 'EUREKA_PORT' 8760)
$expectedIds = @('Servicio01-A', 'Servicio01-B')
$deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
$instances = @()
$lastError = ''
Write-Output 'Esperando dos registros UP alcanzables y descubrimiento por el Gateway...'
do {
    try {
        $registration = Get-Response "$registry/eureka/apps/SERVICIO01"
        $instances = @(($registration.Content | ConvertFrom-Json).application.instance | Where-Object status -eq 'UP')
        $ids = @($instances | ForEach-Object instanceId)
        if (@($expectedIds | Where-Object { $_ -notin $ids }).Count -eq 0) { break }
        $lastError = 'Aún faltan registros UP.'
    } catch { $lastError = $_.Exception.Message }
    Start-Sleep -Seconds 2
} while ([DateTime]::UtcNow -lt $deadline)
Require (@($expectedIds | Where-Object { $_ -notin @($instances | ForEach-Object instanceId) }).Count -eq 0) "Eureka: $lastError"
foreach ($instance in $instances) {
    Require ($instance.hostName -in @('servicio01-a', 'servicio01-b')) 'Eureka anuncia un host ajeno a la red de demo.'
    Require ($instance.port.'$' -eq 8761) 'Eureka anuncia un puerto incorrecto.'
}

$direct = @()
foreach ($replica in @(@('REPLICA_A_PORT', 8761, 'Servicio01-A'), @('REPLICA_B_PORT', 8764, 'Servicio01-B'))) {
    $response = Get-Response ('http://localhost:' + (Get-Port $replica[0] $replica[1]) + '/api/equipos')
    $count = Check-Teams $response
    Require ($response.Headers['X-Instancia'] -eq $replica[2]) 'La cabecera directa no coincide con Eureka.'
    $direct += [pscustomobject]@{ Instance = $replica[2]; Status = $response.StatusCode; Teams = $count }
    if ($replica[2] -eq 'Servicio01-A') { $baseline = $response.Content }
    else { Require ($response.Content -eq $baseline) 'Las réplicas no ofrecen los mismos datos.' }
}

# Calentamiento acotado: un registro UP no acredita que el cliente del Gateway lo descubra.
$seen = @{}
do {
    try {
        $response = Get-Response "$gateway/api/equipos"
        $null = Check-Teams $response
        $identity = $response.Headers['X-Instancia']
        Require ($identity -in $expectedIds) 'Identidad inesperada durante el descubrimiento.'
        $seen[$identity] = $true
        if ($seen.Count -eq 2) { break }
    } catch { $lastError = $_.Exception.Message }
    Start-Sleep -Seconds 2
} while ([DateTime]::UtcNow -lt $deadline)
Require ($seen.Count -eq 2) "El Gateway no descubrió ambas réplicas en el plazo: $lastError"

# Serie nueva: no reutiliza conteos del calentamiento, ni altera URL/IP/query.
$series = @()
foreach ($iteration in 1..12) {
    $response = Get-Response "$gateway/api/equipos"
    $count = Check-Teams $response
    Require ($response.Content -eq $baseline) 'El Gateway cambió los datos de equipos.'
    $identity = $response.Headers['X-Instancia']
    Require ($identity -in $expectedIds) 'Cabecera X-Instancia ausente o inesperada.'
    $series += [pscustomobject]@{ Iteration = $iteration; Status = $response.StatusCode; Instance = $identity; Teams = $count }
}
Require (@($series.Instance | Sort-Object -Unique).Count -eq 2) 'La serie no observó ambas réplicas.'
$firstTeam = ($baseline | ConvertFrom-Json)[0]
$detail = Get-Response "$gateway/api/equipos/$($firstTeam.id)"
Require ($detail.StatusCode -eq 200 -and ($detail.Content | ConvertFrom-Json).id -eq $firstTeam.id) 'Falló la ruta por ID.'
Require ($detail.Headers['X-Instancia'] -in $expectedIds) 'Falta identidad en la ruta por ID.'

$fullChecks = @()
if ($FullSystem) {
    foreach ($path in @('/api/partidos', '/api/tabla-posiciones', '/api/partidos-resumen',
            '/', '/index.html', '/dashboard.html', '/equipos.html', '/registro.html', '/tabla.html',
            '/acerca.html', '/css/styles.css', '/js/common.js')) {
        $response = Get-Response "$gateway$path"
        Require ($response.StatusCode -eq 200) "Falló la ruta $path."
        if ($path.StartsWith('/api/')) {
            Require ($response.Content.TrimStart().StartsWith('[')) "No hay arreglo JSON en $path."
            $records = $response.Content | ConvertFrom-Json
            $items = @($records).Count
            Require ($items -gt 0) "No hay datos en $path."
        } else { $items = $null }
        $fullChecks += [pscustomobject]@{ Path = $path; Status = $response.StatusCode; Items = $items }
    }
}
$result = [pscustomobject]@{
    Date = (Get-Date).ToString('o')
    Mode = $(if ($FullSystem) { 'sistema-completo' } else { 'minimo' })
    Eureka = @($instances | ForEach-Object { [pscustomobject]@{ Id = $_.instanceId; Host = $_.hostName; Port = $_.port.'$'; Status = $_.status } })
    Direct = $direct
    Series = $series
    DetailStatus = $detail.StatusCode
    FullSystem = $fullChecks
}
if ($OutputPath) {
    [IO.File]::WriteAllText($OutputPath, ($result | ConvertTo-Json -Depth 6), (New-Object Text.UTF8Encoding $false))
}
$result | ConvertTo-Json -Depth 6
