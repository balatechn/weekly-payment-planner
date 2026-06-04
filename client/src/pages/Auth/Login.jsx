import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Invalid credentials');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #2563EB 100%)' }}
    >
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md animate-scale-in relative z-10">

        {/* Glass card */}
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 items-center justify-center shadow-xl mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Weekly Payment</h1>
            <p className="text-blue-200/70 text-sm font-medium">Planner Pro · Enterprise Edition</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-blue-200/70 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 text-white placeholder-blue-300/40 focus:ring-2 focus:ring-blue-400"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                  onFocus={e => e.target.style.background = 'rgba(255,255,255,0.12)'}
                  onBlur={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-blue-200/70 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/50" />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 text-white placeholder-blue-300/40 focus:ring-2 focus:ring-blue-400"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                  onFocus={e => e.target.style.background = 'rgba(255,255,255,0.12)'}
                  onBlur={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-60 active:scale-[0.98] mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Credentials hint */}
          <div className="mt-6 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-2.5">
              <Shield className="w-3.5 h-3.5 text-blue-300/70" />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-200/60">Demo Credentials</p>
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-[12px] text-blue-100/60">
              {[
                ['Admin',   'admin@company.com',   'Admin@123'],
                ['Finance', 'finance@company.com', 'Finance@123'],
                ['User',    'user@company.com',    'User@123'],
              ].map(([role, email, pass]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ email, password: pass })}
                  className="flex items-center gap-2 text-left hover:text-blue-200 transition-colors group"
                >
                  <span className="w-14 font-semibold text-blue-300/80 group-hover:text-blue-200">{role}:</span>
                  <span>{email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-blue-200/30 text-xs mt-6">
          © {new Date().getFullYear()} Weekly Payment Planner · Enterprise
        </p>
      </div>
    </div>
  );
}
