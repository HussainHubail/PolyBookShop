#!/bin/bash
# PolyBookShop - Development Server Startup Script (Linux/macOS)
# Starts both Backend and Frontend servers concurrently

echo -e "\033[36mStarting PolyBookShop Development Servers...\033[0m"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "\033[31mNode.js is not installed!\033[0m"
    echo -e "\033[33mPlease install Node.js from https://nodejs.org\033[0m"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "\033[32mNode.js detected: $NODE_VERSION\033[0m"

# Check if dependencies are installed
if [ ! -d "$SCRIPT_DIR/Backend/node_modules" ]; then
    echo -e "\033[33mBackend dependencies not found. Installing...\033[0m"
    cd "$SCRIPT_DIR/Backend"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "\033[31mBackend dependency installation failed!\033[0m"
        exit 1
    fi
fi

if [ ! -d "$SCRIPT_DIR/Frontend/node_modules" ]; then
    echo -e "\033[33mFrontend dependencies not found. Installing...\033[0m"
    cd "$SCRIPT_DIR/Frontend"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "\033[31mFrontend dependency installation failed!\033[0m"
        exit 1
    fi
fi

echo ""
echo -e "\033[36m========================================================\033[0m"
echo -e "\033[32m  Backend Server  -> http://localhost:5000\033[0m"
echo -e "\033[32m  Frontend Server -> http://localhost:3000\033[0m"
echo -e "\033[36m========================================================\033[0m"
echo ""
echo -e "\033[33mPress Ctrl+C to stop all servers\033[0m"
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo -e "\033[33mStopping servers...\033[0m"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "\033[32mAll servers stopped\033[0m"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend server
echo -e "\033[36mStarting Backend server...\033[0m"
cd "$SCRIPT_DIR/Backend"
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start Frontend server
echo -e "\033[36mStarting Frontend server...\033[0m"
cd "$SCRIPT_DIR/Frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "\033[32mBoth servers are running\033[0m"
echo -e "\033[33m  Backend PID: $BACKEND_PID\033[0m"
echo -e "\033[33m  Frontend PID: $FRONTEND_PID\033[0m"
echo ""

# Wait for processes
wait
