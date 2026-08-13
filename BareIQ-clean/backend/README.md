# BareIQ API

FastAPI backend for BareIQ, a Gen Z skincare recommendation app for the Indian market. Users take a skin quiz and get scored product matches with Nykaa / Amazon purchase links.

## Structure

```
app/
  main.py                 # app + CORS + startup product seeding
  database.py             # engine/session (SQLite default, Postgres via DATABASE_URL)
  api/                    # quiz, products, recommendations routers
  models/                 # SQLAlchemy models
  schemas/                # Pydantic schemas
  services/
    recommendation_engine.py   # scoring engine (skin type, concerns, tone, budget, prefs, quality)
  data/indian_products.json    # 43 seed products
```

## Run locally

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open <http://localhost:8000/docs>

## Key endpoints

- `POST /api/quiz/submit` - submit quiz, returns `user_id` + how many matches were saved
- `GET  /api/recommendations/{user_id}` - scored products, best match first (incl. `purchase_links`)
- `GET  /api/products` - browse/filter catalog
- `GET/POST /api/seed` - manually seed products
- `GET  /api/health`

## Frontend flow

1. `POST /api/quiz/submit` with the quiz body -> get `user_id`
2. `GET /api/recommendations/{user_id}` -> render cards with `match_score`, `reason`, `purchase_links`

## Deploying

This backend is deployed on **Render only** (see `/render.yaml` at the repo root and `/DEPLOYMENT.md` for the full walkthrough). It is not deployed on Vercel or Netlify — both have a read-only filesystem for Python functions, which breaks the SQLite fallback and isn't worth fighting.

- Set `FRONTEND_URL` to your frontend origin(s), comma-separated if more than one. Any `*.vercel.app` URL is already allowed via regex, so preview deployments work without redeploying the backend.
- For persistent data, set `DATABASE_URL` to a Postgres connection string (`postgres://` is auto-normalized to work with SQLAlchemy). Without it, the backend falls back to a local SQLite file, which resets on every Render redeploy/restart but re-seeds automatically on startup — fine for a demo, not for real user data.
- Python version is pinned once, in `.python-version` in this folder. Don't add a `runtime.txt` alongside it — having both is what caused version-mismatch build failures before.
