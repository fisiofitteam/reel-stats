#!/usr/bin/env python3
from __future__ import annotations
"""
Full sync: fetch reels -> fetch transcripts -> analyze themes -> build dataset.

Usage:
    python sync.py                    # full sync
    python sync.py --limit 10         # only fetch the latest 10 reels (for testing)
    python sync.py --skip-transcripts # only refresh metrics, skip transcript/theme steps
"""

import argparse
import subprocess
import sys
from pathlib import Path

FETCH_DIR = Path(__file__).parent


def run(script: str, extra_args: list[str]) -> None:
    print(f"\n=== {script} ===")
    subprocess.run([sys.executable, str(FETCH_DIR / script), *extra_args], check=True)


def main():
    parser = argparse.ArgumentParser(description="Sync Instagram reels + transcripts + themes")
    parser.add_argument("--limit", type=int, default=None, help="Max reels to fetch/process (for testing)")
    parser.add_argument("--skip-transcripts", action="store_true", help="Only refresh metrics, skip transcripts/themes")
    args = parser.parse_args()

    limit_args = ["--limit", str(args.limit)] if args.limit else []

    run("fetch_reels.py", limit_args)
    if not args.skip_transcripts:
        run("fetch_transcripts.py", limit_args)
        run("analyze_themes.py", limit_args)
    run("build_dataset.py", [])

    print("\nDone! Run 'npm run dev' to open the dashboard.")


if __name__ == "__main__":
    main()
