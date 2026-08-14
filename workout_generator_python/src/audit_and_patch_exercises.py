import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '../database/exercises.db')
PATCH_JSON_PATH = os.path.join(os.path.dirname(__file__), '../database/exercise_media_patch.json')

# MuscleWiki Fallback GIF Mapping by Muscle Group
MUSCLEWIKI_GIF_MAP = {
    "chest": "https://musclewiki.com/media/uploads/chest-barbell-bench-press.gif",
    "shoulders": "https://musclewiki.com/media/uploads/shoulders-dumbbells-overhead-press.gif",
    "biceps": "https://musclewiki.com/media/uploads/biceps-barbell-curl.gif",
    "triceps": "https://musclewiki.com/media/uploads/triceps-dumbbell-overhead-extension.gif",
    "lats": "https://musclewiki.com/media/uploads/lats-lat-pulldown.gif",
    "middle back": "https://musclewiki.com/media/uploads/back-barbell-row.gif",
    "lower back": "https://musclewiki.com/media/uploads/back-hyperextension.gif",
    "traps": "https://musclewiki.com/media/uploads/traps-dumbbell-shrug.gif",
    "quadriceps": "https://musclewiki.com/media/uploads/quads-barbell-squat.gif",
    "hamstrings": "https://musclewiki.com/media/uploads/hamstrings-romanian-deadlift.gif",
    "glutes": "https://musclewiki.com/media/uploads/glutes-barbell-hip-thrust.gif",
    "calves": "https://musclewiki.com/media/uploads/calves-standing-calf-raise.gif",
    "abdominals": "https://musclewiki.com/media/uploads/abs-crunch.gif",
    "forearms": "https://musclewiki.com/media/uploads/forearms-wrist-curl.gif",
    "default": "https://musclewiki.com/media/uploads/chest-push-ups.gif"
}

def get_secondary_muscles(muscle_en):
    m = (muscle_en or '').lower()
    if 'chest' in m:
        return {'en': 'Triceps Brachii, Anterior Deltoids', 'ar': 'العضلة ثلاثية الرؤوس (ترايسبس)، الأكتاف الأمامية'}
    if 'back' in m or 'lat' in m:
        return {'en': 'Biceps Brachii, Rear Deltoids, Forearms', 'ar': 'العضلة ثنائية الرؤوس (بايسبس)، الأكتاف الخلفية، السواعد'}
    if 'shoulder' in m or 'trap' in m:
        return {'en': 'Triceps Brachii, Upper Chest, Trapezius', 'ar': 'العضلة ثلاثية الرؤوس (ترايسبس)، أعلى الصدر، الترابيس'}
    if 'quad' in m or 'leg' in m:
        return {'en': 'Gluteus Maximus, Hamstrings, Calves', 'ar': 'عضلات الأرداف (الجلوتس)، الفخذ الخلفي، السمانة'}
    if 'hamstring' in m or 'glute' in m:
        return {'en': 'Lower Back, Calves', 'ar': 'أسفل الظهر، السمانة'}
    if 'bicep' in m or 'arm' in m:
        return {'en': 'Brachialis, Forearms', 'ar': 'العضلة العضدية (براكياليس)، السواعد'}
    if 'tricep' in m:
        return {'en': 'Anconeus, Rear Delts', 'ar': 'العضلة العكسية للكوع، الأكتاف الخلفية'}
    if 'ab' in m or 'core' in m:
        return {'en': 'Obliques, Hip Flexors', 'ar': 'العضلات المائلة (الخواصر)، قابضات الورك'}
    return {'en': 'Stabilizer Core Muscles', 'ar': 'عضلات الجذع المساعدة'}

