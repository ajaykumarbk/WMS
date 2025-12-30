const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

// Import DB pool
const pool = require('./config/db');

const app = express();

/* =========================
   ✅ TRUST PROXY (REQUIRED)
========================= */
app.set('trust proxy', true);

const server = http.createServer(app);

/* =========================
   ✅ CORS (FIXED & SAFE)
========================= */
const allowedOrigins = [
  'https://app.datanetwork.online',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Explicit preflight handling (VERY IMPORTANT)
app.options('*', cors());

/* =========================
   Middleware AFTER CORS
========================= */

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(
    `[REQUEST] ${req.method} ${req.originalUrl} | Secure: ${req.secure} | IP: ${req.ip}`
  );
  next();
});

/* =========================
   Health Checks
========================= */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

app.get('/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('DB Health Check Failed:', err.message);
    res.status(500).json({ status: 'error' });
  }
});

/* =========================
   Static Files
========================= */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =========================
   Socket.IO (HTTPS SAFE)
========================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000
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
  console.error('Global Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
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
   Start Server (PORT FIXED)
========================= */
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Behind HTTPS proxy (Cloudflare + Envoy)`);
});

/* =========================
   Socket Logging
========================= */
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});
