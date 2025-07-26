# 🌾 SRI LAKSHMI ENTERPRISES - Complete Setup Guide for Any System

This guide will help you deploy the SRI LAKSHMI ENTERPRISES Stock Management System on **any computer** from scratch.

## 📋 System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Ubuntu 18.04+
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space
- **Internet**: Required for initial setup and GitHub Pages deployment

## 🛠️ Step 1: Install Prerequisites

### For Windows:

#### Install PostgreSQL:
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. **IMPORTANT**: Remember the password you set for the `postgres` user
4. Default port: 5432 (keep this)
5. Add PostgreSQL to PATH during installation

#### Install Python:
1. Download from: https://www.python.org/downloads/
2. **IMPORTANT**: Check "Add Python to PATH" during installation
3. Verify: Open Command Prompt and run `python --version`

#### Install Git:
1. Download from: https://git-scm.com/download/win
2. Use default settings during installation
3. Verify: Open Command Prompt and run `git --version`

### For macOS:

#### Install PostgreSQL:
```bash
# Option 1: Using Homebrew (recommended)
brew install postgresql
brew services start postgresql

# Option 2: Download installer from postgresql.org
# Follow the same steps as Windows
```

#### Install Python:
```bash
# Python is usually pre-installed, but install latest version
brew install python3
```

#### Install Git:
```bash
# Usually pre-installed, or install via Homebrew
brew install git
```

### For Ubuntu/Linux:

#### Install PostgreSQL:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Install Python:
```bash
sudo apt install python3 python3-pip python3-venv
```

#### Install Git:
```bash
sudo apt install git
```

## 🗄️ Step 2: PostgreSQL Database Setup

### Windows:
```cmd
# Open Command Prompt as Administrator
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL prompt, run these commands:
CREATE USER sri_lakshmi_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE sri_lakshmi_db OWNER sri_lakshmi_user;
GRANT ALL PRIVILEGES ON DATABASE sri_lakshmi_db TO sri_lakshmi_user;
ALTER USER sri_lakshmi_user CREATEDB;
\q
```

### macOS:
```bash
# Connect to PostgreSQL
psql postgres

# Run the same SQL commands as above
CREATE USER sri_lakshmi_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE sri_lakshmi_db OWNER sri_lakshmi_user;
GRANT ALL PRIVILEGES ON DATABASE sri_lakshmi_db TO sri_lakshmi_user;
ALTER USER sri_lakshmi_user CREATEDB;
\q
```

### Linux:
```bash
# Switch to postgres user
sudo -u postgres psql

# Run the same SQL commands as above
CREATE USER sri_lakshmi_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE sri_lakshmi_db OWNER sri_lakshmi_user;
GRANT ALL PRIVILEGES ON DATABASE sri_lakshmi_db TO sri_lakshmi_user;
ALTER USER sri_lakshmi_user CREATEDB;
\q
```

## 📥 Step 3: Download the Project

### Option 1: Clone from GitHub
```bash
git clone https://github.com/YOUR_USERNAME/sri-lakshmi-stock-management.git
cd sri-lakshmi-stock-management
```

### Option 2: Download ZIP
1. Go to the GitHub repository
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Open terminal/command prompt in the extracted folder

## 🐍 Step 4: Python Environment Setup

### All Operating Systems:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

## ⚙️ Step 5: Configuration

### Create Environment File:
```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# Edit the .env file with your settings
```

### Edit `backend/.env`:
```env
# Database Configuration
POSTGRES_USER=sri_lakshmi_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=sri_lakshmi_db

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=true
SECRET_KEY=your-secret-key-change-in-production
```

### Find Your Local IP Address:

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" (usually 192.168.x.x)

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Update Frontend Configuration:
Edit `frontend_simple/config.js` and `docs/config.js`:
```javascript
PRODUCTION_API_URL: 'http://YOUR_LOCAL_IP:5001/api',  // Replace with your IP
```

## 🗄️ Step 6: Initialize Database

```bash
# Navigate to backend directory
cd backend

# Initialize database with sample data
python init_db.py
```

You should see:
```
🌾 Initializing SRI LAKSHMI ENTERPRISES Database...
✅ Database tables created successfully!
🌱 Adding sample agricultural data...
✅ Added 8 sample stock items
🎉 Database initialization complete!
```

## 🚀 Step 7: Start the System

### Start Backend Server:
```bash
# In the backend directory
python app.py
```

You should see:
```
🌾 SRI LAKSHMI ENTERPRISES API Server
🌐 Server will be available at: http://0.0.0.0:5001
```

### Test the API:
Open a new terminal and run:
```bash
curl http://localhost:5001/
```

### Access Frontend:
Open your web browser and go to:
```
file:///path/to/your/project/frontend_simple/index.html
```

## 🌐 Step 8: GitHub Pages Deployment (Optional)

### Create GitHub Repository:
1. Go to https://github.com
2. Click "New repository"
3. Name: `sri-lakshmi-stock-management`
4. Make it **Public**
5. Click "Create repository"

### Push Your Code:
```bash
# In your project directory
git add .
git commit -m "Initial commit: SRI LAKSHMI ENTERPRISES Stock Management"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sri-lakshmi-stock-management.git
git push -u origin main
```

### Enable GitHub Pages:
1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: "Deploy from a branch"
4. Branch: `main`
5. Folder: `/docs`
6. Click "Save"

Your site will be live at: `https://YOUR_USERNAME.github.io/sri-lakshmi-stock-management`

## 🔧 Troubleshooting

### PostgreSQL Issues:
```bash
# Check if PostgreSQL is running
# Windows:
net start postgresql-x64-13
# macOS:
brew services list | grep postgresql
# Linux:
sudo systemctl status postgresql
```

### Python Issues:
```bash
# Check Python version
python --version
# Should be 3.8 or higher

# Check if virtual environment is active
which python
# Should point to your venv directory
```

### Port Issues:
If port 5001 is busy, edit `backend/app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)  # Change port
```

Then update the config files accordingly.

### Firewall Issues:
- **Windows**: Allow Python through Windows Defender Firewall
- **macOS**: System Preferences → Security & Privacy → Firewall
- **Linux**: `sudo ufw allow 5001`

## 📱 Mobile Access

To access from mobile devices on the same network:
1. Find your computer's IP address (Step 5)
2. On mobile browser, go to: `http://YOUR_IP:5001`
3. The GitHub Pages site works on mobile: `https://YOUR_USERNAME.github.io/sri-lakshmi-stock-management`

## 🔒 Security Notes

1. **Change default passwords** in production
2. **Use HTTPS** for production deployment
3. **Backup your database** regularly:
   ```bash
   pg_dump -U sri_lakshmi_user -h localhost sri_lakshmi_db > backup.sql
   ```

## 📊 Sample Data

The system comes with 8 sample agricultural products:
- Wheat Seeds (500 units)
- Rice Seeds (300 units)
- Corn Seeds (250 units)
- Fertilizer NPK (100 units)
- Pesticide Spray (75 units)
- Irrigation Pipes (200 units)
- Garden Tools Set (50 units)
- Organic Compost (150 units)

## 🎉 Success!

Your SRI LAKSHMI ENTERPRISES Stock Management System is now ready with:
- ✅ Beautiful farming-themed UI
- ✅ PostgreSQL database
- ✅ Professional PDF receipts
- ✅ Advanced search functionality
- ✅ Sales management with stock tracking
- ✅ Weekly reports generation

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are installed correctly
3. Verify database connection
4. Check firewall settings

---

**🌾 Happy Farming with Digital Inventory Management! 🚜**
