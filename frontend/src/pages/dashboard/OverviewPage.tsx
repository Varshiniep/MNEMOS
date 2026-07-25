import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  GitBranch,
  Globe,
  Layers,
  Play,
  RefreshCw,
  Server,
  Sparkles,
  Target,
  Terminal,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

import {
  fetchHealth,
  startRun,
} from "../../services/api";

import type { HealthResponse } from "../../types/api";

import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";
import { NodeGraph } from "../../components/brand/NodeGraph";

import { useRunId } from "../../hooks/useRunId";

export function OverviewPage() {
  const navigate = useNavigate();

  const [health, setHealth] =
    useState<HealthResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const [runId, setRunId] = useRunId();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchHealth();

      setHealth(response);
      setLastUpdated(new Date());
    } catch (caughtError) {
      setHealth(null);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Cannot connect to MNEMOS backend",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStart = async () => {
    if (!health || starting) {
      return;
    }

    try {
      setStarting(true);
      setError("");

      const response = await startRun({
        objective:
          "Find the target object in the storage room",
        environment_type: "demo",
        max_turns: 20,
        use_ollama:
          health.ollama_available ?? false,
      });

      setRunId(response.run_id);
      navigate("/dashboard/run");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to start the agent run",
      );
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          padding: 32,
        }}
      >
        <LoadingState message="Connecting to MNEMOS backend…" />
      </div>
    );
  }

  const systemOnline = Boolean(health);

  const onlineServices = health
    ? [
        true,
        health.ollama_available,
        health.demo_available,
        health.textworld_available,
      ].filter(Boolean).length
    : 0;

  return (
    <main
      style={{
        width: "100%",
        maxWidth: 1440,
        marginInline: "auto",
        padding: "28px clamp(18px, 3vw, 38px) 48px",
      }}
    >
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 20,
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: systemOnline
                  ? "#34d399"
                  : "#f87171",
                boxShadow: systemOnline
                  ? "0 0 14px rgba(52,211,153,0.8)"
                  : "0 0 14px rgba(248,113,113,0.7)",
              }}
            />

            <p
              className="label-overline"
              style={{
                color: systemOnline
                  ? "#34d399"
                  : "#f87171",
              }}
            >
              {systemOnline
                ? "SYSTEM OPERATIONAL"
                : "BACKEND UNAVAILABLE"}
            </p>
          </div>

          <h1
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize:
                "clamp(2rem, 4vw, 3.25rem)",
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-0.052em",
            }}
          >
            System Overview
          </h1>

          <p
            style={{
              maxWidth: 620,
              margin: "11px 0 0",
              color: "#64748b",
              fontSize: 14,
              lineHeight: 1.65,
            }}
          >
            Monitor the MNEMOS world model,
            runtime services, bounded context and
            autonomous agent activity.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {lastUpdated && (
            <div
              className="mono"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "#475569",
                fontSize: 8,
                letterSpacing: "0.08em",
              }}
            >
              <Clock3 size={12} />

              UPDATED{" "}
              {lastUpdated.toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => void load()}
            className="btn-outline"
            aria-label="Refresh system status"
            style={{
              minHeight: 40,
              padding: "9px 13px",
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </header>

      {/* =====================================================
          ERROR MESSAGE
          ===================================================== */}

      {error && (
        <div style={{ marginBottom: 24 }}>
          <ErrorState
            message={`${error} — start the backend with: uvicorn mnemos.api.app:app --reload --port 8000`}
            retry={load}
          />
        </div>
      )}

      {/* =====================================================
          METRICS
          ===================================================== */}

      <section
        aria-label="System metrics"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 13,
          marginBottom: 18,
        }}
      >
        <OverviewMetric
          label="Backend Status"
          value={
            systemOnline ? "Online" : "Offline"
          }
          description={
            systemOnline
              ? "API responding normally"
              : "Connection unavailable"
          }
          icon={Server}
          colour={
            systemOnline ? "#34d399" : "#f87171"
          }
          trend={
            systemOnline ? "HEALTHY" : "ERROR"
          }
        />

        <OverviewMetric
          label="Runtime Services"
          value={`${onlineServices}/4`}
          description="Connected system components"
          icon={Activity}
          colour="#8b5cf6"
          trend="LIVE"
        />

        <OverviewMetric
          label="Reasoning Engine"
          value={
            health?.ollama_available
              ? "Ollama"
              : "Fallback"
          }
          description={
            health?.ollama_available
              ? health.model
              : "Deterministic mode"
          }
          icon={Brain}
          colour={
            health?.ollama_available
              ? "#22d3ee"
              : "#f59e0b"
          }
          trend={
            health?.ollama_available
              ? "LOCAL LLM"
              : "OFFLINE"
          }
        />

        <OverviewMetric
          label="Active Run"
          value={runId ? "Ready" : "None"}
          description={
            runId
              ? shortenRunId(runId)
              : "Launch a demonstration"
          }
          icon={Zap}
          colour="#818cf8"
          trend={
            runId ? "RESUMABLE" : "IDLE"
          }
        />
      </section>

      {/* =====================================================
          MAIN GRID
          ===================================================== */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 430px), 1fr))",
          gap: 18,
          marginBottom: 18,
        }}
      >
        {/* World model panel */}

        <div
          className="card"
          style={{
            minHeight: 430,
            overflow: "hidden",
            position: "relative",
            padding: 22,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(circle at 50% 52%, rgba(124,58,237,0.1), transparent 44%)",
            }}
          />

          <PanelHeader
            eyebrow="WORLD MODEL"
            title="Live belief graph"
            description="Structured entities, locations and relationships available to the agent."
            icon={Globe}
            colour="#8b5cf6"
            action={
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/dashboard/world",
                  )
                }
                className="btn-ghost"
                style={{
                  minHeight: 34,
                  padding: "7px 9px",
                  fontSize: 10,
                }}
              >
                Inspect
                <ArrowRight size={12} />
              </button>
            }
          />

          <div
            style={{
              position: "relative",
              minHeight: 260,
              marginTop: 18,
              overflow: "hidden",
              borderRadius: 17,
              background:
                "linear-gradient(180deg, rgba(4,8,18,0.88), rgba(3,6,14,0.94))",
              border:
                "1px solid rgba(148,163,184,0.07)",
            }}
          >
            <div
              className="grid-bg"
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.45,
              }}
            />

            <div
              style={{
                position: "relative",
                display: "grid",
                minHeight: 260,
                placeItems: "center",
              }}
            >
              <NodeGraph
                width={500}
                height={255}
                animate
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 14,
            }}
          >
            {[
              "Hall",
              "Kitchen",
              "Storage Room",
              "Target Object",
            ].map((entity) => (
              <span
                key={entity}
                className="mono"
                style={{
                  padding: "6px 8px",
                  color: "#64748b",
                  fontSize: 8,
                  letterSpacing: "0.07em",
                  borderRadius: 7,
                  background:
                    "rgba(148,163,184,0.035)",
                  border:
                    "1px solid rgba(148,163,184,0.065)",
                }}
              >
                {entity.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* System health panel */}

        <div
          className="card"
          style={{
            minHeight: 430,
            padding: 22,
          }}
        >
          <PanelHeader
            eyebrow="INFRASTRUCTURE"
            title="System health"
            description="Real-time availability of the services supporting the MNEMOS runtime."
            icon={Activity}
            colour="#34d399"
          />

          <div
            style={{
              display: "grid",
              gap: 9,
              marginTop: 20,
            }}
          >
            <StatusRow
              icon={Server}
              label="Backend API"
              description="MNEMOS FastAPI service"
              available={Boolean(health)}
              status={
                health ? "Operational" : "Offline"
              }
            />

            <StatusRow
              icon={Brain}
              label="Ollama LLM"
              description={
                health?.model
                  ? `Model: ${health.model}`
                  : "Local reasoning service"
              }
              available={Boolean(
                health?.ollama_available,
              )}
              status={
                health?.ollama_available
                  ? "Online"
                  : "Fallback active"
              }
              warning={
                !health?.ollama_available
              }
            />

            <StatusRow
              icon={Database}
              label="Demo Environment"
              description="Built-in deterministic world"
              available={Boolean(
                health?.demo_available,
              )}
              status={
                health?.demo_available
                  ? "Available"
                  : "Unavailable"
              }
            />

            <StatusRow
              icon={Terminal}
              label="TextWorld"
              description="Optional simulation runtime"
              available={Boolean(
                health?.textworld_available,
              )}
              status={
                health?.textworld_available
                  ? "Available"
                  : "Not connected"
              }
              neutral={
                !health?.textworld_available
              }
            />
          </div>

          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 13,
              background:
                "rgba(99,102,241,0.045)",
              border:
                "1px solid rgba(99,102,241,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <Wifi
                size={15}
                style={{
                  flexShrink: 0,
                  marginTop: 1,
                  color: health
                    ? "#818cf8"
                    : "#f87171",
                }}
              />

              <div style={{ minWidth: 0 }}>
                <p
                  className="mono"
                  style={{
                    margin: 0,
                    color: "#818cf8",
                    fontSize: 8,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                  }}
                >
                  RUNTIME ENDPOINT
                </p>

                <p
                  className="mono"
                  style={{
                    margin: "7px 0 0",
                    overflow: "hidden",
                    color: "#64748b",
                    fontSize: 9,
                    lineHeight: 1.5,
                    textOverflow: "ellipsis",
                  }}
                >
                  {health?.ollama_url ??
                    "Backend connection unavailable"}
                </p>

                {!health?.ollama_available &&
                  health && (
                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#d97706",
                        fontSize: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      Ollama is offline. MNEMOS
                      will use deterministic
                      fallback reasoning.
                    </p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DEMO RUN PANEL
          ===================================================== */}

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          marginBottom: 18,
          padding: 1,
          borderRadius: 22,
          background:
            "linear-gradient(120deg, rgba(99,102,241,0.4), rgba(139,92,246,0.14), rgba(34,211,238,0.08))",
          boxShadow:
            "0 24px 70px rgba(0,0,0,0.26)",
        }}
      >
        <div
          style={{
            position: "relative",
            padding:
              "clamp(22px, 3.5vw, 32px)",
            borderRadius: 21,
            background:
              "linear-gradient(120deg, rgba(12,17,33,0.97), rgba(6,10,21,0.98))",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-120px",
              right: "-80px",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background:
                "rgba(124,58,237,0.14)",
              filter: "blur(80px)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              alignItems: "center",
              gap: 25,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    width: 46,
                    height: 46,
                    flexShrink: 0,
                    placeItems: "center",
                    borderRadius: 13,
                    color: "#c4b5fd",
                    background:
                      "rgba(124,58,237,0.11)",
                    border:
                      "1px solid rgba(139,92,246,0.22)",
                  }}
                >
                  <Target size={19} />
                </div>

                <div>
                  <p
                    className="label-overline"
                    style={{
                      marginBottom: 5,
                      color: "#a78bfa",
                    }}
                  >
                    AUTONOMOUS AGENT DEMO
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      color: "#ffffff",
                      fontSize:
                        "clamp(1.25rem, 2.5vw, 1.7rem)",
                      fontWeight: 800,
                      letterSpacing: "-0.035em",
                    }}
                  >
                    Find the target object
                  </h2>
                </div>
              </div>

              <p
                style={{
                  maxWidth: 590,
                  margin: "17px 0 0",
                  color: "#64748b",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                Launch an autonomous run inside
                the demo environment. MNEMOS will
                retrieve bounded context, inspect
                beliefs, detect contradictions and
                preserve every correction.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 18,
                }}
              >
                <RunAttribute
                  label="Environment"
                  value="Demo"
                />

                <RunAttribute
                  label="Maximum Turns"
                  value="20"
                />

                <RunAttribute
                  label="Reasoning"
                  value={
                    health?.ollama_available
                      ? "Ollama"
                      : "Fallback"
                  }
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 11,
              }}
            >
              {runId && (
                <div
                  style={{
                    padding: "12px 13px",
                    borderRadius: 12,
                    background:
                      "rgba(99,102,241,0.065)",
                    border:
                      "1px solid rgba(99,102,241,0.15)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p
                        className="mono"
                        style={{
                          margin: 0,
                          color: "#6366f1",
                          fontSize: 8,
                          letterSpacing: "0.1em",
                        }}
                      >
                        ACTIVE RUN
                      </p>

                      <p
                        className="mono"
                        style={{
                          margin: "5px 0 0",
                          overflow: "hidden",
                          color: "#94a3b8",
                          fontSize: 9,
                          textOverflow:
                            "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {runId.toUpperCase()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/dashboard/run",
                        )
                      }
                      className="btn-ghost"
                      style={{
                        minHeight: 34,
                        padding: "7px 9px",
                        fontSize: 10,
                      }}
                    >
                      Resume
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  void handleStart()
                }
                disabled={starting || !health}
                className="btn-primary"
                style={{
                  width: "100%",
                  minHeight: 52,
                  justifyContent: "center",
                }}
              >
                {starting ? (
                  <>
                    <span
                      className="animate-spin"
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        border:
                          "2px solid rgba(255,255,255,0.35)",
                        borderTopColor: "#ffffff",
                      }}
                    />

                    Initialising run…
                  </>
                ) : (
                  <>
                    <Play size={15} />
                    Launch Demo Run
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard/run")
                }
                className="btn-outline"
                style={{
                  width: "100%",
                  minHeight: 48,
                  justifyContent: "center",
                }}
              >
                <Layers size={14} />
                Configure Agent
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PLATFORM CAPABILITIES
          ===================================================== */}

      <section>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "end",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 13,
          }}
        >
          <div>
            <p
              className="label-overline"
              style={{
                marginBottom: 7,
                color: "#64748b",
              }}
            >
              CORE CAPABILITIES
            </p>

            <h2
              style={{
                margin: 0,
                color: "#e2e8f0",
                fontSize: 17,
                fontWeight: 750,
                letterSpacing: "-0.025em",
              }}
            >
              Built for transparent agent memory
            </h2>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 13,
          }}
        >
          <CapabilityCard
            icon={Layers}
            colour="#22d3ee"
            eyebrow="BOUNDED CONTEXT"
            title="Relevant facts only"
            description="The agent receives a precise context window instead of its complete interaction history."
            action="Inspect context"
            onClick={() =>
              navigate(
                "/dashboard/context",
              )
            }
          />

          <CapabilityCard
            icon={GitBranch}
            colour="#f59e0b"
            eyebrow="SELF-CORRECTION"
            title="Contradictions resolved"
            description="Outdated beliefs are superseded while every correction remains visible and auditable."
            action="View corrections"
            onClick={() =>
              navigate(
                "/dashboard/corrections",
              )
            }
          />

          <CapabilityCard
            icon={Globe}
            colour="#8b5cf6"
            eyebrow="WORLD MODEL"
            title="Structured agent memory"
            description="Entities and relationships are stored as transparent, queryable and versioned beliefs."
            action="Explore graph"
            onClick={() =>
              navigate(
                "/dashboard/world",
              )
            }
          />

          <CapabilityCard
            icon={Sparkles}
            colour="#34d399"
            eyebrow="AUDITABILITY"
            title="Reasoning you can inspect"
            description="Each run exposes the selected context, observed evidence and resulting belief changes."
            action="View architecture"
            onClick={() =>
              navigate(
                "/dashboard/architecture",
              )
            }
          />
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   LOCAL COMPONENTS
   ========================================================= */

