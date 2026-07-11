import os
import sqlite3
import argparse
import json
import requests
from dotenv import load_dotenv

# Load translation helpers from importer
from importer import translate_name_heuristic, translate_text_ai, MUSCLE_MAP, EQUIPMENT_MAP

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "backend", ".env"))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "database", "exercises.db")

def get_db_connection():
    return sqlite3.connect(DB_PATH)

def search_local_db(query, muscle=None):
    """
    Search the local SQLite database by name (Arabic or English) and optionally muscle.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # We build the query to match either English or Arabic names
    sql = """
    SELECT name_en, name_ar, description_en, description_ar, 
           instructions_en, instructions_ar, muscle_en, muscle_ar, 
           equipment_en, equipment_ar, level, category, rating, source
    FROM exercises 
    WHERE (name_en LIKE ? OR name_ar LIKE ?)
    """
    params = [f"%{query}%", f"%{query}%"]
    
    if muscle:
        sql += " AND (muscle_en LIKE ? OR muscle_ar LIKE ?)"
        params.extend([f"%{muscle}%", f"%{muscle}%"])
        
    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        results.append({
            "name_en": r[0],
            "name_ar": r[1],
            "description_en": r[2],
            "description_ar": r[3],
            "instructions_en": r[4],
            "instructions_ar": r[5],
            "muscle_en": r[6],
            "muscle_ar": r[7],
            "equipment_en": r[8],
            "equipment_ar": r[9],
            "level": r[10],
            "category": r[11],
            "rating": r[12],
            "source": r[13],
            "cached": True
        })
    return results

def save_to_local_db(exercise):
    """
    Save a single exercise object into the local SQLite database.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
        INSERT INTO exercises (
            name_en, name_ar, description_en, description_ar, 
            instructions_en, instructions_ar, muscle_en, muscle_ar, 
            equipment_en, equipment_ar, level, category, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            exercise["name_en"], exercise["name_ar"], 
            exercise.get("description_en", ""), exercise.get("description_ar", ""),
            exercise.get("instructions_en", ""), exercise.get("instructions_ar", ""),
            exercise["muscle_en"], exercise["muscle_ar"],
            exercise["equipment_en"], exercise["equipment_ar"],
            exercise.get("level", "intermediate"), exercise.get("category", "STRENGTH"),
            exercise.get("source", "API_Fallback")
        ))
        conn.commit()
        print(f"  [CACHE] Saved '{exercise['name_en']}' to local SQLite database.")
    except sqlite3.IntegrityError:
        # Already exists, ignore
        pass
    finally:
        conn.close()

def fetch_from_exercisedb_api(query):
    """
    Fetch exercises matching a name query from ExerciseDB via RapidAPI.
    """
    rapidapi_key = os.getenv("RAPIDAPI_KEY")
    if not rapidapi_key or "YOUR_RAPIDAPI_KEY" in rapidapi_key:
        return []
        
    print(f"  [API] Falling back to ExerciseDB for: '{query}'...")
    url = f"https://exercisedb.p.rapidapi.com/exercises/name/{query}"
    headers = {
        "X-RapidAPI-Key": rapidapi_key,
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=8)
        if response.ok:
            data = response.json()
            if isinstance(data, list):
                return data
        else:
            print(f"  [API] ExerciseDB responded with HTTP {response.status_code}")
    except Exception as e:
        print(f"  [API] Error calling ExerciseDB API: {e}")
    return []

def fetch_from_wger_api(query):
    """
    Fetch exercises matching a name query from Wger public API.
    """
    print(f"  [API] Falling back to Wger API for: '{query}'...")
    url = f"https://wger.de/api/v2/exercise/search/?term={query}"
    
    try:
        response = requests.get(url, timeout=8)
        if response.ok:
            data = response.json()
            results = data.get("suggestions", [])
            # Map wger search results
            exercises = []
            for item in results:
                # Retrieve full exercise details
                ex_data = item.get("data", {})
                if ex_data:
                    exercises.append(ex_data)
            return exercises
    except Exception as e:
        print(f"  [API] Error calling Wger API: {e}")
    return []

