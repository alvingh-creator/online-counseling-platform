import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrowseCounselors from './pages/BrowseCounselors';
import BookAppointment from './pages/BookAppointment';
import ChatLink from './pages/ChatLink';
import Chat from './pages/Chat';
import Payment from './pages/Payment';
import VideoCall from './pages/VideoCall';
import Availability from './pages/Availability';
import ClientRecords from './pages/ClientRecords';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/browse-counselors" 
            element={
              <ProtectedRoute requiredRole="client">
                <BrowseCounselors />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/book-appointment/:counselorId" 
            element={
              <ProtectedRoute requiredRole="client">
                <BookAppointment />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/chat-link" 
            element={
              <ProtectedRoute>
                <ChatLink />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/chat/:appointmentId" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/payment/:appointmentId" 
            element={
              <ProtectedRoute requiredRole="client">
                <Payment />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/video/:appointmentId" 
            element={
              <ProtectedRoute>
                <VideoCall />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/availability" 
            element={
              <ProtectedRoute requiredRole="counselor">
                <Availability />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/client-records" 
            element={
              <ProtectedRoute requiredRole="client">
                <ClientRecords />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
