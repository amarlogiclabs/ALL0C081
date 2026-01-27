# Code Arena - Microservices Architecture Setup Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React)                             │
│                    Port 8080                                     │
│          http://localhost:8080                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Express Backend                                      │
│              Port 5000                                           │
│          http://localhost:5000/api                               │
│  - Handles authentication                                        │
│  - Routes requests to microservices                              │
│  - Gateway pattern                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         Java Microservices                                       │
│         User Service on Port 8090                                │
│         http://localhost:8090/api/users                          │
│  - User management                                               │
│  - Direct MySQL connection                                       │
│  - Spring Boot application                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │ JDBC/MySQL Protocol
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              MySQL Database                                      │
│              Port 3306                                           │
│          127.0.0.1:3306/codeverse                                │
│  User: root                                                      │
│  Password: root254                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Java 17 or higher
- Maven 3.8.0 or higher  
- Node.js 18+ 
- MySQL 5.7+ (must be running locally)
- Docker & Docker Compose (optional, for containerized deployment)

## Setup Instructions

### Step 1: Verify MySQL is Running

```bash
# Check if MySQL is running
mysql -u root -p root254 -e "SELECT 1"

# If not running, you can start it manually:
# Windows: net start MySQL80
# macOS: brew services start mysql
# Linux: sudo service mysql start
```

### Step 2: Create Database and Tables

```bash
# Import the schema
mysql -u root -p root254 < MYSQL_SCHEMA.sql

# Verify database was created
mysql -u root -p root254 -e "SHOW DATABASES LIKE 'codeverse';"
```

### Step 3: Build and Run Java Microservice

```bash
cd code-arena-microservices/user-service

# Build with Maven
mvn clean package

# Run the service
mvn spring-boot:run
# OR
java -jar target/user-service-1.0.0.jar

# Verify it's running
curl http://localhost:8090/api/users/health/check
```

**Expected Response:**
```json
{
  "success": true,
  "data": "User Service is running",
  "message": "Health check passed"
}
```

### Step 4: Install Express Backend Dependencies

```bash
cd code-arena-live/server

npm install
```

### Step 5: Start Express Backend

```bash
npm run dev
# Server will run on port 5000
```

**Expected Output:**
```
✅ Server running on http://localhost:5000
📦 MySQL database: codeverse
🔗 CORS enabled for: http://localhost:8080
```

### Step 6: Start React Frontend

In a new terminal:

```bash
cd code-arena-live

npm run dev
# Frontend will run on port 8080
```

## Testing the Integration

### Test 1: Health Check

```bash
# Backend health
curl http://localhost:5000/api/health

# Microservices health
curl http://localhost:5000/api/health/microservices

# User service direct
curl http://localhost:8090/api/users/health/check
```

### Test 2: Get All Users

```bash
# Through Express backend (recommended)
curl http://localhost:5000/api/users

# Direct to microservice
curl http://localhost:8090/api/users
```

### Test 3: Create User (via Express Backend)

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user_test_001",
    "email": "test@example.com",
    "username": "testuser",
    "passwordHash": "$2a$10$hashedpassword",
    "elo": 1000,
    "tier": "Bronze",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=testuser"
  }'
```

### Test 4: Frontend Integration

1. Open http://localhost:8080 in your browser
2. Sign up with a new account
3. The data will flow through:
   - Frontend (React) → Backend (Express) → User Microservice (Java) → MySQL

## Communication Flow

### User Creation Flow:

```
1. Frontend (React)
   ├─ User submits signup form
   └─ POST /api/auth/signup with email, password, username

2. Express Backend
   ├─ Validates input
   ├─ Hashes password with bcryptjs
   ├─ Creates User object
   └─ POST /api/users to Java Microservice

3. Java Microservice
   ├─ Validates request
   ├─ Checks for duplicates
   └─ Saves to MySQL via JDBC

4. MySQL Database
   ├─ Stores user record
   └─ Returns success

5. Response Flow (reverse)
   ├─ Java → Express → React Frontend
   └─ User sees confirmation
```

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| React Frontend | 8080 | http://localhost:8080 |
| Express Backend | 5000 | http://localhost:5000/api |
| Java User Service | 8090 | http://localhost:8090/api/users |
| MySQL Database | 3306 | 127.0.0.1:3306 |

## Environment Variables

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
VITE_MICROSERVICE_URL=http://localhost:8090
```

### Express Backend (.env)
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root254
DB_NAME=codeverse
MICROSERVICE_URL=http://localhost:8090
PORT=5000
```

### Java Microservice (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/codeverse
    username: root
    password: root254
  jpa:
    hibernate:
      ddl-auto: validate
server:
  port: 8090
```

## Docker Deployment (Optional)

Build and run with Docker Compose:

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Troubleshooting

### Issue: "Cannot connect to MySQL"
**Solution:**
- Ensure MySQL is running: `mysql -u root -p root254 -e "SELECT 1"`
- Check credentials in environment files
- Verify database exists: `mysql -u root -p root254 -e "USE codeverse; SHOW TABLES;"`

### Issue: "Cannot connect to Java Microservice"
**Solution:**
- Ensure Java service is running on port 8090
- Check firewall settings
- Verify in console: `curl http://localhost:8090/api/users/health/check`

### Issue: "Frontend shows blank page"
**Solution:**
- Check browser console for errors (F12)
- Ensure VITE_API_URL is correctly set
- Verify Express backend is running
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: "Java service won't start"
**Solution:**
```bash
# Clean and rebuild
mvn clean compile

# Check for port conflicts
netstat -ano | findstr ":8090"

# Run with debug output
mvn spring-boot:run -Dspring-boot.run.arguments="--debug"
```

## API Endpoints

### Authentication (Express Backend)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user

### User Management (Java Microservice via Express)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/email/:email` - Get user by email
- `GET /api/users/username/:username` - Get user by username
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Next Steps

1. **Monitor Logs**: Keep terminals open to monitor all three services
2. **Test Endpoints**: Use curl or Postman to test API endpoints
3. **Add More Microservices**: Follow the same pattern to add:
   - Battle Service
   - Problem Service
   - Statistics Service
4. **Database Optimization**: Add indexes for frequently queried fields
5. **Monitoring**: Implement logging and monitoring (ELK stack, Prometheus, etc.)

## Support

For issues or questions:
1. Check the logs in terminal windows
2. Verify all services are running (use health endpoints)
3. Confirm MySQL database is accessible
4. Review error messages in browser console (F12)
