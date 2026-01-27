# 🔗 MySQL Connection Setup Guide

**Your MySQL Connection Configuration**

```
JDBC URL:    jdbc:mysql://127.0.0.1:3306/?user=root
Host:        127.0.0.1
Port:        3306
User:        root
Password:    root254
Database:    codeverse
```

---

## ✅ Configuration Status

All your MySQL credentials are already configured in the project:

### 1. Java Microservice
✅ **File:** `code-arena-microservices/user-service/src/main/resources/application.yml`
```yaml
datasource:
  url: jdbc:mysql://127.0.0.1:3306/codeverse?useSSL=false&serverTimezone=UTC
  username: root
  password: root254
  driver-class-name: com.mysql.cj.jdbc.Driver
```

### 2. Express Backend
✅ **File:** `code-arena-live/server/.env`
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root254
DB_NAME=codeverse
```

### 3. Connection Pool
✅ **File:** `code-arena-live/server/src/db/index.js`
```javascript
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'root254',
  database: 'codeverse',
  connectionLimit: 10
});
```

---

## 🚀 Quick Start

### For Windows Users:
```powershell
# Run the startup script
.\start-with-mysql.bat
```

### For Linux/Mac Users:
```bash
# Make script executable
chmod +x start-with-mysql.sh

# Run the startup script
./start-with-mysql.sh
```

---

## 📋 Prerequisites

### 1. MySQL Must Be Installed and Running

**Check if MySQL is running:**

**Windows:**
- Open Services app (services.msc)
- Look for "MySQL80" or similar
- If not running, right-click and select "Start"

**Linux:**
```bash
sudo service mysql status
sudo service mysql start
```

**macOS:**
```bash
mysql.server status
mysql.server start
```

### 2. Verify MySQL Connection

Test your connection with these credentials:
```bash
mysql -h 127.0.0.1 -P 3306 -u root -p root254 -e "SELECT 1"
```

**Expected output:**
```
+---+
| 1 |
+---+
| 1 |
+---+
```

### 3. Create Database (if needed)

```bash
mysql -u root -p root254 -e "CREATE DATABASE IF NOT EXISTS codeverse;"
```

---

## 🔧 Manual Startup (Step by Step)

If the scripts don't work, start services manually:

### Terminal 1: Java Microservice
```bash
cd code-arena-microservices/user-service
mvn spring-boot:run
```

**Expected output:**
```
Tomcat started on port(s): 8090 (http)
```

### Terminal 2: Express Backend
```bash
cd code-arena-live/server
npm run dev
```

**Expected output:**
```
✅ Server running on http://localhost:5000
✅ MySQL database: codeverse
🔐 CORS enabled for: http://localhost:8080
```

### Terminal 3: React Frontend
```bash
cd code-arena-live
npm run dev
```

**Expected output:**
```
VITE v5.4.21 ready in X ms
➜ Local: http://localhost:8080/
```

---

## 🌐 Access the Application

**Open in Browser:**
```
http://localhost:8080
```

**API Endpoints:**
```
Backend:     http://localhost:5000/api
Microservice: http://localhost:8090/api/users
Health:      http://localhost:5000/api/health
```

---

## 🧪 Test MySQL Connection

### Test 1: Direct MySQL Connection
```bash
mysql -u root -p root254 -h 127.0.0.1 -P 3306 -e "SELECT DATABASE();"
```

### Test 2: Express Backend Connection
```bash
curl http://localhost:5000/api
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Code Arena API Server",
  "version": "1.0.0",
  "architecture": "Microservices-based with Java backend"
}
```

### Test 3: Java Microservice Connection
```bash
curl http://localhost:8090/api/users/health/check
```

### Test 4: Create User via API
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234",
    "username": "testuser"
  }'
```

---

## 📊 Architecture with MySQL

```
┌──────────────────────────────────────┐
│  React Frontend (Port 8080)          │
│  - User Interface                    │
│  - Login/Signup/Dashboard            │
└────────────────┬─────────────────────┘
                 │ HTTP/REST
                 ▼
┌──────────────────────────────────────┐
│  Express Backend (Port 5000)         │
│  - API Gateway                       │
│  - JWT Authentication                │
│  - Database Connection Pool          │
└────────────────┬─────────────────────┘
                 │ HTTP/REST
                 ▼
┌──────────────────────────────────────┐
│  Java Microservice (Port 8090)       │
│  - Spring Boot                       │
│  - User Management Service           │
│  - REST API                          │
└────────────────┬─────────────────────┘
                 │ JDBC/SQL
                 ▼
┌──────────────────────────────────────┐
│  MySQL Database (Port 3306)          │
│  Host: 127.0.0.1                     │
│  Database: codeverse                 │
│  User: root, Password: root254       │
└──────────────────────────────────────┘
```

---

## ⚠️ Troubleshooting

