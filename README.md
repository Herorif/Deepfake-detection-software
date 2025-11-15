# Deepfake Detection Software

Local-first desktop tool that combines a FastAPI backend, React/Electron UI, a Keras EfficientNetV2 image detector (`backend/models/final_model_big.keras`), and Ollama-based threat reasoning. Everything runs on a single workstation for demo and hackathon scenarios.

## Getting Started

1. **One-click bootstrap (recommended)**
   - Double-click `initialize.bat` to launch only the FastAPI backend plus Ollama (useful for API-only demos).
   - Double-click `run.bat` to provision the Python venv, start FastAPI + Ollama, install/build the React UI, and open the compiled app inside an Electron window. No browser required—the Electron shell loads `frontend/build/index.html`.
   - Place your trained `backend/models/final_model_big.keras` file before launching. The current workflow accepts **images only** (video detector coming soon).
2. **Python backend (manual)**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r backend/requirements.txt
   uvicorn backend.app.main:app --reload
   ```
3. **React web frontend (browser dev mode)**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   This starts the Create React App dev server on `http://localhost:3000`, wired to the FastAPI + Ollama stack.
4. **Electron desktop shell (manual app mode)**
   ```bash
   cd frontend
   npm run build
   npm run electron:shell
   ```
   Electron opens the compiled CRA bundle from `frontend/build/`, giving you a native desktop window identical to the browser UI.

## API Surface

| Endpoint   | Method | Description |
| ---------- | ------ | ----------- |
| `/health`  | GET    | Liveness check. |
| `/readiness` | GET | Confirms model file visibility, temp storage write access, and Ollama availability flag. |
| `/stats`   | GET    | Returns totals for analyzed files, fake/real breakdown, and timestamp of last run. |
| `/threats` | GET    | Lists attack vectors (impersonation, KYC bypass, etc.) surfaced in the UI. |
| `/analyze` | POST   | Accepts **image** uploads + optional context, returns EfficientNet verdict/confidence, SHA-256 hash, and Ollama reasoning. Requires `X-API-Key`. |

### Authentication

- Backend expects `X-API-Key: local-demo-key` (override via `DEEPFAKE_API_KEY` env var).
- Ollama requests default to `llama3:8b`. Override with `OLLAMA_MODEL=<model_name>` if you prefer a different local model.
- The React/Electron client automatically includes the header when calling the backend.

## Security-Focused Enhancements

- Centralized config (`backend/app/config.py`) controls model paths, temp directories, allowed extensions (image/video), upload size (200 MB max), Ollama URL/model, and API key.
- `backend/app/utils.py` enforces extension/size checks, classifies uploads as image/video (video path pending), computes SHA-256 hashes, and logs each analysis to `backend/logs/audit.log`.
- `/readiness` validates the EfficientNet checkpoint presence + temp storage write access; `/stats` powers the UI’s telemetry card; `/threats` keeps UI + backend attack vectors synchronized.

## Repository Layout

- `backend/`: FastAPI app with `/analyze`, readiness/stats/threat endpoints, EfficientNetV2 image inference, Ollama integrations, logging utilities, and temp-file helpers.
- `frontend/`: CRA sources in `src/` plus `frontend/electron/main.js` and Electron scripts for the desktop wrapper.
- `ml/`: Research notebooks for EfficientNetV2 training experiments.
- `docs/`: Architecture overview, threat model, and demo script.

## Roadmap

- [ ] Add the forthcoming video detector + frame-extraction pipeline once training completes.
- [ ] Connect `generate_threat_analysis` to an Ollama streaming workflow and update `/readiness` to probe Ollama health.
- [ ] Extend audit logging with a query viewer or SIEM-friendly exporter.

