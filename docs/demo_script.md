# Demo Script

1. Start the FastAPI backend: `uvicorn backend.app.main:app --reload`. Note the startup log showing config paths and audit log location.
2. (Optional) Hit `http://localhost:8000/readiness` and `http://localhost:8000/stats` in a browser or curl to prove operational checks exist.
3. Build + launch the Electron app: `cd desktop && npm install && npm run dev`.
4. Inside the UI, upload a sample media file (<=200 MB, video/image) and pick an operational context (KYC, VIP, etc.).
5. Highlight the JSON-like response rendered on screen: dummy EfficientNet verdict, Ollama reasoning, SHA-256 hash, and the streaming attack vectors.
6. Scroll to the Stats Card to show live totals and last-analysis timestamp. Mention audit logging in `backend/logs/audit.log`.
7. Open the Threat Gallery to show it is powered by the `/threats` endpoint (not hardcoded), reinforcing the security taxonomy story.
