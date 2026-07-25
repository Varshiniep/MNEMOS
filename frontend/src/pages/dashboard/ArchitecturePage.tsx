import { CheckCircle } from 'lucide-react';

const STEPS = [
  { n:1, label:'World Input', color:'#06b6d4', desc:'Raw text observation from the demo or TextWorld.', input:'Environment step', output:'Raw text' },
  { n:2, label:'Extractor',   color:'#6366f1', desc:'Deterministic regex extracts room, exits, objects, states. Optional Ollama fallback.', input:'Raw text', output:'ExtractedFact[]' },
  { n:3, label:'World Model', color:'#8b5cf6', desc:'Three-rule updater: insert / reinforce / correct. All history preserved.', input:'ExtractedFact[]', output:'WorldState (JSON)' },
  { n:4, label:'Query Layer', color:'#a78bfa', desc:'Assembles a bounded slice: room, active beliefs, exits, inventory, commands.', input:'WorldState', output:'BoundedContext' },
  { n:5, label:'SLM Agent',   color:'#c4b5fd', desc:'qwen2.5:3b via Ollama. One command per turn. Retry + deterministic fallback.', input:'BoundedContext', output:'Text command' },
  { n:6, label:'Action',      color:'#e2d9f3', desc:'Validated command executed in the environment.', input:'Text command', output:'StepResult' },
  { n:7, label:'Updater',     color:'#6366f1', desc:'New observation feeds back to Step 2. Cycle repeats.', input:'StepResult', output:'Next turn →' },
];

const COMPONENTS = [
  ['Extractor',       'mnemos.extractor',   'Raw text',        'ExtractedFact[]',  'Regex + Ollama'],
  ['Belief Updater',  'mnemos.updater',     'ExtractedFact[]', 'WorldState delta', 'Python / Pydantic v2'],
  ['World Model',     'mnemos.world_model', 'Belief deltas',   'WorldState',       'Pydantic v2 + JSON'],
  ['Bounded Context', 'mnemos.query',       'WorldState',      'BoundedContext',   'Pure Python'],
  ['Ollama Client',   'mnemos.agent',       'Prompt string',   'Command string',   'Ollama HTTP (local)'],
  ['REST API',        'mnemos.api',         'HTTP requests',   'JSON responses',   'FastAPI + Uvicorn'],
  ['Frontend',        'frontend/',          'API data',        'Dashboard UI',     'React + Vite + TW'],
];

const WHY = [
  'Does not repeatedly send the full interaction history to the model.',
  'Beliefs are versioned — contradictions create new beliefs, never silently overwrite old ones.',
  'Every correction is visible as a CorrectionEvent with old value, new value, reason, and timestamp.',
  'The bounded context stays near-flat in size regardless of how many turns have elapsed.',
];

const P: React.CSSProperties = {
  background:'rgba(8,10,22,0.9)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14,
};

export function ArchitecturePage() {
  return (
    <div style={{ padding:'28px 32px', maxWidth:1000, margin:'0 auto' }}>
      <div style={{ marginBottom:28 }}>
        <p className="label-overline" style={{ marginBottom:6 }}>System Design</p>
        <h2 style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:900, letterSpacing:'-0.04em', color:'#fff' }}>
          Architecture
        </h2>
      </div>

      {/* Key insight */}
      <div style={{ display:'flex', gap:10, padding:'14px 16px', borderRadius:12, background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.18)', marginBottom:24 }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background:'#6366f1', flexShrink:0, marginTop:6, boxShadow:'0 0 8px #6366f1' }} />
        <p style={{ fontSize:13, color:'#6366f1', lineHeight:1.6 }}>
          <strong>Core principle:</strong> The agent never receives its full interaction history. Each turn it receives
          only a compact, relevance-ranked world slice — assembled fresh from the structured world model.
        </p>
      </div>

      {/* Steps */}
      <div style={{ ...P, marginBottom:20, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <p className="label-overline">THE LOOP</p>
        </div>
        <div style={{ padding:16, display:'flex', flexDirection:'column', gap:0 }}>
          {STEPS.map((s, i) => (
            <div key={s.n}>
              <div style={{ display:'flex', gap:14, padding:'14px 8px' }}>
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:12, fontWeight:900, fontFamily:'monospace',
                  background:`${s.color}18`, border:`1px solid ${s.color}35`, color:s.color,
                }}>
                  {s.n}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
                    <p className="mono" style={{ fontSize:10, color:s.color, letterSpacing:'0.1em' }}>{s.label}</p>
                    <span style={{ fontSize:11, color:'#2d3748' }}>— {s.desc}</span>
                  </div>
                  <div style={{ display:'flex', gap:16 }}>
                    <span className="mono" style={{ fontSize:9, color:'#1f2937' }}>IN: {s.input}</span>
                    <span className="mono" style={{ fontSize:9, color:'#1f2937' }}>OUT: {s.output}</span>
                  </div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ marginLeft:26, width:1, height:8, background:`linear-gradient(180deg,${s.color}40,${STEPS[i+1].color}40)` }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Component table */}
      <div style={{ ...P, overflow:'hidden', marginBottom:20 }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <p className="label-overline">COMPONENT REFERENCE</p>
        </div>
        <table className="table-dark">
          <thead>
            <tr><th>Component</th><th>Module</th><th className="hidden md:table-cell">Input</th><th className="hidden md:table-cell">Output</th><th>Tech</th></tr>
          </thead>
          <tbody>
            {COMPONENTS.map(([comp, mod, inp, out, tech]) => (
              <tr key={comp}>
                <td style={{ fontWeight:600, color:'#94a3b8' }}>{comp}</td>
                <td><span className="mono" style={{ fontSize:10, padding:'2px 7px', borderRadius:5, background:'rgba(139,92,246,0.1)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.12)' }}>{mod}</span></td>
                <td className="mono" style={{ fontSize:10 }}>{inp}</td>
                <td className="mono" style={{ fontSize:10 }}>{out}</td>
                <td style={{ fontSize:11, color:'#2d3748' }}>{tech}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Why different */}
      <div style={{ ...P, padding:20 }}>
        <p className="label-overline" style={{ marginBottom:16 }}>WHY MNEMOS IS DIFFERENT</p>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {WHY.map((w, i) => (
            <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
              <CheckCircle size={14} style={{ color:'#10b981', flexShrink:0, marginTop:2 }} />
              <p style={{ fontSize:13, color:'#4b5563', lineHeight:1.65 }}>{w}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
