# Code Arena Microservices - Getting Started Guide

## What You Now Have

A **complete production-ready microservices architecture** for Code Arena that connects:
- ✅ React Frontend (Port 8080)
- ✅ Express.js Backend (Port 5000)
- ✅ Java Spring Boot Microservices (Port 8090)
- ✅ MySQL Database (Port 3306)

## Prerequisites Installation

### 1. Java 17+ Required

**Windows:**
```
Download from: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
1. Download JDK 17
2. Run installer
3. Open PowerShell and verify:
   java -version
```

**macOS:**
```bash
# Using Homebrew
brew install openjdk@17
java -version
```

**Linux:**
```bash
sudo apt-get install openjdk-17-jdk
java -version
```

### 2. Maven 3.8+ Required

**Windows:**
```
1. Download from: https://maven.apache.org/download.cgi
2. Extract to C:\Program Files\apache-maven-3.9.0
3. Add to System Path: C:\Program Files\apache-maven-3.9.0\bin
4. Open PowerShell and verify:
   mvn -version
```

**macOS:**
```bash
brew install maven
mvn -version
```

**Linux:**
```bash
sudo apt-get install maven
mvn -version
```

### 3. Node.js 18+ Required

**Windows/macOS/Linux:**
```
Download from: https://nodejs.org/
Install LTS version (18.x or 20.x)
Verify:
  node -v
  npm -v
```

### 4. MySQL 5.7+ Required

Must be **running locally** with these credentials:
- Host: `127.0.0.1`
- Port: `3306`
- User: `root`
- Password: `root254`
- Database: `codeverse`

**Verify MySQL is running:**
```bash
mysql -u root -p root254 -e "SELECT 1"
```

## Quick Start

### Step 1: Verify Setup

**Windows:**
```powershell
.\verify-setup.bat
```

**Linux/Mac:**
```bash
chmod +x verify-setup.sh
./verify-setup.sh
```

### Step 2: Start All Services (Automatic)

**Windows:**
```powershell
.\start-microservices.bat
```

**Linux/Mac:**
```bash
chmod +x start-microservices.sh
./start-microservices.sh
```

This will open 3 new terminals for:
1. Java User Microservice (Port 8090)
2. Express Backend (Port 5000)
3. React Frontend (Port 8080)

### Step 3: Access the Application

Open your browser and go to:
```
http://localhost:8080
```

## Manual Start (Step-by-Step)

If automatic scripts don't work, start each service manually:

### Terminal 1: Java User Microservice

```bash
cd code-arena-microservices/user-service
mvn clean package
mvn spring-boot:run
```

**Expected output:**
```
Tomcat started on port(s): 8090 (http)
```

### Terminal 2: Express Backend

```bash
cd code-arena-live/server
npm install
npm run dev
```

**Expected output:**
```
✅ Server running on http://localhost:5000
```

### Terminal 3: React Frontend

```bash
cd code-arena-live
npm install
npm run dev
```

**Expected output:**
```
VITE v5.4.21 ready in X ms
➜ Local: http://localhost:8080/
```

## Service Endpoints

### Frontend
```
http://localhost:8080
```

### Backend API
```
http://localhost:5000/api
```

### User Microservice
```
http://localhost:8090/api/users
```

### Health Checks
```
Backend:       http://localhost:5000/api/health
Microservice:  http://localhost:8090/api/users/health/check
```

## Testing with curl

### Test 1: Backend Health
```bash
curl http://localhost:5000/api
```

### Test 2: User Service Health
```bash
curl http://localhost:8090/api/users/health/check
```

### Test 3: Get All Users
```bash
curl http://localhost:5000/api/users
```

### Test 4: Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user_test_123",
    "email": "test@example.com",
    "username": "testuser",
    "passwordHash": "$2a$10$test",
    "elo": 1000,
    "tier": "Bronze"
  }'
```

## Troubleshooting

### "Cannot connect to MySQL"
```
❌ Problem: Connection refused on port 3306
✅ Solution:
  1. Verify MySQL is running
  2. Check credentials: root / root254
  3. Test: mysql -u root -p root254 -e "SELECT 1"
```

### "Port 8090 already in use"
```
❌ Problem: Another Java service running
✅ Solution:
  Windows:
    netstat -ano | findstr :8090
    taskkill /PID <PID> /F
  
  Linux/Mac:
    lsof -i :8090
    kill -9 <PID>
```

### "Java command not found"
```
❌ Problem: Java not installed or not in PATH
✅ Solution:
  1. Install Java 17+
  2. Add JAVA_HOME to environment variables
  3. Restart terminal
  4. Test: java -version
```

### "Maven command not found"
```
❌ Problem: Maven not installed or not in PATH
✅ Solution:
  1. Install Maven 3.8+
  2. Add M2_HOME to environment variables
  3. Add M2_HOME/bin to PATH
  4. Restart terminal
  5. Test: mvn -version
