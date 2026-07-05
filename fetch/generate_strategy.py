#!/usr/bin/env python3
from __future__ import annotations
"""
Top-performing reels -> content strategy report + new scripts + new ideas,
via Claude API.

Run this manually whenever you want to refresh your strategy (it costs Claude
tokens and reads from the current public/data/reels.json, so it's a separate
step from `sync.py`, not run automatically on every sync).

Usage:
    python generate_strategy.py                # top 30% of reels (max 15)
    python generate_strategy.py --top 10        # top 10 reels by engagement rate

Output: public/data/strategy.json
    { "report": "...", "scripts": [...], "ideas": [...] }
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

from common import PUBLIC_DATA_DIR, STRATEGY_PATH, load_json, save_json

load_dotenv(Path(__file__).parent.parent / ".env")

MODEL = "claude-sonnet-4-6"

PROMPT_TEMPLATE = """Eres un estratega de contenido para Reels de Instagram. Te paso los reels que MEJOR han funcionado de una cuenta (ordenados de mejor a peor engagement rate), con su caption, transcript y métricas. Tu trabajo es identificar qué patrones hacen que funcionen y proponer contenido nuevo que los reutilice.

Devuelve SOLO un JSON (sin texto adicional, sin markdown) con esta forma exacta:

{{
  "report": "2-3 párrafos en español explicando qué patrones de temática, gancho inicial, estructura, ritmo y tono se repiten en estos reels y por qué crees que funcionan",
  "scripts": [
    {{
      "title": "título corto del guion",
      "hook": "primera frase, la que engancha en los primeros 2 segundos",
      "script": "guion completo, listo para grabar, en el mismo tono y estilo que los reels de referencia",
      "topic": "tema principal",
      "inspiredBy": "qué reel(s) o patrón concreto de los de abajo lo inspiró"
    }}
  ],
  "ideas": [
    {{
      "title": "título corto de la idea",
      "pitch": "1-2 frases describiendo la idea",
      "format": "talking-head|tutorial|storytime|listicle|meme|entrevista|otro",
      "inspiredBy": "qué reel(s) o patrón concreto lo inspiró"
    }}
  ]
}}

Genera exactamente {n_scripts} guiones y {n_ideas} ideas. Todo en español.

Reels de referencia (de mejor a peor engagement):

{reels_block}
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


def format_reel(reel: dict, rank: int) -> str:
    themes = reel.get("themes") or {}
    return (
        f"#{rank} — engagement {reel['engagementRate']*100:.1f}% "
        f"({reel['views']} vistas, {reel['likes']} likes)\n"
        f"Caption: {reel.get('caption', '')[:300]}\n"
        f"Temática/formato/gancho: {themes.get('topics')} / {themes.get('format')} / {themes.get('hookType')}\n"
        f"Transcript: {(reel.get('transcript') or '')[:1500]}\n"
    )


def pick_top_reels(reels: list[dict], top: int | None) -> list[dict]:
    candidates = [r for r in reels if r.get("transcript")]
    candidates.sort(key=lambda r: r["engagementRate"], reverse=True)
    n = top or min(15, max(1, round(len(candidates) * 0.3)))
    return candidates[:n]


def generate(client, top_reels: list[dict], n_scripts: int, n_ideas: int) -> dict | None:
    reels_block = "\n".join(format_reel(r, i + 1) for i, r in enumerate(top_reels))
    prompt = PROMPT_TEMPLATE.format(reels_block=reels_block, n_scripts=n_scripts, n_ideas=n_ideas)

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}],
            timeout=120,
        )
        text = response.content[0].text.strip()
        if text.startswith("```"):
            text = text.strip("`").removeprefix("json").strip()
        return json.loads(text)
    except Exception as e:
        print(f"ERROR: strategy generation failed: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Generate content strategy report + scripts + ideas from top reels")
    parser.add_argument("--top", type=int, default=None, help="How many top reels to use as reference (default: top 30%%, max 15)")
    parser.add_argument("--scripts", type=int, default=3, help="How many new scripts to generate")
    parser.add_argument("--ideas", type=int, default=5, help="How many new content ideas to generate")
    args = parser.parse_args()

    reels = load_json(PUBLIC_DATA_DIR / "reels.json", [])
    if not reels:
        print("No reels found. Run fetch/sync.py first.")
        return

    top_reels = pick_top_reels(reels, args.top)
    if not top_reels:
        print("No reels with a transcript yet — run fetch_transcripts.py first.")
        return

    print(f"Using top {len(top_reels)} reels (by engagement rate) as reference...")

    client = get_client()
    result = generate(client, top_reels, args.scripts, args.ideas)
    if not result:
        return

    result["generatedAt"] = datetime.now(timezone.utc).isoformat()
    result["basedOnReelIds"] = [r["id"] for r in top_reels]

    save_json(STRATEGY_PATH, result)
    print(f"Saved report + {len(result.get('scripts', []))} scripts + {len(result.get('ideas', []))} ideas -> public/data/strategy.json")


if __name__ == "__main__":
    main()
