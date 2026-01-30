@echo off
REM Code Arena - Microservices Quick Start Script for Windows

echo.
echo ============================================
echo Code Arena - Microservices Setup
echo ============================================
echo.

REM Check Java installation
echo Checking Java installation...
java -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17+ and add it to your PATH
    pause
    exit /b 1
)

REM Check Maven installation
echo Checking Maven installation...
mvn -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Maven 3.8+ and add it to your PATH
    pause
    exit /b 1
)

REM Check Node installation
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and add it to your PATH
    pause
    exit /b 1
)

REM Check MySQL
echo Checking MySQL connection...
mysql -u root -p root254 -e "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo WARNING: Cannot connect to MySQL on 127.0.0.1:3306
    echo Please ensure MySQL is running with:
    echo   User: root
    echo   Password: root254
    echo.
)

echo.
echo ============================================
echo Starting Microservices
echo ============================================
echo.

REM Start Java Microservice
echo Starting Java User Service on port 8090...
cd codeverse-microservices\user-service
start "Code Arena - User Service (Java)" cmd /k "mvn spring-boot:run"
cd ..\..\

REM Wait a moment for Java to start
timeout /t 5 /nobreak

REM Start Express Backend
echo Starting Express Backend on port 5000...
cd code-arena-live\server
start "Code Arena - Backend (Express)" cmd /k "npm run dev"
cd ..\..\

REM Wait a moment for Express to start
timeout /t 3 /nobreak

REM Start React Frontend
echo Starting React Frontend on port 8080...
cd code-arena-live
start "Code Arena - Frontend (React)" cmd /k "npm run dev"
cd ..

echo.
echo ============================================
echo All services are starting...
echo ============================================
echo.
echo Services:
echo  - Frontend:     http://localhost:8080
echo  - Backend:      http://localhost:5000/api
echo  - User Service: http://localhost:8090/api/users
echo  - Database:     127.0.0.1:3306 (codeverse)
echo.
echo Windows will open 3 terminals. Check them for errors.
echo.
pause
