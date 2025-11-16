"""Shared preprocessing utilities for EfficientNetV2 pipelines."""
from __future__ import annotations

from pathlib import Path
from typing import Tuple

import cv2
import numpy as np
from tensorflow.keras.applications.efficientnet_v2 import preprocess_input

IMAGE_SIZE: Tuple[int, int] = (256, 256)


def _prepare_tensor(rgb_image: np.ndarray) -> np.ndarray:
    resized = cv2.resize(rgb_image, IMAGE_SIZE, interpolation=cv2.INTER_AREA)
    float32 = resized.astype(np.float32)
    processed = preprocess_input(float32)
    return np.expand_dims(processed, axis=0)


def decode_bytes_to_rgb(raw_bytes: bytes) -> np.ndarray:
    """Decode raw bytes into an RGB numpy array."""
    np_arr = np.frombuffer(raw_bytes, np.uint8)
    bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("Unable to decode image bytes.")
    return cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)


def preprocess_image(path: str | Path) -> np.ndarray:
    """Read image bytes from disk and convert to EfficientNetV2 input tensor."""
    raw_bytes = Path(path).read_bytes()
    rgb = decode_bytes_to_rgb(raw_bytes)
    return _prepare_tensor(rgb)


def preprocess_bytes(raw_bytes: bytes) -> np.ndarray:
    """Convert raw image bytes to EfficientNetV2 input tensor."""
    rgb = decode_bytes_to_rgb(raw_bytes)
    return _prepare_tensor(rgb)


def preprocess_frame(frame_rgb: np.ndarray) -> np.ndarray:
    """Convert an RGB numpy frame into model-ready batch."""
    return _prepare_tensor(frame_rgb)
