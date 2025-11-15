from __future__ import annotations

import shutil
import stat
import tempfile
from pathlib import Path
from threading import Lock
from typing import Iterable, Optional

import cv2
import numpy as np
from PIL import Image
import tensorflow as tf

from .config import IMAGE_EXTENSIONS, MODEL_PATH, VIDEO_EXTENSIONS

MODEL_LOCK = Lock()
_MODEL: tf.keras.Model | None = None
IMAGE_SIZE = (256, 256)
MAX_VIDEO_FRAMES = 8


def _load_model() -> tf.keras.Model:
    global _MODEL
    with MODEL_LOCK:
        if _MODEL is not None:
            return _MODEL

        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model file not found at {MODEL_PATH}. Ensure 'final_model_big.keras' is in 'backend/models/'."
            )

        try:
            _MODEL = tf.keras.models.load_model(MODEL_PATH, safe_mode=False)
        except PermissionError:
            runtime_dir = MODEL_PATH.parent / "runtime"
            runtime_dir.mkdir(parents=True, exist_ok=True)
            temp_path = runtime_dir / f"{MODEL_PATH.stem}_rt.keras"
            shutil.copy2(MODEL_PATH, temp_path)
            temp_path.chmod(stat.S_IREAD | stat.S_IWRITE)
            _MODEL = tf.keras.models.load_model(temp_path, safe_mode=False)
            temp_path.unlink(missing_ok=True)
        return _MODEL


def _preprocess_pil(image: Image.Image) -> np.ndarray:
    image = image.resize(IMAGE_SIZE)
    array = np.asarray(image, dtype=np.float32) / 255.0
    return np.expand_dims(array, axis=0)


def _preprocess_image(path: Path) -> np.ndarray:
    image = Image.open(path).convert("RGB")
    return _preprocess_pil(image)


def _predict_probability(batch: np.ndarray) -> float:
    model = _load_model()
    raw_prediction = model.predict(batch, verbose=0)
    squeezed = np.squeeze(raw_prediction)
    array = np.atleast_1d(squeezed.astype(np.float32))
    if array.size == 1:
        value = float(array.item())
        if not (0.0 <= value <= 1.0):
            value = 1 / (1 + np.exp(-value))
        return value
    exp = np.exp(array - np.max(array))
    softmax = exp / np.sum(exp, axis=-1, keepdims=True)
    return float(softmax[-1])


def _artifact_hints(probability: float, media_type: str) -> list[str]:
    """Return lightweight textual cues based on probability bands."""
    hints: list[str] = []
    if probability >= 0.85:
        hints.append("Model detected strong synthetic texture signatures.")
    elif probability <= 0.15:
        hints.append("Texture, lighting, and compression patterns look authentic.")
    else:
        hints.append("Mixed cues observed; manual verification recommended.")

    if media_type == "video":
        hints.append("Video verdict aggregates sampled frames; validate motion consistency manually.")
    return hints


def _extract_video_frames(path: Path) -> Iterable[np.ndarray]:
    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        return []
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or MAX_VIDEO_FRAMES
    step = max(1, total_frames // MAX_VIDEO_FRAMES)
    frames = []
    index = 0
    while len(frames) < MAX_VIDEO_FRAMES:
        cap.set(cv2.CAP_PROP_POS_FRAMES, index)
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
        index += step
    cap.release()
    return frames


def analyze_media(path: str, context: Optional[str] = None, media_type: str = "image") -> dict:
    media_path = Path(path)
    if not media_path.exists():
        raise FileNotFoundError(f"Media file not found at {media_path}")

    extension = media_path.suffix.lower()
    is_image = extension in IMAGE_EXTENSIONS
    is_video = extension in VIDEO_EXTENSIONS

    if media_type == "image" and not is_image:
        raise ValueError("Unsupported image extension")
    if media_type == "video" and not is_video:
        raise ValueError("Unsupported video extension")

    if media_type == "video":
        frames = _extract_video_frames(media_path)
        if not frames:
            raise ValueError("Unable to decode video frames.")
        probabilities = []
        for frame in frames:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(frame_rgb)
            batch = _preprocess_pil(pil_image)
            probabilities.append(_predict_probability(batch))
        probability = float(sum(probabilities) / len(probabilities))
    else:
        batch = _preprocess_image(media_path)
        probability = _predict_probability(batch)

    probability = max(0.0, min(1.0, probability))
    label = "fake" if probability >= 0.5 else "real"
    confidence = probability if label == "fake" else 1 - probability

    return {
        "label": label,
        "confidence": round(confidence, 4),
        "probabilities": {"fake": round(probability, 4), "real": round(1 - probability, 4)},
        "context": context,
        "model": MODEL_PATH.name,
        "artifacts": _artifact_hints(probability, media_type),
    }