interface OverviewMetricProps {
  label: string;
  value: string;
  description: string;
  trend: string;
  icon: LucideIcon;
  colour: string;
}

function OverviewMetric({
  label,
  value,
  description,
  trend,
  icon: Icon,
  colour,
}: OverviewMetricProps) {
  return (
    <article
      className="card card-hover"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 150,
        padding: 18,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -35,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: `${colour}13`,
          filter: "blur(34px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "grid",
            width: 38,
            height: 38,
            placeItems: "center",
            borderRadius: 11,
            color: colour,
            background: `${colour}12`,
            border: `1px solid ${colour}22`,
          }}
        >
          <Icon size={16} />
        </div>

        <span
          className="mono"
          style={{
            padding: "5px 7px",
            borderRadius: 999,
            color: colour,
            fontSize: 7,
            fontWeight: 800,
            letterSpacing: "0.1em",
            background: `${colour}0d`,
            border: `1px solid ${colour}1c`,
          }}
        >
          {trend}
        </span>
      </div>

      <p
        style={{
          margin: "17px 0 0",
          color: "#ffffff",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.035em",
          textTransform: "capitalize",
        }}
      >
        {value}
      </p>

      <p
        style={{
          margin: "5px 0 0",
          color: "#94a3b8",
          fontSize: 11,
          fontWeight: 650,
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: "5px 0 0",
          overflow: "hidden",
          color: "#475569",
          fontSize: 9,
          lineHeight: 1.45,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {description}
      </p>
    </article>
  );
}

