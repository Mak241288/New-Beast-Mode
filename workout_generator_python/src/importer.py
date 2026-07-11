import os
import sys
import json
import sqlite3
import pandas as pd
import requests
from dotenv import load_dotenv

# Load env variables from backend/.env or local
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "backend", ".env"))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
DATABASE_DIR = os.path.join(BASE_DIR, "database")

# Create database directory if it doesn't exist
os.makedirs(DATABASE_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

DB_PATH = os.path.join(DATABASE_DIR, "exercises.db")
CACHE_PATH = os.path.join(PROCESSED_DIR, "translation_cache.json")

# Predefined Sports Terminology Maps
MUSCLE_MAP = {
    'abdominals': 'عضلات البطن (Abs)',
    'biceps': 'العضلة ذات الرأسين (البايسبس)',
    'triceps': 'العضلة ثلاثية الرؤوس (الترايسبس)',
    'chest': 'الصدر',
    'shoulders': 'الأكتاف',
    'lats': 'الظهر العريض (اللاتس)',
    'middle back': 'منتصف الظهر',
    'lower back': 'أسفل الظهر',
    'quadriceps': 'العضلة الأمامية للفخذ (الكوادس)',
    'hamstrings': 'العضلة الخلفية للفخذ (الهامسترنج)',
    'calves': 'عضلات الساق (السمانة)',
    'glutes': 'عضلات المؤخرة (الجلوتس)',
    'forearms': 'السواعد',
    'neck': 'الرقبة',
    'traps': 'الترابيس (Traps)',
    'cardio': 'كارديو',
    'quads': 'العضلة الأمامية للفخذ (الكوادس)',
}

EQUIPMENT_MAP = {
    'body only': 'وزن الجسم',
    'bodyweight': 'وزن الجسم',
    'dumbbell': 'دمبلز',
    'dumbbells': 'دمبلز',
    'barbell': 'بار حديدي',
    'cable': 'كابل',
    'cables': 'كابل',
    'machine': 'جهاز رياضي',
    'kettlebells': 'كرة حديدية (كيتل بيل)',
    'kettlebell': 'كرة حديدية (كيتل بيل)',
    'bands': 'حبال مقاومة',
    'band': 'حبال مقاومة',
    'medicine ball': 'كرة طبية',
    'exercise ball': 'كرة ثبات (سويس بيل)',
    'foam roller': 'أسطوانة رغوية (فوم رولر)',
    'e-z curl bar': 'بار متعرج (EZ)',
    'none': 'بدون أدوات',
    'other': 'أدوات أخرى',
}

# Heuristic Translation Rules for Exercise Names
NAME_WORDS_MAP = {
    'dumbbell': 'بالدمبلز',
    'barbell': 'بالبار',
    'cable': 'بالكابل',
    'bench press': 'ضغط الصدر على المقعد (بنش برس)',
    'incline': 'المائل لأعلى',
    'decline': 'المائل لأسفل',
    'bicep curl': 'تبادل للبايسبس',
    'curl': 'تبادل / ثني',
    'tricep extension': 'مد الترايسبس',
    'extension': 'مد',
    'squat': 'قرفصاء (سكوات)',
    'lunge': 'طعن (لونجز)',
    'lunges': 'طعن (لونجز)',
    'deadlift': 'رفعة مميتة (ديدلفت)',
    'shoulder press': 'ضغط أكتاف',
    'overhead press': 'ضغط فوق الرأس',
    'lateral raise': 'رفرفة جانبي للأكتاف',
    'front raise': 'رفرفة أمامي للأكتاف',
    'rear delt fly': 'رفرفة خلفي للأكتاف',
    'fly': 'تجميع / فتح',
    'plank': 'بلانك',
    'pushup': 'تمرين الضغط',
    'pushups': 'تمرين الضغط',
    'push-up': 'تمرين الضغط',
    'pullup': 'تمرين العقلة',
    'pullups': 'تمرين العقلة',
    'pull-up': 'تمرين العقلة',
    'chin-up': 'تمرين عقلة قبضة معكوسة',
    'shrug': 'هز أكتاف (شراغز)',
    'shrugs': 'هز أكتاف (شراغز)',
    'leg press': 'دفع أرجل على الجهاز',
    'leg curl': 'ثني أرجل على الجهاز',
    'calf raise': 'رفع السمانة واقفاً',
    'crunches': 'طحن البطن (كرانشز)',
    'crunch': 'طحن البطن',
    'romanian deadlift': 'ديدلفت روماني (RDL)',
    'seated': 'جالساً',
    'standing': 'واقفاً',
    'lying': 'مستلقياً',
    'bent over': 'منحنياً',
    'single arm': 'ذراع واحدة',
    'one arm': 'ذراع واحدة',
    'arnold press': 'ضغط أرنولد للأكتاف',
    'close grip': 'قبضة ضيقة',
    'wide grip': 'قبضة واسعة',
    'hammer': 'مطرقة (هامر)',
    'preacher': 'واعظ (بريتشر)',
    'reverse': 'عكسي',
}

# Translation cache to prevent duplicate LLM calls
translation_cache = {}
if os.path.exists(CACHE_PATH):
    try:
        with open(CACHE_PATH, "r", encoding="utf-8") as f:
            translation_cache = json.load(f)
    except Exception as e:
        print(f"Error loading cache: {e}")

def save_cache():
    try:
        with open(CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump(translation_cache, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving cache: {e}")

# Translation API call limiters to prevent hitting Groq rate limits
ai_calls_count = 0
MAX_AI_CALLS = 120

# Call Groq API to translate complex text
def translate_text_ai(text, context_type="description"):
    global ai_calls_count
    if not text or pd.isna(text):
        return ""
    
    clean_text = text.strip()
    if clean_text in translation_cache:
        return translation_cache[clean_text]

    # Rate limiting fallback
    if ai_calls_count >= MAX_AI_CALLS:
        return ""

    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        return ""

    ai_calls_count += 1
    if ai_calls_count % 10 == 0:
        print(f"  [AI Translation] Call count: {ai_calls_count}/{MAX_AI_CALLS}")

    # Check if we should translate or fallback
    prompt = f"""
    أنت خبير تدريب رياضي ومترجم متخصص في علوم الرياضة واللياقة البدنية.
    قم بترجمة النص الرياضي التالي من الإنجليزية إلى العربية بشكل احترافي ورياضي دقيق ومألوف في صالات الحديد والتمارين الرياضية.
    تجنب الترجمة الحرفية الجافة، واستخدم التسميات المتداولة بين المدربين والرياضيين العرب.
    
    النص المراد ترجمته ({context_type}):
    "{clean_text}"
    
    أعد الترجمة فقط دون أي نصوص إضافية أو مقدمات.
    """

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
            },
            timeout=10
        )
        
        if response.ok:
            data = response.json()
            translation = data["choices"][0]["message"]["content"].strip().strip('"')
            translation_cache[clean_text] = translation
            # Save cache every 5 calls to be safe
            if ai_calls_count % 5 == 0:
                save_cache()
            return translation
        else:
            return ""
    except Exception as e:
        print(f"API translation failed for '{clean_text[:30]}...': {e}")
        return ""

# Smart Heuristic Name Translator
def translate_name_heuristic(english_name):
    if not english_name:
        return ""
    
    name_lower = english_name.lower().replace("-", " ")
    
    # Try exact matches first
    for k, v in NAME_WORDS_MAP.items():
        if name_lower == k:
            return v
            
    # Split and map words
    words = name_lower.split()
    translated_parts = []
    
    # Look for compound phrases first
    skip_next = False
    for i in range(len(words)):
        if skip_next:
            skip_next = False
            continue
            
        # Check two-word combinations
        if i < len(words) - 1:
            phrase = f"{words[i]} {words[i+1]}"
            if phrase in NAME_WORDS_MAP:
                translated_parts.append(NAME_WORDS_MAP[phrase])
                skip_next = True
                continue
                
        # Check single word
        word = words[i]
        if word in NAME_WORDS_MAP:
            translated_parts.append(NAME_WORDS_MAP[word])
        else:
            translated_parts.append(word.capitalize())
            
    # Combine nicely (Arabic flows right-to-left, but we keep English names in bracket)
    ar_name = " ".join(translated_parts)
    return ar_name

def setup_database():
    print(f"\n[+] Setting up SQLite Database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create exercises table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_en TEXT NOT NULL UNIQUE,
        name_ar TEXT,
        description_en TEXT,
        description_ar TEXT,
        instructions_en TEXT,
        instructions_ar TEXT,
        muscle_en TEXT,
        muscle_ar TEXT,
        equipment_en TEXT,
        equipment_ar TEXT,
        level TEXT,
        category TEXT,
        rating REAL DEFAULT 0.0,
        source TEXT,
        sanskrit_name TEXT
    )
    """)
    conn.commit()
    return conn

def import_mega_gym(conn):
    csv_path = os.path.join(RAW_DIR, "megaGymDataset.csv")
    if not os.path.exists(csv_path):
        print("  [-] Mega Gym dataset (megaGymDataset.csv) not found. Skipping.")
        return 0
        
    print("\n[+] Importing from Mega Gym Dataset...")
    df = pd.read_csv(csv_path)
    cursor = conn.cursor()
    
    imported_count = 0
    for idx, row in df.iterrows():
        title = row['Title']
        desc = row['Desc'] if not pd.isna(row['Desc']) else ""
        body_part = row['BodyPart'].lower() if not pd.isna(row['BodyPart']) else "other"
        equip = row['Equipment'].lower() if not pd.isna(row['Equipment']) else "body only"
        level = row['Level'].lower() if not pd.isna(row['Level']) else "beginner"
        category = row['Type'].upper() if not pd.isna(row['Type']) else "STRENGTH"
        rating = float(row['Rating']) if not pd.isna(row['Rating']) else 0.0
        
        # Translate metadata using predefined maps
        muscle_ar = MUSCLE_MAP.get(body_part, body_part.capitalize())
        equip_ar = EQUIPMENT_MAP.get(equip, equip.capitalize())
        
        # Translate name using heuristic
        name_ar = translate_name_heuristic(title)
        
        # Translate description (first try cache/AI)
        desc_ar = translate_text_ai(desc, "description") if desc else ""
        
        try:
            cursor.execute("""
            INSERT INTO exercises (
                name_en, name_ar, description_en, description_ar, 
                muscle_en, muscle_ar, equipment_en, equipment_ar, 
                level, category, rating, source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                title, name_ar, desc, desc_ar,
                body_part.capitalize(), muscle_ar, equip.capitalize(), equip_ar,
                level, category, rating, 'MegaGym'
            ))
            imported_count += 1
        except sqlite3.IntegrityError:
            # Handle duplicate
            pass
            
    conn.commit()
    print(f"  [SUCCESS] Successfully imported/merged {imported_count} exercises from Mega Gym.")
    return imported_count

