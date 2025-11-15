"""Configuration primitives for backend services."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Set


@dataclass(frozen=True)
class Settings:
    """Centralized configuration loaded once per process."""

    base_dir: Path = Path(__file__).resolve().parent.parent
    model_path: Path = base_dir / "models" / "deepfake_efficientnetv2.keras"
    temp_dir: Path = base_dir / "temp"
    log_dir: Path = base_dir / "logs"
    max_file_mb: int = 200
    allowed_extensions: Set[str] = field(
        default_factory=lambda: {".mp4", ".mov", ".avi", ".mkv", ".jpg", ".jpeg", ".png"}
    )
    ollama_url: str = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434/api/generate")
    api_key: str | None = os.getenv("DEEPFAKE_API_KEY", "local-demo-key")

    def __post_init__(self) -> None:
        for directory in (self.temp_dir, self.log_dir):
            directory.mkdir(parents=True, exist_ok=True)


settings = Settings()
MODEL_PATH = settings.model_path  # TODO: load trained EfficientNetV2 weights here.
TEMP_DIR = settings.temp_dir
LOG_DIR = settings.log_dir
MAX_FILE_MB = settings.max_file_mb
ALLOWED_EXTENSIONS = settings.allowed_extensions
MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024
OLLAMA_URL = settings.ollama_url
API_KEY = settings.api_key