```

### "npm install fails"
```
❌ Problem: Node modules not installing
✅ Solution:
  1. Delete node_modules and package-lock.json
  2. Clear npm cache: npm cache clean --force
  3. Try again: npm install
```

### "Frontend shows blank page"
```
❌ Problem: Frontend not connecting to backend
✅ Solution:
  1. Press F12 to open developer tools
  2. Check Console tab for errors
  3. Check Network tab for failed requests
  4. Verify backend is running: curl http://localhost:5000/api
  5. Reload page: Ctrl+Shift+R (hard refresh)
```

## Architecture Diagram

```
┌─────────────────────┐
│  Browser on :8080   │
│   React Frontend    │
└──────────┬──────────┘
           │ HTTP/REST
           ▼
┌─────────────────────┐
│ Express Backend     │
│    Port 5000        │
│  - API Gateway      │
│  - JWT Auth         │
└──────────┬──────────┘
           │ HTTP/REST
           ▼
┌─────────────────────┐
│ Java User Service   │
│    Port 8090        │
│  Spring Boot 3      │
│  JPA/Hibernate      │
└──────────┬──────────┘
           │ JDBC/MySQL
           ▼
┌─────────────────────┐
│   MySQL Database    │
│    Port 3306        │
│  Database: codeverse│
│ Tables: user_...    │
└─────────────────────┘
```

## Data Flow Example

### User Signs Up:

```
1. Frontend (React)
   - User fills signup form
   - POST /api/auth/signup to Express
   
2. Express Backend
   - Validates input
   - Hashes password
   - Sends User data to Java Service
   
3. Java User Service
   - Validates and saves to MySQL
   - Returns user object
   
4. Express
   - Creates JWT token
   - Returns to frontend
   
5. Frontend
   - Saves token to localStorage
   - Redirects to dashboard
```

## Project Structure

```
code-arena/
├── code-arena-live/              # Frontend & Backend
│   ├── src/                      # React components
│   ├── server/                   # Express.js
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── clients/          # NEW: Microservice client
│   │   │   └── db/
│   │   └── package.json
│   └── Dockerfile
│
├── code-arena-microservices/     # Java Microservices
│   └── user-service/
│       ├── src/main/java/
│       │   └── com/codearena/userservice/
│       │       ├── controller/
│       │       ├── service/
│       │       ├── repository/
│       │       ├── model/
│       │       └── dto/
│       ├── pom.xml
│       └── Dockerfile
│
├── docker-compose.yml            # NEW: Container orchestration
├── MICROSERVICES_SETUP.md         # NEW: Detailed guide
├── README_MICROSERVICES.md        # NEW: Full documentation
└── start-microservices.bat/sh     # NEW: Startup scripts
```

## Database Credentials

```
URL:      jdbc:mysql://127.0.0.1:3306/codeverse
User:     root
Password: root254
Driver:   mysql-connector-j (8.2.0)
```

## Environment Variables

All configured automatically in:
- `.env.local` (Frontend)
- `server/.env` (Backend)  
- `application.yml` (Java Service)

## Important Notes

⚠️ **These are development credentials**
```
User: root
Password: root254
```

For production, use strong passwords and proper secret management!

## Next Steps

1. ✅ Install all prerequisites (Java, Maven, Node.js)
2. ✅ Ensure MySQL is running
3. ✅ Run verification: `verify-setup.bat` or `verify-setup.sh`
4. ✅ Start services: `start-microservices.bat` or `start-microservices.sh`
5. ✅ Open http://localhost:8080
6. ✅ Create account and test!

## Common Commands

### Stop Services

**Windows:** Close the terminal windows

**Linux/Mac:**
```bash
# If using start-microservices.sh
./stop-microservices.sh

# Or manually kill processes
kill $(cat logs/java.pid)
kill $(cat logs/express.pid)
kill $(cat logs/frontend.pid)
```

### View Logs

**Windows:**
- Check the open terminal windows

**Linux/Mac:**
```bash
tail -f logs/user-service.log
tail -f logs/backend.log
tail -f logs/frontend.log
```

### Clean Build

```bash
# Java
cd code-arena-microservices/user-service
mvn clean

# Backend
cd code-arena-live/server
rm -rf node_modules package-lock.json
npm install

# Frontend
cd code-arena-live
rm -rf node_modules package-lock.json
npm install
```

## Docker Deployment (Advanced)

For containerized deployment:

```bash
# Start all services in Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Support

For issues:
1. Check the open terminal windows for error messages
2. Verify each service is running via health endpoints
3. Review browser console (F12) for JavaScript errors
4. Check `.env` files have correct credentials

## Documentation Files

- `MICROSERVICES_SETUP.md` - Comprehensive setup guide
- `README_MICROSERVICES.md` - Full project documentation
- `MICROSERVICES_INTEGRATION_SUMMARY.md` - What was created

**You're all set! Start with the Quick Start section above.** 🚀
