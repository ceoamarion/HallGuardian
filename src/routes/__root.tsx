import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useState, useEffect } from "react";
import {
	Menu,
	X,
	ShieldCheck,
	Mail,
	Twitter,
	Linkedin,
	Facebook,
} from "lucide-react";

export const Route = createRootRoute({
	component: Root,
});

function Root() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const routerState = useRouterState();

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 16);
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		setMenuOpen(false);
	}, [routerState.location.pathname]);

	const navLinks = [
		{ to: "/how-it-works", label: "How It Works" },
		{ to: "/features", label: "Features" },
		{ to: "/pricing", label: "Pricing" },
		{ to: "/about", label: "About" },
	];

	return (
		<div className="flex flex-col min-h-screen" style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafc" }}>

			{/* ── NAV ── */}
			<header
				style={{
					position: "sticky",
					top: 0,
					zIndex: 50,
					background: scrolled ? "rgba(255,255,255,0.97)" : "#fff",
					borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid transparent",
					boxShadow: scrolled ? "0 2px 16px rgba(14,42,91,0.08)" : "none",
					transition: "all 0.25s ease",
					backdropFilter: "blur(8px)",
				}}
			>
				<div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
					<nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 84 }}>
						{/* Logo */}
						<Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
							<img
								src="/hallguardian-logo.png"
								alt="HallGuardian Logo"
								style={{ height: 68, width: "auto", objectFit: "contain" }}
							/>
						</Link>

						{/* Desktop Nav */}
						<div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden md:flex">
							{navLinks.map((l) => (
								<Link
									key={l.to}
									to={l.to}
									style={{
										textDecoration: "none",
										color: "#475569",
										fontWeight: 500,
										fontSize: 15,
										transition: "color 0.2s",
										letterSpacing: "-0.01em",
									}}
									activeProps={{ style: { color: "#0369a1", fontWeight: 600, textDecoration: "none" } }}
								>
									{l.label}
								</Link>
							))}
						</div>

						{/* CTA buttons */}
						<div style={{ display: "flex", alignItems: "center", gap: 12 }} className="hidden md:flex">
							<Link to="/contact">
								<button
									type="button"
									style={{
										padding: "10px 22px",
										borderRadius: 8,
										border: "1.5px solid #0369a1",
										background: "transparent",
										color: "#0369a1",
										fontWeight: 600,
										fontSize: 14,
										cursor: "pointer",
										transition: "all 0.2s",
									}}
									onMouseEnter={(e) => { e.currentTarget.style.background = "#f0f9ff"; }}
									onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
								>
									Sign In
								</button>
							</Link>
							<Link to="/contact">
								<button
									type="button"
									style={{
										padding: "10px 22px",
										borderRadius: 8,
										border: "none",
										background: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)",
										color: "#fff",
										fontWeight: 600,
										fontSize: 14,
										cursor: "pointer",
										boxShadow: "0 4px 14px rgba(3,105,161,0.35)",
										transition: "all 0.2s",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.transform = "translateY(-1px)";
										e.currentTarget.style.boxShadow = "0 6px 20px rgba(3,105,161,0.45)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.transform = "translateY(0)";
										e.currentTarget.style.boxShadow = "0 4px 14px rgba(3,105,161,0.35)";
									}}
								>
									Get Started Free
								</button>
							</Link>
						</div>

						{/* Mobile hamburger */}
						<button
							type="button"
							className="md:hidden"
							onClick={() => setMenuOpen(!menuOpen)}
							style={{ background: "none", border: "none", cursor: "pointer", padding: 8, color: "#334155" }}
							aria-label="Toggle menu"
						>
							{menuOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
					</nav>
				</div>

				{/* Mobile menu */}
				{menuOpen && (
					<div style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "16px 24px 24px" }}>
						{navLinks.map((l) => (
							<Link
								key={l.to}
								to={l.to}
								style={{
									display: "block", padding: "12px 0", textDecoration: "none",
									color: "#475569", fontWeight: 500, fontSize: 16, borderBottom: "1px solid #f1f5f9",
								}}
							>
								{l.label}
							</Link>
						))}
						<div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
							<Link to="/contact">
								<button type="button" style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1.5px solid #0369a1", background: "transparent", color: "#0369a1", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
									Sign In
								</button>
							</Link>
							<Link to="/contact">
								<button type="button" style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)", color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
									Get Started Free
								</button>
							</Link>
						</div>
					</div>
				)}
			</header>

			{/* ── MAIN CONTENT ── */}
			<ErrorBoundary tagName="main" className="flex-1">
				<Outlet />
			</ErrorBoundary>

			{/* ── FOOTER ── */}
			<footer style={{ background: "#0f172a", color: "#e2e8f0" }}>
				<div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 40px" }}>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: 48 }}>
						{/* Brand */}
						<div>
							{/* Logo lockup — gradient icon + wordmark, no white box */}
							<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
								<div style={{
									width: 38, height: 38, borderRadius: 10,
									background: "linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%)",
									display: "flex", alignItems: "center", justifyContent: "center",
									flexShrink: 0,
									boxShadow: "0 0 16px rgba(14,165,233,0.3)",
									overflow: "hidden",
								}}>
									<img
										src="/hallguardian-logo.png"
										alt="HallGuardian icon"
										style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", mixBlendMode: "multiply", display: "block" }}
									/>
								</div>
								<span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>HallGuardian</span>
							</div>
							<p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, maxWidth: 260 }}>
								Modern hall pass management and student safety tracking built exclusively for K-12 schools.
							</p>
							<div style={{ display: "flex", gap: 12, marginTop: 20 }}>
								{[Twitter, Linkedin, Facebook].map((Icon, i) => (
									<a
										key={i}
										href="#"
										style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, background: "#1e293b", color: "#94a3b8", transition: "all 0.2s", textDecoration: "none" }}
										onMouseEnter={(e) => { e.currentTarget.style.background = "#0369a1"; e.currentTarget.style.color = "#fff"; }}
										onMouseLeave={(e) => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#94a3b8"; }}
									>
										<Icon size={16} />
									</a>
								))}
							</div>
						</div>

						{/* Product */}
						<div>
							<h4 style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", marginBottom: 16 }}>Product</h4>
							{[
								{ to: "/how-it-works", label: "How It Works" },
								{ to: "/features", label: "Features" },
								{ to: "/pricing", label: "Pricing" },
							].map((l) => (
								<Link key={l.to} to={l.to} style={{ display: "block", color: "#94a3b8", textDecoration: "none", fontSize: 14, marginBottom: 10 }}
									onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "#e2e8f0"; }}
									onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "#94a3b8"; }}
								>{l.label}</Link>
							))}
						</div>

						{/* Company */}
						<div>
							<h4 style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", marginBottom: 16 }}>Company</h4>
							{[
								{ to: "/about", label: "About Us" },
								{ to: "/privacy", label: "Privacy & Ethics" },
								{ to: "/contact", label: "Contact" },
							].map((l) => (
								<Link key={l.to} to={l.to} style={{ display: "block", color: "#94a3b8", textDecoration: "none", fontSize: 14, marginBottom: 10 }}
									onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "#e2e8f0"; }}
									onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "#94a3b8"; }}
								>{l.label}</Link>
							))}
						</div>

						{/* Contact */}
						<div>
							<h4 style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", marginBottom: 16 }}>Contact</h4>
							<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
								<a href="mailto:support@hallguardian.com" style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", textDecoration: "none", fontSize: 14 }}>
									<Mail size={14} /> support@hallguardian.com
								</a>
								<div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 14 }}>
									<ShieldCheck size={14} /> FERPA-Aligned & Secure
								</div>
							</div>
							<div style={{ marginTop: 24 }}>
								<Link to="/contact">
									<button type="button" style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%" }}>
										Get a Free Demo →
									</button>
								</Link>
							</div>
						</div>
					</div>

					{/* Bottom bar */}
					<div style={{ borderTop: "1px solid #1e293b", paddingTop: 28, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
						<p style={{ color: "#475569", fontSize: 13 }}>© 2026 HallGuardian. All rights reserved.</p>
						<div style={{ display: "flex", gap: 24 }}>
							{["Privacy Policy", "Terms of Service", "FERPA Compliance"].map((t) => (
								<Link key={t} to="/privacy" style={{ color: "#475569", fontSize: 13, textDecoration: "none" }}>{t}</Link>
							))}
						</div>
					</div>
				</div>
			</footer>

			<TanStackRouterDevtools position="bottom-right" />
		</div>
	);
}
