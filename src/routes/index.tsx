import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, IdCard, Waypoints, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div>
			{/* Hero Section */}
			<section className="bg-gradient-to-b from-blue-50 to-white py-20">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center">
						<h1 className="text-5xl font-bold text-gray-900 mb-6">
							Student Safety & Real-Time Tracking for Schools
						</h1>
						<p className="text-xl text-gray-600 mb-8">
							Streamline attendance and secure your hallways with QR codes, NFC ID cards, or a powerful hybrid system built for K-12. Fully FERPA-compliant and designed for educators.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link to="/contact">
								<Button size="lg" className="text-lg px-8 py-6">
									Request a Demo
								</Button>
							</Link>
							<Link to="/pricing">
								<Button size="lg" variant="outline" className="text-lg px-8 py-6">
									View Plans
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
						How HallGuardian Works
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto bg-blue-100 p-4 rounded-full mb-4 w-fit">
									<QrCode className="size-10 text-blue-600" />
								</div>
								<CardTitle className="text-xl">QR Code Scanning</CardTitle>
								<CardDescription className="text-base mt-2">
									Students scan their personal QR codes on entry and exit using district-provided tablets or their own devices.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto bg-blue-100 p-4 rounded-full mb-4 w-fit">
									<IdCard className="size-10 text-blue-600" />
								</div>
								<CardTitle className="text-xl">NFC ID Cards</CardTitle>
								<CardDescription className="text-base mt-2">
									Equip students with NFC-enabled badges for rapid, tap-and-go check-ins at strategically placed school scanners.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="text-center hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="mx-auto bg-blue-100 p-4 rounded-full mb-4 w-fit">
									<Waypoints className="size-10 text-blue-600" />
								</div>
								<CardTitle className="text-xl">Hybrid QR + NFC</CardTitle>
								<CardDescription className="text-base mt-2">
									Combine both technologies for the ultimate flexiblity. Use NFC at main entrances and QR codes in individual classrooms.
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
			</section>

			{/* Trust Section */}
			<section className="bg-blue-50 py-16 text-center">
				<div className="container mx-auto px-4 max-w-3xl">
					<ShieldCheck className="size-16 text-blue-600 mx-auto mb-6" />
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Built for K-12 Security and Compliance
					</h2>
					<p className="text-lg text-gray-700">
						HallGuardian was engineered with student privacy at its core. Our platform gives administrators exactly the data they need to ensure campus safety, while operating in strict adherence to federal FERPA regulations and local privacy guidelines.
					</p>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<Card className="bg-gradient-to-r from-blue-600 to-blue-800 border-none text-white shadow-xl">
						<CardContent className="py-16">
							<div className="max-w-3xl mx-auto text-center">
								<h2 className="text-4xl font-bold mb-6">
									Ready to Secure Your Campus?
								</h2>
								<p className="text-xl mb-10 text-blue-100">
									Join districts across the country already using HallGuardian to improve real-time attendance tracking and enhance student safety.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Link to="/contact">
										<Button size="lg" variant="secondary" className="text-lg px-8 py-6 text-blue-700 bg-white hover:bg-gray-100">
											Schedule Your Demo
										</Button>
									</Link>
									<Link to="/pricing">
										<Button size="lg" variant="outline" className="text-lg px-8 py-6 text-white border-white hover:bg-white/10 hover:text-white">
											View Our Plans
										</Button>
									</Link>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
