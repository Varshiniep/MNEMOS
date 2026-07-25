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
import { StarField } from '../components/brand/StarField';

const NAV = [
  { to: '/dashboard',              label: 'Overview',         icon: LayoutDashboard, end: true },
  { to: '/dashboard/run',          label: 'Agent Run',        icon: Play },
  { to: '/dashboard/world',        label: 'World Model',      icon: Globe },
  { to: '/dashboard/context',      label: 'Bounded Context',  icon: Layers },
  { to: '/dashboard/corrections',  label: 'Corrections',      icon: AlertTriangle },
  { to: '/dashboard/metrics',      label: 'Metrics',          icon: BarChart2 },
  { to: '/dashboard/architecture', label: 'Architecture',     icon: Network },
  { to: '/dashboard/settings',     label: 'Settings',         icon: Settings },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const navigate = useNavigate();
  const doLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      className={`${collapsed ? 'w-[60px]' : 'w-[220px]'} flex-shrink-0 flex flex-col relative overflow-hidden`}
      style={{
        background: 'rgba(5,7,18,0.98)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        transition: 'width 0.25s cubic-bezier(.25,.46,.45,.94)',
      }}
    >
      {/* Subtle star bg inside sidebar */}
      <div className="absolute inset-0 opacity-30 pointer-events-none"><StarField density={30} /></div>
      {/* Violet glow at top */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)',
      }} />

      {/* Logo row */}
      <div className="h-14 flex items-center px-4 flex-shrink-0 relative z-10"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex-1 overflow-hidden">
          {!collapsed && <MnemosLogo size={28} variant="full" />}
          {collapsed && <MnemosLogo size={26} variant="icon" />}
        </div>
        <button onClick={onToggle} className="btn-ghost p-1.5 flex-shrink-0" aria-label="Toggle sidebar">
          {collapsed ? <Menu size={14} /> : <X size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto relative z-10">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={15} className="flex-shrink-0" />
            {!collapsed && <span className="truncate" style={{ fontSize: 13 }}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <button onClick={doLogout}
          className="sidebar-item w-full"
          style={{ color: '#374151' }}
          title={collapsed ? 'Logout' : undefined}>
          <LogOut size={14} className="flex-shrink-0" />
          {!collapsed && <span style={{ fontSize:13 }}>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  const { user }   = useAuth();
  const [runId]    = useRunId();
  const navigate   = useNavigate();

  const hasRun     = !!runId;
  const runColor   = hasRun ? '#10b981' : '#374151';
  const runLabel   = hasRun ? 'ACTIVE' : 'IDLE';

  return (
    <header className="h-14 flex-shrink-0 flex items-center px-6 gap-4"
      style={{
        background: 'rgba(5,7,18,0.98)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(8px)',
      }}>
      {/* Spacer */}
      <div className="flex-1" />

      {/* Status chips */}
      <div className="hidden md:flex items-center gap-2">
        <span className="badge badge-slate" style={{ fontFamily:'monospace', fontSize:9 }}>DEMO WORLD</span>
        <span className="badge" style={{
          background:`${runColor}12`, color:runColor,
          border:`1px solid ${runColor}20`, fontFamily:'monospace', fontSize:9,
        }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background:runColor, boxShadow:`0 0 4px ${runColor}` }} />
          AGENT {runLabel}
        </span>
        <span className="badge badge-violet" style={{ fontFamily:'monospace', fontSize:9 }}>
          QWEN2.5:3B
        </span>
        {runId && (
          <span className="badge badge-slate" style={{ fontFamily:'monospace', fontSize:9 }}>
            RUN {runId.toUpperCase()}
          </span>
        )}
      </div>

      {/* Bell */}
      <button className="btn-ghost" style={{ padding:'6px' }} aria-label="Notifications">
        <Bell size={15} />
      </button>

      {/* Avatar */}
      <button
        onClick={() => navigate('/dashboard/settings')}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
          style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', fontFamily:'monospace' }}>
          {user?.name?.charAt(0) ?? 'D'}
        </div>
        {user && (
          <span className="hidden md:block" style={{ fontSize:12, color:'#374151', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {user.name}
          </span>
        )}
        <ChevronDown size={12} style={{ color:'#374151' }} />
      </button>
    </header>
  );
}

export function DashboardShell() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#030308' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto relative" style={{ background: '#030308' }}>
          {/* Subtle background grid for all dashboard pages */}
          <div className="absolute inset-0 grid-bg opacity-[0.3] pointer-events-none" />
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
