import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Chat() {
  const { appointmentId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { socket, connected } = useSocket();

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket || !appointmentId) {
      if (connected === false) setLoading(true);
      return;
    }

    setLoading(false);

    socket.emit('join-chat', {
      appointmentId,
      userId: user?.id
    });

    const handleReceiveMessage = (data) => {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), ...data }
      ]);
    };

    const handleUserJoined = (data) => {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), ...data, type: 'system' }
      ]);
    };

    const handleUserLeft = (data) => {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), ...data, type: 'system' }
      ]);
    };

    const handleChatJoined = () => {
      // optional: log or show toast
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('chat-joined', handleChatJoined);

    return () => {
      socket.emit('leave-chat', {
        appointmentId,
        userId: user?.id
      });

      socket.off('receive-message', handleReceiveMessage);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('chat-joined', handleChatJoined);
    };
  }, [socket, appointmentId, user, connected]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket || !connected) return;

    const payload = {
      appointmentId,
      message: messageInput,
      sender: user?.id,
      senderName: user?.name,
      timestamp: new Date()
    };

    socket.emit('send-message', payload);

    setMessages(prev => [
      ...prev,
      { id: Date.now(), ...payload }
    ]);

    setMessageInput('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-slate-700">
            Connecting to chat…
          </p>
          <p className="text-xs text-slate-500">
            Socket status: {connected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-900">
            Appointment chat
          </h1>
          <p className="text-[11px] text-slate-500">
            {connected ? (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-600">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Disconnected
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400"
        >
          Back to dashboard
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-slate-500">
              No messages yet. Start the conversation.
            </p>
          </div>
        ) : (
          messages.map(msg => {
            if (msg.type === 'system') {
              return (
                <div
                  key={msg.id}
                  className="flex justify-center text-[11px] text-slate-500"
                >
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {msg.message}
                  </span>
                </div>
              );
            }

            const isSelf = msg.sender === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md rounded-2xl px-3 py-2 text-xs shadow-sm ${
                    isSelf
                      ? 'bg-slate-900 text-white rounded-br-sm'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-sm'
                  }`}
                >
                  <p className="mb-0.5 text-[11px] font-medium opacity-80">
                    {msg.senderName}
                  </p>
                  <p className="text-[13px] leading-snug">{msg.message}</p>
                  <p className="mt-1 text-[10px] opacity-60 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="border-t bg-white/90 backdrop-blur px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={connected ? 'Type a message…' : 'Reconnecting…'}
            disabled={!connected}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={!connected || !messageInput.trim()}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
        {!connected && (
          <p className="mt-2 text-[11px] text-rose-600">
            Connection lost. Trying to reconnect…
          </p>
        )}
      </footer>
    </div>
  );
}
