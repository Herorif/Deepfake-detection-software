from __future__ import annotations

import base64
import binascii
from datetime import datetime
from threading import Lock

from fastapi import FastAPI, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .config import API_KEY, MODEL_PATH
from .inference import analyze_image_bytes, analyze_media
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


class FrameBatch(BaseModel):
    frames: list[str]
    context: str | None = None


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


@app.post("/analyze", response_model=None)
async def analyze_endpoint(request: Request) -> JSONResponse:
    """Analyze uploaded media or JSON frames."""
    content_type = (request.headers.get("content-type") or "").lower()

    try:
        if "application/json" in content_type:
            return await _handle_json_analysis(request)

        x_api_key = request.headers.get("x-api-key")
        if API_KEY and x_api_key != API_KEY:
            return JSONResponse(status_code=401, content={"error": "invalid_api_key"})

        if "multipart/form-data" in content_type:
            form = await request.form()
            upload = form.get("file")
            if upload is None:
                raise HTTPException(status_code=400, detail="Missing 'file' in multipart payload.")
            context = form.get("context")
            media_type = form.get("media_type")
            return _handle_file_analysis(upload, context, media_type)

        raise HTTPException(
            status_code=415,
            detail="Unsupported content type. Use multipart/form-data for files or JSON for frame batches.",
        )
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


@app.post("/analyze/frames")
async def analyze_frames(batch: FrameBatch) -> JSONResponse:
    """Accept frames (e.g., from a Chrome extension) and aggregate predictions."""
    result = _process_frame_batch(batch.frames, batch.context)
    return JSONResponse(content=result)


def _handle_file_analysis(upload: UploadFile, context: str | None, media_type: str | None) -> JSONResponse:
    saved_file = save_temp_file(upload)
    requested_media_type = (media_type or saved_file.media_type or "image").lower()
    inference_result = analyze_media(str(saved_file.path), context, requested_media_type)
    probabilities = inference_result.get("probabilities") or {}
    analysis_payload = {
        "input_type": requested_media_type,
        "models": [
            {
                "name": inference_result.get("model", MODEL_PATH.name),
                "fake_prob": probabilities.get("fake"),
                "real_prob": probabilities.get("real"),
                "confidence": inference_result.get("confidence"),
            }
        ],
        "detected_artifacts": inference_result.get("artifacts") or [],
        "context": context,
        "sha256": saved_file.sha256,
        "image_size": inference_result.get("image_size"),
    }
    llm_payload = generate_threat_analysis(
        label=inference_result.get("label"),
        confidence=inference_result.get("confidence"),
        context=context,
        filename=upload.filename,
        analysis_data=analysis_payload,
    )

    stats_tracker.record(inference_result.get("label", "unknown"))
    log_analysis_event(
        file_hash=saved_file.sha256,
        label=inference_result.get("label", "unknown"),
        confidence=inference_result.get("confidence", 0.0),
        context=context,
        attack_vectors=llm_payload.get("attack_vectors", []),
    )

    return JSONResponse(
        content={
            "label": inference_result.get("label", "unknown"),
            "confidence": inference_result.get("confidence", 0.0),
            "probabilities": inference_result.get("probabilities"),
            "context": context,
            "media_type": requested_media_type,
            "model": inference_result.get("model"),
            "file_hash": saved_file.sha256,
            "artifacts": inference_result.get("artifacts", []),
            "analysis_data": analysis_payload,
            "image_size": inference_result.get("image_size"),
            "llm": llm_payload,
        }
    )


async def _handle_json_analysis(request: Request) -> JSONResponse:
    """Handle Chrome extension style JSON payloads."""
    payload = await request.json()
    payload_context = payload.get("context")
    frames = payload.get("frames")
    single_frame = payload.get("frame") or payload.get("image_base64")
    if not frames and single_frame:
        frames = [single_frame]
    if frames:
        result = _process_frame_batch(frames, payload_context)
        return JSONResponse(content=result)

    raise HTTPException(status_code=400, detail="JSON payload must include 'frames' or 'frame' base64 data.")


def _process_frame_batch(encoded_frames: list[str], context: str | None) -> dict:
    if not encoded_frames:
        raise HTTPException(status_code=400, detail="No frames provided.")

    frame_results = []
    for index, encoded in enumerate(encoded_frames):
        try:
            raw_bytes = base64.b64decode(encoded)
        except binascii.Error as exc:  # pragma: no cover - defensive guard
            raise HTTPException(status_code=400, detail=f"Invalid base64 frame at index {index}") from exc
        result = analyze_image_bytes(raw_bytes, context)
        frame_results.append(result)

    avg_fake = sum(result["probabilities"]["fake"] for result in frame_results) / len(frame_results)
    avg_fake = max(0.0, min(1.0, avg_fake))
    label = "fake" if avg_fake >= 0.5 else "real"
    confidence = avg_fake if label == "fake" else 1 - avg_fake
    probability_payload = {"fake": round(avg_fake, 4), "real": round(1 - avg_fake, 4)}

    artifact_set: list[str] = []
    for result in frame_results:
        for artifact in result.get("artifacts", []):
            if artifact not in artifact_set:
                artifact_set.append(artifact)

    analysis_payload = {
        "input_type": "video_stream",
        "frames_sampled": len(frame_results),
        "models": [
            {
                "name": frame_results[0]["model"] if frame_results else MODEL_PATH.name,
                "fake_prob": probability_payload["fake"],
                "real_prob": probability_payload["real"],
                "confidence": round(confidence, 4),
            }
        ],
        "detected_artifacts": artifact_set,
        "context": context,
    }

    llm_payload = generate_threat_analysis(
        label=label,
        confidence=confidence,
        context=context,
        filename=None,
        analysis_data=analysis_payload,
    )

    stats_tracker.record(label)

    return {
        "label": label,
        "confidence": round(confidence, 4),
        "probabilities": probability_payload,
        "context": context,
        "media_type": "video_stream",
        "model": frame_results[0]["model"] if frame_results else MODEL_PATH.name,
        "analysis_data": analysis_payload,
        "frames_analyzed": len(frame_results),
        "frame_results": frame_results,
        "llm": llm_payload,
    }
