import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, IdCard, Waypoints, ShieldCheck, Database, Lock, LogIn, FileSearch } from "lucide-react";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="font-sans text-gray-900 bg-slate-50">
			{/* Hero Section */}
			<section className="bg-white py-12 md:py-16 border-b border-gray-100">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center">
						<h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-6 tracking-tight">
							Student Safety & Real-Time Tracking for Schools
						</h1>
						<p className="text-lg md:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
							Streamline attendance and secure your hallways with QR codes, NFC ID cards, or a powerful hybrid system built exclusively for K-12 districts.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
							<Link to="/contact">
								<Button size="lg" className="text-lg px-8 py-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white shadow-sm hover:shadow-md transition-all">
									Request a Demo
								</Button>
							</Link>
							<Link to="/pricing">
								<Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 transition-all">
									View Plans
								</Button>
							</Link>
						</div>
						<div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 uppercase tracking-wider">
							<ShieldCheck className="size-4 text-blue-600" />
							<span>Built for K-12</span>
							<span className="mx-2 text-slate-300">•</span>
							<span>FERPA-aligned</span>
							<span className="mx-2 text-slate-300">•</span>
							<span>Setup in days</span>
						</div>
					</div>
				</div>
			</section>

			{/* How HallGuardian Works Section */}
			<section className="py-16 bg-slate-50">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center mb-12">
						<h2 className="text-3xl font-bold text-blue-900 mb-4">
							How HallGuardian Works
						</h2>
						<p className="text-slate-600 text-lg">
							Choose the technology that best fits your campus infrastructure and safety requirements.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
						{/* Card 1: QR Code Scanning */}
						<Card className="rounded-xl shadow-sm hover:shadow-md transition-all border-slate-200 bg-white">
							<CardHeader>
								<div className="bg-sky-50 p-3 rounded-xl w-fit mb-4">
									<QrCode className="size-8 text-blue-700" />
								</div>
								<CardTitle className="text-xl text-blue-900">QR Code Scanning</CardTitle>
								<CardDescription className="text-base text-slate-600 mt-2">
									Fast rollout, no hardware required.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-slate-700 mb-6">
									Students simply scan their personal QR codes on existing district-provided tablets or their own devices.
								</p>
								<div className="pt-4 border-t border-slate-100">
									<p className="text-sm font-medium text-blue-700">
										<span className="text-slate-500 mr-2">Best for:</span> Quick deployment & low budgets
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Card 2: NFC ID Cards */}
						<Card className="rounded-xl shadow-sm hover:shadow-md transition-all border-slate-200 bg-white">
							<CardHeader>
								<div className="bg-sky-50 p-3 rounded-xl w-fit mb-4">
									<IdCard className="size-8 text-blue-700" />
								</div>
								<CardTitle className="text-xl text-blue-900">NFC ID Cards</CardTitle>
								<CardDescription className="text-base text-slate-600 mt-2">
									Secure tap-in system with installed scanners.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-slate-700 mb-6">
									Equip students with NFC-enabled badges for rapid, friction-free entry at strategically placed hallway and classroom scanners.
								</p>
								<div className="pt-4 border-t border-slate-100">
									<p className="text-sm font-medium text-blue-700">
										<span className="text-slate-500 mr-2">Best for:</span> Faster check-ins & high security
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Card 3: Hybrid QR + NFC */}
						<Card className="rounded-xl shadow-sm hover:shadow-md transition-all border-slate-200 bg-white border-t-4 border-t-blue-700">
							<CardHeader>
								<div className="bg-sky-50 p-3 rounded-xl w-fit mb-4">
									<Waypoints className="size-8 text-blue-700" />
								</div>
								<CardTitle className="text-xl text-blue-900">Hybrid QR + NFC</CardTitle>
								<CardDescription className="text-base text-slate-600 mt-2">
									Full coverage and maximum architectural flexibility.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-slate-700 mb-6">
									Utilize rapid NFC tap stations at main entrances and large areas, while using QR scan codes in individual classrooms.
								</p>
								<div className="pt-4 border-t border-slate-100">
									<p className="text-sm font-medium text-blue-700">
										<span className="text-slate-500 mr-2">Best for:</span> District-wide comprehensive tracking
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Trust & Compliance Section */}
			<section className="py-16 bg-white border-t border-slate-100">
				<div className="container mx-auto px-4 max-w-5xl">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-blue-900 mb-4">
							Engineered for Trust and Compliance
						</h2>
						<p className="text-slate-600 text-lg">
							We believe student data privacy is non-negotiable. HallGuardian provides security guarantees you can take to your school board.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div className="flex items-start gap-4 p-4">
							<div className="bg-slate-50 p-3 rounded-lg text-blue-700 shrink-0">
								<ShieldCheck className="size-6" />
							</div>
							<div>
								<h3 className="font-semibold text-slate-900 mb-1">FERPA-Aligned</h3>
								<p className="text-sm text-slate-600">Built from the ground up to comply with the Family Educational Rights and Privacy Act.</p>
							</div>
						</div>

						<div className="flex items-start gap-4 p-4">
							<div className="bg-slate-50 p-3 rounded-lg text-blue-700 shrink-0">
								<Database className="size-6" />
							</div>
							<div>
								<h3 className="font-semibold text-slate-900 mb-1">Schools Own Their Data</h3>
								<p className="text-sm text-slate-600">You retain 100% ownership of your records. Export or securely purge data upon request.</p>
							</div>
						</div>

						<div className="flex items-start gap-4 p-4">
							<div className="bg-slate-50 p-3 rounded-lg text-blue-700 shrink-0">
								<Lock className="size-6" />
							</div>
							<div>
								<h3 className="font-semibold text-slate-900 mb-1">No Selling Student Data</h3>
								<p className="text-sm text-slate-600">We never monetize, share, or sell tracking metrics or personally identifiable information.</p>
							</div>
						</div>

						<div className="flex items-start gap-4 p-4">
							<div className="bg-slate-50 p-3 rounded-lg text-blue-700 shrink-0">
								<LogIn className="size-6" />
							</div>
							<div>
								<h3 className="font-semibold text-slate-900 mb-1">Role-Based Access</h3>
								<p className="text-sm text-slate-600">Ensure teachers, security personnel, and administrators only see the data relevant to their role.</p>
							</div>
						</div>

						<div className="flex items-start gap-4 p-4 lg:col-span-2">
							<div className="bg-slate-50 p-3 rounded-lg text-blue-700 shrink-0">
								<FileSearch className="size-6" />
							</div>
							<div>
								<h3 className="font-semibold text-slate-900 mb-1">Comprehensive Audit Logs</h3>
								<p className="text-sm text-slate-600">Track exactly who accessed student movement histories and when, ensuring full accountability across your entire district staff. (Available in Complete HallGuardian).</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Final CTA Section */}
			<section className="py-16 bg-blue-900 text-center">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto">
						<h2 className="text-3xl font-bold text-white mb-6">
							Ready to Secure Your Campus?
						</h2>
						<p className="text-lg text-blue-100 mb-8">
							Modernize your school's attendance and tracking protocols today. Let us show you how simple implementation can be.
						</p>
						<Link to="/contact">
							<Button size="lg" className="text-lg px-8 py-6 rounded-xl bg-white text-blue-900 hover:bg-slate-100 shadow-md">
								Schedule Your Demo
							</Button>
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
