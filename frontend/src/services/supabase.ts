import { createClient } from '@supabase/supabase-js';

// Read strictly from environment variables without hardcoded client-side keys
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

let clientInstance: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  } catch (err) {
    console.warn('[Supabase] Init warning:', err);
  }
}

if (!clientInstance) {
  console.warn('[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not provided, creating safe fallback client');
  
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
