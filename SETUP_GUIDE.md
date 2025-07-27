# 🌾 SRI LAKSHMI ENTERPRISES - Stock Inventory Management System
## Complete Setup Guide for New Machine Deployment

This guide will help you set up the complete inventory management system on a new machine with PostgreSQL database.

---

## 📋 **System Requirements**

- **Operating System**: Windows 10/11, macOS, or Linux
- **Python**: 3.8 or higher
- **PostgreSQL**: 12 or higher
- **Git**: Latest version
- **Web Browser**: Chrome, Firefox, Safari, or Edge

---

## 🚀 **Step 1: Install Prerequisites**

### **1.1 Install Python**
```bash
# Check if Python is installed
python --version
python3 --version

# If not installed:
# Windows: Download from https://python.org
# macOS: brew install python3
# Ubuntu/Debian: sudo apt update && sudo apt install python3 python3-pip
# CentOS/RHEL: sudo yum install python3 python3-pip
```

### **1.2 Install PostgreSQL**

#### **Windows:**
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. **Remember the password you set for the 'postgres' user**
4. Default port: 5432

#### **macOS:**
```bash
# Using Homebrew (recommended)
brew install postgresql
brew services start postgresql

# Or download from: https://www.postgresql.org/download/macosx/
```

#### **Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### **CentOS/RHEL:**
```bash
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### **1.3 Install Git**
```bash
# Check if Git is installed
git --version

# If not installed:
# Windows: Download from https://git-scm.com
# macOS: brew install git
# Linux: sudo apt install git (Ubuntu) or sudo yum install git (CentOS)
```

---

## 📥 **Step 2: Clone the Repository**

```bash
# Clone the repository
git clone https://github.com/Ram2669/stockinventorymanagement_system.git

# Navigate to the project directory
cd stockinventorymanagement_system
```

---

## 🗄️ **Step 3: Database Setup**

### **3.1 Access PostgreSQL**
```bash
# Switch to postgres user (Linux/macOS)
sudo -u postgres psql

# Or connect directly (Windows/if postgres user has password)
psql -U postgres -h localhost
```

### **3.2 Create Database and User**
```sql
-- Create database
CREATE DATABASE inventory_management;

-- Create user with password
CREATE USER inventory_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE inventory_management TO inventory_user;

-- Connect to the database
\c inventory_management;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO inventory_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO inventory_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO inventory_user;

-- Exit PostgreSQL
\q
```

### **3.3 Create Database Tables**
```bash
# Run the database setup script
psql -U inventory_user -d inventory_management -h localhost -f database_setup.sql

# Enter the password when prompted
```

---

## 🐍 **Step 4: Backend Setup**

### **4.1 Install Python Dependencies**
```bash
# Create virtual environment (recommended)
python3 -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install required packages
pip install flask flask-cors psycopg2-binary reportlab python-dotenv
```

### **4.2 Configure Database Connection**
Create a `.env` file in the project root:
```bash
# Create .env file
touch .env  # Linux/macOS
# Or create manually on Windows
```

Add the following content to `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_management
DB_USER=inventory_user
DB_PASSWORD=your_secure_password_here
```

### **4.3 Test Database Connection**
```bash
# Test the connection
python3 -c "
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    print('✅ Database connection successful!')
    conn.close()
except Exception as e:
    print(f'❌ Database connection failed: {e}')
"
```

---

## 🌐 **Step 5: Start the Application**

### **5.1 Start the Backend Server**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

# Start the Flask server
python app.py

# You should see:
# * Running on http://127.0.0.1:5000
# * Debug mode: on
```

### **5.2 Access the Frontend**
Open your web browser and navigate to:
- **Admin Dashboard**: `file:///path/to/project/docs/admin-dashboard.html`
- **Salesperson Dashboard**: `file:///path/to/project/docs/salesperson-dashboard.html`
- **Login Page**: `file:///path/to/project/docs/login.html`

---

## 👤 **Step 6: Initial Setup**

### **6.1 Create Admin Account**
1. Open the **Login Page** in your browser
2. Click **"Register as Admin"** (only available for first-time setup)
3. Fill in admin details:
   - **Username**: admin (or your preferred username)
   - **Password**: Create a strong password
   - **Full Name**: Your name
4. Click **"Register"**

### **6.2 Add Initial Data**
1. **Login as Admin**
2. **Add Products**: Go to "Manage Inventory" → Add products with details
3. **Set Unit Prices**: Make sure to set unit prices for all products
4. **Create Salesperson Account**: Go to "User Management" → Add salesperson

---

## 🔧 **Step 7: Configuration**

### **7.1 Update API Configuration**
Edit `docs/config.js`:
```javascript
const API_BASE = 'http://localhost:5000/api';
```

### **7.2 Firewall Configuration (if needed)**
```bash
# Allow port 5000 for Flask server
# Windows Firewall: Add inbound rule for port 5000
# Linux (ufw): sudo ufw allow 5000
# macOS: System Preferences → Security & Privacy → Firewall
```

---

## 🧪 **Step 8: Testing the System**

### **8.1 Test Admin Functions**
- ✅ Login as admin
- ✅ Add/edit products
- ✅ Set unit prices
- ✅ Generate reports
- ✅ Manage users

### **8.2 Test Salesperson Functions**
- ✅ Login as salesperson
- ✅ Record sales
- ✅ View stock alerts
- ✅ Download receipts
- ✅ Generate weekly reports

### **8.3 Test Receipt Generation**
- ✅ Record a sale
- ✅ Download PDF receipt
- ✅ Print receipt

---

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **Database Connection Error**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Restart PostgreSQL
sudo systemctl restart postgresql  # Linux
brew services restart postgresql  # macOS
```

#### **Python Module Not Found**
```bash
# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

#### **Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change port in app.py
```

#### **Permission Denied (PostgreSQL)**
```sql
-- Grant additional permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO inventory_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO inventory_user;
```

---

## 📁 **Project Structure**
```
stockinventorymanagement_system/
├── app.py                          # Main Flask application
├── database_setup.sql              # Database schema
├── .env                            # Environment variables
├── docs/                           # Frontend files
│   ├── admin-dashboard.html        # Admin interface
│   ├── salesperson-dashboard.html  # Salesperson interface
│   ├── login.html                  # Login page
│   ├── config.js                   # API configuration
│   └── *.js, *.css                # JavaScript and CSS files
└── requirements.txt                # Python dependencies
```

---

## 🔒 **Security Notes**

1. **Change default passwords** in production
2. **Use HTTPS** for production deployment
3. **Configure firewall** properly
4. **Regular database backups**
5. **Keep dependencies updated**

---

## 📞 **Support**

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Ensure database connection is working
4. Check server logs for error messages

---

## 🎉 **Success!**

Your SRI LAKSHMI ENTERPRISES Stock Inventory Management System is now ready to use!

**Default Access:**
- **Admin**: Full system access
- **Salesperson**: Sales recording and basic reports

**Key Features:**
- 📦 Inventory management
- 💰 Sales tracking with payment status
- 📄 PDF receipt generation
- 📊 Weekly reports
- 👥 User role management
- 🚨 Low stock alerts
