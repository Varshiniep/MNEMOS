import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Zap, Globe, GitBranch,
  Layers, CheckCircle, XCircle, ArrowUpRight,
} from 'lucide-react';
import { MnemosLogo } from '../components/brand/MnemosLogo';
import { NodeGraph } from '../components/brand/NodeGraph';
import { StarField } from '../components/brand/StarField';

/* ── Navbar ─────────────────────────────────────────────────────── */
function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="container h-16 flex items-center justify-between">
        <MnemosLogo size={34} variant="full" />
        <div className="hidden md:flex items-center gap-7">
          {['Features','How It Works','Architecture','Metrics'].map(s => (
            <a key={s}
              href={`#${s.toLowerCase().replace(/ /g,'-')}`}
              className="text-sm text-slate-500 hover:text-white transition-colors tracking-wide">
              {s}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-ghost text-sm">
            Login
          </button>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
            Launch Demo <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ───────────────────────────────────────────────────────── */
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ paddingTop: 64 }}>
      {/* Stars */}
      <div className="absolute inset-0"><StarField density={220} /></div>

      {/* Vertical split line */}
      <div className="absolute inset-0 hidden lg:flex items-stretch pointer-events-none z-10">
        <div style={{ flex: '1 1 50%' }} />
        <div className="split-line" style={{ height: '100%' }} />
        <div style={{ flex: '1 1 50%' }} />
      </div>

      {/* Glow blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position:'absolute', width:600, height:600,
          background:'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          top:'10%', left:'5%',
        }} />
        <div style={{
          position:'absolute', width:500, height:500,
          background:'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
          top:'20%', right:'5%',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-20 flex-1 flex items-center">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-0 min-h-[80vh] items-center">

            {/* LEFT — old/uncertain side */}
            <div className="py-20 pr-0 lg:pr-16 space-y-10">
              {/* Status badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink" />
                <span className="mono" style={{ fontSize: 10, color: '#34d399', letterSpacing: '0.15em' }}>
                  LOCAL-FIRST · CPU-READY · CONTEXT-BOUNDED
                </span>
              </div>

              {/* Main headline */}
              <div className="space-y-2">
                <h1 className="heading-hero text-white">
                  MNEMOS
                </h1>
                <h2 style={{
                  fontSize: 'clamp(1rem, 2.5vw, 1.6rem)',
                  fontWeight: 300,
                  color: '#64748b',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  lineHeight: 1.4,
                }}>
                  A SELF-CORRECTING WORLD MODEL<br />
                  FOR AUTONOMOUS AGENTS
                </h2>
              </div>

              <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.75, maxWidth: 480 }}>
                Bounded context. Versioned beliefs. Transparent correction.
                Agents reason without ever re-reading their full history.
              </p>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate('/login')} className="btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>
                  <Zap size={16} /> LAUNCH LIVE DEMO
                </button>
                <a href="#how-it-works" className="btn-outline" style={{ fontSize: 15, padding: '13px 28px' }}>
                  EXPLORE ARCHITECTURE <ArrowRight size={15} />
                </a>
              </div>

              {/* OLD BELIEF card */}
              <div className="relative overflow-hidden rounded-xl p-4 max-w-sm"
                style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)' }}>
                <p className="label-overline mb-2" style={{ color: '#f87171' }}>OLD BELIEF</p>
                <p className="mono text-sm" style={{ color: '#f1f5f9' }}>"The east door is locked"</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="badge badge-red">superseded</span>
                  <span className="mono" style={{ fontSize: 10, color: '#6b7280' }}>CONFIDENCE 0.62</span>
                </div>
              </div>
            </div>

            {/* RIGHT — corrected side */}
            <div className="py-20 pl-0 lg:pl-16 space-y-10">
              {/* World graph */}
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl glow-violet opacity-30 blur-3xl pointer-events-none" />
                <div className="relative rounded-2xl p-6" style={{
                  background: 'rgba(13,17,32,0.9)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  backdropFilter: 'blur(12px)',
                }}>
                  <p className="label-overline mb-4">WORLD GRAPH — LIVE STRUCTURE</p>
                  <NodeGraph width={380} height={220} animate />
                </div>
              </div>

              {/* CORRECTED BELIEF card */}
              <div className="relative overflow-hidden rounded-xl p-4 max-w-sm ml-auto"
                style={{ background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.25)' }}>
                <p className="label-overline mb-2" style={{ color: '#34d399' }}>CORRECTED BELIEF</p>
                <p className="mono text-sm" style={{ color: '#f1f5f9' }}>"The east door is open"</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="badge badge-green">active</span>
                  <span className="mono" style={{ fontSize: 10, color: '#6b7280' }}>CONFIDENCE 0.96</span>
                </div>
                <p className="mono mt-2" style={{ fontSize: 10, color: '#4b5563' }}>
                  Reason: environment contradicted previous observation.
                </p>
              </div>

              {/* Superseded arrow hint */}
              <div className="flex items-center gap-2 ml-4">
                <div style={{ width:2, height:40, background:'linear-gradient(180deg,rgba(239,68,68,0.5),rgba(139,92,246,0.5),rgba(16,185,129,0.5))' }} />
                <span className="mono" style={{ fontSize: 10, color: '#374151' }}>
                  SUPERSEDED → CORRECTED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="relative z-20 flex justify-center pb-12 pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-slate-700" />
          <span className="mono" style={{ fontSize: 9, color: '#374151', letterSpacing: '0.2em' }}>SCROLL</span>
        </div>
      </div>
    </section>
  );
}

