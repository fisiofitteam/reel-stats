#!/usr/bin/env python3
from __future__ import annotations
"""
Instagram Reels -> local cache, via Apify (apify/instagram-reel-scraper).

Usage:
    python fetch_reels.py                # fetch all reels for IG_USERNAME
    python fetch_reels.py --limit 20      # only fetch the latest 20 (for testing)

Credentials are read from ../.env (APIFY_TOKEN, IG_USERNAME).

Only fetches metrics here (no transcript — that's a paid per-minute add-on
handled separately in fetch_transcripts.py so it's only requested once per
reel, not on every metrics refresh).

Thumbnails are downloaded once and cached locally: Instagram's CDN URLs are
signed with a short expiry and rate-limit/503 a browser requesting many of
them at once, so they can't be referenced live from the frontend.

Output:
    data/raw/reels_<timestamp>.json   raw Apify items for this run (audit trail)
    data/state/reels.json             merged per-reel cache (metadata + latest metrics)
    data/history/snapshots.jsonl      one metrics snapshot per reel per run
    public/data/thumbnails/<shortcode>.jpg
"""

import argparse
import os
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv

from common import RAW_DIR, REELS_STATE_PATH, SNAPSHOTS_PATH, THUMBNAILS_DIR, append_jsonl, load_json, save_json

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


def fetch_raw_items(client, username: str, limit: int | None) -> list[dict]:
    """Run the Instagram reel scraper actor for the given profile and return raw items."""
    run_input = {
        "username": [username],
        "resultsLimit": limit or 200,
    }
    print(f"Running {ACTOR_ID} for @{username}...")
    run = client.actor(ACTOR_ID).call(run_input=run_input)
    items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
    print(f"  Got {len(items)} items")
    return items


def is_reel(item: dict) -> bool:
    """apify/instagram-reel-scraper marks reels via productType='clips', but fall
    back to any video post if that field is missing."""
    product_type = (item.get("productType") or "").lower()
    if product_type:
        return product_type == "clips"
    return bool(item.get("isVideo") or item.get("videoUrl"))


def download_thumbnail(shortcode: str, url: str | None) -> str | None:
    """Download the reel's cover image once and return its local /data/ path.
    Instagram's CDN URLs expire and 503 under a browser's parallel requests,
    so we can't reference them live."""
    if not url:
        return None
    path = THUMBNAILS_DIR / f"{shortcode}.jpg"
    if not path.exists():
        THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                path.write_bytes(resp.read())
        except Exception as e:
            print(f"  WARNING: thumbnail download failed for {shortcode}: {e}")
            return None
    return f"/data/thumbnails/{shortcode}.jpg"


def normalize(item: dict) -> dict:
    shortcode = item.get("shortCode") or item.get("shortcode") or item.get("id")
    return {
        "id": str(item.get("id") or shortcode),
        "shortcode": shortcode,
        "url": item.get("url") or f"https://www.instagram.com/reel/{shortcode}/",
        "videoUrl": item.get("videoUrl"),
        "caption": item.get("caption") or "",
        "postedAt": item.get("timestamp"),
        "durationSeconds": item.get("videoDuration") or 0,
        "thumbnailUrl": download_thumbnail(shortcode, item.get("displayUrl") or item.get("thumbnailUrl")),
        "views": item.get("videoPlayCount") or item.get("videoViewCount") or 0,
        "likes": item.get("likesCount") or 0,
        "comments": item.get("commentsCount") or 0,
    }


def main():
    parser = argparse.ArgumentParser(description="Fetch Instagram reels metadata + metrics via Apify")
    parser.add_argument("--limit", type=int, default=None, help="Max reels to fetch (for testing)")
    args = parser.parse_args()

    username = os.getenv("IG_USERNAME")
    if not username:
        print("ERROR: Set IG_USERNAME in .env (copy from .env.example)")
        sys.exit(1)

    client = get_client()
    raw_items = fetch_raw_items(client, username, args.limit)

    now = datetime.now(timezone.utc).isoformat()
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    save_json(RAW_DIR / f"reels_{now.replace(':', '-')}.json", raw_items)

    reels_by_id = {r["id"]: r for r in load_json(REELS_STATE_PATH, [])}
    fetched = 0
    for item in raw_items:
        if not is_reel(item):
            continue
        reel = normalize(item)
        reels_by_id[reel["id"]] = reel
        append_jsonl(SNAPSHOTS_PATH, {
            "reelId": reel["id"],
            "fetchedAt": now,
            "views": reel["views"],
            "likes": reel["likes"],
            "comments": reel["comments"],
        })
        fetched += 1

    save_json(REELS_STATE_PATH, list(reels_by_id.values()))
    print(f"Saved {fetched} reel snapshots. Total reels tracked: {len(reels_by_id)}")


if __name__ == "__main__":
    main()
