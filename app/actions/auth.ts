'use server';

import { cookies } from 'next/headers';
import { POSTPIPE_URL, UserProfile } from "@/lib/auth-client";

export async function getServerUserProfile(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  
  // Try environment variables first, then fallback to cookies
  const token = process.env.POSTPIPE_TOKEN || cookieStore.get('token')?.value;
  const userSession = process.env.POSTPIPE_USER_SESSION || cookieStore.get('user_session')?.value;

  if (!token) return null;

  try {
    const res = await fetch(`${POSTPIPE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        // Send tokens in Cookie header since the API expects them there
        'Cookie': `token=${token}; user_session=${userSession}`,
        // Also send as Bearer token as a backup if the API supports it
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (res.ok) {
      return await res.json();
    }
    
    const errorData = await res.json().catch(() => ({}));
    console.warn("Auth proxy failed:", res.status, errorData);
    return null;
  } catch (error) {
    console.error("Error in server auth proxy:", error);
    return null;
  }
}