/* ── Features ───────────────────────────────────────────────────── */
function FeaturesSection() {
  const cards = [
    {
      icon: Globe,     color: '#6366f1', glow: 'rgba(99,102,241,0.15)',
      title: 'STRUCTURED MEMORY',
      desc: 'Rooms, objects, states and relationships persist as human-readable typed facts — not raw text buried in conversation.',
    },
    {
      icon: GitBranch, color: '#8b5cf6', glow: 'rgba(139,92,246,0.15)',
      title: 'SELF-CORRECTION',
      desc: 'Contradicted beliefs are versioned, superseded and visibly explained. The old belief is preserved, never deleted.',
    },
    {
      icon: Layers,    color: '#06b6d4', glow: 'rgba(6,182,212,0.12)',
      title: 'BOUNDED CONTEXT',
      desc: 'Only the relevant world slice reaches the agent on every turn. History never accumulates inside the prompt.',
    },
  ];

  return (
    <section id="features" className="section-pad relative overflow-hidden">
      <div className="absolute inset-0"><StarField density={80} /></div>
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="container relative z-10 space-y-16">
        <div className="text-center space-y-3">
          <p className="label-overline">Core Capabilities</p>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight:800, letterSpacing:'-0.03em', color:'#fff' }}>
            What makes MNEMOS different
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map(c => (
            <div key={c.title} className="card-glass card-hover p-7 space-y-5 group relative overflow-hidden"
              style={{ border: `1px solid rgba(255,255,255,0.06)` }}>
              {/* Glow backdrop */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
                style={{ background: `radial-gradient(ellipse at 30% 30%, ${c.glow}, transparent 70%)` }} />
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center relative z-10"
                style={{ background: `${c.glow}`, border: `1px solid ${c.color}30` }}>
                <c.icon size={22} style={{ color: c.color }} />
              </div>
              <div className="relative z-10 space-y-3">
                <p className="label-overline" style={{ color: c.color, fontSize: 11 }}>{c.title}</p>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Metrics preview ────────────────────────────────────────────── */
function MetricsPreview() {
  const metrics = [
    { label:'ACTIVE BELIEFS',    value:'—', color:'#8b5cf6', unit:'' },
    { label:'SUPERSEDED',        value:'—', color:'#6366f1', unit:'' },
    { label:'CONTEXT TOKENS',    value:'—', color:'#06b6d4', unit:'' },
    { label:'CORRECTIONS',       value:'—', color:'#f59e0b', unit:'' },
  ];
  return (
    <section id="metrics" className="section-pad relative overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="container relative z-10 space-y-14">
        <div className="text-center space-y-3">
          <p className="label-overline">Live Instrumentation</p>
          <h2 style={{ fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:800, letterSpacing:'-0.03em', color:'#fff' }}>
            Every metric, visible in real time
          </h2>
          <p style={{ fontSize:14, color:'#4b5563', marginTop:8 }}>
            Values below reflect live backend data when a run is active.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map(m => (
            <div key={m.label}
              className="card card-hover p-6 text-center space-y-3"
              style={{ border: `1px solid ${m.color}20` }}>
              <div style={{
                width:32, height:32, borderRadius:'50%', margin:'0 auto',
                background:`${m.color}18`, border:`1px solid ${m.color}30`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:m.color, boxShadow:`0 0 8px ${m.color}` }} />
              </div>
              <p style={{ fontSize:'clamp(2rem,5vw,2.8rem)', fontWeight:900, color:'#fff', lineHeight:1, fontFamily:'monospace' }}>
                {m.value}
              </p>
              <p className="mono" style={{ fontSize:9, color:'#4b5563', letterSpacing:'0.15em' }}>{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ───────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n:1, label:'WORLD INPUT',  color:'#06b6d4', desc:'Text observation' },
    { n:2, label:'EXTRACTOR',    color:'#6366f1', desc:'Structured facts' },
    { n:3, label:'WORLD MODEL',  color:'#8b5cf6', desc:'Belief store' },
    { n:4, label:'QUERY LAYER',  color:'#a78bfa', desc:'Bounded slice' },
    { n:5, label:'SLM AGENT',    color:'#c4b5fd', desc:'qwen2.5:3b' },
    { n:6, label:'ACTION',       color:'#e2d9f3', desc:'Command exec' },
    { n:7, label:'UPDATER',      color:'#8b5cf6', desc:'Belief delta' },
  ];

  return (
    <section id="how-it-works" className="section-pad relative overflow-hidden">
      <div className="absolute inset-0"><StarField density={60} /></div>
      <div className="container relative z-10 space-y-14">
        <div className="text-center space-y-3">
          <p className="label-overline">System Architecture</p>
          <h2 style={{ fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:800, letterSpacing:'-0.03em', color:'#fff' }}>
            The MNEMOS Loop
          </h2>
        </div>

        {/* Node chain */}
        <div className="flex flex-wrap justify-center items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className="card card-hover p-4 text-center space-y-2 group"
                style={{ minWidth: 100, border:`1px solid ${s.color}25` }}>
                <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-black"
                  style={{
                    background:`linear-gradient(135deg, ${s.color}30, ${s.color}15)`,
                    border:`1px solid ${s.color}50`,
                    color: s.color,
                    fontFamily:'monospace',
                  }}>
                  {s.n}
                </div>
                <p className="mono" style={{ fontSize:9, color:s.color, letterSpacing:'0.1em' }}>{s.label}</p>
                <p style={{ fontSize:10, color:'#374151' }}>{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden sm:flex items-center">
                  <div style={{ width:24, height:1, background:`linear-gradient(90deg,${s.color}60,${steps[i+1].color}60)` }} />
                  <div style={{ width:5, height:5, borderRadius:'50%', background:steps[i+1].color, boxShadow:`0 0 6px ${steps[i+1].color}` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Comparison ─────────────────────────────────────────────────── */
function Comparison() {
  const trad = [
    'Sends complete interaction history every turn',
    'Context window grows without bound',
    'Contradictions buried in old messages',
    'Token usage and latency increase per turn',
  ];
  const mnemos = [
    'Sends only the relevant world slice',
    'Near-flat context size regardless of turns',
    'Explicit belief versioning and correction events',
    'Bounded, predictable token usage',
  ];
  return (
    <section className="section-pad relative overflow-hidden" style={{ background:'rgba(0,0,0,0.5)' }}>
      <div className="container relative z-10 space-y-14">
        <div className="text-center space-y-3">
          <p className="label-overline">Comparison</p>
          <h2 style={{ fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:800, letterSpacing:'-0.03em', color:'#fff' }}>
            Why MNEMOS is different
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          <div className="card p-6 space-y-5">
            <p className="mono" style={{ fontSize:10, color:'#4b5563', letterSpacing:'0.15em' }}>TRADITIONAL AGENT</p>
            {trad.map(t => (
              <div key={t} className="flex gap-3 items-start">
                <XCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color:'#ef4444' }} />
                <p style={{ fontSize:13, color:'#4b5563' }}>{t}</p>
              </div>
            ))}
          </div>
          <div className="card p-6 space-y-5"
            style={{ border:'1px solid rgba(139,92,246,0.3)', background:'rgba(16,21,40,0.7)' }}>
            <p className="mono" style={{ fontSize:10, color:'#8b5cf6', letterSpacing:'0.15em' }}>MNEMOS</p>
            {mnemos.map(m => (
              <div key={m} className="flex gap-3 items-start">
                <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color:'#10b981' }} />
                <p style={{ fontSize:13, color:'#94a3b8' }}>{m}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── CTA ────────────────────────────────────────────────────────── */
function CTA() {
  const navigate = useNavigate();
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="absolute inset-0"><StarField density={120} /></div>
      <div className="absolute inset-0" style={{
        background:'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents:'none',
      }} />
      <div className="container relative z-10 text-center space-y-8 max-w-3xl mx-auto">
        <h2 style={{ fontSize:'clamp(2rem,5vw,4rem)', fontWeight:900, letterSpacing:'-0.04em', color:'#fff', lineHeight:1 }}>
          Give autonomous agents<br />
          <span className="gradient-text">a memory they can correct.</span>
        </h2>
        <p style={{ fontSize:16, color:'#4b5563' }}>Local-first. No cloud required. MIT licensed.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ fontSize:15, padding:'14px 32px' }}>
            <Zap size={16} /> ENTER DEMO
          </button>
          <a href="#how-it-works" className="btn-outline" style={{ fontSize:15, padding:'14px 32px' }}>
            VIEW ARCHITECTURE
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ─────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop:'1px solid rgba(255,255,255,0.04)', paddingTop:48, paddingBottom:48 }}>
      <div className="container">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2 space-y-3">
            <MnemosLogo size={32} variant="full" />
            <p style={{ fontSize:13, color:'#2d3748', lineHeight:1.6, maxWidth:300 }}>
              Self-correcting bounded-context world model for text-based autonomous agents.
            </p>
          </div>
          <div className="space-y-3">
            <p className="mono" style={{ fontSize:9, color:'#374151', letterSpacing:'0.15em' }}>PROJECT</p>
            {['HackTronix 2.0','Track B — AI','TextWorld Agent','Local-first'].map(t => (
              <p key={t} style={{ fontSize:13, color:'#2d3748' }}>{t}</p>
            ))}
          </div>
          <div className="space-y-3">
            <p className="mono" style={{ fontSize:9, color:'#374151', letterSpacing:'0.15em' }}>RESOURCES</p>
            {['GitHub (placeholder)','Documentation (placeholder)'].map(t => (
              <a key={t} href="#" style={{ display:'block', fontSize:13, color:'#2d3748' }}
                className="hover:text-slate-400 transition-colors flex items-center gap-1">
                {t} <ArrowUpRight size={11} />
              </a>
            ))}
          </div>
        </div>
        <div className="divider" />
        <div className="flex flex-wrap justify-between items-center gap-4 pt-6">
          <p className="mono" style={{ fontSize:9, color:'#1f2937', letterSpacing:'0.1em' }}>
            © 2025 MNEMOS · MIT LICENSE
          </p>
          <p className="mono" style={{ fontSize:9, color:'#1f2937', letterSpacing:'0.1em' }}>
            LOCAL-FIRST · NO CLOUD · NO SECRETS
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export function LandingPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <FeaturesSection />
      <MetricsPreview />
      <HowItWorks />
      <Comparison />
      <CTA />
      <Footer />
    </div>
  );
}
