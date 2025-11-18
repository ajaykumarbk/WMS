const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS setup
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

const io = new Server(server, {
  cors: { origin: FRONTEND_ORIGIN }
});

app.use(cors({ origin: FRONTEND_ORIGIN }));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

//Health endpoint for Kubernetes
app.get("/api/auth/health", (req, res) => {
  res.json({ status: "ok" });
});

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/tips', require('./routes/tipRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
});


// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: '*' } });

// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static('uploads'));

// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/complaints', require('./routes/complaintRoutes'));
// app.use('/api/tips', require('./routes/tipRoutes'));
// app.use('/api/analytics', require('./routes/analyticsRoutes'));

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);
// });