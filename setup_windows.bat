@echo off
echo 🌾 SRI LAKSHMI ENTERPRISES - Windows Setup Script
echo ==================================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo ✅ Python found

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from https://www.postgresql.org/download/windows/
    echo Make sure to add PostgreSQL to PATH during installation
    pause
    exit /b 1
)

echo ✅ PostgreSQL found

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ❌ Failed to create virtual environment
    pause
    exit /b 1
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies
echo 📚 Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist "backend\.env" (
    echo 📝 Creating .env file...
    copy "backend\.env.example" "backend\.env"
    echo ⚠️  Please edit backend\.env with your database password
    echo    Default password is usually 'postgres'
)

REM Get local IP address
echo 🌐 Detecting local IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP: =%
echo 📍 Your local IP address: %LOCAL_IP%

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit backend\.env with your PostgreSQL password
echo 2. Update frontend_simple\config.js with your IP: %LOCAL_IP%
echo 3. Run: setup_database_windows.bat
echo 4. Run: start_server_windows.bat
echo.
pause
