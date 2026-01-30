import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import matchRoutes from './routes/match.js';
import practiceRoutes from './routes/practice.js';
import compilerRoutes from './routes/compiler.js';
import setupMatchWebSocket, { setupBattleWebSocket } from './websocket/matchRoom.js';
import { userServiceClient } from './clients/userServiceClient.js';
import { checkCompilers } from './services/localCompiler.js';

dotenv.config();

// Check available local compilers at startup
checkCompilers();

const app = express();
const httpServer = createServer(app);

// CORS origins - allow both localhost and network IPs
// CORS origins - allow localhost and valid network IPs
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check for allowed specific origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
      process.env.CLIENT_URL
    ].filter(Boolean); // Filter out undefined if CLIENT_URL is missing

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Allow any local network IP (IPv4)
    // Matches 192.168.x.x, 10.x.x.x, 172.16.x.x (to 172.31.x.x)
    const localIpPattern = /^(http:\/\/|ws:\/\/)(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:[0-9]{1,5})?$/;

    if (localIpPattern.test(origin)) {
      return callback(null, true);
    }

    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
};

const io = new Server(httpServer, {
  cors: corsOptions
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Microservice health check
app.get('/api/health/microservices', async (req, res) => {
  const microserviceHealthy = await userServiceClient.healthCheck();
  res.json({
    status: 'ok',
    message: 'Backend health check',
    microservices: {
      userService: microserviceHealthy ? 'healthy' : 'unhealthy'
    }
  });
});

// API welcome endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CodeVerse API Server',
    version: '1.0.0',
    architecture: 'Microservices-based with Java backend',
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        signin: 'POST /api/auth/signin',
        me: 'GET /api/auth/me'
      },
      users: {
        getAll: 'GET /api/users',
        getById: 'GET /api/users/:id',
        getByEmail: 'GET /api/users/email/:email',
        getByUsername: 'GET /api/users/username/:username',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
      },
      microservices: {
        userService: 'http://localhost:8090'
      }
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/compiler', compilerRoutes);

// Setup WebSocket
try {
  setupMatchWebSocket(io);
  setupBattleWebSocket(io);
  console.log('✅ WebSocket handlers initialized (match-room + battle namespaces)');
} catch (err) {
  console.error('❌ WebSocket initialization error:', err);
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server (bind to configured host or all interfaces)
const HOST = process.env.SERVER_HOST || '0.0.0.0';
const server = httpServer.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket running on ws://${HOST}:${PORT}`);
  console.log(`📦 MySQL database: ${process.env.DB_NAME || 'codeverse'}`);
  console.log(`🔗 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'} (+ http://localhost:8080)`);
}).on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  process.exit(0);
});
