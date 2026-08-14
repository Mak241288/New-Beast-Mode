import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '../database/exercises.db')

def create_database_indexes():
    print(f"Connecting to database at {DB_PATH}...")
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file does not exist at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    indexes = [
        ("idx_exercises_muscle_en", "CREATE INDEX IF NOT EXISTS idx_exercises_muscle_en ON exercises(muscle_en);"),
        ("idx_exercises_equipment_en", "CREATE INDEX IF NOT EXISTS idx_exercises_equipment_en ON exercises(equipment_en);"),
        ("idx_exercises_name_en", "CREATE INDEX IF NOT EXISTS idx_exercises_name_en ON exercises(name_en);"),
        ("idx_exercises_name_ar", "CREATE INDEX IF NOT EXISTS idx_exercises_name_ar ON exercises(name_ar);"),
        ("idx_exercises_rating", "CREATE INDEX IF NOT EXISTS idx_exercises_rating ON exercises(rating DESC);"),
    ]

    print("Creating performance indexes on exercises table...")
    created_count = 0
    for idx_name, sql_stmt in indexes:
        try:
            cursor.execute(sql_stmt)
            print(f"  [OK] Index '{idx_name}' created or verified successfully.")
            created_count += 1
        except Exception as e:
            print(f"  [FAIL] Failed to create index '{idx_name}': {e}")

    conn.commit()

    # Verify created indexes
    cursor.execute("PRAGMA index_list(exercises)")
    current_indexes = cursor.fetchall()
    print("\nVerified active indexes on 'exercises' table:")
    for idx in current_indexes:
        print(f"  - {idx[1]}")

    conn.close()
    print(f"\nSuccessfully verified/created {created_count} indexes on exercises.db!")

if __name__ == '__main__':
    create_database_indexes()
