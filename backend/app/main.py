from __future__ import annotations

from datetime import datetime
from threading import Lock

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import API_KEY, MODEL_PATH
from .inference import analyze_media
from .ollama_client import generate_threat_analysis
from .security_mapping import get_threat_definitions
from .utils import log_analysis_event, save_temp_file, temp_storage_ready


class StatsTracker:
    """Simple in-memory counter for demo analytics."""

    def __init__(self) -> None:
        self._lock = Lock()
        self._total = 0
        self._fake = 0
        self._real = 0
        self._last_analysis: datetime | None = None

    def record(self, label: str | None) -> None:
        with self._lock:
            normalized = (label or "unknown").lower()
            self._total += 1
            if normalized == "fake":
                self._fake += 1
            elif normalized == "real":
                self._real += 1
            self._last_analysis = datetime.utcnow()

    def snapshot(self) -> dict:
        with self._lock:
            return {
                "total_analyzed": self._total,
                "total_fake": self._fake,
                "total_real": self._real,
                "last_analysis": self._last_analysis.isoformat() if self._last_analysis else None,
            }


app = FastAPI(title="Deepfake Detection Backend", version="0.2.0")
stats_tracker = StatsTracker()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict:
    """Simple liveness check."""
    return {"status": "ok"}


@app.get("/readiness")
async def readiness_check() -> dict:
    """Report readiness indicators for the local stack."""
    readiness = {
        "api": "ok",
        "model_loaded": MODEL_PATH.exists(),
        "temp_storage": "ok" if temp_storage_ready() else "unavailable",
        "ollama_available": False,  # TODO: ping OLLAMA_URL once integrated.
    }
    return readiness


@app.get("/stats")
async def stats_endpoint() -> dict:
    """Return cumulative analysis statistics."""
    return stats_tracker.snapshot()


@app.get("/threats")
async def threat_definitions() -> list[dict[str, str]]:
    """Expose supported attack vectors for UI reference."""
    return get_threat_definitions()


@app.post("/analyze")
async def analyze_endpoint(
    file: UploadFile = File(...),
    context: str | None = Form(default=None),
    x_api_key: str | None = Header(default=None, convert_underscores=False),
) -> JSONResponse | dict:
    """Analyze uploaded media and return dummy inference plus placeholder LLM reasoning."""
    if API_KEY and x_api_key != API_KEY:
        return JSONResponse(status_code=401, content={"error": "invalid_api_key"})

    try:
        saved_file = save_temp_file(file)
        inference_result = analyze_media(str(saved_file.path), context)
        llm_payload = generate_threat_analysis(
            label=inference_result.get("label"),
            confidence=inference_result.get("confidence"),
            context=context,
            filename=file.filename,
        )

        stats_tracker.record(inference_result.get("label", "unknown"))
        log_analysis_event(
            file_hash=saved_file.sha256,
            label=inference_result.get("label", "unknown"),
            confidence=inference_result.get("confidence", 0.0),
            context=context,
            attack_vectors=llm_payload.get("attack_vectors", []),
        )

        return {
            "label": inference_result.get("label", "unknown"),
            "confidence": inference_result.get("confidence", 0.0),
            "context": context,
            "file_hash": saved_file.sha256,
            "llm": llm_payload,
        }
    except HTTPException:
        raise
    except (ValueError, FileNotFoundError) as exc:
        return JSONResponse(status_code=400, content={"error": str(exc)})
    except Exception as exc:  # pylint: disable=broad-except
        return JSONResponse(
            status_code=500,
            content={
                "error": "analysis_failed",
                "detail": str(exc),
            },
        )


# TODO: wire up background cleanup for temp files once inference is finalized.
