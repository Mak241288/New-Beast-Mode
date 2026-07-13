import os
import sqlite3
import json
import argparse
import random
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "backend", ".env"))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "database", "exercises.db")

# Standard Muscle Splits by Day count
SPLIT_CONFIGS = {
    2: [
        {"name_en": "Day 1: Full Body (Upper Focus)", "name_ar": "اليوم 1: جسم كامل (تركيز علوي)", "muscles": ["chest", "back", "shoulders", "biceps", "triceps", "quadriceps", "abdominals"]},
        {"name_en": "Day 2: Full Body (Lower Focus)", "name_ar": "اليوم 2: جسم كامل (تركيز سفلي)", "muscles": ["quadriceps", "hamstrings", "glutes", "calves", "chest", "back", "abdominals"]}
    ],
    3: [
        {"name_en": "Day 1: Push (Chest, Shoulders, Triceps)", "name_ar": "اليوم 1: دفع (صدر، أكتاف، ترايسبس)", "muscles": ["chest", "shoulders", "triceps", "abdominals"]},
        {"name_en": "Day 2: Pull (Back, Biceps, Forearms)", "name_ar": "اليوم 2: سحب (ظهر، بايسبس، سواعد)", "muscles": ["lats", "middle back", "biceps", "forearms"]},
        {"name_en": "Day 3: Legs & Core (Quads, Hamstrings, Glutes, Calves)", "name_ar": "اليوم 3: أرجل وبطن (فخذ أمامي، خلفي، جلوتس، سمانة)", "muscles": ["quadriceps", "hamstrings", "glutes", "calves", "abdominals"]}
    ],
    4: [
        {"name_en": "Day 1: Upper Body (Push Focus)", "name_ar": "اليوم 1: الجزء العلوي (تركيز دفع)", "muscles": ["chest", "shoulders", "triceps", "abdominals"]},
        {"name_en": "Day 2: Lower Body (Quad Focus)", "name_ar": "اليوم 2: الجزء السفلي (تركيز أمامي)", "muscles": ["quadriceps", "glutes", "calves"]},
        {"name_en": "Day 3: Upper Body (Pull Focus)", "name_ar": "اليوم 3: الجزء العلوي (تركيز سحب)", "muscles": ["lats", "middle back", "biceps", "abdominals"]},
        {"name_en": "Day 4: Lower Body (Posterior Focus)", "name_ar": "اليوم 4: الجزء السفلي (تركيز خلفي)", "muscles": ["hamstrings", "glutes", "lower back", "calves"]}
    ],
    5: [
        {"name_en": "Day 1: Chest & Triceps", "name_ar": "اليوم 1: صدر وترايسبس", "muscles": ["chest", "triceps", "abdominals"]},
        {"name_en": "Day 2: Back & Biceps", "name_ar": "اليوم 2: ظهر وبايسبس", "muscles": ["lats", "middle back", "biceps", "forearms"]},
        {"name_en": "Day 3: Shoulders & Core", "name_ar": "اليوم 3: أكتاف وبطن", "muscles": ["shoulders", "traps", "abdominals"]},
        {"name_en": "Day 4: Legs (Quads & Calves)", "name_ar": "اليوم 4: أرجل (عضلات أمامية وسمانة)", "muscles": ["quadriceps", "calves"]},
        {"name_en": "Day 5: Legs Posterior (Hamstrings & Glutes)", "name_ar": "اليوم 5: أرجل خلفية (خلفيات وجلوتس)", "muscles": ["hamstrings", "glutes", "lower back"]}
    ],
    6: [
        {"name_en": "Day 1: Push A (Chest Focus)", "name_ar": "اليوم 1: دفع أ (تركيز صدر)", "muscles": ["chest", "shoulders", "triceps"]},
        {"name_en": "Day 2: Pull A (Width Focus)", "name_ar": "اليوم 2: سحب أ (تركيز ظهر عريض)", "muscles": ["lats", "biceps", "abdominals"]},
        {"name_en": "Day 3: Legs A (Quad Focus)", "name_ar": "اليوم 3: أرجل أ (تركيز أمامي)", "muscles": ["quadriceps", "glutes", "calves"]},
        {"name_en": "Day 4: Push B (Shoulder Focus)", "name_ar": "اليوم 4: دفع ب (تركيز أكتاف)", "muscles": ["shoulders", "chest", "triceps"]},
        {"name_en": "Day 5: Pull B (Thickness Focus)", "name_ar": "اليوم 5: سحب ب (تركيز سماكة الظهر)", "muscles": ["middle back", "biceps", "abdominals"]},
        {"name_en": "Day 6: Legs B (Posterior Focus)", "name_ar": "اليوم 6: أرجل ب (تركيز خلفي)", "muscles": ["hamstrings", "glutes", "lower back", "calves"]}
    ]
}

