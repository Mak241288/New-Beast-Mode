# Design Document: Exercise Customization, Search, and Export

## Goal Description
Enhance the Workout Dashboard by providing users with more control over their workout plans. Specifically:
1. Allow users to manually rename workout days (updating both Arabic and English names simultaneously).
2. Add a manual search tab within the exercise swap modal to search the entire exercise library.
3. Provide functionality to export workout routines in both Markdown (.md) and JSON formats for backup and external sharing.

## User Persona
Users managing their personal workout routines who want finer control over day labels, the ability to find specific exercises manually during a swap, and the ability to export their data.

## Features

### 1. Manual Day Renaming
- Provide an edit icon/button next to the Day Title in the `Dashboard.tsx` or `DayDetail.tsx` component.
- When clicked, a modal or inline input allows the user to change the day's name.
- The change will update both the English (`title`) and Arabic (`focusArea`) fields for that specific day simultaneously, ensuring consistency across languages.
- Update the backend API (e.g., `PUT /api/workouts/days/:dayId`) to handle updating day information.

### 2. Manual/Auto Exercise Search in Swap Modal
- Update the existing exercise swap modal (`showSwapId` / `swapOptions`).
- Introduce tabs: "Alternatives" (Auto) and "Search" (Manual).
- **Alternatives Tab:** Displays the current auto-generated alternatives based on the target muscle group (existing functionality).
- **Search Tab:**
    - Contains a search input field.
    - Allows users to type an exercise name (in Arabic or English).
    - Queries the database for all matching exercises (e.g., using `GET /api/exercises/search?q=...`).
    - Displays results that can be selected to replace the current exercise.

### 3. Routine Export (Markdown & JSON)
- Add an "Export Plan" dropdown or two distinct buttons ("Export MD", "Export JSON") in the Plan Controls panel on the `Dashboard.tsx`.
- **Export MD:**
    - Generates a formatted Markdown string representing the current weekly plan, including days, focus areas, and exercise lists.
    - Triggers a download of a `.md` file to the user's local machine.
- **Export JSON:**
    - Serializes the entire current plan state into JSON format.
    - Triggers a download of a `.json` file to the user's local machine.

## Open Questions & Considerations
- *Search Performance:* Ensure the manual search query is optimized so it responds quickly when the user types.
- *State Management:* Ensure the dashboard plan state properly reflects day renaming and manual swaps without needing a full page reload.

## Proposed Changes

### Frontend (`frontend/src/`)
- `components/`: Add/update modal components for Renaming and Search.
- `pages/Dashboard.tsx`: Add export buttons and handlers for downloading `.md` and `.json` files. Add handler for day renaming.
- `services/api.ts`: Add API calls for updating a day and searching exercises.

### Backend (`backend/src/`)
- `routes/workoutRoutes.ts`: Add routes for `PUT /days/:id` and potentially a new route for `GET /exercises/search` if not already available.
- `controllers/workoutController.ts`: Implement the logic for the new routes.

## Verification Plan
- **Automated Tests:** Verify backend API endpoints using existing testing frameworks.
- **Manual Verification:**
    - Rename a day and verify both Arabic and English names are updated in UI and DB.
    - Open swap modal, search for "bicep", and replace an exercise successfully.
    - Click Export MD and Export JSON, verify files download and contain the correct formatted data.
