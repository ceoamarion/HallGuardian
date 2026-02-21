import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/pricing")({
	component: PricingPage,
});

function PricingPage() {
	return (
		<div>
			{/* Hero Section */}
			<section className="bg-gradient-to-b from-blue-50 to-white py-16">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="text-4xl font-bold text-gray-900 mb-4">
							Simple, Transparent Pricing for Schools
						</h1>
						<p className="text-lg text-gray-600">
							Choose the plan that best fits your district's security, technology, and tracking requirements.
						</p>
					</div>
				</div>
			</section>

			{/* Pricing Tiers */}
			<section className="py-16 bg-white">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
						{/* Tier 1 */}
						<Card className="flex flex-col relative">
							<CardHeader>
								<CardTitle className="text-2xl text-gray-900">QR Essentials</CardTitle>
								<CardDescription className="text-base h-10 mt-2">
									The core package for rapid deployment.
								</CardDescription>
								<div className="mt-6 mb-4">
									<span className="text-4xl font-bold text-gray-900">Tier 1</span>
								</div>
								<p className="text-sm text-gray-600">Lowest price tier</p>
							</CardHeader>
							<CardContent className="flex flex-col flex-1 mt-4">
								<ul className="space-y-4 flex-1">
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
										<span className="text-gray-700">QR scanning only</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
										<span className="text-gray-700">Basic admin dashboard</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
										<span className="text-gray-700">Completely FERPA-compliant</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
										<span className="text-gray-700">Standard email support</span>
									</li>
								</ul>
								<Link to="/contact" className="mt-8 block">
									<Button className="w-full text-lg py-6" variant="outline">
										Contact for Quote
									</Button>
								</Link>
							</CardContent>
						</Card>

						{/* Tier 2 */}
						<Card className="flex flex-col relative mt-4 md:mt-0">
							<CardHeader>
								<CardTitle className="text-2xl text-gray-900">NFC ID System</CardTitle>
								<CardDescription className="text-base h-10 mt-2">
									Card-based access for robust school security.
								</CardDescription>
								<div className="mt-6 mb-4">
									<span className="text-4xl font-bold text-gray-900">Tier 2</span>
								</div>
								<p className="text-sm text-gray-600">Hardware & software bundle</p>
							</CardHeader>
							<CardContent className="flex flex-col flex-1 mt-4">
								<ul className="space-y-4 flex-1">
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
										<span className="font-medium text-gray-900">Includes QR Essentials</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
										<span className="text-gray-700">Physical NFC student ID cards</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
										<span className="text-gray-700">NFC scanners professionally installed by HallGuardian</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
										<span className="text-gray-700">Faster throughput check-ins</span>
									</li>
								</ul>
								<Link to="/contact" className="mt-8 block">
									<Button className="w-full text-lg py-6" variant="outline">
										Contact for Quote
									</Button>
								</Link>
							</CardContent>
						</Card>

						{/* Tier 3: Most Popular */}
						<Card className="flex flex-col relative border-blue-600 border-2 shadow-lg scale-100 md:scale-105 z-10">
							<Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-sm bg-blue-600 hover:bg-blue-700">
								Most Popular
							</Badge>
							<CardHeader>
								<CardTitle className="text-2xl text-gray-900">Complete HallGuardian</CardTitle>
								<CardDescription className="text-base h-10 mt-2 text-gray-600">
									Maximum situational awareness for districts.
								</CardDescription>
								<div className="mt-6 mb-4">
									<span className="text-4xl font-bold text-blue-600">Tier 3</span>
								</div>
								<p className="text-sm text-gray-600">Ultimate hybrid system</p>
							</CardHeader>
							<CardContent className="flex flex-col flex-1 mt-4">
								<ul className="space-y-4 flex-1">
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
										<span className="font-medium text-gray-900">QR + NFC technologies combined</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
										<span className="text-gray-700">Advanced predictive analytics</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
										<span className="text-gray-700">Comprehensive admin controls and audit logs</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle2 className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
										<span className="text-gray-700">Priority business-hours support</span>
									</li>
								</ul>
								<Link to="/contact" className="mt-8 block">
									<Button className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700">
										Request a Demo
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* What's Included */}
			<section className="bg-blue-50 py-16">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto">
						<h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
							Every Plan Prioritizes School Security
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4">
								<CheckCircle2 className="size-6 text-blue-600 flex-shrink-0" />
								<div>
									<h3 className="font-semibold text-gray-900">FERPA Compliance</h3>
									<p className="text-sm text-gray-600">Strict adherence to federal privacy regulations regarding student data.</p>
								</div>
							</div>
							<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4">
								<CheckCircle2 className="size-6 text-blue-600 flex-shrink-0" />
								<div>
									<h3 className="font-semibold text-gray-900">Rapid Check-Ins</h3>
									<p className="text-sm text-gray-600">Designed to drastically decrease bottlenecking in hallways and entry points.</p>
								</div>
							</div>
							<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4">
								<CheckCircle2 className="size-6 text-blue-600 flex-shrink-0" />
								<div>
									<h3 className="font-semibold text-gray-900">Data Export</h3>
									<p className="text-sm text-gray-600">Export your data anytime for audit reports or external systems compatibility.</p>
								</div>
							</div>
							<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4">
								<CheckCircle2 className="size-6 text-blue-600 flex-shrink-0" />
								<div>
									<h3 className="font-semibold text-gray-900">Training & Onboarding</h3>
									<p className="text-sm text-gray-600">Dedicated onboarding to train your staff on operating HallGuardian efficiently.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
