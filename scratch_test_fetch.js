const url = 'https://dqvvylgrxaztyaxskzby.supabase.co/rest/v1/temp_sync?select=*';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdnZ5bGdyeGF6dHlheHNremJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NDkyMzQsImV4cCI6MjEwMjQyNTIzNH0.kBsOAnaQUECHNw21VXErvEqC0mQ1YjySZwDUKk0Je6k';

async function testFetch() {
  const res = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  console.log('Status:', res.status, res.statusText);
  const body = await res.text();
  console.log('Body:', body);
}

testFetch();
