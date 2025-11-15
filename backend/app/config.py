"""Configuration primitives for backend services."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    base_dir: Path = Path(__file__).resolve().parent.parent
    model_path: Path = base_dir / "models" / "efficientnetv2_placeholder.pth"
    temp_dir: Path = base_dir / "temp"
    log_dir: Path = base_dir / "logs"

    def __post_init__(self) -> None:
        for directory in (self.temp_dir, self.log_dir):
            directory.mkdir(parents=True, exist_ok=True)


settings = Settings()
MODEL_PATH = settings.model_path  # TODO: load trained EfficientNetV2 weights here.
TEMP_DIR = settings.temp_dir
LOG_DIR = settings.log_dir

