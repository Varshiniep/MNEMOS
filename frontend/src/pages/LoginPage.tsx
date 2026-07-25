import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  Eye,
  EyeOff,
  GitBranch,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

import {
  loginAsDemo,
  loginWithCredentials,
} from "../hooks/useAuth";

import { MnemosLogo } from "../components/brand/MnemosLogo";
import { NodeGraph } from "../components/brand/NodeGraph";
import { StarField } from "../components/brand/StarField";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  setLoading(true);
  setError("");

  try {
    const result = await loginWithCredentials(
      email,
      password
    );

    if (!result.ok) {
  setError(
    "message" in result && typeof result.message === "string"
      ? result.message
      : "Login failed"
  );
  return;
}

    navigate("/dashboard");
  } catch {
    setError("Login failed");
  } finally {
    setLoading(false);
  }
};

  const handleDemo = () => {
    loginAsDemo();
    navigate("/dashboard");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #02050b 0%, #030711 48%, #02040a 100%)",
      }}
    >
      <div
        className="grid min-h-screen lg:grid-cols-2"
        style={{ position: "relative" }}
      >
        {/* =====================================================
            LEFT BRAND PANEL
            ===================================================== */}

        <section
          className="hidden lg:flex relative flex-col overflow-hidden"
          style={{
            minHeight: "100vh",
            padding: "44px 56px",
            background:
              "linear-gradient(160deg, rgba(8,12,25,0.98), rgba(3,6,15,0.99))",
            borderRight:
              "1px solid rgba(148,163,184,0.07)",
          }}
        >
          <div className="absolute inset-0">
            <StarField density={150} />
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 35% 40%, rgba(124,58,237,0.15), transparent 37%), radial-gradient(circle at 70% 75%, rgba(34,211,238,0.06), transparent 34%)",
            }}
          />

          <div
            className="absolute inset-0 grid-bg opacity-20 pointer-events-none"
            aria-hidden="true"
          />

          {/* Logo */}
          <div className="relative z-10">
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="Return to MNEMOS home"
              style={{
                padding: 0,
                border: 0,
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <MnemosLogo
                size={40}
                variant="full"
              />
            </button>
          </div>

          {/* Main visual content */}
          <div
            className="relative z-10 flex flex-1 flex-col justify-center"
            style={{
              width: "100%",
              maxWidth: 610,
              marginInline: "auto",
              paddingTop: 38,
              paddingBottom: 32,
            }}
          >
            <div
              className="inline-flex items-center gap-2 self-start rounded-full"
              style={{
                padding: "7px 11px",
                marginBottom: 24,
                color: "#a78bfa",
                background: "rgba(124,58,237,0.08)",
                border:
                  "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <Sparkles size={12} />

              <span
                className="mono"
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                }}
              >
                RESEARCH PREVIEW
              </span>
            </div>

            <h1
              style={{
                maxWidth: 560,
                margin: 0,
                color: "#ffffff",
                fontSize:
                  "clamp(2.6rem, 4.1vw, 4.35rem)",
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: "-0.055em",
              }}
            >
              The memory layer
              <br />
              autonomous agents
              <br />
              <span className="gradient-text">
                deserve.
              </span>
            </h1>

            <p
              style={{
                maxWidth: 500,
                margin: "22px 0 0",
                color: "#64748b",
                fontSize: 15,
                lineHeight: 1.75,
              }}
            >
              MNEMOS creates structured,
              bounded and self-correcting world
              models—eliminating context bloat,
              hidden contradictions and
              uncontrolled prompt growth.
            </p>

            {/* Graph */}
            <div
              style={{
                position: "relative",
                marginTop: 36,
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderRadius: 24,
                  background:
                    "rgba(124,58,237,0.13)",
                  filter: "blur(42px)",
                  transform: "scale(0.88)",
                }}
              />

              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 22,
                  padding: 1,
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.35), rgba(34,211,238,0.1), rgba(255,255,255,0.04))",
                  boxShadow:
                    "0 28px 75px rgba(0,0,0,0.38)",
                }}
              >
                <div
                  style={{
                    overflow: "hidden",
                    borderRadius: 21,
                    padding: "17px 17px 12px",
                    background:
                      "linear-gradient(180deg, rgba(12,17,32,0.96), rgba(5,9,18,0.98))",
                  }}
                >
                  <div
                    className="flex items-center justify-between"
                    style={{ marginBottom: 10 }}
                  >
                    <div>
                      <p
                        className="mono"
                        style={{
                          margin: 0,
                          color: "#c4b5fd",
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: "0.13em",
                        }}
                      >
                        LIVE WORLD MODEL
                      </p>

                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#475569",
                          fontSize: 11,
                        }}
                      >
                        Structured beliefs and
                        relationships
                      </p>
                    </div>

                    <div
                      className="mono"
                      style={{
                        padding: "6px 9px",
                        borderRadius: 999,
                        color: "#34d399",
                        fontSize: 8,
                        letterSpacing: "0.12em",
                        background:
                          "rgba(16,185,129,0.08)",
                        border:
                          "1px solid rgba(16,185,129,0.17)",
                      }}
                    >
                      ACTIVE
                    </div>
                  </div>

                  <div
                    style={{
                      overflow: "hidden",
                      minHeight: 225,
                      borderRadius: 16,
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.08), transparent 48%), rgba(2,6,14,0.7)",
                      border:
                        "1px solid rgba(148,163,184,0.06)",
                    }}
                  >
                    <NodeGraph
                      width={500}
                      height={225}
                      animate
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Capability items */}
            <div
              className="grid grid-cols-3"
              style={{
                gap: 12,
                marginTop: 18,
              }}
            >
              <CapabilityCard
                icon={Brain}
                colour="#8b5cf6"
                title="Bounded Context"
                description="Relevant facts only"
              />

              <CapabilityCard
                icon={GitBranch}
                colour="#22d3ee"
                title="Versioned Beliefs"
                description="Corrections preserved"
              />

              <CapabilityCard
                icon={Shield}
                colour="#f59e0b"
                title="Auditable"
                description="Reasoning stays visible"
              />
            </div>
          </div>

          <div
            className="relative z-10 mono"
            style={{
              color: "#293548",
              fontSize: 8,
              letterSpacing: "0.14em",
            }}
          >
            HACKTRONIX 2.0 · TRACK B —
            ARTIFICIAL INTELLIGENCE · LOCAL-FIRST
          </div>
        </section>

        {/* =====================================================
            RIGHT LOGIN PANEL
            ===================================================== */}

        <section
          className="relative flex min-h-screen items-center justify-center"
          style={{
            padding: "96px 24px 48px",
          }}
        >
          <div className="absolute inset-0">
            <StarField density={70} />
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 78% 18%, rgba(124,58,237,0.12), transparent 34%), radial-gradient(circle at 35% 75%, rgba(34,211,238,0.04), transparent 30%)",
            }}
          />

          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute left-6 top-6 z-20 flex items-center gap-2"
            style={{
              padding: "8px 12px",
              color: "#64748b",
              fontSize: 12,
              background: "rgba(8,13,25,0.65)",
              border:
                "1px solid rgba(148,163,184,0.08)",
              borderRadius: 10,
              backdropFilter: "blur(12px)",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div
            className="relative z-10"
            style={{
              width: "100%",
              maxWidth: 480,
            }}
          >
            <div
              className="lg:hidden"
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 30,
              }}
            >
              <MnemosLogo
                size={42}
                variant="full"
              />
            </div>

            {/* Login card */}
            <div
              style={{
                position: "relative",
                padding: 1,
                borderRadius: 26,
                background:
                  "linear-gradient(145deg, rgba(139,92,246,0.28), rgba(148,163,184,0.08), rgba(34,211,238,0.08))",
                boxShadow:
                  "0 36px 100px rgba(0,0,0,0.48), 0 0 60px rgba(124,58,237,0.06)",
              }}
            >
              <div
                style={{
                  borderRadius: 25,
                  padding:
                    "clamp(26px, 5vw, 42px)",
                  background:
                    "linear-gradient(180deg, rgba(12,17,31,0.94), rgba(6,10,20,0.97))",
                  backdropFilter: "blur(24px)",
                }}
              >
                <div>
                  <p
                    className="label-overline"
                    style={{
                      marginBottom: 12,
                      color: "#8b5cf6",
                    }}
                  >
                    MNEMOS RESEARCH CONSOLE
                  </p>

                  <h2
                    style={{
                      margin: 0,
                      color: "#ffffff",
                      fontSize:
                        "clamp(2rem, 5vw, 2.8rem)",
                      fontWeight: 850,
                      lineHeight: 1.05,
                      letterSpacing: "-0.045em",
                    }}
                  >
                    Welcome back.
                  </h2>

                  <p
                    style={{
                      margin: "13px 0 0",
                      color: "#64748b",
                      fontSize: 14,
                      lineHeight: 1.65,
                    }}
                  >
                    Authenticate to inspect the
                    live world model, belief
                    corrections and agent
                    reasoning.
                  </p>
                </div>

                {/* Demo credentials */}
                <div
                  style={{
                    marginTop: 27,
                    padding: "15px 16px",
                    borderRadius: 14,
                    background:
                      "rgba(99,102,241,0.055)",
                    border:
                      "1px solid rgba(99,102,241,0.17)",
                  }}
                >
                  <div
                    className="flex items-center justify-between"
                    style={{ gap: 12 }}
                  >
                    <div>
                      <p
                        className="mono"
                        style={{
                          margin: 0,
                          color: "#818cf8",
                          fontSize: 8,
                          fontWeight: 800,
                          letterSpacing: "0.15em",
                        }}
                      >
                        DEMO CREDENTIALS
                      </p>

                      <p
                        className="mono"
                        style={{
                          margin: "7px 0 0",
                          color: "#94a3b8",
                          fontSize: 11,
                        }}
                      >
                        demo@mnemos.ai
                      </p>

                      <p
                        className="mono"
                        style={{
                          margin: "3px 0 0",
                          color: "#64748b",
                          fontSize: 11,
                        }}
                      >
                        mnemos123
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEmail(
                          "demo@mnemos.ai",
                        );
                        setPassword("mnemos123");
                        setError("");
                      }}
                      style={{
                        padding: "8px 11px",
                        color: "#c4b5fd",
                        fontSize: 10,
                        fontWeight: 700,
                        background:
                          "rgba(124,58,237,0.1)",
                        border:
                          "1px solid rgba(139,92,246,0.2)",
                        borderRadius: 9,
                        cursor: "pointer",
                      }}
                    >
                      Autofill
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  style={{
                    display: "grid",
                    gap: 19,
                    marginTop: 27,
                  }}
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="mono"
                      style={{
                        display: "block",
                        marginBottom: 8,
                        color: "#64748b",
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: "0.12em",
                      }}
                    >
                      EMAIL ADDRESS
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(
                          event.target.value,
                        );
                        setError("");
                      }}
                      placeholder="demo@mnemos.ai"
                      required
                      autoComplete="email"
                      className="input-dark"
                      style={{
                        width: "100%",
                        height: 54,
                        borderRadius: 13,
                        paddingInline: 16,
                        color: "#e2e8f0",
                        fontSize: 14,
                        background:
                          "rgba(3,7,15,0.8)",
                        border:
                          "1px solid rgba(148,163,184,0.1)",
                      }}
                    />
                  </div>

                  <div>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: 8 }}
                    >
                      <label
                        htmlFor="password"
                        className="mono"
                        style={{
                          color: "#64748b",
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: "0.12em",
                        }}
                      >
                        PASSWORD
                      </label>

                      <span
                        style={{
                          color: "#334155",
                          fontSize: 10,
                        }}
                      >
                        Demo access only
                      </span>
                    </div>

                    <div
                      style={{ position: "relative" }}
                    >
                      <input
                        id="password"
                        type={
                          showPass
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(event) => {
                          setPassword(
                            event.target.value,
                          );
                          setError("");
                        }}
                        placeholder="••••••••"
                        required
                        autoComplete="current-password"
                        className="input-dark"
                        style={{
                          width: "100%",
                          height: 54,
                          borderRadius: 13,
                          paddingLeft: 16,
                          paddingRight: 48,
                          color: "#e2e8f0",
                          fontSize: 14,
                          background:
                            "rgba(3,7,15,0.8)",
                          border:
                            "1px solid rgba(148,163,184,0.1)",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPass(
                            (previous) =>
                              !previous,
                          )
                        }
                        aria-label={
                          showPass
                            ? "Hide password"
                            : "Show password"
                        }
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: 13,
                          display: "grid",
                          width: 30,
                          height: 30,
                          placeItems: "center",
                          color: "#64748b",
                          background:
                            "transparent",
                          border: 0,
                          transform:
                            "translateY(-50%)",
                          cursor: "pointer",
                        }}
                      >
                        {showPass ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      style={{
                        padding: "11px 13px",
                        borderRadius: 11,
                        background:
                          "rgba(239,68,68,0.065)",
                        border:
                          "1px solid rgba(239,68,68,0.18)",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: "#f87171",
                          fontSize: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        {error}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      minHeight: 54,
                      justifyContent: "center",
                      marginTop: 2,
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: "0.03em",
                      opacity: loading ? 0.78 : 1,
                      cursor: loading
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="animate-spin"
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border:
                              "2px solid rgba(255,255,255,0.35)",
                            borderTopColor:
                              "#ffffff",
                          }}
                        />
                        Signing in…
                      </>
                    ) : (
                      <>
                        <Shield size={16} />
                        Sign In
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div
                  className="flex items-center"
                  style={{
                    gap: 13,
                    marginTop: 24,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background:
                        "rgba(148,163,184,0.07)",
                    }}
                  />

                  <span
                    className="mono"
                    style={{
                      color: "#334155",
                      fontSize: 8,
                      letterSpacing: "0.13em",
                    }}
                  >
                    OR
                  </span>

                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background:
                        "rgba(148,163,184,0.07)",
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDemo}
                  className="btn-outline"
                  style={{
                    width: "100%",
                    minHeight: 52,
                    justifyContent: "center",
                    marginTop: 22,
                    fontSize: 13,
                    fontWeight: 750,
                  }}
                >
                  <Zap
                    size={15}
                    style={{ color: "#a78bfa" }}
                  />
                  Continue as Demo User
                </button>

                <div
                  style={{
                    marginTop: 26,
                    paddingTop: 20,
                    textAlign: "center",
                    borderTop:
                      "1px solid rgba(148,163,184,0.06)",
                  }}
                >
                  <p
                    className="mono"
                    style={{
                      margin: 0,
                      color: "#334155",
                      fontSize: 8,
                      lineHeight: 1.8,
                      letterSpacing: "0.1em",
                    }}
                  >
                    HACKTRONIX 2.0 · TRACK B
                    <br />
                    LOCAL-FIRST · OFFLINE-READY ·
                    TRANSPARENT REASONING
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

interface CapabilityCardProps {
  icon: typeof Brain;
  colour: string;
  title: string;
  description: string;
}

function CapabilityCard({
  icon: Icon,
  colour,
  title,
  description,
}: CapabilityCardProps) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: "14px 13px",
        borderRadius: 14,
        background:
          "rgba(8,13,25,0.72)",
        border:
          "1px solid rgba(148,163,184,0.07)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          display: "grid",
          width: 31,
          height: 31,
          placeItems: "center",
          borderRadius: 9,
          color: colour,
          background: `${colour}13`,
          border: `1px solid ${colour}22`,
        }}
      >
        <Icon size={14} />
      </div>

      <p
        style={{
          margin: "12px 0 0",
          color: "#cbd5e1",
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {title}
      </p>

      <p
        style={{
          margin: "5px 0 0",
          color: "#475569",
          fontSize: 9,
          lineHeight: 1.45,
        }}
      >
        {description}
      </p>
    </div>
  );
}