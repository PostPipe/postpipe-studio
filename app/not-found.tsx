import Link from "next/link";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-40">
        <BackgroundGradientAnimation 
          gradientBackgroundStart="rgb(10, 10, 30)"
          gradientBackgroundEnd="rgb(0, 0, 0)"
          containerClassName="h-full w-full"
        />
      </div>

      <div className="relative z-10 text-center px-4">
        <h1 className="text-8xl md:text-[12rem] font-extrabold text-white tracking-tighter mb-4 opacity-20">
          404
        </h1>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Page Not Found
          </h2>
          <p className="text-zinc-400 text-lg mb-12 max-w-md mx-auto">
            The architect seems to have missed this part of the design.
          </p>
          <Link 
            href="/" 
            className="inline-block bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-all shadow-2xl"
          >
            Back to Studio
          </Link>
        </div>
      </div>
    </main>
  );
}