def process_and_cache_api_result(api_ex, source):
    """
    Format, translate, and cache an exercise fetched from external APIs.
    """
    name_en = ""
    muscle_en = "Other"
    equip_en = "Bodyweight"
    instructions_en = ""
    desc_en = ""
    
    if source == "ExerciseDB":
        name_en = api_ex.get("name", "").title()
        muscle_en = api_ex.get("target", "Other").title()
        equip_en = api_ex.get("equipment", "Bodyweight").title()
        instructions_list = api_ex.get("instructions", [])
        instructions_en = "\n".join(instructions_list) if isinstance(instructions_list, list) else str(instructions_list)
        desc_en = f"Body Part: {api_ex.get('bodyPart', 'Other')}"
    elif source == "Wger":
        name_en = api_ex.get("name", "").title()
        muscle_en = api_ex.get("category", "Other").title()
        equip_en = "Bodyweight"  # Wger details inside search are simplified
        instructions_en = api_ex.get("description", "")
        desc_en = "Wger Search Result"

    if not name_en:
        return None

    # Translate using static maps + AI fallback
    muscle_ar = MUSCLE_MAP.get(muscle_en.lower(), muscle_en)
    equip_ar = EQUIPMENT_MAP.get(equip_en.lower(), equip_en)
    name_ar = translate_name_heuristic(name_en)
    
    # Translate description & instructions via Groq AI
    desc_ar = translate_text_ai(desc_en, "description") if desc_en else ""
    instructions_ar = translate_text_ai(instructions_en, "instructions") if instructions_en else ""
    
    ex_obj = {
        "name_en": name_en,
        "name_ar": name_ar,
        "description_en": desc_en,
        "description_ar": desc_ar,
        "instructions_en": instructions_en,
        "instructions_ar": instructions_ar,
        "muscle_en": muscle_en,
        "muscle_ar": muscle_ar,
        "equipment_en": equip_en,
        "equipment_ar": equip_ar,
        "level": "intermediate",
        "category": "STRENGTH",
        "rating": 0.0,
        "source": f"API_{source}",
        "cached": False
    }
    
    # Save to SQLite database dynamically
    save_to_local_db(ex_obj)
    return ex_obj

def resolve_exercise(query, muscle=None):
    """
    Primary interface:
    1. Query local SQLite database.
    2. If found, return results.
    3. If not found, call external APIs (ExerciseDB / Wger), translate, cache in SQLite, and return results.
    """
    # 1. Search locally
    local_results = search_local_db(query, muscle)
    if local_results:
        print(f"[RESOLVER] Found {len(local_results)} matches locally in exercises.db.")
        return local_results

    # 2. Local database missed. Trigger fallback to APIs
    print(f"[RESOLVER] Cache Miss for '{query}'. Triggering API Fallbacks...")
    
    api_results = []
    
    # Try ExerciseDB first
    exercisedb_raw = fetch_from_exercisedb_api(query)
    for item in exercisedb_raw[:5]: # limit to top 5 results to prevent rate limits
        processed = process_and_cache_api_result(item, "ExerciseDB")
        if processed:
            api_results.append(processed)
            
    # If still empty, try Wger API
    if not api_results:
        wger_raw = fetch_from_wger_api(query)
        for item in wger_raw[:5]:
            processed = process_and_cache_api_result(item, "Wger")
            if processed:
                api_results.append(processed)

    return api_results

def main():
    import sys
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass # Not supported on some environments
        
    parser = argparse.ArgumentParser(description="BeastMode Dynamic Exercise Resolver (CLI)")
    parser.add_argument("query", type=str, help="Name of the exercise to search for")
    parser.add_argument("--muscle", type=str, default=None, help="Muscle filter (optional)")
    
    args = parser.parse_args()
    
    print(f"Resolving exercise: '{args.query}'...")
    results = resolve_exercise(args.query, args.muscle)
    
    print("\n--- RESULTS FOUND ---")
    for idx, r in enumerate(results):
        print(f"\n[{idx+1}] {r['name_en']} ({r['name_ar']})")
        print(f"    Source: {r['source']} (Loaded from SQLite: {r.get('cached', False)})")
        print(f"    Muscle: {r['muscle_en']} | {r['muscle_ar']}")
        print(f"    Equipment: {r['equipment_en']} | {r['equipment_ar']}")
        inst_ar = r.get('instructions_ar') or ""
        inst_en = r.get('instructions_en') or ""
        if inst_ar:
            print(f"    Instructions (AR): {inst_ar[:100]}...")
        elif inst_en:
            print(f"    Instructions (EN): {inst_en[:100]}...")

if __name__ == "__main__":
    main()
