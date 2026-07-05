from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
TRANSCRIPTS_DIR = DATA_DIR / "transcripts"
THEMES_DIR = DATA_DIR / "themes"
HISTORY_DIR = DATA_DIR / "history"
STATE_DIR = DATA_DIR / "state"
PUBLIC_DATA_DIR = ROOT / "public" / "data"
THUMBNAILS_DIR = PUBLIC_DATA_DIR / "thumbnails"

REELS_STATE_PATH = STATE_DIR / "reels.json"
SNAPSHOTS_PATH = HISTORY_DIR / "snapshots.jsonl"
STRATEGY_PATH = PUBLIC_DATA_DIR / "strategy.json"


def save_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_json(path: Path, default):
    if not path.exists():
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def append_jsonl(path: Path, record: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def read_jsonl(path: Path) -> list:
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]
