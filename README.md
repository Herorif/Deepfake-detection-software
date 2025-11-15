# Deepfake Detection Software

Local-first desktop tool that combines a FastAPI backend, Electron UI, and placeholders for EfficientNetV2 inference plus Ollama-based threat reasoning. Everything runs on a single workstation for demo and hackathon scenarios.

## Getting Started

1. **One-click bootstrap (optional)**
   - Double-click `initialize.bat` (FastAPI + Electron) or `run.bat` (adds `ollama serve` if installed).
2. **Python backend**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r backend/requirements.txt
   uvicorn backend.app.main:app --reload
   ```
3. **Electron desktop**
   ```bash
   cd desktop
   npm install
   npm run dev
   ```
   The `dev` script bundles the React renderer with esbuild and launches Electron (ensure the backend is already running on `http://localhost:8000`).

## API Surface

| Endpoint       | Method | Description |
| -------------- | ------ | ----------- |
| `/health`      | GET    | Liveness check. |
| `/readiness`   | GET    | Confirms model file visibility, temp storage write access, and Ollama availability flag. |
| `/stats`       | GET    | Returns totals for analyzed files, fake/real breakdown, and timestamp of last run. |
| `/threats`     | GET    | Lists attack vectors (impersonation, KYC bypass, etc.) surfaced in the UI gallery. |
| `/analyze`     | POST   | Accepts video/image uploads + optional context, returns dummy EfficientNetV2 verdict, Ollama-style reasoning, and SHA-256 hash. Requires the `X-API-Key` header. |

### Authentication

- The backend expects `X-API-Key: local-demo-key` by default (configurable via the `DEEPFAKE_API_KEY` environment variable).
- The desktop renderer automatically sends this header through `backendClient.js`.

## Security-Focused Enhancements

- Centralized config (`backend/app/config.py`) controls model paths, temp directories, allowed extensions, upload size (200 MB max), and Ollama URL.
- `utils.py` enforces extension + size checks, computes SHA-256 hashes for each upload, and writes audit logs to `backend/logs/audit.log`.
- `/readiness` verifies the EfficientNet checkpoint path and temp storage writability; `/stats` feeds the desktop `StatsCard`.
- `/threats` exposes the same threat definitions used server-side for security reasoning, enabling synchronized UI tooltips.

## Repository Layout

- `backend/`: FastAPI app with `/analyze`, readiness/stats endpoints, placeholder EfficientNetV2 + Ollama integrations, and audit logging.
- `desktop/`: Electron shell + React renderer (esbuild) with upload flow, stats card, threat gallery fed by the backend, and SHA-256 display.
- `ml/`: Research notebooks for future EfficientNetV2 training.
- `docs/`: Architecture notes, threat model, and updated demo walkthrough.

## Roadmap

- [ ] Replace dummy inference with real EfficientNetV2 checkpoint loading from `backend/models/`.
- [ ] Wire `generate_threat_analysis` to a real Ollama prompt and update `/readiness` to ping the Ollama HTTP API.
- [ ] Extend audit logging with a query/viewer or ship events to a SIEM-friendly format.
