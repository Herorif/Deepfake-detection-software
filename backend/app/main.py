from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .inference import analyze_media
from .ollama_client import generate_threat_analysis
from .utils import save_temp_file

app = FastAPI(title="Deepfake Detection Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict:
    """Simple health endpoint for readiness probes."""
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_endpoint(
    file: UploadFile = File(...),
    context: str | None = Form(default=None),
) -> dict:
    """Analyze uploaded media and return dummy inference plus placeholder LLM reasoning."""
    try:
        temp_path = save_temp_file(file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    inference_result = analyze_media(str(temp_path), context)
    llm_payload = generate_threat_analysis(
        label=inference_result.get("label"),
        confidence=inference_result.get("confidence"),
        context=context,
        filename=file.filename,
    )

    return {
        "label": inference_result.get("label", "unknown"),
        "confidence": inference_result.get("confidence", 0.0),
        "context": context,
        "llm": llm_payload,
    }


# TODO: wire up background cleanup for temp files once inference is finalized.

