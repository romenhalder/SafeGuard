# ============================================================
# SafeGuard - Local Development Startup Script (No Docker)
# Starts all 11 microservices in the correct order.
# Prerequisites: Java 17+, Maven 3.8+
# ============================================================
param(
    [switch]$SkipBuild,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$ROOT = $PSScriptRoot

# ── Color helpers ──────────────────────────────────────────
function Write-Header  { param($msg) Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Cyan
                               Write-Host "║  $msg" -ForegroundColor Cyan
                               Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan }
function Write-Step    { param($msg) Write-Host "  ▶ $msg" -ForegroundColor Yellow }
function Write-Ok      { param($msg) Write-Host "  ✔ $msg" -ForegroundColor Green }
function Write-Fail    { param($msg) Write-Host "  ✘ $msg" -ForegroundColor Red }
function Write-Info    { param($msg) Write-Host "  ℹ $msg" -ForegroundColor DarkGray }

# ── Load .env ─────────────────────────────────────────────
Write-Header "SafeGuard Local Startup"
Write-Step "Loading .env ..."
$envFile = Join-Path $ROOT ".env"
if (-not (Test-Path $envFile)) { Write-Fail ".env not found at $envFile"; exit 1 }

$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*([^#=\s]+)\s*=\s*(.*)$") {
        $envVars[$Matches[1]] = $Matches[2].Trim('"')
        [System.Environment]::SetEnvironmentVariable($Matches[1], $Matches[2].Trim('"'), "Process")
    }
}
Write-Ok "Environment loaded ($($envVars.Count) vars)"

# ── Build ─────────────────────────────────────────────────
if (-not $SkipBuild) {
    Write-Step "Building all modules (this may take 2-4 minutes) ..."
    $buildResult = & mvn clean install -DskipTests -f "$ROOT\pom.xml" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Build failed! Check output above."
        if ($Verbose) { $buildResult | Write-Host }
        exit 1
    }
    Write-Ok "Build successful"
} else {
    Write-Info "Skipping build (-SkipBuild flag set)"
}

# ── Service definitions (startup order matters) ───────────
$services = @(
    @{ Name="service-registry"; Jar="services\service-registry\target\service-registry-*.jar"; Port=8761; Health="http://localhost:8761/actuator/health"; WaitSec=20 },
    @{ Name="config-server";    Jar="services\config-server\target\config-server-*.jar";       Port=8888; Health="http://localhost:8888/actuator/health"; WaitSec=15 },
    @{ Name="auth-service";     Jar="services\auth-service\target\auth-service-*.jar";         Port=8081; Health="http://localhost:8081/actuator/health"; WaitSec=25 },
    @{ Name="user-service";     Jar="services\user-service\target\user-service-*.jar";         Port=8082; Health="http://localhost:8082/actuator/health"; WaitSec=20 },
    @{ Name="alert-service";    Jar="services\alert-service\target\alert-service-*.jar";       Port=8083; Health="http://localhost:8083/actuator/health"; WaitSec=20 },
    @{ Name="location-service"; Jar="services\location-service\target\location-service-*.jar"; Port=8084; Health="http://localhost:8084/actuator/health"; WaitSec=20 },
    @{ Name="incident-service"; Jar="services\incident-service\target\incident-service-*.jar"; Port=8085; Health="http://localhost:8085/actuator/health"; WaitSec=20 },
    @{ Name="admin-service";    Jar="services\admin-service\target\admin-service-*.jar";       Port=8086; Health="http://localhost:8086/actuator/health"; WaitSec=20 },
    @{ Name="notification-service"; Jar="services\notification-service\target\notification-service-*.jar"; Port=8087; Health="http://localhost:8087/actuator/health"; WaitSec=20 },
    @{ Name="analytics-service"; Jar="services\analytics-service\target\analytics-service-*.jar"; Port=8088; Health="http://localhost:8088/actuator/health"; WaitSec=20 },
    @{ Name="api-gateway";      Jar="services\api-gateway\target\api-gateway-*.jar";           Port=8080; Health="http://localhost:8080/actuator/health"; WaitSec=20 }
)

# Store PIDs
$pids = @{}

# ── Wait-for-health helper ────────────────────────────────
function Wait-ForHealth {
    param([string]$url, [int]$maxSec = 60)
    $elapsed = 0
    while ($elapsed -lt $maxSec) {
        try {
            $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
            if ($resp.StatusCode -eq 200) { return $true }
        } catch { }
        Start-Sleep -Seconds 3
        $elapsed += 3
        Write-Host "." -NoNewline -ForegroundColor DarkGray
    }
    return $false
}

