import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

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
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              C
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">
              CounselHub
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 hidden sm:inline">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'appointments', label: 'Appointments' },
            { id: 'findCounselor', label: 'Find Counselor' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {tab.label}
              {tab.id === 'appointments' && appointments.length > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-slate-900/10 text-[11px] font-semibold text-slate-700">
                  {appointments.length}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => navigate('/client-records')}
            className="ml-auto px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border bg-white text-slate-600 border-slate-200 hover:border-slate-400"
          >
            Records
          </button>
        </div>

        {/* Profile */}
        {activeTab === 'profile' && (
          <section className="grid gap-6 md:grid-cols-2">
            {/* Info */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Account overview
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide">
                    Name
                  </p>
                  <p className="text-slate-900 font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-slate-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide">
                    Account type
                  </p>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-100">
                    Client
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Total appointments"
                value={appointments.length}
              />
              <StatCard
                label="Confirmed"
                value={appointments.filter(a => a.status === 'confirmed').length}
              />
              <StatCard
                label="Total spent"
                value={
                  '₹' +
                  appointments.reduce((sum, a) => sum + (a.amount || 0), 0)
                }
              />
            </div>
          </section>
        )}

        {/* Appointments */}
        {activeTab === 'appointments' && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Your appointments
            </h2>
            {loadingAppointments ? (
              <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">
                Loading appointments…
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-2xl border bg-white p-10 text-center">
                <p className="text-sm text-slate-500 mb-4">
                  You don&apos;t have any appointments yet.
                </p>
                <button
                  onClick={() => setActiveTab('findCounselor')}
                  className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Book your first session
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(appt => (
                  <ClientAppointmentCard
                    key={appt._id}
                    appointment={appt}
                    token={token}
                    onUpdate={fetchAppointments}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Find Counselor */}
        {activeTab === 'findCounselor' && (
          <section className="rounded-2xl border bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Find a counselor
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Browse available counselors and book a session that fits your
              schedule.
            </p>
            <button
              onClick={() => navigate('/browse-counselors')}
              className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Browse counselors
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

/* Simple stat card */
function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm flex flex-col justify-between">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

/* Appointment card stays feature-rich but visually calmer */
function ClientAppointmentCard({ appointment, token, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const statusStyles = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    cancelled: 'bg-slate-50 text-slate-600 border-slate-200'
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/appointments/cancel/${appointment._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  const statusClass =
    statusStyles[appointment.status] || 'bg-slate-50 text-slate-700 border';

  return (
    <div className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="flex items-start justify-between border-b px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {appointment.counselor?.name}
          </p>
          <p className="text-xs text-slate-500">
            {appointment.counselor?.specialization}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${statusClass}`}
        >
          {appointment.status}
        </span>
      </div>

      <div className="px-4 py-3 space-y-3 text-sm">
        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-xs text-slate-500">Date</p>
            <p className="font-medium text-slate-900">
              {new Date(appointment.appointmentDate).toLocaleDateString(
                'en-US',
                { weekday: 'short', month: 'short', day: 'numeric' }
              )}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500">Time</p>
            <p className="font-medium text-slate-900">
              {appointment.appointmentTime}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-xs text-slate-500">Service</p>
            <p className="font-medium text-slate-900 capitalize">
              {appointment.serviceType?.replace('-', ' ')}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500">Session type</p>
            <p className="font-medium text-slate-900 capitalize">
              {appointment.sessionType}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-500">Amount</p>
          <p className="font-semibold text-slate-900">
            ₹{appointment.amount ?? 0}
          </p>
        </div>

        {appointment.notes && (
          <div className="rounded-md bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500 mb-1">Your notes</p>
            <p className="text-xs text-slate-700">{appointment.notes}</p>
          </div>
        )}

        {appointment.counselorNotes && (
          <div className="rounded-md bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500 mb-1">Counselor notes</p>
            <p className="text-xs text-slate-700">
              {appointment.counselorNotes}
            </p>
          </div>
        )}
      </div>

      <div className="border-t bg-slate-50 px-4 py-3 flex flex-wrap gap-2">
        {appointment.status === 'confirmed' && (
          <a
            href={`/video/${appointment._id}`}
            className="flex-1 min-w-[120px] inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
          >
            Join video
          </a>
        )}
        <a
          href={`/chat/${appointment._id}`}
          className="flex-1 min-w-[120px] inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-xs font-medium text-slate-800 border border-slate-200 hover:border-slate-400"
        >
          Open chat
        </a>
        {appointment.status !== 'cancelled' &&
          appointment.status !== 'rejected' && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-xs font-medium text-rose-600 border border-rose-200 hover:border-rose-400 disabled:opacity-60"
            >
              Cancel
            </button>
          )}
      </div>
    </div>
  );
}
