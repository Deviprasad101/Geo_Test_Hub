# GVIP Backend (FastAPI)

This folder is the **FastAPI** GeoJSON validation API — not Flask.

Do **not** use:
- `flask init-db`
- `flask seed-user`
- `python app.py`
- `$env:FLASK_APP="app.py"`

There is no `app.py` here. The entry point is `app/main.py`.

## Recommended: run with Docker

From the repo root:

```powershell
cd docker
docker compose up
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

## Local run (without Docker API container)

Start Postgres + Redis only:

```powershell
cd docker
docker compose up postgres redis
```

Then in `backend/`:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Celery worker (second terminal):

```powershell
cd backend
.venv\Scripts\activate
celery -A app.workers.celery_worker.celery_app worker --loglevel=info
```

## Database

- Docker Postgres on host: `localhost:5433`
- Inside Docker network: `postgres:5432`
- Use `.env` values from `.env.example` when running locally
