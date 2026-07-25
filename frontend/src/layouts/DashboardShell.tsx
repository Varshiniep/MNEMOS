import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Play, Globe, Layers, AlertTriangle,
  BarChart2, Network, Settings, LogOut, Menu, X,
  Bell, ChevronDown,
} from 'lucide-react';
import { MnemosLogo } from '../components/brand/MnemosLogo';
import { useAuth, logout } from '../hooks/useAuth';
import { useRunId } from '../hooks/useRunId';

const NAV = [
  { to: '/dashboard',              label: 'Overview',          icon: LayoutDashboard, end: true },
  { to: '/dashboard/run',          label: 'Agent Run',         icon: Play },
  { to: '/dashboard/world',        label: 'World Model',       icon: Globe },
  { to: '/dashboard/context',      label: 'Bounded Context',   icon: Layers },
  { to: '/dashboard/corrections',  label: 'Corrections',       icon: AlertTriangle },
  { to: '/dashboard/metrics',      label: 'Metrics',           icon: BarChart2 },
  { to: '/dashboard/architecture', label: 'Architecture',      icon: Network },
  { to: '/dashboard/settings',     label: 'Settings',          icon: Settings },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  const w = collapsed ? 'w-16' : 'w-56';

  return (
    <aside
      className={`${w} flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden`}
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b flex-shrink-0`}
        style={{ borderColor: 'var(--border)' }}>
        {collapsed
          ? <MnemosLogo size={28} variant="icon" />
          : <MnemosLogo size={28} variant="full" />
        }
        <button onClick={onToggle}
          className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          aria-label="Toggle sidebar">
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'text-white font-medium'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`
            }
            style={({ isActive }) => isActive
              ? { background: 'rgba(79,70,229,0.2)', borderLeft: '2px solid #4f46e5' }
              : { borderLeft: '2px solid transparent' }
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={16} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-500
            hover:text-red-400 hover:bg-red-500/10 transition-all"
          title={collapsed ? 'Logout' : undefined}>
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

function Topbar({ pageTitle }: { pageTitle?: string }) {
  const { user } = useAuth();
  const [runId] = useRunId();
  const navigate = useNavigate();

  const statusColor = runId ? '#34d399' : '#475569';
  const statusLabel = runId ? 'Run Active' : 'No Run';

  return (
    <header className="h-16 flex-shrink-0 flex items-center px-6 gap-4"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
      {/* Page title */}
      <h1 className="text-lg font-semibold text-white flex-1 truncate">{pageTitle ?? 'Dashboard'}</h1>

      {/* Status chips */}
      <div className="hidden md:flex items-center gap-2">
        <span className="badge badge-slate">Demo World</span>
        <span className="badge" style={{ background: `${statusColor}22`, color: statusColor }}>
          <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ background: statusColor }} />
          {statusLabel}
        </span>
        <span className="badge badge-violet">qwen2.5:3b</span>
      </div>

      {/* Bell */}
      <button className="btn-ghost p-2" aria-label="Notifications">
        <Bell size={16} />
      </button>

      {/* Avatar */}
      <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate('/dashboard/settings')} aria-label="User menu">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white' }}>
          {user?.name?.charAt(0) ?? 'D'}
        </div>
        {user && (
          <span className="hidden md:block text-sm text-slate-400 max-w-[100px] truncate">{user.name}</span>
        )}
        <ChevronDown size={13} className="text-slate-600" />
      </div>
    </header>
  );
}

export function DashboardShell() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
