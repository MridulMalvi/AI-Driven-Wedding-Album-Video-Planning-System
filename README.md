# WeddingAI — AI-Driven Wedding Album & Video Planning System

WeddingAI is a production-ready MERN application that turns wedding briefs into cinematic video shot lists, highlight-film timelines, and heirloom album design concepts using AI (OpenRouter / GPT-4o-mini).

---

## 🚀 Deployment Guide

### Part 1: Deploy Backend on Render

1. **Push your code to GitHub** (if not already done).
2. Go to **[Render.com](https://dashboard.render.com/)** and log in.
3. Click **New +** ➔ **Web Service**.
4. Connect your GitHub repository: `AI-Driven-Wedding-Album-Video-Planning-System`.
5. Configure the Web Service settings:
   - **Name**: `weddingai-api` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Region**: Any close region (e.g., `Oregon (US West)` or `Singapore`)
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
6. Scroll down to **Environment Variables** and add the following:

   | Key | Value / Example | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production mode |
   | `PORT` | `5000` | (Render sets this automatically) |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `generate_a_long_random_string` | Random 32+ character string |
   | `AI_PROVIDER` | `openrouter` | Set to `mock` if running without LLM key |
   | `OPENROUTER_API_KEY` | `sk-or-v1-...` | Your OpenRouter API key |
   | `OPENROUTER_MODEL` | `openai/gpt-4o-mini` | Recommended fast model |
   | `FRONTEND_URL` | `https://your-frontend-app.vercel.app` | Your Vercel frontend URL (can update after deploying frontend) |

7. Click **Create Web Service**.
8. Once deployed, copy your Render backend URL (e.g. `https://weddingai-api.onrender.com`).

> **Tip:** You can verify your backend is running by opening `https://your-backend.onrender.com/health` in your browser.

---

### Part 2: Deploy Frontend on Vercel

1. Go to **[Vercel.com](https://vercel.com/)** and log in.
2. Click **Add New...** ➔ **Project**.
3. Import your GitHub repository: `AI-Driven-Wedding-Album-Video-Planning-System`.
4. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend` (Important!)
   - **Build Command**: `vite build` (or leave default)
   - **Output Directory**: `dist` (default)
5. Expand **Environment Variables** and add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-backend-service.onrender.com/api` |

6. Click **Deploy**.
7. Once deployed, copy your Vercel URL (e.g. `https://weddingai-web.vercel.app`).

---

### Part 3: Final Step — Link CORS on Render

1. Return to **Render Dashboard** ➔ Your `weddingai-api` service ➔ **Environment**.
2. Update `FRONTEND_URL` with your actual Vercel URL:
   ```text
   FRONTEND_URL=https://weddingai-web.vercel.app
   ```
3. Save changes. Render will automatically re-deploy with the updated CORS configuration.

---

## 🛠️ Local Development

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, and OPENROUTER_API_KEY
npm install
npm run seed     # Seeds demo accounts and sample palace wedding
npm run dev      # Starts API on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Demo Credentials

All pre-seeded demo accounts use password: **`WeddingAI123!`**

| Role | Email | Description |
|---|---|---|
| **Client** | `client@weddingai.com` | Create celebrations, manage ceremonies, generate & view AI plans |
| **Admin** | `admin@weddingai.com` | Studio command center, monitor all client weddings, approve & update statuses |

---

## 📡 API Overview

- **Health Checks**: `GET /`, `GET /health`, `GET /api/health`
- **Authentication**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Weddings & Ceremonies**: `GET /api/weddings`, `POST /api/weddings`, `GET /api/weddings/:id`, `PUT /api/weddings/:id`, `DELETE /api/weddings/:id`, `POST /api/weddings/:id/functions`
- **AI Generation**: `POST /api/ai/generate-plan/:weddingId`, `GET /api/ai/status/:weddingId`, `GET /api/weddings/:id/video-plans`, `GET /api/weddings/:id/highlight`, `GET /api/weddings/:id/album-design`
- **Admin Command**: `GET /api/admin/dashboard`, `GET /api/admin/weddings`, `PUT /api/admin/weddings/:id/status`
