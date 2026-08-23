import urllib.parse
import sys

try:
    import psycopg2
    print("psycopg2 is installed!")
    conn = psycopg2.connect("postgresql://postgres.dqvvylgrxaztyaxskzby:Rurushu1988*@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres")
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS temp_sync (
        code TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
    );
    ALTER TABLE temp_sync ENABLE ROW LEVEL SECURITY;
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'temp_sync' AND policyname = 'Allow public access') THEN
            CREATE POLICY "Allow public access" ON temp_sync FOR ALL USING (true) WITH CHECK (true);
        END IF;
    END
    $$;
    """)
    conn.commit()
    print("TABLE temp_sync CREATED SUCCESSFULLY ON SUPABASE POSTGRES!")
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
    print("Public tables:", cur.fetchall())
    conn.close()
except Exception as e:
    print("Error:", e)
