"""Client to interact with a local Ollama deployment (placeholder)."""
from __future__ import annotations

from typing import Any, Dict, Optional

import requests

from .config import OLLAMA_URL
from .security_mapping import map_security_implications


def generate_threat_analysis(
    label: str,
    confidence: float,
    context: Optional[str],
    filename: Optional[str] = None,
) -> Dict[str, Any]:
    """Return structured reasoning payload, falling back to static data if Ollama is offline."""

    attack_vectors = map_security_implications(label or "unknown", context)
    prompt = build_prompt(label, confidence, context, attack_vectors)

    llm_response: Dict[str, Any] | None = None
    try:
        body = {"model": "llama2", "prompt": prompt, "stream": False}
        response = requests.post(OLLAMA_URL, json=body, timeout=30)
        response.raise_for_status()
        llm_response = response.json()
    except requests.RequestException:
        llm_response = None

    return {
        "summary": extract_summary(llm_response) or "Dummy analysis",
        "filename": filename,
        "attack_vectors": attack_vectors
        or [
            {
                "name": "impersonation",
                "description": "dummy",
                "impact": "high",
            }
        ],
        "recommendations": extract_recommendations(llm_response)
        or [
            "dummy recommendation",
            "TODO: leverage Ollama for richer defensive actions",
        ],
        "confidence": confidence,
        "label": label,
        "context": context,
        "ollama_endpoint": OLLAMA_URL,
        "raw_llm_response": llm_response,
    }


def build_prompt(label: str, confidence: float, context: Optional[str], attack_vectors: list[dict[str, str]]) -> str:
    """Generate a lightweight prompt for the local Ollama model."""
    context_line = context or "general"
    vector_descriptions = "\n".join(
        f"- {vector['name']}: {vector['description']} (impact: {vector['impact']})" for vector in attack_vectors
    )
    return (
        "You are a cybersecurity analyst assistant. Summarize key threats for SOC operators.\n"
        f"Model verdict: {label} (confidence: {confidence}).\n"
        f"Operational context: {context_line}.\n"
        "Attack vectors to consider:\n"
        f"{vector_descriptions}\n"
        "Respond with JSON containing `summary` and `recommendations` array."
    )


def extract_summary(llm_response: Optional[Dict[str, Any]]) -> Optional[str]:
    """Parse the summary returned by Ollama."""
    if not llm_response:
        return None
    return llm_response.get("summary") or llm_response.get("response")


def extract_recommendations(llm_response: Optional[Dict[str, Any]]) -> Optional[list[str]]:
    """Parse recommendations array from the Ollama response."""
    if not llm_response:
        return None
    recommendations = llm_response.get("recommendations")
    if isinstance(recommendations, list):
        return recommendations
    return None
