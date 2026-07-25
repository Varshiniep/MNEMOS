import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  Activity,
  AlertCircle,
  PauseCircle,
  Brain,
  Clock3,
  Target,
  GitBranch,
  Cpu,
  MapPin,
  Terminal,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Zap,
} from "lucide-react";

import {
  fetchRunState,
  fetchTurns,
  runToCompletion,
  startRun,
  stepRun,
  stopRun,
} from "../../services/api";

import type {
  RunState,
  TurnRecord,
} from "../../types/api";

import { RunControls } from "../../components/ui/RunControls";
import { TurnTimeline } from "../../components/ui/TurnTimeline";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { LoadingState } from "../../components/ui/LoadingState";
import { useRunId } from "../../hooks/useRunId";

const PANEL: CSSProperties = {
  border: "1px solid rgba(148,163,184,0.08)",
  borderRadius: 18,
  background:
    "linear-gradient(180deg, rgba(12,17,31,0.94), rgba(6,10,20,0.96))",
  boxShadow: "0 22px 70px rgba(0,0,0,0.25)",
};

export function AgentRunPage() {
  const [runId, setRunId] = useRunId();

  const [runState, setRunState] =
    useState<RunState | null>(null);

  const [turns, setTurns] =
    useState<TurnRecord[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const pollingRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null,
    );

  const [objective, setObjective] = useState(
    "Find the target object in the storage room",
  );

  const [envType, setEnvType] =
    useState<"demo" | "textworld">("demo");

  const [maxTurns, setMaxTurns] =
    useState(20);

  const [useOllama, setUseOllama] =
    useState(false);

  const refresh = useCallback(
    async (id: string) => {
      const [state, turnRecords] =
        await Promise.all([
          fetchRunState(id),
          fetchTurns(id),
        ]);

      setRunState(state);
      setTurns(turnRecords);

      return state;
    },
    [],
  );

  const handleRefresh = async () => {
    if (!runId || refreshing) {
      return;
    }

    try {
      setRefreshing(true);
      setError("");

      await refresh(runId);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to refresh run",
      );
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (
      !runId ||
      runState?.status !== "running"
    ) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      return;
    }

    pollingRef.current = setInterval(() => {
      refresh(runId).catch(() => null);
    }, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [
    runId,
    runState?.status,
    refresh,
  ]);

  useEffect(() => {
    if (runId) {
      refresh(runId).catch(() => null);
    }
  }, [runId, refresh]);

  const handleStart = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await startRun({
        objective,
        environment_type: envType,
        max_turns: maxTurns,
        use_ollama: useOllama,
      });

      setRunId(response.run_id);

      await refresh(response.run_id);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to start the run",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStep = async () => {
    if (!runId || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await stepRun(runId);
      await refresh(runId);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Agent step failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!runId || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await runToCompletion(runId);
      await refresh(runId);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Run failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!runId || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await stopRun(runId);
      await refresh(runId);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to stop the run",
      );
    } finally {
      setLoading(false);
    }
  };

  const lastTurn =
    turns.length > 0
      ? turns[turns.length - 1]
      : null;

  const totalCorrections = turns.reduce(
    (sum, turn) =>
      sum + turn.corrections.length,
    0,
  );

  const status =
    runState?.status ?? "idle";

  const configurationLocked =
    loading ||
    runState?.status === "running";

  return (
    <main
      style={{
        width: "100%",
        maxWidth: 1480,
        marginInline: "auto",
        padding:
          "28px clamp(18px, 3vw, 38px) 48px",
      }}
    >
      {/* ===================================================
          HEADER
          =================================================== */}

      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 18,
          marginBottom: 26,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 9,
            }}
          >
            <span
              className={
                status === "running"
                  ? "animate-blink"
                  : undefined
              }
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background:
                  status === "running"
                    ? "#34d399"
                    : status === "idle"
                      ? "#64748b"
                      : "#8b5cf6",
                boxShadow:
                  status === "running"
                    ? "0 0 14px rgba(52,211,153,0.9)"
                    : "none",
              }}
            />

            <p
              className="label-overline"
              style={{
                color:
                  status === "running"
                    ? "#34d399"
                    : "#8b5cf6",
              }}
            >
              AUTONOMOUS AGENT CONTROL
            </p>
          </div>

          <h1
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize:
                "clamp(2rem, 4vw, 3.3rem)",
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-0.052em",
            }}
          >
            Agent Run Console
          </h1>

          <p
            style={{
              maxWidth: 700,
              margin: "11px 0 0",
              color: "#64748b",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Configure an autonomous objective,
            inspect every observation and action,
            and monitor how MNEMOS updates its
            world model in real time.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {runState && (
            <StatusBadge
              status={runState.status}
            />
          )}

          <button
            type="button"
            onClick={() =>
              void handleRefresh()
            }
            disabled={!runId || refreshing}
            className="btn-outline"
            style={{
              minHeight: 40,
              padding: "9px 13px",
            }}
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : undefined
              }
            />

            Refresh
          </button>
        </div>
      </header>

      {/* ===================================================
          ERROR
          =================================================== */}

      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: 18,
            padding: "13px 15px",
            borderRadius: 13,
            color: "#f87171",
            background:
              "rgba(239,68,68,0.065)",
            border:
              "1px solid rgba(239,68,68,0.18)",
          }}
        >
          <AlertCircle
            size={16}
            style={{
              flexShrink: 0,
              marginTop: 1,
            }}
          />

          <p
            style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.55,
            }}
          >
            {error}
          </p>
        </div>
      )}

      {/* ===================================================
          RUN METRICS
          =================================================== */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <RunMetric
          label="Run Status"
          value={formatStatus(status)}
          description={
            runState
              ? "Current execution state"
              : "No active run"
          }
          icon={
            status === "running"
              ? Activity
              : PauseCircle
          }
          colour={
            status === "running"
              ? "#34d399"
              : "#8b5cf6"
          }
        />

        <RunMetric
          label="Current Turn"
          value={String(
            runState?.turn_count ?? 0,
          )}
          description={`Maximum ${maxTurns} turns`}
          icon={Clock3}
          colour="#22d3ee"
        />

        <RunMetric
          label="Total Reward"
          value={
            runState
              ? runState.total_reward.toFixed(
                  1,
                )
              : "0.0"
          }
          description="Accumulated agent reward"
          icon={Target}
          colour="#f59e0b"
        />

        <RunMetric
          label="Corrections"
          value={String(totalCorrections)}
          description="Belief changes detected"
          icon={GitBranch}
          colour="#a78bfa"
        />
      </section>

      {/* ===================================================
          CONFIGURATION
          =================================================== */}

      <section
        style={{
          ...PANEL,
          marginBottom: 18,
          padding: "22px",
        }}
      >
        <PanelHeader
          icon={Cpu}
          colour="#8b5cf6"
          eyebrow="RUN CONFIGURATION"
          title="Configure agent objective"
          description="Set the environment, reasoning engine and execution limit before starting the autonomous run."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(12, minmax(0, 1fr))",
            gap: 14,
            marginTop: 20,
          }}
        >
          <div
            style={{
              gridColumn: "1 / -1",
            }}
          >
            <FieldLabel
              htmlFor="agent-objective"
            >
              Objective
            </FieldLabel>

            <div
              style={{ position: "relative" }}
            >
              <Target
                size={15}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 15,
                  zIndex: 1,
                  color: "#64748b",
                  transform:
                    "translateY(-50%)",
                }}
              />

              <input
                id="agent-objective"
                value={objective}
                onChange={(event) =>
                  setObjective(
                    event.target.value,
                  )
                }
                disabled={
                  configurationLocked
                }
                className="input-dark"
                style={{
                  paddingLeft: 42,
                }}
              />
            </div>
          </div>

          <div
            style={{
              gridColumn:
                "span 6 / span 6",
              minWidth: 0,
            }}
          >
            <FieldLabel htmlFor="environment">
              Environment
            </FieldLabel>

            <select
              id="environment"
              value={envType}
              onChange={(event) =>
                setEnvType(
                  event.target.value as
                    | "demo"
                    | "textworld",
                )
              }
              disabled={configurationLocked}
              className="input-dark"
            >
              <option value="demo">
                Demo — built-in environment
              </option>

              <option value="textworld">
                TextWorld simulation
              </option>
            </select>
          </div>

          <div
            style={{
              gridColumn:
                "span 6 / span 6",
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                marginBottom: 9,
              }}
            >
              <FieldLabel
                htmlFor="max-turns"
                noMargin
              >
                Maximum turns
              </FieldLabel>

              <span
                className="mono"
                style={{
                  color: "#a78bfa",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {maxTurns}
              </span>
            </div>

            <div
              style={{
                minHeight: 52,
                display: "flex",
                alignItems: "center",
                padding: "0 15px",
                borderRadius: 13,
                background:
                  "rgba(3,7,15,0.84)",
                border:
                  "1px solid rgba(148,163,184,0.1)",
              }}
            >
              <input
                id="max-turns"
                type="range"
                min={1}
                max={100}
                value={maxTurns}
                onChange={(event) =>
                  setMaxTurns(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                disabled={configurationLocked}
                style={{
                  width: "100%",
                  accentColor: "#8b5cf6",
                  cursor: configurationLocked
                    ? "not-allowed"
                    : "pointer",
                }}
              />
            </div>
          </div>

          <div
            style={{
              gridColumn: "1 / -1",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setUseOllama(
                  (current) => !current,
                )
              }
              disabled={configurationLocked}
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                gap: 13,
                padding: "14px 15px",
                textAlign: "left",
                borderRadius: 13,
                color: "#cbd5e1",
                background: useOllama
                  ? "rgba(124,58,237,0.075)"
                  : "rgba(3,7,15,0.7)",
                border: useOllama
                  ? "1px solid rgba(139,92,246,0.24)"
                  : "1px solid rgba(148,163,184,0.08)",
                cursor: configurationLocked
                  ? "not-allowed"
                  : "pointer",
                opacity: configurationLocked
                  ? 0.7
                  : 1,
              }}
            >
              <span
                style={{
                  position: "relative",
                  width: 38,
                  height: 21,
                  flexShrink: 0,
                  borderRadius: 999,
                  background: useOllama
                    ? "#7c3aed"
                    : "#1e293b",
                  transition:
                    "background 180ms ease",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: useOllama
                      ? 20
                      : 3,
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    background: "#ffffff",
                    boxShadow:
                      "0 2px 8px rgba(0,0,0,0.35)",
                    transition:
                      "left 180ms ease",
                  }}
                />
              </span>

              <Brain
                size={17}
                style={{
                  color: useOllama
                    ? "#a78bfa"
                    : "#64748b",
                }}
              />

              <span style={{ flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Use Ollama reasoning
                </span>

                <span
                  style={{
                    display: "block",
                    marginTop: 4,
                    color: "#475569",
                    fontSize: 10,
                  }}
                >
                  Run qwen2.5:3b locally
                  instead of deterministic
                  fallback reasoning.
                </span>
              </span>

              <span
                className="mono"
                style={{
                  color: useOllama
                    ? "#a78bfa"
                    : "#475569",
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                }}
              >
                {useOllama
                  ? "ENABLED"
                  : "DISABLED"}
              </span>
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            paddingTop: 18,
            borderTop:
              "1px solid rgba(148,163,184,0.07)",
          }}
        >
          <RunControls
            status={status}
            onStart={handleStart}
            onStep={handleStep}
            onRun={handleRun}
            onStop={handleStop}
            loading={loading}
          />
        </div>
      </section>

      {/* ===================================================
          LIVE RUN IDENTITY
          =================================================== */}

      {runState && (
        <section
          style={{
            ...PANEL,
            marginBottom: 18,
            padding: "16px 18px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 12,
            }}
          >
            <RuntimeValue
              icon={<Activity size={14} />}
              label="Status"
              value={formatStatus(
                runState.status,
              )}
              colour={
                runState.status ===
                "running"
                  ? "#34d399"
                  : "#8b5cf6"
              }
            />

            <RuntimeValue
              icon={<Cpu size={14} />}
              label="Run ID"
              value={shortenRunId(
                runState.run_id,
              )}
              mono
              colour="#818cf8"
            />

            <RuntimeValue
              icon={<MapPin size={14} />}
              label="Current Room"
              value={
                runState.current_room ||
                "Unknown"
              }
              colour="#22d3ee"
            />

            <RuntimeValue
              icon={<Clock3 size={14} />}
              label="Turn"
              value={String(
                runState.turn_count,
              )}
              mono
              colour="#f59e0b"
            />

            <RuntimeValue
              icon={<Target size={14} />}
              label="Reward"
              value={runState.total_reward.toFixed(
                1,
              )}
              mono
              colour="#34d399"
            />
          </div>
        </section>
      )}

      {/* ===================================================
          LIVE EXECUTION GRID
          =================================================== */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1.8fr) minmax(300px, 0.9fr)",
          gap: 16,
        }}
        className="agent-run-grid"
      >
        {/* Observation console */}

        <article
          style={{
            ...PANEL,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 21px 16px",
              borderBottom:
                "1px solid rgba(148,163,184,0.07)",
            }}
          >
            <PanelHeader
              icon={Terminal}
              colour="#22d3ee"
              eyebrow="LIVE EXECUTION"
              title="Latest observation"
              description="The most recent environment output, selected action and belief corrections."
            />
          </div>

          <div style={{ padding: 20 }}>
            {loading && !lastTurn ? (
              <div
                style={{
                  minHeight: 260,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <LoadingState message="Waiting for the first agent turn…" />
              </div>
            ) : lastTurn ? (
              <div
                style={{
                  display: "grid",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    overflow: "hidden",
                    borderRadius: 14,
                    background:
                      "rgba(2,6,14,0.88)",
                    border:
                      "1px solid rgba(34,211,238,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      gap: 10,
                      padding:
                        "10px 13px",
                      background:
                        "rgba(34,211,238,0.025)",
                      borderBottom:
                        "1px solid rgba(148,163,184,0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Terminal
                        size={12}
                        style={{
                          color: "#22d3ee",
                        }}
                      />

                      <span
                        className="mono"
                        style={{
                          color: "#64748b",
                          fontSize: 8,
                          fontWeight: 800,
                          letterSpacing:
                            "0.1em",
                        }}
                      >
                        ENVIRONMENT OUTPUT
                      </span>
                    </div>

                    <span
                      className="mono"
                      style={{
                        color: "#334155",
                        fontSize: 8,
                      }}
                    >
                      TURN{" "}
                      {runState?.turn_count ??
                        turns.length}
                    </span>
                  </div>

                  <pre
                    style={{
                      minHeight: 170,
                      maxHeight: 300,
                      margin: 0,
                      padding: 17,
                      overflow: "auto",
                      color: "#94a3b8",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      fontSize: 11,
                      lineHeight: 1.75,
                      whiteSpace:
                        "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {lastTurn.observation}
                  </pre>
                </div>

                {lastTurn.action &&
                  lastTurn.action !==
                    "[reset]" && (
                    <ExecutionDetail
                      icon={Zap}
                      colour="#a78bfa"
                      label="SELECTED ACTION"
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 9,
                        }}
                      >
                        <span
                          className="mono"
                          style={{
                            padding:
                              "7px 11px",
                            borderRadius: 9,
                            color: "#c4b5fd",
                            fontSize: 11,
                            background:
                              "rgba(139,92,246,0.09)",
                            border:
                              "1px solid rgba(139,92,246,0.2)",
                          }}
                        >
                          {lastTurn.action}
                        </span>

                        {lastTurn.reward >
                          0 && (
                          <span className="badge badge-green">
                            +
                            {
                              lastTurn.reward
                            }{" "}
                            reward
                          </span>
                        )}
                      </div>
                    </ExecutionDetail>
                  )}

                {lastTurn.corrections
                  .length > 0 && (
                  <ExecutionDetail
                    icon={GitBranch}
                    colour="#f59e0b"
                    label={`${lastTurn.corrections.length} BELIEF CORRECTION${
                      lastTurn
                        .corrections
                        .length === 1
                        ? ""
                        : "S"
                    }`}
                  >
                    <div
                      style={{
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      {lastTurn.corrections.map(
                        (
                          correction,
                          index,
                        ) => (
                          <div
                            key={`${correction.entity}-${correction.attribute}-${index}`}
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "minmax(130px, 0.8fr) minmax(0, 1.6fr)",
                              alignItems:
                                "center",
                              gap: 12,
                              padding:
                                "10px 11px",
                              borderRadius:
                                10,
                              background:
                                "rgba(245,158,11,0.045)",
                              border:
                                "1px solid rgba(245,158,11,0.12)",
                            }}
                          >
                            <div>
                              <p
                                className="mono"
                                style={{
                                  margin: 0,
                                  color:
                                    "#f59e0b",
                                  fontSize:
                                    9,
                                  fontWeight:
                                    800,
                                }}
                              >
                                {
                                  correction.entity
                                }
                                .
                                {
                                  correction.attribute
                                }
                              </p>
                            </div>

                            <div
                              style={{
                                display:
                                  "flex",
                                flexWrap:
                                  "wrap",
                                alignItems:
                                  "center",
                                gap: 8,
                              }}
                            >
                              <CorrectionValue
                                value={String(
                                  correction.old_value,
                                )}
                                obsolete
                              />

                              <ChevronRight
                                size={13}
                                style={{
                                  color:
                                    "#64748b",
                                }}
                              />

                              <CorrectionValue
                                value={String(
                                  correction.new_value,
                                )}
                              />
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </ExecutionDetail>
                )}

                {lastTurn.corrections
                  .length === 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 13px",
                      borderRadius: 11,
                      color: "#34d399",
                      background:
                        "rgba(16,185,129,0.045)",
                      border:
                        "1px solid rgba(16,185,129,0.12)",
                    }}
                  >
                    <CheckCircle2
                      size={15}
                    />

                    <p
                      style={{
                        margin: 0,
                        fontSize: 10,
                      }}
                    >
                      No contradiction was
                      detected during this
                      turn.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <EmptyExecutionState />
            )}
          </div>
        </article>

        {/* Timeline */}

        <aside
          style={{
            ...PANEL,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 20px 16px",
              borderBottom:
                "1px solid rgba(148,163,184,0.07)",
            }}
          >
            <PanelHeader
              icon={Clock3}
              colour="#8b5cf6"
              eyebrow="EXECUTION HISTORY"
              title="Turn timeline"
              description={`${turns.length} recorded turn${
                turns.length === 1
                  ? ""
                  : "s"
              } in the current run.`}
            />
          </div>

          <div
            style={{
              maxHeight: 650,
              overflowY: "auto",
              padding: 17,
            }}
          >
            <TurnTimeline turns={turns} />
          </div>
        </aside>
      </section>
    </main>
  );
}

/* =========================================================
   LOCAL COMPONENTS
   ========================================================= */

interface RunMetricProps {
  label: string;
  value: string;
  description: string;
  icon: typeof Activity;
  colour: string;
}

function RunMetric({
  label,
  value,
  description,
  icon: Icon,
  colour,
}: RunMetricProps) {
  return (
    <article
      className="card card-hover"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 132,
        padding: 17,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -35,
          right: -30,
          width: 105,
          height: 105,
          borderRadius: "50%",
          background: `${colour}12`,
          filter: "blur(30px)",
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
            width: 35,
            height: 35,
            placeItems: "center",
            borderRadius: 10,
            color: colour,
            background: `${colour}11`,
            border: `1px solid ${colour}20`,
          }}
        >
          <Icon size={15} />
        </div>
      </div>

      <p
        style={{
          margin: "15px 0 0",
          color: "#ffffff",
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          textTransform: "capitalize",
        }}
      >
        {value}
      </p>

      <p
        style={{
          margin: "5px 0 0",
          color: "#94a3b8",
          fontSize: 10,
          fontWeight: 650,
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: "4px 0 0",
          color: "#475569",
          fontSize: 9,
        }}
      >
        {description}
      </p>
    </article>
  );
}

interface PanelHeaderProps {
  icon: typeof Activity;
  colour: string;
  eyebrow: string;
  title: string;
  description: string;
}

function PanelHeader({
  icon: Icon,
  colour,
  eyebrow,
  title,
  description,
}: PanelHeaderProps) {
  return (
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
            marginBottom: 5,
            color: colour,
          }}
        >
          {eyebrow}
        </p>

        <h2
          style={{
            margin: 0,
            color: "#e2e8f0",
            fontSize: 15,
            fontWeight: 750,
            letterSpacing: "-0.022em",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            maxWidth: 560,
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
  );
}

interface FieldLabelProps {
  htmlFor: string;
  children: ReactNode;
  noMargin?: boolean;
}

function FieldLabel({
  htmlFor,
  children,
  noMargin = false,
}: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="mono"
      style={{
        display: "block",
        marginBottom: noMargin ? 0 : 9,
        color: "#64748b",
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.11em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </label>
  );
}

interface RuntimeValueProps {
  icon: ReactNode;
  label: string;
  value: string;
  colour: string;
  mono?: boolean;
}

function RuntimeValue({
  icon,
  label,
  value,
  colour,
  mono = false,
}: RuntimeValueProps) {
  return (
    <div
      style={{
        display: "flex",
        minWidth: 0,
        alignItems: "center",
        gap: 10,
        padding: "10px 11px",
        borderRadius: 11,
        background:
          "rgba(148,163,184,0.025)",
        border:
          "1px solid rgba(148,163,184,0.055)",
      }}
    >
      <span
        style={{
          display: "grid",
          width: 29,
          height: 29,
          flexShrink: 0,
          placeItems: "center",
          borderRadius: 8,
          color: colour,
          background: `${colour}0d`,
        }}
      >
        {icon}
      </span>

      <div style={{ minWidth: 0 }}>
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
          className={mono ? "mono" : undefined}
          title={value}
          style={{
            margin: "4px 0 0",
            overflow: "hidden",
            color: "#94a3b8",
            fontSize: 10,
            fontWeight: 650,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

interface ExecutionDetailProps {
  icon: typeof Activity;
  colour: string;
  label: string;
  children: ReactNode;
}

function ExecutionDetail({
  icon: Icon,
  colour,
  label,
  children,
}: ExecutionDetailProps) {
  return (
    <div
      style={{
        padding: "13px 14px",
        borderRadius: 13,
        background: `${colour}08`,
        border: `1px solid ${colour}18`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 10,
        }}
      >
        <Icon
          size={13}
          style={{ color: colour }}
        />

        <p
          className="mono"
          style={{
            margin: 0,
            color: colour,
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </p>
      </div>

      {children}
    </div>
  );
}

function CorrectionValue({
  value,
  obsolete = false,
}: {
  value: string;
  obsolete?: boolean;
}) {
  return (
    <span
      className="mono"
      style={{
        padding: "5px 8px",
        borderRadius: 7,
        color: obsolete
          ? "#f87171"
          : "#34d399",
        fontSize: 9,
        textDecoration: obsolete
          ? "line-through"
          : "none",
        background: obsolete
          ? "rgba(239,68,68,0.07)"
          : "rgba(16,185,129,0.07)",
        border: obsolete
          ? "1px solid rgba(239,68,68,0.14)"
          : "1px solid rgba(16,185,129,0.14)",
      }}
    >
      {value}
    </span>
  );
}

function EmptyExecutionState() {
  return (
    <div
      style={{
        minHeight: 300,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <div>
        <div
          style={{
            position: "relative",
            display: "grid",
            width: 58,
            height: 58,
            marginInline: "auto",
            placeItems: "center",
            borderRadius: 17,
            color: "#8b5cf6",
            background:
              "rgba(124,58,237,0.08)",
            border:
              "1px solid rgba(139,92,246,0.18)",
          }}
        >
          <Sparkles size={22} />
        </div>

        <h3
          style={{
            margin: "17px 0 0",
            color: "#cbd5e1",
            fontSize: 14,
            fontWeight: 750,
          }}
        >
          No execution data yet
        </h3>

        <p
          style={{
            maxWidth: 330,
            margin: "8px auto 0",
            color: "#475569",
            fontSize: 11,
            lineHeight: 1.65,
          }}
        >
          Configure the objective and launch
          the agent to inspect live
          observations, actions and belief
          corrections.
        </p>
      </div>
    </div>
  );
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function shortenRunId(runId: string) {
  if (runId.length <= 18) {
    return runId.toUpperCase();
  }

  return `${runId
    .slice(0, 8)
    .toUpperCase()}…${runId
    .slice(-6)
    .toUpperCase()}`;
}