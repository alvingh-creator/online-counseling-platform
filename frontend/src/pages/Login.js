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
<div className="relative min-h-screen overflow-hidden bg-slate-950 text-white flex items-center justify-center px-4">
{/* Gradient blobs background */}
<div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
<div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />
<div className="pointer-events-none absolute inset-x-1/4 bottom-[-120px] h-72 rounded-full bg-indigo-500/20 blur-3xl" />
  {/* Subtle grid / noise overlay */}
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05)_0,_transparent_60%)] opacity-70" />

  <div className="relative z-10 w-full max-w-5xl grid gap-10 md:grid-cols-[1.1fr,1fr] items-center">
    {/* Left side: brand + copy */}
    <div className="hidden md:block">
      <div className="mb-6 flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-semibold shadow-lg shadow-blue-500/40">
          C
        </div>
        <span className="text-lg font-semibold tracking-tight">
          CounselHub
        </span>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Welcome back,
          <span className="block bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
            continue your journey.
          </span>
        </h1>
        <p className="text-sm text-slate-300 max-w-md">
          Sign in to manage your counseling sessions, chat in real time, and
          join secure video calls — all in one place.
        </p>

        <div className="mt-6 grid gap-3 text-xs text-slate-300">
          <FloatingBadge label="Secure & private" />
          <FloatingBadge label="Real-time chat & video" delay="0.4s" />
          <FloatingBadge label="Works on any device" delay="0.8s" />
        </div>
      </div>
    </div>

    {/* Right side: form card */}
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 md:hidden flex items-center justify-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-semibold shadow-lg shadow-blue-500/40">
          C
        </div>
        <span className="text-base font-semibold tracking-tight">
          CounselHub
        </span>
      </div>

      <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/40 backdrop-blur-md">
        {/* subtle glow border */}
        <div className="pointer-events-none absolute inset-px rounded-2xl border border-white/5" />

        <h2 className="text-xl font-semibold mb-1 text-center">
          Sign in to your account
        </h2>
        <p className="text-[11px] text-slate-300 mb-5 text-center">
          Use the email and password you registered with.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-400/50 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-200 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-200 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="- - - - - - - - "
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 px-3 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-blue-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-slate-300">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-sky-300 hover:text-sky-200"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  </div>
</div>
);
}
function FloatingBadge({ label, delay = '0s' }) {
return (
<div
className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] shadow-md shadow-black/40 backdrop-blur-sm animate-[float_6s_ease-in-out_infinite]"
style={{ animationDelay: delay }}
>
<span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
<span>{label}</span>
</div>
);
}

/* Ensure you have this keyframe once in your global CSS (e.g. index.css or tailwind.css):
@keyframes float {
0%, 100% { transform: translateY(0px); }
50% { transform: translateY(-6px); }
}
*/