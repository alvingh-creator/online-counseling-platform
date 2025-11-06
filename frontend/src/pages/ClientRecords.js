import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function ClientRecords() {
  const { user, token } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/appointments/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching records:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const upcomingAppointments = appointments.filter(a => a.status === 'confirmed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl shadow-lg mb-8">
          <h1 className="text-4xl font-bold mb-2">📋 My Session Records</h1>
          <p className="text-blue-100">View your completed sessions and session notes</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-gray-500 text-lg mt-4">Loading records...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Sessions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Upcoming Sessions ({upcomingAppointments.length})</h2>
              {upcomingAppointments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <p className="text-gray-500">No upcoming sessions scheduled</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {upcomingAppointments.map(appt => (
                    <div key={appt._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{appt.counselor?.name}</h3>
                          <p className="text-sm text-gray-600">{appt.counselor?.specialization}</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                          Confirmed
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p className="font-semibold text-gray-800">
                            {new Date(appt.appointmentDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Time</p>
                          <p className="font-semibold text-gray-800">{appt.appointmentTime}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Service</p>
                          <p className="font-semibold text-gray-800 capitalize">
                            {appt.serviceType?.replace('-', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount</p>
                          <p className="font-semibold text-green-600">₹{appt.amount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Sessions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">✓ Session History ({completedAppointments.length})</h2>
              {completedAppointments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <p className="text-gray-500">No completed sessions yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {completedAppointments.map(appt => (
                    <div key={appt._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{appt.counselor?.name}</h3>
                          <p className="text-sm text-gray-600">{appt.counselor?.specialization}</p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          Completed
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p className="font-semibold text-gray-800">
                            {new Date(appt.appointmentDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Time</p>
                          <p className="font-semibold text-gray-800">{appt.appointmentTime}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Service</p>
                          <p className="font-semibold text-gray-800 capitalize">
                            {appt.serviceType?.replace('-', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount</p>
                          <p className="font-semibold text-green-600">₹{appt.amount}</p>
                        </div>
                      </div>

                      {/* Session Notes */}
                      {appt.counselorNotes && (
                        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                          <p className="text-sm font-semibold text-purple-900 mb-2">📝 Session Notes:</p>
                          <p className="text-sm text-gray-700">{appt.counselorNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
