#!/bin/bash

echo "🌾 SRI LAKSHMI ENTERPRISES - Linux Setup Script"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 is not installed${NC}"
    echo "Installing Python3..."
    sudo apt update
    sudo apt install -y python3 python3-pip python3-venv
fi

echo -e "${GREEN}✅ Python3 found${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Installing PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

echo -e "${GREEN}✅ PostgreSQL found${NC}"

# Create virtual environment
echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
python3 -m venv venv

# Activate virtual environment
echo -e "${YELLOW}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Install Python dependencies
echo -e "${YELLOW}📚 Installing Python dependencies...${NC}"
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your database password${NC}"
fi

# Get local IP address
echo -e "${YELLOW}🌐 Detecting local IP address...${NC}"
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo -e "${BLUE}📍 Your local IP address: $LOCAL_IP${NC}"

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your PostgreSQL password"
echo "2. Update frontend_simple/config.js with your IP: $LOCAL_IP"
echo "3. Run: ./setup_database_linux.sh"
echo "4. Run: ./start_server_linux.sh"
echo ""
