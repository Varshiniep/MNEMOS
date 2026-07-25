import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  GitBranch,
  Globe,
  Layers,
  Sparkles,
  XCircle,
  Zap,
} from "lucide-react";

import { MnemosLogo } from "../components/brand/MnemosLogo";
import { NodeGraph } from "../components/brand/NodeGraph";
import { StarField } from "../components/brand/StarField";

/* =========================================================
   NAVBAR
   ========================================================= */

function Navbar() {
  const navigate = useNavigate();

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Architecture", href: "#architecture" },
    { label: "Metrics", href: "#metrics" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        height: 72,
        background: "rgba(3, 6, 14, 0.78)",
        backdropFilter: "blur(22px)",
        borderBottom: "1px solid rgba(148,163,184,0.08)",
      }}
    >
      <div
        className="container h-full flex items-center justify-between"
        style={{ maxWidth: 1180 }}
      >
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Go to MNEMOS home"
          style={{
            border: 0,
            padding: 0,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <MnemosLogo size={34} variant="full" />
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontSize: 13,
                color: "#64748b",
                letterSpacing: "0.02em",
                transition: "color 180ms ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = "#f8fafc";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = "#64748b";
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn-ghost"
            style={{
              padding: "9px 15px",
              fontSize: 13,
            }}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn-primary"
            style={{
              padding: "10px 18px",
              fontSize: 13,
            }}
          >
            Launch Demo
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}

/* =========================================================
   HERO
   ========================================================= */

function Hero() {
  const navigate = useNavigate();

  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: "100vh",
        paddingTop: 132,
        paddingBottom: 96,
      }}
    >
      <div className="absolute inset-0">
        <StarField density={150} />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 28%, rgba(124,58,237,0.16), transparent 33%), radial-gradient(circle at 78% 48%, rgba(34,211,238,0.08), transparent 28%)",
        }}
      />

      <div
        className="absolute inset-0 grid-bg opacity-20 pointer-events-none"
        aria-hidden="true"
      />

      <div
        className="container relative z-10"
        style={{ maxWidth: 1180 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            className="inline-flex items-center gap-2 rounded-full"
            style={{
              padding: "8px 13px",
              marginBottom: 28,
              color: "#34d399",
              background: "rgba(16,185,129,0.075)",
              border: "1px solid rgba(16,185,129,0.2)",
              boxShadow: "0 0 28px rgba(16,185,129,0.05)",
            }}
          >
            <span
              className="animate-blink"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#34d399",
                boxShadow: "0 0 10px rgba(52,211,153,0.85)",
              }}
            />

            <span
              className="mono"
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.16em",
              }}
            >
              LOCAL-FIRST · CPU-READY · CONTEXT-BOUNDED
            </span>
          </div>

          <p
            className="label-overline"
            style={{
              marginBottom: 14,
              color: "#8b5cf6",
              letterSpacing: "0.2em",
            }}
          >
            AUTONOMOUS WORLD INTELLIGENCE
          </p>

          <h1
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "clamp(4.5rem, 10vw, 7.8rem)",
              fontWeight: 900,
              lineHeight: 0.88,
              letterSpacing: "-0.07em",
              textShadow:
                "0 0 44px rgba(124,58,237,0.18), 0 22px 70px rgba(0,0,0,0.7)",
            }}
          >
            MNEMOS
          </h1>

          <h2
            style={{
              maxWidth: 760,
              margin: "28px 0 0",
              color: "#e2e8f0",
              fontSize: "clamp(1.45rem, 3.2vw, 2.5rem)",
              fontWeight: 650,
              lineHeight: 1.18,
              letterSpacing: "-0.035em",
            }}
          >
            A Self-Correcting World Model
            <br />
            for Autonomous Agents
          </h2>

          <p
            style={{
              maxWidth: 650,
              margin: "22px 0 0",
              color: "#7c8aa0",
              fontSize: "clamp(0.98rem, 1.7vw, 1.12rem)",
              lineHeight: 1.75,
            }}
          >
            MNEMOS gives autonomous agents a compact, structured and
            continuously corrected memory—without repeatedly sending their
            entire interaction history.
          </p>

          <div
            className="flex flex-wrap justify-center"
            style={{
              gap: 14,
              marginTop: 32,
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn-primary"
              style={{
                minHeight: 48,
                padding: "0 26px",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <Zap size={16} />
              Launch Live Demo
            </button>

            <a
              href="#architecture"
              className="btn-outline"
              style={{
                minHeight: 48,
                padding: "0 26px",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Explore Architecture
              <ArrowRight size={15} />
            </a>
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: 860,
              marginTop: 66,
            }}
          >
            <div
              style={{
                position: "relative",
                padding: 1,
                borderRadius: 24,
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.38), rgba(34,211,238,0.1), rgba(255,255,255,0.05))",
                boxShadow:
                  "0 28px 90px rgba(0,0,0,0.48), 0 0 60px rgba(124,58,237,0.09)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 23,
                  padding: "24px 24px 18px",
                  background:
                    "linear-gradient(180deg, rgba(11,16,31,0.95), rgba(7,11,22,0.96))",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div
                  className="flex flex-wrap items-center justify-between"
                  style={{
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        display: "grid",
                        width: 34,
                        height: 34,
                        placeItems: "center",
                        borderRadius: 10,
                        color: "#a78bfa",
                        background: "rgba(124,58,237,0.12)",
                        border: "1px solid rgba(139,92,246,0.22)",
                      }}
                    >
                      <Sparkles size={16} />
                    </div>

                    <div style={{ textAlign: "left" }}>
                      <p
                        className="mono"
                        style={{
                          margin: 0,
                          color: "#c4b5fd",
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: "0.13em",
                        }}
                      >
                        LIVE WORLD GRAPH
                      </p>

                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#475569",
                          fontSize: 12,
                        }}
                      >
                        Structured memory generated from the current world state
                      </p>
                    </div>
                  </div>

                  <div
                    className="mono"
                    style={{
                      padding: "7px 10px",
                      borderRadius: 999,
                      color: "#34d399",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.16)",
                    }}
                  >
                    LIVE
                  </div>
                </div>

                <div
                  style={{
                    minHeight: 250,
                    overflow: "hidden",
                    borderRadius: 17,
                    background:
                      "radial-gradient(circle at 50% 45%, rgba(124,58,237,0.08), transparent 45%), rgba(2,6,15,0.72)",
                    border: "1px solid rgba(148,163,184,0.07)",
                  }}
                >
                  <NodeGraph width={790} height={250} animate />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                overflow: "hidden",
                borderRadius: 20,
                background: "rgba(8,13,25,0.9)",
                border: "1px solid rgba(148,163,184,0.09)",
                boxShadow: "0 22px 65px rgba(0,0,0,0.34)",
                backdropFilter: "blur(18px)",
              }}
            >
              <div
                className="flex flex-wrap items-center justify-between"
                style={{
                  gap: 12,
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(148,163,184,0.07)",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <p
                    className="mono"
                    style={{
                      margin: 0,
                      color: "#a78bfa",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                    }}
                  >
                    VISIBLE BELIEF CORRECTION
                  </p>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#475569",
                      fontSize: 12,
                    }}
                  >
                    Contradictions are versioned, explained and preserved
                  </p>
                </div>

                <span
                  className="mono"
                  style={{
                    color: "#64748b",
                    fontSize: 9,
                    letterSpacing: "0.12em",
                  }}
                >
                  EVENT #0042
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)",
                  alignItems: "stretch",
                }}
              >
                <BeliefPanel
                  label="OLD BELIEF"
                  status="SUPERSEDED"
                  value="wooden_door.locked = true"
                  confidence="0.70"
                  tone="red"
                />

                <div
                  className="hidden md:flex"
                  style={{
                    width: 76,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      width: 38,
                      height: 38,
                      placeItems: "center",
                      borderRadius: "50%",
                      color: "#c4b5fd",
                      background: "rgba(124,58,237,0.12)",
                      border: "1px solid rgba(139,92,246,0.25)",
                      boxShadow: "0 0 24px rgba(124,58,237,0.14)",
                    }}
                  >
                    <ArrowRight size={17} />
                  </div>
                </div>

                <BeliefPanel
                  label="CORRECTED BELIEF"
                  status="ACTIVE"
                  value="wooden_door.locked = false"
                  confidence="0.95"
                  tone="green"
                />
              </div>

              <div
                style={{
                  padding: "13px 20px",
                  color: "#64748b",
                  fontSize: 12,
                  textAlign: "left",
                  background: "rgba(124,58,237,0.025)",
                  borderTop: "1px solid rgba(148,163,184,0.06)",
                }}
              >
                <span
                  className="mono"
                  style={{
                    marginRight: 8,
                    color: "#8b5cf6",
                    fontSize: 9,
                    letterSpacing: "0.12em",
                  }}
                >
                  REASON
                </span>
                The latest observation contradicted the previous door state.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface BeliefPanelProps {
  label: string;
  status: string;
  value: string;
  confidence: string;
  tone: "red" | "green";
}

