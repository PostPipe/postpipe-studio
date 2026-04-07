'use client';
import { FlickeringGrid } from "@/components/ui/flickering-grid-hero";
import { motion } from "framer-motion";
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
});

export function StudioBranding() {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-black select-none">
      {/* Background Flickering Grid */}
      <div className="absolute inset-0 z-0 opacity-20">
        <FlickeringGrid
          color="#3b82f6"
          maxOpacity={0.15}
          flickerChance={0.08}
          squareSize={4}
          gridGap={6}
        />
      </div>

      {/* Antigravity Line Art (SVG) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full opacity-30">
          <motion.path
            d="M -100 100 Q 500 0 1200 100"
            stroke="url(#grad1)"
            strokeWidth="1"
            fill="transparent"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <motion.path
            d="M 1400 500 Q 800 600 -200 500"
            stroke="url(#grad2)"
            strokeWidth="1"
            fill="transparent"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="grad1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad2">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Giant Studio Text */}
      <div className="relative z-20 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            opacity: { duration: 1 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative"
        >
          {/* Intense Glow behind the text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />

          <h2 className={`${pacifico.className} text-[20vw] md:text-[25vw] leading-none text-white drop-shadow-[0_0_80px_rgba(6,182,212,0.4)]`}>
            Studio.
          </h2>

          {/* Vibrant Gradient Overlay for text */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-cyan-200 bg-clip-text text-transparent pointer-events-none mix-blend-overlay">
            studio.postpipe.in
          </div>
        </motion.div>
      </div>

      {/* Top Transition Overlay */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
    </section>
  );
}
