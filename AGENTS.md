# 🤖 AGENTS.md — Antigravity Agentic Guidance & Architecture Rules

Welcome to the **BeastMode AI Fitness & Nutrition Ecosystem**. This document serves as the authoritative guide for AI Agents, Developers, and Engineers working within this repository.

---

## 🏗️ 1. System Architecture Overview

The project is structured into three main layers:

```
New BeastMode/
├── frontend/                  # React 19 + Vite + TypeScript (SPA)
│   ├── src/
│   │   ├── components/        # Reusable UI (InteractiveBodyMap, MuscleWikiModal, ExerciseSearchAutocomplete)
│   │   ├── pages/             # Route pages (Dashboard, ExerciseLibrary, MyPlan, Profile, Stats, Login)
│   │   ├── services/          # API fetch services
│   │   └── utils/             # i18n & search normalizer utilities
│   └── public/                # Static assets, favicon, manifest.json
│
├── backend/                   # Node.js + Express + TypeScript + Prisma ORM
│   ├── prisma/                # Prisma schema & SQLite database (dev.db)
│   ├── src/
│   │   ├── controllers/       # Auth, Workout, Stats, Sync controllers
│   │   ├── middleware/        # JWT & Cookie Auth, Rate Limiters
│   │   ├── routes/            # Express API endpoints
│   │   └── services/          # Groq AI & Gemini AI integration
│   └── .env.example           # Environment variable template
│
└── workout_generator_python/  # Python Engine & Exercises SQLite DB
    ├── database/              # exercises.db (4,298 enriched exercises)
    └── src/                   # Database importer, resolver, and indexing scripts
```

---

## 🎨 2. Design System & Frontend Conventions

- **Styling**: Vanilla CSS custom properties & Glassmorphism (`design-system.css`, `App.css`). **Do NOT use TailwindCSS or Shadcn UI**.
- **i18n & RTL/LTR**: Dynamic language support (`lang: 'ar' | 'en'`) with dynamic document direction (`dir="rtl"` or `dir="ltr"`).
- **Icons**: Use `lucide-react` icons exclusively.
- **Search & Autocomplete**: Powered by Fuse.js fuzzy engine and `ExerciseSearchAutocomplete` component.

---

## 🛡️ 3. Backend & Security Standards (OWASP)

- **Authentication**: JWT tokens transmitted via `HttpOnly`, `Secure`, `SameSite=Lax` cookies with authorization header fallback.
- **Rate Limiting**: `express-rate-limit` with global API limiter (`100 req / 15 min`) and strict auth limiter (`10 req / 15 min`).
- **Database Access**: Direct SQLite queries via `sqlite3` for high-performance exercise tree (`exercises.db`) and Prisma ORM for user data (`dev.db`).

---

## 🛠️ 4. Custom Skills Integration

This repository includes specialized workflow skills in `.agents/skills/`:
- `brainstorming`: Requirements exploration before feature implementation.
- `executing-plans`: Plan execution with checkpoints.
- `systematic-debugging`: Debugging protocol before mutating code.
- `frontend-design`: Guidance for aesthetic UI development.
- `verification-before-completion`: Verification checks before claiming task completion.

---

## 🧪 5. Build & Verification Commands

Before completing any task, run the following verification commands to ensure zero TypeScript or syntax errors:

```bash
# Verify Frontend Build
cd frontend
npm run build

# Verify Backend Build
cd backend
npm run build
```
