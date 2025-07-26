#!/bin/bash

echo "🌾 SRI LAKSHMI ENTERPRISES - Database Setup (Linux)"
echo "==================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="sri_lakshmi_db"
DB_USER="sri_lakshmi_user"
DB_PASSWORD="your_secure_password"

echo -e "${YELLOW}📝 Setting up database: $DB_NAME${NC}"
echo -e "${YELLOW}📝 Creating user: $DB_USER${NC}"

# Create user and database
echo -e "${YELLOW}🔐 Setting up PostgreSQL user and database...${NC}"

sudo -u postgres psql << EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

# Test database connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful!${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "Please check your PostgreSQL installation and credentials"
    exit 1
fi

# Initialize database
echo -e "${YELLOW}🌱 Initializing database with sample data...${NC}"
source venv/bin/activate
cd backend
python init_db.py
cd ..

echo ""
echo -e "${GREEN}🎉 Database setup complete!${NC}"
echo ""
echo "Database Details:"
echo "- Database: $DB_NAME"
echo "- User: $DB_USER"
echo "- Host: localhost"
echo "- Port: 5432"
echo ""
echo "Next step: Run ./start_server_linux.sh"
