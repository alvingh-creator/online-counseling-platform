import { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://online-counseling-platform-api.onrender.com/api';

export default function Login() {
  const { setUserAndToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const token = res.data.token;
      const user = res.data.user;

      if (token && user) {
        setUserAndToken(user, token);
        navigate('/dashboard');
      } else {
        setError('Login successful but no token received.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid gap-10 md:grid-cols-[1.2fr,1fr] items-center">
        {/* Left side: brand + copy */}
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
            Welcome back.
          </h1>
          <p className="text-sm text-slate-500 max-w-md">
            Sign in to manage your counseling sessions, chat with your
            counselor, and join secure video calls.
          </p>
        </div>

        {/* Right side: form */}
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
            Sign in to your account
          </h2>
          <p className="text-xs text-slate-500 mb-5 text-center">
            Use your registered email and password.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
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
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-slate-900 hover:text-slate-700"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
