# BareIQ

A Gen Z skincare recommendation app for the Indian market. Take a skin quiz, get scored product matches with real purchase links (Nykaa / Amazon).

Live: <https://glow-guide-one.vercel.app>

## Structure

```
frontend/   Next.js 14 app (App Router) — the site itself
backend/    FastAPI + SQLAlchemy API — quiz, recommendations, product catalog
render.yaml Render Blueprint — deploys backend/ as a web service
DEPLOYMENT.md   Full deploy walkthrough (Vercel + Render + Supabase)
```

Each folder has its own README with local run instructions:

- [`frontend/`](./frontend) — Next.js app
- [`backend/`](./backend) — FastAPI app

## Where things run

| Piece | Platform |
|---|---|
| Frontend | Vercel (root directory: `frontend`) |
| Backend | Render (root directory: `backend`, via `render.yaml`) |
| Database | Supabase Postgres (or SQLite fallback for quick demos) |

Backend is **not** deployed on Vercel or Netlify — see `backend/README.md` for why.

## Quick start (local dev)

```bash
# backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# -> http://localhost:8000/docs

# frontend (separate terminal)
cd frontend
npm install
npm run dev
# -> http://localhost:3000
```

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) to deploy your own copy.
