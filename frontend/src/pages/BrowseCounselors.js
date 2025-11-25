import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://online-counseling-platform-api.onrender.com/api';

export default function BrowseCounselors() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCounselors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCounselors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/counselors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCounselors(response.data.data || []);
      setError('');
    } catch (err) {
      console.error(err?.response?.data || err.message);
      setError('Failed to load counselors');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (counselorId) => {
    navigate(`/book-appointment/${counselorId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              Find a counselor
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Browse available professionals and book a session that fits your needs.
            </p>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* States */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 mr-2" />
            Loading counselors…
          </div>
        ) : counselors.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              No counselors are available yet. Please check back later.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {counselors.map((counselor) => (
              <CounselorCard
                key={counselor._id}
                counselor={counselor}
                onBook={handleBookAppointment}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

function CounselorCard({ counselor, onBook }) {
  const initial =
    counselor.name && counselor.name.length > 0
      ? counselor.name.charAt(0).toUpperCase()
      : 'C';

  return (
    <article className="flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        {counselor.profilePic ? (
          <img
            src={counselor.profilePic}
            alt={counselor.name}
            className="h-11 w-11 rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="h-11 w-11 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {counselor.name}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {counselor.specialization || 'General counseling'}
          </p>
        </div>
      </div>

      <div className="px-4 pb-3 text-xs text-slate-600 space-y-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Email
          </p>
          <p className="font-mono break-all text-xs text-slate-800">
            {counselor.email}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Rate
            </p>
            <p className="text-sm font-semibold text-slate-900">
              ₹{counselor.hourlyRate || 'N/A'}
              <span className="text-xs text-slate-500 ml-1">/hour</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              License
            </p>
            <p className="font-mono text-xs text-slate-700">
              {counselor.licenseNumber || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 px-4 py-3">
        <button
          onClick={() => onBook(counselor._id)}
          className="w-full inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
        >
          Book appointment
        </button>
      </div>
    </article>
  );
}
