import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  Archive,
  Brain,
  Database,
  GitBranch,
  Globe,
  Layers,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import {
  fetchBeliefs,
  fetchWorld,
} from "../../services/api";

import type {
  Belief,
  WorldStateResponse,
} from "../../types/api";

import { BeliefTable } from "../../components/ui/BeliefTable";
import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { NodeGraph } from "../../components/brand/NodeGraph";
import { useRunId } from "../../hooks/useRunId";

export function WorldModelPage() {
  const [runId] = useRunId();

  const [data, setData] =
    useState<WorldStateResponse | null>(null);

  const [beliefs, setBeliefs] =
    useState<Belief[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const [activeOnly, setActiveOnly] =
    useState(false);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const load = useCallback(async () => {
    if (!runId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [world, beliefResponse] =
        await Promise.all([
          fetchWorld(runId),
          fetchBeliefs(runId),
        ]);

      setData(world);
      setBeliefs(beliefResponse.beliefs);
      setLastUpdated(new Date());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load the world model",
      );
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = filter
      .trim()
      .toLowerCase();

    return beliefs.filter((belief) => {
      if (activeOnly && !belief.active) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        belief.entity
          .toLowerCase()
          .includes(query) ||
        belief.attribute
          .toLowerCase()
          .includes(query) ||
        String(belief.value)
          .toLowerCase()
          .includes(query)
      );
    });
  }, [activeOnly, beliefs, filter]);

  const activeBeliefs = beliefs.filter(
    (belief) => belief.active,
  );

  const supersededBeliefs = beliefs.filter(
    (belief) => !belief.active,
  );

  const uniqueEntities = new Set(
    beliefs.map((belief) => belief.entity),
  ).size;

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
          message="Start a run from the Agent Run page to populate the MNEMOS world model."
          icon={<Globe size={24} />}
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
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#8b5cf6",
                boxShadow:
                  "0 0 14px rgba(139,92,246,0.8)",
              }}
            />

            <p
              className="label-overline"
              style={{ color: "#8b5cf6" }}
            >
              STRUCTURED AGENT MEMORY
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
            World Model
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
            Inspect the structured beliefs,
            entities and corrections that form
            the agent&apos;s current
            understanding of its environment.
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
            onClick={() => void load()}
            disabled={loading}
            className="btn-outline"
            style={{
              minHeight: 40,
              padding: "9px 13px",
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
        </div>
      </header>

      {error && (
        <div style={{ marginBottom: 18 }}>
          <ErrorState
            message={error}
            retry={load}
          />
        </div>
      )}

      {/* ===================================================
          METRICS
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
        <WorldMetric
          label="Total Beliefs"
          value={String(
            data?.belief_count ??
              beliefs.length,
          )}
          description="All recorded belief versions"
          icon={Database}
          colour="#8b5cf6"
        />

        <WorldMetric
          label="Active Beliefs"
          value={String(
            data?.active_beliefs ??
              activeBeliefs.length,
          )}
          description="Currently trusted facts"
          icon={ShieldCheck}
          colour="#34d399"
        />

        <WorldMetric
          label="Superseded"
          value={String(
            data?.superseded_beliefs ??
              supersededBeliefs.length,
          )}
          description="Preserved historical beliefs"
          icon={Archive}
          colour="#f59e0b"
        />

        <WorldMetric
          label="Corrections"
          value={String(
            data?.correction_count ?? 0,
          )}
          description="Detected belief revisions"
          icon={GitBranch}
          colour="#f87171"
        />

        <WorldMetric
          label="Entities"
          value={String(uniqueEntities)}
          description="Known world objects"
          icon={Layers}
          colour="#22d3ee"
        />
      </section>

      {/* ===================================================
          VISUAL MODEL
          =================================================== */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1.55fr) minmax(290px, 0.75fr)",
          gap: 16,
          marginBottom: 18,
        }}
        className="world-model-grid"
      >
        <article
          className="card"
          style={{
            position: "relative",
            minHeight: 430,
            overflow: "hidden",
            padding: 22,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(circle at 50% 55%, rgba(124,58,237,0.11), transparent 44%)",
            }}
          />

          <SectionHeader
            icon={Globe}
            colour="#8b5cf6"
            eyebrow="LIVE GRAPH"
            title="Entity relationship model"
            description="A visual representation of the agent’s structured understanding of the environment."
          />

          <div
            style={{
              position: "relative",
              minHeight: 310,
              marginTop: 18,
              overflow: "hidden",
              borderRadius: 17,
              background:
                "linear-gradient(180deg, rgba(3,7,16,0.92), rgba(2,5,12,0.98))",
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
                minHeight: 310,
                placeItems: "center",
              }}
            >
              <NodeGraph
                width={700}
                height={305}
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
            {Array.from(
              new Set(
                activeBeliefs.map(
                  (belief) => belief.entity,
                ),
              ),
            )
              .slice(0, 8)
              .map((entity) => (
                <span
                  key={entity}
                  className="mono"
                  style={{
                    padding: "6px 8px",
                    borderRadius: 7,
                    color: "#64748b",
                    fontSize: 8,
                    letterSpacing: "0.07em",
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
        </article>

        <aside
          className="card"
          style={{
            minHeight: 430,
            padding: 22,
          }}
        >
          <SectionHeader
            icon={Brain}
            colour="#22d3ee"
            eyebrow="MODEL SUMMARY"
            title="Memory composition"
            description="A high-level breakdown of the active and historical knowledge stored by MNEMOS."
          />

          <div
            style={{
              display: "grid",
              gap: 11,
              marginTop: 20,
            }}
          >
            <CompositionRow
              label="Active knowledge"
              value={
                activeBeliefs.length
              }
              total={Math.max(
                beliefs.length,
                1,
              )}
              colour="#34d399"
            />

            <CompositionRow
              label="Superseded history"
              value={
                supersededBeliefs.length
              }
              total={Math.max(
                beliefs.length,
                1,
              )}
              colour="#f59e0b"
            />

            <CompositionRow
              label="Known entities"
              value={uniqueEntities}
              total={Math.max(
                beliefs.length,
                uniqueEntities,
                1,
              )}
              colour="#22d3ee"
            />

            <CompositionRow
              label="Corrections"
              value={
                data?.correction_count ?? 0
              }
              total={Math.max(
                beliefs.length,
                data?.correction_count ??
                  0,
                1,
              )}
              colour="#f87171"
            />
          </div>

          <div
            style={{
              marginTop: 20,
              padding: 15,
              borderRadius: 13,
              background:
                "rgba(124,58,237,0.05)",
              border:
                "1px solid rgba(139,92,246,0.13)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <Sparkles
                size={15}
                style={{
                  flexShrink: 0,
                  marginTop: 1,
                  color: "#a78bfa",
                }}
              />

              <div>
                <p
                  className="mono"
                  style={{
                    margin: 0,
                    color: "#a78bfa",
                    fontSize: 8,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                  }}
                >
                  VERSIONED KNOWLEDGE
                </p>

                <p
                  style={{
                    margin: "7px 0 0",
                    color: "#64748b",
                    fontSize: 10,
                    lineHeight: 1.6,
                  }}
                >
                  MNEMOS never silently
                  overwrites a belief. Previous
                  values remain preserved as
                  superseded versions for
                  inspection and audit.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* ===================================================
          BELIEF TABLE
          =================================================== */}

      <section
        className="card"
        style={{
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "19px 20px 16px",
            borderBottom:
              "1px solid rgba(148,163,184,0.07)",
          }}
        >
          <SectionHeader
            icon={Activity}
            colour="#8b5cf6"
            eyebrow="BELIEF REGISTRY"
            title="Inspectable world knowledge"
            description="Search and filter the beliefs recorded during the current autonomous run."
          />
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            borderBottom:
              "1px solid rgba(148,163,184,0.06)",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: 1,
              minWidth: 230,
            }}
          >
            <Search
              size={14}
              style={{
                position: "absolute",
                top: "50%",
                left: 14,
                zIndex: 1,
                color: "#475569",
                transform:
                  "translateY(-50%)",
              }}
            />

            <input
              type="search"
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value,
                )
              }
              placeholder="Search entity, attribute or value..."
              className="input-dark"
              style={{
                minHeight: 44,
                paddingLeft: 39,
              }}
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveOnly(
                (current) => !current,
              )
            }
            style={{
              display: "flex",
              minHeight: 44,
              alignItems: "center",
              gap: 10,
              padding: "9px 13px",
              borderRadius: 11,
              color: activeOnly
                ? "#34d399"
                : "#64748b",
              background: activeOnly
                ? "rgba(16,185,129,0.07)"
                : "rgba(148,163,184,0.025)",
              border: activeOnly
                ? "1px solid rgba(16,185,129,0.18)"
                : "1px solid rgba(148,163,184,0.08)",
            }}
          >
            <span
              style={{
                position: "relative",
                width: 32,
                height: 18,
                borderRadius: 999,
                background: activeOnly
                  ? "#10b981"
                  : "#1e293b",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: activeOnly
                    ? 17
                    : 3,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#ffffff",
                  transition:
                    "left 180ms ease",
                }}
              />
            </span>

            <span
              className="mono"
              style={{
                fontSize: 8,
                fontWeight: 800,
                letterSpacing: "0.09em",
              }}
            >
              ACTIVE ONLY
            </span>
          </button>

          <span
            className="mono"
            style={{
              color: "#475569",
              fontSize: 8,
              letterSpacing: "0.08em",
            }}
          >
            {filtered.length} OF{" "}
            {beliefs.length} BELIEFS
          </span>
        </div>

        {loading ? (
          <div
            style={{
              minHeight: 250,
              display: "grid",
              placeItems: "center",
            }}
          >
            <LoadingState message="Loading world model…" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 36 }}>
            <EmptyState
              title="No beliefs found"
              message={
                filter
                  ? "No beliefs match the current search or filter."
                  : "Beliefs will appear as the agent explores and observes the environment."
              }
              icon={<Database size={22} />}
            />
          </div>
        ) : (
          <BeliefTable
            beliefs={filtered}
            showSuperseded={!activeOnly}
          />
        )}
      </section>
    </main>
  );
}

