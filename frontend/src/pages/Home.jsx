import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Gradient blobs background */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-1/4 bottom-0 h-64 rounded-[6rem] bg-sky-500/10 blur-3xl" />

      {/* Top bar */}
      <header className="relative border-b border-white/5 bg-gradient-to-b from-slate-950/80 to-slate-950/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-sky-500/40">
              C
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              CounselHub
            </span>
          </div>
          <nav className="flex items-center gap-3 text-xs sm:text-sm">
            <Link
              to="/login"
              className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 font-medium text-slate-50 hover:bg-white/10 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-1.5 font-medium text-white shadow-sm shadow-sky-500/40 hover:from-sky-400 hover:to-indigo-400 transition"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="relative">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.3fr,1fr] lg:py-20">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Online counseling platform
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-slate-50">
              Talk to a counselor, <span className="text-sky-300">anytime</span>,
              from <span className="text-indigo-300">anywhere</span>.
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-slate-300">
              Secure video sessions, real‑time chat, and structured appointments
              — designed for modern mental health support on web and mobile.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-sm font-medium text-white shadow-md shadow-sky-500/40 hover:bg-sky-400 transition"
              >
                Create free account
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium text-slate-50 hover:bg-white/10 transition"
              >
                I already have an account
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 text-[11px] text-slate-300/80">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                End‑to‑end encrypted sessions
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                Works on laptop & mobile
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                No installs required
              </span>
            </div>
          </div>

          {/* Animated feature card stack */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-sky-500/20 via-purple-500/10 to-indigo-500/20 blur-2xl" />
            <div className="relative space-y-4">
              <FloatingCard delay="0s">
                <p className="text-[11px] uppercase tracking-wide text-sky-300/80 mb-1">
                  Live sessions
                </p>
                <p className="text-sm font-semibold text-slate-50">
                  HD video calls with your counselor in a private, secure room.
                </p>
              </FloatingCard>
              <FloatingCard delay="0.15s">
                <p className="text-[11px] uppercase tracking-wide text-emerald-300/80 mb-1">
                  Real‑time chat
                </p>
                <p className="text-sm font-semibold text-slate-50">
                  Drop a message between sessions and keep the conversation going.
                </p>
              </FloatingCard>
              <FloatingCard delay="0.3s">
                <p className="text-[11px] uppercase tracking-wide text-indigo-300/80 mb-1">
                  Smart scheduling
                </p>
                <p className="text-sm font-semibold text-slate-50">
                  Pick a time that works for both of you — no email back‑and‑forth.
                </p>
              </FloatingCard>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FloatingCard({ children, delay = '0s' }) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg shadow-black/30 backdrop-blur-sm animate-[float_6s_ease-in-out_infinite]"
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}

/* Tailwind keyframes (add once to your global CSS if not already using custom animations):
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
*/
