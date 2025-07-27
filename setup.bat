@echo off
echo 🌾 SRI LAKSHMI ENTERPRISES - Stock Inventory Management System
echo ==================================================================
echo Setting up the system on Windows...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found
python --version

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not installed. Please install PostgreSQL from https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo ✅ PostgreSQL found

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies
echo 📥 Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo ⚙️ Creating .env configuration file...
    (
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=inventory_management
        echo DB_USER=inventory_user
        echo DB_PASSWORD=change_this_password
    ) > .env
    echo 📝 Please edit .env file with your database credentials!
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Edit .env file with your PostgreSQL credentials
echo 2. Create PostgreSQL database and user (see SETUP_GUIDE.md)
echo 3. Run: python app.py
echo 4. Open docs\login.html in your browser
echo.
echo 📖 For detailed instructions, see SETUP_GUIDE.md
echo.
pause
