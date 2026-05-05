'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { fetchUserProfile, UserProfile, POSTPIPE_URL } from "@/lib/auth-client";
import { checkUserCanvases } from "@/app/actions/canvas";
import { AuthModal } from "./auth-modal";

export function HeroAuthButtons() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hasCanvases, setHasCanvases] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const profile = await fetchUserProfile();
        setUser(profile);
        
        const apiKey = localStorage.getItem('piko_api_key');
        setHasApiKey(!!apiKey);

        if (profile) {
          const result = await checkUserCanvases(profile.id);
          setHasCanvases(result.hasCanvases);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-start space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 h-14">
        <div className="h-14 w-40 rounded-full bg-white/10 animate-pulse" />
        <div className="h-14 w-40 rounded-full bg-white/5 animate-pulse" />
      </div>
    );
  }

  const isLoggedIn = user || hasApiKey;

  return (
    <>
      <div className="flex flex-col items-center justify-start space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        {isLoggedIn ? (
          <Link
            href="/canvas"
            className="group flex h-14 w-full items-center justify-center space-x-2 rounded-full bg-white px-8 font-bold text-black transition-all hover:bg-zinc-200 sm:w-auto hover:scale-105 active:scale-95 shadow-xl"
          >
            <span>{hasCanvases ? "Launch Canvas" : "Launch Studio"}</span>
            <MoveRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex h-14 w-full items-center justify-center space-x-2 rounded-full bg-white px-8 font-bold text-black transition-all hover:bg-zinc-200 sm:w-auto hover:scale-105 active:scale-95 shadow-xl"
          >
            <span>Login with Key</span>
            <MoveRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        )}
        <Link
          href="https://github.com"
          className="flex h-14 w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 sm:w-auto hover:border-white/40 shadow-lg"
        >
          GitHub Repo
        </Link>
      </div>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
