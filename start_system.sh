#!/bin/bash

echo "🚀 Starting SRI LAKSHMI ENTERPRISES Stock Management System..."
echo "=================================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Start backend server in background
echo "🖥️  Starting backend server..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Test backend connection
echo "🔍 Testing backend connection..."
if curl -s http://localhost:5000/ > /dev/null; then
    echo "✅ Backend is running successfully!"
else
    echo "❌ Backend failed to start!"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Open frontend in browser
echo "🌐 Opening frontend in browser..."
if command -v open > /dev/null; then
    open "file://$(pwd)/frontend_simple/index.html"
elif command -v xdg-open > /dev/null; then
    xdg-open "file://$(pwd)/frontend_simple/index.html"
else
    echo "Please open this URL in your browser:"
    echo "file://$(pwd)/frontend_simple/index.html"
fi

echo ""
echo "🎉 System started successfully!"
echo "=================================================="
echo "📊 Backend API: http://localhost:5000"
echo "🖼️  Frontend: file://$(pwd)/frontend_simple/index.html"
echo ""
echo "📋 Available Features:"
echo "   • Stock Management (Add/View stock items)"
echo "   • Sales Recording (Record sales with automatic stock deduction)"
echo "   • Dashboard (Overview and analytics)"
echo "   • PDF Reports (Weekly reports by customer and date)"
echo ""
echo "🛑 Press Ctrl+C to stop the system"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping system..."
    kill $BACKEND_PID 2>/dev/null
    echo "✅ System stopped successfully!"
    exit
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for user to stop
wait