interface WorldMetricProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  colour: string;
}

function WorldMetric({
  label,
  value,
  description,
  icon: Icon,
  colour,
}: WorldMetricProps) {
  return (
    <article
      className="card card-hover"
      style={{
        position: "relative",
        minHeight: 130,
        overflow: "hidden",
        padding: 17,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -35,
          right: -25,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `${colour}12`,
          filter: "blur(28px)",
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
          fontSize: 21,
          fontWeight: 800,
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
        position: "relative",
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
            maxWidth: 600,
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

interface CompositionRowProps {
  label: string;
  value: number;
  total: number;
  colour: string;
}

function CompositionRow({
  label,
  value,
  total,
  colour,
}: CompositionRowProps) {
  const percentage = Math.min(
    100,
    Math.max(
      0,
      Math.round((value / total) * 100),
    ),
  );

  return (
    <div
      style={{
        padding: "12px 13px",
        borderRadius: 11,
        background:
          "rgba(148,163,184,0.025)",
        border:
          "1px solid rgba(148,163,184,0.055)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <span
          style={{
            color: "#94a3b8",
            fontSize: 10,
            fontWeight: 650,
          }}
        >
          {label}
        </span>

        <span
          className="mono"
          style={{
            color: colour,
            fontSize: 9,
            fontWeight: 800,
          }}
        >
          {value}
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: 5,
          marginTop: 10,
          overflow: "hidden",
          borderRadius: 999,
          background:
            "rgba(148,163,184,0.07)",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            borderRadius: "inherit",
            background: colour,
            boxShadow: `0 0 10px ${colour}55`,
            transition:
              "width 350ms ease",
          }}
        />
      </div>
    </div>
  );
}