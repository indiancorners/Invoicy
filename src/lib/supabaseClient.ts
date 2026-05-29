import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase is configured for Clerk third-party auth: the `accessToken` callback
// hands Supabase the current Clerk session token on every request, so RLS
// policies can read the Clerk user id from `auth.jwt()->>'sub'`. Anonymous
// visitors (e.g. the public /preview page) have no session — the callback
// returns null and those reads go through SECURITY DEFINER RPCs instead.
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  accessToken: async () => {
    const clerk = (window as any).Clerk;
    try {
      return (await clerk?.session?.getToken()) ?? null;
    } catch {
      return null;
    }
  },
});
