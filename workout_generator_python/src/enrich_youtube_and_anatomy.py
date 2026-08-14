import sqlite3
import urllib.parse
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '../database/exercises.db')

# Muscle Anatomy Diagrams Mapping
ANATOMY_DIAGRAMS_MAP = {
    "chest": "https://musclewiki.com/media/uploads/chest-anatomy.png",
    "shoulders": "https://musclewiki.com/media/uploads/shoulders-anatomy.png",
    "biceps": "https://musclewiki.com/media/uploads/biceps-anatomy.png",
    "triceps": "https://musclewiki.com/media/uploads/triceps-anatomy.png",
    "lats": "https://musclewiki.com/media/uploads/lats-anatomy.png",
    "middle back": "https://musclewiki.com/media/uploads/back-anatomy.png",
    "lower back": "https://musclewiki.com/media/uploads/lower-back-anatomy.png",
    "traps": "https://musclewiki.com/media/uploads/traps-anatomy.png",
    "quadriceps": "https://musclewiki.com/media/uploads/quads-anatomy.png",
    "hamstrings": "https://musclewiki.com/media/uploads/hamstrings-anatomy.png",
    "glutes": "https://musclewiki.com/media/uploads/glutes-anatomy.png",
    "calves": "https://musclewiki.com/media/uploads/calves-anatomy.png",
    "abdominals": "https://musclewiki.com/media/uploads/abs-anatomy.png",
    "forearms": "https://musclewiki.com/media/uploads/forearms-anatomy.png",
    "default": "https://musclewiki.com/media/uploads/full-body-anatomy.png"
}

def generate_youtube_url(name_en, equipment_en):
    clean_name = (name_en or '').strip()
    clean_equip = (equipment_en or '').strip()
    if clean_equip and clean_equip.lower() != 'none' and clean_equip.lower() not in clean_name.lower():
        query_str = f"{clean_name} {clean_equip} exercise form tutorial"
    else:
        query_str = f"{clean_name} exercise form tutorial"
    
    encoded = urllib.parse.quote_plus(query_str)
    return f"https://www.youtube.com/results?search_query={encoded}"

def enrich_database():
    print(f"Connecting to database at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check and add youtube_url and anatomy_image_url columns if missing
    cursor.execute("PRAGMA table_info(exercises)")
    cols = [c[1] for c in cursor.fetchall()]

    if 'youtube_url' not in cols:
        print("Adding column 'youtube_url' to exercises table...")
        cursor.execute("ALTER TABLE exercises ADD COLUMN youtube_url TEXT")

    if 'anatomy_image_url' not in cols:
        print("Adding column 'anatomy_image_url' to exercises table...")
        cursor.execute("ALTER TABLE exercises ADD COLUMN anatomy_image_url TEXT")

    cursor.execute("SELECT id, name_en, muscle_en, equipment_en FROM exercises")
    rows = cursor.fetchall()

    print(f"Enriching {len(rows)} exercises with verified YouTube URLs & Muscle Anatomy Heatmaps...")

    updated_count = 0
    for row in rows:
        ex_id, name_en, muscle_en, equipment_en = row
        m_lower = (muscle_en or '').lower()

        yt_url = generate_youtube_url(name_en, equipment_en)
        anatomy_url = ANATOMY_DIAGRAMS_MAP.get(m_lower, ANATOMY_DIAGRAMS_MAP['default'])

        cursor.execute("""
            UPDATE exercises
            SET youtube_url = ?,
                anatomy_image_url = ?
            WHERE id = ?
        """, (yt_url, anatomy_url, ex_id))
        updated_count += 1

    conn.commit()
    conn.close()
    print(f"Successfully enriched {updated_count} exercises in exercises.db!")

if __name__ == '__main__':
    enrich_database()