def import_free_exercise_db(conn):
    json_path = os.path.join(RAW_DIR, "exercises.json")
    if not os.path.exists(json_path):
        print("  [-] Free Exercise DB (exercises.json) not found. Skipping.")
        return 0
        
    print("\n[+] Importing from Free Exercise DB...")
    with open(json_path, "r", encoding="utf-8") as f:
        exercises = json.load(f)
        
    cursor = conn.cursor()
    imported_count = 0
    
    for ex in exercises:
        if not ex:
            continue
        name = ex.get('name')
        equip = (ex.get('equipment') or 'body only').lower()
        primary_muscles = ex.get('primaryMuscles') or ['other']
        primary_muscle = primary_muscles[0] if len(primary_muscles) > 0 else 'other'
        instructions_list = ex.get('instructions') or []
        instructions_en = "\n".join(instructions_list) if isinstance(instructions_list, list) else str(instructions_list)
        level = (ex.get('level') or 'beginner').lower()
        category = (ex.get('category') or 'strength').upper()
        
        # Translate
        muscle_ar = MUSCLE_MAP.get(primary_muscle, primary_muscle.capitalize())
        equip_ar = EQUIPMENT_MAP.get(equip, equip.capitalize())
        name_ar = translate_name_heuristic(name)
        
        instructions_ar = translate_text_ai(instructions_en, "instructions") if instructions_en else ""
        
        try:
            cursor.execute("""
            INSERT INTO exercises (
                name_en, name_ar, instructions_en, instructions_ar,
                muscle_en, muscle_ar, equipment_en, equipment_ar,
                level, category, source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                name, name_ar, instructions_en, instructions_ar,
                primary_muscle.capitalize(), muscle_ar, equip.capitalize(), equip_ar,
                level, category, 'FreeExerciseDB'
            ))
            imported_count += 1
        except sqlite3.IntegrityError:
            # Handle duplicate (exercise with name_en already exists)
            # We can update the description/instructions if they are empty
            cursor.execute("""
            UPDATE exercises 
            SET instructions_en = COALESCE(instructions_en, ?), 
                instructions_ar = COALESCE(instructions_ar, ?)
            WHERE name_en = ? AND (instructions_en IS NULL OR instructions_en = '')
            """, (instructions_en, instructions_ar, name))
            
    conn.commit()
    print(f"  [SUCCESS] Successfully imported/merged {imported_count} exercises from Free Exercise DB.")
    return imported_count

def import_yoga_poses(conn):
    json_path = os.path.join(RAW_DIR, "yoga-poses.json")
    if not os.path.exists(json_path):
        print("  [-] Yoga Poses dataset (yoga-poses.json) not found. Skipping.")
        return 0
        
    print("\n[+] Importing from Yoga Poses Dataset...")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    cursor = conn.cursor()
    imported_count = 0
    
    # Iterate through all categories in the dictionary
    for category_key, category_list in data.items():
        if not isinstance(category_list, list):
            continue
            
        for item in category_list:
            poses = item.get('scheduled', [])
            if not isinstance(poses, list):
                continue
                
            for pose in poses:
                english_name = pose.get('english_name')
                sanskrit_name = pose.get('sanskrit_name')
                desc = pose.get('description') or ''
                benefits = pose.get('benefits') or ''
                steps = pose.get('steps') or ''
                level = (pose.get('category') or 'beginner').lower()
                
                # Combine description and benefits
                full_desc_en = f"Description: {desc}\nBenefits: {benefits}"
                
                # Translate
                name_ar = translate_name_heuristic(english_name)
                desc_ar = translate_text_ai(full_desc_en, "description")
                steps_ar = translate_text_ai(steps, "instructions") if steps else ""
                
                try:
                    cursor.execute("""
                    INSERT INTO exercises (
                        name_en, name_ar, description_en, description_ar, 
                        instructions_en, instructions_ar, sanskrit_name,
                        muscle_en, muscle_ar, equipment_en, equipment_ar,
                        level, category, source
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        english_name, name_ar, full_desc_en, desc_ar,
                        steps, steps_ar, sanskrit_name,
                        'Full Body', 'كامل الجسم', 'Yoga Mat', 'سجادة يوجا',
                        level, 'YOGA', 'YogaAPI'
                    ))
                    imported_count += 1
                except sqlite3.IntegrityError:
                    pass
                    
    conn.commit()
    print(f"  [SUCCESS] Successfully imported/merged {imported_count} yoga poses.")
    return imported_count

