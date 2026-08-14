# Deploy: Vercel (serverless) + MongoDB Atlas

Stack: FastAPI (Python, serverless) backend + Create React App (craco) frontend,
MongoDB Atlas. Two separate Vercel projects.

## 1. MongoDB Atlas

1. Create a free (M0) cluster.
2. Create a database user (username + password).
3. **Network Access → Add IP → allow `0.0.0.0/0`** (Vercel uses dynamic IPs).
   Secure it with a strong user password.
4. Copy the connection string: `mongodb+srv://<user>:<password>@<cluster>...`

## 2. Backend project (`backend/`)

Vercel auto-detects FastAPI from `server.py` (`app` entrypoint).

1. Create a Vercel project, root directory = `backend/`.
2. Env vars (Settings → Environment Variables):
   `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, `FRONTEND_ORIGIN`,
   `DEMO_PEMBINA_EMAIL/PASSWORD`, `DEMO_SISWA_EMAIL/PASSWORD`, `DEMO_WAKA_EMAIL/PASSWORD`.
   `FRONTEND_ORIGIN` = the frontend Vercel domain, e.g. `https://sixnema.vercel.app`.
3. Deploy. Backend URL = `https://<backend-project>.vercel.app`.

### Seed once (after deploy, pointing at Atlas)

```bash
cd backend
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>... python seed.py
```

Seeding is NOT done at runtime anymore (serverless has no reliable startup hook).

### Local dev

```bash
cd backend
pip install -r requirements.txt
MONGO_URL=... JWT_SECRET=... uvicorn server:app --reload
```

## 3. Frontend project (`frontend/`)

1. Create a Vercel project, root directory = `frontend/`.
   Uses `vercel.json` (build `craco build`, output `build`, SPA rewrite).
2. Env var: `REACT_APP_BACKEND_URL = https://<backend-project>.vercel.app`.
3. Deploy.

## 4. Auth note

Sessions use an httpOnly cookie with `Secure` + `SameSite=None`, so the backend
must be served over HTTPS (Vercel is). CORS only allows `FRONTEND_ORIGIN`, so that
env must match the frontend domain exactly.
