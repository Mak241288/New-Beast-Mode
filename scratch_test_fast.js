const SUPABASE_REST_URL = 'https://dqvvylgrxaztyaxskzby.supabase.co/rest/v1/temp_sync';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdnZ5bGdyeGF6dHlheHNremJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NDkyMzQsImV4cCI6MjEwMjQyNTIzNH0.kBsOAnaQUECHNw21VXErvEqC0mQ1YjySZwDUKk0Je6k';

async function testFastService() {
  const t0 = Date.now();
  const pin = '334455';
  const payload = { athlete: 'Captain Beast', exercisesCount: 42 };

  // Upload
  const upRes = await fetch(SUPABASE_REST_URL, {
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
      expiresAt: new Date(Date.now() + 120000).toISOString(),
    }),
  });
  console.log(`Upload time: ${Date.now() - t0}ms, status: ${upRes.status}`);

  // Fetch
  const t1 = Date.now();
  const getRes = await fetch(`${SUPABASE_REST_URL}?code=eq.${pin}&select=*`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  const rows = await getRes.json();
  console.log(`Fetch time: ${Date.now() - t1}ms, retrieved rows:`, rows.length);
  console.log('Total roundtrip time:', Date.now() - t0, 'ms');
}

testFastService();
