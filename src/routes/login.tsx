import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/login")({
    component: LoginPage,
});

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // redirect if already logged in
    useEffect(() => {
        if (localStorage.getItem("hg_token")) navigate({ to: "/dashboard" });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email || !password) { setError("Please fill in all fields."); return; }

        setLoading(true);
        try {
            const res = await fetch(`${API}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Login failed."); return; }

            localStorage.setItem("hg_token", data.token);
            localStorage.setItem("hg_user", JSON.stringify(data.user));
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
            padding: "24px",
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Card */}
            <div style={{
                width: "100%",
                maxWidth: 440,
                background: "rgba(30,41,59,0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: 24,
                border: "1px solid #334155",
                padding: "40px 36px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, justifyContent: "center" }}>
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

                <h1 style={{ color: "#f8fafc", fontSize: 26, fontWeight: 800, textAlign: "center", marginBottom: 6, letterSpacing: "-0.03em" }}>
                    Welcome back
                </h1>
                <p style={{ color: "#64748b", textAlign: "center", fontSize: 14, marginBottom: 32 }}>
                    Sign in to your school's admin account
                </p>

                {error && (
                    <div style={{
                        background: "#7f1d1d30", border: "1px solid #7f1d1d",
                        borderRadius: 10, padding: "12px 14px", marginBottom: 20,
                        display: "flex", alignItems: "center", gap: 8,
                    }}>
                        <AlertCircle size={16} color="#f87171" />
                        <span style={{ color: "#f87171", fontSize: 14 }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                            Email address
                        </label>
                        <div style={{ position: "relative" }}>
                            <Mail size={16} color="#475569" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@yourschool.edu"
                                style={{
                                    width: "100%", boxSizing: "border-box",
                                    background: "#0f172a", border: "1px solid #334155",
                                    borderRadius: 10, padding: "13px 14px 13px 40px",
                                    color: "#f1f5f9", fontSize: 15, outline: "none",
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = "#0ea5e9"}
                                onBlur={e => e.currentTarget.style.borderColor = "#334155"}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <label style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Password</label>
                            <span style={{ color: "#0ea5e9", fontSize: 13, cursor: "pointer" }}>Forgot password?</span>
                        </div>
                        <div style={{ position: "relative" }}>
                            <Lock size={16} color="#475569" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type={showPw ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: "100%", boxSizing: "border-box",
                                    background: "#0f172a", border: "1px solid #334155",
                                    borderRadius: 10, padding: "13px 44px 13px 40px",
                                    color: "#f1f5f9", fontSize: 15, outline: "none",
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = "#0ea5e9"}
                                onBlur={e => e.currentTarget.style.borderColor = "#334155"}
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569" }}>
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

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
                        {loading ? "Signing in…" : "Sign In →"}
                    </button>
                </form>

                <p style={{ textAlign: "center", color: "#475569", fontSize: 14, marginTop: 24 }}>
                    Don't have an account?{" "}
                    <Link to="/register" style={{ color: "#0ea5e9", fontWeight: 600, textDecoration: "none" }}>
                        Create one free
                    </Link>
                </p>
            </div>
        </div>
    );
}
