# PolyBookShop - Development Server Startup Script
# Starts both Backend and Frontend servers concurrently

Write-Host "Starting PolyBookShop Development Servers..." -ForegroundColor Cyan
Write-Host ""

# Get the project root directory (parent of "Setup + Start" folder)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Check Backend .env
$backendEnv = Join-Path $rootDir "Backend/.env"
$backendEnvExample = Join-Path $rootDir "Backend/.env.example"
if (-not (Test-Path $backendEnv)) {
    if (Test-Path $backendEnvExample) {
        Copy-Item $backendEnvExample $backendEnv -Force
        Write-Host "Backend/.env was missing. Created from Backend/.env.example. Set DATABASE_URL and other secrets, then rerun." -ForegroundColor Yellow
    } else {
        Write-Host "Backend/.env is missing and Backend/.env.example not found." -ForegroundColor Red
    }
    exit 1
}

# Parse DATABASE_URL for connectivity check
$dbLine = Get-Content $backendEnv | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
if (-not $dbLine) {
    Write-Host "DATABASE_URL not found in Backend/.env." -ForegroundColor Red
    exit 1
}
$dbUrl = $dbLine -replace '^DATABASE_URL="?','' -replace '"?$',''
$dbHost = $null
$dbPort = 5432
try {
    $uri = [System.Uri]::new($dbUrl)
    $dbHost = $uri.Host
    if ($uri.Port -gt 0) { $dbPort = $uri.Port }
} catch {
    Write-Host "Could not parse DATABASE_URL. Check Backend/.env." -ForegroundColor Yellow
}

# Check if dependencies are installed
$backendNodeModules = Join-Path $rootDir "Backend\node_modules"
$frontendNodeModules = Join-Path $rootDir "Frontend\node_modules"

if (-not (Test-Path $backendNodeModules)) {
    Write-Host "Backend dependencies not found. Installing..." -ForegroundColor Yellow
    Set-Location (Join-Path $rootDir "Backend")
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Backend dependency installation failed!" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path $frontendNodeModules)) {
    Write-Host "Frontend dependencies not found. Installing..." -ForegroundColor Yellow
    Set-Location (Join-Path $rootDir "Frontend")
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Frontend dependency installation failed!" -ForegroundColor Red
        exit 1
    }
}

# Verify database connectivity (best-effort)
if ($dbHost) {
    Write-Host "Checking database connectivity to ${dbHost}:${dbPort} ..." -ForegroundColor Yellow
    $dbCheck = Test-NetConnection -ComputerName $dbHost -Port $dbPort -WarningAction SilentlyContinue
    if (-not $dbCheck.TcpTestSucceeded) {
        Write-Host "Cannot reach database at ${dbHost}:${dbPort}. Start Postgres or update DATABASE_URL." -ForegroundColor Red
        exit 1
    }
    Write-Host "Database port reachable." -ForegroundColor Green
}

# Generate Prisma Client
Write-Host ""
Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
Set-Location (Join-Path $rootDir "Backend")
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma Client generation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Prisma Client generated successfully!" -ForegroundColor Green

# Apply migrations (deploy) to ensure schema exists
Write-Host "Applying Prisma migrations (deploy)..." -ForegroundColor Yellow
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma migrations failed! Check DATABASE_URL and Postgres." -ForegroundColor Red
    exit 1
}
Write-Host "Prisma migrations applied." -ForegroundColor Green

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Backend Server  -> http://localhost:5000" -ForegroundColor Green
Write-Host "  Frontend Server -> http://localhost:3000" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Start Backend server in background
$backendPath = Join-Path $rootDir "Backend"
Write-Host "Starting Backend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server Running' -ForegroundColor Green; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend server in background
$frontendPath = Join-Path $rootDir "Frontend"
Write-Host "Starting Frontend server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Server Running' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "Both servers are starting up..." -ForegroundColor Green
Write-Host ""
Write-Host "Note: Two new PowerShell windows will open for Backend and Frontend" -ForegroundColor Yellow
Write-Host "Close those windows to stop the servers" -ForegroundColor Yellow
Write-Host ""
