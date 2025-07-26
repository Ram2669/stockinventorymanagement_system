#!/bin/bash

echo "🌾 SRI LAKSHMI ENTERPRISES - Quick Start Script"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}📚 Installing Python dependencies...${NC}"
pip install -r requirements.txt > /dev/null 2>&1

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}Please run ./setup_database.sh first to set up the database${NC}"
    exit 1
fi

# Check if database is accessible
echo -e "${YELLOW}🔍 Checking database connection...${NC}"
cd backend
if python -c "from app import create_app; app, db, Stock, Sale = create_app(); app.app_context().push(); db.engine.execute('SELECT 1')" 2>/dev/null; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo -e "${YELLOW}Please check your PostgreSQL installation and .env configuration${NC}"
    exit 1
fi

# Get local IP address
echo -e "${YELLOW}🌐 Detecting local IP address...${NC}"
if command -v ipconfig &> /dev/null; then
    # Windows
    LOCAL_IP=$(ipconfig | grep "IPv4 Address" | head -1 | awk '{print $NF}')
elif command -v ifconfig &> /dev/null; then
    # Mac/Linux
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
else
    LOCAL_IP="localhost"
fi

echo -e "${BLUE}📍 Your local IP address: $LOCAL_IP${NC}"

# Start the server
echo -e "${GREEN}🚀 Starting SRI LAKSHMI ENTERPRISES API Server...${NC}"
echo -e "${BLUE}🌐 Local access: http://localhost:5000${NC}"
echo -e "${BLUE}🌐 Network access: http://$LOCAL_IP:5000${NC}"
echo -e "${BLUE}🌐 Frontend (local): file://$(pwd)/frontend_simple/index.html${NC}"
echo ""
echo -e "${YELLOW}💡 To deploy to GitHub Pages:${NC}"
echo -e "${YELLOW}   1. Update docs/config.js with your IP: $LOCAL_IP${NC}"
echo -e "${YELLOW}   2. Follow the DEPLOYMENT_GUIDE.md${NC}"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop the server${NC}"
echo ""

# Run the server
python run_server.py
