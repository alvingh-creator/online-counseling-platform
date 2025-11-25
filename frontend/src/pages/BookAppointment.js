import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Use correct backend URL in production, localhost in dev
const API_URL =
  process.env.REACT_APP_API_URL || 'https://online-counseling-platform-api.onrender.com/api';

export default function BookAppointment() {
  const { counselorId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);

  const [formData, setFormData] = useState({
    serviceType: 'mental-health',
    appointmentDate: '',
    appointmentTime: '',
    sessionType: 'video',
    notes: ''
  });

  useEffect(() => {
    fetchCounselorDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counselorId]);

  const fetchCounselorDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/appointments/counselors/${counselorId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCounselor(response.data.data);
      setError('');
    } catch (err) {
      console.error('Fetch counselor error:', err?.response?.data || err.message);
      setError('Failed to load counselor details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.appointmentDate || !formData.appointmentTime) {
      setError('Please select date and time');
      return;
    }

    setBooking(true);

    try {
      const response = await axios.post(
        `${API_URL}/appointments/create`,
        {
          counselorId, // this goes straight to backend, no change for mobile/laptop
          serviceType: formData.serviceType,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          sessionType: formData.sessionType,
          notes: formData.notes
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('Appointment booked successfully!');
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Failed to book appointment');
      }
    } catch (err) {
      console.error('Book appointment error:', err?.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-blue-600">Loading...</div>
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-red-600">Counselor not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-700 font-semibold"
        >
          ← Back
        </button>

        {/* Counselor Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">{counselor.name}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-600 font-semibold">Specialization:</p>
              <p className="text-lg text-gray-800">{counselor.specialization}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Rate:</p>
              <p className="text-lg text-green-600 font-bold">
                ${counselor.hourlyRate}/hour
              </p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">License:</p>
              <p className="text-lg text-gray-800">{counselor.licenseNumber}</p>
            </div>
            <div>
              <p className="text-gray-600 font-semibold">Email:</p>
              <p className="text-lg text-gray-800">{counselor.email}</p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-6">Book an Appointment</h3>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Service Type */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Service Type:
              </label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mental-health">Mental Health</option>
                <option value="relationship">Relationship Advice</option>
                <option value="career">Career Counseling</option>
              </select>
            </div>

            {/* Appointment Date */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Date:
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Appointment Time */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Time:
              </label>
              <input
                type="time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Session Type */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Session Type:
              </label>
              <select
                name="sessionType"
                value={formData.sessionType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="video">Video Call</option>
                <option value="chat">Chat</option>
                <option value="email">Email</option>
              </select>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Additional Notes (Optional):
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Tell the counselor about your concerns..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={booking}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400"
            >
              {booking ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
