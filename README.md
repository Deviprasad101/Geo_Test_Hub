# Geo Test Hub / GeoAudit

| Folder | App |
|--------|-----|
| `frontend/` | **GeoAudit – Code Intelligence** (React UI) |
| `backend/` | Flask API — scans ZIP / GitHub uploads for real audit results |

## GeoAudit — run frontend + backend

**Terminal 1 — backend** (required for real audit results):

```powershell
cd backend
venv\Scripts\activate
python app.py
```

**Terminal 2 — frontend**:

```powershell
cd frontend
npm install
npm run dev
```

Login with any email/password → http://localhost:5173 → **New Audit** → upload ZIP or GitHub URL → results reflect actual files in that upload.

---

## Project layout

```
Geo_Test_Hub/
├── backend/          # Flask API (Python)
├── frontend/         # React UI (Vite)
└── README.md
```

## Architecture

| Part | Stack | Port |
|------|--------|------|
| **Backend** | Flask + PostgreSQL | `5000` |
| **Frontend** | React + Vite | `5173` |

Run backend and frontend **in separate terminals**.

## Quick Start

### 1. Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env — DB_USER, DB_PASSWORD, DB_NAME, SECRET_KEY

$env:FLASK_APP="app.py"
flask init-db
flask seed-user
python app.py
```

API: http://localhost:5000

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173

## User Flow

1. **Dashboard** — list projects
2. **Create Project** — name → ZIP upload **or** GitHub URL
3. **Project detail** — scan results and errors

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:id` | Project detail + errors |
| POST | `/api/projects/:id/scan` | Re-scan project files |
| POST | `/project/create` | JSON `{ "name" }` |
| POST | `/project/upload` | FormData: `project_id`, `zip_file` |
| POST | `/project/github` | JSON `{ project_id, github_url }` |

## Backend structure

```
backend/
  app.py
  routes/
  models/
  services/
  utils/
  uploads/projects/{id}/
  scripts/
```

## Database scripts

```powershell
cd backend
python scripts/create_database.py   # create geo_test_hub DB if missing
python scripts/rescan_project.py 2  # re-scan project by id
```
