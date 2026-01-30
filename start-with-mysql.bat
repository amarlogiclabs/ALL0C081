@echo off
REM Codeverse - Complete Startup Script with MySQL Connection
REM This script starts all services and connects to your local MySQL database

setlocal enabledelayedexpansion

echo.
echo ════════════════════════════════════════════════════════════
echo      CODEVERSE - MYSQL CONNECTION ^& STARTUP SCRIPT
echo ════════════════════════════════════════════════════════════
echo.

REM MySQL Configuration
set MYSQL_HOST=127.0.0.1
set MYSQL_PORT=3306
set MYSQL_USER=root
set MYSQL_PASS=root254
set MYSQL_DB=codeverse

echo [1/5] Checking MySQL Database Connection...
echo.

REM Check if MySQL command exists
mysql -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASS% -e "SELECT 1" >nul 2>&1

if errorlevel 1 (
    echo ✗ MySQL is not running or not accessible
    echo   Make sure MySQL is running on %MYSQL_HOST%:%MYSQL_PORT%
    echo   With credentials: %MYSQL_USER% / %MYSQL_PASS%
    echo.
    echo   To start MySQL:
    echo     - Use MySQL Installer, or
    echo     - Use Services app and start MySQL80 service
    echo.
    pause
    exit /b 1
)

echo ✓ MySQL is running and accessible
echo   Host:     %MYSQL_HOST%
echo   Port:     %MYSQL_PORT%
echo   User:     %MYSQL_USER%
echo   Database: %MYSQL_DB%
echo.

REM Check if database exists
mysql -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASS% -e "USE %MYSQL_DB%;" >nul 2>&1

if errorlevel 1 (
    echo ⚠ Database '%MYSQL_DB%' does not exist
    echo   Creating database...
    mysql -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASS% -e "CREATE DATABASE IF NOT EXISTS %MYSQL_DB%;" >nul 2>&1
    echo ✓ Database created successfully
) else (
    echo ✓ Database '%MYSQL_DB%' exists
)

echo.
echo ════════════════════════════════════════════════════════════
echo [2/5] Starting Java User Microservice...
echo ════════════════════════════════════════════════════════════
echo.

cd /d "codeverse-microservices\user-service" || exit /b 1
echo Starting Spring Boot application on port 8090...
echo This window will show Java service logs...
echo.
start "Codeverse - Java Microservice (8090)" cmd /k "mvn spring-boot:run"
timeout /t 5 /nobreak

echo.
echo ════════════════════════════════════════════════════════════
echo [3/5] Starting Express Backend Server...
echo ════════════════════════════════════════════════════════════
echo.

cd /d "..\..\codeverse-live\server" || exit /b 1
echo Starting Express backend on port 5000...
echo Database: MySQL (%MYSQL_HOST%:%MYSQL_PORT%)
echo.
start "Codeverse - Express Backend (5000)" cmd /k "npm run dev"
timeout /t 3 /nobreak

echo.
echo ════════════════════════════════════════════════════════════
echo [4/5] Starting React Frontend...
echo ════════════════════════════════════════════════════════════
echo.

cd /d ".." || exit /b 1
echo Starting Vite development server on port 8080...
echo.
start "Codeverse - React Frontend (8080)" cmd /k "npm run dev"
timeout /t 3 /nobreak

echo.
echo ════════════════════════════════════════════════════════════
echo [5/5] All Services Started!
echo ════════════════════════════════════════════════════════════
echo.

echo ✓ Java Microservice:  http://localhost:8090
echo ✓ Express Backend:    http://localhost:5000
echo ✓ React Frontend:     http://localhost:8080
echo ✓ MySQL Database:     %MYSQL_HOST%:%MYSQL_PORT%
echo.

echo ════════════════════════════════════════════════════════════
echo              OPEN IN BROWSER
echo ════════════════════════════════════════════════════════════
echo.
echo 🌐 http://localhost:8080
echo.

echo Three terminal windows have been opened:
echo   1. Java User Service (port 8090)
echo   2. Express Backend (port 5000)
echo   3. React Frontend (port 8080)
echo.

echo To stop all services, close each terminal window.
echo.

pause
