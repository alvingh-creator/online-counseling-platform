import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function BrowseCounselors() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/appointments/counselors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCounselors(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load counselors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCounselor = (counselor) => {
    setSelectedCounselor(counselor);
  };

  const handleBookAppointment = (counselorId) => {
    navigate(`/book-appointment/${counselorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-blue-600">Loading counselors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Find a Counselor</h1>
          <p className="text-gray-600">Browse and book appointments with our licensed counselors</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {counselors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No counselors available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {counselors.map(counselor => (
              <div key={counselor._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <h3 className="text-2xl font-bold">{counselor.name}</h3>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="text-gray-600 font-semibold text-sm">Specialization:</label>
                      <p className="text-gray-800 text-lg">{counselor.specialization}</p>
                    </div>

                    <div>
                      <label className="text-gray-600 font-semibold text-sm">Email:</label>
                      <p className="text-gray-800">{counselor.email}</p>
                    </div>

                    <div>
                      <label className="text-gray-600 font-semibold text-sm">Hourly Rate:</label>
                      <p className="text-green-600 text-xl font-bold">${counselor.hourlyRate}/hour</p>
                    </div>

                    <div>
                      <label className="text-gray-600 font-semibold text-sm">License:</label>
                      <p className="text-gray-800">{counselor.licenseNumber}</p>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => handleBookAppointment(counselor._id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
