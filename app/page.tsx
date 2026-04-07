import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { HeroAuthButtons } from "@/components/ui/hero-auth-buttons";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { StudioBranding } from "@/components/ui/studio-branding";
import { FlickeringGridDemo } from "@/components/ui/flickering-grid-demo";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export default function Home() {
	return (
		<main className="relative min-h-screen bg-black">
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
									<div className="inline-block px-3 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-500 lowercase">postpipe.ai/studio/v1</div>
								</div>
							</div>
							
							{/* Mockup Content */}
							<div className="flex-1 p-8 flex space-x-6">
								{/* Sidebar */}
								<div className="w-48 space-y-4">
									{[1,2,3,4].map(i => (
										<div key={i} className="h-8 rounded bg-zinc-900 border border-white/5 w-full" />
									))}
								</div>
								{/* Grid Content */}
								<div className="flex-1 relative rounded-lg border border-dashed border-white/10 bg-zinc-900/20 grid grid-cols-3 gap-6 p-6">
									{[1,2,3,4,5,6].map(i => (
										<div key={i} className="h-32 rounded-xl bg-zinc-900/50 border border-white/5 relative overflow-hidden group/card shadow-inner">
											<div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500/50 w-0 group-hover/card:w-full transition-all duration-500" />
										</div>
									))}
									{/* Floating Node */}
									<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-20 rounded-lg bg-zinc-800 border border-cyan-500/50 shadow-2xl shadow-cyan-500/20 p-3 flex items-center space-x-3 backdrop-blur-md">
										<div className="w-8 h-8 rounded-md bg-cyan-500 flex items-center justify-center">
											<div className="w-4 h-4 bg-white rounded-sm opacity-80" />
										</div>
										<div className="space-y-1">
											<div className="w-20 h-2 rounded bg-white/20" />
											<div className="w-12 h-2 rounded bg-white/10" />
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
