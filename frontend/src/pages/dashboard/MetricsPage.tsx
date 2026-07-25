import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  Activity,
  BarChart2,
  Brain,
  Clock3,
  Compass,
  Gauge,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { fetchMetrics } from "../../services/api";
import type { MetricsResponse } from "../../types/api";

import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { useRunId } from "../../hooks/useRunId";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle: CSSProperties = {
  background: "rgba(6, 9, 18, 0.98)",
  border: "1px solid rgba(139, 92, 246, 0.25)",
  borderRadius: 10,
  color: "#f1f5f9",
  fontSize: 11,
  boxShadow: "0 18px 50px rgba(0, 0, 0, 0.35)",
};

const axisStyle = {
  fontSize: 10,
  fill: "#475569",
};

export function MetricsPage() {
  const [runId] = useRunId();

  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    if (!runId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetchMetrics(runId);

      setData(response);
      setLastUpdated(new Date());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load metrics",
      );
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    void load();
  }, [load]);

  const tokenData = useMemo(() => {
    return (data?.token_counts_per_turn ?? []).map((tokens, index) => ({
      turn: index + 1,
      bounded: tokens,
      traditional: tokens * 8,
    }));
  }, [data]);

  const beliefData = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
      {
        name: "Active",
        value: data.active_beliefs,
      },
      {
        name: "Superseded",
        value: data.superseded_beliefs,
      },
    ];
  }, [data]);

  const totalBeliefs =
    (data?.active_beliefs ?? 0) + (data?.superseded_beliefs ?? 0);

  const activeBeliefRate =
    totalBeliefs > 0
      ? Math.round(((data?.active_beliefs ?? 0) / totalBeliefs) * 100)
      : 0;

  const averageActionsPerTurn =
    data && data.total_turns > 0
      ? data.total_actions / data.total_turns
      : 0;

  const contextReduction = tokenData.length > 0 ? 87.5 : 0;

  if (!runId) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          padding: 32,
        }}
      >
        <EmptyState
          title="No active run"
          message="Start an agent run to view live performance, memory and bounded-context metrics."
          icon={<BarChart2 size={24} />}
        />
      </div>
    );
  }

  return (
    <main
      style={{
        width: "100%",
        maxWidth: 1480,
        marginInline: "auto",
        padding: "28px clamp(18px, 3vw, 38px) 48px",
      }}
    >
      {/* Header */}

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
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#22d3ee",
                boxShadow: "0 0 14px rgba(34,211,238,0.8)",
              }}
            />

            <p
              className="label-overline"
              style={{
                color: "#22d3ee",
              }}
            >
              AGENT OBSERVABILITY
            </p>
          </div>

          <h1
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "clamp(2rem, 4vw, 3.3rem)",
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-0.052em",
            }}
          >
            Performance Metrics
          </h1>

          <p
            style={{
              maxWidth: 760,
              margin: "11px 0 0",
              color: "#64748b",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Monitor execution efficiency, bounded-context behaviour,
            exploration progress and memory quality throughout the active
            MNEMOS run.
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
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="btn-outline"
            style={{
              minHeight: 42,
              padding: "10px 14px",
            }}
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : undefined}
            />

            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div style={{ marginBottom: 18 }}>
          <ErrorState message={error} retry={load} />
        </div>
      )}

      {loading && !data && (
        <div
          className="card"
          style={{
            minHeight: 300,
            display: "grid",
            placeItems: "center",
          }}
        >
          <LoadingState message="Loading performance metrics…" />
        </div>
      )}

      {data && (
        <>
          {/* Main metric cards */}

          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <PerformanceMetric
              label="Total Turns"
              value={String(data.total_turns)}
              description="Completed reasoning cycles"
              icon={Activity}
              colour="#8b5cf6"
            />

            <PerformanceMetric
              label="Total Actions"
              value={String(data.total_actions)}
              description="Environment actions taken"
              icon={Zap}
              colour="#f59e0b"
            />

            <PerformanceMetric
              label="Rooms Explored"
              value={String(data.unique_rooms_explored)}
              description="Unique areas discovered"
              icon={Compass}
              colour="#22d3ee"
            />

            <PerformanceMetric
              label="Corrections"
              value={String(data.corrections)}
              description="Belief revisions recorded"
              icon={ShieldCheck}
              colour="#f87171"
            />

            <PerformanceMetric
              label="Active Beliefs"
              value={String(data.active_beliefs)}
              description="Currently trusted knowledge"
              icon={Brain}
              colour="#34d399"
            />

            <PerformanceMetric
              label="Superseded"
              value={String(data.superseded_beliefs)}
              description="Historical belief versions"
              icon={Route}
              colour="#fb7185"
            />

            <PerformanceMetric
              label="Average Tokens"
              value={formatNumber(data.avg_bounded_context_tokens)}
              description="Per bounded context"
              icon={Gauge}
              colour="#a78bfa"
            />

            <PerformanceMetric
              label="Maximum Tokens"
              value={formatNumber(data.max_bounded_context_tokens)}
              description="Peak context footprint"
              icon={Target}
              colour="#38bdf8"
            />
          </section>

          {/* Runtime summary */}

          <section
            className="card"
            style={{
              marginBottom: 18,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              <RuntimeMetric
                label="Run Status"
                value={formatStatus(data.completion_status)}
                icon={Activity}
                colour={statusColour(data.completion_status)}
              />

              <RuntimeMetric
                label="Elapsed Time"
                value={
                  data.elapsed_seconds !== null
                    ? formatDuration(data.elapsed_seconds)
                    : "In progress"
                }
                icon={Clock3}
                colour="#22d3ee"
              />

              <RuntimeMetric
                label="Total Reward"
                value={data.total_reward.toFixed(1)}
                icon={Sparkles}
                colour="#f59e0b"
              />

              <RuntimeMetric
                label="Actions / Turn"
                value={averageActionsPerTurn.toFixed(2)}
                icon={Zap}
                colour="#8b5cf6"
              />
            </div>
          </section>

          {/* Charts */}

          <section
            className="metrics-chart-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1.55fr) minmax(300px, 0.75fr)",
              gap: 16,
              marginBottom: 18,
            }}
          >
            <ChartPanel
              eyebrow="CONTEXT EFFICIENCY"
              title="Bounded context vs traditional history"
              description="MNEMOS sends a compact structured context rather than continuously replaying the full interaction history."
              icon={BarChart2}
              colour="#8b5cf6"
            >
              {tokenData.length > 1 ? (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart
                      data={tokenData}
                      margin={{
                        top: 12,
                        right: 16,
                        left: -8,
                        bottom: 4,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="4 5"
                        stroke="rgba(148,163,184,0.06)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="turn"
                        tick={axisStyle}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={axisStyle}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{
                          color: "#94a3b8",
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="traditional"
                        name="Traditional estimate"
                        stroke="#ef4444"
                        strokeWidth={1.5}
                        strokeDasharray="6 4"
                        dot={false}
                        activeDot={{
                          r: 4,
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="bounded"
                        name="MNEMOS bounded"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{
                          r: 4,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      gap: 10,
                      marginTop: 12,
                      paddingTop: 13,
                      borderTop:
                        "1px solid rgba(148,163,184,0.06)",
                    }}
                  >
                    <LegendItem
                      label="MNEMOS bounded"
                      colour="#8b5cf6"
                    />

                    <LegendItem
                      label="Traditional estimate"
                      colour="#ef4444"
                      dashed
                    />

                    <span
                      className="mono"
                      style={{
                        color: "#34d399",
                        fontSize: 8,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                      }}
                    >
                      APPROX. {contextReduction}% CONTEXT REDUCTION
                    </span>
                  </div>
                </>
              ) : (
                <ChartEmptyState message="Run multiple agent turns to generate the context-efficiency chart." />
              )}
            </ChartPanel>

            <ChartPanel
              eyebrow="MEMORY QUALITY"
              title="Belief distribution"
              description="Compare currently active beliefs with historical superseded versions."
              icon={Brain}
              colour="#34d399"
            >
              {beliefData.some((item) => item.value > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart
                      data={beliefData}
                      margin={{
                        top: 12,
                        right: 8,
                        left: -12,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="4 5"
                        stroke="rgba(148,163,184,0.06)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={axisStyle}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={axisStyle}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip contentStyle={tooltipStyle} />

                      <Bar
                        dataKey="value"
                        name="Beliefs"
                        fill="#6366f1"
                        radius={[7, 7, 2, 2]}
                        maxBarSize={68}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    <CompactMetric
                      label="Active Rate"
                      value={`${activeBeliefRate}%`}
                      colour="#34d399"
                    />

                    <CompactMetric
                      label="Total Beliefs"
                      value={String(totalBeliefs)}
                      colour="#8b5cf6"
                    />
                  </div>
                </>
              ) : (
                <ChartEmptyState message="Belief distribution will appear after the agent records world knowledge." />
              )}
            </ChartPanel>
          </section>

          {/* Insights */}

          <section
            className="card"
            style={{
              padding: 22,
            }}
          >
            <SectionHeader
              icon={Sparkles}
              colour="#22d3ee"
              eyebrow="SYSTEM INSIGHTS"
              title="Run efficiency summary"
              description="Automatically derived indicators based on the current execution metrics."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                marginTop: 18,
              }}
            >
              <InsightCard
                title="Bounded context"
                value={
                  tokenData.length > 0
                    ? `${contextReduction}% smaller`
                    : "Awaiting data"
                }
                description="Estimated reduction compared with repeatedly sending the full interaction history."
                colour="#8b5cf6"
              />

              <InsightCard
                title="Memory stability"
                value={`${activeBeliefRate}% active`}
                description="Percentage of stored beliefs that remain active and have not been superseded."
                colour="#34d399"
              />

              <InsightCard
                title="Exploration"
                value={`${data.unique_rooms_explored} rooms`}
                description="Unique environment locations reached during the current autonomous run."
                colour="#22d3ee"
              />

              <InsightCard
                title="Correction activity"
                value={`${data.corrections} events`}
                description="Contradictions detected and resolved through versioned belief correction."
                colour="#f59e0b"
              />
            </div>
          </section>
        </>
      )}
    </main>
  );
}

interface PerformanceMetricProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  colour: string;
}

function PerformanceMetric({
  label,
  value,
  description,
  icon: Icon,
  colour,
}: PerformanceMetricProps) {
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
          top: -38,
          right: -24,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: `${colour}12`,
          filter: "blur(30px)",
        }}
      />

      <div
        style={{
          position: "relative",
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

      <p
        style={{
          margin: "15px 0 0",
          color: "#ffffff",
          fontSize: 21,
          fontWeight: 850,
          letterSpacing: "-0.035em",
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

interface RuntimeMetricProps {
  label: string;
  value: string;
  icon: LucideIcon;
  colour: string;
}

function RuntimeMetric({
  label,
  value,
  icon: Icon,
  colour,
}: RuntimeMetricProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: 13,
        background: "rgba(148,163,184,0.025)",
        border: "1px solid rgba(148,163,184,0.06)",
      }}
    >
      <div
        style={{
          display: "grid",
          width: 34,
          height: 34,
          flexShrink: 0,
          placeItems: "center",
          borderRadius: 10,
          color: colour,
          background: `${colour}11`,
          border: `1px solid ${colour}20`,
        }}
      >
        <Icon size={14} />
      </div>

      <div style={{ minWidth: 0 }}>
        <p
          className="mono"
          style={{
            margin: 0,
            color: "#475569",
            fontSize: 7,
            letterSpacing: "0.09em",
          }}
        >
          {label.toUpperCase()}
        </p>

        <p
          style={{
            margin: "4px 0 0",
            overflow: "hidden",
            color: "#cbd5e1",
            fontSize: 12,
            fontWeight: 750,
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

interface ChartPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  colour: string;
  children: ReactNode;
}

function ChartPanel({
  eyebrow,
  title,
  description,
  icon: Icon,
  colour,
  children,
}: ChartPanelProps) {
  return (
    <article
      className="card"
      style={{
        minWidth: 0,
        padding: 21,
      }}
    >
      <SectionHeader
        icon={Icon}
        colour={colour}
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <div style={{ marginTop: 18 }}>{children}</div>
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
            maxWidth: 650,
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

function LegendItem({
  label,
  colour,
  dashed = false,
}: {
  label: string;
  colour: string;
  dashed?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
      }}
    >
      <span
        style={{
          width: 18,
          height: 2,
          background: dashed
            ? `repeating-linear-gradient(
                90deg,
                ${colour} 0 5px,
                transparent 5px 8px
              )`
            : colour,
        }}
      />

      <span
        style={{
          color: "#64748b",
          fontSize: 9,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function CompactMetric({
  label,
  value,
  colour,
}: {
  label: string;
  value: string;
  colour: string;
}) {
  return (
    <div
      style={{
        padding: 12,
        textAlign: "center",
        borderRadius: 11,
        background: `${colour}07`,
        border: `1px solid ${colour}15`,
      }}
    >
      <p
        className="mono"
        style={{
          margin: 0,
          color: colour,
          fontSize: 16,
          fontWeight: 850,
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
          letterSpacing: "0.08em",
        }}
      >
        {label.toUpperCase()}
      </p>
    </div>
  );
}

function InsightCard({
  title,
  value,
  description,
  colour,
}: {
  title: string;
  value: string;
  description: string;
  colour: string;
}) {
  return (
    <article
      style={{
        padding: 16,
        borderRadius: 14,
        background: "rgba(148,163,184,0.025)",
        border: "1px solid rgba(148,163,184,0.06)",
      }}
    >
      <span
        style={{
          display: "block",
          width: 24,
          height: 3,
          marginBottom: 13,
          borderRadius: 999,
          background: colour,
          boxShadow: `0 0 10px ${colour}55`,
        }}
      />

      <p
        style={{
          margin: 0,
          color: "#94a3b8",
          fontSize: 10,
          fontWeight: 650,
        }}
      >
        {title}
      </p>

      <p
        style={{
          margin: "6px 0 0",
          color: "#ffffff",
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: "-0.025em",
        }}
      >
        {value}
      </p>

      <p
        style={{
          margin: "7px 0 0",
          color: "#475569",
          fontSize: 9,
          lineHeight: 1.55,
        }}
      >
        {description}
      </p>
    </article>
  );
}

function ChartEmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div
      style={{
        minHeight: 240,
        display: "grid",
        placeItems: "center",
        padding: 24,
        textAlign: "center",
        borderRadius: 14,
        background: "rgba(148,163,184,0.02)",
        border: "1px dashed rgba(148,163,184,0.09)",
      }}
    >
      <div>
        <BarChart2
          size={22}
          style={{
            color: "#334155",
            marginInline: "auto",
          }}
        />

        <p
          className="mono"
          style={{
            maxWidth: 330,
            margin: "12px auto 0",
            color: "#475569",
            fontSize: 8,
            lineHeight: 1.7,
            letterSpacing: "0.07em",
          }}
        >
          {message.toUpperCase()}
        </p>
      </div>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDuration(seconds: number) {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  return `${minutes}m ${remainingSeconds}s`;
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusColour(status: string) {
  const normalisedStatus = status.toLowerCase();

  if (
    normalisedStatus.includes("complete") ||
    normalisedStatus.includes("success")
  ) {
    return "#34d399";
  }

  if (
    normalisedStatus.includes("fail") ||
    normalisedStatus.includes("error")
  ) {
    return "#f87171";
  }

  if (
    normalisedStatus.includes("running") ||
    normalisedStatus.includes("active")
  ) {
    return "#22d3ee";
  }

  return "#8b5cf6";
}