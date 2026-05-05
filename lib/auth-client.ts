import { getServerUserProfile } from "@/app/actions/auth";

export const POSTPIPE_URL = process.env.NEXT_PUBLIC_POSTPIPE_URL || 'https://postpipe.in';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  provider: string;
  image?: string;
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
  // 1. Try session-based auth (cookies)
  const profile = await getServerUserProfile();
  if (profile) return profile;

  // 2. Fallback: Try API-key based auth (localStorage)
  if (typeof window !== 'undefined') {
    const apiKey = localStorage.getItem('piko_api_key');
    if (apiKey) {
      return await getServerUserProfile(apiKey);
    }
  }

  return null;
}
