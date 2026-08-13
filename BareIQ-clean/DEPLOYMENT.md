# BareIQ Web Deployment

This app can be deployed publicly for free as a demo/MVP.

## Free Stack

- Frontend: Vercel Hobby
- Backend: Render free web service
- Database: Supabase Postgres free project

No skincare or AI API key is required for the current quiz recommendation app.

## 1. Push to GitHub

Push this whole folder as one repo. `.gitignore` already excludes `backend/venv`, `frontend/node_modules`, `.env` files, and `backend/skincare.db` — don't force-add those back.

## 2. Create Supabase Database

Create a free Supabase project, then copy the Postgres connection string. Use the pooled connection string if Supabase recommends it for server deployments.

## 3. Deploy Backend on Render

Easiest path: in the Render dashboard, choose **New + → Blueprint**, point it at this repo, and Render will read `render.yaml` at the repo root and configure the service automatically.

If setting it up manually instead, use:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/api/health`

Environment variables:

- `DATABASE_URL`: your Supabase Postgres connection string
- `FRONTEND_URL`: your Vercel app URL, for example `https://bareiq.vercel.app`

Python version comes from the single `.python-version` file in `backend/` — no separate `runtime.txt` needed, and don't add one back; having both caused version-mismatch build failures before.

The backend auto-creates tables and seeds the product database on startup.

## 4. Deploy Frontend on Vercel

Create a new Vercel project from the same GitHub repo.

Settings:

- Root directory: `frontend`
- Framework preset: Next.js
- Build command: `npm run build`
- Install command: `npm install`

Environment variable:

- `NEXT_PUBLIC_API_BASE_URL`: your Render backend URL, for example `https://glowguide-api.onrender.com`

If you previously had a *second* Vercel project pointed at the repo root (for the backend), delete that project — the backend only runs on Render now. Vercel's Python functions have a read-only filesystem, which breaks the SQLite fallback and isn't worth working around.

## 5. Final Check

Open the Vercel URL, take the quiz, and confirm the results page loads real recommendation scores.

If the first result load is slow, that is normal on Render free because the backend can sleep after inactivity.
