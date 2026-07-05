#!/usr/bin/env python3
from __future__ import annotations
"""
Merge reel metadata + metrics history + transcripts + themes into the
static JSON files consumed by the frontend.

Usage:
    python build_dataset.py

Output:
    public/data/reels.json
    public/data/insights.json
"""

from collections import defaultdict
from datetime import datetime, timezone

from common import (
    PUBLIC_DATA_DIR,
    REELS_STATE_PATH,
    SNAPSHOTS_PATH,
    THEMES_DIR,
    TRANSCRIPTS_DIR,
    load_json,
    read_jsonl,
    save_json,
)


def engagement_rate(views: int, likes: int, comments: int) -> float:
    if not views:
        return 0.0
    return round((likes + comments) / views, 4)


def build_reels() -> list[dict]:
    reels = load_json(REELS_STATE_PATH, [])
    snapshots = read_jsonl(SNAPSHOTS_PATH)

    history_by_reel: dict[str, list[dict]] = defaultdict(list)
    for snap in snapshots:
        history_by_reel[snap["reelId"]].append({
            "fetchedAt": snap["fetchedAt"],
            "views": snap["views"],
            "likes": snap["likes"],
            "comments": snap["comments"],
        })
    for history in history_by_reel.values():
        history.sort(key=lambda s: s["fetchedAt"])

    result = []
    for reel in reels:
        shortcode = reel["shortcode"]
        transcript_file = TRANSCRIPTS_DIR / f"{shortcode}.txt"
        theme_file = THEMES_DIR / f"{shortcode}.json"

        result.append({
            **reel,
            "engagementRate": engagement_rate(reel["views"], reel["likes"], reel["comments"]),
            "history": history_by_reel.get(reel["id"], []),
            "transcript": transcript_file.read_text(encoding="utf-8") if transcript_file.exists() else None,
            "themes": load_json(theme_file, None),
        })

    result.sort(key=lambda r: r.get("postedAt") or "", reverse=True)
    return result


def aggregate_by(reels: list[dict], key_fn) -> list[dict]:
    groups: dict[str, list[dict]] = defaultdict(list)
    for reel in reels:
        for key in key_fn(reel):
            groups[key].append(reel)

    out = []
    for key, group in groups.items():
        n = len(group)
        out.append({
            "key": key,
            "count": n,
            "avgViews": round(sum(r["views"] for r in group) / n),
            "avgLikes": round(sum(r["likes"] for r in group) / n),
            "avgComments": round(sum(r["comments"] for r in group) / n),
            "avgEngagementRate": round(sum(r["engagementRate"] for r in group) / n, 4),
        })
    out.sort(key=lambda g: g["avgEngagementRate"], reverse=True)
    return out


def build_insights(reels: list[dict]) -> dict:
    with_themes = [r for r in reels if r.get("themes")]
    ranked = sorted(reels, key=lambda r: r["engagementRate"], reverse=True)

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalReels": len(reels),
        "avgEngagementRate": round(sum(r["engagementRate"] for r in reels) / len(reels), 4) if reels else 0,
        "bestReelId": ranked[0]["id"] if ranked else None,
        "worstReelId": ranked[-1]["id"] if ranked else None,
        "byTopic": aggregate_by(with_themes, lambda r: r["themes"]["topics"]),
        "byFormat": aggregate_by(with_themes, lambda r: [r["themes"]["format"]]),
        "byHookType": aggregate_by(with_themes, lambda r: [r["themes"]["hookType"]]),
    }


def main():
    reels = build_reels()
    insights = build_insights(reels)

    save_json(PUBLIC_DATA_DIR / "reels.json", reels)
    save_json(PUBLIC_DATA_DIR / "insights.json", insights)

    print(f"Saved {len(reels)} reels -> public/data/reels.json")
    print(f"Saved insights ({len(insights['byTopic'])} topics) -> public/data/insights.json")


if __name__ == "__main__":
    main()
