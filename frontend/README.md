# GeoAudit – Code Intelligence (Frontend)

React dashboard for GeoJSON validation. Connects to the GVIP FastAPI backend in `../backend` on port 8000.

## Run

Start the backend first:

```powershell
cd ../docker
docker compose up --build
```

Then start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

Vite proxies `/api/v1` and `/health` to `http://localhost:8000` (see `vite.config.js`).

## Login

Register or sign in with your GVIP account. The backend must be running on port 8000.

## Structure

```
src/
  components/   Sidebar, Navbar, UploadPanel, CodeAnalysisCard, …
  pages/        Login, NewAudit, PastAudits, …
  api/          gvip.js, audit.js, gvipAdapter.js
  lib/          auth.js, reportUtils.js, benchmarkUtils.js
```
