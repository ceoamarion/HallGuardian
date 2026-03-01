import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
    ShieldCheck, LogOut, RefreshCw, History,
    ArrowLeft, Clock, MapPin, CheckCircle, Circle,
    AlertCircle, ChevronLeft, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/passes")({
    component: PassHistoryPage,
});

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface Pass {
    pass_id: number;
    student_id: number;
    full_name: string;
    grade: string | null;
    location_name: string;
    location_code: string;
    out_at: string;
    in_at: string | null;
    duration_seconds: number | null;
    status: "ACTIVE" | "COMPLETED";
    scan_source: string;
}

function formatDuration(secs: number | null, outAt: string, status: string): string {
    if (status === "ACTIVE") {
        const elapsed = Math.floor((Date.now() - new Date(outAt).getTime()) / 1000);
        return formatSeconds(elapsed) + " (active)";
    }
    if (secs === null) return "—";
    return formatSeconds(secs);
}

function formatSeconds(secs: number): string {
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function fmtDate(iso: string): string {
    return new Date(iso).toLocaleString([], {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function durationColor(secs: number | null, status: string): string {
    if (status === "ACTIVE") return "#f97316";
    if (secs === null) return "#64748b";
    const mins = secs / 60;
    if (mins >= 15) return "#ef4444";
    if (mins >= 8) return "#f97316";
    return "#22c55e";
}

const PAGE_SIZE = 25;

export default function PassHistoryPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [school, setSchool] = useState("");
    const [passes, setPasses] = useState<Pass[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(false);
    const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
    const [searchQ, setSearchQ] = useState("");
    const [, tick] = useState(0);

    // Live tick for active passes
    useEffect(() => {
        const id = setInterval(() => tick(n => n + 1), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("hg_token");
        const userData = localStorage.getItem("hg_user");
        if (!token || !userData) { navigate({ to: "/login" }); return; }
        setUser(JSON.parse(userData));
        setSchool(localStorage.getItem("hg_school") || "");
    }, []);

    const fetchPasses = useCallback(async (pageNum = 0) => {
        const token = localStorage.getItem("hg_token");
        const userData = localStorage.getItem("hg_user");
        if (!token || !userData) return;
        const u = JSON.parse(userData);
        if (!u.schoolId) { setLoading(false); return; }

        setLoading(true);
        try {
            const res = await fetch(
                `${API}/api/schools/${u.schoolId}/pass-history?limit=${PAGE_SIZE}&offset=${pageNum * PAGE_SIZE}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.status === 401) { localStorage.clear(); navigate({ to: "/login" }); return; }
            const data = await res.json();
            setPasses(data.passes || []);
            setTotal(data.total || 0);
            setApiError(false);
        } catch {
            setApiError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPasses(page);
    }, [fetchPasses, page]);

    const signOut = () => { localStorage.clear(); navigate({ to: "/login" }); };

    const filtered = passes.filter(p => {
        if (filter !== "ALL" && p.status !== filter) return false;
        if (searchQ) {
            const q = searchQ.toLowerCase();
            return p.full_name.toLowerCase().includes(q) || p.location_name.toLowerCase().includes(q);
        }
        return true;
    });

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Inter', sans-serif", color: "#e2e8f0" }}>

            {/* Header */}
            <header style={{
                background: "#1e293b", borderBottom: "1px solid #334155",
                padding: "0 32px", display: "flex", alignItems: "center",
                justifyContent: "space-between", height: 64,
                position: "sticky", top: 0, zIndex: 50,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 9,
                        background: "linear-gradient(135deg, #1e3a5f, #0ea5e9)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <ShieldCheck size={18} color="#fff" />
                    </div>
                    <Link to="/dashboard" style={{
                        display: "flex", alignItems: "center", gap: 6,
                        color: "#94a3b8", fontSize: 13, textDecoration: "none", transition: "color 0.2s",
                    }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#e2e8f0"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#94a3b8"}
                    >
                        <ArrowLeft size={14} /> Dashboard
                    </Link>
                    <span style={{ color: "#334155", fontSize: 18 }}>/</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <History size={16} color="#0ea5e9" />
                        <span style={{ fontWeight: 700, fontSize: 16 }}>Pass History</span>
                    </div>
                    {school && (
                        <span style={{
                            background: "#0f172a", color: "#64748b", fontSize: 11,
                            padding: "2px 10px", borderRadius: 100, border: "1px solid #334155", fontWeight: 600,
                        }}>{school}</span>
                    )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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

            <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

                {/* Hero stat bar */}
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 16, marginBottom: 28,
                }}>
                    {[
                        { label: "Total Passes", value: total, color: "#38bdf8" },
                        { label: "Active Now", value: passes.filter(p => p.status === "ACTIVE").length, color: "#f97316" },
                        { label: "Completed Today", value: passes.filter(p => p.status === "COMPLETED" && new Date(p.out_at).toDateString() === new Date().toDateString()).length, color: "#22c55e" },
                        {
                            label: "Avg Duration",
                            value: (() => {
                                const completed = passes.filter(p => p.duration_seconds !== null);
                                if (!completed.length) return "—";
                                const avg = completed.reduce((a, b) => a + (b.duration_seconds ?? 0), 0) / completed.length;
                                return formatSeconds(Math.round(avg));
                            })(),
                            color: "#a78bfa",
                        },
                    ].map(s => (
                        <div key={s.label} style={{
                            background: "#1e293b", borderRadius: 14, padding: "18px 20px",
                            border: "1px solid #334155",
                        }}>
                            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</div>
                            <div style={{ color: s.color, fontSize: 22, fontWeight: 800 }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search student or location…"
                        value={searchQ}
                        onChange={e => setSearchQ(e.target.value)}
                        style={{
                            flex: "1 1 200px", background: "#1e293b", border: "1px solid #334155",
                            borderRadius: 10, padding: "9px 14px", color: "#f1f5f9",
                            fontSize: 14, outline: "none",
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = "#0ea5e9"}
                        onBlur={e => e.currentTarget.style.borderColor = "#334155"}
                    />
                    {/* Status tabs */}
                    {(["ALL", "ACTIVE", "COMPLETED"] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            padding: "8px 16px", borderRadius: 8, border: "1px solid",
                            borderColor: filter === f ? "#0ea5e9" : "#334155",
                            background: filter === f ? "#0369a130" : "#1e293b",
                            color: filter === f ? "#7dd3fc" : "#94a3b8",
                            fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                        }}>{f}</button>
                    ))}
                    <button onClick={() => fetchPasses(page)} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "#1e293b", border: "1px solid #334155",
                        borderRadius: 8, padding: "8px 14px", color: "#94a3b8",
                        fontSize: 13, cursor: "pointer", transition: "all 0.2s", marginLeft: "auto",
                    }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#0ea5e9"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#334155"}
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Table */}
                <div style={{ background: "#1e293b", borderRadius: 20, border: "1px solid #334155", overflow: "hidden" }}>

                    {/* Header row */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1.2fr 1.4fr 1.4fr 1.1fr 80px",
                        padding: "12px 24px",
                        borderBottom: "1px solid #334155",
                        background: "#0f172a",
                    }}>
                        {["Student", "Location", "Left Class", "Returned", "Duration", "Status"].map(h => (
                            <div key={h} style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ padding: 60, textAlign: "center", color: "#475569" }}>Loading…</div>
                    ) : apiError ? (
                        <div style={{ padding: 60, textAlign: "center" }}>
                            <AlertCircle size={36} color="#ef4444" style={{ margin: "0 auto 12px", display: "block" }} />
                            <p style={{ color: "#ef4444" }}>Could not load pass history</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: 60, textAlign: "center" }}>
                            <History size={36} color="#334155" style={{ margin: "0 auto 12px", display: "block" }} />
                            <p style={{ color: "#475569" }}>No passes found</p>
                        </div>
                    ) : (
                        filtered.map((p, i) => {
                            const durColor = durationColor(p.duration_seconds, p.status);
                            return (
                                <div key={p.pass_id} style={{
                                    display: "grid",
                                    gridTemplateColumns: "2fr 1.2fr 1.4fr 1.4fr 1.1fr 80px",
                                    padding: "14px 24px",
                                    borderBottom: i < filtered.length - 1 ? "1px solid #0f172a" : "none",
                                    alignItems: "center",
                                    transition: "background 0.15s",
                                    background: p.status === "ACTIVE" ? "rgba(249,115,22,0.04)" : "transparent",
                                }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#0f172a40"}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = p.status === "ACTIVE" ? "rgba(249,115,22,0.04)" : "transparent"}
                                >
                                    {/* Student */}
                                    <div>
                                        <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>{p.full_name}</div>
                                        {p.grade && <div style={{ color: "#64748b", fontSize: 12 }}>Grade {p.grade}</div>}
                                    </div>

                                    {/* Location */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: 13 }}>
                                        <MapPin size={12} color="#64748b" />
                                        {p.location_name}
                                    </div>

                                    {/* Left class at */}
                                    <div style={{ color: "#94a3b8", fontSize: 13 }}>
                                        <Clock size={12} style={{ marginRight: 4, verticalAlign: "middle", color: "#64748b" }} />
                                        {fmtDate(p.out_at)}
                                    </div>

                                    {/* Returned at */}
                                    <div style={{ color: p.in_at ? "#94a3b8" : "#475569", fontSize: 13 }}>
                                        {p.in_at ? (
                                            <>
                                                <CheckCircle size={12} style={{ marginRight: 4, verticalAlign: "middle", color: "#22c55e" }} />
                                                {fmtDate(p.in_at)}
                                            </>
                                        ) : (
                                            <>
                                                <Circle size={12} style={{ marginRight: 4, verticalAlign: "middle", color: "#f97316" }} />
                                                Still out
                                            </>
                                        )}
                                    </div>

                                    {/* Duration */}
                                    <div style={{ color: durColor, fontWeight: 700, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
                                        {formatDuration(p.duration_seconds, p.out_at, p.status)}
                                    </div>

                                    {/* Status badge */}
                                    <div>
                                        <span style={{
                                            padding: "3px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700,
                                            background: p.status === "ACTIVE" ? "#431407" : "#14532d30",
                                            color: p.status === "ACTIVE" ? "#fed7aa" : "#4ade80",
                                        }}>
                                            {p.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{
                            display: "flex", alignItems: "center", gap: 4,
                            background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
                            padding: "7px 14px", color: page === 0 ? "#334155" : "#94a3b8",
                            fontSize: 13, cursor: page === 0 ? "not-allowed" : "pointer",
                        }}>
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <span style={{ color: "#64748b", fontSize: 13 }}>Page {page + 1} of {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{
                            display: "flex", alignItems: "center", gap: 4,
                            background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
                            padding: "7px 14px", color: page === totalPages - 1 ? "#334155" : "#94a3b8",
                            fontSize: 13, cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
                        }}>
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
