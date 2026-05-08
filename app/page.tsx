import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { HeroAuthButtons } from "@/components/ui/hero-auth-buttons";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { StudioBranding } from "@/components/ui/studio-branding";
import { FlickeringGridDemo } from "@/components/ui/flickering-grid-demo";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Sparkles } from "lucide-react";

export default function Home() {
	return (
		<main className="relative min-h-screen bg-black">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'WebApplication',
						name: 'PostPipe Studio',
						description: 'Design production-ready APIs, databases, and logic visually. Transform complex requirements into elegant architecture without writing boilerplate code.',
						url: 'https://studio.postpipe.in',
						applicationCategory: 'DeveloperApplication',
						operatingSystem: 'Any',
						creator: {
							'@type': 'Organization',
							name: 'PostPipe',
							url: 'https://postpipe.in',
						},
					}).replace(/</g, '\\u003c'),
				}}
			/>
			<Navbar />

			{/* Fixed Background Layer (Client Component) */}
			<div className="fixed inset-0 z-0 pointer-events-none">
				<BackgroundGradientAnimation
					gradientBackgroundStart="rgb(10, 10, 20)"
					gradientBackgroundEnd="rgb(0, 0, 0)"
					containerClassName="h-full w-full"
				/>
			</div>

			{/* Static Content Layer (Prerendered) */}
			<div className="relative z-10">
				{/* Hero Section */}
				<section className="relative min-h-[75vh] flex items-center pt-20 pb-0">
					<div className="mx-auto max-w-7xl px-8 w-full">
						<div className="grid grid-cols-1 gap-16 items-center lg:grid-cols-2 w-full">
							{/* Left Content */}
							<div className="text-left">
								<h1 className="mb-4 text-6xl font-extrabold tracking-tighter text-white sm:text-8xl leading-[0.9]">
									Design your <br />
									<span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">backend.</span>
								</h1>
								<p className="mb-12 text-xl leading-relaxed text-zinc-300 sm:text-2xl max-w-xl font-medium">
									APIs, databases, and logic — <br />
									designed, not coded.
								</p>
								<HeroAuthButtons />
							</div>

							{/* Right Content - Flickering Grid Hero */}
							<div className="relative flex items-center justify-center lg:justify-end scale-110">
								<div className="w-full max-w-[550px]">
									<FlickeringGridDemo />
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Product Container Scroll Section */}
				<section className="relative w-full px-4">
					<ContainerScroll
						titleComponent={
							<div className="flex flex-col items-center">
								<h2 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30 tracking-tighter leading-tight mb-4">
									Powerful Visual Logic
								</h2>
								<p className="text-zinc-400 text-lg md:text-xl max-w-xl mx-auto font-medium">
									Transform complex requirements into elegant architecture with our intuitive design engine.
								</p>
							</div>
						}
					>
						{/* App Mockup stays the same but is now inside the 3D scroll card */}
						<div className="relative overflow-hidden w-full h-full bg-zinc-950 border border-white/5 flex flex-col">
							{/* Mockup Toolbar */}
							<div className="h-10 bg-zinc-900 border-b border-white/5 flex items-center px-4 space-x-2">
								<div className="flex space-x-1.5">
									<div className="w-3 h-3 rounded-full bg-red-500/50" />
									<div className="w-3 h-3 rounded-full bg-yellow-500/50" />
									<div className="w-3 h-3 rounded-full bg-green-500/50" />
								</div>
								<div className="flex-1 text-center">
									<div className="inline-block px-3 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-500 lowercase">studio.postpipe.in/canvas</div>
								</div>
							</div>

							{/* Mockup Content */}
							<div className="flex-1 p-8 flex space-x-6">
								{/* Sidebar */}
								<div className="w-48 space-y-3">
									<div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Components</div>
									{['User Auth', 'Data Models', 'API Routes', 'Webhooks', 'Functions'].map(item => (
										<div key={item} className="h-9 rounded-lg bg-zinc-900 border border-white/5 w-full flex items-center px-3 space-x-2">
											<div className="w-2 h-2 rounded-full bg-zinc-700" />
											<div className="text-[10px] text-zinc-500 font-medium">{item}</div>
										</div>
									))}
								</div>

								{/* Grid Content / Canvas */}
								<div className="flex-1 relative rounded-xl border border-dashed border-white/10 bg-zinc-900/30 grid grid-cols-2 gap-6 p-6 overflow-hidden">
									{/* Background Grid Pattern */}
									<div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

									{/* Node 1: Auth */}
									<div className="relative h-32 rounded-2xl bg-zinc-900/80 border border-purple-500/30 p-4 shadow-2xl shadow-purple-500/10 backdrop-blur-sm group/node">
										<div className="flex items-center space-x-2 mb-3">
											<div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
												<div className="w-3 h-3 bg-purple-400 rounded-sm" />
											</div>
											<div className="text-[11px] font-bold text-white">Auth Engine</div>
										</div>
										<div className="space-y-2">
											<div className="w-full h-1.5 rounded bg-white/5" />
											<div className="w-2/3 h-1.5 rounded bg-white/5" />
										</div>
										<div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-500 border-2 border-zinc-900" />
									</div>

									{/* Node 2: Database */}
									<div className="relative h-32 rounded-2xl bg-zinc-900/80 border border-emerald-500/30 p-4 shadow-2xl shadow-emerald-500/10 backdrop-blur-sm group/node">
										<div className="flex items-center space-x-2 mb-3">
											<div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
												<div className="w-3 h-3 bg-emerald-400 rounded-sm" />
											</div>
											<div className="text-[11px] font-bold text-white">Primary DB</div>
										</div>
										<div className="space-y-2">
											<div className="w-full h-1.5 rounded bg-white/5" />
											<div className="w-1/2 h-1.5 rounded bg-white/5" />
										</div>
										<div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900" />
									</div>

									{/* Connecting Line (Visual) */}
									<svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
										<path d="M 240 100 Q 300 100 350 100" stroke="#a855f7" strokeWidth="2" fill="none" strokeDasharray="4 4" />
									</svg>

									{/* Floating Node (Piko's Work) */}
									<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-24 rounded-2xl bg-zinc-800/90 border border-cyan-500/50 shadow-[0_0_50px_rgba(34,211,238,0.2)] p-4 flex flex-col justify-between backdrop-blur-md animate-pulse">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-2">
												<div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/40">
													<Sparkles className="w-4 h-4 text-white" />
												</div>
												<div className="space-y-0.5">
													<div className="text-[10px] font-black text-white uppercase tracking-tighter">Piko AI</div>
													<div className="text-[8px] text-cyan-400 font-mono">Architecting...</div>
												</div>
											</div>
											<div className="text-[8px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">LIVE</div>
										</div>
										<div className="space-y-1.5">
											<div className="w-full h-1 rounded bg-white/20" />
											<div className="w-4/5 h-1 rounded bg-white/10" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</ContainerScroll>
				</section>

				<div className="h-24" />
			</div>
			<Footer />
			<StudioBranding />
		</main>
	);
}
