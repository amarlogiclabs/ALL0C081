@echo off
setlocal EnableDelayedExpansion

REM ============================================================================
REM Code Arena - Master Setup & Run Script (Enhanced)
REM ============================================================================
REM This script handles:
REM 1. Admin Elevation
REM 2. Git Pull (Update)
REM 3. Firewall Disabling
REM 4. Dependencies Check & Auto-Upgrade (Node, Java, Maven, GCC)
REM 5. NPM Installation
REM 6. Service Startup (Inline)
REM ============================================================================

TITLE Code Arena Setup & Run

REM ----------------------------------------------------------------------------
REM 1. Check for Administrator Privileges
REM ----------------------------------------------------------------------------
echo Checking for Administrator privileges...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running with Administrator privileges.
) else (
    echo [INFO] Requesting Administrator privileges...
    powershell -Command "Start-Process '%~0' -Verb RunAs"
    exit /b
)

echo.
echo ============================================================================
echo                      CODE ARENA ONE-CLICK SETUP
echo ============================================================================
echo.

REM ----------------------------------------------------------------------------
REM 2. Update Codebase (Git Pull)
REM ----------------------------------------------------------------------------
echo [STEP 1/6] Updating codebase...
git pull
if %errorLevel% NEQ 0 (
    echo [WARNING] Git pull failed. Continuing with existing files...
) else (
    echo [OK] Codebase updated.
)
echo.

REM ----------------------------------------------------------------------------
REM 3. Disable Firewall (Requested Feature)
REM ----------------------------------------------------------------------------
echo [STEP 2/6] Configuring Firewall...
echo [WARNING] Disabling Windows Firewall for all profiles as requested...
NetSh Advfirewall set allprofiles state off
if %errorLevel% == 0 (
    echo [OK] Firewall disabled.
) else (
    echo [ERROR] Failed to disable firewall.
)
echo.

REM ----------------------------------------------------------------------------
REM 4. Start MySQL Service
REM ----------------------------------------------------------------------------
echo [STEP 3/7] Starting MySQL Service...
net start MYSQL80 >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] MySQL service started.
) else (
    echo [INFO] MySQL might already be running or failed to start.
    sc query MYSQL80 | find "RUNNING" >nul
    if %errorLevel% == 0 (
        echo [OK] MySQL is already running.
    ) else (
        echo [WARNING] MySQL service issue detected. Please check manually.
    )
)
echo.

REM ----------------------------------------------------------------------------
REM 5. Check & Upgrade Dependencies
REM ----------------------------------------------------------------------------
echo [STEP 4/7] Checking & Upgrading Dependencies...

REM --- MinGW (GCC) ---
echo    - Checking GCC...
gcc --version >nul 2>&1
if %errorLevel% == 0 (
    echo      [OK] GCC is installed.
) else (
    echo      [INFO] GCC not found. Installing MinGW...
    winget install --id "MinGW.MinGW" -e --source winget --accept-package-agreements --accept-source-agreements
    if %errorLevel% == 0 echo      [OK] MinGW installed.
)

REM --- Node.js ---
echo    - Checking Node.js...
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo      [OK] Node.js is installed. Attempting upgrade...
    winget upgrade --id "OpenJS.NodeJS.LTS" -e --accept-package-agreements --accept-source-agreements >nul 2>&1
    if !errorLevel! == 0 (
        echo      [OK] Node.js upgrade checked.
    ) else (
        echo      [INFO] Node.js is up to date or upgrade skipped.
    )
) else (
    echo      [INFO] Node.js not found. Installing Latest LTS...
    winget install --id "OpenJS.NodeJS.LTS" -e --source winget --accept-package-agreements --accept-source-agreements
)

REM --- NPM ---
echo    - Upgrading NPM...
call npm install -g npm@latest
echo      [OK] NPM upgrade command executed.

REM --- Java (JDK 17) ---
echo    - Checking Java...
java -version >nul 2>&1
if %errorLevel% == 0 (
    echo      [OK] Java is installed. Attempting upgrade for Oracle JDK 17...
    winget upgrade --id "Oracle.JDK.17" -e --accept-package-agreements --accept-source-agreements >nul 2>&1
    if !errorLevel! == 0 echo      [OK] Java upgrade checked.
) else (
    echo      [INFO] Java not found. Installing Oracle JDK 17...
    winget install --id "Oracle.JDK.17" -e --source winget --accept-package-agreements --accept-source-agreements
)

REM --- Maven ---
echo    - Checking Maven...
mvn -version >nul 2>&1
if %errorLevel% == 0 (
    echo      [OK] Maven is installed. Attempting upgrade...
    winget upgrade --id "Apache.Maven" -e --accept-package-agreements --accept-source-agreements >nul 2>&1
    if !errorLevel! == 0 echo      [OK] Maven upgrade checked.
) else (
    echo      [INFO] Maven not found. Installing Apache Maven...
    winget install --id "Apache.Maven" -e --source winget --accept-package-agreements --accept-source-agreements
)

REM Refresh Environment Variables (Critical after installs)
call RefreshEnv.cmd >nul 2>&1
echo [OK] Dependencies check complete.
echo.

REM ----------------------------------------------------------------------------
REM 6. Install NPM Dependencies
REM ----------------------------------------------------------------------------
echo [STEP 5/7] Installing Project Dependencies...

REM Backend
if exist "code-arena-live\server\package.json" (
    echo    - Installing Backend dependencies...
    pushd "code-arena-live\server"
    call npm install
    popd
)

REM Frontend
if exist "code-arena-live\package.json" (
    echo    - Installing Frontend dependencies...
    pushd "code-arena-live"
    call npm install
    popd
)
echo [OK] Project dependencies installed.
echo.

REM ----------------------------------------------------------------------------
REM 7. Start Services (Inline)
REM ----------------------------------------------------------------------------
echo [STEP 6/7] Stopping existing services...
REM Using the PowerShell cleaner script
powershell -ExecutionPolicy Bypass -File "%~dp0restart-services.ps1"

echo [STEP 7/7] Starting Services...

REM 1. Java User Service (Port 8090)
echo    - Starting Java User Service (Port 8090)...
cd code-arena-microservices\user-service
start "Code Arena - User Service (Java)" cmd /k "mvn spring-boot:run"
cd ..\..\

REM Wait for Java to initialize
timeout /t 5 /nobreak >nul

REM 2. Express Backend (Port 5000)
echo    - Starting Express Backend (Port 5000)...
cd code-arena-live\server
start "Code Arena - Backend (Express)" cmd /k "npm run dev"
cd ..\..\

REM Wait for Backend
timeout /t 3 /nobreak >nul

REM 3. React Frontend (Port 8080)
echo    - Starting React Frontend (Port 8080)...
cd code-arena-live
start "Code Arena - Frontend (React)" cmd /k "npm run dev"
cd ..

echo.
echo ============================================================================
echo [SUCCESS] Setup complete and services started!
echo ============================================================================
echo Services:
echo  - Frontend:     http://localhost:8080
echo  - Backend:      http://localhost:5000/api
echo  - User Service: http://localhost:8090/api/users
echo.
echo Check the opened terminal windows for logs.
pause
