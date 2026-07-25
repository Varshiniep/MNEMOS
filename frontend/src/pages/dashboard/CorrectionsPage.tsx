import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Activity,
  Archive,
  ArrowRight,
  CheckCircle2,
  Database,
  GitBranch,
  RefreshCw,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

import {
  fetchCorrections,
  runCorrectionDemo,
} from "../../services/api";

import type {
  CorrectionDemoResponse,
  CorrectionsResponse,
} from "../../types/api";

import { CorrectionCard } from "../../components/ui/CorrectionCard";
import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { useRunId } from "../../hooks/useRunId";

function formatValue(value: unknown) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

function shortenId(id: string) {
  if (id.length <= 18) {
    return id.toUpperCase();
  }

  return `${id.slice(0, 8).toUpperCase()}…${id
    .slice(-6)
    .toUpperCase()}`;
}

export function CorrectionsPage() {
  const [runId] = useRunId();

  const [data, setData] =
    useState<CorrectionsResponse | null>(null);

  const [demo, setDemo] =
    useState<CorrectionDemoResponse | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [demoLoading, setDemoLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const load = useCallback(async () => {
    if (!runId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await fetchCorrections(runId);

      setData(response);
      setLastUpdated(new Date());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load corrections",
      );
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDemo = async () => {
    if (demoLoading) {
      return;
    }

    try {
      setDemoLoading(true);
      setError("");

      const response =
        await runCorrectionDemo();

      setDemo(response);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Correction demo failed",
      );
    } finally {
      setDemoLoading(false);
    }
  };

  const corrections = useMemo(() => {
    return data
      ? [...data.corrections].reverse()
      : [];
  }, [data]);

  return (
    <main
      style={{
        width: "100%",
        maxWidth: 1440,
        marginInline: "auto",
        padding:
          "28px clamp(18px, 3vw, 38px) 48px",
      }}
    >
      {/* Header */}

      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 20,
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
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#f59e0b",
                boxShadow:
                  "0 0 14px rgba(245,158,11,0.8)",
              }}
            />

            <p
              className="label-overline"
              style={{
                color: "#f59e0b",
              }}
            >
              AUDITABLE MEMORY REVISION
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
            Belief Corrections
          </h1>

          <p
            style={{
              maxWidth: 720,
              margin: "11px 0 0",
              color: "#64748b",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Inspect how MNEMOS detects
            contradictions, supersedes outdated
            beliefs and preserves every revision
            as a transparent audit trail.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
          }}
        >
          {lastUpdated && (
            <span
              className="mono"
              style={{
                color: "#475569",
                fontSize: 8,
                letterSpacing: "0.08em",
              }}
            >
              UPDATED{" "}
              {lastUpdated.toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            </span>
          )}

          <button
            type="button"
            onClick={() =>
              void handleDemo()
            }
            disabled={demoLoading}
            className="btn-primary"
            style={{
              minHeight: 42,
              padding: "10px 15px",
            }}
          >
            <Zap size={14} />

            {demoLoading
              ? "Running demo…"
              : "Run Correction Demo"}
          </button>

          {runId && (
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="btn-outline"
              style={{
                minHeight: 42,
                padding: "10px 13px",
              }}
            >
              <RefreshCw
                size={14}
                className={
                  loading
                    ? "animate-spin"
                    : undefined
                }
              />

              Refresh
            </button>
          )}
        </div>
      </header>

      {/* Error */}

      {error && (
        <div style={{ marginBottom: 18 }}>
          <ErrorState
            message={error}
            retry={runId ? load : undefined}
          />
        </div>
      )}

      {/* Metrics */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <CorrectionMetric
          label="Run Corrections"
          value={String(data?.count ?? 0)}
          description="Corrections in current run"
          icon={GitBranch}
          colour="#f59e0b"
        />

        <CorrectionMetric
          label="Active Run"
          value={runId ? "Connected" : "None"}
          description={
            runId
              ? shortenId(runId)
              : "Start an agent run"
          }
          icon={Activity}
          colour={
            runId ? "#34d399" : "#64748b"
          }
        />

        <CorrectionMetric
          label="Audit Mode"
          value="Versioned"
          description="Old beliefs remain preserved"
          icon={Archive}
          colour="#8b5cf6"
        />

        <CorrectionMetric
          label="Integrity"
          value="Traceable"
          description="Corrections retain source IDs"
          icon={ShieldCheck}
          colour="#22d3ee"
        />
      </section>

      {/* Explanation */}

      <section
        className="card"
        style={{
          position: "relative",
          overflow: "hidden",
          marginBottom: 18,
          padding: 22,
          borderColor:
            "rgba(245,158,11,0.14)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -80,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background:
              "rgba(245,158,11,0.07)",
            filter: "blur(65px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 16,
          }}
        >
          <ProcessStep
            number="01"
            icon={Database}
            colour="#f87171"
            title="Contradiction detected"
            description="A new observation conflicts with an active belief already stored in the world model."
          />

          <ProcessStep
            number="02"
            icon={Archive}
            colour="#f59e0b"
            title="Old belief superseded"
            description="The previous belief is marked inactive but remains preserved for audit and history."
          />

          <ProcessStep
            number="03"
            icon={CheckCircle2}
            colour="#34d399"
            title="New belief activated"
            description="A corrected belief is created and linked to the superseded belief through immutable IDs."
          />
        </div>
      </section>

      {/* Demo */}

      {demo && (
        <section style={{ marginBottom: 20 }}>
          <CorrectionDemoPanel demo={demo} />
        </section>
      )}

      {/* Run corrections */}

      {runId && (
        <section
          className="card"
          style={{
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "20px 21px 17px",
              borderBottom:
                "1px solid rgba(148,163,184,0.07)",
            }}
          >
            <SectionHeader
              icon={GitBranch}
              colour="#f59e0b"
              eyebrow="CURRENT RUN"
              title="Correction audit history"
              description="A chronological record of contradictions and belief revisions from the active agent run."
            />

            <span
              className="mono"
              style={{
                padding: "6px 9px",
                borderRadius: 999,
                color: "#f59e0b",
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.1em",
                background:
                  "rgba(245,158,11,0.07)",
                border:
                  "1px solid rgba(245,158,11,0.16)",
              }}
            >
              {data?.count ?? 0} CORRECTIONS
            </span>
          </div>

          <div style={{ padding: 20 }}>
            {loading ? (
              <div
                style={{
                  minHeight: 220,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <LoadingState message="Loading correction history…" />
              </div>
            ) : corrections.length === 0 ? (
              <EmptyState
                title="No corrections yet"
                message="Contradicting observations will appear here when the agent revises an existing belief."
                icon={
                  <GitBranch size={22} />
                }
              />
            ) : (
              <div
                style={{
                  position: "relative",
                  display: "grid",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    bottom: 10,
                    left: 10,
                    width: 1,
                    background:
                      "linear-gradient(180deg, rgba(245,158,11,0.45), rgba(139,92,246,0.08))",
                  }}
                />

                {corrections.map(
                  (correction, index) => (
                    <div
                      key={correction.id}
                      style={{
                        position: "relative",
                        paddingLeft: 32,
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: 20,
                          left: 5,
                          zIndex: 1,
                          width: 11,
                          height: 11,
                          borderRadius: "50%",
                          background:
                            index === 0
                              ? "#f59e0b"
                              : "#7c3aed",
                          border:
                            "3px solid #080b16",
                          boxShadow:
                            index === 0
                              ? "0 0 12px rgba(245,158,11,0.6)"
                              : "none",
                        }}
                      />

                      <CorrectionCard
                        correction={correction}
                      />
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {!runId && !demo && (
        <section className="card">
          <div
            style={{
              padding: 36,
            }}
          >
            <EmptyState
              title="No active run"
              message="Run the deterministic correction demo above, or start an agent run to view live correction history."
              icon={<GitBranch size={22} />}
            />
          </div>
        </section>
      )}
    </main>
  );
}

function CorrectionDemoPanel({
  demo,
}: {
  demo: CorrectionDemoResponse;
}) {
  const superseded =
    demo.superseded_belief;

  const active = demo.new_belief;

  const summary =
    demo.world_state_summary;

  return (
    <article
      className="card"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: 22,
        borderColor:
          "rgba(139,92,246,0.22)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -70,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "rgba(124,58,237,0.09)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <SectionHeader
            icon={Zap}
            colour="#a78bfa"
            eyebrow="DETERMINISTIC SCENARIO"
            title="Correction engine demonstration"
            description={demo.description}
          />

          <span
            className="mono"
            style={{
              padding: "6px 9px",
              borderRadius: 999,
              color: "#f59e0b",
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.1em",
              background:
                "rgba(245,158,11,0.07)",
              border:
                "1px solid rgba(245,158,11,0.16)",
            }}
          >
            DEMO COMPLETE
          </span>
        </div>

        {/* Comparison */}

        <div
          className="correction-comparison-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) auto minmax(0, 1fr)",
            alignItems: "stretch",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <BeliefPanel
            title="Old belief"
            subtitle="Superseded"
            colour="#f87171"
            icon={<Archive size={15} />}
            rows={[
              {
                label: "Belief ID",
                value: shortenId(
                  superseded.id,
                ),
              },
              {
                label: "Value",
                value: formatValue(
                  superseded.value,
                ),
              },
              {
                label: "Confidence",
                value: `${Math.round(
                  superseded.confidence *
                    100,
                )}%`,
              },
              {
                label: "Active",
                value: "False",
              },
              {
                label: "Superseded by",
                value:
                  superseded.superseded_by
                    ? shortenId(
                        superseded.superseded_by,
                      )
                    : "—",
              },
            ]}
          />

          <div
            className="correction-arrow"
            style={{
              display: "grid",
              placeItems: "center",
              color: "#64748b",
            }}
          >
            <div
              style={{
                display: "grid",
                width: 42,
                height: 42,
                placeItems: "center",
                borderRadius: "50%",
                background:
                  "rgba(148,163,184,0.045)",
                border:
                  "1px solid rgba(148,163,184,0.08)",
              }}
            >
              <ArrowRight size={17} />
            </div>
          </div>

          <BeliefPanel
            title="New belief"
            subtitle="Active"
            colour="#34d399"
            icon={
              <CheckCircle2 size={15} />
            }
            rows={[
              {
                label: "Belief ID",
                value: shortenId(active.id),
              },
              {
                label: "Value",
                value: formatValue(
                  active.value,
                ),
              },
              {
                label: "Confidence",
                value: `${Math.round(
                  active.confidence * 100,
                )}%`,
              },
              {
                label: "Active",
                value: "True",
              },
              {
                label: "Source",
                value: active.source,
              },
            ]}
          />
        </div>

        {/* Event */}

        <div
          style={{
            marginBottom: 16,
            padding: 16,
            borderRadius: 14,
            background:
              "rgba(245,158,11,0.045)",
            border:
              "1px solid rgba(245,158,11,0.14)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 13,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <GitBranch
                size={14}
                style={{
                  color: "#f59e0b",
                }}
              />

              <p
                className="mono"
                style={{
                  margin: 0,
                  color: "#f59e0b",
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: "0.11em",
                }}
              >
                CORRECTION EVENT
              </p>
            </div>

            <span
              className="mono"
              style={{
                color: summary.ids_match
                  ? "#34d399"
                  : "#f87171",
                fontSize: 8,
                fontWeight: 800,
              }}
            >
              IDS MATCH:{" "}
              {String(
                summary.ids_match,
              ).toUpperCase()}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <ValueBadge
              value={formatValue(
                demo.correction_event
                  .old_value,
              )}
              obsolete
            />

            <ArrowRight
              size={14}
              style={{
                color: "#64748b",
              }}
            />

            <ValueBadge
              value={formatValue(
                demo.correction_event
                  .new_value,
              )}
            />
          </div>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: 11,
              lineHeight: 1.65,
            }}
          >
            {
              demo.correction_event
                .reason
            }
          </p>
        </div>

        {/* Summary */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10,
          }}
        >
          <SummaryMetric
            label="Total Beliefs"
            value={summary.total_beliefs}
            colour="#8b5cf6"
          />

          <SummaryMetric
            label="Active"
            value={summary.active_beliefs}
            colour="#34d399"
          />

          <SummaryMetric
            label="Superseded"
            value={
              summary.superseded_beliefs
            }
            colour="#f87171"
          />

          <SummaryMetric
            label="Corrections"
            value={summary.corrections}
            colour="#f59e0b"
          />
        </div>
      </div>
    </article>
  );
}

interface CorrectionMetricProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  colour: string;
}

function CorrectionMetric({
  label,
  value,
  description,
  icon: Icon,
  colour,
}: CorrectionMetricProps) {
  return (
    <article
      className="card card-hover"
      style={{
        position: "relative",
        minHeight: 132,
        overflow: "hidden",
        padding: 17,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -35,
          right: -25,
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

      <p
        style={{
          margin: "15px 0 0",
          color: "#ffffff",
          fontSize: 20,
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
          fontSize: 10,
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
    </article>
  );
}

interface SectionHeaderProps {
  icon: LucideIcon;
  colour: string;
  eyebrow: string;
  title: string;
  description: string;
}

function SectionHeader({
  icon: Icon,
  colour,
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
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
            maxWidth: 660,
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

interface ProcessStepProps {
  number: string;
  icon: LucideIcon;
  colour: string;
  title: string;
  description: string;
}

function ProcessStep({
  number,
  icon: Icon,
  colour,
  title,
  description,
}: ProcessStepProps) {
  return (
    <article
      style={{
        position: "relative",
        padding: 17,
        borderRadius: 14,
        background:
          "rgba(148,163,184,0.025)",
        border:
          "1px solid rgba(148,163,184,0.065)",
      }}
    >
      <span
        className="mono"
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          color: "#1e293b",
          fontSize: 19,
          fontWeight: 900,
        }}
      >
        {number}
      </span>

      <div
        style={{
          display: "grid",
          width: 36,
          height: 36,
          placeItems: "center",
          borderRadius: 10,
          color: colour,
          background: `${colour}11`,
          border: `1px solid ${colour}20`,
        }}
      >
        <Icon size={15} />
      </div>

      <h3
        style={{
          margin: "14px 0 0",
          color: "#cbd5e1",
          fontSize: 12,
          fontWeight: 750,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: "7px 0 0",
          color: "#475569",
          fontSize: 10,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </article>
  );
}

interface BeliefPanelRow {
  label: string;
  value: string;
}

interface BeliefPanelProps {
  title: string;
  subtitle: string;
  colour: string;
  icon: ReactNode;
  rows: BeliefPanelRow[];
}

function BeliefPanel({
  title,
  subtitle,
  colour,
  icon,
  rows,
}: BeliefPanelProps) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: 17,
        borderRadius: 14,
        background: `${colour}07`,
        border: `1px solid ${colour}1f`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: 15,
        }}
      >
        <span
          style={{
            display: "grid",
            width: 31,
            height: 31,
            placeItems: "center",
            borderRadius: 9,
            color: colour,
            background: `${colour}11`,
          }}
        >
          {icon}
        </span>

        <div>
          <p
            style={{
              margin: 0,
              color: "#e2e8f0",
              fontSize: 12,
              fontWeight: 750,
            }}
          >
            {title}
          </p>

          <p
            className="mono"
            style={{
              margin: "3px 0 0",
              color: colour,
              fontSize: 7,
              fontWeight: 800,
              letterSpacing: "0.1em",
            }}
          >
            {subtitle.toUpperCase()}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 8,
        }}
      >
        {rows.map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: 12,
              paddingBottom: 8,
              borderBottom:
                "1px solid rgba(148,163,184,0.05)",
            }}
          >
            <span
              className="mono"
              style={{
                color: "#475569",
                fontSize: 8,
                letterSpacing: "0.06em",
              }}
            >
              {row.label.toUpperCase()}
            </span>

            <span
              className="mono"
              title={row.value}
              style={{
                maxWidth: "60%",
                overflow: "hidden",
                color: "#94a3b8",
                fontSize: 9,
                textAlign: "right",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValueBadge({
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
        padding: "7px 11px",
        borderRadius: 8,
        color: obsolete
          ? "#f87171"
          : "#34d399",
        fontSize: 11,
        textDecoration: obsolete
          ? "line-through"
          : "none",
        background: obsolete
          ? "rgba(239,68,68,0.075)"
          : "rgba(16,185,129,0.075)",
        border: obsolete
          ? "1px solid rgba(239,68,68,0.17)"
          : "1px solid rgba(16,185,129,0.17)",
      }}
    >
      {value}
    </span>
  );
}

function SummaryMetric({
  label,
  value,
  colour,
}: {
  label: string;
  value: number;
  colour: string;
}) {
  return (
    <div
      style={{
        padding: "13px 10px",
        textAlign: "center",
        borderRadius: 11,
        background:
          "rgba(148,163,184,0.025)",
        border:
          "1px solid rgba(148,163,184,0.065)",
      }}
    >
      <p
        className="mono"
        style={{
          margin: 0,
          color: colour,
          fontSize: 20,
          fontWeight: 900,
        }}
      >
        {value}
      </p>

      <p
        className="mono"
        style={{
          margin: "5px 0 0",
          color: "#475569",
          fontSize: 7,
          letterSpacing: "0.09em",
        }}
      >
        {label.toUpperCase()}
      </p>
    </div>
  );
}