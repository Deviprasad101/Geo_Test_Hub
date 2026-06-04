# GeoAudit – Code Intelligence (Frontend)

React-only enterprise dashboard. **No backend required** — mock data and simulated audits.

## Stack

- Vite + React 18
- React Router 6
- Tailwind CSS
- Lucide React icons
- Framer Motion

## Run

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Login

Any email and password → Sign In → Dashboard.

There are **no HTML files in this folder** (no `index.html`, no `.vite-entry.html`). Vite uses `vite-plugin-html-entry.js` to mount React from `src/main.jsx` only; a hidden cache file lives under `node_modules/.cache/` (not part of your source). Fonts and title come from `src/index.css` and `App.jsx`.

## Structure

```
src/
  components/   Sidebar, Navbar, UploadPanel, AnalysisCard, …
  pages/        Login, NewAudit, PastAudits, …
  layouts/      DashboardLayout
  routes/       AppRoutes
  data/         mockData.js
  lib/          auth.js (localStorage)
```
