"""Utility helpers for file management and preprocessing."""
from __future__ import annotations

import shutil
from pathlib import Path
from typing import Iterable
from uuid import uuid4

from fastapi import UploadFile

from .config import TEMP_DIR

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".mp3", ".wav", ".png", ".jpg", ".jpeg"}


def get_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def ensure_supported_extension(filename: str) -> None:
    extension = get_extension(filename)
    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file extension: {extension}")


def save_temp_file(file: UploadFile) -> Path:
    """Persist the incoming upload to the TEMP_DIR for downstream processing."""
    ensure_supported_extension(file.filename or "upload")

    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    destination = TEMP_DIR / f"{uuid4().hex}{get_extension(file.filename)}"
    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    file.file.seek(0)
    return destination


def extract_key_frames(path: str) -> Iterable[Path]:
    """Placeholder for extracting frames from video files for model ingestion."""
    # TODO: implement frame extraction pipeline (e.g., via OpenCV or FFmpeg bindings).
    return []

