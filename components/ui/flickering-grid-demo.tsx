"use client";
import { FlickeringGrid } from "@/components/ui/flickering-grid-hero";

const LOGO_PATH = "/Postpipe-Studio.svg";

// Define mask styles
const maskStyle = {
  WebkitMaskImage: `url('${LOGO_PATH}')`,
  WebkitMaskSize: 'contain',
  WebkitMaskPosition: 'center',
  WebkitMaskRepeat: 'no-repeat',
  maskImage: `url('${LOGO_PATH}')`,
  maskSize: 'contain',
  maskPosition: 'center',
  maskRepeat: 'no-repeat',
} as const;

// Grid configuration
const GRID_CONFIG = {
  background: {
    color: "#FFFFFF",
    maxOpacity: 0.15,
    flickerChance: 0.12,
    squareSize: 4,
    gridGap: 4,
  },
  logo: {
    color: "#FFFFFF",
    maxOpacity: 1,
    flickerChance: 0.1,
    squareSize: 2,
    gridGap: 3,
  },
} as const;

export const FlickeringGridDemo = () => {
  return (
   <div className="relative flex w-full h-[450px] sm:h-[550px] justify-center items-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0 motion-safe:animate-fade-in" 
        style={{
          ...maskStyle,
          animation: 'pulse 5s ease-in-out infinite',
        }}
      >
        <FlickeringGrid 
          {...GRID_CONFIG.logo} 
        />
      </div>
    </div>
  );
};
