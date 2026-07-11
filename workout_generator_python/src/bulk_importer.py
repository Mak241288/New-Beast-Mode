import os
import sqlite3
import argparse
import json
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "database", "exercises.db")

def get_db_connection():
    return sqlite3.connect(DB_PATH)

def resolve_single_exercise(query):
    query = query.strip()
    if not query:
        return None
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Try exact match first
    sql = """
    SELECT name_en, name_ar, instructions_en, instructions_ar, 
           muscle_en, muscle_ar, equipment_en, equipment_ar, 
           level, category, rating, source, image_url
    FROM exercises 
    WHERE LOWER(name_en) = LOWER(?) OR LOWER(name_ar) = LOWER(?)
    """
    cursor.execute(sql, (query, query))
    r = cursor.fetchone()
    if r:
        conn.close()
        return {
            "name_en": r[0],
            "name_ar": r[1] or r[0],
            "instructions_en": r[2] or "",
            "instructions_ar": r[3] or "",
            "muscle_en": r[4] or "Other",
            "muscle_ar": r[5] or "أخرى",
            "equipment_en": r[6] or "Other",
            "equipment_ar": r[7] or "أخرى",
            "level": r[8] or "intermediate",
            "category": r[9] or "STRENGTH",
            "rating": r[10] or 0.0,
            "source": r[11] or "Local",
            "image_url": r[12] or ""
        }
        
    # Try fuzzy like match
    sql = """
    SELECT name_en, name_ar, instructions_en, instructions_ar, 
           muscle_en, muscle_ar, equipment_en, equipment_ar, 
           level, category, rating, source, image_url
    FROM exercises 
    WHERE LOWER(name_en) LIKE LOWER(?) OR LOWER(name_ar) LIKE LOWER(?)
    LIMIT 1
    """
    cursor.execute(sql, (f"%{query}%", f"%{query}%"))
    r = cursor.fetchone()
    conn.close()
    if r:
        return {
            "name_en": r[0],
            "name_ar": r[1] or r[0],
            "instructions_en": r[2] or "",
            "instructions_ar": r[3] or "",
            "muscle_en": r[4] or "Other",
            "muscle_ar": r[5] or "أخرى",
            "equipment_en": r[6] or "Other",
            "equipment_ar": r[7] or "أخرى",
            "level": r[8] or "intermediate",
            "category": r[9] or "STRENGTH",
            "rating": r[10] or 0.0,
            "source": r[11] or "Local",
            "image_url": r[12] or ""
        }
        
    # Not found, generate custom manual exercise
    return {
        "name_en": query,
        "name_ar": query,
        "instructions_en": "Perform this exercise safely with proper form.",
        "instructions_ar": "أدّ التمرين بحرص مع الحفاظ على الوضعية التشريحية الصحيحة.",
        "muscle_en": "Custom",
        "muscle_ar": "مخصص",
        "equipment_en": "Custom",
        "equipment_ar": "مخصص",
        "level": "intermediate",
        "category": "STRENGTH",
        "rating": 5.0,
        "source": "Custom",
        "image_url": ""
    }

def main():
    parser = argparse.ArgumentParser(description="BeastMode Custom Exercise List Bulk Importer")
    parser.add_argument("--list", type=str, default="", help="Comma or newline-separated exercise names")
    
    args = parser.parse_args()
    
    raw_list = []
    if args.list:
        processed_list = args.list.replace("\\n", "\n")
        raw_list = [line.strip() for line in processed_list.split("\n") if line.strip()]
        # If it's a single line and has commas, try comma splitting
        if len(raw_list) == 1 and "," in raw_list[0]:
            raw_list = [item.strip() for item in raw_list[0].split(",") if item.strip()]
            
    resolved_exercises = []
    for item in raw_list:
        res = resolve_single_exercise(item)
        if res:
            resolved_exercises.append(res)
            
    # Set stdout encoding for safe printing
    sys.stdout.reconfigure(encoding='utf-8')
        
    # Output to stdout as JSON string
    print(json.dumps(resolved_exercises, ensure_ascii=False))

if __name__ == "__main__":
    main()
