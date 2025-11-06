import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function ChatLink() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      const endpoint = user?.role === 'client' 
        ? '/appointments/my-appointments'
        : '/appointments/counselor-appointments';

      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAppointments(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (appointmentId) => {
    navigate(`/chat/${appointmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-blue-600">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">💬 Chat with Counselor</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No appointments yet</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map(appointment => (
              <div key={appointment._id} className="bg-white rounded-lg shadow-lg p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {user?.role === 'client' 
                      ? appointment.counselor?.name 
                      : appointment.client?.name}
                  </h3>
                  
                  <div className="space-y-1 text-gray-600">
                    <p>
                      <strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Time:</strong> {appointment.appointmentTime}
                    </p>
                    <p>
                      <strong>Service:</strong> {appointment.serviceType}
                    </p>
                    <p>
                      <strong>Status:</strong> <span className="capitalize text-blue-600 font-semibold">{appointment.status}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenChat(appointment._id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
                >
                  Open Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
