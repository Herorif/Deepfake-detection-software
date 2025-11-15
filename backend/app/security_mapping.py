"""Static heuristics for mapping inference outputs to security implications."""
from __future__ import annotations

from typing import List

THREAT_DEFINITIONS: dict[str, dict[str, str]] = {
    "impersonation": {
        "id": "impersonation",
        "name": "Impersonation",
        "description": "Using synthetic media to pose as executives or trusted officials.",
        "impact": "high",
    },
    "social_engineering": {
        "id": "social_engineering",
        "name": "Social Engineering",
        "description": "Deepfakes embedded in phishing or pretexting campaigns.",
        "impact": "high",
    },
    "kyc_bypass": {
        "id": "kyc_bypass",
        "name": "KYC Bypass",
        "description": "Spoofing biometric or selfie capture flows to onboard fraudulent identities.",
        "impact": "high",
    },
    "evidence_fabrication": {
        "id": "evidence_fabrication",
        "name": "Evidence Fabrication",
        "description": "Planting manipulated media into investigative or legal processes.",
        "impact": "medium",
    },
    "reputation_damage": {
        "id": "reputation_damage",
        "name": "Reputation Damage",
        "description": "Viral misinformation aimed at public figures or brands.",
        "impact": "medium",
    },
    "blackmail": {
        "id": "blackmail",
        "name": "Blackmail",
        "description": "Threatening release of staged compromising content.",
        "impact": "medium",
    },
    "misinformation": {
        "id": "misinformation",
        "name": "Misinformation",
        "description": "Coordinated spread of false narratives using synthetic media.",
        "impact": "medium",
    },
    "benign_content": {
        "id": "benign_content",
        "name": "Benign Content",
        "description": "No notable manipulation detected.",
        "impact": "low",
    },
    "needs_review": {
        "id": "needs_review",
        "name": "Needs Review",
        "description": "Model uncertain. Requires human validation.",
        "impact": "medium",
    },
}

SECURITY_RULES: dict[str, list[str]] = {
    "fake": [
        "impersonation",
        "social_engineering",
        "kyc_bypass",
        "evidence_fabrication",
    ],
    "real": [
        "benign_content",
    ],
    "unknown": [
        "needs_review",
    ],
}


def map_security_implications(label: str, context: str | None = None) -> List[dict[str, str]]:
    """Return canned security reasoning for the supplied label/context."""
    threat_ids = SECURITY_RULES.get(label, SECURITY_RULES["unknown"])

    if context in {"kyc", "onboarding"} and "kyc_bypass" not in threat_ids:
        threat_ids = threat_ids + ["kyc_bypass"]
    elif context in {"vip", "executive"} and "impersonation" not in threat_ids:
        threat_ids = threat_ids + ["impersonation"]

    return [THREAT_DEFINITIONS[threat_id] for threat_id in threat_ids if threat_id in THREAT_DEFINITIONS]


def get_threat_definitions() -> List[dict[str, str]]:
    """Expose all known threat archetypes."""
    return list(THREAT_DEFINITIONS.values())
