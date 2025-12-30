const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

// DB
const pool = require('./config/db');

const app = express();

/* =========================
   TRUST PROXY (REQUIRED)
========================= */
app.set('trust proxy', true);

/* =========================
   CORS (SAFE – but frontend is same-origin now)
========================= */
const allowedOrigins = [
  'https://app.datanetwork.online',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

/* =========================
   BODY PARSERS
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   REQUEST LOGGER
========================= */
app.use((req, res, next) => {
  console.log(
    `[REQUEST] ${req.method} ${req.originalUrl} | Secure=${req.secure} | IP=${req.ip}`
  );
  next();
});

/* =========================
   HEALTH CHECKS (K8s / Envoy)
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
    res.status(500).json({ status: 'db_error' });
  }
});

/* =========================
   STATIC FILES
========================= */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =========================
   API ROUTES (IMPORTANT)
========================= */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/tips', require('./routes/tipRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

/* =========================
   HTTP SERVER + SOCKET.IO
========================= */
const server = http.createServer(app);

const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: allowedOrigins,
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

/* =========================
   START SERVER (CRITICAL FIX)
========================= */
const PORT = process.env.PORT || 8080;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`✅ Listening on 0.0.0.0 (Kubernetes compatible)`);
});

/* =========================
   GRACEFUL SHUTDOWN
========================= */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
  io.close();
});
