import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AppointmentCard from '../components/AppointmentCard';

const API_URL =
process.env.REACT_APP_API_URL ||
'https://online-counseling-platform-api.onrender.com/api';

export default function ClientDashboard() {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await axios.get(`${API_URL}/appointments/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">💚 CounselHub</h1>
          <div className="space-x-4 flex items-center">
            <span className="text-white font-semibold">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-lg'
            }`}
          >
            👤 My Profile
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-lg'
            }`}
          >
            📅 My Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('findCounselor')}
            className={`px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 whitespace-nowrap ${
              activeTab === 'findCounselor'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-lg'
            }`}
          >
            🔍 Find Counselor
          </button>
          <button
            onClick={() => navigate('/client-records')}
            className="px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 whitespace-nowrap bg-white text-gray-700 hover:shadow-lg"
          >
            📋 My Records
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              My Profile
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Info */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-200">
                <h3 className="text-2xl font-bold mb-6 text-blue-900">Personal Information</h3>
                
                <div className="space-y-5">
                  <div className="border-b-2 border-blue-200 pb-4">
                    <label className="text-blue-600 font-semibold text-sm uppercase">Name</label>
                    <p className="text-gray-800 text-xl font-bold">{user?.name}</p>
                  </div>
                  
                  <div className="border-b-2 border-blue-200 pb-4">
                    <label className="text-blue-600 font-semibold text-sm uppercase">Email</label>
                    <p className="text-gray-800 text-lg">{user?.email}</p>
                  </div>
                  
                  <div className="border-b-2 border-blue-200 pb-4">
                    <label className="text-blue-600 font-semibold text-sm uppercase">Account Type</label>
                    <p className="text-gray-800 text-lg"><span className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full font-bold">Client</span></p>
                  </div>
                  
                  <div>
                    <label className="text-blue-600 font-semibold text-sm uppercase">Member Since</label>
                    <p className="text-gray-800 text-lg">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
                  <h3 className="text-5xl font-bold mb-1">{appointments.length}</h3>
                  <p className="text-green-100 text-lg">Total Appointments</p>
                </div>

                <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
                  <h3 className="text-5xl font-bold mb-1">
                    {appointments.filter(a => a.status === 'confirmed').length}
                  </h3>
                  <p className="text-purple-100 text-lg">Confirmed Bookings</p>
                </div>

                <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
                  <h3 className="text-5xl font-bold mb-1">
                    ₹{appointments.reduce((sum, a) => sum + (a.amount || 0), 0)}
                  </h3>
                  <p className="text-orange-100 text-lg">Total Spent</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              My Appointments
            </h2>
            
            {loadingAppointments ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="inline-block animate-spin">
                  <div className="text-4xl">⏳</div>
                </div>
                <p className="text-gray-500 text-lg mt-4">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg mb-6">No appointments yet</p>
                <button
                  onClick={() => setActiveTab('findCounselor')}
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
                >
                  📅 Book an Appointment
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {appointments.map(appointment => (
                  <ClientAppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    token={token}
                    onUpdate={fetchAppointments}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Find Counselor Tab */}
        {activeTab === 'findCounselor' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Find a Counselor
            </h2>
            
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg mb-6">Browse and book appointments with our licensed counselors</p>
              <a
                href="/browse-counselors"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
              >
                Browse Counselors
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Client-specific appointment card
function ClientAppointmentCard({ appointment, token, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-gradient-to-r from-green-400 to-green-600';
      case 'pending': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'completed': return 'bg-gradient-to-r from-blue-400 to-blue-600';
      case 'rejected': return 'bg-gradient-to-r from-red-400 to-red-600';
      case 'cancelled': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed': return '✓';
      case 'pending': return '⏳';
      case 'completed': return '✓✓';
      case 'rejected': return '✕';
      case 'cancelled': return '✕';
      default: return '•';
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/appointments/cancel/${appointment._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate?.();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Failed to cancel'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
      {/* Header with Status */}
      <div className={`${getStatusColor(appointment.status)} p-6 text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold mb-1">
              {appointment.counselor?.name}
            </h3>
            <p className="text-sm opacity-90">
              {appointment.counselor?.specialization}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-1">{getStatusIcon(appointment.status)}</div>
            <span className="text-xs font-bold uppercase tracking-wider bg-black bg-opacity-20 px-3 py-1 rounded-full">
              {appointment.status}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold">📅 Date</p>
            <p className="text-lg font-bold text-gray-800">
              {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold">🕐 Time</p>
            <p className="text-lg font-bold text-gray-800">
              {appointment.appointmentTime}
            </p>
          </div>
        </div>

        {/* Service Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold">💼 Service</p>
            <p className="text-sm font-bold text-gray-800 capitalize">
              {appointment.serviceType?.replace('-', ' ')}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold">📱 Type</p>
            <p className="text-sm font-bold text-gray-800 capitalize">
              {appointment.sessionType}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg mb-4">
          <p className="text-xs text-gray-600 font-semibold">💰 Amount</p>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
            ₹{appointment.amount}
          </p>
        </div>

        {/* Your Notes */}
        {appointment.notes && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
            <p className="text-xs text-gray-600 font-semibold mb-1">📝 Your Notes</p>
            <p className="text-sm text-gray-700">{appointment.notes}</p>
          </div>
        )}

        {/* Counselor Notes */}
        {appointment.counselorNotes && (
          <div className="bg-purple-50 p-4 rounded-lg mb-4 border-l-4 border-purple-500">
            <p className="text-xs text-gray-600 font-semibold mb-1">📋 Counselor Notes</p>
            <p className="text-sm text-gray-700">{appointment.counselorNotes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-gray-50 px-6 py-4 flex gap-3 flex-wrap">
        {appointment.status === 'confirmed' && (
          <a
            href={`/video/${appointment._id}`}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 text-center"
          >
            🎥 Join Video
          </a>
        )}
        <a
          href={`/chat/${appointment._id}`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 text-center"
        >
          💬 Chat
        </a>
        {appointment.status !== 'cancelled' && appointment.status !== 'rejected' && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50"
          >
            ✕ Cancel
          </button>
        )}
      </div>
    </div>
  );
}
