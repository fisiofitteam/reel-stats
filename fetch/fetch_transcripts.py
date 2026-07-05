#!/usr/bin/env python3
from __future__ import annotations
"""
Reel -> transcript, via Apify (apify/instagram-reel-scraper, includeTranscript
add-on, billed per minute of audio).

Only fetches transcripts for reels that don't already have one cached, so
re-running this script never re-pays for already-transcribed reels. Passes
the pending reels' direct post URLs to the actor in one batched call.

Usage:
    python fetch_transcripts.py
    python fetch_transcripts.py --limit 10   # only process 10 pending reels (for testing)

Output: data/transcripts/<shortcode>.txt
"""

import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

from common import REELS_STATE_PATH, TRANSCRIPTS_DIR, load_json

load_dotenv(Path(__file__).parent.parent / ".env")

ACTOR_ID = "apify/instagram-reel-scraper"


def get_client():
    try:
        from apify_client import ApifyClient
    except ImportError:
        print("ERROR: apify-client not installed. Run: pip install -r requirements.txt")
        sys.exit(1)

    token = os.getenv("APIFY_TOKEN")
    if not token:
        print("ERROR: Set APIFY_TOKEN in .env (copy from .env.example)")
        sys.exit(1)

    return ApifyClient(token)


def transcript_path(shortcode: str) -> Path:
    return TRANSCRIPTS_DIR / f"{shortcode}.txt"


def fetch_transcripts(client, post_urls: list[str]) -> dict[str, str]:
    """Returns {shortCode: transcript} for whichever URLs the actor could transcribe."""
    run_input = {"username": post_urls, "includeTranscript": True}
    run = client.actor(ACTOR_ID).call(run_input=run_input)
    items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
    return {
        item["shortCode"]: item["transcript"]
        for item in items
        if item.get("shortCode") and item.get("transcript")
    }


def main():
    parser = argparse.ArgumentParser(description="Fetch transcripts for reels missing one")
    parser.add_argument("--limit", type=int, default=None, help="Max reels to transcribe this run")
    args = parser.parse_args()

    reels = load_json(REELS_STATE_PATH, [])
    if not reels:
        print("No reels found. Run fetch_reels.py first.")
        return

    pending = [r for r in reels if r.get("url") and not transcript_path(r["shortcode"]).exists()]
    if args.limit:
        pending = pending[: args.limit]

    if not pending:
        print("No reels pending transcription.")
        return

    print(f"{len(pending)} reels pending transcription (of {len(reels)} total)")

    client = get_client()
    TRANSCRIPTS_DIR.mkdir(parents=True, exist_ok=True)

    transcripts = fetch_transcripts(client, [r["url"] for r in pending])

    done = 0
    for reel in pending:
        text = transcripts.get(reel["shortcode"])
        if text:
            transcript_path(reel["shortcode"]).write_text(text, encoding="utf-8")
            done += 1
        else:
            print(f"  WARNING: no transcript returned for {reel['shortcode']}")

    print(f"Transcribed {done}/{len(pending)} reels")


if __name__ == "__main__":
    main()
