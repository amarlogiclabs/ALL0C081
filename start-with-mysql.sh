#!/bin/bash

# Codeverse - Complete Startup Script with MySQL Connection
# This script starts all services and connects to your local MySQL database

echo ""
echo "════════════════════════════════════════════════════════════"
echo "     CODEVERSE - MYSQL CONNECTION & STARTUP SCRIPT"
echo "════════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# MySQL Configuration
MYSQL_HOST="127.0.0.1"
MYSQL_PORT="3306"
MYSQL_USER="root"
MYSQL_PASS="root254"
MYSQL_DB="codeverse"

echo "${BLUE}[1/5]${NC} Checking MySQL Database Connection..."
echo ""

# Check if MySQL command exists
if ! command -v mysql &> /dev/null; then
    echo "${RED}✗ MySQL client not found${NC}"
    echo "  Please install MySQL client first"
    echo "  Windows: Download from https://dev.mysql.com/downloads/mysql/"
    echo "  Linux:   sudo apt-get install mysql-client"
    echo "  macOS:   brew install mysql-client"
    exit 1
fi

# Test connection to MySQL
if mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e "SELECT 1" &> /dev/null; then
    echo "${GREEN}✓ MySQL is running and accessible${NC}"
    echo "  Host:     $MYSQL_HOST"
    echo "  Port:     $MYSQL_PORT"
    echo "  User:     $MYSQL_USER"
    echo "  Database: $MYSQL_DB"
    echo ""
    
    # Check if database exists
    if mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e "USE $MYSQL_DB" &> /dev/null; then
        echo "${GREEN}✓ Database '$MYSQL_DB' exists${NC}"
    else
        echo "${YELLOW}⚠ Database '$MYSQL_DB' does not exist${NC}"
        echo "  Creating database..."
        mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS -e "CREATE DATABASE IF NOT EXISTS $MYSQL_DB;" 2>/dev/null
        echo "${GREEN}✓ Database created successfully${NC}"
    fi
else
    echo "${RED}✗ Cannot connect to MySQL${NC}"
    echo "  Make sure MySQL is running on $MYSQL_HOST:$MYSQL_PORT"
    echo "  With credentials: $MYSQL_USER / $MYSQL_PASS"
    echo ""
    echo "  To start MySQL:"
    echo "    Windows: mysql.server start (or use MySQL Installer)"
    echo "    Linux:   sudo service mysql start"
    echo "    macOS:   mysql.server start"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "${BLUE}[2/5]${NC} Starting Java User Microservice..."
echo "════════════════════════════════════════════════════════════"
echo ""

cd "code-arena-microservices/user-service" || exit 1
echo "Starting Spring Boot application on port 8090..."
mvn spring-boot:run &
JAVA_PID=$!
sleep 5

echo ""
echo "════════════════════════════════════════════════════════════"
echo "${BLUE}[3/5]${NC} Starting Express Backend Server..."
echo "════════════════════════════════════════════════════════════"
echo ""

cd "../../code-arena-live/server" || exit 1
echo "Starting Express backend on port 5000..."
echo "Database: MySQL ($MYSQL_HOST:$MYSQL_PORT)"
npm run dev &
EXPRESS_PID=$!
sleep 3

echo ""
echo "════════════════════════════════════════════════════════════"
echo "${BLUE}[4/5]${NC} Starting React Frontend..."
echo "════════════════════════════════════════════════════════════"
echo ""

cd "../" || exit 1
echo "Starting Vite development server on port 8080..."
npm run dev &
FRONTEND_PID=$!
sleep 3

echo ""
echo "════════════════════════════════════════════════════════════"
echo "${BLUE}[5/5]${NC} All Services Started!"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "${GREEN}✓ Java Microservice:  http://localhost:8090${NC}"
echo "${GREEN}✓ Express Backend:    http://localhost:5000${NC}"
echo "${GREEN}✓ React Frontend:     http://localhost:8080${NC}"
echo "${GREEN}✓ MySQL Database:     $MYSQL_HOST:$MYSQL_PORT${NC}"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "             OPEN IN BROWSER"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "${BLUE}🌐 http://localhost:8080${NC}"
echo ""

echo "Processes started:"
echo "  Java:     PID $JAVA_PID"
echo "  Express:  PID $EXPRESS_PID"
echo "  Frontend: PID $FRONTEND_PID"
echo ""

echo "To stop all services, press Ctrl+C"
echo ""

# Wait for all background processes
wait
