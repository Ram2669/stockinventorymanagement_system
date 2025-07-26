#!/bin/bash

echo "🌾 SRI LAKSHMI ENTERPRISES - Database Setup Script"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Add PostgreSQL to PATH
export PATH="/Library/PostgreSQL/17/bin:$PATH"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed. Please install PostgreSQL first.${NC}"
    echo "Visit: https://www.postgresql.org/download/"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL found${NC}"

# Database configuration
DB_NAME="sri_lakshmi_db"
DB_USER="sri_lakshmi_user"
DB_PASSWORD="your_secure_password"

echo -e "${YELLOW}📝 Setting up database: $DB_NAME${NC}"
echo -e "${YELLOW}📝 Creating user: $DB_USER${NC}"

# Create database and user
echo -e "${YELLOW}🔐 Please enter your PostgreSQL superuser password when prompted${NC}"

# Create user
psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "User might already exist"

# Create database
psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || echo "Database might already exist"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
psql -U postgres -c "ALTER USER $DB_USER CREATEDB;"

echo -e "${GREEN}✅ Database and user created successfully!${NC}"

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cp backend/.env.example backend/.env
    
    # Update .env with actual values
    sed -i.bak "s/your_secure_password_here/$DB_PASSWORD/g" backend/.env
    rm backend/.env.bak 2>/dev/null || true
    
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please update backend/.env with your GitHub username${NC}"
else
    echo -e "${YELLOW}📝 .env file already exists${NC}"
fi

# Test database connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if psql -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful!${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "Please check your PostgreSQL installation and credentials"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Database setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your GitHub username"
echo "2. Run: cd backend && python init_db.py"
echo "3. Run: python app.py"
echo ""
echo "Database Details:"
echo "- Database: $DB_NAME"
echo "- User: $DB_USER"
echo "- Host: localhost"
echo "- Port: 5432"
