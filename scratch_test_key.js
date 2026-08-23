import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dqvvylgrxaztyaxskzby.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdnZ5bGdyeGF6dHlheHNremJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NDkyMzQsImV4cCI6MjEwMjQyNTIzNH0.kBsOAnaQUECHNw21VXErvEqC0mQ1YjySZwDUKk0Je6k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Supabase Auth & DB connection...');
  const { data, error } = await supabase.from('temp_sync').select('*').limit(1);
  if (error) {
    console.log('temp_sync error (table might not exist yet):', error.message);
  } else {
    console.log('temp_sync SUCCESS! Data:', data);
  }
}

test();
