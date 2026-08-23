const SUPABASE_REST_URL = 'https://dqvvylgrxaztyaxskzby.supabase.co/rest/v1/temp_sync';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdnZ5bGdyeGF6dHlheHNremJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NDkyMzQsImV4cCI6MjEwMjQyNTIzNH0.kBsOAnaQUECHNw21VXErvEqC0mQ1YjySZwDUKk0Je6k';

export const cloudSyncService = {
  /**
   * Uploads full workout & athlete snapshot with 6-digit PIN (2 minutes expiration)
   */
  async uploadPin(pin: string, payload: any, expTime: number): Promise<boolean> {
    try {
      const res = await fetch(SUPABASE_REST_URL, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          code: pin,
          payload: JSON.stringify(payload),
          expiresAt: new Date(expTime).toISOString(),
        }),
      });
      return res.ok || res.status === 201 || res.status === 200;
    } catch (err) {
      console.warn('[CloudSync] Upload PIN failed:', err);
      return false;
    }
  },

  /**
   * Fetches full workout snapshot by 6-digit PIN
   */
  async fetchPin(pin: string): Promise<{ success: boolean; data?: any; expired?: boolean; error?: string }> {
    try {
      const cleanPin = pin.trim();
      const res = await fetch(`${SUPABASE_REST_URL}?code=eq.${encodeURIComponent(cleanPin)}&select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}` };
      }

      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) {
        return { success: false, error: 'NOT_FOUND' };
      }

      const row = rows[0];
      if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) {
        return { success: false, expired: true };
      }

      const parsed = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;

      // Auto-cleanup used PIN in background
      fetch(`${SUPABASE_REST_URL}?code=eq.${encodeURIComponent(cleanPin)}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }).catch(() => {});

      return { success: true, data: parsed };
    } catch (err: any) {
      return { success: false, error: err?.message || 'FETCH_FAILED' };
    }
  },
};
