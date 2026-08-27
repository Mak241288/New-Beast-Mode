import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DIRECT_URL or DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  console.log('🚀 Connecting to Supabase PostgreSQL...');
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const sqlPath = path.join(__dirname, 'enable_pg_trgm.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('⚡ Applying pg_trgm extension and composite/GIN indexes...');
    await client.query(sql);
    console.log('✅ Successfully applied all GIN Trigram & Composite Indexes on Supabase!');
  } catch (error: any) {
    console.error('❌ Failed to apply indexes:', error.message);
  } finally {
    await client.end();
  }
}

main();
