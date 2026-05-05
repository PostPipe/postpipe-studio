'use client';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUserProfile, UserProfile, POSTPIPE_URL } from "@/lib/auth-client";
import { AuthModal } from "./auth-modal";

export function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const profile = await fetchUserProfile();
      setUser(profile);

      const apiKey = localStorage.getItem('piko_api_key');
      setHasApiKey(!!apiKey);

      setLoading(false);
    }
    checkAuth();
  }, []);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="flex items-center justify-between w-full max-w-7xl px-8 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full shadow-2xl">
        <Link href="/" className="flex items-center space-x-3 group active:scale-95 transition-transform">
          <Image
            src="/Postpipe-Studio.svg"
            alt="Postpipe Studio Logo"
            width={40}
            height={40}
            className="h-10 w-auto transition-transform group-hover:rotate-6"
          />
          <span className="text-xl font-bold text-white tracking-tight">Postpipe Studio</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-white/80">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors">How it works</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          <Link href={`${POSTPIPE_URL}/dashboard`} className="hover:text-white transition-colors">Postpipe</Link>
        </div>

        <div className="flex items-center space-x-4">
          {!loading && (
            <>
              {(user || hasApiKey) ? (
                <Link
                  href="/canvas"
                  className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all shadow-lg whitespace-nowrap"
                >
                  Launch Canvas
                </Link>
              ) : (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all shadow-lg whitespace-nowrap"
                >
                  Login with Key
                </button>
              )}
            </>
          )}
        </div>
      </nav>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
