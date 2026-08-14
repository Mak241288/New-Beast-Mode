import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '../database/exercises.db')
PATCH_JSON_PATH = os.path.join(os.path.dirname(__file__), '../database/exercise_media_patch.json')

def apply_patch():
    if not os.path.exists(PATCH_JSON_PATH):
        print(f"Error: Patch file not found at {PATCH_JSON_PATH}")
        return

    with open(PATCH_JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    patch_records = data.get('patch_data', [])
    print(f"Applying patch to {len(patch_records)} exercises in SQLite database...")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Ensure columns exist
    columns_to_add = [
        ("secondary_muscles_en", "TEXT"),
        ("secondary_muscles_ar", "TEXT"),
        ("common_mistakes_en", "TEXT"),
        ("common_mistakes_ar", "TEXT"),
        ("gif_url", "TEXT"),
    ]

    cursor.execute("PRAGMA table_info(exercises)")
    existing_cols = [col[1] for col in cursor.fetchall()]

    for col_name, col_type in columns_to_add:
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE exercises ADD COLUMN {col_name} {col_type}")

    # Batch update records
    updated_count = 0
    for record in patch_records:
        cursor.execute("""
            UPDATE exercises
            SET gif_url = COALESCE(gif_url, ?),
                image_url = COALESCE(image_url, ?),
                secondary_muscles_en = COALESCE(secondary_muscles_en, ?),
                secondary_muscles_ar = COALESCE(secondary_muscles_ar, ?),
                common_mistakes_en = COALESCE(common_mistakes_en, ?),
                common_mistakes_ar = COALESCE(common_mistakes_ar, ?)
            WHERE id = ?
        """, (
            record['gif_url'],
            record['image_url'],
            record['secondary_muscles_en'],
            record['secondary_muscles_ar'],
            record['common_mistakes_en'],
            record['common_mistakes_ar'],
            record['id']
        ))
        updated_count += 1

    conn.commit()
    conn.close()

    print(f"Successfully applied patch to {updated_count} exercise records in exercises.db!")

if __name__ == '__main__':
    apply_patch()
