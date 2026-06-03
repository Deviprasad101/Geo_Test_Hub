# Geo Test Hub — Project Upload Module

Geospatial Testing Platform with project creation via **ZIP upload** or **GitHub repository import**.

## Architecture

| Part | Stack | Port |
|------|--------|------|
| **Backend** | Flask (Python) + PostgreSQL | `5000` |
| **Frontend** | React + Vite | `5173` |

Run backend and frontend **in separate terminals**.

## Tech Stack

- **Backend:** Flask, SQLAlchemy, Flask-CORS
- **Frontend:** React 18, React Router, Vite
- **Database:** PostgreSQL
- **Auth:** None — default system user for `user_id` FK

## Quick Start

### 1. Backend

```powershell
cd "d:\TIH PROJECTS\Geo_Test_Hub\Geo_Test_Hub"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env — DATABASE_URL, SECRET_KEY, CORS_ORIGINS

$env:FLASK_APP="app.py"
flask init-db
flask seed-user
python app.py
```

API: http://localhost:5000

### 2. Frontend (separate terminal)

```powershell
cd "d:\TIH PROJECTS\Geo_Test_Hub\Geo_Test_Hub\frontend"
npm install
copy .env.example .env
npm run dev
```

UI: http://localhost:5173

In development, Vite proxies `/api` and `/project` to Flask — you usually **do not** need `VITE_API_URL` in `.env`. For production builds, set `VITE_API_URL=http://localhost:5000` (or your API host).

## User Flow

1. **Dashboard** — list projects
2. **Create Project** — enter name → ZIP upload **or** GitHub URL
3. **Project detail** — view status and metadata

## API Endpoints (backend)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:id` | Project detail |
| POST | `/project/create` | JSON `{ "name" }` |
| POST | `/project/upload` | FormData: `project_id`, `zip_file` |
| POST | `/project/github` | JSON `{ project_id, github_url }` |

## Project Structure

```
app.py
routes/          # Flask blueprints (API + project actions)
models/
services/
frontend/        # React app (run with npm run dev)
  src/pages/
  src/api/client.js
uploads/projects/{id}/
```
