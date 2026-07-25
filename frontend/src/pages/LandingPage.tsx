import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Globe, GitBranch, Shield, Brain, Layers, CheckCircle, XCircle } from 'lucide-react';
import { MnemosLogo } from '../components/brand/MnemosLogo';
import { NodeGraph } from '../components/brand/NodeGraph';

/* ── Navbar ──────────────────────────────────────────────────────────────── */
function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <MnemosLogo size={36} variant="full" />
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          {['Features','How It Works','Architecture','Metrics','About'].map(s => (
            <a key={s} href={`#${s.toLowerCase().replace(/ /g,'-')}`}
              className="hover:text-white transition-colors">{s}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-ghost text-sm">Login</button>
          <button onClick={() => navigate('/login')} className="btn-primary text-sm py-2 px-4">
            Launch Demo <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero ────────────────────────────────────────────────────────────────── */
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 dot-grid opacity-25 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background:'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(79,70,229,0.12) 0%, transparent 70%)'
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-24">
        {/* Left */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', color:'#34d399' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Ready · Local-First · Bounded Context
          </div>

          <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.05]" style={{letterSpacing:'-0.03em'}}>
            Memory That<br />
            <span className="gradient-text">Corrects Itself</span>
          </h1>

          <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
            MNEMOS enables autonomous agents to reason using a compact, structured and
            continuously corrected world model — without re-reading an ever-growing conversation history.
          </p>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/login')} className="btn-primary text-base py-3 px-6">
              <Zap size={16} /> Launch Live Demo
            </button>
            <a href="#how-it-works" className="btn-outline text-base py-3 px-6">
              Explore Architecture <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Right — animated world graph */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl glow-indigo opacity-50 blur-2xl" />
            <div className="relative rounded-2xl p-6 card">
              <NodeGraph width={380} height={260} animate />
              {/* Belief correction preview */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)'}}>
                  <span className="badge badge-red">superseded</span>
                  <span className="text-xs text-slate-400 font-mono">wooden_door.locked = <span className="text-red-400 line-through">true</span></span>
                  <span className="ml-auto text-xs text-slate-600">conf 0.70</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)'}}>
                  <span className="badge badge-green">active</span>
                  <span className="text-xs text-slate-400 font-mono">wooden_door.locked = <span className="text-emerald-400">false</span></span>
                  <span className="ml-auto text-xs text-slate-600">conf 0.95</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Problem section ─────────────────────────────────────────────────────── */
function ProblemSection() {
  const problems = [
    'Full-history prompts grow continuously with every turn',
    'Old contradicting beliefs remain buried inside the context',
    'Contradictions are difficult to trace or correct',
    'Token usage and latency increase every turn',
  ];
  return (
    <section id="features" className="py-24" style={{background:'rgba(12,18,37,0.8)'}}>
      <div className="max-w-5xl mx-auto px-6 text-center space-y-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">The Problem</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Autonomous agents should not forget,<br className="hidden md:block" /> hallucinate or endlessly re-read.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-left">
          {problems.map(p => (
            <div key={p} className="flex gap-3 items-start p-4 card card-hover">
              <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-300">{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features ────────────────────────────────────────────────────────────── */
function FeaturesSection() {
  const features = [
    { icon: Globe,     title:'Structured World Model',     desc:'Beliefs are stored as typed (entity, attribute, value) triples — not raw text buried in a conversation.' },
    { icon: Layers,    title:'Bounded Context Queries',    desc:'The agent receives only the facts relevant to its current decision. History is never appended.' },
    { icon: GitBranch, title:'Versioned Belief Correction',desc:'When evidence contradicts a belief, the old belief is preserved and a new version is created — never silently overwritten.' },
    { icon: Brain,     title:'Confidence-Aware Facts',     desc:'Every belief carries a confidence score from 0 to 1. Stronger evidence raises it; contradictions trigger replacement.' },
    { icon: Shield,    title:'Transparent Audit Trail',    desc:'Every correction is recorded as a CorrectionEvent with old value, new value, reason, and timestamps.' },
    { icon: Zap,       title:'Local SLM Compatibility',   desc:'Designed for qwen2.5:3b via Ollama. Fully functional without any cloud API. Deterministic fallback included.' },
  ];
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">Core Features</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-white">Everything an agent needs to reason clearly</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div key={f.title} className="card card-hover p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{background:'rgba(79,70,229,0.15)',border:'1px solid rgba(79,70,229,0.25)'}}>
                <f.icon size={18} className="text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works ────────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n:1, label:'World Input',   desc:'Raw text observation from the environment' },
    { n:2, label:'Extractor',     desc:'Regex + optional LLM fact extraction' },
    { n:3, label:'World Model',   desc:'Structured belief store (JSON)' },
    { n:4, label:'Query Layer',   desc:'Bounded context assembly' },
    { n:5, label:'SLM Agent',     desc:'qwen2.5:3b via Ollama' },
    { n:6, label:'Action',        desc:'Single command executed' },
    { n:7, label:'Updater',       desc:'Beliefs updated or corrected' },
  ];
  return (
    <section id="how-it-works" className="py-24" style={{background:'rgba(12,18,37,0.6)'}}>
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">How It Works</p>
          <h2 className="text-3xl font-bold text-white">The MNEMOS Loop</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-3">
              <div className="card p-4 text-center w-32 space-y-1">
                <div className="w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs font-bold"
                  style={{background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'white'}}>
                  {s.n}
                </div>
                <p className="text-xs font-semibold text-white">{s.label}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{s.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight size={14} className="text-indigo-600 flex-shrink-0 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Belief correction demo ──────────────────────────────────────────────── */
function CorrectionDemo() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-4">
          <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">Belief Correction</p>
          <h2 className="text-3xl font-bold text-white">Contradictions are never silently overwritten</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-6 space-y-3" style={{border:'1px solid rgba(239,68,68,0.25)'}}>
            <div className="flex items-center justify-between">
              <span className="badge badge-red">superseded</span>
              <span className="text-xs text-slate-500">Turn 3</span>
            </div>
            <p className="text-sm font-mono text-slate-300">wooden_door.locked = <span className="text-red-400">true</span></p>
            <div className="text-xs text-slate-500 space-y-1">
              <p>Confidence: <span className="text-slate-300">0.70</span></p>
              <p>Source: initial observation</p>
            </div>
          </div>
          <div className="card p-6 space-y-3" style={{border:'1px solid rgba(16,185,129,0.25)'}}>
            <div className="flex items-center justify-between">
              <span className="badge badge-green">active</span>
              <span className="text-xs text-slate-500">Turn 5</span>
            </div>
            <p className="text-sm font-mono text-slate-300">wooden_door.locked = <span className="text-emerald-400">false</span></p>
            <div className="text-xs text-slate-500 space-y-1">
              <p>Confidence: <span className="text-emerald-400">0.96</span></p>
              <p>Reason: the wooden door opened without requiring a key</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Comparison ──────────────────────────────────────────────────────────── */
function Comparison() {
  const traditional = [
    'Sends complete interaction history every turn',
    'Context window grows continuously',
    'Contradictions remain buried in old messages',
    'Token usage increases every turn',
  ];
  const mnemos = [
    'Sends only the relevant world slice',
    'Near-flat context size regardless of turns',
    'Explicit belief versioning and correction events',
    'Bounded token usage with human-readable reasoning',
  ];
  return (
    <section className="py-24" style={{background:'rgba(12,18,37,0.6)'}}>
      <div className="max-w-5xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-4">
          <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">Comparison</p>
          <h2 className="text-3xl font-bold text-white">Why MNEMOS is different</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-slate-400 text-sm uppercase tracking-wide">Traditional Agent</h3>
            {traditional.map(t => (
              <div key={t} className="flex gap-2.5 items-start">
                <XCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-400">{t}</p>
              </div>
            ))}
          </div>
          <div className="card p-6 space-y-4" style={{border:'1px solid rgba(79,70,229,0.3)'}}>
            <h3 className="font-semibold text-indigo-400 text-sm uppercase tracking-wide">MNEMOS</h3>
            {mnemos.map(m => (
              <div key={m} className="flex gap-2.5 items-start">
                <CheckCircle size={15} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300">{m}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Metrics preview ─────────────────────────────────────────────────────── */
function MetricsPreview() {
  const stats = [
    { label:'Current Turn',       value:'12' },
    { label:'Active Beliefs',     value:'18' },
    { label:'Superseded',         value:'4'  },
    { label:'Context Tokens',     value:'~240'},
    { label:'Corrections',        value:'4'  },
  ];
  return (
    <section id="metrics" className="py-24">
      <div className="max-w-5xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-4">
          <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">Live Metrics</p>
          <h2 className="text-3xl font-bold text-white">Measure everything</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {stats.map(s => (
            <div key={s.label} className="card p-5 text-center min-w-[110px]">
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ─────────────────────────────────────────────────────────────────── */
function CTA() {
  const navigate = useNavigate();
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background:'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(79,70,229,0.12) 0%, transparent 70%)'
      }} />
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-8">
        <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
          Give autonomous agents<br />
          <span className="gradient-text">a memory they can correct.</span>
        </h2>
        <p className="text-lg text-slate-400">Local-first. No cloud required. Open source.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => navigate('/login')} className="btn-primary text-base py-3 px-8">
            <Zap size={16} /> Enter Demo
          </button>
          <a href="#how-it-works" className="btn-outline text-base py-3 px-8">
            View Architecture
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <MnemosLogo size={36} variant="full" />
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Self-correcting bounded-context world model for text-based autonomous agents.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Project</p>
            <div className="space-y-2">
              {['HackTronix 2.0','Track B — AI','TextWorld Agent','Local-first'].map(t => (
                <p key={t} className="text-sm text-slate-500">{t}</p>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Links</p>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-slate-500 hover:text-indigo-400 transition-colors">GitHub (placeholder)</a>
              <a href="#" className="block text-sm text-slate-500 hover:text-indigo-400 transition-colors">Documentation (placeholder)</a>
            </div>
          </div>
        </div>
        <div className="divider" />
        <div className="pt-6 flex flex-wrap justify-between items-center gap-4">
          <p className="text-xs text-slate-600">© 2025 MNEMOS · MIT License</p>
          <p className="text-xs text-slate-600">Local-first · No cloud required · No secrets committed</p>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export function LandingPage() {
  return (
    <div className="min-h-screen" style={{background:'var(--bg-base)'}}>
      <Navbar />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorks />
      <CorrectionDemo />
      <Comparison />
      <MetricsPreview />
      <CTA />
      <Footer />
    </div>
  );
}
