# PolyBookShop Complete Setup Script
# This script installs all dependencies and sets up the project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PolyBookShop Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Installing Backend Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to Backend directory
Set-Location -Path "$PSScriptRoot\..\Backend"

# Install backend dependencies
Write-Host "Installing backend packages..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Backend installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Installing Frontend Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to Frontend directory
Set-Location -Path "$PSScriptRoot\..\Frontend"

# Install frontend dependencies
Write-Host "Installing frontend packages..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Frontend installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate back to Backend for Prisma setup
Set-Location -Path "$PSScriptRoot\..\Backend"

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host ".env file found" -ForegroundColor Green
    
    # Generate Prisma Client
    Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
    npx prisma generate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Prisma Client generated successfully!" -ForegroundColor Green
    } else {
        Write-Host "Prisma Client generation failed!" -ForegroundColor Yellow
    }
    
    # Ask if user wants to run migrations
    Write-Host ""
    $runMigrations = Read-Host "Do you want to run database migrations? (y/n)"
    if ($runMigrations -eq "y" -or $runMigrations -eq "Y") {
        Write-Host "Running database migrations..." -ForegroundColor Yellow
        npx prisma migrate deploy
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database migrations completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "Database migrations failed! Please check your DATABASE_URL in .env" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host ".env file not found!" -ForegroundColor Yellow
    Write-Host "Please create a .env file in the Backend directory with the following variables:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "DATABASE_URL=your_postgresql_connection_string" -ForegroundColor White
    Write-Host "JWT_SECRET=your_jwt_secret_key" -ForegroundColor White
    Write-Host "JWT_EXPIRES_IN=7d" -ForegroundColor White
    Write-Host "PORT=5000" -ForegroundColor White
    Write-Host "NODE_ENV=development" -ForegroundColor White
    Write-Host "FRONTEND_URL=http://localhost:3000" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Setup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Backend dependencies installed" -ForegroundColor Green
Write-Host "Frontend dependencies installed" -ForegroundColor Green
Write-Host "Prisma Client generated" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   VS Code Extensions (Recommended)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Install these VS Code extensions for the best experience:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Prisma (Prisma.prisma)" -ForegroundColor White
Write-Host "2. ESLint (dbaeumer.vscode-eslint)" -ForegroundColor White
Write-Host "3. Prettier (esbenp.prettier-vscode)" -ForegroundColor White
Write-Host "4. Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)" -ForegroundColor White
Write-Host "5. TypeScript Extension Pack (loiane.ts-extension-pack)" -ForegroundColor White

Write-Host ""
$installExtensions = Read-Host "Do you want to install recommended VS Code extensions automatically? (y/n)"
if ($installExtensions -eq "y" -or $installExtensions -eq "Y") {
    Write-Host ""
    Write-Host "Installing VS Code extensions..." -ForegroundColor Yellow
    
    code --install-extension Prisma.prisma
    code --install-extension dbaeumer.vscode-eslint
    code --install-extension esbenp.prettier-vscode
    code --install-extension bradlc.vscode-tailwindcss
    code --install-extension loiane.ts-extension-pack
    
    Write-Host "VS Code extensions installed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Configure your .env file in the Backend directory (if not done)" -ForegroundColor White
Write-Host "2. Run database migrations: cd Backend; npx prisma migrate deploy" -ForegroundColor White
Write-Host "3. Start the backend server: cd Backend; npm run dev" -ForegroundColor White
Write-Host "4. Start the frontend server: cd Frontend; npm run dev" -ForegroundColor White
Write-Host "5. Access the app at http://localhost:3000" -ForegroundColor White

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Return to root directory
Set-Location -Path $PSScriptRoot

Write-Host "Happy coding!" -ForegroundColor Green
Write-Host ""
