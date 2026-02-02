#!/bin/bash
# Quick start script for Bandcamper

echo "🎵 Starting Bandcamper..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Start backend
echo ""
echo "📦 Starting backend server..."
cd backend
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend in a new terminal (macOS)
echo "🎨 Starting frontend..."
cd ../frontend
npm install > /dev/null 2>&1

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open -a Terminal "$(pwd)" --args "npm run dev"
else
    # Linux
    echo "Run this in another terminal: cd frontend && npm run dev"
fi

echo ""
echo "✨ Bandcamper is starting!"
echo ""
echo "📍 Frontend: http://localhost:5173"
echo "📍 Backend: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Keep the script running
wait
