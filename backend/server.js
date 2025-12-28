

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

// Import DB pool (with the ssl fix above)
const pool = require('./config/db');  // Adjust path if your db file is elsewhere

const app = express();
const server = http.createServer(app);

// Health checks for Kubernetes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

// Test DB connection endpoint (very useful for debugging)
app.get('/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', message: 'Database connection successful' });
  } catch (err) {
    console.error('DB Health Check Failed:', err.message, err.stack);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: err.message
    });
  }
});

// CORS - Allow both HTTP and HTTPS (critical for current setup)
const allowedOrigins = [
  'http://app.datanetwork.online',
  'https://app.datanetwork.online',
  'http://localhost:5173',      // Vite default dev
  'http://localhost:3000'       // React default dev
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Socket.IO with same CORS
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach io to req (for use in routes)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/tips', require('./routes/tipRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Error handling middleware (improved logging)
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  io.close(() => {
    console.log('Socket.IO closed');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});

// Socket.IO connection logging
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});



// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// const path = require('path');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);

// // Kubernetes health checks
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'healthy' });
// });

// app.get('/ready', (req, res) => {
//   res.status(200).json({ status: 'ready' });
// });

// // CORS configuration - strict origin checking for production
// const FRONTEND_ORIGIN = process.env.CORS_ORIGIN || "https://app.datanetwork.online";
// const corsOptions = {
//   origin: FRONTEND_ORIGIN,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// };

// app.use(cors(corsOptions));

// // Socket.IO configuration
// const io = new Server(server, {
//   cors: corsOptions,
//   pingTimeout: 60000,
//   pingInterval: 25000,
//   transports: ['websocket'] // Force WebSocket transport in Kubernetes
// });

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Static files - use absolute path for Kubernetes
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Attach io to req
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

// // API Routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/complaints', require('./routes/complaintRoutes'));
// app.use('/api/tips', require('./routes/tipRoutes'));
// app.use('/api/analytics', require('./routes/analyticsRoutes'));

// // Kubernetes liveness probe
// app.get('/api/auth/health', (req, res) => {
//   res.json({ status: "ok" });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// // Graceful shutdown for Kubernetes
// process.on('SIGTERM', () => {
//   console.log('SIGTERM received. Shutting down gracefully...');
//   server.close(() => {
//     console.log('Server closed');
//     process.exit(0);
//   });

//   // Close all socket connections
//   io.close();
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Backend running on port ${PORT}`);
//   console.log(`CORS configured for: ${FRONTEND_ORIGIN}`);
// });

// io.on('connection', (socket) => {
//   console.log('Socket connected:', socket.id);

//   socket.on('disconnect', () => {
//     console.log('Socket disconnected:', socket.id);
//   });
// });