interface PanelHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  colour: string;
  action?: ReactNode;
}

function PanelHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  colour,
  action,
}: PanelHeaderProps) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 11,
        }}
      >
        <div
          style={{
            display: "grid",
            width: 38,
            height: 38,
            flexShrink: 0,
            placeItems: "center",
            borderRadius: 11,
            color: colour,
            background: `${colour}11`,
            border: `1px solid ${colour}20`,
          }}
        >
          <Icon size={16} />
        </div>

        <div>
          <p
            className="label-overline"
            style={{
              marginBottom: 6,
              color: colour,
            }}
          >
            {eyebrow}
          </p>

          <h2
            style={{
              margin: 0,
              color: "#e2e8f0",
              fontSize: 16,
              fontWeight: 750,
              letterSpacing: "-0.025em",
            }}
          >
            {title}
          </h2>

          <p
            style={{
              maxWidth: 420,
              margin: "6px 0 0",
              color: "#475569",
              fontSize: 10,
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        </div>
      </div>

      {action}
    </div>
  );
}

interface StatusRowProps {
  label: string;
  description: string;
  status: string;
  available: boolean;
  icon: LucideIcon;
  warning?: boolean;
  neutral?: boolean;
}

function StatusRow({
  label,
  description,
  status,
  available,
  icon: Icon,
  warning = false,
  neutral = false,
}: StatusRowProps) {
  const colour = available
    ? "#34d399"
    : warning
      ? "#f59e0b"
      : neutral
        ? "#64748b"
        : "#f87171";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 13px",
        borderRadius: 12,
        background:
          "rgba(148,163,184,0.025)",
        border:
          "1px solid rgba(148,163,184,0.06)",
      }}
    >
      <div
        style={{
          display: "grid",
          width: 33,
          height: 33,
          flexShrink: 0,
          placeItems: "center",
          borderRadius: 9,
          color: colour,
          background: `${colour}0d`,
          border: `1px solid ${colour}18`,
        }}
      >
        <Icon size={14} />
      </div>

      <div
        style={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#cbd5e1",
            fontSize: 11,
            fontWeight: 650,
          }}
        >
          {label}
        </p>

        <p
          style={{
            margin: "4px 0 0",
            overflow: "hidden",
            color: "#475569",
            fontSize: 9,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {description}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexShrink: 0,
          alignItems: "center",
          gap: 6,
        }}
      >
        {available ? (
          <CheckCircle2
            size={13}
            style={{ color: colour }}
          />
        ) : (
          <CircleAlert
            size={13}
            style={{ color: colour }}
          />
        )}

        <span
          className="mono"
          style={{
            color: colour,
            fontSize: 7,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

interface RunAttributeProps {
  label: string;
  value: string;
}

function RunAttribute({
  label,
  value,
}: RunAttributeProps) {
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: 9,
        background:
          "rgba(148,163,184,0.03)",
        border:
          "1px solid rgba(148,163,184,0.07)",
      }}
    >
      <p
        className="mono"
        style={{
          margin: 0,
          color: "#334155",
          fontSize: 7,
          letterSpacing: "0.1em",
        }}
      >
        {label.toUpperCase()}
      </p>

      <p
        style={{
          margin: "4px 0 0",
          color: "#94a3b8",
          fontSize: 10,
          fontWeight: 650,
        }}
      >
        {value}
      </p>
    </div>
  );
}

