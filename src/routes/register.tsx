import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, Eye, EyeOff, Mail, Lock, User, Building2, AlertCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/register")({
    component: RegisterPage,
});

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function InputField({
    label, icon: Icon, type = "text", value, onChange, placeholder, hint,
    rightEl,
}: {
    label: string; icon: any; type?: string; value: string;
    onChange: (v: string) => void; placeholder: string; hint?: string; rightEl?: React.ReactNode;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
            <div style={{ position: "relative" }}>
                <Icon size={16} color="#475569" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                    type={type} value={value} placeholder={placeholder}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        width: "100%", boxSizing: "border-box",
                        background: "#0f172a",
                        border: `1px solid ${focused ? "#0ea5e9" : "#334155"}`,
                        borderRadius: 10, padding: `13px ${rightEl ? "44px" : "14px"} 13px 40px`,
                        color: "#f1f5f9", fontSize: 15, outline: "none", transition: "border-color 0.2s",
                    }}
                />
                {rightEl && <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>{rightEl}</div>}
            </div>
            {hint && <p style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>{hint}</p>}
        </div>
    );
}

function PasswordStrength({ pw }: { pw: string }) {
    const checks = [
        { label: "8+ characters", ok: pw.length >= 8 },
        { label: "Uppercase letter", ok: /[A-Z]/.test(pw) },
        { label: "Number", ok: /\d/.test(pw) },
    ];
    if (!pw) return null;
    return (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8, marginBottom: 8 }}>
            {checks.map(c => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={12} color={c.ok ? "#22c55e" : "#334155"} />
                    <span style={{ color: c.ok ? "#22c55e" : "#475569", fontSize: 11 }}>{c.label}</span>
                </div>
            ))}
        </div>
    );
}

function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPw: "", schoolName: "" });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (localStorage.getItem("hg_token")) navigate({ to: "/dashboard" });
    }, []);

    const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!form.name || !form.email || !form.password || !form.schoolName) {
            setError("Please fill in all required fields."); return;
        }
        if (form.password.length < 8) {
            setError("Password must be at least 8 characters."); return;
        }
        if (form.password !== form.confirmPw) {
            setError("Passwords do not match."); return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email.trim().toLowerCase(),
                    password: form.password,
                    role: "ADMIN",
                    schoolId: null,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Registration failed."); return; }

            // Auto-login after register
            const loginRes = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email.trim().toLowerCase(), password: form.password }),
            });
            const loginData = await loginRes.json();
            if (loginRes.ok) {
                localStorage.setItem("hg_token", loginData.token);
                localStorage.setItem("hg_user", JSON.stringify(loginData.user));
            }

            navigate({ to: "/dashboard" });
        } catch {
            setError("Cannot reach the server. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(150deg, #0f172a 0%, #0c2340 60%, #0369a1 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            fontFamily: "'Inter', sans-serif",
        }}>
            <div style={{
                width: "100%", maxWidth: 480,
                background: "rgba(30,41,59,0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: 24, border: "1px solid #334155",
                padding: "40px 36px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, justifyContent: "center" }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: "linear-gradient(135deg, #1e3a5f, #0ea5e9)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 20px rgba(14,165,233,0.4)",
                    }}>
                        <ShieldCheck size={22} color="#fff" />
                    </div>
                    <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}>HallGuardian</span>
                </div>

                {/* Trust badge */}
                <div style={{
                    display: "flex", justifyContent: "center", marginBottom: 24,
                }}>
                    <div style={{
                        background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)",
                        borderRadius: 100, padding: "5px 14px",
                        color: "#7dd3fc", fontSize: 12, fontWeight: 600,
                    }}>
                        ✓ Free 30-day trial · No credit card required
                    </div>
                </div>

                <h1 style={{ color: "#f8fafc", fontSize: 24, fontWeight: 800, textAlign: "center", marginBottom: 4, letterSpacing: "-0.03em" }}>
                    Create your school account
                </h1>
                <p style={{ color: "#64748b", textAlign: "center", fontSize: 14, marginBottom: 28 }}>
                    Get your campus set up in minutes
                </p>

                {error && (
                    <div style={{
                        background: "#7f1d1d30", border: "1px solid #7f1d1d60",
                        borderRadius: 10, padding: "12px 14px", marginBottom: 20,
                        display: "flex", alignItems: "center", gap: 8,
                    }}>
                        <AlertCircle size={16} color="#f87171" />
                        <span style={{ color: "#f87171", fontSize: 14 }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <InputField label="Your full name" icon={User} value={form.name} onChange={set("name")} placeholder="Jane Smith" />
                    <InputField label="School name" icon={Building2} value={form.schoolName} onChange={set("schoolName")} placeholder="Lincoln High School" />
                    <InputField label="Work email" icon={Mail} type="email" value={form.email} onChange={set("email")} placeholder="admin@yourschool.edu" />
                    <div>
                        <InputField
                            label="Password"
                            icon={Lock}
                            type={showPw ? "text" : "password"}
                            value={form.password}
                            onChange={set("password")}
                            placeholder="Min. 8 characters"
                            rightEl={
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 0 }}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                        />
                        <PasswordStrength pw={form.password} />
                    </div>
                    <InputField
                        label="Confirm password"
                        icon={Lock}
                        type="password"
                        value={form.confirmPw}
                        onChange={set("confirmPw")}
                        placeholder="Re-enter password"
                    />

                    <p style={{ color: "#475569", fontSize: 12, marginBottom: 20, lineHeight: 1.6 }}>
                        By creating an account you agree to our{" "}
                        <Link to="/privacy" style={{ color: "#0ea5e9" }}>Privacy Policy</Link>{" "}
                        and{" "}
                        <Link to="/privacy" style={{ color: "#0ea5e9" }}>Terms of Service</Link>.
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%", padding: "14px",
                            background: loading ? "#1e3a5f" : "linear-gradient(135deg, #0369a1, #0ea5e9)",
                            border: "none", borderRadius: 12, color: "#fff",
                            fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
                            boxShadow: "0 4px 20px rgba(3,105,161,0.4)",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                        {loading ? "Creating account…" : "Create Free Account →"}
                    </button>
                </form>

                <p style={{ textAlign: "center", color: "#475569", fontSize: 14, marginTop: 24 }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "#0ea5e9", fontWeight: 600, textDecoration: "none" }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
