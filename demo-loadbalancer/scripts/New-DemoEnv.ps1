$ErrorActionPreference = 'Stop'
$destination = Join-Path (Split-Path $PSScriptRoot -Parent) '.env'
if (Test-Path -LiteralPath $destination) {
    throw 'Ya existe .env; se conserva. No se regeneran claves de un volumen existente.'
}
function New-Password {
    $bytes = New-Object byte[] 32
    $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $generator.GetBytes($bytes) } finally { $generator.Dispose() }
    return [Convert]::ToBase64String($bytes)
}
$lines = @(
    "MYSQL_ROOT_PASSWORD=$(New-Password)"
    "MYSQL_PASSWORD=$(New-Password)"
    'GATEWAY_PORT=8080'
    'EUREKA_PORT=8760'
    'REPLICA_A_PORT=8761'
    'REPLICA_B_PORT=8764'
)
[IO.File]::WriteAllLines($destination, $lines, (New-Object Text.UTF8Encoding $false))
Write-Output 'Creado demo-loadbalancer/.env con claves aleatorias locales (no se muestran).'
