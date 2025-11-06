import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const SOCKET_URL = 'http://localhost:5000';

export default function Chat() {
  const { appointmentId } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Scroll to bottom when new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to Socket.io
  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setLoading(false);

      // Join the chat room
      socketRef.current.emit('join-chat', {
        appointmentId,
        userId: user?.id
      });
    });

    // Receive messages
    socketRef.current.on('receive-message', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        ...data
      }]);
    });

    // User joined
    socketRef.current.on('user-joined', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        ...data,
        type: 'system'
      }]);
    });

    // User left
    socketRef.current.on('user-left', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        ...data,
        type: 'system'
      }]);
    });

    // Connection error
    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-chat', {
          appointmentId,
          userId: user?.id
        });
        socketRef.current.disconnect();
      }
    };
  }, [appointmentId, user, token]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !connected) return;

    // Send message through socket
    socketRef.current.emit('send-message', {
      appointmentId,
      message: messageInput,
      sender: user?.id,
      senderName: user?.name,
      timestamp: new Date()
    });

    // Add message to local state immediately (optimistic update)
    setMessages(prev => [...prev, {
      id: Date.now(),
      message: messageInput,
      sender: user?.id,
      senderName: user?.name,
      timestamp: new Date()
    }]);

    setMessageInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-blue-600">Connecting to chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">💬 Chat Room</h1>
          <p className={`text-sm ${connected ? 'text-green-600' : 'text-red-600'}`}>
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'system' ? (
                <div className="text-center text-gray-500 text-sm italic">
                  {msg.message}
                </div>
              ) : (
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === user?.id
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-300 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="font-semibold text-sm mb-1">{msg.senderName}</p>
                  <p>{msg.message}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white shadow-lg p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            disabled={!connected}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
          />
          <button
            type="submit"
            disabled={!connected || !messageInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:bg-gray-400"
          >
            Send
          </button>
        </form>
        {!connected && (
          <p className="text-red-600 text-sm mt-2">Connection lost. Attempting to reconnect...</p>
        )}
      </div>
    </div>
  );
}
