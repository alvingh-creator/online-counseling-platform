// frontend/context/SocketContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    if (!user || !token) {
      if (socket) socket.disconnect();
      setSocket(null);
      setConnected(false);
      return;
    }

    const SOCKET_URL =
      process.env.NODE_ENV === 'production'
        ? 'https://online-counseling-platform-api.onrender.com'
        : 'http://localhost:5000';

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    setSocket(s);

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', () => setConnected(false));

    return () => {
      s.disconnect();
    };
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
