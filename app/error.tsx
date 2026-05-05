'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-40">
        <BackgroundGradientAnimation 
          gradientBackgroundStart="rgb(30, 10, 10)"
          gradientBackgroundEnd="rgb(0, 0, 0)"
          containerClassName="h-full w-full"
        />
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
          Something went wrong
        </h2>
        <p className="text-zinc-400 text-lg mb-12">
          An unexpected error occurred in the engine. Our architects have been notified.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-zinc-200 transition-all shadow-2xl"
          >
            Try again
          </button>
          <Link 
            href="/" 
            className="bg-zinc-900 text-white border border-white/10 px-8 py-3 rounded-full font-bold hover:bg-zinc-800 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
