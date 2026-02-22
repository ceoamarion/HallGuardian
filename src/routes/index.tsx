import { createFileRoute, Link } from "@tanstack/react-router";
import {
	QrCode,
	IdCard,
	Waypoints,
	ShieldCheck,
	Database,
	Lock,
	LogIn,
	FileSearch,
	CheckCircle2,
	ArrowRight,
	Users,
	Clock,
	Star,
	Zap,
	BarChart3,
	Bell,
} from "lucide-react";

export const Route = createFileRoute("/")(({
	component: HomePage,
}));

/* ── Stat counter ── */
const stats = [
	{ value: "50+", label: "Districts Onboarded" },
	{ value: "120k+", label: "Students Tracked Daily" },
	{ value: "99.9%", label: "Platform Uptime" },
	{ value: "< 2s", label: "Avg. Scan Speed" },
];

/* ── Features ── */
const features = [
	{
		icon: QrCode,
		title: "QR Code Passes",
		description: "Students scan personal QR codes on classroom tablets. Instant check-in with zero friction.",
		color: "#0ea5e9",
		bg: "#f0f9ff",
		best: "Best for: Quick deployment & tight budgets",
	},
	{
		icon: IdCard,
		title: "NFC ID Cards",
		description: "Tap-to-go smart badges at hallway stations. Sub-second authentication for busy campuses.",
		color: "#8b5cf6",
		bg: "#f5f3ff",
		best: "Best for: High-traffic areas & maximum speed",
		featured: true,
	},
	{
		icon: Waypoints,
		title: "Hybrid QR + NFC",
		description: "Deploy both systems across your district. Flexibility for every campus layout and budget.",
		color: "#10b981",
		bg: "#f0fdf4",
		best: "Best for: District-wide comprehensive tracking",
	},
];

/* ── Trust pillars ── */
const trust = [
	{ icon: ShieldCheck, title: "FERPA-Aligned", desc: "Built from the ground up to comply with the Family Educational Rights and Privacy Act." },
	{ icon: Database, title: "Schools Own Their Data", desc: "You retain 100% ownership of all records. Export or securely purge data anytime." },
	{ icon: Lock, title: "No Selling Student Data", desc: "We never monetize, share, or sell tracking metrics or personally identifiable information." },
	{ icon: LogIn, title: "Role-Based Access", desc: "Teachers, security, and admins only see data relevant to their exact role." },
	{ icon: FileSearch, title: "Comprehensive Audit Logs", desc: "Track exactly who accessed movement histories and when, ensuring full accountability." },
	{ icon: Bell, title: "Real-Time Alerts", desc: "Instant notifications when students exceed time limits or capacity rules are triggered." },
];

/* ── Benefits ── */
const benefits = [
	"Set up in under a week — no IT department needed",
	"Works on any existing tablet, phone, or device",
	"Live dashboard visible to all authorized staff",
	"Automated parent-ready reports",
	"District admin oversight across all schools",
	"Offline mode — works even when Wi-Fi drops",
];

/* ── Testimonials ── */
const testimonials = [
	{
		quote: "HallGuardian cut our hallway incidents by 60% in the first semester. The real-time dashboard is exactly what our security team needed.",
		name: "Principal Sarah M.",
		school: "Jefferson High School, TX",
		avatar: "SM",
		color: "#0369a1",
	},
	{
		quote: "Setup was effortless. We were live in 3 days. The QR system works flawlessly on our existing iPads.",
		name: "IT Director James K.",
		school: "Riverside Unified District, CA",
		avatar: "JK",
		color: "#7c3aed",
	},
	{
		quote: "As a teacher, seeing who is out of the classroom in real time gives me actual peace of mind. I love the simplicity.",
		name: "Ms. Angela R.",
		school: "Lincoln Middle School, OH",
		avatar: "AR",
		color: "#059669",
	},
];