def import_wger_fixtures(conn):
    exercise_path = os.path.join(RAW_DIR, "exercise.json")
    muscles_path = os.path.join(RAW_DIR, "muscles.json")
    equipment_path = os.path.join(RAW_DIR, "equipment.json")
    
    if not os.path.exists(exercise_path):
        print("  [-] Wger exercise fixture (exercise.json) not found. Skipping Wger fixtures.")
        return 0
        
    print("\n[+] Importing from Wger Fixtures...")
    
    # Load muscles map
    muscles_map = {}
    if os.path.exists(muscles_path):
        with open(muscles_path, "r", encoding="utf-8") as f:
            muscles_data = json.load(f)
            for m in muscles_data:
                muscles_map[m['pk']] = m['fields'].get('name_en', m['fields']['name'])
                
    # Load equipment map
    equip_map = {}
    if os.path.exists(equipment_path):
        with open(equipment_path, "r", encoding="utf-8") as f:
            equip_data = json.load(f)
            for eq in equip_data:
                equip_map[eq['pk']] = eq['fields']['name']
                
    with open(exercise_path, "r", encoding="utf-8") as f:
        exercises_data = json.load(f)
        
    cursor = conn.cursor()
    imported_count = 0
    
    # Since Wger names are in translations fixture, if translation is missing, we use a basic fallback
    # Wger exercise object fields: uuid, category, muscles, equipment
    for item in exercises_data:
        fields = item['fields']
        uuid = fields.get('uuid')
        
        # Retrieve primary muscle
        muscle_ids = fields.get('muscles') or []
        primary_muscle_id = muscle_ids[0] if len(muscle_ids) > 0 else None
        muscle_en = (muscles_map.get(primary_muscle_id) or 'Other') if primary_muscle_id else 'Other'
        muscle_ar = MUSCLE_MAP.get(muscle_en.lower(), muscle_en)
        
        # Retrieve equipment
        eq_ids = fields.get('equipment') or []
        primary_eq_id = eq_ids[0] if len(eq_ids) > 0 else None
        equip_en = (equip_map.get(primary_eq_id) or 'Bodyweight') if primary_eq_id else 'Bodyweight'
        equip_ar = EQUIPMENT_MAP.get(equip_en.lower(), equip_en)
        
        # Give it a generic name derived from UUID/Category if translation fixture is missing
        # Category ID mapping (10 is Chest, 15 is Cardio, etc.)
        cat_id = fields.get('category', 10)
        cat_map = {10: 'Chest', 8: 'Back', 12: 'Shoulders', 11: 'Biceps', 9: 'Triceps', 14: 'Calves', 15: 'Cardio'}
        cat_name = cat_map.get(cat_id, 'Strength')
        
        name_en = f"Wger Exercise {cat_name} {fields.get('uuid')[:8]}"
        name_ar = f"تمرين {cat_name} رقم {fields.get('uuid')[:4]}"
        
        try:
            cursor.execute("""
            INSERT INTO exercises (
                name_en, name_ar, muscle_en, muscle_ar, 
                equipment_en, equipment_ar, level, category, source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                name_en, name_ar, muscle_en, muscle_ar,
                equip_en, equip_ar, 'intermediate', cat_name.upper(), 'Wger'
            ))
            imported_count += 1
        except sqlite3.IntegrityError:
            pass
            
    conn.commit()
    print(f"  [SUCCESS] Successfully imported/merged {imported_count} exercises from Wger Fixtures.")
    return imported_count

def main():
    conn = setup_database()
    
    # Run imports
    import_mega_gym(conn)
    import_free_exercise_db(conn)
    import_yoga_poses(conn)
    import_wger_fixtures(conn)
    
    # Save cache
    save_cache()
    
    # Verify database counts
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM exercises")
    total_count = cursor.fetchone()[0]
    
    print("\n=========================================")
    print("   Bulk Import & Deduplication Complete! ")
    print(f"   Total Unique Exercises in DB: {total_count} ")
    print("=========================================")
    
    conn.close()

if __name__ == "__main__":
    main()