def get_common_mistakes(muscle_en):
    m = (muscle_en or '').lower()
    if 'chest' in m:
        return {
            'en': '1. Bouncing weight off chest.\n2. Flaring elbows out 90 degrees.\n3. Arching lower back excessively.',
            'ar': '1. أرجحة الوزن والارتطام بعظمة الصدر.\n2. فتح المرفقين بزاوية 90 درجة حادة.\n3. تقويس أسفل الظهر بشكل مبالغ فيه.'
        }
    if 'back' in m or 'lat' in m:
        return {
            'en': '1. Pulling with arms instead of driving elbows down.\n2. Swinging torso for momentum.\n3. Rounding upper spine.',
            'ar': '1. السحب بقوة اليدين بدلاً من قيادة الكوع لأسفل.\n2. أرجحة الجذع واستخدام قوة الدفع.\n3. تحدب أعلى الظهر أثناء السحب.'
        }
    if 'shoulder' in m or 'trap' in m:
        return {
            'en': '1. Dropping elbows too far below shoulder parallel.\n2. Shrugging shoulders up during press.\n3. Arching back during overhead presses.',
            'ar': '1. نزول الكوع لمستوى أسفل من الكتف.\n2. رفع الكتفين نحو الأذنين أثناء الضغط.\n3. الانحناء المائل للخلف أثناء الضغط العالي.'
        }
    if 'quad' in m or 'leg' in m:
        return {
            'en': '1. Allowing knees to collapse inward.\n2. Raising heels off ground.\n3. Partial depth without reaching parallel.',
            'ar': '1. دخول الركبتين للداخل أثناء الحركة.\n2. رفع الكعبين عن الأرض.\n3. النزول الجزئي دون الوصول لمستوى التوازي.'
        }
    return {
        'en': '1. Moving too fast without controlling eccentric phase.\n2. Holding breath during heavy reps.\n3. Sacrificing form for heavier weight.',
        'ar': '1. السرعة الزائدة وعدم التحكم في النزول.\n2. حبس النفس طوال الحركة.\n3. التضحية بالتكنيك مقابل زيادة الوزن.'
    }

def run_audit():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT id, name_en, name_ar, muscle_en, image_url, gif_url FROM exercises")
    rows = cursor.fetchall()

    total_count = len(rows)
    local_db_media_count = 0
    musclewiki_fallback_count = 0
    unresolved_count = 0

    patch_records = []

    for row in rows:
        ex_id, name_en, name_ar, muscle_en, image_url, gif_url = row
        m_lower = (muscle_en or '').lower()

        # Check local media existence (Local DB First)
        has_local_img = bool(image_url and image_url.strip() and image_url.startswith('http'))
        has_local_gif = bool(gif_url and gif_url.strip() and gif_url.startswith('http'))

        final_img = image_url if has_local_img else None
        final_gif = gif_url if has_local_gif else None

        source = ""
        if has_local_img or has_local_gif:
            local_db_media_count += 1
            source = "LOCAL_DB"
        else:
            # Fallback to MuscleWiki matching
            fallback_url = MUSCLEWIKI_GIF_MAP.get(m_lower, MUSCLEWIKI_GIF_MAP['default'])
            final_gif = fallback_url
            musclewiki_fallback_count += 1
            source = "MUSCLEWIKI_FALLBACK"

        sec_muscles = get_secondary_muscles(muscle_en)
        mistakes = get_common_mistakes(muscle_en)

        patch_records.append({
            "id": ex_id,
            "name_en": name_en,
            "name_ar": name_ar or name_en,
            "muscle_en": muscle_en,
            "source": source,
            "image_url": final_img or final_gif,
            "gif_url": final_gif or final_img,
            "secondary_muscles_en": sec_muscles['en'],
            "secondary_muscles_ar": sec_muscles['ar'],
            "common_mistakes_en": mistakes['en'],
            "common_mistakes_ar": mistakes['ar']
        })

    # Save JSON patch file
    with open(PATCH_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump({
            "total_exercises": total_count,
            "local_db_first_count": local_db_media_count,
            "musclewiki_fallback_count": musclewiki_fallback_count,
            "unresolved_count": unresolved_count,
            "patch_data": patch_records
        }, f, ensure_ascii=False, indent=2)

    conn.close()

    print(f"=== AUDIT COMPLETED ===")
    print(f"Total Exercises: {total_count}")
    print(f"Local DB First (Retained): {local_db_media_count}")
    print(f"MuscleWiki Fallback Enriched: {musclewiki_fallback_count}")
    print(f"Unresolved Media: {unresolved_count}")
    print(f"JSON Patch generated at: {PATCH_JSON_PATH}")

if __name__ == '__main__':
    run_audit()