function HomePage() {
	return (
		<div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#0f172a" }}>

			{/* ──────────── HERO ──────────── */}
			<section style={{
				background: "linear-gradient(150deg, #0f172a 0%, #0c2340 50%, #0369a1 100%)",
				padding: "96px 24px 120px",
				position: "relative",
				overflow: "hidden",
			}}>
				{/* Background orbs */}
				<div style={{
					position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
				}}>
					<div style={{
						position: "absolute", top: -120, right: -120, width: 600, height: 600,
						borderRadius: "50%",
						background: "radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)",
					}} />
					<div style={{
						position: "absolute", bottom: -80, left: -80, width: 400, height: 400,
						borderRadius: "50%",
						background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
					}} />
					{/* Grid pattern */}
					<div style={{
						position: "absolute", inset: 0,
						backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
						backgroundSize: "60px 60px",
					}} />
				</div>

				<div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative" }}>

					{/* Branded name tag — no white box, blends cleanly into the dark hero */}
					<div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 24 }}>
						<div style={{
							width: 40, height: 40, borderRadius: 10,
							background: "linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%)",
							display: "flex", alignItems: "center", justifyContent: "center",
							boxShadow: "0 0 20px rgba(14,165,233,0.4)",
							flexShrink: 0,
							overflow: "hidden",
						}}>
							<img
								src="/hallguardian-logo.png"
								alt="HallGuardian icon"
								style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", mixBlendMode: "multiply", display: "block" }}
							/>
						</div>
						<span style={{ color: "#e0f2fe", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}>HallGuardian</span>
					</div>

					{/* Badge */}
					<div style={{
						display: "inline-flex", alignItems: "center", gap: 8,
						background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)",
						borderRadius: 100, padding: "6px 16px", marginBottom: 28,
					}}>
						<Zap size={14} color="#0ea5e9" />
						<span style={{ color: "#7dd3fc", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em" }}>
							REAL-TIME K-12 SAFETY TRACKING
						</span>
					</div>

					<h1 style={{
						fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800,
						color: "#fff", lineHeight: 1.1, marginBottom: 24,
						letterSpacing: "-0.03em",
					}}>
						Know Exactly Where Every
						<br />
						<span style={{
							background: "linear-gradient(90deg, #38bdf8, #818cf8)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
						}}>Student Is, Right Now.</span>
					</h1>

					<p style={{
						fontSize: "clamp(16px, 2.5vw, 20px)", color: "#93c5fd",
						maxWidth: 640, margin: "0 auto 40px", lineHeight: 1.7, fontWeight: 400,
					}}>
						HallGuardian gives K-12 schools real-time hall pass management with QR codes, NFC ID cards, or both — live on your campus in days, not months.
					</p>

					<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginBottom: 56 }}>
						<Link to="/contact">
							<button style={{
								padding: "16px 32px",
								borderRadius: 12,
								border: "none",
								background: "linear-gradient(135deg, #0ea5e9, #0369a1)",
								color: "#fff",
								fontWeight: 700,
								fontSize: 16,
								cursor: "pointer",
								boxShadow: "0 8px 28px rgba(14,165,233,0.4)",
								display: "flex",
								alignItems: "center",
								gap: 8,
								transition: "transform 0.2s, box-shadow 0.2s",
							}}
								onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(14,165,233,0.5)"; }}
								onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(14,165,233,0.4)"; }}
							>
								Get Started Free <ArrowRight size={18} />
							</button>
						</Link>
						<Link to="/how-it-works">
							<button style={{
								padding: "16px 32px",
								borderRadius: 12,
								border: "1.5px solid rgba(255,255,255,0.2)",
								background: "rgba(255,255,255,0.06)",
								color: "#e2e8f0",
								fontWeight: 600,
								fontSize: 16,
								cursor: "pointer",
								transition: "all 0.2s",
								backdropFilter: "blur(8px)",
							}}
								onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
								onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
							>
								See How It Works
							</button>
						</Link>
					</div>

					{/* Trust badges */}
					<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24 }}>
						{["FERPA-Aligned", "No credit card required", "Setup in days", "SOC 2 Ready"].map((badge) => (
							<div key={badge} style={{ display: "flex", alignItems: "center", gap: 6, color: "#7dd3fc", fontSize: 13, fontWeight: 500 }}>
								<CheckCircle2 size={14} color="#34d399" />
								{badge}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ── Stats bar ── */}
			<section style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
				<div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", textAlign: "center" }}>
						{stats.map((s, i) => (
							<div key={i} style={{
								padding: "36px 24px",
								borderRight: i < stats.length - 1 ? "1px solid #f1f5f9" : "none",
							}}>
								<div style={{ fontSize: 36, fontWeight: 800, color: "#0369a1", letterSpacing: "-0.03em" }}>{s.value}</div>
								<div style={{ fontSize: 14, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ──────────── HOW IT WORKS ──────────── */}
			<section style={{ padding: "96px 24px", background: "#f8fafc" }}>
				<div style={{ maxWidth: 1200, margin: "0 auto" }}>
					<div style={{ textAlign: "center", marginBottom: 64 }}>
						<div style={{ display: "inline-block", background: "#eff6ff", color: "#0369a1", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 100, marginBottom: 16 }}>
							The Technology
						</div>
						<h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 16 }}>
							Three Powerful Modes, One Platform
						</h2>
						<p style={{ fontSize: 18, color: "#64748b", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
							Choose the approach that fits your campus — or combine them for total coverage.
						</p>
					</div>

					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
						{features.map((f, i) => (
							<div key={i} style={{
								background: "#fff",
								borderRadius: 20,
								padding: "36px",
								border: f.featured ? `2px solid ${f.color}` : "1px solid #e2e8f0",
								position: "relative",
								transition: "transform 0.2s, box-shadow 0.2s",
								boxShadow: f.featured ? `0 8px 32px rgba(139,92,246,0.15)` : "0 2px 8px rgba(0,0,0,0.04)",
							}}
								onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.1)"; }}
								onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = f.featured ? "0 8px 32px rgba(139,92,246,0.15)" : "0 2px 8px rgba(0,0,0,0.04)"; }}
							>
								{f.featured && (
									<div style={{
										position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
										background: "linear-gradient(90deg, #7c3aed, #8b5cf6)",
										color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
										padding: "4px 14px", borderRadius: 100,
										textTransform: "uppercase",
									}}>
										Most Popular
									</div>
								)}
								<div style={{ width: 56, height: 56, borderRadius: 16, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
									<f.icon size={26} color={f.color} />
								</div>
								<h3 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 12, letterSpacing: "-0.02em" }}>{f.title}</h3>
								<p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: 24, fontSize: 15 }}>{f.description}</p>
								<div style={{ paddingTop: 20, borderTop: "1px solid #f1f5f9" }}>
									<span style={{ fontSize: 13, color: f.color, fontWeight: 600 }}>{f.best}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ──────────── BENEFITS ──────────── */}
			<section style={{ padding: "96px 24px", background: "#fff" }}>
				<div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: 64, alignItems: "center" }}>
					<div>
						<div style={{ display: "inline-block", background: "#f0fdf4", color: "#059669", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 100, marginBottom: 20 }}>
							Why Schools Choose Us
						</div>
						<h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.15 }}>
							Built for Real Schools,<br />Not Just Big Budgets
						</h2>
						<p style={{ fontSize: 17, color: "#64748b", lineHeight: 1.75, marginBottom: 32 }}>
							We designed HallGuardian alongside actual administrators, teachers, and security staff. Every feature solves a real daily pain point.
						</p>
						<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
							{benefits.map((b, i) => (
								<div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
									<div style={{ width: 22, height: 22, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
										<CheckCircle2 size={16} color="#10b981" />
									</div>
									<span style={{ fontSize: 15, color: "#374151", fontWeight: 500 }}>{b}</span>
								</div>
							))}
						</div>
						<div style={{ marginTop: 40, display: "flex", gap: 12 }}>
							<Link to="/contact">
								<button style={{
									padding: "13px 26px", borderRadius: 10, border: "none",
									background: "linear-gradient(135deg, #0369a1, #0ea5e9)",
									color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
									display: "flex", alignItems: "center", gap: 8,
								}}>
									Start Free Trial <ArrowRight size={16} />
								</button>
							</Link>
							<Link to="/pricing">
								<button style={{
									padding: "13px 26px", borderRadius: 10,
									border: "1.5px solid #e2e8f0", background: "#fff",
									color: "#374151", fontWeight: 600, fontSize: 15, cursor: "pointer",
								}}>
									View Pricing
								</button>
							</Link>
						</div>
					</div>

					{/* Dashboard mockup */}
					<div style={{
						background: "linear-gradient(145deg, #0f172a, #1e293b)",
						borderRadius: 24,
						padding: 24,
						boxShadow: "0 32px 80px rgba(15,23,42,0.25)",
						position: "relative",
					}}>
						{/* Fake header bar */}
						<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
							<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
							<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
							<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }} />
							<div style={{ flex: 1, height: 28, background: "#1e293b", borderRadius: 6, marginLeft: 8, display: "flex", alignItems: "center", padding: "0 12px" }}>
								<span style={{ color: "#475569", fontSize: 12 }}>hallguardian.app/dashboard</span>
							</div>
						</div>

						{/* Dashboard header */}
						<div style={{ marginBottom: 16 }}>
							<div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Live Campus Overview</div>
							<div style={{ color: "#64748b", fontSize: 12 }}>Jefferson High School — Today, 10:42 AM</div>
						</div>

						{/* Stat cards */}
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
							{[
								{ label: "Students Out", value: "14", icon: Users, color: "#0ea5e9", bg: "#0c4a6e" },
								{ label: "Avg. Duration", value: "6.2 min", icon: Clock, color: "#10b981", bg: "#064e3b" },
								{ label: "Scans Today", value: "312", icon: BarChart3, color: "#8b5cf6", bg: "#3b0764" },
								{ label: "Alerts", value: "2", icon: Bell, color: "#f59e0b", bg: "#451a03" },
							].map((card, i) => (
								<div key={i} style={{
									background: "#1e293b", borderRadius: 12, padding: "14px 16px",
									border: "1px solid #334155",
								}}>
									<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
										<span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</span>
										<div style={{ width: 28, height: 28, borderRadius: 8, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
											<card.icon size={14} color={card.color} />
										</div>
									</div>
									<div style={{ color: "#f8fafc", fontSize: 22, fontWeight: 800 }}>{card.value}</div>
								</div>
							))}
						</div>

						{/* Fake student list */}
						<div style={{ background: "#1e293b", borderRadius: 12, padding: "16px", border: "1px solid #334155" }}>
							<div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Currently Out of Class</div>
							{[
								{ name: "Marcus J.", loc: "Bathroom A", time: "4m", status: "ok" },
								{ name: "Sofia R.", loc: "Library", time: "12m", status: "warn" },
								{ name: "Tyler B.", loc: "Office", time: "2m", status: "ok" },
							].map((s, i) => (
								<div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? "1px solid #334155" : "none" }}>
									<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
										<div style={{ width: 28, height: 28, borderRadius: "50%", background: s.status === "warn" ? "#78350f" : "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: s.status === "warn" ? "#fcd34d" : "#7dd3fc" }}>
											{s.name.split(" ").map(n => n[0]).join("")}
										</div>
										<div>
											<div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{s.name}</div>
											<div style={{ color: "#64748b", fontSize: 11 }}>{s.loc}</div>
										</div>
									</div>
									<div style={{
										fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
										background: s.status === "warn" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
										color: s.status === "warn" ? "#fbbf24" : "#34d399",
									}}>
										{s.time}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ──────────── TRUST ──────────── */}
			<section style={{ padding: "96px 24px", background: "#f8fafc" }}>
				<div style={{ maxWidth: 1200, margin: "0 auto" }}>
					<div style={{ textAlign: "center", marginBottom: 64 }}>
						<div style={{ display: "inline-block", background: "#fef3c7", color: "#d97706", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 100, marginBottom: 16 }}>
							Security & Compliance
						</div>
						<h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 16 }}>
							Engineered for Trust
						</h2>
						<p style={{ fontSize: 18, color: "#64748b", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
							Student data privacy isn't a feature — it's our foundation. Guarantees you can take to your school board.
						</p>
					</div>

					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
						{trust.map((t, i) => (
							<div key={i} style={{
								background: "#fff", borderRadius: 16, padding: "28px",
								border: "1px solid #e2e8f0",
								transition: "transform 0.2s, box-shadow 0.2s",
							}}
								onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
								onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
							>
								<div style={{ width: 48, height: 48, borderRadius: 12, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
									<t.icon size={22} color="#0369a1" />
								</div>
								<h3 style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", marginBottom: 8 }}>{t.title}</h3>
								<p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{t.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ──────────── TESTIMONIALS ──────────── */}
			<section style={{ padding: "96px 24px", background: "#fff" }}>
				<div style={{ maxWidth: 1200, margin: "0 auto" }}>
					<div style={{ textAlign: "center", marginBottom: 56 }}>
						<div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 16 }}>
							{[...Array(5)].map((_, i) => <Star key={i} size={20} color="#f59e0b" fill="#f59e0b" />)}
						</div>
						<h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 12 }}>
							Loved by Educators Nationwide
						</h2>
						<p style={{ fontSize: 17, color: "#64748b" }}>Real feedback from real schools using HallGuardian every day.</p>
					</div>

					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
						{testimonials.map((t, i) => (
							<div key={i} style={{
								background: "#f8fafc", borderRadius: 20, padding: "32px",
								border: "1px solid #e2e8f0", position: "relative",
							}}>
								<div style={{ fontSize: 48, color: "#e2e8f0", fontFamily: "Georgia, serif", lineHeight: 1, marginBottom: 16 }}>"</div>
								<p style={{ color: "#374151", fontSize: 15, lineHeight: 1.75, marginBottom: 24, fontStyle: "italic" }}>"{t.quote}"</p>
								<div style={{ display: "flex", alignItems: "center", gap: 14 }}>
									<div style={{
										width: 44, height: 44, borderRadius: "50%",
										background: t.color, display: "flex", alignItems: "center", justifyContent: "center",
										color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
									}}>
										{t.avatar}
									</div>
									<div>
										<div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{t.name}</div>
										<div style={{ fontSize: 12, color: "#64748b" }}>{t.school}</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ──────────── FINAL CTA ──────────── */}
			<section style={{
				padding: "96px 24px",
				background: "linear-gradient(135deg, #0369a1 0%, #0c2340 100%)",
				position: "relative",
				overflow: "hidden",
			}}>
				<div style={{
					position: "absolute", inset: 0, pointerEvents: "none",
					backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
					backgroundSize: "48px 48px",
				}} />
				<div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative" }}>

					{/* Branded CTA tag */}
					<div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 20 }}>
						<div style={{
							width: 28, height: 28, borderRadius: 7,
							background: "linear-gradient(135deg, #1e3a5f, #0ea5e9)",
							display: "flex", alignItems: "center", justifyContent: "center",
							boxShadow: "0 0 12px rgba(14,165,233,0.5)",
							overflow: "hidden",
						}}>
							<img
								src="/hallguardian-logo.png"
								alt="HallGuardian icon"
								style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", mixBlendMode: "multiply", display: "block" }}
							/>
						</div>
						<span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 14, letterSpacing: "0.02em" }}>HallGuardian</span>
					</div>

					<div style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", color: "#bae6fd", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 100, marginBottom: 24 }}>
						Get Started Today
					</div>
					<h2 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.15 }}>
						Ready to Secure Your Campus?
					</h2>
					<p style={{ fontSize: 18, color: "#93c5fd", marginBottom: 40, lineHeight: 1.7 }}>
						Join hundreds of schools modernizing attendance and hall pass management. Start your free trial today — no credit card, no IT team required.
					</p>
					<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
						<Link to="/contact">
							<button style={{
								padding: "16px 36px", borderRadius: 12, border: "none",
								background: "#fff", color: "#0369a1",
								fontWeight: 700, fontSize: 16, cursor: "pointer",
								boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
								display: "flex", alignItems: "center", gap: 8,
								transition: "transform 0.2s",
							}}
								onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
								onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
							>
								Create Free Account <ArrowRight size={18} />
							</button>
						</Link>
						<Link to="/contact">
							<button style={{
								padding: "16px 36px", borderRadius: 12,
								border: "1.5px solid rgba(255,255,255,0.25)",
								background: "rgba(255,255,255,0.08)",
								color: "#e0f2fe", fontWeight: 600, fontSize: 16, cursor: "pointer",
								transition: "all 0.2s",
							}}
								onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.16)"; }}
								onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
							>
								Schedule a Demo
							</button>
						</Link>
					</div>
					<p style={{ marginTop: 24, color: "#7dd3fc", fontSize: 13 }}>
						✓ Free 30-day trial &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Full onboarding included
					</p>
				</div>
			</section>
		</div>
	);
}
