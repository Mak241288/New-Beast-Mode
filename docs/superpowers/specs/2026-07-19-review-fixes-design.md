# Specification: Review & Critical Fixes

This specification details the structural and visual improvements to resolve issues related to data isolation, statistics consistency, empty states, and mobile layout compatibility in the BeastMode application.

## 1. Data Isolation

### Backend API Permissions & Ownership Verification
We must guarantee that one authenticated user cannot mutate or query the details of another user's workout plans, days, exercises, or progress logs.

#### Target Files:
*   [workoutController.ts](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/backend/src/controllers/workoutController.ts)
*   [statsController.ts](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/backend/src/controllers/statsController.ts)

#### Implementation details:
For every endpoint mutating/accessing sub-resources of a workout plan, we will query the item first, check the user ID of its containing plan, and reject requests that do not match the logged-in user:
*   `updateExercise` & `deleteExercise`: Find the exercise, join `dayWorkout.plan`, and verify `plan.userId === req.user.id`.
*   `addCustomExercise`: Find the `dayWorkout` by ID, join `plan`, and verify `plan.userId === req.user.id`.
*   `logProgress`: Find the `exercise`, join `dayWorkout.plan`, and verify `plan.userId === req.user.id`.
*   `updateDayWorkout`: Find the `dayWorkout`, join `plan`, and verify `plan.userId === req.user.id`.
*   `getAlternatives` & `swapExerciseAI`: Find the exercise, join `dayWorkout.plan`, and verify `plan.userId === req.user.id`.

### Isolated Plan Generation (Python Concurrency)
Previously, the python script generated a plan and wrote to a single shared file `generated_plan.json`. This causes concurrency issues and data leaks.

#### Target Files:
*   [generator.py](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/workout_generator_python/src/generator.py)
*   [workoutController.ts](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/backend/src/controllers/workoutController.ts)

#### Implementation details:
*   `generator.py` will parse a new `--output` argument. If provided, the JSON results will be written to that specific path instead of the shared `data/processed/generated_plan.json`.
*   `workoutController.ts` will run the python command with:
    `--output data/processed/generated_plan_${userId}.json`
*   The node controller will read `generated_plan_${userId}.json`, parse the plan, save it to the DB, and immediately delete the temporary JSON file from disk to prevent accumulation.

---

## 2. Data Consistency (Statistics & Dashboard)

All statistics widgets on both the Dashboard and the Stats page will pull from the same `/api/stats` endpoint.

### Backend Stats Calculation
We will calculate stats using the user's historical `ProgressLog` records instead of just the currently active plan.

#### Target Files:
*   [statsController.ts](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/backend/src/controllers/statsController.ts)

#### Implementation details:
1.  **Streak Count (`globalStreak`)**: Iterate backwards through sorted unique dates where the user logged at least one exercise, checking for consecutive days. If the last log is older than yesterday, the streak is 0.
2.  **Total Workouts (`globalWorkouts`)**: Count the number of unique calendar dates across all `ProgressLog` records for the user.
3.  **Estimated Minutes (`globalMinutes`)**: Calculate as `totalCompletedSets * 2` across all logs.
4.  **Completed Exercises (`globalExercises`)**: Total count of all `ProgressLog` entries.

### Frontend Widget Unification
We will build a consistent 4-column metrics layout that is rendered on both the Dashboard and the Stats page.

#### Target Files:
*   [Dashboard.tsx](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/pages/Dashboard.tsx)
*   [Stats.tsx](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/pages/Stats.tsx)

#### Implementation details:
*   `Dashboard.tsx` will fetch stats from `/api/stats` on mount.
*   The layout will display:
    *   **Streak**: Orange/Red Flame icon
    *   **Workouts**: Blue Dumbbell icon
    *   **Minutes**: Yellow Timer icon
    *   **Exercises**: Green Award/Activity icon
*   This exact widget row will replace the top widgets on both pages.

---

## 3. Empty States

We will handle cases where a user has no active plan or no workout logs.

### Target Files:
*   [Dashboard.tsx](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/pages/Dashboard.tsx)
*   [MyPlan.tsx](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/pages/MyPlan.tsx)
*   [Stats.tsx](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/pages/Stats.tsx)

### Implementation details:
*   `MyPlan.tsx`: Display a friendly Alert panel with a button to onboarding if `activePlan` is null (not just when there is an API error).
*   `Dashboard.tsx`: Display onboarding prompt if `activePlan` is null.
*   `Stats.tsx`: Calculate `totalLogs` by summing up all days in the heatmap. If `totalLogs === 0`, render a friendly empty state message asking the user to perform workouts first.

---

## 4. Mobile Layout Checks

### Target Files:
*   [App.css](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/App.css)
*   [MyPlan.tsx](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/pages/MyPlan.tsx)
*   [Dashboard.tsx](file:///c:/Users/khate/Documents/Projects/New%20BeastMode/frontend/src/pages/Dashboard.tsx)

### Implementation details:
*   Add `flexWrap: 'wrap'` to the Quick Tools wrapper in `MyPlan.tsx` to prevent horizontal overflow on smaller screens.
*   Ensure that the top metrics widgets on Dashboard and Stats wrap nicely (`grid-template-columns: repeat(auto-fit, minmax(130px, 1fr))` or `flex-wrap: wrap`) so that they fit mobile devices.
*   Review spacing, padding, and button sizes on mobile viewports.
