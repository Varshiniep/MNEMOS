import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Play, Globe, Layers, AlertTriangle,
  BarChart2, Network, Brain,
} from 'lucide-react';

const NAV = [
  { to: '/',             label: 'Overview',        icon: LayoutDashboard },
  { to: '/run',          label: 'Agent Run',       icon: Play },
  { to: '/world',        label: 'World Model',     icon: Globe },
  { to: '/context',      label: 'Bounded Context', icon: Layers },
  { to: '/corrections',  label: 'Corrections',     icon: AlertTriangle },
  { to: '/metrics',      label: 'Metrics',         icon: BarChart2 },
  { to: '/architecture', label: 'Architecture',    icon: Network },
];

export function AppShell() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-indigo-600" />
            <span className="font-bold text-slate-800 tracking-tight">MNEMOS</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Self-Correcting World Model</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200 text-[10px] text-slate-300">
          v0.1.0 · MIT
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