### Problem: "Cannot connect to MySQL"

**Solution:**
```bash
# Check if MySQL is running
# Windows: Services app → Look for MySQL80
# Linux: sudo service mysql status
# macOS: mysql.server status

# Test connection
mysql -u root -p root254 -h 127.0.0.1 -P 3306 -e "SELECT 1"

# If connection fails, start MySQL
# Windows: Use MySQL Installer or Services
# Linux: sudo service mysql start
# macOS: mysql.server start
```

### Problem: "Database 'codeverse' does not exist"

**Solution:**
```bash
# Create the database
mysql -u root -p root254 -e "CREATE DATABASE codeverse;"
```

### Problem: "Java Microservice won't start"

**Solution:**
```bash
# Check MySQL is running first
mysql -u root -p root254 -e "SELECT 1"

# Make sure Maven is installed
mvn -version

# Try starting again
cd code-arena-microservices/user-service
mvn clean
mvn spring-boot:run
```

### Problem: "Backend shows 'Using mock database' instead of MySQL"

**Solution:**
```bash
# This means MySQL connection failed
# Check:
1. MySQL is running
2. Credentials are correct (root/root254)
3. Database exists: mysql -u root -p root254 -e "SHOW DATABASES;" | grep codeverse
4. Port 3306 is accessible

# Then restart backend:
cd code-arena-live/server
npm run dev
```

### Problem: "Frontend won't connect to backend"

**Solution:**
```bash
# Check backend is running
curl http://localhost:5000/api

# Check CORS is working
# If you see CORS error in browser console:
# 1. Make sure backend is on port 5000
# 2. Make sure frontend is on port 8080
# 3. Check CLIENT_URL in server/.env = http://localhost:8080
```

---

## 🔍 Verify Complete Setup

Run this checklist:

```
✓ MySQL installed and running
✓ Credentials working: root / root254
✓ Database 'codeverse' exists
✓ Java 17+ installed (mvn -version works)
✓ Node.js 18+ installed (node -v works)
✓ Port 8090 available (for Java service)
✓ Port 5000 available (for Express)
✓ Port 8080 available (for React)
✓ Port 3306 accessible (for MySQL)
```

---

## 📁 Configuration Files Summary

All configuration files already contain your MySQL connection details:

1. **Java Config:**
   - File: `code-arena-microservices/user-service/src/main/resources/application.yml`
   - Status: ✅ Configured with jdbc:mysql://127.0.0.1:3306/codeverse

2. **Express Config:**
   - File: `code-arena-live/server/.env`
   - Status: ✅ Configured with DB_HOST=127.0.0.1, DB_USER=root, DB_PASSWORD=root254

3. **Startup Scripts:**
   - File: `start-with-mysql.bat` (Windows)
   - File: `start-with-mysql.sh` (Linux/Mac)
   - Status: ✅ Ready to use

---

## 🎯 Next Steps

1. **Ensure MySQL is running:**
   ```bash
   mysql -u root -p root254 -e "SELECT 1"
   ```

2. **Create database (if needed):**
   ```bash
   mysql -u root -p root254 -e "CREATE DATABASE codeverse;"
   ```

3. **Run the startup script:**
   ```bash
   # Windows
   .\start-with-mysql.bat
   
   # Linux/Mac
   ./start-with-mysql.sh
   ```

4. **Open in browser:**
   ```
   http://localhost:8080
   ```

5. **Test the connection:**
   - Create an account
   - Login
   - Data should be stored in MySQL database
   - Data persists after restart (unlike mock database)

---

## ✨ Success Indicators

When everything is working correctly, you should see:

**In Java Service Terminal:**
```
Tomcat started on port(s): 8090 (http)
Hibernate: create table user_profiles...
```

**In Express Terminal:**
```
✅ Server running on http://localhost:5000
✅ MySQL database: codeverse
🔐 CORS enabled for: http://localhost:8080
```

**In React Terminal:**
```
VITE v5.4.21 ready in X ms
➜ Local: http://localhost:8080/
```

**In Browser:**
- Page loads without errors
- Signup/Login works
- User data saves to MySQL
- Data persists across sessions

---

## 📞 Quick Reference

**Your Connection Details:**
```
Host:        127.0.0.1
Port:        3306
User:        root
Password:    root254
Database:    codeverse
JDBC URL:    jdbc:mysql://127.0.0.1:3306/?user=root
```

**Service Ports:**
```
Frontend:     8080
Backend:      5000
Microservice: 8090
MySQL:        3306
```

**Important Files:**
```
Java Config:   code-arena-microservices/user-service/src/main/resources/application.yml
Express Config: code-arena-live/server/.env
Startup Script: start-with-mysql.bat (Windows) or start-with-mysql.sh (Linux/Mac)
```

---

*Setup completed: January 27, 2026*  
*Status: Ready for MySQL Connection*
