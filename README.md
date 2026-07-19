# 🏋️ BeastMode — AI-Powered Fitness App

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/Groq-LLaMA3-F55036?style=for-the-badge" />
</p>

> تطبيق لياقة بدنية ذكي بالعربي والإنجليزي يولّد خطط تدريب مخصصة بالذكاء الاصطناعي، ويتتبع التقدم، ويحلل الأداء.

---

## ✨ المميزات الرئيسية

- 🤖 **توليد خطط تدريب بالـ AI** — خطط أسبوعية مخصصة بالكامل عبر Groq (LLaMA 3.3)
- 📊 **لوحة تحكم تفاعلية** — تتبع التمارين اليومية والإنجازات
- 📅 **خريطة حرارية للالتزام** — تقويم شهري يُظهر أيام التمرين
- ⚖️ **تتبع الوزن والـ BMI** — منحنى مرئي لتطور وزن الجسم
- 🏆 **الأرقام القياسية الشخصية (PR)** — تسجيل تلقائي لأفضل أداء لكل تمرين
- 📚 **مكتبة تمارين ضخمة** — آلاف التمارين بالعربي من SQLite
- 🔄 **مزامنة ذكية** — سحب تمارين من ExerciseDB API مع ترجمة فورية
- 🌐 **ثنائي اللغة** — عربي / إنجليزي كامل
- 📤 **تصدير التقارير** — Markdown / Word / PDF
- 🔬 **Python Cache Engine** — محرك SQLite محلي مع fallback للـ API

---

## 🗂️ هيكل المشروع

```
New BeastMode/
├── frontend/               # React + TypeScript + Vite
│   └── src/
│       ├── pages/          # Dashboard, MyPlan, Stats, Profile, ExerciseLibrary
│       ├── components/     # ThemeToggle
│       ├── services/       # api.ts (HTTP client)
│       └── utils/          # translations.ts
│
├── backend/                # Express + TypeScript + Prisma
│   └── src/
│       ├── controllers/    # auth, workout, stats, sync, checkin
│       ├── routes/         # REST API routes
│       ├── services/       # aiService, syncService, db
│       └── middleware/     # JWT auth
│
├── workout_generator_python/   # Python + SQLite Cache Engine
│   ├── src/
│   │   ├── resolver.py         # البحث في الـ cache أو الـ API
│   │   ├── generator.py        # توليد الخطط
│   │   └── bulk_importer.py    # استيراد جماعي
│   └── test_performance.py     # بنشمارك الأداء
│
├── run_servers.bat         # تشغيل Backend + Frontend بنقرة واحدة
└── .gitignore
```

---

## 🚀 التشغيل المحلي

### المتطلبات الأساسية
- Node.js 18+
- Python 3.10+
- npm

### 1. استنسخ المشروع
```bash
git clone https://github.com/Mak241288/New-Beast-Mode.git
cd New-Beast-Mode
```

### 2. إعداد الـ Backend
```bash
cd backend
npm install
```

أنشئ ملف `.env` داخل `/backend`:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-strong-random-secret-here"
FRONTEND_URL="http://localhost:5173"
GEMINI_API_KEY="your-gemini-api-key"
RAPIDAPI_KEY="your-rapidapi-key"
GROQ_API_KEY="your-groq-api-key"
```

ثم شغّل migrations وابدأ الـ server:
```bash
npx prisma migrate dev
npm run dev
```

### 3. إعداد الـ Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. إعداد Python (اختياري — لمحرك البحث في التمارين)
```bash
cd workout_generator_python
pip install -r requirements.txt
python setup_project.py
```

### ⚡ تشغيل سريع (Windows فقط)
```
run_servers.bat
```
يفتح Backend على `http://localhost:5000` والـ Frontend على `http://localhost:5173` تلقائياً.

---

## 🔑 متغيرات البيئة المطلوبة

| المتغير | الوصف | مصدره |
|---------|--------|--------|
| `JWT_SECRET` | مفتاح تشفير الـ tokens (128 حرف عشوائي) | `node -e "require('crypto').randomBytes(64).toString('hex')"` |
| `GROQ_API_KEY` | مفتاح Groq للـ AI (LLaMA 3.3) | [console.groq.com](https://console.groq.com) |
| `GEMINI_API_KEY` | مفتاح Google Gemini (اختياري) | [aistudio.google.com](https://aistudio.google.com) |
| `RAPIDAPI_KEY` | مفتاح ExerciseDB API (اختياري) | [rapidapi.com](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb) |

> ⚠️ **تنبيه أمني:** لا ترفع ملف `.env` على GitHub أبداً. وهو محمي بالـ `.gitignore`.

---

## 🛠️ Stack التقني

| الطبقة | التقنية |
|--------|---------|
| Frontend | React 18, TypeScript, Vite, CSS Variables |
| Backend | Express.js, TypeScript, Prisma ORM |
| Database | SQLite (via Prisma) |
| AI | Groq API — LLaMA 3.3 70B |
| Cache Engine | Python + SQLite |
| Auth | JWT (jsonwebtoken + bcryptjs) |

---

## 📡 API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|--------|
| POST | `/api/auth/register` | تسجيل مستخدم جديد |
| POST | `/api/auth/login` | تسجيل الدخول |
| GET | `/api/auth/profile` | جلب بيانات الملف الشخصي |
| PUT | `/api/auth/profile` | تحديث الملف الشخصي |
| POST | `/api/workout/generate` | توليد خطة تدريب بالـ AI |
| GET | `/api/workout/active` | جلب الخطة النشطة |
| GET | `/api/stats` | إحصاءات شاملة |
| POST | `/api/sync/exercises` | مزامنة مكتبة التمارين |
| GET | `/api/sync/performance-test` | بنشمارك أداء الـ Cache |

---

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. افتح Pull Request

---

## 📄 الترخيص

MIT License — استخدم وطوّر بحرية.

---

<p align="center">صُنع بـ ❤️ وكثير من القهوة ☕</p>
