import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, Database, FileSearch, LogIn } from "lucide-react";

export const Route = createFileRoute("/pricing")({
	component: PricingPage,
});

function PricingPage() {
	return (
		<div className="font-sans text-slate-900 bg-slate-50 min-h-screen">
			{/* Hero Section */}
			<section className="bg-white py-12 md:py-16 border-b border-slate-100">
				<div className="container mx-auto px-4 text-center max-w-3xl">
					<h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-6 tracking-tight">
						Simple, Transparent Pricing for Schools
					</h1>
					<p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
						Choose the plan that best fits your district's security requirements. Our per-student pricing scales with your enrollment—no hidden fees, no complicated hardware leasing.
					</p>
				</div>
			</section>

			{/* Pricing Tiers */}
			<section className="py-16">
				<div className="container mx-auto px-4 max-w-6xl">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">

						{/* Tier 1: QR Essentials */}
						<Card className="flex flex-col bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
							<CardHeader className="text-center pb-8 border-b border-slate-100">
								<CardTitle className="text-2xl text-blue-900 mb-2">QR Essentials</CardTitle>
								<CardDescription className="text-slate-600 mb-6">
									The core package for rapid, software-only deployment.
								</CardDescription>
								<div className="flex justify-center items-end text-blue-900 mb-2">
									<span className="text-5xl font-bold tracking-tighter">$2.99</span>
								</div>
								<p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
									per student / per year
								</p>
							</CardHeader>
							<CardContent className="flex flex-col flex-1 pt-8 bg-slate-50/50 rounded-b-xl">
								<ul className="space-y-4 flex-1 mb-8">
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
										<span className="text-slate-700 leading-snug">QR scanning only</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
										<span className="text-slate-700 leading-snug">Admin dashboard</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
										<span className="text-slate-700 leading-snug">FERPA-aligned tracking</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
										<span className="text-slate-700 leading-snug">Standard business-hours email support</span>
									</li>
								</ul>
								<Link to="/contact" className="w-full">
									<Button variant="outline" className="w-full py-6 text-lg rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors">
										Create Account & Request Demo
									</Button>
								</Link>
							</CardContent>
						</Card>

						{/* Tier 3 (Most Popular): Complete HallGuardian */}
						<div className="relative md:-mt-4 md:mb-4 z-10">
							<Badge className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 text-sm uppercase tracking-wide font-bold bg-blue-700 text-white shadow-sm border-none z-20">
								Most Popular
							</Badge>
							<Card className="flex flex-col h-full bg-white border-2 border-blue-700 rounded-xl shadow-xl">
								<CardHeader className="text-center pb-8 bg-blue-50/50 rounded-t-xl border-b border-blue-100">
									<CardTitle className="text-2xl text-blue-900 mb-2">Complete HallGuardian</CardTitle>
									<CardDescription className="text-blue-700/80 mb-6">
										Maximum situational awareness for expanding districts.
									</CardDescription>
									<div className="flex justify-center items-end text-blue-900 mb-2">
										<span className="text-5xl font-bold tracking-tighter">$6.99</span>
									</div>
									<p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
										per student / per year
									</p>
								</CardHeader>
								<CardContent className="flex flex-col flex-1 pt-8 bg-white rounded-b-xl">
									<ul className="space-y-4 flex-1 mb-8">
										<li className="flex items-start gap-3">
											<CheckCircle2 className="size-5 text-blue-700 shrink-0 mt-0.5" />
											<span className="text-slate-800 font-medium leading-snug">QR + NFC combined</span>
										</li>
										<li className="flex items-start gap-3">
											<CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
											<span className="text-slate-700 leading-snug">Full admin controls</span>
										</li>
										<li className="flex items-start gap-3">
											<CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
											<span className="text-slate-700 leading-snug">Advanced analytics & audit logs</span>
										</li>
										<li className="flex items-start gap-3">
											<CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
											<span className="text-slate-700 leading-snug">Priority business-hours support</span>
										</li>
									</ul>
									<Link to="/contact" className="w-full">
										<Button className="w-full py-6 text-lg rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition-colors">
											Create Account & Request Demo
										</Button>
									</Link>
								</CardContent>
							</Card>
						</div>

						{/* Tier 2: NFC ID System */}
						<Card className="flex flex-col bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
							<CardHeader className="text-center pb-8 border-b border-slate-100">
								<CardTitle className="text-2xl text-blue-900 mb-2">NFC ID System</CardTitle>
								<CardDescription className="text-slate-600 mb-6">
									Card-based access for robust school security flow.
								</CardDescription>
								<div className="flex justify-center items-end text-blue-900 mb-2">
									<span className="text-5xl font-bold tracking-tighter">$4.99</span>
								</div>
								<p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
									per student / per year
								</p>
							</CardHeader>
							<CardContent className="flex flex-col flex-1 pt-8 bg-slate-50/50 rounded-b-xl">
								<ul className="space-y-4 flex-1 mb-4">
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
										<span className="text-slate-800 font-medium leading-snug">Includes QR Essentials</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
										<span className="text-slate-700 leading-snug">NFC student ID cards</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
										<span className="text-slate-700 leading-snug">HallGuardian-installed scanners</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 shrink-0 mt-0.5" />
										<span className="text-slate-700 leading-snug">Faster check-ins</span>
									</li>
								</ul>
								<p className="text-xs text-slate-500 italic text-center mb-6">
									Hardware & installation quoted separately
								</p>
								<Link to="/contact" className="w-full mt-auto">
									<Button variant="outline" className="w-full py-6 text-lg rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors">
										Create Account & Request Demo
									</Button>
								</Link>
							</CardContent>
						</Card>

					</div>
				</div>
			</section>

			{/* Trust & Compliance Breakdown */}
			<section className="bg-white py-16 border-t border-slate-100">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center mb-12">
						<ShieldCheck className="size-12 text-blue-600 mx-auto mb-4" />
						<h2 className="text-3xl font-bold text-blue-900 mb-4">
							Security and Compliance Guaranteed
						</h2>
						<p className="text-slate-600 text-lg">
							We consider student data protection our highest priority. HallGuardian operates with absolute transparency and rigorous technical safeguards.
						</p>
					</div>

					<div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex gap-4">
							<Database className="size-8 text-blue-700 shrink-0" />
							<div>
								<h3 className="text-xl font-semibold text-blue-900 mb-2">FERPA & Data Ownership</h3>
								<p className="text-slate-600">
									We operate in strict alignment with FERPA guidelines. Your district retains 100% ownership of all attendance and movement data. We will never sell or monetize student information—period.
								</p>
							</div>
						</div>

						<div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex gap-4">
							<LogIn className="size-8 text-blue-700 shrink-0" />
							<div>
								<h3 className="text-xl font-semibold text-blue-900 mb-2">Role-Based Access</h3>
								<p className="text-slate-600">
									Granular permissions ensure that substitute teachers, bus drivers, and principals all see only the specific data layers necessary to perform their roles, preventing over-exposure.
								</p>
							</div>
						</div>

						<div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex gap-4 md:col-span-2 max-w-2xl mx-auto w-full">
							<FileSearch className="size-8 text-blue-700 shrink-0" />
							<div>
								<h3 className="text-xl font-semibold text-blue-900 mb-2">Audit Logs (Tier 3)</h3>
								<p className="text-slate-600">
									For district administrators desiring ultimate transparency, the Complete HallGuardian tier records comprehensive system audit logs. Track every dashboard login, data export, and permission change.
								</p>
							</div>
						</div>
					</div>

					<div className="mt-16 text-center">
						<Link to="/contact">
							<Button size="lg" className="text-lg px-8 py-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition-all">
								Ready to protect your hallways? Create Account & Request Demo
							</Button>
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
