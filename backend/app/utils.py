"""Utility helpers for file management and preprocessing."""
from __future__ import annotations

import hashlib
import json
import os
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable, List
from uuid import uuid4

from fastapi import UploadFile

from .config import (
    ALLOWED_EXTENSIONS,
    IMAGE_EXTENSIONS,
    LOG_DIR,
    MAX_FILE_BYTES,
    MAX_FILE_MB,
    TEMP_DIR,
    VIDEO_EXTENSIONS,
)

AUDIT_LOG_PATH = LOG_DIR / "audit.log"
CHUNK_SIZE = 1024 * 1024


@dataclass(frozen=True)
class SavedFile:
    """Metadata returned after persisting an upload to disk."""

    path: Path
    sha256: str
    size_bytes: int
    media_type: str


def get_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def ensure_supported_extension(filename: str) -> None:
    extension = get_extension(filename)
    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file extension: {extension}. Allowed types: {sorted(ALLOWED_EXTENSIONS)}"
        )


def detect_media_type(extension: str) -> str:
    if extension in IMAGE_EXTENSIONS:
        return "image"
    if extension in VIDEO_EXTENSIONS:
        return "video"
    raise ValueError(f"Unsupported media type for extension {extension}")


def ensure_file_size_within_limit(file: UploadFile) -> int:
    """Return file size after ensuring it is below the configured maximum."""
    current_pos = file.file.tell()
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0, current_pos)
    if size > MAX_FILE_BYTES:
        raise ValueError(
            f"File exceeds max size of {MAX_FILE_MB} MB (received ~{size / (1024 * 1024):.2f} MB)"
        )
    return size


def save_temp_file(file: UploadFile) -> SavedFile:
    """Persist the incoming upload to the TEMP_DIR for downstream processing."""
    filename = file.filename or "upload"
    ensure_supported_extension(filename)
    size_bytes = ensure_file_size_within_limit(file)
    extension = get_extension(filename)
    media_type = detect_media_type(extension)

    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    destination = TEMP_DIR / f"{uuid4().hex}{extension}"
    file.file.seek(0)

    digest = hashlib.sha256()
    with destination.open("wb") as buffer:
        while True:
            chunk = file.file.read(CHUNK_SIZE)
            if not chunk:
                break
            buffer.write(chunk)
            digest.update(chunk)
    file.file.seek(0)
    return SavedFile(path=destination, sha256=digest.hexdigest(), size_bytes=size_bytes, media_type=media_type)


def temp_storage_ready() -> bool:
    """Verify we can write/delete files in TEMP_DIR."""
    try:
        TEMP_DIR.mkdir(parents=True, exist_ok=True)
        test_file = TEMP_DIR / f".readiness_{uuid4().hex}"
        test_file.write_text("ready-check", encoding="utf-8")
        test_file.unlink(missing_ok=True)
        return True
    except OSError:
        return False


def log_analysis_event(
    *,
    file_hash: str,
    label: str,
    confidence: float,
    context: str | None,
    attack_vectors: List[dict[str, str]] | None,
) -> None:
    """Append a JSON line describing the analysis for forensic review."""
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "file_hash": file_hash,
        "label": label,
        "confidence": confidence,
        "context": context,
        "attack_vectors": [vector.get("name") for vector in (attack_vectors or [])],
    }
    with AUDIT_LOG_PATH.open("a", encoding="utf-8") as log_file:
        log_file.write(json.dumps(entry) + "\n")


def extract_key_frames(path: str) -> Iterable[Path]:
    """Placeholder for extracting frames from video files for model ingestion."""
    # TODO: implement frame extraction pipeline (e.g., via OpenCV or FFmpeg bindings).
    return []
