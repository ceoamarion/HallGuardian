import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
    ShieldCheck, LogOut, Users, ArrowLeft,
    MapPin, Clock, CheckCircle2, AlertTriangle,
    Search, QrCode, CreditCard, ChevronDown, ChevronUp,
} from "lucide-react";

export const Route = createFileRoute("/students")({
    component: StudentRosterPage,
});

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface Student {
    id: number;
    full_name: string;
    grade: string | null;
    school_id_no: string;
    qr_value: string | null;
    card_uid: string | null;
    status: "IN_CLASS" | "OUT" | "NO_SCANS";
    last_scan_at: string | null;
    last_location: { name: string; code: string } | null;
}

interface PassEntry {
    pass_id: number;
    location_name: string;
    out_at: string;
    in_at: string | null;
    duration_seconds: number | null;
    status: "ACTIVE" | "COMPLETED";
}

function elapsed(iso: string): string {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return `${secs}s`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function formatDur(secs: number | null, status: string, outAt: string): string {
    if (status === "ACTIVE") return elapsed(outAt) + " ⏳";
    if (secs === null) return "—";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function fmtDate(iso: string): string {
    return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function statusColor(status: string): string {
    if (status === "OUT") return "#f97316";
    if (status === "IN_CLASS") return "#22c55e";
    return "#64748b";
}

function statusLabel(status: string): string {
    if (status === "OUT") return "Out of Class";
    if (status === "IN_CLASS") return "In Class";
    return "No Scans";
}

function statusIcon(status: string) {
    if (status === "OUT") return <AlertTriangle size={13} />;
    if (status === "IN_CLASS") return <CheckCircle2 size={13} />;
    return <Clock size={13} />;
}

export default function StudentRosterPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [school, setSchool] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQ, setSearchQ] = useState("");
    const [filterStatus, setFilterStatus] = useState<"ALL" | "OUT" | "IN_CLASS" | "NO_SCANS">("ALL");
    const [filterGrade, setFilterGrade] = useState("ALL");
    const [sortBy, setSortBy] = useState<"name" | "status" | "grade">("name");
    const [sortAsc, setSortAsc] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [passes, setPasses] = useState<Record<number, PassEntry[]>>({});
    const [loadingPasses, setLoadingPasses] = useState<number | null>(null);
    const [, tick] = useState(0);

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

    const fetchRoster = useCallback(async () => {
        const token = localStorage.getItem("hg_token");
        const userData = localStorage.getItem("hg_user");
        if (!token || !userData) return;
        const u = JSON.parse(userData);
        if (!u.schoolId) { setLoading(false); return; }

        setLoading(true);
        try {
            const res = await fetch(`${API}/api/schools/${u.schoolId}/roster`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) { localStorage.clear(); navigate({ to: "/login" }); return; }
            const data = await res.json();
            setStudents(data.students || []);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRoster(); }, [fetchRoster]);

    const loadStudentPasses = async (studentId: number) => {
        if (passes[studentId]) return; // already loaded
        const token = localStorage.getItem("hg_token");
        if (!token) return;
        setLoadingPasses(studentId);
        try {
            const res = await fetch(`${API}/api/students/${studentId}/pass-history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setPasses(p => ({ ...p, [studentId]: data.passes || [] }));
        } finally {
            setLoadingPasses(null);
        }
    };

    const toggleExpand = (id: number) => {
        if (expanded === id) {
            setExpanded(null);
        } else {
            setExpanded(id);
            loadStudentPasses(id);
        }
    };

    const signOut = () => { localStorage.clear(); navigate({ to: "/login" }); };

    // Filter & sort
    const grades = [...new Set(students.map(s => s.grade).filter(Boolean))] as string[];
    grades.sort();

    const toggleSort = (field: typeof sortBy) => {
        if (sortBy === field) setSortAsc(a => !a);
        else { setSortBy(field); setSortAsc(true); }
    };

    const filtered = students
        .filter(s => {
            if (filterStatus !== "ALL" && s.status !== filterStatus) return false;
            if (filterGrade !== "ALL" && s.grade !== filterGrade) return false;
            if (searchQ) {
                const q = searchQ.toLowerCase();
                return s.full_name.toLowerCase().includes(q) ||
                    s.school_id_no?.toLowerCase().includes(q);
            }
            return true;
        })
        .sort((a, b) => {
            let cmp = 0;
            if (sortBy === "name") cmp = a.full_name.localeCompare(b.full_name);
            else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
            else if (sortBy === "grade") cmp = (a.grade || "").localeCompare(b.grade || "");
            return sortAsc ? cmp : -cmp;
        });

    const outCount = students.filter(s => s.status === "OUT").length;
    const inCount = students.filter(s => s.status === "IN_CLASS").length;

    function SortIcon({ field }: { field: typeof sortBy }) {
        if (sortBy !== field) return null;
        return sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
    }

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
                        <Users size={16} color="#0ea5e9" />
                        <span style={{ fontWeight: 700, fontSize: 16 }}>Student Roster</span>
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

                {/* Stats */}
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 14, marginBottom: 24,
                }}>
                    {[
                        { label: "Total Students", value: students.length, color: "#38bdf8" },
                        { label: "In Class", value: inCount, color: "#22c55e" },
                        { label: "Out Now", value: outCount, color: outCount > 0 ? "#f97316" : "#22c55e" },
                        { label: "No Scans", value: students.filter(s => s.status === "NO_SCANS").length, color: "#64748b" },
                    ].map(s => (
                        <div key={s.label} style={{
                            background: "#1e293b", borderRadius: 14, padding: "16px 20px",
                            border: "1px solid #334155",
                        }}>
                            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</div>
                            <div style={{ color: s.color, fontSize: 22, fontWeight: 800 }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                    {/* Search */}
                    <div style={{ position: "relative", flex: "1 1 200px" }}>
                        <Search size={14} color="#475569" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                        <input
                            type="text"
                            placeholder="Search by name or student ID…"
                            value={searchQ}
                            onChange={e => setSearchQ(e.target.value)}
                            style={{
                                width: "100%", boxSizing: "border-box",
                                background: "#1e293b", border: "1px solid #334155",
                                borderRadius: 10, padding: "9px 14px 9px 34px", color: "#f1f5f9",
                                fontSize: 14, outline: "none",
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = "#0ea5e9"}
                            onBlur={e => e.currentTarget.style.borderColor = "#334155"}
                        />
                    </div>

                    {/* Status filter */}
                    {(["ALL", "OUT", "IN_CLASS", "NO_SCANS"] as const).map(f => (
                        <button key={f} onClick={() => setFilterStatus(f)} style={{
                            padding: "8px 14px", borderRadius: 8, border: "1px solid",
                            borderColor: filterStatus === f ? "#0ea5e9" : "#334155",
                            background: filterStatus === f ? "#0369a130" : "#1e293b",
                            color: filterStatus === f ? "#7dd3fc" : "#94a3b8",
                            fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                        }}>
                            {f === "IN_CLASS" ? "In Class" : f === "NO_SCANS" ? "No Scans" : f}
                        </button>
                    ))}

                    {/* Grade filter */}
                    {grades.length > 0 && (
                        <select
                            value={filterGrade}
                            onChange={e => setFilterGrade(e.target.value)}
                            style={{
                                background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
                                padding: "8px 12px", color: "#94a3b8", fontSize: 12, cursor: "pointer",
                            }}
                        >
                            <option value="ALL">All Grades</option>
                            {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
                        </select>
                    )}
                </div>

                {/* Roster table */}
                <div style={{ background: "#1e293b", borderRadius: 20, border: "1px solid #334155", overflow: "hidden" }}>
                    {/* Header */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1.5fr 1.2fr 40px",
                        padding: "12px 24px",
                        background: "#0f172a",
                        borderBottom: "1px solid #334155",
                    }}>
                        {[
                            { label: "Student", field: "name" as const },
                            { label: "Grade", field: "grade" as const },
                            { label: "Status", field: "status" as const },
                            { label: "Last Seen", field: null },
                            { label: "", field: null },
                        ].map(({ label, field }) => (
                            <div
                                key={label}
                                onClick={() => field && toggleSort(field)}
                                style={{
                                    color: "#64748b", fontSize: 11, fontWeight: 700,
                                    textTransform: "uppercase", letterSpacing: "0.05em",
                                    cursor: field ? "pointer" : "default",
                                    display: "flex", alignItems: "center", gap: 4,
                                    userSelect: "none",
                                }}
                            >
                                {label}
                                {field && <SortIcon field={field} />}
                            </div>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ padding: 60, textAlign: "center", color: "#475569" }}>Loading roster…</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: 60, textAlign: "center" }}>
                            <Users size={36} color="#334155" style={{ margin: "0 auto 12px", display: "block" }} />
                            <p style={{ color: "#475569" }}>No students found</p>
                        </div>
                    ) : (
                        filtered.map((s, i) => {
                            const color = statusColor(s.status);
                            const isOpen = expanded === s.id;
                            const studentPasses = passes[s.id] || [];
                            const isLoadingPasses = loadingPasses === s.id;

                            return (
                                <div key={s.id}>
                                    {/* Student row */}
                                    <div
                                        onClick={() => toggleExpand(s.id)}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "2fr 1fr 1.5fr 1.2fr 40px",
                                            padding: "14px 24px",
                                            borderBottom: i < filtered.length - 1 || isOpen ? "1px solid #0f172a" : "none",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            background: s.status === "OUT"
                                                ? "rgba(249,115,22,0.04)"
                                                : isOpen ? "#0f172a30" : "transparent",
                                            transition: "background 0.15s",
                                        }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#0f172a50"}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background =
                                            s.status === "OUT" ? "rgba(249,115,22,0.04)" : isOpen ? "#0f172a30" : "transparent"}
                                    >
                                        {/* Name + credentials */}
                                        <div>
                                            <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14, marginBottom: 2 }}>{s.full_name}</div>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <span style={{ color: "#475569", fontSize: 11 }}>#{s.school_id_no}</span>
                                                {s.qr_value && <QrCode size={10} color="#334155" />}
                                                {s.card_uid && <CreditCard size={10} color="#334155" />}
                                            </div>
                                        </div>

                                        {/* Grade */}
                                        <div style={{ color: "#94a3b8", fontSize: 13 }}>
                                            {s.grade ? `Grade ${s.grade}` : "—"}
                                        </div>

                                        {/* Status */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: 4,
                                                padding: "3px 10px", borderRadius: 100,
                                                background: `${color}15`,
                                                color, fontSize: 12, fontWeight: 600,
                                                border: `1px solid ${color}30`,
                                            }}>
                                                {statusIcon(s.status)}
                                                {statusLabel(s.status)}
                                            </span>
                                            {s.status === "OUT" && s.last_scan_at && (
                                                <span style={{ color: "#f97316", fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>
                                                    {elapsed(s.last_scan_at)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Last seen */}
                                        <div>
                                            {s.last_scan_at ? (
                                                <div>
                                                    <div style={{ color: "#94a3b8", fontSize: 12 }}>{fmtDate(s.last_scan_at)}</div>
                                                    {s.last_location && (
                                                        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 11, marginTop: 2 }}>
                                                            <MapPin size={10} /> {s.last_location.name}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={{ color: "#334155", fontSize: 12 }}>Never scanned</span>
                                            )}
                                        </div>

                                        {/* Expand arrow */}
                                        <div style={{ color: "#475569", display: "flex", justifyContent: "center" }}>
                                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </div>

                                    {/* Pass history expansion panel */}
                                    {isOpen && (
                                        <div style={{
                                            background: "#0a1628",
                                            borderBottom: "1px solid #1e293b",
                                            padding: "16px 24px 20px 24px",
                                        }}>
                                            <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>
                                                Pass History
                                            </div>

                                            {isLoadingPasses ? (
                                                <p style={{ color: "#475569", fontSize: 13 }}>Loading…</p>
                                            ) : studentPasses.length === 0 ? (
                                                <p style={{ color: "#334155", fontSize: 13 }}>No pass history yet</p>
                                            ) : (
                                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                    {studentPasses.slice(0, 10).map(p => (
                                                        <div key={p.pass_id} style={{
                                                            display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1.2fr 80px",
                                                            background: "#1e293b", borderRadius: 10, padding: "10px 16px",
                                                            border: "1px solid #334155", alignItems: "center", fontSize: 12,
                                                        }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8" }}>
                                                                <MapPin size={11} color="#64748b" /> {p.location_name}
                                                            </div>
                                                            <div style={{ color: "#94a3b8" }}>
                                                                <span style={{ color: "#64748b" }}>Out: </span>{fmtDate(p.out_at)}
                                                            </div>
                                                            <div style={{ color: durationFmt(p.duration_seconds, p.status, p.out_at), fontWeight: 700, fontFamily: "monospace" }}>
                                                                {formatDur(p.duration_seconds, p.status, p.out_at)}
                                                            </div>
                                                            <span style={{
                                                                padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700,
                                                                background: p.status === "ACTIVE" ? "#431407" : "#14532d30",
                                                                color: p.status === "ACTIVE" ? "#fed7aa" : "#4ade80",
                                                                textAlign: "center",
                                                            }}>
                                                                {p.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {studentPasses.length > 10 && (
                                                        <Link to="/passes" style={{ color: "#0ea5e9", fontSize: 12, textDecoration: "none", marginTop: 4 }}>
                                                            View all {studentPasses.length} passes →
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <p style={{ color: "#334155", fontSize: 12, textAlign: "center", marginTop: 16 }}>
                    {filtered.length} of {students.length} students shown · Click a row to see their pass history
                </p>
            </main>
        </div>
    );
}

function durationFmt(secs: number | null, status: string, outAt: string): string {
    if (status === "ACTIVE") return "#f97316";
    if (secs === null) return "#64748b";
    const mins = secs / 60;
    if (mins >= 15) return "#ef4444";
    if (mins >= 8) return "#f97316";
    return "#22c55e";
}

function SortIcon({ field }: { field: string }) {
    return null; // placeholder — implemented inline via state
}
