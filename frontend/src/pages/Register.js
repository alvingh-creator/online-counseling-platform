import { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://online-counseling-platform-api.onrender.com/api';

export default function Register() {
  const { setUserAndToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const registerData = {
        name,
        email,
        password,
        role
      };

      if (role === 'counselor') {
        if (!specialization || !licenseNumber || !hourlyRate) {
          setError(
            'Specialization, License Number, and Hourly Rate are required for counselors.'
          );
          setSubmitting(false);
          return;
        }
        registerData.specialization = specialization;
        registerData.licenseNumber = licenseNumber;
        registerData.hourlyRate = parseFloat(hourlyRate);
      }

      const res = await axios.post(`${API_URL}/auth/register`, registerData);
      const token = res.data.token;
      const user = res.data.user;

      if (token && user) {
        setUserAndToken(user, token);
        navigate('/dashboard');
      } else {
        setError('Registration successful but no token received.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isCounselor = role === 'counselor';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid gap-10 md:grid-cols-[1.2fr,1fr] items-center">
        {/* Left: brand + copy */}
        <div className="hidden md:block">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
              C
            </div>
            <span className="text-lg font-semibold text-slate-900">
              CounselHub
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-3">
            Create your account.
          </h1>
          <p className="text-sm text-slate-500 max-w-md">
            Join as a client to book sessions, or as a counselor to provide
            professional support through chat and video.
          </p>
        </div>

        {/* Right: form */}
        <div className="w-full max-w-md mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 md:hidden flex items-center justify-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
              C
            </div>
            <span className="text-base font-semibold text-slate-900">
              CounselHub
            </span>
          </div>

          <h2 className="text-xl font-semibold text-slate-900 mb-1 text-center">
            Create an account
          </h2>
          <p className="text-xs text-slate-500 mb-5 text-center">
            Choose your role and complete the details below.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                I am a…
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              >
                <option value="client">Client (seeking counseling)</option>
                <option value="counselor">Counselor (providing counseling)</option>
              </select>
            </div>

            {isCounselor && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    placeholder="e.g. Anxiety therapy, Relationship counseling"
                    required={isCounselor}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      License number
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                      placeholder="e.g. LIC-12345"
                      required={isCounselor}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Hourly rate (₹)
                    </label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                      placeholder="e.g. 800"
                      min="0"
                      step="0.01"
                      required={isCounselor}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-slate-900 hover:text-slate-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
