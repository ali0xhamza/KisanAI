# 🌾 KisanAI — Pakistan's First AI-Powered Farming Assistant

<div align="center">

![KisanAI Banner](https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&w=1200&q=80)

[![Made with React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org)
[![Groq AI](https://img.shields.io/badge/AI-Groq%20Llama%203.3-F55036?style=for-the-badge)](https://groq.com)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/pwa)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**🎓 4th Semester Project — BS Computer Science**
**University of Engineering & Technology Lahore, Narowal Campus**

[🌐 Live Demo](#) • [📖 API Docs](#) • [🐛 Report Bug](https://github.com/ali0xhamza/KisanAI/issues) • [✨ Request Feature](https://github.com/ali0xhamza/KisanAI/issues)

</div>

---

## 📌 About The Project

**KisanAI** is Pakistan's first comprehensive AI-powered farming assistant — a full-stack web application built to empower Pakistani farmers with intelligent tools for crop management, disease detection, market intelligence, and financial tracking.

From a small village farmer checking mandi prices to an agriculture officer analyzing seasonal trends — KisanAI serves them all. Built with modern web technologies and powered by state-of-the-art AI, it delivers expert-level agricultural guidance in both **Urdu and English**, completely **free of charge**.

> *"We didn't just build an app — we built a digital companion for Pakistan's 44 million farmers."*
> — Ali Hamza, Lead Developer

---

## ✨ Features at a Glance

### 🤖 AI-Powered Tools
| Feature | Description |
|---|---|
| **AI Chat Assistant** | Real-time farming Q&A powered by Llama 3.3 70B via Groq API — in Urdu or English |
| **Disease Scanner** | Upload any crop photo → AI instantly detects disease + provides treatment plan |
| **Fertilizer Guide** | Personalized NPK recommendations based on crop type, soil, and growth stage |
| **Soil Checker** | AI-powered soil health analysis with actionable improvement suggestions |
| **Crop Planner** | Best crop recommendations based on region, soil type, and season |
| **Yield Predictor** | Harvest estimation based on area, inputs, and historical data |
| **Spray Calculator** | Exact pesticide/herbicide doses for any field size |

### 📊 Market & Weather Intelligence
| Feature | Description |
|---|---|
| **Live Mandi Prices** | Real-time commodity prices from 150+ Pakistani mandis via AMIS.pk scraping |
| **Price History Graph** | 7-30 day price trend charts with AI market advice |
| **Weather Forecast** | 7-day forecast with AI crop recommendations tailored to your location |
| **Push Notifications** | Automated weather alerts + mandi price updates delivered to your device |

### 🌾 Farm Management Suite
| Feature | Description |
|---|---|
| **Crop Calendar** | Seasonal sowing/harvesting schedule with task reminders |
| **Expense Tracker** | Complete farm finance management with seasonal summaries |
| **Farm Diary** | Daily activity log for observations, tasks, and notes |
| **Chat History** | All previous AI conversations saved and searchable |

### 👥 Community & More
| Feature | Description |
|---|---|
| **Farmer Community** | Posts, comments, likes — connect with farmers across Pakistan |
| **Reviews System** | Real farmer testimonials with star ratings |
| **Feedback System** | Bug reports, feature requests, complaints — with email resolution notifications |
| **PWA Support** | Installable on any device, works offline |
| **Admin Panel** | Full admin dashboard with stats, user management, mandi control |

---

## 🛠️ Tech Stack

### Frontend
```
React 18 + Vite          — UI framework
Tailwind CSS             — Styling
React Router v6          — Navigation
Axios                    — HTTP client
i18next                  — Urdu/English internationalization
Recharts                 — Price history graphs
Workbox (VitePWA)        — PWA + offline support
VAPID Web Push           — Push notifications
html2canvas              — Kisan ID Card download
```

### Backend
```
FastAPI (Python 3.13)    — REST API framework
PostgreSQL               — Primary database
SQLAlchemy               — ORM
JWT (python-jose)        — Authentication
bcrypt                   — Password hashing
APScheduler              — Automated tasks (2AM daily scraping)
httpx                    — Async HTTP client
pywebpush                — Web push notifications
Brevo SMTP               — Transactional emails
```

### AI & External APIs
```
Groq API (Llama 3.3 70B) — Primary AI model for chat, disease, yield, spray
OpenWeatherMap API       — Weather forecasts
AMIS.pk                  — Mandi price scraping (ASP.NET ViewState parsing)
Google OAuth 2.0         — Social login
```

### DevOps & Deployment
```
GitHub                   — Version control
Vercel                   — Frontend hosting
Railway                  — Backend + PostgreSQL hosting
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT LAYER                      │
│  React + Vite PWA  │  Mobile Browser  │  Desktop App│
└──────────────────────────┬──────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────┐
│                   API LAYER (FastAPI)                │
│  /api/auth  /api/chat  /api/ai  /api/mandi           │
│  /api/weather  /api/notifications  /api/feedback     │
└──────────────────────────┬──────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼───────┐  ┌──────▼──────┐
│  PostgreSQL  │  │   Groq AI API  │  │  External   │
│   Database   │  │ Llama 3.3 70B  │  │    APIs     │
│              │  │                │  │  Weather    │
│  15+ Tables  │  │  Chat, Disease │  │  AMIS.pk    │
│  JWT Tokens  │  │  Yield, Spray  │  │  Brevo SMTP │
└──────────────┘  └────────────────┘  └─────────────┘
```

---

## 📁 Project Structure

```
KisanAI/
├── frontend/                    # React + Vite PWA
│   ├── src/
│   │   ├── pages/               # 18 page components
│   │   │   ├── Home.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── DiseaseDetection.jsx
│   │   │   ├── MandiPrices.jsx
│   │   │   ├── Weather.jsx
│   │   │   └── admin/           # Admin panel pages
│   │   ├── components/          # Reusable components
│   │   ├── context/             # Auth context
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API service layer
│   │   └── i18n/                # Urdu/English translations
│   ├── public/
│   │   └── sw.js                # Custom service worker
│   └── vite.config.js
│
├── backend/                     # FastAPI Python
│   ├── routes/                  # 15+ API routers
│   │   ├── users.py             # Auth + profile
│   │   ├── ai.py                # AI endpoints
│   │   ├── mandi.py             # Mandi prices
│   │   ├── notifications.py     # Push notifications
│   │   ├── feedback.py          # Reviews
│   │   ├── user_feedback.py     # Feedback system
│   │   └── ...
│   ├── models.py                # SQLAlchemy models
│   ├── auth.py                  # JWT + email utils
│   ├── database.py              # DB connection
│   └── utils/
│       ├── scraper.py           # AMIS.pk scraper
│       └── scheduler.py         # APScheduler jobs
│
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.13+
- Node.js 18+
- PostgreSQL 15+

### Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Fill in your API keys

# Run migrations (tables auto-created)
python -c "from database import engine, Base; from models import *; Base.metadata.create_all(bind=engine)"

# Start server
uvicorn main:app --reload
# API running at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in VITE_API_URL and VITE_VAPID_PUBLIC_KEY

# Start development server
npm run dev
# App running at http://localhost:5173
```

### Environment Variables

**Backend `.env`**
```env
DATABASE_URL=postgresql://user:password@localhost/kisanai
SECRET_KEY=your-jwt-secret-key
GROQ_API_KEY=your-groq-api-key
WEATHER_API_KEY=your-openweathermap-key
BREVO_API_KEY=your-brevo-key
FROM_EMAIL=kisanai.noreply@gmail.com
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_EMAIL=mailto:your@email.com
GOOGLE_CLIENT_ID=your-google-client-id
ENV=development
```

**Frontend `.env`**
```env
VITE_API_URL=http://localhost:8000
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
VITE_OPENWEATHER_KEY=your-openweathermap-key
```

---

## 🗄️ Database Schema

```
users                    — Authentication + farmer profiles
mandi_prices             — Commodity prices (150+ cities)
chat_logs                — AI conversation history
farm_seasons             — Farming seasons
farm_expenses            — Expense records
farm_incomes             — Income records
community_posts          — Community posts
community_comments       — Post comments
community_likes          — Post likes
feedback                 — Star ratings & reviews
user_feedback            — Bug reports & feature requests
push_subscriptions       — Web push notification subscriptions
```

---

## 🔐 Security Features

- **JWT Authentication** with token expiry
- **bcrypt** password hashing
- **OTP Email Verification** on registration
- **Rate Limiting** on AI endpoints
- **Admin Route Protection** with role-based access
- **CORS** configured for production domains
- **Environment Variables** for all secrets
- **API Docs disabled** in production

---

## 📱 PWA Features

- ✅ Installable on Android, iOS, Windows, macOS
- ✅ Offline support with service worker caching
- ✅ Push notifications (weather + mandi alerts)
- ✅ Background sync
- ✅ App manifest with icons

---

## 🚀 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | kisanai.vercel.app |
| Backend | Railway | kisanai-backend.railway.app |
| Database | Railway PostgreSQL | Internal |

---

## 👨‍💻 Team

<table>
  <tr>
    <td align="center">
      <b>Ali Hamza</b><br>
      <sub>Team Lead</sub><br>
    </td>
    <td align="center">
      <b>Abdul Rehman</b><br>
      <sub>Team Member</sub>
    </td>
    <td align="center">
      <b>M. Usman</b><br>
      <sub>Team Member</sub>
    </td>
    <td align="center">
      <b>M. Saad</b><br>
      <sub>Team Member</sub>
    </td>
  </tr>
</table>

---

## 🎓 Academic Info

| | |
|---|---|
| **University** | University of Engineering & Technology Lahore |
| **Campus** | Narowal Campus |
| **Degree** | BS Computer Science |
| **Semester** | 4th Semester (2026) |
| **Course** | Artificial Intelligence |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Free to use for **educational purposes**. If you use this project as inspiration, a credit mention would be appreciated! 🙏

---

## 🙏 Acknowledgements

- [Groq](https://groq.com) — Lightning fast AI inference
- [OpenWeatherMap](https://openweathermap.org) — Weather data
- [AMIS.pk](https://amis.pk) — Pakistan mandi price data
- [Brevo](https://brevo.com) — Email delivery
- [Vercel](https://vercel.com) — Frontend hosting
- [Railway](https://railway.app) — Backend hosting

---

<div align="center">

**Made with ❤️ for Pakistan's 44 Million Farmers 🇵🇰**

⭐ **Star this repo if it helped you!** ⭐

*© 2026 KisanAI — Ali Hamza & Team — UET Lahore*

</div>