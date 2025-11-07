import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Chat() {
  const { appointmentId } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { socket, connected } = useSocket();

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join chat room and setup message listeners
  useEffect(() => {
    if (!socket || !appointmentId) {
      if (connected === false) {
        setLoading(true);
      }
      return;
    }

    console.log('📍 Setting up chat for appointment:', appointmentId);
    setLoading(false);

    // Join the chat room
    socket.emit('join-chat', {
      appointmentId,
      userId: user?.id
    });
    console.log('✅ Joined chat room');

    // Receive messages
    const handleReceiveMessage = (data) => {
      console.log('💬 Received message:', data);
      setMessages(prev => [...prev, {
        id: Date.now(),
        ...data
      }]);
    };

    // User joined
    const handleUserJoined = (data) => {
      console.log('👤 User joined:', data);
      setMessages(prev => [...prev, {
        id: Date.now(),
        ...data,
        type: 'system'
      }]);
    };

    // User left
    const handleUserLeft = (data) => {
      console.log('👋 User left:', data);
      setMessages(prev => [...prev, {
        id: Date.now(),
        ...data,
        type: 'system'
      }]);
    };

    // Chat joined confirmation
    const handleChatJoined = (data) => {
      console.log('🎉 Chat joined successfully:', data);
    };

    // Setup listeners
    socket.on('receive-message', handleReceiveMessage);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('chat-joined', handleChatJoined);

    // Cleanup on unmount
    return () => {
      console.log('Leaving chat room...');
      socket.emit('leave-chat', {
        appointmentId,
        userId: user?.id
      });

      socket.off('receive-message', handleReceiveMessage);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('chat-joined', handleChatJoined);
    };
  }, [socket, appointmentId, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !socket || !connected) {
      console.log('⚠️ Cannot send: input empty or not connected');
      return;
    }

    console.log('📤 Sending message:', messageInput);

    // Send message through socket
    socket.emit('send-message', {
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
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">⏳ Connecting to chat...</div>
          <p className="text-gray-600">Connected to socket: {connected ? '✅' : '❌'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">💬 Chat Room</h1>
          <p className={`text-sm font-semibold ${connected ? 'text-green-600' : 'text-red-600'}`}>
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
          <p className="text-red-600 text-sm mt-2">⚠️ Connection lost. Attempting to reconnect...</p>
        )}
      </div>
    </div>
  );
}
