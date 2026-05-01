import { getServerUserProfile } from "@/app/actions/auth";

export const POSTPIPE_URL = process.env.NEXT_PUBLIC_POSTPIPE_URL || 'https://www.postpipe.in';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  provider: string;
  image?: string;
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
  // Now using the server action to bypass cross-domain cookie issues
  return await getServerUserProfile();
}
