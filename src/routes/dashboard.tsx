import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, Users, Clock, LogOut, RefreshCw,
  MapPin, AlertTriangle, CheckCircle2, Sparkles, WifiOff,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface OutEntry {
  student_id: number;
  full_name: string;
  location_name: string;
  location_code: string;
  scanned_at: string;
}

function elapsed(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
}

function urgencyColor(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins >= 15) return "#ef4444";
  if (mins >= 8) return "#f97316";
  return "#22c55e";
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [outStudents, setOutStudents] = useState<OutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [noSchool, setNoSchool] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [, tick] = useState(0);

  // Live timers
  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Auth guard + load stored profile
  useEffect(() => {
    const token = localStorage.getItem("hg_token");
    const userData = localStorage.getItem("hg_user");
    if (!token || !userData) { navigate({ to: "/login" }); return; }
    setUser(JSON.parse(userData));
    setName(localStorage.getItem("hg_name") || "");
    setSchool(localStorage.getItem("hg_school") || "");
  }, []);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("hg_token");
    const userData = localStorage.getItem("hg_user");
    if (!token || !userData) return;

    const u = JSON.parse(userData);

    if (!u.schoolId) {
      setNoSchool(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/schools/${u.schoolId}/current-out`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { localStorage.clear(); navigate({ to: "/login" }); return; }
      const data = await res.json();
      setOutStudents(data.outOfClass || []);
      setApiError(false);
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
  }, [fetchData]);

  const signOut = () => {
    localStorage.clear();
    navigate({ to: "/login" });
  };

  const overdue = outStudents.filter(s =>
    Math.floor((Date.now() - new Date(s.scanned_at).getTime()) / 60000) >= 15
  );

  // First name only for greeting
  const firstName = name.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>

      {/* ── Top bar ── */}
      <header style={{
        background: "#1e293b", borderBottom: "1px solid #334155",
        padding: "0 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 64,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "linear-gradient(135deg, #1e3a5f, #0ea5e9)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ShieldCheck size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" }}>HallGuardian</span>
          {school && (
            <span style={{
              background: "#0f172a", color: "#64748b", fontSize: 11,
              padding: "2px 10px", borderRadius: 100, border: "1px solid #334155",
              fontWeight: 600,
            }}>
              {school}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#64748b", fontSize: 13 }}>{user?.email}</span>
          <button onClick={signOut} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "1px solid #334155", borderRadius: 8,
            padding: "7px 12px", color: "#94a3b8", fontSize: 13, cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94a3b8"; }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        {/* ── Greeting banner ── */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #0c2340 100%)",
          borderRadius: 20, padding: "28px 32px", marginBottom: 28,
          border: "1px solid #1e4976",
          position: "relative", overflow: "hidden",
        }}>
          {/* glow orb */}
          <div style={{
            position: "absolute", top: -40, right: -40, width: 200, height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Sparkles size={18} color="#0ea5e9" />
            <span style={{ color: "#7dd3fc", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }}>
              {getGreeting()}
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "#f8fafc", letterSpacing: "-0.03em" }}>
            Hello, {firstName}! 👋
          </h1>
          {school && (
            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
              Managing hall passes for <span style={{ color: "#94a3b8", fontWeight: 600 }}>{school}</span>
            </p>
          )}
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
          {[
            {
              label: "Students Out Now",
              value: loading ? "—" : outStudents.length,
              icon: Users,
              color: outStudents.length > 0 ? "#f97316" : "#22c55e",
              bg: outStudents.length > 0 ? "#7c2d1220" : "#14532d20",
            },
            {
              label: "Overdue (15+ min)",
              value: loading ? "—" : overdue.length,
              icon: AlertTriangle,
              color: overdue.length > 0 ? "#ef4444" : "#22c55e",
              bg: overdue.length > 0 ? "#7f1d1d20" : "#14532d20",
            },
            {
              label: "Last Refreshed",
              value: lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
              icon: Clock,
              color: "#38bdf8",
              bg: "#0369a120",
            },
          ].map(s => (
            <div key={s.label} style={{
              background: "#1e293b", borderRadius: 16, padding: "20px 24px",
              border: "1px solid #334155", display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: s.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <s.icon size={22} color={s.color} />
              </div>
              <div>
                <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{s.label}</div>
                <div style={{ color: s.color, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main panel ── */}
        <div style={{ background: "#1e293b", borderRadius: 20, border: "1px solid #334155", overflow: "hidden" }}>
          <div style={{
            padding: "20px 24px", borderBottom: "1px solid #334155",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>Students Currently Out</h2>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>Live · auto-refreshes every 15 s</p>
            </div>
            <button onClick={fetchData} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#0f172a", border: "1px solid #334155",
              borderRadius: 8, padding: "8px 14px", color: "#94a3b8",
              fontSize: 13, cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#0ea5e9"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Body */}
          {loading ? (
            <div style={{ padding: 64, textAlign: "center", color: "#475569" }}>Loading…</div>

          ) : apiError ? (
            <div style={{ padding: 64, textAlign: "center" }}>
              <WifiOff size={40} color="#334155" style={{ margin: "0 auto 16px", display: "block" }} />
              <p style={{ color: "#f97316", fontWeight: 600, marginBottom: 4 }}>Can't reach the backend</p>
              <p style={{ color: "#475569", fontSize: 13 }}>Make sure <code style={{ color: "#94a3b8" }}>node server.js</code> is running in the <code style={{ color: "#94a3b8" }}>HallGuardian/</code> folder.</p>
            </div>

          ) : noSchool ? (
            <div style={{ padding: 48, textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16, background: "#0369a120",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
              }}>
                <ShieldCheck size={28} color="#0ea5e9" />
              </div>
              <h3 style={{ margin: "0 0 8px", color: "#f1f5f9", fontSize: 18, fontWeight: 700 }}>
                Account created! One more step.
              </h3>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                Your account needs to be linked to a school before the dashboard shows live data.
                Ask your district IT admin to assign your account to a school, or use the mobile
                scanner app once your school is set up.
              </p>
              <div style={{
                background: "#0f172a", borderRadius: 12, padding: "16px 20px",
                border: "1px solid #334155", textAlign: "left",
              }}>
                <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, margin: "0 0 6px" }}>Your account details:</p>
                <p style={{ color: "#64748b", fontSize: 13, margin: "3px 0" }}>📧 {user?.email}</p>
                <p style={{ color: "#64748b", fontSize: 13, margin: "3px 0" }}>🏫 {school || "No school linked yet"}</p>
                <p style={{ color: "#64748b", fontSize: 13, margin: "3px 0" }}>🔑 Role: {user?.role}</p>
              </div>
            </div>

          ) : outStudents.length === 0 ? (
            <div style={{ padding: 64, textAlign: "center" }}>
              <CheckCircle2 size={44} color="#22c55e" style={{ margin: "0 auto 16px", display: "block" }} />
              <p style={{ color: "#22c55e", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>All students are in class! ✓</p>
              <p style={{ color: "#475569", fontSize: 13 }}>No active hall passes right now.</p>
            </div>

          ) : (
            outStudents.map((s, i) => {
              const color = urgencyColor(s.scanned_at);
              const mins = Math.floor((Date.now() - new Date(s.scanned_at).getTime()) / 60000);
              return (
                <div key={s.student_id} style={{
                  display: "flex", alignItems: "center",
                  padding: "16px 24px", gap: 16,
                  borderBottom: i < outStudents.length - 1 ? "1px solid #1e293b" : "none",
                  background: mins >= 15 ? "rgba(127,29,29,0.15)" : "transparent",
                  transition: "background 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = mins >= 15 ? "rgba(127,29,29,0.25)" : "#0f172a50"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = mins >= 15 ? "rgba(127,29,29,0.15)" : "transparent"; }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${color}20`, border: `2px solid ${color}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{ color, fontWeight: 700, fontSize: 14 }}>
                      {s.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 15, marginBottom: 2 }}>{s.full_name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: 13 }}>
                      <MapPin size={12} /> {s.location_name}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color, fontWeight: 800, fontSize: 20, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                      {elapsed(s.scanned_at)}
                    </div>
                    <div style={{ color: "#475569", fontSize: 11 }}>time out</div>
                  </div>

                  {mins >= 15 && (
                    <div style={{
                      background: "#7f1d1d", color: "#fca5a5",
                      padding: "4px 10px", borderRadius: 100,
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>OVERDUE</div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Quick links */}
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          {[
            { label: "← Back to Website", to: "/" },
            { label: "Features", to: "/features" },
            { label: "Contact Support", to: "/contact" },
          ].map(l => (
            <Link key={l.to} to={l.to} style={{
              color: "#475569", fontSize: 13, textDecoration: "none",
              padding: "7px 14px", border: "1px solid #334155", borderRadius: 8,
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e2e8f0"; (e.currentTarget as HTMLElement).style.borderColor = "#475569"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#475569"; (e.currentTarget as HTMLElement).style.borderColor = "#334155"; }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
