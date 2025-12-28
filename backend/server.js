const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

// Import DB pool
const pool = require('./config/db');

const app = express();
const server = http.createServer(app);

/* =========================
   ✅ CORS — MUST BE FIRST
========================= */
const allowedOrigins = [
  'http://app.datanetwork.online',
  'https://app.datanetwork.online',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Handle all preflight requests
app.options('*', cors());

/* =========================
   Middleware after CORS
========================= */

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global request logger
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl} | IP: ${req.ip}`);
  next();
});

// Health checks for Kubernetes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

// DB health check
app.get('/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', message: 'Database connection successful' });
  } catch (err) {
    console.error('DB Health Check Failed:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed'
    });
  }
});

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =========================
   Socket.IO
========================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket']
});

// Attach io to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* =========================
   API Routes
========================= */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/tips', require('./routes/tipRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

/* =========================
   Global Error Handler
========================= */
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', {
    message: err.message,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    error: 'Something went wrong!'
  });
});

/* =========================
   Graceful Shutdown
========================= */
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down...');
  server.close(() => process.exit(0));
  io.close();
});

/* =========================
   Start Server
========================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});

// Socket.IO logging
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});
