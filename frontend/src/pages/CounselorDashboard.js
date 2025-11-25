import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AppointmentCard from '../components/AppointmentCard';

const API_URL =
process.env.REACT_APP_API_URL ||
'https://online-counseling-platform-api.onrender.com/api';
export default function CounselorDashboard() {
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
      const response = await axios.get(`${API_URL}/appointments/counselor-appointments`, {
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

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">💚 CounselHub Pro</h1>
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
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-lg'
            }`}
          >
            👤 My Profile
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-lg'
            }`}
          >
            📅 Appointments ({appointments.length})
          </button>
          <button
            onClick={() => navigate('/availability')}
            className="px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 whitespace-nowrap bg-white text-gray-700 hover:shadow-lg"
          >
            ⏰ Manage Availability
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              My Professional Profile
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Info */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border-2 border-green-200">
                <h3 className="text-2xl font-bold mb-6 text-green-900">Personal Information</h3>
                
                <div className="space-y-5">
                  <div className="border-b-2 border-green-200 pb-4">
                    <label className="text-green-600 font-semibold text-sm uppercase">Name</label>
                    <p className="text-gray-800 text-xl font-bold">{user?.name}</p>
                  </div>
                  
                  <div className="border-b-2 border-green-200 pb-4">
                    <label className="text-green-600 font-semibold text-sm uppercase">Email</label>
                    <p className="text-gray-800 text-lg">{user?.email}</p>
                  </div>
                  
                  <div className="border-b-2 border-green-200 pb-4">
                    <label className="text-green-600 font-semibold text-sm uppercase">Specialization</label>
                    <p className="text-gray-800 text-lg">{user?.specialization || 'Not set'}</p>
                  </div>
                  
                  <div className="border-b-2 border-green-200 pb-4">
                    <label className="text-green-600 font-semibold text-sm uppercase">License Number</label>
                    <p className="text-gray-800 text-lg">{user?.licenseNumber || 'Not set'}</p>
                  </div>

                  <div>
                    <label className="text-green-600 font-semibold text-sm uppercase">Hourly Rate</label>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                      ₹{user?.hourlyRate || '0'}/hour
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
                  <h3 className="text-5xl font-bold mb-1">⏳ {pendingCount}</h3>
                  <p className="text-yellow-100 text-lg">Pending Bookings</p>
                </div>

                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
                  <h3 className="text-5xl font-bold mb-1">✓ {confirmedCount}</h3>
                  <p className="text-green-100 text-lg">Confirmed Sessions</p>
                </div>

                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
                  <h3 className="text-5xl font-bold mb-1">✓✓ {completedCount}</h3>
                  <p className="text-blue-100 text-lg">Completed Sessions</p>
                </div>

                <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition">
                  <h3 className="text-5xl font-bold mb-1">
                    ₹{appointments.reduce((sum, a) => sum + (a.amount || 0), 0)}
                  </h3>
                  <p className="text-purple-100 text-lg">Potential Earnings</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Your Appointments
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
                <p className="text-gray-500 text-lg">No appointments yet</p>
                <p className="text-gray-400 text-sm mt-2">Clients will book with you soon!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {appointments.map(appointment => (
                  <CounselorAppointmentCard
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
      </div>
    </div>
  );
}

// Counselor-specific appointment card with video button
function CounselorAppointmentCard({ appointment, token, onUpdate }) {
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState(appointment.counselorNotes || '');
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

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/appointments/confirm/${appointment._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate?.();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Failed to confirm'));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this appointment?')) return;
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/appointments/reject/${appointment._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate?.();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Failed to reject'));
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/appointments/complete/${appointment._id}`,
        { notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowNotesModal(false);
      onUpdate?.();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Failed to complete'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105">
        {/* Header with Status */}
        <div className={`${getStatusColor(appointment.status)} p-6 text-white`}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                {appointment.client?.name}
              </h3>
              <p className="text-sm opacity-90">
                {appointment.client?.email}
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

          {/* Client Notes */}
          {appointment.notes && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
              <p className="text-xs text-gray-600 font-semibold mb-1">📝 Client Notes</p>
              <p className="text-sm text-gray-700">{appointment.notes}</p>
            </div>
          )}

          {/* Counselor Notes */}
          {appointment.counselorNotes && (
            <div className="bg-purple-50 p-4 rounded-lg mb-4 border-l-4 border-purple-500">
              <p className="text-xs text-gray-600 font-semibold mb-1">📋 Your Session Notes</p>
              <p className="text-sm text-gray-700">{appointment.counselorNotes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 flex-wrap">
          {appointment.status === 'pending' && (
            <>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50"
              >
                ✓ Accept
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50"
              >
                ✕ Reject
              </button>
            </>
          )}
          {appointment.status === 'confirmed' && (
            <>
              <a
                href={`/video/${appointment._id}`}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 text-center"
              >
                🎥 Join Video
              </a>
              <button
                onClick={() => setShowNotesModal(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105"
              >
                ✓ Mark Complete
              </button>
            </>
          )}
          <a
            href={`/chat/${appointment._id}`}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 text-center"
          >
            💬 Chat
          </a>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Session Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your session notes here..."
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                Save & Complete
              </button>
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
