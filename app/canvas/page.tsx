'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, 
  Link2, 
  Server, 
  Settings, 
  User, 
  Sun, 
  Moon, 
  HelpCircle, 
  ArrowRight,
  Layout,
  Sparkles,
  ChevronRight,
  Monitor
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { PikoLogo } from "@/components/ui/piko-logo";

// --- Choice Screen Component ---
const ChoiceScreen = ({ onSelect }: { onSelect: (mode: string) => void }) => {
  return (
    <div className="relative z-10 max-w-6xl w-full mx-auto px-6 pt-24 pb-32">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold text-white tracking-tighter mb-4"
        >
          How do you want to <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">build?</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium"
        >
          Choose your starting point. You can always change your approach later.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* AI Mode */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => onSelect('ai')}
          className="group relative p-8 rounded-3xl bg-zinc-900/40 border border-white/10 backdrop-blur-xl overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 overflow-hidden p-3">
              <PikoLogo selected={true} className="w-full h-full" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Piko AI Driven</h3>
            <p className="text-zinc-400 mb-8 leading-relaxed font-medium">
              Describe your requirements and let Piko AI generate your backend architecture, workflows, and database schemas instantly.
            </p>
            <div className="flex items-center space-x-2 text-white font-bold group/btn">
              <span>Launch with AI</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </div>
          </div>
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recommended</div>
        </motion.div>

        {/* Manual Mode */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => onSelect('manual')}
          className="group relative p-8 rounded-3xl bg-zinc-900/40 border border-white/10 backdrop-blur-xl overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center mb-6">
              <Layout className="text-cyan-400 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Manual Visualization</h3>
            <p className="text-zinc-400 mb-8 leading-relaxed font-medium">
              Start with a blank canvas. Drag, drop, and connect nodes to design your backend logic exactly the way you want it.
            </p>
            <div className="flex items-center space-x-2 text-white font-bold group/btn">
              <span>Start Designing</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* MCP Setup Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm"
      >
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
            <Server className="text-zinc-400 w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white font-semibold">Self-Hosted MCP Server</h4>
            <p className="text-zinc-500 text-sm font-medium">Deploy and manage your own Model Context Protocol infrastructure.</p>
          </div>
        </div>
        <button onClick={() => onSelect('mcp')} className="px-6 py-2 rounded-full border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-colors">
          Setup MCP
        </button>
      </motion.div>
    </div>
  );
};

// --- Main Canvas Component ---
const StudioCanvas = () => {
  const [activeTab, setActiveTab] = useState('components');
  const [theme, setTheme] = useState('dark');

  const sidebarTools = [
    { id: 'components', icon: Layers, label: 'Components', color: 'text-cyan-400' },
    { id: 'connectivity', icon: Link2, label: 'Connectivity', color: 'text-emerald-400' },
    { id: 'piko', icon: PikoLogo, label: 'Piko AI', isPiko: true },
    { id: 'mcp', icon: Server, label: 'MCP Setup', color: 'text-purple-400' },
    { id: 'settings', icon: Settings, label: 'Settings', color: 'text-zinc-400' },
    { id: 'user', icon: User, label: 'User Info', color: 'text-blue-400' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#050506] overflow-hidden text-white">
      {/* --- Infinite Dot Grid Background --- */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #22d3ee 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* --- Sidebar (Left) --- */}
      <aside className="relative z-20 w-16 flex flex-col items-center py-6 bg-[#0a0a0b]/80 border-r border-white/5 backdrop-blur-2xl">
        <div className="mb-8">
          <Image src="/Postpipe-Studio.svg" alt="Logo" width={28} height={28} className="hover:rotate-12 transition-transform" />
        </div>

        <div className="flex-1 flex flex-col space-y-4">
          {sidebarTools.map((tool) => (
            <div key={tool.id} className="relative group">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab(tool.id)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === tool.id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tool.isPiko ? (
                  <PikoLogo 
                    selected={activeTab === tool.id} 
                    className="w-5 h-5" 
                  />
                ) : (
                  <tool.icon className={`w-5 h-5 ${activeTab === tool.id ? 'text-white' : tool.color}`} />
                )}
              </motion.button>
              
              {/* Tooltip Label */}
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all pointer-events-none shadow-2xl z-50">
                {tool.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 overflow-hidden border border-white/10">
             {/* Profile avatar placeholder */}
          </div>
        </div>
      </aside>

      {/* --- Main Workspace --- */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-12 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0b]/40 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">Project /</span>
            <span className="font-bold text-xs tracking-tight text-white/90">new-backend-service</span>
          </div>

          <div className="flex items-center space-x-3">
             <button className="p-1.5 rounded-md bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-zinc-400">
               <HelpCircle className="w-3.5 h-3.5" />
             </button>
             <div className="h-3 w-[1px] bg-white/10" />
             <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/5">
                <button 
                  onClick={() => setTheme('dark')}
                  className={`p-1 rounded-full transition-all ${theme === 'dark' ? 'bg-white text-black' : 'text-zinc-400'}`}
                >
                  <Moon className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => setTheme('light')}
                  className={`p-1 rounded-full transition-all ${theme === 'light' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}
                >
                  <Sun className="w-3 h-3" />
                </button>
             </div>
             <button className="bg-white text-black px-4 py-1.5 rounded-full font-bold text-[10px] hover:bg-zinc-200 transition-all shadow-lg active:scale-95">
               Deploy
             </button>
          </div>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 relative cursor-crosshair">
          {/* Welcome overlay if empty */}
          <div className="absolute inset-0 flex items-center justify-center p-20">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="max-w-md text-center"
            >
               <h2 className="text-2xl font-bold mb-4 opacity-80">Welcome to your empty Canvas</h2>
               <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                 Start by dragging nodes from the Components tab or ask Piko AI to generate your first structure.
               </p>
               <button className="flex items-center space-x-2 text-cyan-400 mx-auto font-bold text-sm hover:underline">
                 <span>Learn how it works</span>
                 <ChevronRight className="w-4 h-4" />
               </button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Root Component with State Switcher ---
export default function CanvasPage() {
  const [mode, setMode] = useState<string | null>(null);

  return (
    <AnimatePresence mode="wait">
      {mode ? (
        <motion.div
           key="canvas"
           initial={{ opacity: 0, scale: 1.05 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.5, ease: "circOut" }}
           className="h-full w-full"
        >
          <StudioCanvas />
        </motion.div>
      ) : (
        <motion.div
          key="choice"
          exit={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="relative min-h-screen bg-black w-full overflow-y-auto"
        >
          <div className="fixed inset-0 z-0 pointer-events-none">
            <BackgroundGradientAnimation 
              gradientBackgroundStart="rgb(10, 10, 20)"
              gradientBackgroundEnd="rgb(0, 0, 0)"
              containerClassName="h-full w-full"
            />
          </div>
          <ChoiceScreen onSelect={setMode} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
