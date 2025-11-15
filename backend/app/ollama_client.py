"""Client to interact with a local Ollama deployment for reasoning."""
from __future__ import annotations

import json
from typing import Any, Dict, Optional

import requests

from .config import OLLAMA_MODEL, OLLAMA_URL
from .security_mapping import map_security_implications

SYSTEM_PROMPT = """You are an expert deepfake analysis assistant.\n\nYou will receive:\n- Model probabilities from one or more deepfake detectors.\n- A list of detected visual or temporal artefacts.\n\nYour job is ONLY to:\n1) Explain why the media is likely fake, likely real, or uncertain, with a focus on which artefacts or risk factors are present.\n2) Convert the numeric scores into a human-readable risk level: \"low\", \"medium\", or \"high\", and a final verdict:\n   - \"likely_fake\"\n   - \"likely_real\"\n   - \"uncertain\"\n\nGuidelines:\n- Consider agreement between models. If models strongly disagree, lean toward \"uncertain\" or \"medium\" risk.\n- If fake probabilities are very high (e.g., > 0.8 on multiple models) and artefacts are strong, use \"high\" risk and \"likely_fake\".\n- If fake probabilities are low and no artefacts are present, use \"low\" risk and \"likely_real\".\n- If results are borderline, noisy, or artefacts are weak, choose \"medium\" risk and possibly \"uncertain\".\n\nALWAYS respond in valid JSON with this schema:\n\n{\n  \"final_verdict\": \"likely_fake | likely_real | uncertain\",\n  \"risk_level\": \"low | medium | high\",\n  \"score_summary\": \"Short plain-language description of how the scores compare.\",\n  \"artefact_explanation\": [\n    \"Explain each relevant artefact or risk factor in simple terms.\"\n  ],\n  \"overall_explanation\": \"1–3 sentences combining scores and artefacts into a clear explanation.\"\n}\n"""

CHAT_ENDPOINT = f"{OLLAMA_URL.rstrip('/')}/api/chat"


def generate_threat_analysis(
    label: str,
    confidence: float,
    context: Optional[str],
    filename: Optional[str] = None,
    analysis_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Return structured reasoning payload powered by Ollama."""

    attack_vectors = map_security_implications(label or "unknown", context)
    analysis_payload = analysis_data or {}

    try:
        payload = {
            "model": OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        "Here is the analysis data from our detectors.\n"
                        "Return ONLY valid JSON as specified.\n\n"
                        f"{json.dumps(analysis_payload, ensure_ascii=False)}"
                    ),
                },
            ],
            "stream": False,
        }
        response = requests.post(CHAT_ENDPOINT, json=payload, timeout=60)
        response.raise_for_status()
        content = response.json()["message"]["content"]
        start = content.find("{")
        end = content.rfind("}")
        parsed = json.loads(content[start : end + 1])
    except Exception:
        parsed = {
            "final_verdict": label.lower() if label else "uncertain",
            "risk_level": "high" if (confidence or 0) > 0.75 else "medium",
            "score_summary": "Ollama reasoning unavailable; falling back to heuristic summary.",
            "artefact_explanation": [
                vector["description"] for vector in attack_vectors[:3]
            ],
            "overall_explanation": "Heuristic reasoning fallback in use.",
        }

    raw_llm_payload = parsed.copy()
    parsed.setdefault("artefact_explanation", [v["description"] for v in attack_vectors])
    parsed.setdefault("overall_explanation", "Heuristic reasoning fallback in use.")

    parsed.update(
        {
            "filename": filename,
            "attack_vectors": attack_vectors,
            "confidence": confidence,
            "label": label,
            "context": context,
            "ollama_endpoint": CHAT_ENDPOINT,
            "analysis_data": analysis_payload,
            "raw_llm_response": raw_llm_payload,
        }
    )
    return parsed
