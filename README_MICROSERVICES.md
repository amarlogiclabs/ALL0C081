# Code Arena - Microservices Architecture

A complete full-stack application with microservices architecture connecting React frontend, Express.js backend, Java Spring Boot microservices, and MySQL database.

## System Overview

```
┌──────────────────────────────────────────────────────┐
│            React Frontend (Port 8080)                 │
│         User Interface & Authentication               │
└────────────┬─────────────────────────────────────────┘
             │ HTTP/REST API calls
             ▼
┌──────────────────────────────────────────────────────┐
│          Express.js Backend (Port 5000)               │
│  - API Gateway                                        │
│  - Authentication (JWT)                               │
│  - Routes requests to microservices                   │
└────────────┬─────────────────────────────────────────┘
             │ HTTP/REST microservice calls
             ▼
┌──────────────────────────────────────────────────────┐
│     Java Spring Boot User Service (Port 8090)         │
│  - User Management                                    │
│  - Direct MySQL connectivity                          │
│  - Business Logic Layer                               │
└────────────┬─────────────────────────────────────────┘
             │ JDBC/SQL queries
             ▼
┌──────────────────────────────────────────────────────┐
│        MySQL Database (Port 3306)                     │
│        Database: codeverse                            │
│        User: root | Password: root254                 │
└──────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- **Java 17+** - [Download](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- **Maven 3.8+** - [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MySQL 5.7+** - Must be running locally on `127.0.0.1:3306`
  - User: `root`
  - Password: `root254`

### Setup (Automated)

**Windows:**
```bash
.\start-microservices.bat
```

**Linux/Mac:**
```bash
chmod +x start-microservices.sh
./start-microservices.sh
```

### Setup (Manual)

#### 1. Start Java Microservice

```bash
cd code-arena-microservices/user-service
mvn clean package
mvn spring-boot:run
```

Expected output:
```
Tomcat started on port(s): 8090
```

#### 2. Start Express Backend

In a new terminal:
```bash
cd code-arena-live/server
npm install
npm run dev
```

Expected output:
```
✅ Server running on http://localhost:5000
```

#### 3. Start React Frontend

In another new terminal:
```bash
cd code-arena-live
npm install
npm run dev
```

Expected output:
```
VITE v5.4.21 ready in 500 ms
➜ Local: http://localhost:8080/
```

## Service Details

### Frontend (React + Vite)
- **Port:** 8080
- **URL:** http://localhost:8080
- **Technology:** React 18, TypeScript, Vite
- **Purpose:** User interface, login, battle arena

### Backend (Express.js)
- **Port:** 5000
- **URL:** http://localhost:5000/api
- **Technology:** Node.js, Express, JWT
- **Purpose:** API gateway, authentication, service routing

### User Microservice (Java Spring Boot)
- **Port:** 8090
- **URL:** http://localhost:8090/api/users
- **Technology:** Java 17, Spring Boot 3, JPA
- **Purpose:** User management, MySQL operations

### Database (MySQL)
- **Port:** 3306
- **Host:** 127.0.0.1
- **Database:** codeverse
- **User:** root
- **Password:** root254

## API Endpoints

### Authentication (via Express Backend)
```
POST   /api/auth/signup          - Register new user
POST   /api/auth/signin          - Login with credentials
GET    /api/auth/me              - Get current user profile
```

### Users (via Java Microservice)
```
GET    /api/users                - Get all users
GET    /api/users/:id            - Get user by ID
GET    /api/users/email/:email   - Find user by email
GET    /api/users/username/:username - Find user by username
POST   /api/users                - Create new user
PUT    /api/users/:id            - Update user
DELETE /api/users/:id            - Delete user
```

### Health & Status
```
GET    /api                      - API info
GET    /api/health               - Backend health
GET    /api/health/microservices - Microservices status
```

## Testing

### Test Frontend
```bash
curl http://localhost:8080
```

### Test Backend
```bash
curl http://localhost:5000/api
```

### Test User Service
```bash
curl http://localhost:8090/api/users/health/check
```

### Test Database Connection
```bash
mysql -u root -p root254 -e "USE codeverse; SHOW TABLES;"
```

## Project Structure

```
code-arena-live/
├── src/                          # React frontend
│   ├── components/              # React components
│   ├── pages/                   # Page components
│   ├── lib/                     # Utilities
│   └── App.tsx                  # Main component
├── server/                      # Express backend
│   ├── src/
│   │   ├── index.js            # Main server file
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── db/                 # Database config
│   │   ├── middleware/         # Express middleware
│   │   ├── clients/            # Microservice clients
│   │   └── models/             # Data models
│   ├── package.json
│   └── Dockerfile
├── Dockerfile                   # Frontend Docker config
└── docker-compose.yml          # Container orchestration

