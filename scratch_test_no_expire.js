const SUPABASE_REST_URL = 'https://dqvvylgrxaztyaxskzby.supabase.co/rest/v1/temp_sync';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdnZ5bGdyeGF6dHlheHNremJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NDkyMzQsImV4cCI6MjEwMjQyNTIzNH0.kBsOAnaQUECHNw21VXErvEqC0mQ1YjySZwDUKk0Je6k';

async function testNoExpireFlow() {
  const pin = '445566';
  const testPayload = {
    activePlan: { id: 'test_plan_1', title: 'خطة التدريب المتقدمة 🦍', days: [] },
    planHistory: [{ id: 'test_plan_1', title: 'خطة التدريب المتقدمة 🦍', days: [] }],
    userProfile: { name: 'بطل بيست مود' }
  };

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
      payload: JSON.stringify(testPayload),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    }),
  });
  console.log('Upload status:', upRes.status);

  // Fetch
  const getRes = await fetch(`${SUPABASE_REST_URL}?code=eq.${pin}&select=*`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  const rows = await getRes.json();
  console.log('Fetched rows:', rows.length);
  if (rows.length > 0) {
    const data = JSON.parse(rows[0].payload);
    console.log('Hydrated Plan Title:', data.activePlan.title);
  }
}

testNoExpireFlow();
