# Architecture Overview

## Stack
- Electron desktop shell (Node.js + Chromium) provides a local-first UI.
- React renderer (bundled with esbuild) handles uploads, visualization, and calling the backend.
- FastAPI backend exposes `/health` and `/analyze` for inference + reasoning workflows.
- EfficientNetV2 + Ollama integrations are placeholders today and will be swapped with real logic.

## Data Flow
1. User selects media inside Electron.
2. Renderer sends the file/context via `fetch` to `http://localhost:8000/analyze`.
3. FastAPI writes the upload to `backend/temp` and calls `analyze_media()`.
4. Placeholder EfficientNetV2 returns `{"label": "fake", "confidence": 0.96}`.
5. The backend invokes `generate_threat_analysis()` which (eventually) prompts a local Ollama model and merges `security_mapping` heuristics.
6. Response returns to Electron and populates `ResultCard`, `ThreatPanel`, and `ThreatGallery` reference data.

## Deployment Model
- Runs entirely on a single workstation: FastAPI via `uvicorn`, Electron via `npm run dev`.
- No external APIs are called; Ollama + EfficientNet will be local binaries/models when implemented.
- Logs land in `backend/logs/`, temporary uploads in `backend/temp/`.
