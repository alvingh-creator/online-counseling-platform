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

// CORS Configuration - WORKS FOR BOTH DEV AND PRODUCTION
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://alvin-online-counseling-platform.netlify.app'
];

// Socket.io setup with CORS
const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowEIO3: true
  },
  transports: ['websocket', 'polling']
});

// Connect to database
connectDB();

// Middleware - CORS for Express
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('❌ CORS blocked origin:', origin);
      return callback(new Error('CORS policy: Origin not allowed'), false);
    }
    console.log('✅ CORS allowed origin:', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
  console.log('✅ New user connected:', socket.id);
  console.log('Total connected users:', io.engine.clientsCount);

  // User joins a chat room
  socket.on('join-chat', (data) => {
    try {
      const { appointmentId, userId } = data;
      const roomName = `chat-${appointmentId}`;
      
      socket.join(roomName);
      console.log(`👤 User ${userId} joined room ${roomName}`);
      console.log(`📊 Users in room ${roomName}:`, io.sockets.adapter.rooms.get(roomName)?.size || 0);
      
      socket.to(roomName).emit('user-joined', {
        message: `User joined the chat`,
        userId,
        timestamp: new Date()
      });

      socket.emit('chat-joined', {
        message: 'You joined the chat',
        roomName
      });
    } catch (error) {
      console.error('Error in join-chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle incoming messages
  socket.on('send-message', (data) => {
    try {
      const { appointmentId, message, sender, senderName, timestamp } = data;
      const roomName = `chat-${appointmentId}`;

      console.log(`💬 Message from ${senderName} in ${roomName}: ${message}`);

      io.to(roomName).emit('receive-message', {
        message,
        sender,
        senderName,
        timestamp: timestamp || new Date(),
        appointmentId
      });
    } catch (error) {
      console.error('Error in send-message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // User leaves chat
  socket.on('leave-chat', (data) => {
    try {
      const { appointmentId, userId } = data;
      const roomName = `chat-${appointmentId}`;
      
      socket.leave(roomName);
      console.log(`👋 User ${userId} left room ${roomName}`);
      
      io.to(roomName).emit('user-left', {
        message: `User left the chat`,
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error in leave-chat:', error);
    }
  });

  // Handle video call events
  socket.on('initiate-video-call', (data) => {
    try {
      const { appointmentId, callerId, callerName } = data;
      const roomName = `video-${appointmentId}`;
      
      socket.join(roomName);
      socket.to(roomName).emit('incoming-video-call', {
        callerId,
        callerName,
        appointmentId
      });
      console.log(`📞 Video call initiated in ${roomName}`);
    } catch (error) {
      console.error('Error in video call:', error);
    }
  });

  socket.on('webrtc-offer', (data) => {
    const { appointmentId, offer } = data;
    const roomName = `video-${appointmentId}`;
    socket.to(roomName).emit('webrtc-offer', { offer, senderId: socket.id });
  });

  socket.on('webrtc-answer', (data) => {
    const { appointmentId, answer } = data;
    const roomName = `video-${appointmentId}`;
    socket.to(roomName).emit('webrtc-answer', { answer, senderId: socket.id });
  });

  socket.on('webrtc-ice-candidate', (data) => {
    const { appointmentId, candidate } = data;
    const roomName = `video-${appointmentId}`;
    socket.to(roomName).emit('webrtc-ice-candidate', { candidate });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    console.log('Total connected users:', io.engine.clientsCount);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Online Counseling Platform API',
    status: 'running',
    timestamp: new Date()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date(),
    connectedUsers: io.engine.clientsCount,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io initialized`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ CORS enabled for:`, allowedOrigins);
});
