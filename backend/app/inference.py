from pathlib import Path
from typing import Optional


def analyze_media(path: str, context: Optional[str] = None) -> dict:
    """Run dummy EfficientNetV2 inference.

    TODO: load EfficientNetV2 weights from disk and perform inference on the media file.
    """

    media_path = Path(path)
    if not media_path.exists():
        raise FileNotFoundError(f"Media file not found at {media_path}")

    # Placeholder inference response while the real model is under development.
    return {
        "label": "fake",
        "confidence": 0.96,
        "notes": "TODO: replace with real EfficientNetV2 inference output",
        "context": context,
    }

