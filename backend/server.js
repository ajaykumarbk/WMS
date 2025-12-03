const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Kubernetes health checks
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

// CORS configuration - strict origin checking for production
const FRONTEND_ORIGIN = process.env.CORS_ORIGIN || "https://app.datanetwork.online";
const corsOptions = {
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Socket.IO configuration
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket'] // Force WebSocket transport in Kubernetes
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files - use absolute path for Kubernetes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/tips', require('./routes/tipRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Kubernetes liveness probe
app.get('/api/auth/health', (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown for Kubernetes
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Close all socket connections
  io.close();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`CORS configured for: ${FRONTEND_ORIGIN}`);
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});