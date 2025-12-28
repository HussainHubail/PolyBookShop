#!/bin/bash

# PolyBookShop Complete Setup Script (Linux/macOS)
# This script installs all dependencies and sets up the project

echo "========================================"
echo "   PolyBookShop Setup Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}Node.js is installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}Node.js is not installed!${NC}"
    echo -e "${RED}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

# Check if npm is installed
echo -e "${YELLOW}Checking npm installation...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}npm is installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}npm is not installed!${NC}"
    exit 1
fi

echo ""
echo "========================================"
echo "   Installing Backend Dependencies"
echo "========================================"
echo ""

# Navigate to Backend directory
cd "$(dirname "$0")/Backend" || exit 1

# Install backend dependencies
echo -e "${YELLOW}Installing backend packages...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Backend dependencies installed successfully!${NC}"
else
    echo -e "${RED}Backend installation failed!${NC}"
    exit 1
fi

echo ""
echo "========================================"
echo "   Installing Frontend Dependencies"
echo "========================================"
echo ""

# Navigate to Frontend directory
cd "../Frontend" || exit 1

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend packages...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Frontend dependencies installed successfully!${NC}"
else
    echo -e "${RED}Frontend installation failed!${NC}"
    exit 1
fi

echo ""
echo "========================================"
echo "   Database Setup"
echo "========================================"
echo ""

# Navigate back to Backend for Prisma setup
cd "../Backend" || exit 1

# Check if .env file exists
if [ -f ".env" ]; then
    echo -e "${GREEN}.env file found${NC}"
    
    # Generate Prisma Client
    echo -e "${YELLOW}Generating Prisma Client...${NC}"
    npx prisma generate
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Prisma Client generated successfully!${NC}"
    else
        echo -e "${YELLOW}Prisma Client generation failed!${NC}"
    fi
    
    # Ask if user wants to run migrations
    echo ""
    read -p "Do you want to run database migrations? (y/n): " RUN_MIGRATIONS
    if [ "$RUN_MIGRATIONS" = "y" ] || [ "$RUN_MIGRATIONS" = "Y" ]; then
        echo -e "${YELLOW}Running database migrations...${NC}"
        npx prisma migrate deploy
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Database migrations completed successfully!${NC}"
        else
            echo -e "${YELLOW}Database migrations failed! Please check your DATABASE_URL in .env${NC}"
        fi
    fi
else
    echo -e "${YELLOW}.env file not found!${NC}"
    echo -e "${YELLOW}Please create a .env file in the Backend directory with the following variables:${NC}"
    echo ""
    echo "DATABASE_URL=your_postgresql_connection_string"
    echo "JWT_SECRET=your_jwt_secret_key"
    echo "JWT_EXPIRES_IN=7d"
    echo "PORT=5000"
    echo "NODE_ENV=development"
    echo "FRONTEND_URL=http://localhost:3000"
    echo ""
fi

echo ""
echo "========================================"
echo "   Setup Summary"
echo "========================================"
echo ""

echo -e "${GREEN}Backend dependencies installed${NC}"
echo -e "${GREEN}Frontend dependencies installed${NC}"
echo -e "${GREEN}Prisma Client generated${NC}"

echo ""
echo "========================================"
echo "   VS Code Extensions (Recommended)"
echo "========================================"
echo ""

echo -e "${YELLOW}Install these VS Code extensions for the best experience:${NC}"
echo ""
echo "1. Prisma (Prisma.prisma)"
echo "2. ESLint (dbaeumer.vscode-eslint)"
echo "3. Prettier (esbenp.prettier-vscode)"
echo "4. Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)"
echo "5. TypeScript Extension Pack (loiane.ts-extension-pack)"

echo ""
read -p "Do you want to install recommended VS Code extensions automatically? (y/n): " INSTALL_EXT
if [ "$INSTALL_EXT" = "y" ] || [ "$INSTALL_EXT" = "Y" ]; then
    echo ""
    echo -e "${YELLOW}Installing VS Code extensions...${NC}"
    
    code --install-extension Prisma.prisma
    code --install-extension dbaeumer.vscode-eslint
    code --install-extension esbenp.prettier-vscode
    code --install-extension bradlc.vscode-tailwindcss
    code --install-extension loiane.ts-extension-pack
    
    echo -e "${GREEN}VS Code extensions installed!${NC}"
fi

echo ""
echo "========================================"
echo "   Next Steps"
echo "========================================"
echo ""

echo "1. Configure your .env file in the Backend directory (if not done)"
echo "2. Run database migrations: cd Backend && npx prisma migrate deploy"
echo "3. Start the backend server: cd Backend && npm run dev"
echo "4. Start the frontend server: cd Frontend && npm run dev"
echo "5. Access the app at http://localhost:3000"

echo ""
echo "========================================"
echo "   Setup Complete!"
echo "========================================"
echo ""

# Return to root directory
cd "$(dirname "$0")" || exit 1

echo -e "${GREEN}Happy coding!${NC}"
echo ""
