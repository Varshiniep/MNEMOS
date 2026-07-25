import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Shield, GitBranch, Brain } from 'lucide-react';
import { loginWithCredentials, loginAsDemo } from '../hooks/useAuth';
import { MnemosLogo } from '../components/brand/MnemosLogo';
import { NodeGraph } from '../components/brand/NodeGraph';
import { StarField } from '../components/brand/StarField';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    setTimeout(() => {
      const result = loginWithCredentials(email, password);
      if (result.ok) navigate('/dashboard');
      else setError(result.error);
      setLoading(false);
    }, 600);
  };

  const handleDemo = () => { loginAsDemo(); navigate('/dashboard'); };

  return (
    <div className="min-h-screen flex" style={{ background: '#000' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: 'rgba(5,7,18,1)' }}>
        <div className="absolute inset-0"><StarField density={140} /></div>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.08) 0%, transparent 60%)',
        }} />

        <div className="relative z-10"><MnemosLogo size={40} variant="full" /></div>

        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.8rem)', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1.1, color:'#fff' }}>
              Give your agents a memory<br />
              <span className="gradient-text">that corrects itself.</span>
            </h2>
            <p style={{ fontSize:15, color:'#374151', lineHeight:1.7, maxWidth:400 }}>
              MNEMOS provides structured, self-correcting world models — eliminating
              context bloat and hidden contradictions.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{
            border:'1px solid rgba(139,92,246,0.15)',
            background:'rgba(10,13,26,0.8)',
          }}>
            <NodeGraph width={360} height={200} animate />
          </div>

          <div className="space-y-4">
            {[
              { icon: Brain,     color:'#8b5cf6', label:'Bounded Context',    desc:'Only relevant facts reach the agent' },
              { icon: GitBranch, color:'#06b6d4', label:'Versioned Beliefs',  desc:'Every correction is preserved' },
              { icon: Shield,    color:'#f59e0b', label:'Auditable Reasoning',desc:'Full correction trail, always visible' },
            ].map(({ icon: Icon, color, label, desc }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background:`${color}15`, border:`1px solid ${color}25` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>{label}</p>
                  <p style={{ fontSize:12, color:'#374151' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mono" style={{ fontSize:9, color:'#1f2937', letterSpacing:'0.15em' }}>
          HACKTRONIX 2.0 · TRACK B — ARTIFICIAL INTELLIGENCE · LOCAL-FIRST
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative"
        style={{ background: '#030308' }}>
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-4">
            <MnemosLogo size={44} variant="full" />
          </div>

          <div>
            <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.03em', color:'#fff' }}>
              Welcome back
            </h1>
            <p style={{ fontSize:14, color:'#374151', marginTop:6 }}>
              Sign in to the MNEMOS research dashboard
            </p>
          </div>

          {/* Demo hint */}
          <div className="rounded-xl p-4" style={{
            background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.18)',
          }}>
            <p className="mono" style={{ fontSize:9, color:'#6366f1', letterSpacing:'0.15em', marginBottom:6 }}>
              DEMO CREDENTIALS
            </p>
            <p className="mono" style={{ fontSize:12, color:'#4b5563' }}>
              demo@mnemos.ai / mnemos123
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ display:'block', fontSize:11, color:'#374151', marginBottom:6, letterSpacing:'0.05em' }}>
                EMAIL ADDRESS
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="demo@mnemos.ai" required className="input-dark" autoComplete="email" />
            </div>

            <div>
              <label style={{ display:'block', fontSize:11, color:'#374151', marginBottom:6, letterSpacing:'0.05em' }}>
                PASSWORD
              </label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required className="input-dark pr-10"
                  autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost" style={{ padding:'4px' }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg px-3 py-2.5" style={{
                background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)',
              }}>
                <p style={{ fontSize:12, color:'#f87171' }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center"
              style={{ padding:'13px', fontSize:14 }}>
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Signing in…' : 'SIGN IN'}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="divider flex-1" />
            <span className="mono" style={{ fontSize:9, color:'#1f2937' }}>OR</span>
            <div className="divider flex-1" />
          </div>

          <button onClick={handleDemo} className="btn-outline w-full justify-center" style={{ padding:'12px' }}>
            <Zap size={15} style={{ color:'#8b5cf6' }} />
            CONTINUE AS DEMO USER
          </button>

          <p style={{ textAlign:'center', fontSize:11, color:'#1f2937' }}>
            This is a prototype. Authentication is for demo purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
