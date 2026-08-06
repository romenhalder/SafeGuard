# ============================================================
# SafeGuard - Stop All Local Services
# ============================================================
$ROOT = $PSScriptRoot
$pidFile = Join-Path $ROOT ".running-pids.json"

function Write-Ok   { param($msg) Write-Host "  ✔ $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "  ℹ $msg" -ForegroundColor DarkGray }
function Write-Warn { param($msg) Write-Host "  ⚠ $msg" -ForegroundColor Yellow }

Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║  SafeGuard — Stopping All Services  ║" -ForegroundColor Red
Write-Host "╚══════════════════════════════════════╝`n" -ForegroundColor Red

if (Test-Path $pidFile) {
    $pids = Get-Content $pidFile | ConvertFrom-Json
    foreach ($name in $pids.PSObject.Properties.Name) {
        $pid = $pids.$name
        try {
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc) {
                Stop-Process -Id $pid -Force
                Write-Ok "Stopped $name (PID $pid)"
            } else {
                Write-Info "$name (PID $pid) was already stopped"
            }
        } catch {
            Write-Warn "Could not stop $name (PID $pid): $_"
        }
    }
    Remove-Item $pidFile -Force
} else {
    Write-Warn "No .running-pids.json found — trying to kill any SafeGuard JVM processes ..."
    $javaProcs = Get-Process java -ErrorAction SilentlyContinue
    if ($javaProcs) {
        $javaProcs | Stop-Process -Force
        Write-Ok "Stopped $($javaProcs.Count) java process(es)"
    } else {
        Write-Info "No java processes found"
    }
}

Write-Host "`n  All SafeGuard services stopped.`n" -ForegroundColor Green
