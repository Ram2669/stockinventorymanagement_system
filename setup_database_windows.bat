@echo off
echo 🌾 SRI LAKSHMI ENTERPRISES - Database Setup (Windows)
echo ====================================================

echo 🔐 Please enter your PostgreSQL superuser password when prompted

REM Create user
echo Creating database user...
psql -U postgres -c "CREATE USER sri_lakshmi_user WITH PASSWORD 'your_secure_password';" 2>nul
if %errorlevel% neq 0 (
    echo User might already exist, continuing...
)

REM Create database
echo Creating database...
psql -U postgres -c "CREATE DATABASE sri_lakshmi_db OWNER sri_lakshmi_user;" 2>nul
if %errorlevel% neq 0 (
    echo Database might already exist, continuing...
)

REM Grant privileges
echo Setting up permissions...
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE sri_lakshmi_db TO sri_lakshmi_user;"
psql -U postgres -c "ALTER USER sri_lakshmi_user CREATEDB;"

REM Test connection
echo 🔍 Testing database connection...
echo your_secure_password | psql -U sri_lakshmi_user -d sri_lakshmi_db -c "SELECT version();" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Database connection successful!
) else (
    echo ❌ Database connection failed
    echo Please check your PostgreSQL installation and credentials
    pause
    exit /b 1
)

REM Initialize database
echo 🌱 Initializing database with sample data...
call venv\Scripts\activate.bat
cd backend
python init_db.py
cd ..

echo.
echo 🎉 Database setup complete!
echo.
echo Database Details:
echo - Database: sri_lakshmi_db
echo - User: sri_lakshmi_user
echo - Host: localhost
echo - Port: 5432
echo.
echo Next step: Run start_server_windows.bat
pause
