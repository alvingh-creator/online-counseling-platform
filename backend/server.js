const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'your-deployed-frontend-url.com'
      : 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/payments', require('./routes/payments'));


// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // User joins a chat room
  socket.on('join-chat', (data) => {
    const { appointmentId, userId } = data;
    const roomName = `chat-${appointmentId}`;
    
    socket.join(roomName);
    console.log(`User ${userId} joined room ${roomName}`);
    
    // Notify others in the room
    io.to(roomName).emit('user-joined', {
      message: `User joined the chat`,
      userId
    });
  });

  // Handle incoming messages
  socket.on('send-message', (data) => {
    const { appointmentId, message, sender, senderName, timestamp } = data;
    const roomName = `chat-${appointmentId}`;

    // Broadcast message to all in the room
    io.to(roomName).emit('receive-message', {
      message,
      sender,
      senderName,
      timestamp: timestamp || new Date()
    });

    console.log(`Message from ${senderName}: ${message}`);
  });

  // User leaves chat
  socket.on('leave-chat', (data) => {
    const { appointmentId, userId } = data;
    const roomName = `chat-${appointmentId}`;
    
    socket.leave(roomName);
    io.to(roomName).emit('user-left', {
      message: `User left the chat`,
      userId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Online Counseling Platform API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
