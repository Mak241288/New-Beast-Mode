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
           equipment_en, equipment_ar, level, category, rating, source
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
            "source": r[14]
        })
    return exercises

def determine_sets_reps(goal, category):
    """
    Calculate sets and reps depending on the workout goal.
    """
    if category.upper() in ["YOGA", "STRETCHING", "CARDIO"]:
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

def generate_workout_plan(days_per_week, location, equipment_list, level, goal):
    """
    Generate a complete weekly workout routine.
    """
    # 1. Resolve Day Split Config
    days_count = max(2, min(6, days_per_week)) # clamp between 2 and 6
    split_config = SPLIT_CONFIGS[days_count]
    
    weekly_routine = []
    selected_names = set() # Track already selected exercises to avoid duplicates
    
    for day in split_config:
        day_routine = {
            "day_name_en": day["name_en"],
            "day_name_ar": day["name_ar"],
            "exercises": []
        }
        
        # For each target muscle group on this day
        for muscle in day["muscles"]:
            pool = fetch_exercises_for_muscle(muscle, location, equipment_list, level)
            if not pool:
                # If pool is empty, try a broader search without level restrictions
                pool = fetch_exercises_for_muscle(muscle, location, equipment_list, "advanced")
                if not pool:
                    continue # Still empty, skip this muscle group
                    
            # Prioritize higher rated exercises
            pool.sort(key=lambda x: x.get("rating", 0.0), reverse=True)
            
            # Select exercises for this muscle (usually 1-2 per muscle group)
            exercises_to_add = 1 if len(day["muscles"]) > 4 else 2
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
                    if added_count >= exercises_to_add:
                        break
                        
            # If we couldn't meet the target due to avoiding duplication, allow repeats of high rating exercises
            if added_count < exercises_to_add:
                for ex in pool:
                    if len(day_routine["exercises"]) >= (len(day["muscles"]) * exercises_to_add):
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
                        if added_count >= exercises_to_add:
                            break
                            
        weekly_routine.append(day_routine)
        
    return weekly_routine

def main():
    parser = argparse.ArgumentParser(description="BeastMode Intelligent Weekly Workout Plan Generator")
    parser.add_argument("--days", type=int, default=3, help="Number of training days per week (2-6)")
    parser.add_argument("--location", type=str, default="GYM", choices=["GYM", "HOME"], help="Workout location")
    parser.add_argument("--equipment", type=str, default="", help="Comma-separated available equipment (for HOME)")
    parser.add_argument("--level", type=str, default="intermediate", choices=["beginner", "intermediate", "advanced"], help="User fitness level")
    parser.add_argument("--goal", type=str, default="HYPERTROPHY", choices=["STRENGTH", "FAT_LOSS", "HYPERTROPHY", "ATHLETICISM"], help="Workout goal")
    
    args = parser.parse_args()
    
    equip_list = [eq.strip() for eq in args.equipment.split(",") if eq.strip()] if args.equipment else []
    
    print(f"Generating workout plan with parameters:")
    print(f"  -> Days Per Week: {args.days}")
    print(f"  -> Location: {args.location}")
    print(f"  -> Equipment Available: {equip_list if equip_list else 'All (Gym)' if args.location == 'GYM' else 'Bodyweight'}")
    print(f"  -> Level: {args.level} | Goal: {args.goal}\n")
    
    plan = generate_workout_plan(args.days, args.location, equip_list, args.level, args.goal)
    
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
