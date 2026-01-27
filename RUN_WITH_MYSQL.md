# 🚀 Code Arena - Run with MySQL Database

## ⚠️ IMPORTANT: MySQL Must Be Running First!

Your application requires MySQL to be running on:
- **Host:** 127.0.0.1
- **Port:** 3306
- **User:** root
- **Password:** root254

---

## Step 1: Start MySQL Service

### Windows Users

**Option A: Using Services GUI**
```
1. Press Win + R
2. Type: services.msc
3. Look for "MySQL80" or "MySQL" service
4. If not running:
   - Right-click on MySQL service
   - Click "Start"
5. Wait for status to show "Running"
```

**Option B: Using PowerShell (Admin Required)**
```powershell
# As Administrator
Start-Service -Name MySQL80
# Wait a moment
Get-Service MySQL80
```

**Option C: Using Command Line**
```cmd
# In Command Prompt (as Administrator)
net start MySQL80
```

### Linux Users
```bash
sudo service mysql start
# or
sudo systemctl start mysql
```

### macOS Users
```bash
mysql.server start
```

---

## Step 2: Verify MySQL Connection

Test if MySQL is accessible with your credentials:

```bash
mysql -u root -p root254 -h 127.0.0.1 -P 3306 -e "SELECT 1"
```

**Expected output:**
```
+---+
| 1 |
+---+
| 1 |
+---+
```

If you see an error, MySQL is not running or not accessible.

---

## Step 3: Create Database (if needed)

```bash
mysql -u root -p root254 -e "CREATE DATABASE IF NOT EXISTS codeverse;"
```

---

## Step 4: Start All Services

### Method 1: Automated Script (Recommended)

**Windows:**
```powershell
cd "e:\Amarlogiclabsprojects\ALL0C081Project"
.\start-with-mysql.bat
```

**Linux/Mac:**
```bash
cd "e:\Amarlogiclabsprojects\ALL0C081Project"
chmod +x start-with-mysql.sh
./start-with-mysql.sh
```

This will automatically:
- Check MySQL connection ✓
- Create database if needed ✓
- Start Java Microservice (port 8090) ✓
- Start Express Backend (port 5000) ✓
- Start React Frontend (port 8080) ✓

### Method 2: Manual Startup (3 Terminals)

**Terminal 1: Java Microservice**
```bash
cd code-arena-microservices/user-service
mvn spring-boot:run
```

Wait for: `Tomcat started on port(s): 8090`

**Terminal 2: Express Backend**
```bash
cd code-arena-live/server
npm run dev
```

Wait for: `✅ Server running on http://localhost:5000`

**Terminal 3: React Frontend**
```bash
cd code-arena-live
npm run dev
```

Wait for: `✜ Local: http://localhost:8080/`

---

## Step 5: Access the Application

Open your browser:
```
http://localhost:8080
```

---

## 🎯 Expected Startup Output

### Java Microservice (Port 8090)
```
Tomcat started on port(s): 8090 (http)
Hibernate: create table user_profiles...
```

### Express Backend (Port 5000)
```
✅ Server running on http://localhost:5000
✅ MySQL database: codeverse
🔐 CORS enabled for: http://localhost:8080
```

### React Frontend (Port 8080)
```
VITE v5.4.21 ready in X ms
➜ Local: http://localhost:8080/
```

---

## 🧪 Testing After Startup

### Test Backend API
```bash
curl http://localhost:5000/api
curl http://localhost:5000/api/health
```

### Test Microservice
```bash
curl http://localhost:8090/api/users
```

### Test Frontend
```
Open http://localhost:8080 in browser
- Page should load without errors
- Login/Signup forms should be visible
```

---

## ⚠️ Troubleshooting

### Problem: MySQL won't start

**Windows:**
- Check Services.msc
- Make sure MySQL80 service is installed
- Try restarting the service

**Linux:**
```bash
sudo service mysql status
sudo service mysql restart
```

**macOS:**
```bash
mysql.server status
mysql.server restart
```

### Problem: Port already in use

**Windows (PowerShell):**
```powershell
# Find process using port
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess

# Kill process
Stop-Process -Id <PID> -Force

# Or kill all Node processes
Get-Process node | Stop-Process -Force
```

**Linux/Mac:**
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>

# Or kill all Node processes
pkill -f node
```

### Problem: MySQL Connection Refused

```bash
# Check MySQL is running
mysql -u root -p root254 -h 127.0.0.1 -P 3306 -e "SELECT 1"

# If connection fails:
# 1. MySQL is not running - start it
# 2. Credentials are wrong - check .env file
# 3. Port 3306 is not accessible - check firewall
```

### Problem: Backend shows "Using mock database"

This means MySQL connection failed. Check:
```bash
# Is MySQL running?
mysql -u root -p root254 -e "SELECT 1"

# Does database exist?
mysql -u root -p root254 -e "SHOW DATABASES;" | grep codeverse

# Check credentials in .env
cat code-arena-live/server/.env
```

### Problem: Java service won't start

```bash
# Make sure MySQL is running first
mysql -u root -p root254 -e "SELECT 1"

# Check Maven is installed
mvn -version

# Check Java is installed
java -version

# Try starting with verbose output
cd code-arena-microservices/user-service
mvn clean spring-boot:run
```

---

## 📊 Service Architecture

```
Browser
  ↓ http://localhost:8080
React Frontend (Vite)
  ↓ http calls
Express Backend (Port 5000)
  ├─ Handles authentication
  ├─ Routes to microservices
  └─ Manages connections
    ↓ http://localhost:8090
Java Microservice (Spring Boot)
  ├─ User management
  ├─ REST API endpoints
  └─ JDBC connection to MySQL
    ↓ JDBC Protocol
MySQL Database (Port 3306)
  └─ codeverse database
```

---

## 🔑 Configuration Files

### Java Microservice
```
File: code-arena-microservices/user-service/src/main/resources/application.yml
JDBC: jdbc:mysql://127.0.0.1:3306/codeverse
User: root
Password: root254
```

### Express Backend
```
File: code-arena-live/server/.env
DB_HOST: 127.0.0.1
DB_PORT: 3306
DB_USER: root
DB_PASSWORD: root254
DB_NAME: codeverse
```

---

## ✨ Data Persistence

With MySQL running:
- ✅ User data is stored in the database
- ✅ Data persists between restarts
- ✅ Multiple users can access the system
- ✅ Full ACID compliance

Without MySQL (mock database):
- ⚠️ Data is stored in memory only
- ⚠️ Data is lost when service restarts
- ⚠️ Development only

---

## 🎉 You're All Set!

Once all services are running, you can:
1. Create user accounts
2. Login with credentials
3. Access the dashboard
4. Data is saved to MySQL database

---

## 📞 Quick Reference

```
MySQL Connection: 127.0.0.1:3306
User: root | Password: root254

Frontend:  http://localhost:8080
Backend:   http://localhost:5000/api
Microservice: http://localhost:8090/api
Database:  MySQL (codeverse)

Start Script (Windows): .\start-with-mysql.bat
Start Script (Linux/Mac): ./start-with-mysql.sh
```

---

**Status: Ready to Run!**

Make sure MySQL is running, then start the services using the startup script or manual method above.
