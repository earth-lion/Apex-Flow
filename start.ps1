# ============================================================
#  ApexFlow — Start All Servers (Classic Setup)
#  الموقع:   http://localhost:8000  (Laravel — الرابط الرئيسي للمتصفح)
#  الأصول:   http://localhost:5173  (Vite — بيخدم الـ JS/CSS في الخلفية)
# ============================================================

$backendPath = "C:\xampp\htdocs\adham\ApexFlow\backend"

Write-Host ""
Write-Host "  ==========================================" -ForegroundColor DarkYellow
Write-Host "    ApexFlow ERP  —  Dev Launcher" -ForegroundColor Yellow
Write-Host "  ==========================================" -ForegroundColor DarkYellow
Write-Host ""

# Verify PHP
if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Host "  ERROR: PHP not found. Add XAMPP to PATH." -ForegroundColor Red; exit 1
}
# Verify Node
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  ERROR: Node.js not found in PATH." -ForegroundColor Red; exit 1
}

Set-Location $backendPath

# ── [0/3] Clear Laravel caches ──────────────────────────────
Write-Host "  [0/3] Clearing caches..." -ForegroundColor Gray
php artisan config:clear 2>&1 | Out-Null
php artisan cache:clear  2>&1 | Out-Null
php artisan route:clear  2>&1 | Out-Null
php artisan view:clear   2>&1 | Out-Null
Write-Host "        Done." -ForegroundColor Gray

# ── [1/3] Auto-seed guard ───────────────────────────────────
# Protects against php artisan test (RefreshDatabase) wiping MySQL data
Write-Host "  [1/3] Checking database integrity..." -ForegroundColor Gray
try {
    $tinkerResult = php artisan tinker --execute="echo App\Models\User::count();" 2>&1
    $userCount = ($tinkerResult | Select-String -Pattern '^\d+$').Matches.Value | Select-Object -First 1

    if (-not $userCount -or [int]$userCount -eq 0) {
        Write-Host "        WARNING: No users found — seeding database..." -ForegroundColor Yellow
        php artisan db:seed 2>&1 | Out-Null
        Write-Host "        OK: Database seeded." -ForegroundColor Green
        Write-Host "        Login: admin@apexflow.io  /  password" -ForegroundColor Cyan
    } else {
        Write-Host "        OK: $userCount user(s) found in database." -ForegroundColor Green
    }
} catch {
    Write-Host "        WARN: Could not verify DB. Ensure MySQL (XAMPP) is running." -ForegroundColor DarkYellow
}

# ── [2/3] Start Laravel backend (minimized window) ──────────
Write-Host "  [2/3] Starting Laravel  ->  http://localhost:8000" -ForegroundColor Green
$laravelJob = Start-Process powershell `
    -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; php artisan serve --host=127.0.0.1 --port=8000" `
    -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 3

# Auto-open browser
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 4
    Start-Process "http://localhost:8000"
} | Out-Null

# ── [3/3] Start Vite in foreground ──────────────────────────
Write-Host "  [3/3] Starting Vite    ->  http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "  **  Browser opens at : http://localhost:8000         **" -ForegroundColor Yellow
Write-Host "  **  Login            : admin@apexflow.io / password  **" -ForegroundColor DarkYellow
Write-Host "  Press Ctrl+C to stop all servers." -ForegroundColor DarkGray
Write-Host ""

npm run dev

# Cleanup on exit
if ($laravelJob -and !$laravelJob.HasExited) {
    Write-Host ""
    Write-Host "  Stopping Laravel (PID: $($laravelJob.Id))..." -ForegroundColor DarkYellow
    Stop-Process -Id $laravelJob.Id -Force -ErrorAction SilentlyContinue
}
Write-Host "  All servers stopped." -ForegroundColor Green
