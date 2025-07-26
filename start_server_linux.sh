#!/bin/bash

echo "🌾 SRI LAKSHMI ENTERPRISES - Starting Server (Linux)"
echo "===================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Activate virtual environment
source venv/bin/activate

# Get local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo -e "${GREEN}🚀 Starting SRI LAKSHMI ENTERPRISES API Server...${NC}"
echo -e "${BLUE}🌐 Local access: http://localhost:5001${NC}"
echo -e "${BLUE}🌐 Network access: http://$LOCAL_IP:5001${NC}"
echo -e "${BLUE}🌐 Frontend: file://$(pwd)/frontend_simple/index.html${NC}"
echo ""
echo -e "${YELLOW}💡 To deploy to GitHub Pages:${NC}"
echo -e "${YELLOW}   1. Update docs/config.js with your IP: $LOCAL_IP${NC}"
echo -e "${YELLOW}   2. Follow the COMPLETE_SETUP_GUIDE.md${NC}"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the server
cd backend
python app.py