# ── Start each service ────────────────────────────────────
Write-Header "Starting Services"

$jvmOpts = @(
    "-Xms128m", "-Xmx512m",
    "-Dspring.profiles.active=local",
    "-Dspring.cloud.vault.enabled=false",
    "-DPOSTGRES_JDBC_URL=$($envVars['POSTGRES_JDBC_URL'])",
    "-DPOSTGRES_USER=$($envVars['POSTGRES_USER'])",
    "-DPOSTGRES_PASSWORD=$($envVars['POSTGRES_PASSWORD'])",
    "-DREDIS_URL=$($envVars['REDIS_URL'])",
    "-DREDIS_SSL_ENABLED=$($envVars['REDIS_SSL_ENABLED'])",
    "-DMONGO_URI=$($envVars['MONGO_URI'])",
    "-DJWT_SECRET=$($envVars['JWT_SECRET'])",
    "-DJWT_EXPIRATION=$($envVars['JWT_EXPIRATION'])",
    "-DJWT_REFRESH_EXPIRATION=$($envVars['JWT_REFRESH_EXPIRATION'])",
    "-DEUREKA_CLIENT_SERVICEURL_DEFAULTZONE=$($envVars['EUREKA_CLIENT_SERVICEURL_DEFAULTZONE'])",
    "-DSPRING_CLOUD_CONFIG_URI=$($envVars['SPRING_CLOUD_CONFIG_URI'])",
    "-DREDIS_STREAM_SOS_ALERTS=$($envVars['REDIS_STREAM_SOS_ALERTS'])",
    "-DREDIS_STREAM_GPS_UPDATES=$($envVars['REDIS_STREAM_GPS_UPDATES'])",
    "-DREDIS_STREAM_NOTIFICATIONS=$($envVars['REDIS_STREAM_NOTIFICATIONS'])",
    "-DFCM_ENABLED=false"
)

$logDir = Join-Path $ROOT "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

foreach ($svc in $services) {
    Write-Step "Starting $($svc.Name) on port $($svc.Port) ..."

    # Resolve jar
    $jarPattern = Join-Path $ROOT $svc.Jar
    $jarFile = Get-Item $jarPattern -ErrorAction SilentlyContinue | Select-Object -Last 1
    if (-not $jarFile) {
        Write-Fail "JAR not found: $jarPattern — did build fail?"
        exit 1
    }

    $logFile = Join-Path $logDir "$($svc.Name).log"
    $jvmArgs  = $jvmOpts + @("-jar", $jarFile.FullName)

    $proc = Start-Process "java" -ArgumentList $jvmArgs `
        -RedirectStandardOutput $logFile `
        -RedirectStandardError  "$logFile.err" `
        -NoNewWindow -PassThru
    $pids[$svc.Name] = $proc.Id

    Write-Info "  PID $($proc.Id) — log: logs\$($svc.Name).log"
    Write-Host "  Waiting for health" -NoNewline -ForegroundColor DarkGray
    $healthy = Wait-ForHealth -url $svc.Health -maxSec ($svc.WaitSec * 3)
    Write-Host ""

    if ($healthy) {
        Write-Ok "$($svc.Name) is UP"
    } else {
        Write-Fail "$($svc.Name) did not become healthy in time. Check logs\$($svc.Name).log"
        Write-Info "Continuing anyway — other services may still start ..."
    }
}

# ── Summary ──────────────────────────────────────────────
Write-Header "Startup Complete"
Write-Host ""
Write-Host "  Service          Port   PID" -ForegroundColor White
Write-Host "  ─────────────────────────────────" -ForegroundColor DarkGray
foreach ($svc in $services) {
    $pid = $pids[$svc.Name]
    Write-Host ("  {0,-25} {1,-7} {2}" -f $svc.Name, $svc.Port, $pid) -ForegroundColor Green
}
Write-Host ""
Write-Host "  🌐  Eureka Dashboard  → http://localhost:8761" -ForegroundColor Cyan
Write-Host "  🚪  API Gateway       → http://localhost:8080" -ForegroundColor Cyan
Write-Host "  🔐  Auth Service      → http://localhost:8081/api/auth/" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Run .\stop-local.ps1 to stop all services." -ForegroundColor Yellow

# Save PIDs to file for stop script
$pids | ConvertTo-Json | Set-Content (Join-Path $ROOT ".running-pids.json")
