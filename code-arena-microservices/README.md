# Codeverse Java Microservices

This directory contains Java microservices that work with the Codeverse application.

## Architecture

```
Frontend (React) on port 8080
       ↓
Express Backend on port 5000
       ↓
Java Microservices on port 8090
       ↓
MySQL Database (127.0.0.1:3306)
```

## Services

### User Service (Port 8090)

Manages user operations with direct MySQL integration.

**Build and Run:**

```bash
cd user-service
mvn clean package
mvn spring-boot:run
```

**API Endpoints:**

- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/email/{email}` - Get user by email
- `GET /api/users/username/{username}` - Get user by username
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `GET /api/users/health/check` - Health check

## Database Configuration

Update `src/main/resources/application.yml` with your MySQL credentials:

```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/codeverse?useSSL=false&serverTimezone=UTC
    username: root
    password: root254
```

## Integration with Express Backend

The Express backend (port 5000) will forward user-related requests to this Java microservice (port 8090).

Example request flow:
```
Frontend -> Express (5000) -> Java Microservice (8090) -> MySQL (3306)
```

## Requirements

- Java 17 or higher
- Maven 3.8.0 or higher
- MySQL 5.7+ (should be running on 127.0.0.1:3306)

## Testing

Once running, test the service with curl:

```bash
# Health check
curl http://localhost:8090/api/users/health/check

# Get all users
curl http://localhost:8090/api/users

# Get user by email
curl http://localhost:8090/api/users/email/demo@codearea.com
```

## Microservices Communication

The Java microservice communicates with MySQL directly. The Express backend will:
1. Receive requests from the React frontend
2. Forward user requests to the Java microservice (port 8090)
3. Return responses back to the frontend
