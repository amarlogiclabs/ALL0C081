# 🚀 CodeVerse — Complete Setup & Run Guide

A clean, end‑user friendly guide to run **CodeVerse**, a full‑stack microservices platform built with **React, Express.js, Java Spring Boot, and MySQL**.

This document is written **from scratch**, simplified for developers, testers, and deployment teams.

---

## 📌 What is CodeVerse?

**CodeVerse** is a competitive coding platform with:

* User authentication
* Real‑time battle rooms (1v1 / 2v2)
* Microservices‑based backend
* Persistent MySQL storage

---

## 🧱 System Architecture

```
Browser (User)
   ↓
React Frontend (Port 8080)
   ↓ REST API
Express Backend / API Gateway (Port 5000)
   ↓ REST API
Java User Microservice (Port 8090)
   ↓ JDBC
MySQL Database (Port 3306)
```

---

## 🛠️ Technology Stack

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS + shadcn/ui

### Backend

* Node.js
* Express.js
* JWT Authentication
* mysql2 (connection pooling)

### Microservices

* Java 17
* Spring Boot 3
* Spring Data JPA (Hibernate)

### Database

* MySQL 5.7+

---

## 🔑 MySQL Configuration (Development)

```
Host:       127.0.0.1
Port:       3306
User:       root
Password:   root254
Database:   codeverse
```

### JDBC URL

```
jdbc:mysql://127.0.0.1:3306/codeverse
```

⚠️ These credentials are **for development only**.

---

## 📁 Project Structure

```
codeverse/
├── codeverse-live/              # Frontend + Express Backend
│   ├── src/                      # React UI
│   ├── server/                   # Express API
│   │   ├── routes/
│   │   ├── services/
│   │   ├── db/
│   │   └── .env                  # MySQL config
│   └── package.json
│
├── codeverse-microservices/
│   └── user-service/             # Java Spring Boot service
│       ├── src/main/java/
│       ├── src/main/resources/
│       │   └── application.yml
│       └── pom.xml
│
├── docker-compose.yml             # Optional Docker setup
├── start-with-mysql.bat           # Windows startup
├── start-with-mysql.sh            # Linux/Mac startup
└── README_CODEVERSE.md            # (this file)
```

---

## ⚙️ Prerequisites

Install the following before running CodeVerse:

| Tool    | Version |
| ------- | ------- |
| Java    | 17+     |
| Maven   | 3.8+    |
| Node.js | 18+     |
| MySQL   | 5.7+    |

Verify installations:

```bash
java -version
mvn -version
node -v
mysql --version
```

---

## 🚀 Quick Start (Recommended)

### 1️⃣ Start MySQL

Ensure MySQL is running on port **3306**.

Test connection:

```bash
mysql -u root -p root254 -e "SELECT 1"
```

Create database (only once):

```sql
CREATE DATABASE IF NOT EXISTS codeverse;
```

---

### 2️⃣ Automatic Startup

#### Windows

```powershell
.\start-with-mysql.bat
```

#### Linux / macOS

```bash
chmod +x start-with-mysql.sh
./start-with-mysql.sh
```

This will start:

* Java Microservice (8090)
* Express Backend (5000)
* React Frontend (8080)

---

## 🧑‍💻 Manual Startup (3 Terminals)

### Terminal 1 — Java Microservice

```bash
cd codeverse-microservices/user-service
mvn spring-boot:run
```

Expected:

```
Tomcat started on port(s): 8090
```

---

### Terminal 2 — Express Backend

```bash
cd codeverse-live/server
npm install
npm run dev
```

Expected:

```
Server running on http://localhost:5000
```

---

### Terminal 3 — React Frontend

```bash
cd codeverse-live
npm install
npm run dev
```

Expected:

```
Local: http://localhost:8080
```

---

## 🌐 Access URLs

| Service      | URL                                                                |
| ------------ | ------------------------------------------------------------------ |
| Frontend     | [http://localhost:8080](http://localhost:8080)                     |
| Backend API  | [http://localhost:5000/api](http://localhost:5000/api)             |
| User Service | [http://localhost:8090/api/users](http://localhost:8090/api/users) |
| MySQL        | 127.0.0.1:3306                                                     |

---

## 🧪 Health Checks

```bash
# Backend
curl http://localhost:5000/api/health

# Java Microservice
curl http://localhost:8090/api/users/health/check
```

---

## 🔐 Authentication Flow

```
User Signup/Login
 → React Frontend
 → Express Backend (JWT)
 → Java User Service
 → MySQL Database
```

JWT token is stored securely on the client.

---

## 🗄️ Core Database Tables

```
user_profiles
match_rooms
room_participants
match_scores
```

All tables are automatically created when MySQL is connected.

---

## ⚠️ Common Issues & Fixes

### MySQL Connection Refused

* Ensure MySQL service is running
* Check port 3306
* Verify credentials in `.env` and `application.yml`

---

### Backend Using Mock Database

This happens when MySQL is not reachable.

Fix:

```bash
mysql -u root -p root254 -e "SELECT 1"
Restart backend
```

---

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000
```

Kill the process and restart.

---

## 🔒 Security Notes (Production)

❌ Do NOT use:

* root user
* plain passwords

✅ Recommended:

* Dedicated DB user
* Strong passwords
* SSL enabled
* Secrets via environment variables

---

## 🐳 Docker (Optional)

Run everything with Docker:

```bash
docker-compose up -d
```

Stop:

```bash
docker-compose down
```

---

## ✅ Status

✔ Frontend ready
✔ Backend ready
✔ Microservices ready
✔ MySQL supported
✔ Development & production friendly

---

## 🎯 Final Notes

1. Start MySQL
2. Run startup script
3. Open browser
4. Create account
5. Start battling 🚀

---

**Project:** CodeVerse
**Architecture:** Microservices
**Status:** Production‑Ready
