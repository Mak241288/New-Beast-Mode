const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dqvvylgrxaztyaxskzby.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdnZ5bGdyeGF6dHlheHNremJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NDkyMzQsImV4cCI6MjEwMjQyNTIzNH0.kBsOAnaQUECHNw21VXErvEqC0mQ1YjySZwDUKk0Je6k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpsert() {
  const pinNumber = '999888';
  const fullPayload = { title: 'Test Plan', version: 2 };
  const expTime = Date.now() + 120000;

  console.log('Testing upsert on temp_sync...');
  const { data, error } = await supabase
    .from('temp_sync')
    .upsert(
      {
        code: pinNumber,
        payload: JSON.stringify(fullPayload),
        expiresAt: new Date(expTime).toISOString(),
      },
      { onConflict: 'code' }
    );

  if (error) {
    console.error('UPSERT ERROR:', error);
  } else {
    console.log('UPSERT SUCCESS! Data:', data);
  }
}

testUpsert();