code-arena-microservices/
└── user-service/               # Java User Microservice
    ├── src/main/java/
    │   └── com/codearena/userservice/
    │       ├── UserServiceApplication.java
    │       ├── controller/     # REST controllers
    │       ├── service/        # Business logic
    │       ├── repository/     # Data access
    │       ├── model/          # Entity classes
    │       └── dto/            # Data transfer objects
    ├── src/main/resources/
    │   └── application.yml     # Spring config
    ├── pom.xml                 # Maven config
    └── Dockerfile
```

## Communication Flow Example

### User Registration Flow:
```
1. Frontend (React)
   └─ User fills signup form
   └─ POST /api/auth/signup
   
2. Express Backend
   ├─ Validates input
   ├─ Hashes password (bcryptjs)
   ├─ Creates User object
   └─ POST /api/users → Java Microservice
   
3. Java User Service
   ├─ Validates request
   ├─ Checks duplicates
   ├─ Saves to MySQL via JPA
   └─ Returns UserDTO
   
4. Express Backend
   ├─ Generates JWT token
   └─ Returns to Frontend
   
5. React Frontend
   └─ Stores token in localStorage
   └─ Redirects to dashboard
```

## Database Schema

The microservices use the following tables:

```sql
user_profiles
  - id (PRIMARY KEY)
  - email (UNIQUE)
  - username (UNIQUE)
  - password_hash
  - elo
  - tier
  - total_matches
  - wins
  - avatar
  - created_at
  - updated_at
```

## Troubleshooting

### Issue: "Connection refused" on port 8090
**Solution:** Ensure Java microservice is running
```bash
# Check if service is running
netstat -an | grep 8090
# Or directly
curl http://localhost:8090/api/users/health/check
```

### Issue: "Cannot connect to MySQL"
**Solution:** Verify MySQL is running and accessible
```bash
mysql -u root -p root254 -e "SELECT 1"
```

### Issue: Frontend shows blank page
**Solution:** Check that all services are running
```bash
# Test each service
curl http://localhost:8080
curl http://localhost:5000/api
curl http://localhost:8090/api/users
```

### Issue: "Port already in use"
**Solution:** Check and kill processes on specific ports
```bash
# Windows
netstat -ano | findstr :8090
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8090
kill -9 <PID>
```

## Docker Deployment

Deploy all services with Docker:

```bash
# Build and run all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Environment Configuration

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_MICROSERVICE_URL=http://localhost:8090
```

### Backend (.env)
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root254
DB_NAME=codeverse
MICROSERVICE_URL=http://localhost:8090
PORT=5000
NODE_ENV=development
```

### Java Microservice (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/codeverse
    username: root
    password: root254
server:
  port: 8090
```

## Performance Monitoring

### Monitor Backend
```bash
curl http://localhost:5000/api/health/microservices
```

### Monitor Java Service
```bash
curl http://localhost:8090/api/users/health/check
```

### View Logs

**Backend logs:**
```bash
tail -f logs/backend.log
```

**Java logs:**
```bash
tail -f logs/user-service.log
```

## Future Enhancements

1. **Add more microservices:**
   - Battle Service
   - Problem Service
   - Statistics Service

2. **Implement features:**
   - WebSocket for real-time battles
   - Code execution service (sandbox)
   - Leaderboard system

3. **Infrastructure:**
   - Load balancing (Nginx/HAProxy)
   - Caching (Redis)
   - Message queue (RabbitMQ/Kafka)
   - Service discovery (Eureka/Consul)

## Support & Documentation

- See `MICROSERVICES_SETUP.md` for detailed setup guide
- Check individual README files in each service directory
- Review API documentation at `/api` endpoint

## License

MIT License - See LICENSE file for details
