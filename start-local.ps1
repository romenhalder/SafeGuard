param(
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$ROOT = $PSScriptRoot

function Write-Header { param($msg)
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
}
function Write-Step { param($msg) Write-Host "  >> $msg" -ForegroundColor Yellow }
function Write-Ok   { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Fail { param($msg) Write-Host "  [FAIL] $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "  [..] $msg" -ForegroundColor DarkGray }

Write-Header "SafeGuard Local Startup"

# ── Java 21 resolution ──────────────────────────────────────────────
$candidates = @()
if ($env:JAVA21_HOME) { $candidates += $env:JAVA21_HOME }
foreach ($jdkRoot in @("C:\Program Files\Java", "C:\Program Files\Eclipse Adoptium", "C:\Program Files\Zulu", "C:\Program Files\Microsoft")) {
    if (Test-Path -LiteralPath $jdkRoot) {
        $candidates += Get-ChildItem -LiteralPath $jdkRoot -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match "jdk-*21" } |
            ForEach-Object { $_.FullName }
    }
}
# only use JAVA_HOME as a fallback (it may point at JDK 17)
if ($env:JAVA_HOME) { $candidates += $env:JAVA_HOME }

$javaBin = $null
foreach ($c in $candidates) {
    if (-not $c) { continue }
    $f = Join-Path $c "bin\java.exe"
    if (Test-Path -LiteralPath $f) { $javaBin = $f; break }
}
if (-not $javaBin) { Write-Fail "Java 21 not found. Set JAVA21_HOME or JAVA_HOME to a JDK 21 install."; exit 1 }
$oldEAP = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$javaVer = (& $javaBin -version 2>&1 | Select-Object -First 1)
$ErrorActionPreference = $oldEAP
if ($javaVer -notmatch "21|22|23|24") { Write-Fail "Resolved Java is not 21+: $javaVer ($javaBin)"; exit 1 }
$env:JAVA_HOME = Split-Path (Split-Path $javaBin)
Write-Ok "Using Java: $javaVer ($javaBin)"

# ── .env loading ────────────────────────────────────────────────────
$envFile = Join-Path $ROOT ".env"
if (-not (Test-Path $envFile)) { Write-Fail ".env not found"; exit 1 }

Write-Step "Loading .env ..."
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match "^\s*([^#=\s]+)\s*=\s*(.*)$") {
        $k = $Matches[1]; $v = $Matches[2].Trim('"')
        $envVars[$k] = $v
        [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
    }
}
Write-Ok "Environment loaded ($($envVars.Count) vars)"

# ── Cleanup stale SafeGuard processes (prevents jar file-lock on clean) ──
Write-Step "Stopping any running SafeGuard services ..."
$jarDir = Join-Path $ROOT "services"
$stale = Get-CimInstance Win32_Process -Filter "Name='java.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine -match [regex]::Escape($ROOT) -and $_.CommandLine -match "safeguard.*\.jar" }
$pidFile = Join-Path $ROOT "pids.json"
if (Test-Path $pidFile) {
    try { $pidData = Get-Content $pidFile -Raw | ConvertFrom-Json } catch { $pidData = $null }
    if ($pidData) {
        foreach ($p in $pidData.PSObject.Properties) {
            if ($stale -and ($stale.ProcessId -contains [int]$p.Value)) { continue }
            if (Get-Process -Id ([int]$p.Value) -ErrorAction SilentlyContinue) { $stale += [pscustomobject]@{ProcessId=[int]$p.Value} }
        }
    }
}
foreach ($p in $stale) {
    try { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue; Write-Info "Stopped stale PID $($p.ProcessId)" } catch { }
}
if (Test-Path $pidFile) { Remove-Item $pidFile -Force -ErrorAction SilentlyContinue }
Write-Ok "Cleanup done ($($stale.Count) process(es) handled)"

# ── Build (optional) ────────────────────────────────────────────────
if (-not $SkipBuild) {
    Write-Step "Building all modules ..."
    $envm = $envVars
    $mvnProc = Start-Process "mvn" -ArgumentList "clean","install","-DskipTests","--no-transfer-progress","-f","`"$ROOT\pom.xml`"" -NoNewWindow -PassThru -Wait
    if ($mvnProc.ExitCode -ne 0) { Write-Fail "Build failed!"; exit 1 }
    Write-Ok "Build complete"
} else {
    Write-Info "Skipping build"
}

$services = @(
    @{ Name="service-registry";     Jar="services\service-registry\target\service-registry-*.jar";         Port=8761; Health="http://localhost:8761/actuator/health"; MaxWait=90 },
    @{ Name="config-server";        Jar="services\config-server\target\config-server-*.jar";               Port=8888; Health="http://localhost:8888/actuator/health"; MaxWait=60 },
    @{ Name="auth-service";         Jar="services\auth-service\target\auth-service-*.jar";                 Port=8081; Health="http://localhost:8081/actuator/health"; MaxWait=90 },
    @{ Name="user-service";         Jar="services\user-service\target\user-service-*.jar";                 Port=8082; Health="http://localhost:8082/actuator/health"; MaxWait=60 },
    @{ Name="alert-service";        Jar="services\alert-service\target\alert-service-*.jar";               Port=8083; Health="http://localhost:8083/actuator/health"; MaxWait=60 },
    @{ Name="location-service";     Jar="services\location-service\target\location-service-*.jar";         Port=8084; Health="http://localhost:8084/actuator/health"; MaxWait=60 },
    @{ Name="incident-service";     Jar="services\incident-service\target\incident-service-*.jar";         Port=8085; Health="http://localhost:8085/actuator/health"; MaxWait=60 },
    @{ Name="admin-service";        Jar="services\admin-service\target\admin-service-*.jar";               Port=8086; Health="http://localhost:8086/actuator/health"; MaxWait=60 },
    @{ Name="notification-service"; Jar="services\notification-service\target\notification-service-*.jar"; Port=8087; Health="http://localhost:8087/actuator/health"; MaxWait=60 },
    @{ Name="analytics-service";    Jar="services\analytics-service\target\analytics-service-*.jar";       Port=8088; Health="http://localhost:8088/actuator/health"; MaxWait=60 },
    @{ Name="api-gateway";          Jar="services\api-gateway\target\api-gateway-*.jar";                   Port=8080; Health="http://localhost:8080/actuator/health"; MaxWait=60 }
)

function Wait-ForHealth {
    param([string]$url, [int]$maxSec)
    $elapsed = 0
    while ($elapsed -lt $maxSec) {
        try {
            $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
            if ($r.StatusCode -eq 200) { return $true }
        } catch { }
        Start-Sleep -Seconds 3; $elapsed += 3
        Write-Host "." -NoNewline -ForegroundColor DarkGray
    }
    return $false
}

function Test-PortInUse {
    param([int]$port)
    $conn = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) { return $conn[0].OwningProcess } else { return $null }
}

$logDir = Join-Path $ROOT "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

function Get-JvmJavaArgs {
    param([string]$jarPath, [string]$SpringProfile = "local")
    $pg = $envVars['POSTGRES_JDBC_URL']
    $pu = $envVars['POSTGRES_USER']
    $pp = $envVars['POSTGRES_PASSWORD']
    $ru = $envVars['REDIS_URL']
    $mu = $envVars['MONGO_URI']
    $js = $envVars['JWT_SECRET']
    $je = $envVars['JWT_EXPIRATION']
    $jr = $envVars['JWT_REFRESH_EXPIRATION']
    $eu = $envVars['EUREKA_CLIENT_SERVICEURL_DEFAULTZONE']
    $cu = $envVars['SPRING_CLOUD_CONFIG_URI']
    $s1 = $envVars['REDIS_STREAM_SOS_ALERTS']
    $s2 = $envVars['REDIS_STREAM_GPS_UPDATES']
    $s3 = $envVars['REDIS_STREAM_NOTIFICATIONS']

    $jvmArgs = @(
        "-Xms128m","-Xmx512m",
        "-Dspring.profiles.active=$SpringProfile",
        "-Dspring.cloud.vault.enabled=false",
        "-DFCM_ENABLED=false"
    )
    if ($pg) { $jvmArgs += "-DPOSTGRES_JDBC_URL=`"$pg`"" }
    if ($pu) { $jvmArgs += "-DPOSTGRES_USER=`"$pu`"" }
    if ($pp) { $jvmArgs += "-DPOSTGRES_PASSWORD=`"$pp`"" }
    if ($ru) { $jvmArgs += "-DREDIS_URL=`"$ru`"" }
    if ($mu) { $jvmArgs += "-DMONGO_URI=`"$mu`"" }
    if ($js) { $jvmArgs += "-Dapp.jwt.secret=`"$js`"" }
    if ($je) { $jvmArgs += "-Dapp.jwt.expiration=$je" }
    if ($jr) { $jvmArgs += "-Dapp.jwt.refresh-expiration=$jr" }
    if ($eu) { $jvmArgs += "-DEUREKA_CLIENT_SERVICEURL_DEFAULTZONE=`"$eu`"" }
    if ($cu) { $jvmArgs += "-DSPRING_CLOUD_CONFIG_URI=`"$cu`"" }
    if ($s1) { $jvmArgs += "-DREDIS_STREAM_SOS_ALERTS=$s1" }
    if ($s2) { $jvmArgs += "-DREDIS_STREAM_GPS_UPDATES=$s2" }
    if ($s3) { $jvmArgs += "-DREDIS_STREAM_NOTIFICATIONS=$s3" }
    
    $jvmArgs += "-jar"
    $jvmArgs += "`"$jarPath`""
    return $jvmArgs
}

Write-Header "Starting Services"
$pidMap = @{}

foreach ($svc in $services) {
    Write-Step "Starting $($svc.Name) on port $($svc.Port)"

    # port pre-check
    $holder = Test-PortInUse -Port $svc.Port
    if ($holder) {
        $hp = Get-Process -Id $holder -ErrorAction SilentlyContinue
        Write-Fail "Port $($svc.Port) already in use by PID $holder ($(if($hp){$hp.ProcessName}else{'unknown'})) - stop it and re-run"
        exit 1
    }

    $jarPattern = Join-Path $ROOT $svc.Jar
    $jarFile = Get-Item $jarPattern -ErrorAction SilentlyContinue | Select-Object -Last 1
    if (-not $jarFile) { Write-Fail "JAR not found: $jarPattern - run without -SkipBuild"; exit 1 }

    $logFile = Join-Path $logDir "$($svc.Name).log"
    $errFile = Join-Path $logDir "$($svc.Name).err.log"

    $javaArgs = Get-JvmJavaArgs -jarPath $jarFile.FullName -SpringProfile $(if ($svc.Name -eq "config-server") { "native" } else { "local" })
    $proc = Start-Process -FilePath $javaBin -ArgumentList $javaArgs -RedirectStandardOutput $logFile -RedirectStandardError $errFile -WindowStyle Hidden -PassThru
    $pidMap[$svc.Name] = $proc.Id
    Write-Info "PID $($proc.Id) | log: logs\$($svc.Name).log"

    Write-Host "  Waiting for health" -NoNewline -ForegroundColor DarkGray
    $ok = Wait-ForHealth -url $svc.Health -maxSec $svc.MaxWait
    Write-Host ""

    if ($ok) { Write-Ok "$($svc.Name) UP" }
    else { Write-Fail "$($svc.Name) timed out - check logs\$($svc.Name).log" }
}

Write-Header "All Services Started"
Write-Host ""
Write-Host "  Eureka   -> http://localhost:8761" -ForegroundColor Cyan
Write-Host "  Gateway  -> http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Auth     -> http://localhost:8081/api/auth/" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Run .\stop-local.ps1 to stop." -ForegroundColor Yellow
Write-Host ""

$pidFile = Join-Path $ROOT "pids.json"
$pidMap | ConvertTo-Json | Out-File -FilePath $pidFile -Encoding ascii
Write-Ok "PIDs saved to pids.json"