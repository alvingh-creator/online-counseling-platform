import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://online-counseling-platform-api.onrender.com/api';

export default function BrowseCounselors() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => { fetchCounselors(); }, []);

  const fetchCounselors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/counselors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCounselors(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load counselors');
      console.error(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (counselorId) => {
    // Use counselor ID from counselors list, guaranteed to be correct
    navigate(`/book-appointment/${counselorId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 py-8">
      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 tracking-tight">Browse Counselors</h1>
          <p className="text-gray-600 text-lg">Find qualified counselors and book appointments instantly.</p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center py-40">
            <div className="animate-spin h-10 w-10 text-blue-700">⏳</div>
            <span className="ml-2 text-lg font-semibold text-blue-700">Loading counselors...</span>
          </div>
        ) : counselors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No counselors available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {counselors.map(counselor => (
              <div key={counselor._id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl border border-gray-100 transition duration-200 flex flex-col justify-between">
                <div className="px-5 pt-5 pb-3 flex flex-row items-center gap-3">
                  {counselor.profilePic ? (
                    <img src={counselor.profilePic} alt="Counselor" className="h-12 w-12 rounded-full object-cover border border-blue-400" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg border">{
                        counselor.name ? counselor.name.charAt(0).toUpperCase() : 'C'
                      }</div>
                  )}
                  <div>
                    <div className="font-semibold text-xl text-gray-800">{counselor.name}</div>
                    <div className="text-blue-600 font-medium text-sm">{counselor.specialization || 'General Counseling'}</div>
                  </div>
                </div>
                <div className="px-5 pb-3">
                  <div className="text-xs text-gray-400 mb-1">Email</div>
                  <div className="text-sm text-gray-900 font-mono break-words">{counselor.email}</div>
                  <div className="flex justify-between mt-3 text-sm text-gray-700">
                    <div>
                      <span className="font-medium text-green-600">₹{counselor.hourlyRate || "N/A"}</span>
                      <span className="ml-1 text-gray-400">/hr</span>
                    </div>
                    <div>
                      <span className="font-medium">License: </span>
                      <span className="text-gray-500 font-mono">{counselor.licenseNumber || "N/A"}</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <button
                    onClick={() => handleBookAppointment(counselor._id)}
                    className="w-full py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 text-white hover:from-blue-700 hover:to-purple-600 shadow"
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
