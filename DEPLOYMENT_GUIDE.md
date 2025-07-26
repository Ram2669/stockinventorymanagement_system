# 🌾 SRI LAKSHMI ENTERPRISES - Complete Deployment Guide

This guide will help you deploy your farming-themed stock management system with:
- **Frontend** on GitHub Pages (free hosting)
- **Backend API** running on your local machine
- **PostgreSQL Database** on your local machine

## 📋 Prerequisites

### Required Software
1. **PostgreSQL** (Database)
   - Download: https://www.postgresql.org/download/
   - Version 12 or higher recommended

2. **Python** (Backend)
   - Version 3.8 or higher
   - Download: https://www.python.org/downloads/

3. **Git** (Version control)
   - Download: https://git-scm.com/downloads

4. **GitHub Account** (For hosting)
   - Sign up: https://github.com

## 🗄️ Part 1: PostgreSQL Database Setup

### Step 1: Install PostgreSQL
1. Download and install PostgreSQL from the official website
2. During installation, remember the **superuser password**
3. Make sure PostgreSQL service is running

### Step 2: Run Database Setup Script
```bash
# Navigate to your project directory
cd /Users/ramgopal/Desktop/projectstock

# Run the database setup script
./setup_database.sh
```

This script will:
- Create database: `sri_lakshmi_db`
- Create user: `sri_lakshmi_user`
- Set up permissions
- Create `.env` file

### Step 3: Configure Environment
1. Edit `backend/.env` file:
```env
POSTGRES_USER=sri_lakshmi_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=sri_lakshmi_db
FLASK_ENV=development
FLASK_DEBUG=true
SECRET_KEY=your-secret-key-change-in-production
```

### Step 4: Initialize Database
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source ../venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Initialize database with tables and sample data
python init_db.py
```

## 🖥️ Part 2: Backend API Setup

### Step 1: Test Local Backend
```bash
# In the backend directory
python run_server.py
```

You should see:
```
🌾 Starting SRI LAKSHMI ENTERPRISES API Server
🌐 Server will be available at: http://0.0.0.0:5000
🔧 Environment: development
🐛 Debug mode: True
```

### Step 2: Find Your Local IP Address

**On Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" (usually starts with 192.168.x.x)

**On Mac/Linux:**
```bash
ifconfig
```
Look for "inet" address (usually starts with 192.168.x.x)

**Example:** Your IP might be `192.168.1.100`

### Step 3: Update API Configuration
Edit `frontend_simple/config.js` and `docs/config.js`:
```javascript
PRODUCTION_API_URL: 'http://192.168.1.100:5000/api',  // Replace with your IP
```

### Step 4: Test API Connection
```bash
# Test if API is accessible
curl http://YOUR_LOCAL_IP:5000/api/stock
```

## 🌐 Part 3: GitHub Pages Deployment

### Step 1: Create GitHub Repository
1. Go to https://github.com
2. Click "New repository"
3. Name it: `projectstock` (or any name you prefer)
4. Make it **Public** (required for free GitHub Pages)
5. Click "Create repository"

### Step 2: Upload Your Code
```bash
# In your project directory
git init
git add .
git commit -m "Initial commit: SRI LAKSHMI ENTERPRISES Stock Management"

# Add your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/projectstock.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Select branch: `main`
6. Select folder: `/docs`
7. Click "Save"

### Step 4: Update Configuration
1. Note your GitHub Pages URL: `https://YOUR_USERNAME.github.io/projectstock`
2. Update `docs/config.js` with your actual IP address
3. Commit and push changes:
```bash
git add docs/config.js
git commit -m "Update API configuration for production"
git push
```

## 🚀 Part 4: Running the Complete System

### Step 1: Start Backend Server
```bash
# In your project directory
cd backend
source ../venv/bin/activate
python run_server.py
```

### Step 2: Access Your Application
- **Local Development:** Open `frontend_simple/index.html` in browser
- **Production:** Visit `https://YOUR_USERNAME.github.io/projectstock`

## 🔧 Configuration Files Summary

### Backend Configuration (`backend/.env`)
```env
POSTGRES_USER=sri_lakshmi_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=sri_lakshmi_db
FLASK_ENV=development
FLASK_DEBUG=true
SECRET_KEY=your-secret-key-change-in-production
```

### Frontend Configuration (`docs/config.js`)
```javascript
const CONFIG = {
    LOCAL_API_URL: 'http://localhost:5000/api',
    PRODUCTION_API_URL: 'http://YOUR_LOCAL_IP:5000/api',  // Your actual IP
    // ... rest of config
};
```

## 🛠️ Troubleshooting

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -U sri_lakshmi_user -d sri_lakshmi_db -h localhost

# Check if PostgreSQL is running
# On Mac: brew services list | grep postgresql
# On Windows: Check Services in Task Manager
```

### API Connection Issues
```bash
# Check if backend is running
curl http://localhost:5000/

# Check firewall settings (allow port 5000)
# On Windows: Windows Defender Firewall
# On Mac: System Preferences > Security & Privacy > Firewall
```

### CORS Issues
- Make sure your IP address is correct in `config.js`
- Restart the backend server after configuration changes
- Check browser console for CORS errors

## 📱 Mobile Access

To access from mobile devices on the same network:
1. Make sure your computer's firewall allows connections on port 5000
2. Use your computer's IP address: `http://192.168.1.100:5000`
3. The GitHub Pages site will work on mobile: `https://YOUR_USERNAME.github.io/projectstock`

## 🔒 Security Notes

1. **Database Password:** Use a strong password in production
2. **Secret Key:** Change the Flask secret key for production
3. **Firewall:** Only allow necessary ports (5000 for API)
4. **HTTPS:** Consider using ngrok or similar for HTTPS in production

## 📊 Database Management

### Backup Database
```bash
pg_dump -U sri_lakshmi_user -h localhost sri_lakshmi_db > backup.sql
```

### Restore Database
```bash
psql -U sri_lakshmi_user -h localhost sri_lakshmi_db < backup.sql
```

### View Database
```bash
psql -U sri_lakshmi_user -d sri_lakshmi_db -h localhost
\dt  # List tables
SELECT * FROM stock;  # View stock data
SELECT * FROM sale;   # View sales data
```

## 🎉 Success!

Your SRI LAKSHMI ENTERPRISES Stock Management System is now deployed with:
- ✅ Beautiful farming-themed UI on GitHub Pages
- ✅ Robust PostgreSQL database on your local machine
- ✅ Python Flask API serving data
- ✅ Professional PDF receipt generation
- ✅ Complete stock and sales management

Visit your GitHub Pages URL to see your live application! 🌾🚜
