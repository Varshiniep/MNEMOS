import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Trash2, Save } from 'lucide-react';
import { clearIntroFlag } from '../../components/brand/IntroSplash';
import { setRunId } from '../../hooks/useRunId';
import { logout } from '../../hooks/useAuth';

const P: React.CSSProperties = {
  background:'rgba(8,10,22,0.9)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:14, padding:20,
};

function Toggle({ label, desc, checked, onChange }: { label:string; desc:string; checked:boolean; onChange:(v:boolean)=>void }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:'#94a3b8' }}>{label}</p>
        <p style={{ fontSize:11, color:'#2d3748', marginTop:3 }}>{desc}</p>
      </div>
      <button onClick={() => onChange(!checked)} role="switch" aria-checked={checked}
        style={{ width:40, height:22, borderRadius:999, flexShrink:0, position:'relative', cursor:'pointer', transition:'background 0.2s', border:'none', background:checked?'linear-gradient(135deg,#6366f1,#8b5cf6)':'rgba(255,255,255,0.1)' }}>
        <span style={{ position:'absolute', top:3, width:16, height:16, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.4)', transition:'transform 0.2s', transform:checked?'translateX(21px)':'translateX(3px)' }} />
      </button>
    </div>
  );
}

function Slider({ label, desc, value, min, max, unit, onChange }: { label:string; desc:string; value:number; min:number; max:number; unit:string; onChange:(v:number)=>void }) {
  return (
    <div style={{ padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
        <div>
          <p style={{ fontSize:13, fontWeight:600, color:'#94a3b8' }}>{label}</p>
          <p style={{ fontSize:11, color:'#2d3748', marginTop:2 }}>{desc}</p>
        </div>
        <span className="mono" style={{ fontSize:12, color:'#8b5cf6' }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width:'100%', accentColor:'#8b5cf6' }} />
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [showRaw,       setShowRaw]       = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [delay,         setDelay]         = useState(500);
  const [speed,         setSpeed]         = useState(1);
  const [saved,         setSaved]         = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ padding:'28px 32px', maxWidth:680, margin:'0 auto' }}>
      <div style={{ marginBottom:28 }}>
        <p className="label-overline" style={{ marginBottom:6 }}>Configuration</p>
        <h2 style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:900, letterSpacing:'-0.04em', color:'#fff' }}>
          Settings
        </h2>
      </div>

      {/* Display */}
      <div style={{ ...P, marginBottom:14 }}>
        <p className="label-overline" style={{ marginBottom:4 }}>Display</p>
        <Toggle label="Show Raw JSON"   desc="Display raw API response JSON in data panels" checked={showRaw}       onChange={setShowRaw} />
        <Toggle label="Reduced Motion"  desc="Disable animations and transitions throughout the app" checked={reducedMotion} onChange={setReducedMotion} />
      </div>

      {/* Agent */}
      <div style={{ ...P, marginBottom:14 }}>
        <p className="label-overline" style={{ marginBottom:4 }}>Agent Behaviour</p>
        <Slider label="Auto-Run Delay"  desc="Pause between automatic turns" value={delay} min={0} max={2000} unit="ms" onChange={setDelay} />
        <Slider label="Demo Speed"      desc="Step speed multiplier"          value={speed} min={1} max={5}    unit="×"  onChange={setSpeed} />
      </div>

      {/* Intro */}
      <div style={{ ...P, marginBottom:14 }}>
        <p className="label-overline" style={{ marginBottom:12 }}>Intro Splash</p>
        <p style={{ fontSize:12, color:'#2d3748', marginBottom:14, lineHeight:1.6 }}>
          The intro runs once per browser session. Clear the flag to replay it on the next load.
        </p>
        <button onClick={() => { clearIntroFlag(); window.location.href = '/'; }} className="btn-outline">
          <RotateCcw size={13} /> REPLAY INTRO ON NEXT LOAD
        </button>
      </div>

      {/* Session */}
      <div style={{ ...P, marginBottom:14 }}>
        <p className="label-overline" style={{ marginBottom:12 }}>Session</p>
        <div style={{ display:'flex', gap:10, marginBottom:12 }}>
          <button onClick={() => { setRunId(null); navigate('/dashboard'); }} className="btn-outline">
            <Trash2 size={13} /> CLEAR CURRENT RUN
          </button>
          <button onClick={() => { logout(); navigate('/login'); }} className="btn-danger">
            SIGN OUT
          </button>
        </div>
        <p className="mono" style={{ fontSize:10, color:'#2d3748' }}>
          DEMO: demo@mnemos.ai / mnemos123
        </p>
      </div>

      {/* About */}
      <div style={{ ...P, marginBottom:20 }}>
        <p className="label-overline" style={{ marginBottom:12 }}>About</p>
        {[['VERSION','v0.1.0'],['EVENT','HackTronix 2.0'],['TRACK','Track B — AI'],['ENVIRONMENT','TextWorld Agent'],['ARCHITECTURE','Local-first, no cloud'],['LICENSE','MIT']].map(([l,v])=>(
          <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <span className="mono" style={{ fontSize:9, color:'#2d3748', letterSpacing:'0.1em' }}>{l}</span>
            <span className="mono" style={{ fontSize:11, color:'#4b5563' }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button onClick={handleSave} className="btn-primary">
          <Save size={13} />{saved ? 'SAVED ✓' : 'SAVE PREFERENCES'}
        </button>
      </div>
    </div>
  );
}
