#!/usr/bin/env python3
from __future__ import annotations
"""
Transcript + caption -> theme tags, via Claude API.

Only analyzes reels that have a transcript but no cached theme tags yet.

Usage:
    python analyze_themes.py
    python analyze_themes.py --limit 10

Output: data/themes/<shortcode>.json
    { "topics": [...], "format": "...", "hookType": "...", "hasCta": bool, "tone": "..." }
"""

import argparse
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

from common import REELS_STATE_PATH, THEMES_DIR, TRANSCRIPTS_DIR, load_json, save_json

load_dotenv(Path(__file__).parent.parent / ".env")

MODEL = "claude-haiku-4-5-20251001"

PROMPT_TEMPLATE = """Analiza este Reel de Instagram y devuelve SOLO un JSON (sin texto adicional, sin markdown) con esta forma exacta:

{{
  "topics": ["tema1", "tema2"],
  "format": "talking-head|tutorial|storytime|listicle|meme|entrevista|otro",
  "hookType": "pregunta|dato-shock|polemica|historia-personal|humor|otro",
  "hasCta": true,
  "tone": "educativo|inspiracional|humoristico|provocador|informal|otro"
}}

Caption: {caption}

Transcript: {transcript}
"""


def get_client():
    try:
        import anthropic
    except ImportError:
        print("ERROR: anthropic not installed. Run: pip install -r requirements.txt")
        sys.exit(1)

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: Set ANTHROPIC_API_KEY in .env (copy from .env.example)")
        sys.exit(1)

    return anthropic.Anthropic(api_key=api_key)


def theme_path(shortcode: str) -> Path:
    return THEMES_DIR / f"{shortcode}.json"


def analyze(client, caption: str, transcript: str) -> dict | None:
    prompt = PROMPT_TEMPLATE.format(caption=caption[:1000], transcript=transcript[:6000])
    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
            timeout=60,
        )
        text = response.content[0].text.strip()
        if text.startswith("```"):
            text = text.strip("`").removeprefix("json").strip()
        return json.loads(text)
    except Exception as e:
        print(f"  WARNING: theme analysis failed: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Analyze reel themes with Claude")
    parser.add_argument("--limit", type=int, default=None, help="Max reels to analyze this run")
    args = parser.parse_args()

    reels = load_json(REELS_STATE_PATH, [])
    if not reels:
        print("No reels found. Run fetch_reels.py first.")
        return

    pending = []
    for reel in reels:
        transcript_file = TRANSCRIPTS_DIR / f"{reel['shortcode']}.txt"
        if transcript_file.exists() and not theme_path(reel["shortcode"]).exists():
            pending.append(reel)
    if args.limit:
        pending = pending[: args.limit]

    print(f"{len(pending)} reels pending theme analysis")

    client = get_client()
    THEMES_DIR.mkdir(parents=True, exist_ok=True)

    done = 0
    for i, reel in enumerate(pending):
        print(f"  [{i+1}/{len(pending)}] {reel['shortcode']}...")
        transcript = (TRANSCRIPTS_DIR / f"{reel['shortcode']}.txt").read_text(encoding="utf-8")
        themes = analyze(client, reel.get("caption", ""), transcript)
        if themes:
            save_json(theme_path(reel["shortcode"]), themes)
            done += 1

    print(f"Analyzed {done}/{len(pending)} reels")


if __name__ == "__main__":
    main()