def get_db_connection():
    return sqlite3.connect(DB_PATH)

def fetch_exercises_for_muscle(muscle, location, equipment_list, level):
    """
    Fetch all exercises for a muscle group, filtered by location/equipment and level.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Base query matching muscle
    sql = """
    SELECT id, name_en, name_ar, description_en, description_ar, 
           instructions_en, instructions_ar, muscle_en, muscle_ar, 
           equipment_en, equipment_ar, level, category, rating, source, image_url
    FROM exercises 
    WHERE LOWER(muscle_en) = ?
    """
    params = [muscle.lower()]
    
    # Equipment Filter: If HOME, filter by available equipment
    if location.upper() == "HOME":
        if equipment_list:
            # We construct a list of matched equipment strings
            # Always allow Bodyweight / Body only
            allowed_equip = ["body only", "bodyweight", "none"] + [eq.lower() for eq in equipment_list]
            placeholders = ",".join(["?"] * len(allowed_equip))
            sql += f" AND LOWER(equipment_en) IN ({placeholders})"
            params.extend(allowed_equip)
        else:
            # Default to bodyweight only if no equipment provided
            sql += " AND LOWER(equipment_en) IN ('body only', 'bodyweight', 'none')"
            
    # Level filter: Beginner/Intermediate/Advanced
    # If advanced, we can select any level. If beginner, we prioritize beginner/intermediate.
    if level.lower() == "beginner":
        sql += " AND LOWER(level) IN ('beginner', 'intermediate')"
    
    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()
    
    exercises = []
    for r in rows:
        name_en_lower = (r[1] or "").lower()
        equip_en_lower = (r[9] or "").lower()
        
        # Strict HOME filter: Exclude heavy gym equipment dependent exercises
        if location.upper() == "HOME":
            gym_terms = ["bench press", "leg press", "lat pulldown", "smith machine", "rack", "cable", "machine", "hack squat"]
            if any(term in name_en_lower for term in gym_terms):
                continue
            if any(term in equip_en_lower for term in ["machine", "cable", "lat pull", "bench press"]):
                continue

        exercises.append({
            "id": r[0],
            "name_en": r[1],
            "name_ar": r[2],
            "description_en": r[3],
            "description_ar": r[4],
            "instructions_en": r[5],
            "instructions_ar": r[6],
            "muscle_en": r[7],
            "muscle_ar": r[8],
            "equipment_en": r[9],
            "equipment_ar": r[10],
            "level": r[11],
            "category": r[12],
            "rating": r[13],
            "source": r[14],
            "image_url": r[15]
        })
    return exercises

# Static Warmup & Cooldown routines mapped to day type
WARMUP_EXERCISES = {
    "upper": [
        {
            "id": 9001,
            "name_en": "Arm Circles",
            "name_ar": "دوائر الذراعين للإحماء",
            "description_en": "Warm up shoulders and chest muscles.",
            "description_ar": "إحماء مفاصل الكتف وعضلات الصدر.",
            "instructions_en": "Stand tall, extend arms to sides at shoulder height. Make small circles forward, then backward.",
            "instructions_ar": "قف مستقيماً ومد ذراعيك جانباً بمستوى كتفيك. قم بعمل دوائر صغيرة للأمام ثم للخلف لتنشيط مفصل الكتف.",
            "muscle_en": "Shoulders",
            "muscle_ar": "الأكتاف",
            "equipment_en": "Body Only",
            "equipment_ar": "وزن الجسم",
            "level": "beginner",
            "category": "WARMUP",
            "rating": 5.0,
            "source": "Static_Warmup",
            "image_url": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Arm_Circles/0.jpg",
            "sets": 1,
            "reps_en": "30-45 sec",
            "reps_ar": "30-45 ثانية"
        },
        {
            "id": 9002,
            "name_en": "Jumping Jacks",
            "name_ar": "القفز وفتح الرجلين (Jumping Jacks)",
            "description_en": "Raise heart rate and warm up full body.",
            "description_ar": "رفع نبضات القلب وإحماء كامل الجسم.",
            "instructions_en": "Jump with feet wide while raising hands overhead. Jump back to starting position. Maintain a steady pace.",
            "instructions_ar": "اقفز مع فتح القدمين جانباً ورفع اليدين فوق الرأس في نفس الوقت، ثم اقفز عائداً لنقطة البداية. حافظ على إيقاع مستمر.",
            "muscle_en": "Full Body",
            "muscle_ar": "كامل الجسم",
            "equipment_en": "Body Only",
            "equipment_ar": "وزن الجسم",
            "level": "beginner",
            "category": "WARMUP",
            "rating": 5.0,
            "source": "Static_Warmup",
            "image_url": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Jumping_Jacks/0.jpg",
            "sets": 1,
            "reps_en": "45-60 sec",
            "reps_ar": "45-60 ثانية"
        }
    ],
    "lower": [
        {
            "id": 9003,
            "name_en": "Standing Hip Circles",
            "name_ar": "دوائر الورك لليونة الحوض",
            "description_en": "Warm up hips and lower body joints.",
            "description_ar": "إحماء مفاصل الحوض والركبة والجزء السفلي.",
            "instructions_en": "Place hands on hips, stand with feet shoulder-width apart. Rotate your hips in large slow circles.",
            "instructions_ar": "ضع يديك على خصرك، وقف بقدمين متباعدتين بعرض الكتفين. قم بتدوير حوضك في دوائر واسعة وبطيئة لتليين المفصل.",
            "muscle_en": "Glutes",
            "muscle_ar": "الأرداف",
            "equipment_en": "Body Only",
            "equipment_ar": "وزن الجسم",
            "level": "beginner",
            "category": "WARMUP",
            "rating": 5.0,
            "source": "Static_Warmup",
            "image_url": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Ankle_Circles/0.jpg",
            "sets": 1,
            "reps_en": "30-45 sec",
            "reps_ar": "30-45 ثانية"
        },
        {
            "id": 9002,
            "name_en": "Jumping Jacks",
            "name_ar": "القفز وفتح الرجلين (Jumping Jacks)",
            "description_en": "Raise heart rate and warm up full body.",
            "description_ar": "رفع نبضات القلب وإحماء كامل الجسم.",
            "instructions_en": "Jump with feet wide while raising hands overhead. Jump back to starting position. Maintain a steady pace.",
            "instructions_ar": "اقفز مع فتح القدمين جانباً ورفع اليدين فوق الرأس في نفس الوقت، ثم اقفز عائداً لنقطة البداية. حافظ على إيقاع مستمر.",
            "muscle_en": "Full Body",
            "muscle_ar": "كامل الجسم",
            "equipment_en": "Body Only",
            "equipment_ar": "وزن الجسم",
            "level": "beginner",
            "category": "WARMUP",
            "rating": 5.0,
            "source": "Static_Warmup",
            "image_url": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Jumping_Jacks/0.jpg",
            "sets": 1,
            "reps_en": "45-60 sec",
            "reps_ar": "45-60 ثانية"
        }
    ]
}

COOLDOWN_EXERCISES = {
    "upper": [
        {
            "id": 9004,
            "name_en": "Behind Head Chest Stretch",
            "name_ar": "إطالة الصدر والجزء العلوي خلف الرأس",
            "description_en": "Cool down chest and shoulders after upper workout.",
            "description_ar": "تهدئة وإطالة عضلات الصدر والكتف بعد التمرين العلوي.",
            "instructions_en": "Clasp hands behind your head, draw elbows backward until you feel a deep stretch in your chest.",
            "instructions_ar": "ضع يديك مشبوكتين خلف رأسك، وادفع كوعيك للخلف بلطف حتى تشعر بإطالة مريحة وعميقة في عضلات الصدر والكتف.",
            "muscle_en": "Chest",
            "muscle_ar": "الصدر",
            "equipment_en": "Body Only",
            "equipment_ar": "وزن الجسم",
            "level": "beginner",
            "category": "COOLDOWN",
            "rating": 5.0,
            "source": "Static_Cooldown",
            "image_url": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Chest_Stretch/0.jpg",
            "sets": 1,
            "reps_en": "30-45 sec",
            "reps_ar": "30-45 ثانية"
        },
        {
            "id": 9005,
            "name_en": "Seated Overhead Stretch",
            "name_ar": "الإطالة العلوية من الجلوس",
            "description_en": "Static stretch for spine and upper back recovery.",
            "description_ar": "إطالة ثابتة ومريحة للعمود الفقري وعضلات الظهر العلوي.",
            "instructions_en": "Sit comfortably, interlock fingers and push palms upward towards the ceiling, lengthening the spine.",
            "instructions_ar": "اجلس بوضعية مريحة، اشبك أصابع يديك واضغط براحتيك للأعلى باتجاه السقف لتمديد العمود الفقري والجذع بالكامل.",
            "muscle_en": "Back",
            "muscle_ar": "الظهر",
            "equipment_en": "Body Only",
            "equipment_ar": "وزن الجسم",
            "level": "beginner",
            "category": "COOLDOWN",
            "rating": 5.0,
            "source": "Static_Cooldown",
            "image_url": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Childs_Pose/0.jpg",
            "sets": 1,
            "reps_en": "30-45 sec",
            "reps_ar": "30-45 ثانية"
        }
    ],
    "lower": [
        {
            "id": 9006,
            "name_en": "Lying Glute Stretch",
            "name_ar": "إطالة عضلات الأرداف مستلقياً",
            "description_en": "Stretch glutes and hips post workout.",
            "description_ar": "تهدئة وإطالة عضلات الحوض والأرداف والجلوتس بعد التدريب.",
            "instructions_en": "Lie on back, cross one ankle over opposite knee, pull the opposite thigh towards your chest.",
            "instructions_ar": "استلقِ على ظهرك، ضع كاحل قدم واحدة فوق الركبة المعاكسة، ثم اسحب الفخذ المعاكس نحو صدرك برفق لتهدئة عضلات الأرداف.",
            "muscle_en": "Glutes",
            "muscle_ar": "الأرداف",
            "equipment_en": "Body Only",
            "equipment_ar": "وزن الجسم",
            "level": "beginner",
            "category": "COOLDOWN",
            "rating": 5.0,
            "source": "Static_Cooldown",
            "image_url": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Lying_Glute_Stretch/0.jpg",
            "sets": 1,
            "reps_en": "30-45 sec",
            "reps_ar": "30-45 ثانية"
        },
        {
            "id": 9007,
            "name_en": "Wall Calf Stretch",
            "name_ar": "إطالة عضلات بطة الرجل (Calf Stretch)",
            "description_en": "Stretch calves and Achilles tendons.",
            "description_ar": "إطالة وتمديد عضلة بطة الساق ووتر أكيليس.",
            "instructions_en": "Place hands on wall, step one leg back keeping heel flat on the floor, lean forward.",
            "instructions_ar": "ضع يديك على الجدار، خذ خطوة للخلف بقدم واحدة مع الحفاظ على الكعب مسطحاً على الأرض، ثم امل بجسمك للأمام لتمديد بطة الرجل.",
            "muscle_en": "Calves",
            "muscle_ar": "الساقين",
            "equipment_en": "Body Only",
            "equipment_ar": "وزن الجسم",
            "level": "beginner",
            "category": "COOLDOWN",
            "rating": 5.0,
            "source": "Static_Cooldown",
            "image_url": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/exercises/Calf_Stretch_Elbows_Against_Wall/0.jpg",
            "sets": 1,
            "reps_en": "30-45 sec",
            "reps_ar": "30-45 ثانية"
        }
    ]
}

def determine_sets_reps(goal, category):
    """
    Calculate sets and reps depending on the workout goal.
    """
    if category.upper() in ["YOGA", "STRETCHING", "CARDIO", "WARMUP", "COOLDOWN"]:
        # Duration based
        return {"sets": 3, "reps_en": "30-60 sec", "reps_ar": "30-60 ثانية"}
        
    goal_upper = goal.upper()
    if goal_upper == "STRENGTH":
        return {"sets": 4, "reps_en": "4-6 reps", "reps_ar": "4-6 تكرارات"}
    elif goal_upper == "HYPERTROPHY":
        return {"sets": 3, "reps_en": "8-12 reps", "reps_ar": "8-12 تكرار"}
    elif goal_upper == "FAT_LOSS" or goal_upper == "ATHLETICISM":
        return {"sets": 3, "reps_en": "12-15 reps", "reps_ar": "12-15 تكرار"}
    
    return {"sets": 3, "reps_en": "8-12 reps", "reps_ar": "8-12 تكرار"} # Default

def generate_workout_plan(days_per_week, location, equipment_list, level, goal, target_muscles_filter=None, rest_days_filter=None, exercises_limit=0):
    """
    Generate a complete weekly workout routine (7 days).
    """
    # Map user selected general muscle groups to internal database muscle keys
    internal_muscle_targets = []
    if target_muscles_filter:
        muscle_mapping = {
            'chest': ['chest'],
            'back': ['lats', 'middle back', 'lower back'],
            'shoulders': ['shoulders', 'traps'],
            'legs': ['quadriceps', 'hamstrings', 'glutes', 'calves'],
            'arms': ['biceps', 'triceps', 'forearms'],
            'abs': ['abdominals']
        }
        for group in target_muscles_filter:
            group_lower = group.lower()
            if group_lower in muscle_mapping:
                internal_muscle_targets.extend(muscle_mapping[group_lower])
            else:
                internal_muscle_targets.append(group_lower)

    # 1. Resolve Rest Days
    rest_days_set = set(r.strip().lower() for r in rest_days_filter) if rest_days_filter else set()
    
    # Calculate training days count
    if rest_days_set:
        training_days_count = 7 - len(rest_days_set)
        training_days_count = max(2, min(6, training_days_count))
    else:
        training_days_count = max(2, min(6, days_per_week))
        # Default rest days if not provided
        if training_days_count == 2:
            rest_days_set = {"sunday", "tuesday", "wednesday", "friday", "saturday"} # Monday, Thursday
        elif training_days_count == 3:
            rest_days_set = {"sunday", "tuesday", "thursday", "friday"} # Saturday, Monday, Wednesday
        elif training_days_count == 4:
            rest_days_set = {"sunday", "tuesday", "friday"} # Sat, Mon, Wed, Thu
        elif training_days_count == 5:
            rest_days_set = {"tuesday", "friday"} # Sat, Mon, Wed, Thu, Sat
        else:
            rest_days_set = {"friday"}

    split_config = SPLIT_CONFIGS[training_days_count]
    
    DAYS_OF_WEEK = [
        {"name_en": "Saturday", "name_ar": "السبت"},
        {"name_en": "Sunday", "name_ar": "الأحد"},
        {"name_en": "Monday", "name_ar": "الإثنين"},
        {"name_en": "Tuesday", "name_ar": "الثلاثاء"},
        {"name_en": "Wednesday", "name_ar": "الأربعاء"},
        {"name_en": "Thursday", "name_ar": "الخميس"},
        {"name_en": "Friday", "name_ar": "الجمعة"}
    ]
    
    weekly_routine = []
    selected_names = set() # Track already selected exercises to avoid duplicates
    
    split_idx = 0
    for day_info in DAYS_OF_WEEK:
        day_name_lower = day_info["name_en"].lower()
        
        if day_name_lower in rest_days_set or split_idx >= len(split_config):
            weekly_routine.append({
                "day_name_en": f"{day_info['name_en']} (Rest Day)",
                "day_name_ar": f"{day_info['name_ar']} (يوم راحة)",
                "is_rest_day": True,
                "exercises": []
            })
            continue
            
        day = split_config[split_idx]
        split_idx += 1
        
        # Filter muscles to only those matching user preferences, if filter is active
        day_muscles = day["muscles"]
        if internal_muscle_targets:
            day_muscles = [m for m in day_muscles if m in internal_muscle_targets]
            
        if not day_muscles:
            weekly_routine.append({
                "day_name_en": f"{day_info['name_en']} (Rest Day)",
                "day_name_ar": f"{day_info['name_ar']} (يوم راحة)",
                "is_rest_day": True,
                "exercises": []
            })
            continue

        day_routine = {
            "day_name_en": f"{day_info['name_en']}: {day['name_en']}",
            "day_name_ar": f"{day_info['name_ar']}: {day['name_ar']}",
            "is_rest_day": False,
            "exercises": []
        }
        
        # Determine exercises to add per muscle
        total_limit = int(exercises_limit) if exercises_limit else 0
        if total_limit > 0:
            base_count = total_limit // len(day_muscles)
            extra = total_limit % len(day_muscles)
            muscle_limits = {m: base_count + (1 if idx < extra else 0) for idx, m in enumerate(day_muscles)}
        else:
            if len(day_muscles) <= 2:
                muscle_limits = {m: (3 if m.lower() in ["chest", "lats", "middle back", "quadriceps", "hamstrings"] else 2) for m in day_muscles}
            else:
                muscle_limits = {m: (2 if m.lower() in ["chest", "lats", "middle back", "quadriceps", "hamstrings"] else 1) for m in day_muscles}
        
        # For each target muscle group on this day
        for muscle in day_muscles:
            muscle_limit = muscle_limits[muscle]
            pool = fetch_exercises_for_muscle(muscle, location, equipment_list, level)
            if not pool:
                pool = fetch_exercises_for_muscle(muscle, location, equipment_list, "advanced")
                if not pool:
                    continue
                    
            # Prioritize higher rated exercises
            pool.sort(key=lambda x: x.get("rating", 0.0), reverse=True)
            
            added_count = 0
            
            # Try to add unique exercises
            for ex in pool:
                if ex["name_en"] not in selected_names:
                    sets_reps = determine_sets_reps(goal, ex.get("category", "STRENGTH"))
                    ex_data = {
                        **ex,
                        "sets": sets_reps["sets"],
                        "reps_en": sets_reps["reps_en"],
                        "reps_ar": sets_reps["reps_ar"]
                    }
                    day_routine["exercises"].append(ex_data)
                    selected_names.add(ex["name_en"])
                    added_count += 1
                    if added_count >= muscle_limit:
                        break
                        
            # If we couldn't meet the target due to avoiding duplication, allow repeats of high rating exercises
            if added_count < muscle_limit:
                for ex in pool:
                    if len(day_routine["exercises"]) >= sum(muscle_limits.values()):
                        break
                    # Avoid repeating inside the SAME day at all costs
                    if ex["name_en"] not in [e["name_en"] for e in day_routine["exercises"]]:
                        sets_reps = determine_sets_reps(goal, ex.get("category", "STRENGTH"))
                        ex_data = {
                            **ex,
                            "sets": sets_reps["sets"],
                            "reps_en": sets_reps["reps_en"],
                            "reps_ar": sets_reps["reps_ar"]
                        }
                        day_routine["exercises"].append(ex_data)
                        added_count += 1
                        if added_count >= muscle_limit:
                            break
                            
        # Determine Upper / Lower day type
        day_type = "upper"
        day_title_lower = day["name_en"].lower()
        if any(term in day_title_lower for term in ["legs", "lower", "quad", "posterior", "hamstring", "glute"]):
            day_type = "lower"

        import copy
        day_warmups = copy.deepcopy(WARMUP_EXERCISES[day_type])
        day_cooldowns = copy.deepcopy(COOLDOWN_EXERCISES[day_type])

        main_exercises = day_routine["exercises"]
        final_exercises = []
        order_idx = 0
        for w_ex in day_warmups:
            w_ex["order"] = order_idx
            final_exercises.append(w_ex)
            order_idx += 1
            
        for m_ex in main_exercises:
            m_ex["order"] = order_idx
            final_exercises.append(m_ex)
            order_idx += 1
            
        for c_ex in day_cooldowns:
            c_ex["order"] = order_idx
            final_exercises.append(c_ex)
            order_idx += 1
            
        day_routine["exercises"] = final_exercises

        weekly_routine.append(day_routine)
        
    return weekly_routine

def main():
    parser = argparse.ArgumentParser(description="BeastMode Intelligent Weekly Workout Plan Generator")
    parser.add_argument("--days", type=int, default=3, help="Number of training days per week (2-6)")
    parser.add_argument("--location", type=str, default="GYM", choices=["GYM", "HOME"], help="Workout location")
    parser.add_argument("--equipment", type=str, default="", help="Comma-separated available equipment (for HOME)")
    parser.add_argument("--level", type=str, default="intermediate", choices=["beginner", "intermediate", "advanced"], help="User fitness level")
    parser.add_argument("--goal", type=str, default="HYPERTROPHY", choices=["STRENGTH", "FAT_LOSS", "HYPERTROPHY", "ATHLETICISM"], help="Workout goal")
    parser.add_argument("--muscles", type=str, default="", help="Comma-separated target muscles (chest, back, shoulders, legs, arms, abs)")
    parser.add_argument("--rest-days", type=str, default="", help="Comma-separated rest days (e.g. friday,sunday)")
    parser.add_argument("--limit", type=int, default=0, help="Number of exercises per training day")
    
    args = parser.parse_args()
    
    equip_list = [eq.strip() for eq in args.equipment.split(",") if eq.strip()] if args.equipment else []
    muscle_list = [m.strip() for m in args.muscles.split(",") if m.strip()] if args.muscles else []
    rest_list = [r.strip() for r in args.rest_days.split(",") if r.strip()] if args.rest_days else []
    
    print(f"Generating workout plan with parameters:")
    print(f"  -> Days Per Week: {args.days}")
    print(f"  -> Location: {args.location}")
    print(f"  -> Equipment Available: {equip_list if equip_list else 'All (Gym)' if args.location == 'GYM' else 'Bodyweight'}")
    print(f"  -> Target Muscles: {muscle_list if muscle_list else 'All Muscles'}")
    print(f"  -> Custom Rest Days: {rest_list if rest_list else 'Default'}")
    print(f"  -> Exercises Per Day Limit: {args.limit if args.limit > 0 else 'Dynamic'}")
    print(f"  -> Level: {args.level} | Goal: {args.goal}\n")
    
    plan = generate_workout_plan(args.days, args.location, equip_list, args.level, args.goal, muscle_list, rest_list, args.limit)
    
    # Configure UTF-8 stdout encoding for printing Arabic
    import sys
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
        
    print("=====================================================================")
    print("                    GENERATED WEEKLY WORKOUT PLAN                    ")
    print("=====================================================================")
    
    for day in plan:
        print(f"\n★ {day['day_name_ar']} ({day['day_name_en']})")
        print("-" * 65)
        if day.get("is_rest_day"):
            print("     يوم راحة - استرخِ واستعد للحصة القادمة (Rest Day)")
            print()
            continue
        for idx, ex in enumerate(day["exercises"]):
            print(f"  {idx+1}. {ex['name_ar']} ({ex['name_en']})")
            print(f"     Target: {ex['muscle_ar']} | Equipment: {ex['equipment_ar']}")
            print(f"     Sets: {ex['sets']} × {ex['reps_ar']} ({ex['reps_en']})")
            print()
            
    # Output to temporary file for backend use
    output_path = os.path.join(BASE_DIR, "data", "processed", "generated_plan.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(plan, f, ensure_ascii=False, indent=2)
    print(f"[SUCCESS] Saved plan JSON to: {output_path}")

if __name__ == "__main__":
    main()
