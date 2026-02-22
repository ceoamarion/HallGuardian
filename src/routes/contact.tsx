import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Clock, ShieldCheck, Database, Building, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
	component: AccountCreationPage,
});

const accountSchema = z.object({
	school_name: z.string().min(2, "School name is required"),
	district: z.string().optional(),
	role: z.string().min(2, "Role is required"),
	work_email: z.string().email("Please enter a valid work email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	student_count: z.number().min(1, "Student count is required"),
});

type AccountFormData = z.infer<typeof accountSchema>;

function AccountCreationPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const form = useForm<AccountFormData>({
		resolver: zodResolver(accountSchema),
		defaultValues: {
			school_name: "",
			district: "",
			role: "",
			work_email: "",
			password: "",
			student_count: 0,
		},
	});

	async function onSubmit(values: AccountFormData) {
		setIsSubmitting(true);
		try {
			// Simulate secure account creation & demo staging
			await new Promise(resolve => setTimeout(resolve, 1500));
			setIsSubmitted(true);
			toast.success("Account created securely.");
			window.scrollTo({ top: 0, behavior: "smooth" });
		} catch (error) {
			toast.error("Failed to process account setup. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	}

	if (isSubmitted) {
		return (
			<div className="py-16 bg-slate-50 min-h-screen">
				<div className="container mx-auto px-4">
					<Card className="max-w-2xl mx-auto border-blue-100 shadow-md">
						<CardHeader className="bg-blue-50/50 border-b border-blue-50 text-center pb-8 pt-10">
							<Clock className="size-16 text-blue-700 mx-auto mb-4" />
							<CardTitle className="text-3xl font-bold text-blue-900">
								Account Created: Demo Pending
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-8 pb-10 px-8 text-center">
							<p className="text-lg text-slate-700 mb-6 leading-relaxed">
								Your administrative account has been staged securely. To ensure FERPA compliance and protect our school networks, core features remain restricted until your district's identity is verified during your upcoming demonstration.
							</p>
							<div className="bg-slate-50 border border-slate-100 p-6 rounded-xl text-left mb-8">
								<h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
									<ShieldCheck className="size-5 text-blue-700" />
									Next Steps for Validation
								</h3>
								<ul className="space-y-3">
									<li className="flex gap-3 text-slate-600 text-sm">
										<span className="font-bold text-blue-700">1.</span>
										A HallGuardian integration specialist will contact you within 24 hours.
									</li>
									<li className="flex gap-3 text-slate-600 text-sm">
										<span className="font-bold text-blue-700">2.</span>
										We will verify your institutional credentials and discuss your tracking requirements.
									</li>
									<li className="flex gap-3 text-slate-600 text-sm">
										<span className="font-bold text-blue-700">3.</span>
										Full dashboard access and trial hardware planning will be unlocked following verification.
									</li>
								</ul>
							</div>
							<p className="text-sm text-slate-500">
								Status: <span className="font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Prospective District</span>
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-slate-50 min-h-screen">
			{/* Hero Section */}
			<section className="bg-white py-12 border-b border-slate-200">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
							Create Account & Request Demo
						</h1>
						<p className="text-lg text-slate-600">
							To uphold strict FERPA guidelines and protect our existing infrastructure, we require all prospective schools and administrators to complete a verified account staging process prior to product demonstrations.
						</p>
					</div>
				</div>
			</section>

			{/* Form Section */}
			<section className="py-12 md:py-16">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
						{/* Form */}
						<Card className="lg:col-span-2 shadow-md border-slate-200">
							<CardHeader className="bg-white border-b border-slate-100 pb-6">
								<CardTitle className="text-2xl text-slate-900">Administrator Details</CardTitle>
								<CardDescription className="text-base text-slate-600 mt-1">
									Please provide accurate institutional information to expedite verification.
								</CardDescription>
							</CardHeader>
							<CardContent className="pt-6">
								<Form {...form}>
									<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<FormField
												control={form.control}
												name="school_name"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-slate-800">School Name <span className="text-red-600">*</span></FormLabel>
														<FormControl>
															<Input className="bg-white" placeholder="Lincoln High School" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="district"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-slate-800">District <span className="text-slate-400 font-normal">(Optional)</span></FormLabel>
														<FormControl>
															<Input className="bg-white" placeholder="Lincoln County SD" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<FormField
												control={form.control}
												name="role"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-slate-800">Your Role / Title <span className="text-red-600">*</span></FormLabel>
														<FormControl>
															<Input className="bg-white" placeholder="e.g. Principal, IT Director" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="student_count"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-slate-800">Approximate Student Count <span className="text-red-600">*</span></FormLabel>
														<FormControl>
															<Input
																className="bg-white"
																type="number"
																placeholder="1200"
																{...field}
																onChange={(e) => field.onChange(Number(e.target.value))}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<div className="pt-4 pb-2 border-b border-slate-100">
											<h3 className="text-lg font-medium text-slate-900 pb-2">Account Security</h3>
										</div>

										<FormField
											control={form.control}
											name="work_email"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-slate-800">District / Work Email <span className="text-red-600">*</span></FormLabel>
													<FormControl>
														<Input className="bg-white" type="email" placeholder="j.smith@lincoln.edu" {...field} />
													</FormControl>
													<FormDescription className="text-xs">
														Personal email addresses (Gmail, Yahoo) may delay verification.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="password"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-slate-800">Secure Password <span className="text-red-600">*</span></FormLabel>
													<FormControl>
														<Input className="bg-white" type="password" placeholder="••••••••" {...field} />
													</FormControl>
													<FormDescription className="text-xs">
														Must be at least 8 characters. Will be used to access your district portal post-verification.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>

										<Button type="submit" size="lg" className="w-full mt-4 bg-blue-700 hover:bg-blue-800 text-white shadow-sm" disabled={isSubmitting}>
											{isSubmitting ? (
												<span className="flex items-center gap-2">
													<Lock className="size-4 animate-pulse" /> Processing Securely...
												</span>
											) : (
												<span className="flex items-center gap-2">
													<Lock className="size-4" /> Create Account & Request Demo
												</span>
											)}
										</Button>
									</form>
								</Form>
							</CardContent>
							<CardFooter className="bg-slate-50 border-t border-slate-100 rounded-b-xl py-4 flex justify-center">
								<p className="text-xs text-slate-500 flex items-center gap-2">
									<ShieldCheck className="size-4" /> SSL Encrypted & SOC 2 Type II Compliant Infrastructure
								</p>
							</CardFooter>
						</Card>

						{/* Sidebar Security Trust Badges */}
						<div className="space-y-6">
							<Card className="border-slate-200 shadow-sm border-t-4 border-t-blue-700">
								<CardHeader>
									<CardTitle className="text-lg text-blue-900">Why an Account?</CardTitle>
								</CardHeader>
								<CardContent className="space-y-5">
									<div className="flex gap-4 items-start">
										<ShieldCheck className="size-6 text-blue-600 shrink-0 mt-0.5" />
										<div>
											<h4 className="font-semibold text-sm text-slate-900">Access Control</h4>
											<p className="text-sm text-slate-600 mt-1">Staging an account verifies that only credentialed K-12 personnel access our tracking systems.</p>
										</div>
									</div>
									<div className="flex gap-4 items-start">
										<Database className="size-6 text-blue-600 shrink-0 mt-0.5" />
										<div>
											<h4 className="font-semibold text-sm text-slate-900">Dedicated Silos</h4>
											<p className="text-sm text-slate-600 mt-1">Creating your account immediately spins up an isolated, district-specific data silo for the demo.</p>
										</div>
									</div>
									<div className="flex gap-4 items-start">
										<Building className="size-6 text-blue-600 shrink-0 mt-0.5" />
										<div>
											<h4 className="font-semibold text-sm text-slate-900">Tailored Experience</h4>
											<p className="text-sm text-slate-600 mt-1">Pricing and deployment scenarios are modeled securely using your exact campus configurations.</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-slate-100 border-none shadow-none text-center p-6">
								<p className="text-sm text-slate-600 italic">
									"The verification process gave our school board immense confidence in HallGuardian's data privacy protocols before we ever saw the product."
								</p>
								<p className="text-xs font-semibold text-slate-800 mt-3">— Administrator, Columbus OH</p>
							</Card>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
