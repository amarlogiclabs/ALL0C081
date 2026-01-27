@echo off
REM Verify microservices setup for Code Arena

setlocal enabledelayedexpansion

echo.
echo ============================================
echo Code Arena - Microservices Verification
echo ============================================
echo.

set ERROR_COUNT=0

REM Check Java
echo Checking Java 17+...
java -version >nul 2>&1
if errorlevel 1 (
    echo [X] Java not installed or not in PATH
    set /a ERROR_COUNT=!ERROR_COUNT!+1
) else (
    for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| findstr /R "version"') do (
        set JAVA_VER=%%i
        echo [OK] Java found (!JAVA_VER!)
    )
)

REM Check Maven
echo Checking Maven 3.8+...
mvn -version >nul 2>&1
if errorlevel 1 (
    echo [X] Maven not installed or not in PATH
    set /a ERROR_COUNT=!ERROR_COUNT!+1
) else (
    echo [OK] Maven found
)

REM Check Node
echo Checking Node.js 18+...
node -v >nul 2>&1
if errorlevel 1 (
    echo [X] Node.js not installed or not in PATH
    set /a ERROR_COUNT=!ERROR_COUNT!+1
) else (
    for /f "tokens=*" %%i in ('node -v') do (
        echo [OK] Node.js found (%%i)
    )
)

REM Check npm
echo Checking npm...
npm -v >nul 2>&1
if errorlevel 1 (
    echo [X] npm not installed or not in PATH
    set /a ERROR_COUNT=!ERROR_COUNT!+1
) else (
    echo [OK] npm found
)

REM Check MySQL
echo Checking MySQL connection...
mysql -u root -p root254 -e "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo [X] Cannot connect to MySQL (127.0.0.1:3306)
    set /a ERROR_COUNT=!ERROR_COUNT!+1
) else (
    echo [OK] MySQL connected (127.0.0.1:3306)
)

REM Check directories
echo.
echo Checking directory structure:
if exist "code-arena-live\src" (
    echo [OK] Frontend
) else (
    echo [X] Frontend
    set /a ERROR_COUNT=!ERROR_COUNT!+1
)

if exist "code-arena-live\server\src" (
    echo [OK] Backend
) else (
    echo [X] Backend
    set /a ERROR_COUNT=!ERROR_COUNT!+1
)

if exist "code-arena-microservices\user-service\src" (
    echo [OK] Microservice
) else (
    echo [X] Microservice
    set /a ERROR_COUNT=!ERROR_COUNT!+1
)

REM Summary
echo.
echo ============================================
if !ERROR_COUNT! equ 0 (
    echo [SUCCESS] All checks passed!
    echo ============================================
    echo.
    echo You can now run:
    echo   start-microservices.bat
    echo.
    pause
    exit /b 0
) else (
    echo [ERROR] Found !ERROR_COUNT! issue(s)
    echo ============================================
    echo.
    echo Please fix the issues above before starting.
    echo.
    pause
    exit /b 1
)
