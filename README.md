# Geo Test Hub / GeoAudit

Geospatial validation platform: upload GeoJSON, run validation rules, and view reports.

## Project layout

```
Geo_Test_Hub/
├── frontend/     # React + Vite UI (port 5173)
├── backend/      # GVIP FastAPI API (port 8000)
├── docker/       # Docker Compose (Postgres, Redis, API, Celery)
├── database/     # PostGIS init scripts
├── storage/      # Uploads and sample GeoJSON files
└── README.md
```

## Quick start

**Terminal 1 — backend** (Postgres, Redis, API, Celery):

```powershell
cd docker
docker compose up --build
```

**Terminal 2 — frontend**:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 → register or sign in → **New Audit** → upload `.geojson` → **Validate GeoJSON**.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |
| PostgreSQL (host) | localhost:5433 |

## Local backend (without Docker)

```powershell
cd docker
docker compose up postgres redis

cd ..\backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

Celery worker (separate terminal):

```powershell
cd backend
.venv\Scripts\activate
celery -A app.workers.celery_worker.celery_app worker --loglevel=info
```

## Validation flow

```
Upload GeoJSON → POST /api/v1/upload
       ↓
Create Job → POST /api/v1/jobs
       ↓
Celery Worker → GeoJSONValidator → PostgreSQL
       ↓
View Report → GET /api/v1/reports/{id}
```

Sample files: `storage/samples/valid_sample.geojson`, `storage/samples/invalid_sample.geojson`

## API overview

- `POST /api/v1/auth/register` — Register user
- `POST /api/v1/auth/login` — Login (JWT)
- `GET/POST /api/v1/projects` — Project CRUD
- `POST /api/v1/upload` — Upload GeoJSON
- `POST /api/v1/jobs` — Create validation job
- `GET /api/v1/jobs/{id}/status` — Poll job status
- `GET /api/v1/reports/{id}` — Validation report
- `GET /api/v1/reports/{id}/export` — Download report JSON
