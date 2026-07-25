import { ArrowDown } from 'lucide-react';

interface StepProps {
  number: number;
  label: string;
  desc: string;
  accent?: boolean;
}

function Step({ number, label, desc, accent }: StepProps) {
  return (
    <div className={`rounded-xl border p-4 flex gap-4 items-start ${accent ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
      <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold
        ${accent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
        {number}
      </div>
      <div>
        <p className="font-semibold text-slate-800 text-sm">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

const STEPS: StepProps[] = [
  {
    number: 1, label: 'Text Environment',
    desc: 'The agent operates in a text-based world (demo or TextWorld). Each action produces a raw text observation.',
  },
  {
    number: 2, label: 'Observation Extractor', accent: true,
    desc: 'Deterministic regex parsing extracts structured facts from raw text — room, exits, objects, states, inventory. An optional LLM fallback augments results when Ollama is available.',
  },
  {
    number: 3, label: 'Belief Updater', accent: true,
    desc: 'Each extracted fact is compared against the active world model. New facts are inserted; agreeing facts reinforce confidence; contradicting facts trigger a correction: the old belief is deactivated, a new belief is created, and a CorrectionEvent is recorded.',
  },
  {
    number: 4, label: 'World Model (JSON store)',
    desc: 'A structured collection of Beliefs and CorrectionEvents, persisted as JSON. Contains the complete history — active and superseded beliefs, plus the full correction audit trail.',
  },
  {
    number: 5, label: 'Bounded Context Query', accent: true,
    desc: 'Only the relevant slice of the world model is assembled for the agent: current room, visible objects, relevant active beliefs, inventory, exits, and valid commands. The full world model, inactive beliefs, and action history are explicitly excluded.',
  },
  {
    number: 6, label: 'Local SLM Agent (Ollama)',
    desc: 'The bounded context slice (never the full history) is sent to qwen2.5:3b running locally via Ollama. The model outputs a single text adventure command. Invalid responses trigger one retry with a correction prompt, then a deterministic fallback.',
  },
  {
    number: 7, label: 'Action Execution',
    desc: 'The selected command is executed in the environment. The resulting observation feeds back to Step 1 for the next turn.',
  },
];

export function ArchitecturePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Architecture</h1>
        <p className="text-sm text-slate-500 mt-0.5">How the MNEMOS loop works.</p>
      </div>

      {/* Key insight */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-sm text-indigo-800">
        <strong>Core principle:</strong> The agent never receives its full interaction history. It only sees a compact,
        carefully bounded world slice — built fresh from the world model every turn.
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map((step, i) => (
          <div key={step.number}>
            <Step {...step} />
            {i < STEPS.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown size={16} className="text-slate-300" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Component table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Component</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Module</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Technology</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Extractor',        'mnemos.extractor',     'Regex + optional Ollama'],
              ['Belief Updater',   'mnemos.updater',       'Pure Python / Pydantic v2'],
              ['World Model',      'mnemos.world_model',   'Pydantic v2 + JSON files'],
              ['Bounded Context',  'mnemos.query',         'Pure Python'],
              ['Ollama Client',    'mnemos.agent',         'Ollama HTTP API (local)'],
              ['REST API',         'mnemos.api',           'FastAPI + Uvicorn'],
              ['Frontend',         'frontend/',            'React + Vite + Tailwind'],
            ].map(([comp, mod, tech]) => (
              <tr key={comp} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 font-medium text-slate-700">{comp}</td>
                <td className="px-4 py-2 font-mono text-xs text-indigo-700">{mod}</td>
                <td className="px-4 py-2 text-xs text-slate-500">{tech}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
