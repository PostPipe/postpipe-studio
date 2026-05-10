'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { validateApiKey } from "@/app/actions/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!apiKey.trim()) {
      setError("Please enter your API key.");
      return;
    }

    setIsLoading(true);
    try {
      // Validate against the Postpipe API — this is a server action,
      // so it runs on the server and the user cannot bypass it.
      const profile = await validateApiKey(apiKey.trim());

      if (!profile) {
        setError("Invalid API key. Please check your key and try again.");
        setIsLoading(false);
        return;
      }

      // Key is valid — save it and redirect
      localStorage.setItem('piko_api_key', apiKey.trim());
      toast.success(`Welcome, ${profile.name || profile.email}!`, {
        description: "API Key verified. Launching Studio...",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      });
      setIsLoading(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Auth error:", err);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-zinc-950 border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.8)] p-8"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Manual Login</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Enter your PostPipe API key to sync your session.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                  Piko API Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Sparkles className="w-4 h-4 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    autoFocus
                    type="password"
                    placeholder="pp_piko_..."
                    value={apiKey}
                    onChange={(e) => { setApiKey(e.target.value); setError(null); }}
                    className={`w-full h-14 bg-white/5 border rounded-2xl pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-4 transition-all ${
                      error
                        ? 'border-red-500/60 focus:border-red-500/80 focus:ring-red-500/10'
                        : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/5'
                    }`}
                  />
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-red-400 text-xs mt-2 ml-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center space-x-2 shadow-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Sync Session</span>
                )}
              </button>

              <p className="text-center text-[10px] text-zinc-600">
                You can find your API key in the PostPipe dashboard under Settings &gt; API.
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