function BeliefPanel({
  label,
  status,
  value,
  confidence,
  tone,
}: BeliefPanelProps) {
  const isRed = tone === "red";
  const accent = isRed ? "#f87171" : "#34d399";
  const background = isRed
    ? "rgba(239,68,68,0.035)"
    : "rgba(16,185,129,0.035)";

  return (
    <div
      style={{
        minWidth: 0,
        padding: "22px 24px",
        textAlign: "left",
        background,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className="mono"
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.14em",
          }}
        >
          {label}
        </p>

        <span
          className="mono"
          style={{
            padding: "5px 8px",
            borderRadius: 999,
            color: accent,
            fontSize: 8,
            fontWeight: 800,
            letterSpacing: "0.1em",
            background: isRed
              ? "rgba(239,68,68,0.08)"
              : "rgba(16,185,129,0.08)",
            border: `1px solid ${isRed ? "rgba(239,68,68,0.18)" : "rgba(16,185,129,0.18)"}`,
          }}
        >
          {status}
        </span>
      </div>

      <p
        className="mono"
        style={{
          margin: "17px 0 0",
          overflowWrap: "anywhere",
          color: accent,
          fontSize: 13,
          lineHeight: 1.55,
          textDecoration: isRed ? "line-through" : "none",
        }}
      >
        {value}
      </p>

      <div
        className="flex items-center justify-between"
        style={{ marginTop: 18 }}
      >
        <span
          className="mono"
          style={{
            color: "#475569",
            fontSize: 9,
            letterSpacing: "0.1em",
          }}
        >
          CONFIDENCE
        </span>

        <span
          className="mono"
          style={{
            color: "#94a3b8",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {confidence}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   FEATURES
   ========================================================= */

function FeaturesSection() {
  const cards = [
    {
      icon: Globe,
      color: "#6366f1",
      glow: "rgba(99,102,241,0.14)",
      title: "Structured Memory",
      description:
        "Rooms, objects, states and relationships persist as typed, human-readable facts.",
    },
    {
      icon: GitBranch,
      color: "#8b5cf6",
      glow: "rgba(139,92,246,0.14)",
      title: "Self-Correction",
      description:
        "Contradicted beliefs are versioned and superseded instead of silently overwritten.",
    },
    {
      icon: Layers,
      color: "#22d3ee",
      glow: "rgba(34,211,238,0.12)",
      title: "Bounded Context",
      description:
        "Only facts relevant to the current decision are supplied to the agent.",
    },
  ];

  return (
    <section
      id="features"
      className="section-pad relative overflow-hidden"
    >
      <div className="absolute inset-0">
        <StarField density={70} />
      </div>

      <div className="absolute inset-0 grid-bg opacity-20" />

      <div
        className="container relative z-10"
        style={{ maxWidth: 1120 }}
      >
        <SectionHeading
          eyebrow="CORE CAPABILITIES"
          title="A memory system built for reliable agents"
          description="MNEMOS separates memory, reasoning and correction into transparent components."
        />

        <div
          className="grid md:grid-cols-3"
          style={{
            gap: 20,
            marginTop: 46,
          }}
        >
          {cards.map((card) => (
            <article
              key={card.title}
              className="group"
              style={{
                position: "relative",
                minHeight: 260,
                overflow: "hidden",
                borderRadius: 20,
                padding: 26,
                background:
                  "linear-gradient(180deg, rgba(14,20,37,0.88), rgba(7,11,22,0.9))",
                border: "1px solid rgba(148,163,184,0.09)",
                boxShadow: "0 22px 65px rgba(0,0,0,0.25)",
                transition:
                  "transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 20% 15%, ${card.glow}, transparent 50%)`,
                }}
              />

              <div
                className="relative z-10"
                style={{
                  display: "flex",
                  height: "100%",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    width: 48,
                    height: 48,
                    placeItems: "center",
                    borderRadius: 14,
                    color: card.color,
                    background: card.glow,
                    border: `1px solid ${card.color}28`,
                  }}
                >
                  <card.icon size={21} />
                </div>

                <h3
                  style={{
                    margin: "30px 0 0",
                    color: "#f8fafc",
                    fontSize: 20,
                    fontWeight: 750,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {card.title}
                </h3>

                <p
                  style={{
                    margin: "12px 0 0",
                    color: "#66758c",
                    fontSize: 14,
                    lineHeight: 1.75,
                  }}
                >
                  {card.description}
                </p>

                <div
                  style={{
                    width: 34,
                    height: 2,
                    marginTop: "auto",
                    background: card.color,
                    boxShadow: `0 0 12px ${card.color}`,
                    opacity: 0.65,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   METRICS
   ========================================================= */

function MetricsPreview() {
  const metrics = [
    {
      label: "ACTIVE BELIEFS",
      value: "—",
      color: "#8b5cf6",
    },
    {
      label: "SUPERSEDED",
      value: "—",
      color: "#6366f1",
    },
    {
      label: "CONTEXT TOKENS",
      value: "—",
      color: "#22d3ee",
    },
    {
      label: "CORRECTIONS",
      value: "—",
      color: "#f59e0b",
    },
  ];

  return (
    <section
      id="metrics"
      className="section-pad relative overflow-hidden"
      style={{
        background: "rgba(1,4,10,0.72)",
        borderTop: "1px solid rgba(148,163,184,0.04)",
        borderBottom: "1px solid rgba(148,163,184,0.04)",
      }}
    >
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div
        className="container relative z-10"
        style={{ maxWidth: 1120 }}
      >
        <SectionHeading
          eyebrow="LIVE INSTRUMENTATION"
          title="Every important signal, visible"
          description="Dashboard values connect to live backend data when the agent is running."
        />

        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{
            gap: 16,
            marginTop: 46,
          }}
        >
          {metrics.map((metric) => (
            <div
              key={metric.label}
              style={{
                minHeight: 190,
                padding: 24,
                borderRadius: 18,
                textAlign: "left",
                background:
                  "linear-gradient(180deg, rgba(13,19,35,0.9), rgba(7,11,21,0.9))",
                border: `1px solid ${metric.color}24`,
                boxShadow: "0 20px 52px rgba(0,0,0,0.22)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  width: 36,
                  height: 36,
                  placeItems: "center",
                  borderRadius: 11,
                  background: `${metric.color}14`,
                  border: `1px solid ${metric.color}24`,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: metric.color,
                    boxShadow: `0 0 10px ${metric.color}`,
                  }}
                />
              </div>

              <p
                className="mono"
                style={{
                  margin: "30px 0 0",
                  color: "#f8fafc",
                  fontSize: "clamp(2rem, 5vw, 2.7rem)",
                  fontWeight: 850,
                  lineHeight: 1,
                }}
              >
                {metric.value}
              </p>

              <p
                className="mono"
                style={{
                  margin: "12px 0 0",
                  color: "#536176",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                }}
              >
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ARCHITECTURE / HOW IT WORKS
   ========================================================= */

function HowItWorks() {
  const steps = [
    {
      number: "01",
      label: "WORLD INPUT",
      description: "Text observation",
      color: "#22d3ee",
    },
    {
      number: "02",
      label: "EXTRACTOR",
      description: "Structured facts",
      color: "#6366f1",
    },
    {
      number: "03",
      label: "WORLD MODEL",
      description: "Belief store",
      color: "#8b5cf6",
    },
    {
      number: "04",
      label: "QUERY LAYER",
      description: "Relevant slice",
      color: "#a78bfa",
    },
    {
      number: "05",
      label: "SLM AGENT",
      description: "Next action",
      color: "#c4b5fd",
    },
    {
      number: "06",
      label: "ACTION",
      description: "Environment step",
      color: "#e2e8f0",
    },
    {
      number: "07",
      label: "UPDATER",
      description: "Belief correction",
      color: "#8b5cf6",
    },
  ];

  return (
    <section
      id="architecture"
      className="section-pad relative overflow-hidden"
    >
      <div className="absolute inset-0">
        <StarField density={55} />
      </div>

      <div
        id="how-it-works"
        className="container relative z-10"
        style={{ maxWidth: 1180 }}
      >
        <SectionHeading
          eyebrow="SYSTEM ARCHITECTURE"
          title="The MNEMOS reasoning loop"
          description="A bounded, transparent cycle that turns observations into corrected beliefs and informed actions."
        />

        <div
          style={{
            marginTop: 50,
            padding: 28,
            borderRadius: 22,
            background:
              "linear-gradient(180deg, rgba(12,18,34,0.9), rgba(6,10,20,0.92))",
            border: "1px solid rgba(148,163,184,0.08)",
            boxShadow: "0 26px 80px rgba(0,0,0,0.32)",
          }}
        >
          <div
            className="flex flex-wrap items-stretch justify-center"
            style={{ gap: 10 }}
          >
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="flex items-center"
                style={{ gap: 10 }}
              >
                <div
                  style={{
                    width: 124,
                    minHeight: 142,
                    padding: 16,
                    borderRadius: 16,
                    textAlign: "left",
                    background: "rgba(5,9,18,0.78)",
                    border: `1px solid ${step.color}24`,
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      color: step.color,
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {step.number}
                  </span>

                  <p
                    className="mono"
                    style={{
                      margin: "28px 0 0",
                      color: "#cbd5e1",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {step.label}
                  </p>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#475569",
                      fontSize: 11,
                      lineHeight: 1.5,
                    }}
                  >
                    {step.description}
                  </p>

                  <div
                    style={{
                      width: 28,
                      height: 2,
                      marginTop: 20,
                      background: step.color,
                      boxShadow: `0 0 10px ${step.color}`,
                    }}
                  />
                </div>

                {index < steps.length - 1 && (
                  <ArrowRight
                    className="hidden lg:block"
                    size={14}
                    style={{ color: "#334155" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   COMPARISON
   ========================================================= */

function Comparison() {
  const traditionalPoints = [
    "Sends complete interaction history every turn",
    "Context window grows continuously",
    "Contradictions remain hidden in old messages",
    "Token usage and latency increase over time",
  ];

  const mnemosPoints = [
    "Sends only the relevant world slice",
    "Context size remains bounded",
    "Beliefs are explicitly versioned and corrected",
    "Token usage remains predictable",
  ];

  return (
    <section
      className="section-pad relative overflow-hidden"
      style={{
        background: "rgba(1,4,10,0.68)",
      }}
    >
      <div
        className="container relative z-10"
        style={{ maxWidth: 960 }}
      >
        <SectionHeading
          eyebrow="COMPARISON"
          title="Built for controlled, auditable memory"
          description="MNEMOS replaces uncontrolled prompt growth with a structured and correctable world model."
        />

        <div
          className="grid md:grid-cols-2"
          style={{
            gap: 18,
            marginTop: 46,
          }}
        >
          <ComparisonCard
            title="TRADITIONAL AGENT"
            points={traditionalPoints}
            positive={false}
          />

          <ComparisonCard
            title="MNEMOS"
            points={mnemosPoints}
            positive
          />
        </div>
      </div>
    </section>
  );
}

interface ComparisonCardProps {
  title: string;
  points: string[];
  positive: boolean;
}

function ComparisonCard({
  title,
  points,
  positive,
}: ComparisonCardProps) {
  return (
    <article
      style={{
        padding: 28,
        borderRadius: 20,
        background: positive
          ? "linear-gradient(180deg, rgba(18,22,45,0.92), rgba(8,12,25,0.94))"
          : "linear-gradient(180deg, rgba(12,17,29,0.88), rgba(7,10,19,0.9))",
        border: positive
          ? "1px solid rgba(139,92,246,0.24)"
          : "1px solid rgba(148,163,184,0.08)",
        boxShadow: positive
          ? "0 22px 70px rgba(124,58,237,0.08)"
          : "0 22px 60px rgba(0,0,0,0.2)",
      }}
    >
      <p
        className="mono"
        style={{
          margin: 0,
          color: positive ? "#a78bfa" : "#64748b",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.14em",
        }}
      >
        {title}
      </p>

      <div
        style={{
          display: "grid",
          gap: 17,
          marginTop: 26,
        }}
      >
        {points.map((point) => (
          <div
            key={point}
            className="flex items-start"
            style={{ gap: 12 }}
          >
            {positive ? (
              <CheckCircle
                size={16}
                style={{
                  flexShrink: 0,
                  marginTop: 2,
                  color: "#34d399",
                }}
              />
            ) : (
              <XCircle
                size={16}
                style={{
                  flexShrink: 0,
                  marginTop: 2,
                  color: "#ef4444",
                }}
              />
            )}

            <p
              style={{
                margin: 0,
                color: positive ? "#94a3b8" : "#536176",
                fontSize: 13,
                lineHeight: 1.65,
              }}
            >
              {point}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

/* =========================================================
   CTA
   ========================================================= */

function CTA() {
  const navigate = useNavigate();

  return (
    <section
      className="section-pad relative overflow-hidden"
      style={{ paddingTop: 130, paddingBottom: 130 }}
    >
      <div className="absolute inset-0">
        <StarField density={100} />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.14), transparent 38%)",
        }}
      />

      <div
        className="container relative z-10"
        style={{
          maxWidth: 850,
          textAlign: "center",
        }}
      >
        <p className="label-overline">READY TO EXPERIENCE MNEMOS?</p>

        <h2
          style={{
            margin: "18px 0 0",
            color: "#ffffff",
            fontSize: "clamp(2.4rem, 6vw, 4.7rem)",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.055em",
          }}
        >
          Give autonomous agents
          <br />
          <span className="gradient-text">a memory they can correct.</span>
        </h2>

        <p
          style={{
            maxWidth: 580,
            margin: "24px auto 0",
            color: "#64748b",
            fontSize: 15,
            lineHeight: 1.7,
          }}
        >
          Explore the live agent loop, bounded context, belief corrections
          and real-time world model.
        </p>

        <div
          className="flex flex-wrap justify-center"
          style={{
            gap: 14,
            marginTop: 32,
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="btn-primary"
            style={{
              minHeight: 50,
              padding: "0 28px",
              fontSize: 14,
            }}
          >
            <Zap size={16} />
            Enter Demo
          </button>

          <a
            href="#architecture"
            className="btn-outline"
            style={{
              minHeight: 50,
              padding: "0 28px",
              fontSize: 14,
            }}
          >
            View Architecture
          </a>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FOOTER
   ========================================================= */

function Footer() {
  return (
    <footer
      style={{
        paddingTop: 52,
        paddingBottom: 34,
        background: "#02050b",
        borderTop: "1px solid rgba(148,163,184,0.06)",
      }}
    >
      <div
        className="container"
        style={{ maxWidth: 1120 }}
      >
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <MnemosLogo size={32} variant="full" />

            <p
              style={{
                maxWidth: 350,
                margin: "16px 0 0",
                color: "#475569",
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              A self-correcting, bounded-context world model for text-based
              autonomous agents.
            </p>
          </div>

          <FooterColumn
            title="PROJECT"
            items={[
              "HackTronix 2.0",
              "Track B — Artificial Intelligence",
              "Text World Agent",
              "Local-first",
            ]}
          />

          <FooterColumn
            title="RESOURCES"
            items={[
              "GitHub Repository",
              "Documentation",
            ]}
            links
          />
        </div>

        <div
          className="flex flex-wrap items-center justify-between"
          style={{
            gap: 16,
            marginTop: 44,
            paddingTop: 22,
            borderTop: "1px solid rgba(148,163,184,0.06)",
          }}
        >
          <p
            className="mono"
            style={{
              margin: 0,
              color: "#293548",
              fontSize: 9,
              letterSpacing: "0.11em",
            }}
          >
            © 2026 MNEMOS · HACKTRONIX 2.0
          </p>

          <p
            className="mono"
            style={{
              margin: 0,
              color: "#293548",
              fontSize: 9,
              letterSpacing: "0.11em",
            }}
          >
            LOCAL-FIRST · NO CLOUD · BOUNDED CONTEXT
          </p>
        </div>
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  title: string;
  items: string[];
  links?: boolean;
}

function FooterColumn({
  title,
  items,
  links = false,
}: FooterColumnProps) {
  return (
    <div>
      <p
        className="mono"
        style={{
          margin: 0,
          color: "#475569",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.14em",
        }}
      >
        {title}
      </p>

      <div
        style={{
          display: "grid",
          gap: 11,
          marginTop: 16,
        }}
      >
        {items.map((item) =>
          links ? (
            <a
              key={item}
              href="#"
              className="flex items-center gap-1"
              style={{
                color: "#475569",
                fontSize: 13,
                transition: "color 180ms ease",
              }}
            >
              {item}
              <ArrowUpRight size={11} />
            </a>
          ) : (
            <p
              key={item}
              style={{
                margin: 0,
                color: "#475569",
                fontSize: 13,
              }}
            >
              {item}
            </p>
          ),
        )}
      </div>
    </div>
  );
}

/* =========================================================
   REUSABLE SECTION HEADING
   ========================================================= */

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div
      style={{
        maxWidth: 720,
        marginInline: "auto",
        textAlign: "center",
      }}
    >
      <p className="label-overline">{eyebrow}</p>

      <h2
        style={{
          margin: "15px 0 0",
          color: "#ffffff",
          fontSize: "clamp(2rem, 4.6vw, 3.5rem)",
          fontWeight: 850,
          lineHeight: 1.06,
          letterSpacing: "-0.045em",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          maxWidth: 600,
          margin: "18px auto 0",
          color: "#64748b",
          fontSize: 14,
          lineHeight: 1.75,
        }}
      >
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

export function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
        background:
          "linear-gradient(180deg, #02050b 0%, #030711 48%, #02050b 100%)",
      }}
    >
      <Navbar />
      <Hero />
      <FeaturesSection />
      <MetricsPreview />
      <HowItWorks />
      <Comparison />
      <CTA />
      <Footer />
    </div>
  );
}