import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Shield, GitBranch, Brain } from 'lucide-react';
import { loginWithCredentials, loginAsDemo } from '../hooks/useAuth';
import { MnemosLogo } from '../components/brand/MnemosLogo';
import { NodeGraph } from '../components/brand/NodeGraph';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [remember, setRemember]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    setTimeout(() => {
      const result = loginWithCredentials(email, password);
      if (result.ok) { navigate('/dashboard'); }
      else { setError(result.error); }
      setLoading(false);
    }, 600);
  };

  const handleDemo = () => {
    loginAsDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-[#050818]">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a0f2e 0%, #0c1225 100%)' }}
      >
        {/* Grid bg */}
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(79,70,229,0.15) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <MnemosLogo size={44} variant="full" />

        {/* Center content */}
        <div className="space-y-8 relative z-10">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Give your agents<br />
              <span className="gradient-text">a memory that corrects itself.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              MNEMOS provides autonomous agents with structured, self-correcting
              world models — eliminating context bloat and hidden contradictions.
            </p>
          </div>

          {/* Node graph visual */}
          <div className="flex justify-center">
            <NodeGraph width={320} height={220} />
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {[
              { icon: Brain,      label: 'Bounded Context',     desc: 'Only relevant facts reach the agent' },
              { icon: GitBranch,  label: 'Versioned Beliefs',   desc: 'Every correction is preserved' },
              { icon: Shield,     label: 'Auditable Reasoning', desc: 'Full correction trail, always visible' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(79,70,229,0.3)' }}>
                  <Icon size={15} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-600 relative z-10">
          HackTronix 2.0 · Track B — Artificial Intelligence · Local-first
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <MnemosLogo size={48} variant="full" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-slate-400 mt-1 text-sm">Sign in to the MNEMOS dashboard</p>
          </div>

          {/* Demo credentials hint */}
          <div className="rounded-xl p-4" style={{
            background: 'rgba(79,70,229,0.08)',
            border: '1px solid rgba(79,70,229,0.25)',
          }}>
            <p className="text-xs font-semibold text-indigo-400 mb-1">Demo credentials</p>
            <p className="text-xs text-slate-400 font-mono">demo@mnemos.ai / mnemos123</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="demo@mnemos.ai"
                required
                className="input-dark"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-dark pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-slate-400">Remember me</span>
              </label>
              <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="rounded-lg px-3 py-2.5 text-xs text-red-400"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="divider flex-1" />
            <span className="text-xs text-slate-600">or</span>
            <div className="divider flex-1" />
          </div>

          {/* Demo user button */}
          <button onClick={handleDemo} className="btn-outline w-full justify-center">
            <Zap size={15} className="text-indigo-400" />
            Continue as Demo User
          </button>

          {/* Google button (UI only) */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={() => setError('Google sign-in not available in this prototype.')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-slate-600">
            This is a prototype. Authentication is for demo purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
