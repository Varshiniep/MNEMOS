import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  Play,
  Globe,
  Layers,
  AlertTriangle,
  BarChart2,
  Network,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
} from "lucide-react";

import { MnemosLogo } from "../components/brand/MnemosLogo";
import { StarField } from "../components/brand/StarField";
import { useAuth, logout } from "../hooks/useAuth";
import { useRunId } from "../hooks/useRunId";

const NAV = [
  {
    to: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/dashboard/run",
    label: "Agent Run",
    icon: Play,
  },
  {
    to: "/dashboard/world",
    label: "World Model",
    icon: Globe,
  },
  {
    to: "/dashboard/context",
    label: "Bounded Context",
    icon: Layers,
  },
  {
    to: "/dashboard/corrections",
    label: "Corrections",
    icon: AlertTriangle,
  },
  {
    to: "/dashboard/metrics",
    label: "Metrics",
    icon: BarChart2,
  },
  {
    to: "/dashboard/architecture",
    label: "Architecture",
    icon: Network,
  },
  {
    to: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function Sidebar({
  collapsed,
  onToggle,
}: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`relative flex h-screen flex-shrink-0 flex-col overflow-hidden ${
        collapsed ? "w-[84px]" : "w-[276px]"
      }`}
      style={{
        background:
          "linear-gradient(180deg, rgba(7,9,22,0.99) 0%, rgba(4,6,16,0.99) 100%)",
        borderRight:
          "1px solid rgba(148,163,184,0.09)",
        transition:
          "width 260ms cubic-bezier(0.22,1,0.36,1)",
        boxShadow:
          "18px 0 60px rgba(0,0,0,0.28)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <StarField density={24} />
      </div>

      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-56"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.16), transparent 70%)",
        }}
      />

      <div
        className="relative z-10 flex h-[76px] flex-shrink-0 items-center px-4"
        style={{
          borderBottom:
            "1px solid rgba(148,163,184,0.08)",
        }}
      >
        <div className="flex min-w-0 flex-1 items-center">
          <MnemosLogo
            size={collapsed ? 34 : 32}
            variant={collapsed ? "icon" : "full"}
          />
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200"
          style={{
            color: "#94a3b8",
            background:
              "rgba(255,255,255,0.025)",
            border:
              "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {collapsed ? (
            <Menu size={17} />
          ) : (
            <X size={17} />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="relative z-10 px-5 pb-2 pt-5">
          <p
            className="m-0 text-[10px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "#475569" }}
          >
            Workspace
          </p>
        </div>
      )}

      <nav className="relative z-10 flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
        {NAV.map(
          ({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `group relative flex h-12 items-center rounded-2xl transition-all duration-200 ${
                  collapsed
                    ? "justify-center px-0"
                    : "gap-3.5 px-4"
                } ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-200"
                }`
              }
              style={({ isActive }) => ({
                background: isActive
                  ? "linear-gradient(90deg, rgba(124,58,237,0.19), rgba(99,102,241,0.08))"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(139,92,246,0.22)"
                  : "1px solid transparent",
                boxShadow: isActive
                  ? "inset 0 1px 0 rgba(255,255,255,0.04), 0 10px 35px rgba(76,29,149,0.09)"
                  : "none",
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 h-6 w-[3px] rounded-r-full"
                      style={{
                        background:
                          "linear-gradient(180deg,#a78bfa,#6366f1)",
                        boxShadow:
                          "0 0 14px rgba(139,92,246,0.75)",
                      }}
                    />
                  )}

                  <span
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200"
                    style={{
                      color: isActive
                        ? "#c4b5fd"
                        : undefined,
                      background: isActive
                        ? "rgba(124,58,237,0.12)"
                        : "transparent",
                    }}
                  >
                    <Icon size={17} strokeWidth={1.9} />
                  </span>

                  {!collapsed && (
                    <span className="truncate text-[13px] font-semibold">
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ),
        )}
      </nav>

      <div
        className="relative z-10 p-3"
        style={{
          borderTop:
            "1px solid rgba(148,163,184,0.07)",
        }}
      >
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex h-12 w-full items-center rounded-2xl transition-all duration-200 ${
            collapsed
              ? "justify-center"
              : "gap-3.5 px-4"
          }`}
          style={{
            color: "#64748b",
          }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl">
            <LogOut size={17} />
          </span>

          {!collapsed && (
            <span className="text-[13px] font-semibold">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  const { user } = useAuth();
  const [runId] = useRunId();
  const navigate = useNavigate();

  const hasRun = Boolean(runId);
  const runColor = hasRun ? "#34d399" : "#64748b";
  const runLabel = hasRun ? "ACTIVE" : "IDLE";

  return (
    <header
      className="relative z-30 flex h-[76px] flex-shrink-0 items-center gap-4 px-6 lg:px-8"
      style={{
        background:
          "rgba(4,6,16,0.78)",
        borderBottom:
          "1px solid rgba(148,163,184,0.08)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
      }}
    >
      <div className="flex-1" />

      <div className="hidden items-center gap-2 lg:flex">
        <span
          className="inline-flex h-8 items-center rounded-full px-3 text-[9px] font-bold tracking-[0.15em]"
          style={{
            fontFamily: "monospace",
            color: "#94a3b8",
            background:
              "rgba(148,163,184,0.06)",
            border:
              "1px solid rgba(148,163,184,0.10)",
          }}
        >
          DEMO WORLD
        </span>

        <span
          className="inline-flex h-8 items-center gap-2 rounded-full px-3 text-[9px] font-bold tracking-[0.15em]"
          style={{
            fontFamily: "monospace",
            color: runColor,
            background: `${runColor}10`,
            border: `1px solid ${runColor}22`,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: runColor,
              boxShadow: `0 0 8px ${runColor}`,
            }}
          />
          AGENT {runLabel}
        </span>

        <span
          className="inline-flex h-8 items-center rounded-full px-3 text-[9px] font-bold tracking-[0.15em]"
          style={{
            fontFamily: "monospace",
            color: "#c4b5fd",
            background:
              "rgba(124,58,237,0.09)",
            border:
              "1px solid rgba(139,92,246,0.18)",
          }}
        >
          QWEN2.5:3B
        </span>

        {runId && (
          <span
            className="inline-flex h-8 max-w-[180px] items-center truncate rounded-full px-3 text-[9px] font-bold tracking-[0.12em]"
            style={{
              fontFamily: "monospace",
              color: "#94a3b8",
              background:
                "rgba(148,163,184,0.05)",
              border:
                "1px solid rgba(148,163,184,0.09)",
            }}
          >
            RUN {runId.toUpperCase()}
          </span>
        )}
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200"
        style={{
          color: "#94a3b8",
          background:
            "rgba(255,255,255,0.025)",
          border:
            "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Bell size={17} />

        <span
          className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full"
          style={{
            background: "#8b5cf6",
            boxShadow:
              "0 0 8px rgba(139,92,246,0.8)",
          }}
        />
      </button>

      <button
        type="button"
        onClick={() =>
          navigate("/dashboard/settings")
        }
        className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all duration-200"
        aria-label="User menu"
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black text-white"
          style={{
            fontFamily: "monospace",
            background:
              "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow:
              "0 10px 28px rgba(99,102,241,0.25)",
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() ??
            "D"}
        </div>

        <div className="hidden min-w-0 text-left md:block">
          <p
            className="m-0 max-w-[120px] truncate text-[12px] font-semibold"
            style={{ color: "#cbd5e1" }}
          >
            {user?.name ?? "Demo User"}
          </p>

          <p
            className="m-0 mt-0.5 text-[9px] uppercase tracking-[0.14em]"
            style={{ color: "#475569" }}
          >
            Local workspace
          </p>
        </div>

        <ChevronDown
          size={13}
          className="hidden md:block"
          style={{ color: "#64748b" }}
        />
      </button>
    </header>
  );
}

export function DashboardShell() {
  const [collapsed, setCollapsed] =
    useState(false);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#030308" }}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={() =>
          setCollapsed((current) => !current)
        }
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />

        <main
          className="relative flex-1 overflow-y-auto"
          style={{
            background:
              "linear-gradient(180deg,#030308 0%,#050711 100%)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.22]" />

          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[760px] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(circle at center, rgba(99,102,241,0.08), transparent 70%)",
            }}
          />

          <div className="relative z-10 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}