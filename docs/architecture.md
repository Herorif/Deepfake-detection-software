# Architecture Overview

## Stack
- Electron desktop shell (Node.js + Chromium) provides a local-first UI.
- React renderer (bundled with esbuild) handles uploads, visualization, stats polling, and calling the backend.
- FastAPI backend exposes `/health`, `/readiness`, `/stats`, `/threats`, and `/analyze` for inference + reasoning workflows.
- EfficientNetV2 + Ollama integrations are placeholders today and will be swapped with real logic.

## Data Flow
1. User selects media inside Electron.
2. Renderer sends the file/context via `fetch` to `http://localhost:8000/analyze`, including `X-API-Key`.
3. FastAPI writes the upload to `backend/temp`, enforces size/type constraints, and computes a SHA-256 hash.
4. Placeholder EfficientNetV2 returns `{"label": "fake", "confidence": 0.96}`.
5. The backend invokes `generate_threat_analysis()` which (eventually) prompts a local Ollama model and merges `security_mapping` heuristics.
6. Audit event (timestamp, hash, label, attack vectors) is appended to `backend/logs/audit.log`.
7. Response returns to Electron and populates `StatsCard`, `ResultCard`, `ThreatPanel`, and the Threat Gallery (populated from `/threats`).

## Operational Checks
- `/health`: liveness ping.
- `/readiness`: confirms model file presence, temp storage writability, and Ollama availability flag.
- `/stats`: maintained in-memory counter for total analyses and fake/real counts.

## Deployment Model
- Runs entirely on a single workstation: FastAPI via `uvicorn`, Electron via `npm run dev`.
- No external APIs are called; Ollama + EfficientNet will be local binaries/models when implemented.
- Logs land in `backend/logs/`, temporary uploads in `backend/temp/`.
