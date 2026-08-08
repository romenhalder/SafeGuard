$ErrorActionPreference = "Continue"
$ROOT = $PSScriptRoot
$pidFile = Join-Path $ROOT "pids.json"

function Write-Ok   { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "  [..] $msg" -ForegroundColor DarkGray }
function Write-Warn { param($msg) Write-Host "  [!!] $msg" -ForegroundColor Yellow }

Write-Host ""
Write-Host "================================================" -ForegroundColor Red
Write-Host "  SafeGuard -- Stopping All Services" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red
Write-Host ""

# Kill only SafeGuard java processes (those whose cmdline points at this project's target jars)
$javaProcs = Get-CimInstance Win32_Process -Filter "Name='java.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine -match [regex]::Escape($ROOT) -and $_.CommandLine -match "safeguard.*\.jar" }

$killed = @()
foreach ($p in $javaProcs) {
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    $killed += $p.ProcessId
}

# Also honor pids.json (real java PIDs written by start-local.ps1)
if (Test-Path $pidFile) {
    try { $pidData = Get-Content $pidFile -Raw | ConvertFrom-Json } catch { $pidData = $null }
    if ($pidData) {
        foreach ($name in $pidData.PSObject.Properties.Name) {
            $id = [int]$pidData.$name
            if ($killed -contains $id) { continue }
            if (Get-Process -Id $id -ErrorAction SilentlyContinue) {
                Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
                $killed += $id
                Write-Ok "Stopped $name (PID $id)"
            } else {
                Write-Info "$name (PID $id) already stopped"
            }
        }
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

if ($killed.Count -eq 0) { Write-Info "No running SafeGuard java processes found." }
else { Write-Ok "Stopped $($killed.Count) SafeGuard java process(es)." }

# Optional: sweep any orphaned PIDs still listening on SafeGuard ports
$ports = 8080..8088 + 8761 + 8888
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $pid = $conn[0].OwningProcess
        $procName = (Get-Process -Id $pid -ErrorAction SilentlyContinue).ProcessName
        if ($procName -eq "java") {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Ok "Freed port $port (PID $pid)"
        }
    }
}

Write-Host ""