import { getServerUserProfile, validateApiKey } from "@/app/actions/auth";

export const POSTPIPE_URL = process.env.NEXT_PUBLIC_POSTPIPE_URL || 'https://postpipe.in';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  provider: string;
  image?: string;
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
  // 1. Prioritize Piko API key from localStorage
  if (typeof window !== 'undefined') {
    const apiKey = localStorage.getItem('piko_api_key');
    if (apiKey) {
      // Use validateApiKey which uses the correct x-piko-api-key header
      const pikoProfile = await validateApiKey(apiKey);
      if (pikoProfile) return pikoProfile;
    }
  }

  // 2. Fallback: Try session-based auth (cookies)
  return await getServerUserProfile();
}
