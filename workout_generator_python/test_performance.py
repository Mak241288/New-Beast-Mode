import time
import sys
import os
import sqlite3

# Ensure UTF-8 stdout encoding for Windows CLI
try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

# Import the resolve_exercise function
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "src"))
from resolver import resolve_exercise

print("=====================================================")
# Set console header
print("       BeastMode Performance & Cache Testing        ")
print("=====================================================")

def run_performance_test():
    # Scenario 1: Local Cache Hit
    print("\n[SCENARIO 1] Local SQLite Search (Search for 'Bench Press')")
    start_time = time.time()
    results_1 = resolve_exercise("Bench Press")
    duration_1 = time.time() - start_time
    print(f"  -> Total Found: {len(results_1)} exercises")
    print(f"  -> Execution Time: {duration_1:.4f} seconds")
    if len(results_1) > 0:
        sample = results_1[0]
        print(f"  -> Sample Exercise: {sample['name_en']} | {sample['name_ar']}")
        print(f"     Muscle: {sample['muscle_ar']} | Equipment: {sample['equipment_ar']}")

    # Scenario 2: Cache Miss (API Fallback + AI Translation)
    # We use a very specific exercise name from ExerciseDB to force a miss
    rare_query = "band alternating biceps curl"
    
    # Delete from DB first if it was already cached in a previous test run to ensure a clean cache miss!
    conn = sqlite3.connect(os.path.join("database", "exercises.db"))
    cursor = conn.cursor()
    cursor.execute("DELETE FROM exercises WHERE name_en LIKE '%band alternating biceps curl%'")
    conn.commit()
    conn.close()

    print(f"\n[SCENARIO 2] Cache Miss -> API Fallback & AI Translation (Search for '{rare_query}')")
    start_time = time.time()
    results_2 = resolve_exercise(rare_query)
    duration_2 = time.time() - start_time
    print(f"  -> Total Found: {len(results_2)} exercises")
    print(f"  -> Execution Time: {duration_2:.4f} seconds (API fetch + Llama 3.3 Translation)")
    if len(results_2) > 0:
        sample = results_2[0]
        print(f"  -> Fetched Name (EN): {sample['name_en']}")
        print(f"  -> Translated Name (AR): {sample['name_ar']}")
        print(f"  -> Muscle: {sample['muscle_ar']} | Equipment: {sample['equipment_ar']}")
        print(f"  -> Translation Cache Status: {sample.get('cached', False)}")
        print(f"  -> Translated Instructions (AR): {sample['instructions_ar'][:120]}...")

    # Scenario 3: Local Cache Hit on the newly cached exercise
    print(f"\n[SCENARIO 3] Repeating Search on newly cached exercise (Search for '{rare_query}')")
    start_time = time.time()
    results_3 = resolve_exercise(rare_query)
    duration_3 = time.time() - start_time
    print(f"  -> Total Found: {len(results_3)} exercises")
    print(f"  -> Execution Time: {duration_3:.4f} seconds (Direct SQLite read)")
    if len(results_3) > 0:
        sample = results_3[0]
        print(f"  -> Verification: {sample['name_en']} | {sample['name_ar']}")
        print(f"  -> Cache Verification Status: {sample.get('cached', False)}")

    # Summary
    print("\n=====================================================")
    print("                 PERFORMANCE SUMMARY                 ")
    print("=====================================================")
    print(f"  1. Local DB Search Time:      {duration_1:.4f}s")
    print(f"  2. API Fallback + AI Trans:   {duration_2:.4f}s")
    print(f"  3. Post-Cache SQLite Time:    {duration_3:.4f}s")
    speedup = duration_2 / duration_3 if duration_3 > 0 else 0
    print(f"  ✓ Speedup after caching:      {speedup:.1f}x FASTER!")
    print("=====================================================")

if __name__ == "__main__":
    run_performance_test()
