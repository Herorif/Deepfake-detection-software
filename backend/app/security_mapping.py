"""Static heuristics for mapping inference outputs to security implications."""
from __future__ import annotations

from typing import List

SECURITY_RULES: dict[str, list[dict[str, str]]] = {
    "fake": [
        {
            "name": "impersonation",
            "description": "Generated media could impersonate executives or public figures.",
            "impact": "high",
        },
        {
            "name": "evidence_fabrication",
            "description": "Synthetic clips may be used to fabricate evidence in legal disputes.",
            "impact": "medium",
        },
    ],
    "real": [
        {
            "name": "benign_content",
            "description": "No obvious malicious manipulation detected.",
            "impact": "low",
        }
    ],
    "unknown": [
        {
            "name": "needs_review",
            "description": "Model uncertain. Human validation required.",
            "impact": "medium",
        }
    ],
}

def map_security_implications(label: str, context: str | None = None) -> List[dict[str, str]]:
    """Return canned security reasoning for the supplied label/context."""
    if context:
        # TODO: extend rules so context selects more granular attack paths.
        return SECURITY_RULES.get(label, SECURITY_RULES["unknown"])

    return SECURITY_RULES.get(label, SECURITY_RULES["unknown"])