interface CapabilityCardProps {
  icon: LucideIcon;
  colour: string;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}

function CapabilityCard({
  icon: Icon,
  colour,
  eyebrow,
  title,
  description,
  action,
  onClick,
}: CapabilityCardProps) {
  return (
    <article
      className="card card-hover"
      style={{
        display: "flex",
        minHeight: 225,
        padding: 19,
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "grid",
          width: 38,
          height: 38,
          placeItems: "center",
          borderRadius: 11,
          color: colour,
          background: `${colour}11`,
          border: `1px solid ${colour}20`,
        }}
      >
        <Icon size={16} />
      </div>

      <p
        className="label-overline"
        style={{
          marginTop: 17,
          color: colour,
        }}
      >
        {eyebrow}
      </p>

      <h3
        style={{
          margin: "8px 0 0",
          color: "#e2e8f0",
          fontSize: 14,
          fontWeight: 750,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: "9px 0 18px",
          color: "#475569",
          fontSize: 10,
          lineHeight: 1.65,
        }}
      >
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="btn-ghost"
        style={{
          alignSelf: "flex-start",
          minHeight: 32,
          marginTop: "auto",
          padding: "6px 8px",
          color: colour,
          fontSize: 10,
        }}
      >
        {action}
        <ArrowRight size={11} />
      </button>
    </article>
  );
}

function shortenRunId(runId: string) {
  if (runId.length <= 16) {
    return runId.toUpperCase();
  }

  return `${runId.slice(0, 7).toUpperCase()}…${runId
    .slice(-5)
    .toUpperCase()}`;
}