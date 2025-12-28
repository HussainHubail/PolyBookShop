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
