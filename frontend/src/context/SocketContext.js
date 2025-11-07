import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    // Only connect if user is logged in
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setConnected(false);
      return;
    }

    // Determine backend URL
    let SOCKET_URL;
    
    if (process.env.NODE_ENV === 'production') {
      // Use Render backend in production
      SOCKET_URL = 'https://online-counseling-platform-api.onrender.com';
    } else {
      // Use localhost in development
      SOCKET_URL = 'http://localhost:5000';
    }

    console.log('🔌 Connecting to Socket at:', SOCKET_URL);

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected with ID:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected, reason:', reason);
      setConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection...');
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
