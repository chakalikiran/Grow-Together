const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to Database
connectDB().then(async () => {
  const User = require('./models/User');
  try {
    if (!(await User.findOne({ email: 'mentor@example.com' }))) {
      await User.create({
        name: 'Senior Mentor',
        email: 'mentor@example.com',
        password: 'password123',
        role: 'mentor'
      });
      console.log('Test Mentor user seeded: mentor@example.com / password123');
    }
  } catch (e) {
    console.log('Seed skip:', e.message);
  }
});

const app = express();
const httpServer = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Real-time chat namespace
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join a meeting room
  socket.on('join-room', ({ roomId, userName }) => {
    socket.join(roomId);
    socket.data.userName = userName;
    socket.data.roomId = roomId;
    console.log(`${userName} joined room: ${roomId}`);
    // Notify others in room
    socket.to(roomId).emit('user-joined', { userName });
  });

  // Broadcast a chat message to the room
  socket.on('chat-message', ({ roomId, text, sender, timestamp }) => {
    io.to(roomId).emit('chat-message', { sender, text, timestamp });
  });

  // Leave room
  socket.on('leave-room', ({ roomId, userName }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', { userName });
  });

  socket.on('disconnect', () => {
    const { userName, roomId } = socket.data;
    if (roomId && userName) {
      socket.to(roomId).emit('user-left', { userName });
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Optional: Make uploads folder static for general file access
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running smoothly.' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/doubts', require('./routes/doubtRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
