# Finlytics frontend

React 19 + TypeScript (strict) + Vite + Tailwind CSS v4 + React Router + TanStack Query. Charts use Recharts (lazy-loaded), icons use Lucide.

## Run

```bash
cd frontend
npm install
cp .env.example .env     # then adjust
npm run dev              # http://localhost:5173
```

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Type-check then production build into `dist/` |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint |
| `npm test` | Vitest + Testing Library |

## Configuration (`.env`)

| Variable | Default | Meaning |
|---|---|---|
| `VITE_DATA_MODE` | `demo` | `demo` uses the labelled synthetic adapter. `live` calls the API and **never** falls back to demo data on error. |
| `VITE_API_BASE_URL` | `http://localhost:8000` | FastAPI base URL. |
| `VITE_MAX_UPLOAD_MB` | `25` | Client-side upload limit. Keep in sync with the backend. |

No secrets belong in the frontend.

## Backend status and contract

At the time of writing, every Python module under `backend/` is empty: there are no routes, schemas or auth. The frontend therefore ships with:

- **Live client** (`src/services/api`, `src/features/*/services`) written against the proposed contract below.
- **Demo adapter** (`src/services/demo`) with synthetic data, persisted in `localStorage`, enabled only when `VITE_DATA_MODE=demo`. A banner is shown on every page in demo mode. Demo "uploads" are not parsed and are labelled as such; user-created assessments never receive invented analysis.

Proposed endpoints (all under `/api/v1`, JSON; errors as FastAPI `{ "detail": ... }`):

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | Used by Settings → Check API connection |
| GET | `/overview` | `{ statusCounts, total, recent[], activity[] }` |
| GET/POST | `/assessments` | List supports `search,status,risk,period,sort,order,page,pageSize` → `{items,total,page,pageSize}` |
| GET/PATCH/DELETE | `/assessments/{id}` | |
| GET/POST | `/assessments/{id}/documents` | POST is multipart: `file`, `type` |
| GET | `/documents`, `/documents/{id}` | |
| POST/DELETE | `/documents/{id}/retry`, `/documents/{id}` | Retry re-runs extraction |
| GET | `/assessments/{id}/financials` | 404 = not analysed yet |
| GET | `/findings` | Filters: `assessmentId,severity,classification,reviewStatus,search` |
| PATCH | `/findings/{id}` | `{ reviewStatus }` |
| POST | `/findings/{id}/notes` | `{ text }` |
| GET | `/reports` | One entry per assessment, `status: not_generated\|generating\|ready\|failed` |
| POST | `/assessments/{id}/reports` | Generate; optional `fileUrl` on the report enables Download |

Response types are defined in `src/features/*/types.ts`. Document processing is polled every 2 s while any document is `queued` or `processing`.

## Structure

```
src/
  app/            router, providers, layouts (Sidebar, Header, AppLayout)
  components/     ui/ primitives, feedback/ (toast, demo banner), data-display/
  features/       dashboard, assessments, documents, financial-analysis,
                  risk-analysis, reports, settings  (components/hooks/services/pages/types)
  services/       api/ (client, endpoints, errors), file-upload/, demo/
  lib/ hooks/ types/ styles/ test/
```

## Design notes

- Evidence over assertion: figures are labelled Extracted / Calculated / AI interpretation / Missing; missing values show a dash and a reason, never an estimate.
- Findings are classified as Confirmed fact, Potential anomaly or Unverified hypothesis; simulated external evidence is always tagged "Simulated, not live-verified".
- Severity always uses an icon plus text, never colour alone.
- Reports compile only existing data; "Export Markdown" is produced client-side from the displayed content, and "Download file" appears only when the backend supplies a `fileUrl`.
