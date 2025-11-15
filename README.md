# Deepfake Detection Software

Local-first desktop tool that combines a FastAPI backend, Electron UI, and placeholders for EfficientNetV2 inference plus Ollama-based threat reasoning.

## Getting Started

1. **Python backend**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r backend/requirements.txt
   uvicorn backend.app.main:app --reload
   ```
2. **Electron desktop**
   ```bash
   cd desktop
   npm install
   npm run dev
   ```
   The `dev` script bundles the React renderer with esbuild and launches Electron (ensure the backend is already running on `http://localhost:8000`).

## Repository Layout
- `backend/`: FastAPI app with `/analyze` endpoint, placeholder EfficientNetV2 + Ollama integrations.
- `desktop/`: Electron shell, React renderer, esbuild bundling, and API client.
- `ml/`: Research notebooks for future EfficientNetV2 training.
- `docs/`: Architecture notes, threat model, and demo walkthrough.

## Roadmap
- [ ] Replace dummy inference with real EfficientNetV2 checkpoint loading from `backend/models/`.
- [ ] Connect to local Ollama runtime and stream structured reasoning instead of canned payloads.
- [ ] Harden file validation + frame extraction pipeline in `backend/app/utils.py`.
