@echo off
echo 🌾 SRI LAKSHMI ENTERPRISES - Starting Server (Windows)
echo ===================================================

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP: =%

echo 🚀 Starting SRI LAKSHMI ENTERPRISES API Server...
echo 🌐 Local access: http://localhost:5001
echo 🌐 Network access: http://%LOCAL_IP%:5001
echo 🌐 Frontend: file://%CD%\frontend_simple\index.html
echo.
echo 💡 To deploy to GitHub Pages:
echo    1. Update docs\config.js with your IP: %LOCAL_IP%
echo    2. Follow the COMPLETE_SETUP_GUIDE.md
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
cd backend
python app.py
