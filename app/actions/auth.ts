'use server';

import { cookies } from 'next/headers';
import { POSTPIPE_URL, UserProfile } from "@/lib/auth-client";

export async function getServerUserProfile(manualToken?: string): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  
  // Try manual token first (API key login), then fall back to cookies only
  const token = manualToken ||
                cookieStore.get('token')?.value || 
                cookieStore.get('postpipe_auth')?.value ||
                cookieStore.get('piko_token')?.value ||
                cookieStore.get('__Secure-next-auth.session-token')?.value;
                
  const userSession = process.env.POSTPIPE_USER_SESSION || 
                      cookieStore.get('user_session')?.value ||
                      cookieStore.get('postpipe_session')?.value ||
                      cookieStore.get('session')?.value;

  if (!token) {
    console.log("[Auth] No token found in cookies or environment.");
    return null;
  }

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

/**
 * Validates a Piko API key (pp_piko_...) by calling the Postpipe Piko API
 * using the correct x-piko-api-key header.
 * Returns a synthetic UserProfile on success, null if the key is invalid.
 */
export async function validateApiKey(apiKey: string): Promise<UserProfile | null> {
  if (!apiKey || !apiKey.trim()) return null;

  const key = apiKey.trim();

  // Only accept keys in the expected pp_piko_... format
  if (!key.startsWith('pp_piko_')) {
    return null;
  }

  try {
    // Use www.postpipe.in to avoid 308 redirect from bare postpipe.in
    const res = await fetch(`https://www.postpipe.in/api/piko/v1/auth-presets`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-piko-api-key': key,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      // A successful response with the 'success' field confirms the key is valid
      if (data && data.success === true) {
        // Derive a stable user ID from the key (last 16 chars of the key)
        const keyId = key.replace('pp_piko_', '').substring(0, 16);
        return {
          id: `piko_${keyId}`,
          name: 'Postpipe User',
          email: '',
          provider: 'piko_api_key',
        } as UserProfile;
      }
    }

    console.warn('[Auth] API key validation failed. Status:', res.status);
    return null;
  } catch (error) {
    console.error('[Auth] API key validation error:', error);
    return null;
  }
}
