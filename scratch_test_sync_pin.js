const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdnZ5bGdyeGF6dHlheHNremJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NDkyMzQsImV4cCI6MjEwMjQyNTIzNH0.kBsOAnaQUECHNw21VXErvEqC0mQ1YjySZwDUKk0Je6k';
const endpoint = 'https://dqvvylgrxaztyaxskzby.supabase.co/rest/v1/temp_sync';

async function testInsertAndSelect() {
  const pin = '849201';
  const payload = { test: true, plan: 'Push Day Beast', timestamp: Date.now() };

  // 1. Insert
  console.log('Inserting test PIN:', pin);
  const insRes = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      code: pin,
      payload: JSON.stringify(payload),
      expiresAt: new Date(Date.now() + 120000).toISOString()
    })
  });
  console.log('Insert status:', insRes.status);

  // 2. Select
  const selRes = await fetch(`${endpoint}?code=eq.${pin}&select=*`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await selRes.json();
  console.log('Select status:', selRes.status, 'Retrieved Data:', data);
}

testInsertAndSelect();
