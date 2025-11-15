"""Client to interact with a local Ollama deployment (placeholder)."""
from __future__ import annotations

from typing import Any, Dict, Optional

from .security_mapping import map_security_implications


def generate_threat_analysis(
    label: str,
    confidence: float,
    context: Optional[str],
    filename: Optional[str] = None,
) -> Dict[str, Any]:
    """Return dummy reasoning payload until the Ollama workflow is wired up.

    TODO: invoke ollama run or an HTTP endpoint exposed by Ollama to get real reasoning.
    """

    attack_vectors = map_security_implications(label or "unknown", context)

    return {
        "summary": "Dummy analysis",
        "filename": filename,
        "attack_vectors": attack_vectors
        or [
            {
                "name": "impersonation",
                "description": "dummy",
                "impact": "high",
            }
        ],
        "recommendations": [
            "dummy recommendation",
            "TODO: leverage Ollama for richer defensive actions",
        ],
        "confidence": confidence,
        "label": label,
        "context": context,
    }

