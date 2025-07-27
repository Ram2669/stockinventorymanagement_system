# 🚀 Quick Start Guide

## For Experienced Users

### **Prerequisites**
- Python 3.8+
- PostgreSQL 12+
- Git

### **1. Clone & Setup**
```bash
git clone https://github.com/Ram2669/stockinventorymanagement_system.git
cd stockinventorymanagement_system

# Linux/macOS
chmod +x setup.sh
./setup.sh

# Windows
setup.bat
```

### **2. Database Setup**
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database and user
CREATE DATABASE inventory_management;
CREATE USER inventory_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE inventory_management TO inventory_user;

-- Exit and run schema
\q
psql -U inventory_user -d inventory_management -f database_setup.sql
```

### **3. Configure**
Edit `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_management
DB_USER=inventory_user
DB_PASSWORD=your_password
```

### **4. Run**
```bash
# Activate virtual environment
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Start server
python app.py
```

### **5. Access**
- Open `docs/login.html` in browser
- Register as admin (first time only)
- Start using the system!

---

## 📁 **Key Files**
- `app.py` - Main Flask server
- `docs/` - Frontend files
- `database_setup.sql` - Database schema
- `.env` - Configuration

## 🔗 **URLs**
- **Login**: `file:///path/to/docs/login.html`
- **Admin**: `file:///path/to/docs/admin-dashboard.html`
- **Sales**: `file:///path/to/docs/salesperson-dashboard.html`

## 📖 **Need Help?**
See `SETUP_GUIDE.md` for detailed instructions.
