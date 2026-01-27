#!/bin/bash

# Code Arena - Microservices Quick Start Script for Linux/Mac

echo ""
echo "============================================"
echo "Code Arena - Microservices Setup"
echo "============================================"
echo ""

# Check Java installation
echo "Checking Java installation..."
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed"
    echo "Please install Java 17+ and add it to your PATH"
    exit 1
fi

# Check Maven installation
echo "Checking Maven installation..."
if ! command -v mvn &> /dev/null; then
    echo "ERROR: Maven is not installed"
    echo "Please install Maven 3.8+ and add it to your PATH"
    exit 1
fi

# Check Node installation
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js 18+ and add it to your PATH"
    exit 1
fi

# Check MySQL
echo "Checking MySQL connection..."
if ! mysql -u root -p root254 -e "SELECT 1" &> /dev/null; then
    echo "WARNING: Cannot connect to MySQL on 127.0.0.1:3306"
    echo "Please ensure MySQL is running with:"
    echo "  User: root"
    echo "  Password: root254"
    echo ""
fi

echo ""
echo "============================================"
echo "Starting Microservices"
echo "============================================"
echo ""

# Create logs directory
mkdir -p logs

# Start Java Microservice
echo "Starting Java User Service on port 8090..."
cd code-arena-microservices/user-service
mvn spring-boot:run > ../../logs/user-service.log 2>&1 &
JAVA_PID=$!
echo $JAVA_PID > ../../logs/java.pid
cd ../../

# Wait for Java to start
sleep 5

# Start Express Backend
echo "Starting Express Backend on port 5000..."
cd code-arena-live/server
npm run dev > ../../logs/backend.log 2>&1 &
EXPRESS_PID=$!
echo $EXPRESS_PID > ../../logs/express.pid
cd ../../

# Wait for Express to start
sleep 3

# Start React Frontend
echo "Starting React Frontend on port 8080..."
cd code-arena-live
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..

echo ""
echo "============================================"
echo "All services are starting..."
echo "============================================"
echo ""
echo "Services:"
echo "  - Frontend:     http://localhost:8080"
echo "  - Backend:      http://localhost:5000/api"
echo "  - User Service: http://localhost:8090/api/users"
echo "  - Database:     127.0.0.1:3306 (codeverse)"
echo ""
echo "Process IDs (stored in logs/):"
echo "  - Java:     $JAVA_PID"
echo "  - Express:  $EXPRESS_PID"
echo "  - Frontend: $FRONTEND_PID"
echo ""
echo "View logs:"
echo "  tail -f logs/user-service.log"
echo "  tail -f logs/backend.log"
echo "  tail -f logs/frontend.log"
echo ""
echo "To stop services, run: ./stop-microservices.sh"
echo ""
