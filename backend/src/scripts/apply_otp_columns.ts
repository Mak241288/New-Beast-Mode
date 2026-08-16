import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function applyOtpColumns() {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();

  console.log('⚡ Adding resetOtp & resetOtpExpiry columns to Supabase "User" table...');

  try {
    await client.query(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "resetOtp" TEXT,
      ADD COLUMN IF NOT EXISTS "resetOtpExpiry" TIMESTAMP WITH TIME ZONE;
    `);
    console.log('✅ Columns resetOtp and resetOtpExpiry successfully added to Supabase!');
  } catch (err: any) {
    console.error('Error adding columns:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

applyOtpColumns();
