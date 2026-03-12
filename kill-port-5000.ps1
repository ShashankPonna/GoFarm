# Kill all processes using port 5000
Write-Host "Checking for processes using port 5000..." -ForegroundColor Yellow

$processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    Write-Host "Found processes: $($processes -join ', ')" -ForegroundColor Cyan
    foreach($p in $processes) {
        try {
            Stop-Process -Id $p -Force -ErrorAction Stop
            Write-Host "✓ Killed process $p" -ForegroundColor Green
        } catch {
            Write-Host "✗ Could not kill process $p" -ForegroundColor Red
        }
    }
    Write-Host "`nPort 5000 is now free!" -ForegroundColor Green
} else {
    Write-Host "No processes found using port 5000" -ForegroundColor Green
}

Write-Host "`nYou can now start your server with: npm start" -ForegroundColor Cyan
