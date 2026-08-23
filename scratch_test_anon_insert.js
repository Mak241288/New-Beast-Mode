const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdnZ5bGdyeGF6dHlheHNremJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NDkyMzQsImV4cCI6MjEwMjQyNTIzNH0.kBsOAnaQUECHNw21VXErvEqC0mQ1YjySZwDUKk0Je6k';
const endpoint = 'https://dqvvylgrxaztyaxskzby.supabase.co/rest/v1/temp_sync';

async function testAnonInsert() {
  const pin = '761722';
  const payload = { test: true };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      code: pin,
      payload: JSON.stringify(payload),
      expiresAt: new Date(Date.now() + 120000).toISOString()
    })
  });
  console.log('Insert Status:', res.status, res.statusText);
  const text = await res.text();
  console.log('Insert Body:', text);
}

testAnonInsert();
