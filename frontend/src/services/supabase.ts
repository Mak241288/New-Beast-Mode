import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {
    // Ignore env resolution failure
  }
  return fallback;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'https://dqvvylgrxaztyaxskzby.supabase.co');
const supabaseAnonKey = getEnv(
  'VITE_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdnZ5bGdyeGF6dHlheHNremJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NDkyMzQsImV4cCI6MjEwMjQyNTIzNH0.kBsOAnaQUECHNw21VXErvEqC0mQ1YjySZwDUKk0Je6k'
);

let clientInstance: any = null;

try {
  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} catch (err) {
  console.warn('[Supabase] Init warning, creating safe fallback client:', err);
  
  const createChainableMock = (): any => {
    const fn: any = () => createChainableMock();
    return new Proxy(fn, {
      get: (_target, prop) => {
        if (prop === 'then') {
          return (resolve: any) => resolve({ data: null, error: null });
        }
        if (prop === 'single' || prop === 'maybeSingle') {
          return async () => ({ data: null, error: null });
        }
        return createChainableMock();
      },
      apply: () => createChainableMock(),
    });
  };

  clientInstance = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signUp: async () => ({ data: { user: null, session: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
      signInWithOAuth: async () => ({ data: { provider: 'google', url: '' }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      updateUser: async () => ({ data: { user: null }, error: null }),
      verifyOtp: async () => ({ data: { user: null, session: null }, error: null }),
    },
    from: () => createChainableMock(),
  };
}

export const supabase = clientInstance;
export const supabaseClient = clientInstance;
export default supabase;
