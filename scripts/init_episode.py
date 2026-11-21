#!/usr/bin/env python3
"""Create a starter episode directory for the Origami Market Video skill.

Scaffolds the default shape: a 10-beat, 60-second post-close market recap at
1080x1920 / 30 fps, with the market schema (instrument, value, change, as-of,
source) already in place so the episode is filled rather than restructured.
"""

import argparse
import json
from pathlib import Path

WIDTH, HEIGHT, FPS = 1080, 1920, 30
INTRO, OUTRO = 4.0, 5.0
BEAT_BLOCK = 5.1
BEAT_COUNT = 10
SHOW_NAME = "MARKET WITH REN"
INTRO_LINE = "This is Market with Ren — and these are today's stories."
DISCLAIMER = (
    "This video is for information only and is not investment advice. "
    "Market data as of <time> IST on <date>. "
    "Please consult a SEBI-registered adviser before investing."
)

# role, default beat label, default Ren plan
BEATS = [
    ("close_snapshot", "Close snapshot", ("focused", "present")),
    ("driver", "The driver", ("explaining", "explain")),
    ("top_gainer", "Top gainer", ("confident", "present")),
    ("second_gainer", "Second gainer or theme", ("confident", "present")),
    ("top_loser", "Top loser", ("concerned", "present")),
    ("sector_scorecard", "Sector scorecard", ("explaining", "point-up")),
    ("flows", "Flows: FII and DII", ("focused", "present")),
    ("macro", "Macro moves", ("focused", "present")),
    ("global_cues", "Global cues", ("focused", "present")),
    ("what_to_watch", "What to watch", ("neutral", "present")),
]

README = """# Episode Workspace

This folder was created by the Origami Market Video skill.

Recommended flow:
1. Fill `research/market_manifest.json` — one entry per beat, with instrument,
   value, signed change, as-of timestamp and source.
2. Fill `research/price-ledger.csv` — one row per number that appears on screen.
3. Draft `editorial/voiceover-script.md`, including the disclaimer line.
4. Retime and describe `editorial/scene-plan.json` (charts, captions, Ren).
5. Validate, then render (the desk block is already set — 50% width, centred on Ren, rim at 89.2%, may bleed right):

```bash
python <skill-dir>/scripts/validate_episode.py <episode-dir>
```

`validate_episode.py` fails on missing files, unparsable data, missing required
fields, numbers that will not parse, sign mismatches between change and percent,
and impossible timings. It warns (and can be made to fail with `--strict`) on
runtime drift, scene/beat mismatches, unknown Ren preset names, missing beat
roles, news-desk geometry outside its fixed band, missing disclaimer text and
advice language in the script. Run it with `--strict` before the final export.
"""

DELIVERY = f"""# Delivery notes

- Mode: post-close recap (switch to pre-market for a morning brief)
- Market: NSE / BSE, India — all timestamps IST
- Runtime target: 60s (intro {INTRO:g}s / beats {BEAT_BLOCK * BEAT_COUNT:g}s / outro {OUTRO:g}s)
- Canvas: {WIDTH}x{HEIGHT}, 9:16 vertical
- Frame rate: {FPS} fps
- Export: H.264 MP4, yuv420p, AAC 48 kHz
- Ren: x=600, bottom_y=1800, 480x504 (centre 840)
- Desk: assets/props/news-desk/red-news-desk.svg — 540x155, x=570, rim 110px above Ren's bottom edge (y=1690), in front of Ren, bleeding 30px past the right edge
- Voice: male English anchor, one voice for the whole episode; no transition sound effects
- Disclaimer: none on screen and none spoken; paste the line below into the YouTube description and the pinned comment
- Deliverables: MP4, captions, price ledger, chart data, screenshots, disclaimer text, editable source files
"""


def beat_id(i):
    return f"beat-{i:02d}"


def beat_start(i):
    return round(INTRO + (i - 1) * BEAT_BLOCK, 2)


def build_manifest():
    return {
        "episode_title": "",
        "date": "",
        "mode": "post-close",
        "market": "NSE / BSE, India",
        "timezone": "Asia/Kolkata",
        "aspect_ratio": "9:16",
        "width": WIDTH,
        "height": HEIGHT,
        "fps": FPS,
        "duration_seconds": 60,
        "intro_seconds": INTRO,
        "beat_block_seconds": BEAT_BLOCK * BEAT_COUNT,
        "outro_seconds": OUTRO,
        "voice": "male English, one voice per episode",
        "transition_sfx": False,
        "disclaimer": DISCLAIMER,
        "beats": [
            {
                "id": beat_id(i),
                "order": i,
                "role": role,
                "headline": label,
                "instrument": "",
                "name": "",
                "symbol": "",
                "exchange": "",
                "value": "",
                "change_abs": "",
                "change_pct": "",
                "as_of": "",
                "session": "close",
                "source_name": "",
                "source_url": "",
                "screenshot_path": "",
                "catalyst": "",
                "verified_summary": "",
                "why_it_matters": "",
                "confidence_notes": "",
            }
            for i, (role, label, _) in enumerate(BEATS, start=1)
        ],
    }


def build_scene_plan():
    return {
        "fps": FPS,
        "duration": 60,
        "masthead": {
            "text": SHOW_NAME,
            "session_label": "CLOSE",
        },
        "ren": {
            "x": 600,
            "bottom_y": 1800,
            "width": 480,
            "height": 504,
            "anchor": "bottom-centre",
        },
        "desk": {
            "asset": "assets/props/news-desk/red-news-desk.svg",
            "width_pct": 50,
            "rim_from_ren_px": 110,
            "x_px": None,
            "y_px": None,
            "allow_bleed": True,
            "layer": "front-of-ren",
            "opacity": 1.0,
        },
        "intro": {
            "start": 0,
            "end": INTRO,
            "visual": "Masthead reveal and the greeting line — Market with Ren, and these are today's stories — all inside 4s",
            "speech": INTRO_LINE,
        },
        "beats": [
            {
                "beat_id": beat_id(i),
                "order": i,
                "role": role,
                "start": beat_start(i),
                "end": round(beat_start(i) + BEAT_BLOCK, 2),
                "headline": label,
                "headline_number": "",
                "chart": "none",
                "chart_period": "",
                "screenshot_path": "",
                "catalyst": "",
                "ren": {
                    "emotion": emotion,
                    "pose": pose,
                    "view": "front",
                    "facing": "left",
                },
                "transition_in": "fold reveal",
                "transition_out": "card collapse",
                "caption": "",
            }
            for i, (role, label, (emotion, pose)) in enumerate(BEATS, start=1)
        ],
        "outro": {
            "start": 60 - OUTRO,
            "end": 60,
            "visual": "Closing card, Ren sign-off behind the news desk",
        },
    }


def build_script():
    parts = [
        "# Voiceover Script\n",
        "## Intro (0-4s)\n"
        "[Say exactly: \"This is Market with Ren — and these are today's stories.\" "
        "Then straight into beat 1. No music sting, no sound effect.]\n",
    ]
    for i, (role, label, _) in enumerate(BEATS, start=1):
        parts.append(f"## Beat {i} — {label}\n[{_script_hint(role)}]\n")
    parts.append(
        "## Outro\n[Short sign-off. No spoken disclaimer — it goes in the description and pinned comment.]\n"
    )
    return "\n".join(parts)


def _script_hint(role):
    return {
        "close_snapshot": "Nifty and Sensex levels, points and percent, plus the day's character.",
        "driver": "The single biggest reason the market moved, in one clause.",
        "top_gainer": "Stock, percent move, catalyst.",
        "second_gainer": "Second stock or the midcap/smallcap theme, percent, catalyst.",
        "top_loser": "Stock, percent move, catalyst.",
        "sector_scorecard": "The sector that led and the sector that dragged.",
        "flows": "FII and DII net figures in crore rupees.",
        "macro": "The two macro moves that mattered: rupee, crude, gold or VIX.",
        "global_cues": "Overnight US and Asian moves, and what they mean for tomorrow.",
        "what_to_watch": "Earnings, data and events scheduled for the next session.",
    }.get(role, "One number, one name, one reason.")


LEDGER_HEADER = (
    "order,beat_id,role,instrument,name,symbol,exchange,value,change_abs,change_pct,"
    "as_of,session,source_name,source_url,screenshot_path,catalyst,confidence_notes\n"
)


def build_ledger():
    rows = []
    for i, (role, _, _) in enumerate(BEATS, start=1):
        rows.append(
            f"{i},{beat_id(i)},{role},,,,,,,,,close,,,,,\n"
        )
    return LEDGER_HEADER + "".join(rows)


def write(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("episode_slug", help="folder name for the episode")
    parser.add_argument("--output", default=".", help="parent directory for the episode")
    args = parser.parse_args()

    base = Path(args.output).resolve() / args.episode_slug
    if base.exists():
        raise SystemExit(f"Episode directory already exists: {base}")

    for sub in ("research", "editorial", "renders", "assets"):
        (base / sub).mkdir(parents=True)

    write(base / "README.md", README)
    write(base / "delivery-notes.md", DELIVERY)
    write(base / "research" / "market_manifest.json", json.dumps(build_manifest(), indent=2) + "\n")
    write(base / "research" / "price-ledger.csv", build_ledger())
    write(base / "editorial" / "scene-plan.json", json.dumps(build_scene_plan(), indent=2) + "\n")
    write(base / "editorial" / "voiceover-script.md", build_script())

    print(f"Created episode workspace at: {base}")
    print(
        f"Scaffolded {BEAT_COUNT} market beats over 60s at {WIDTH}x{HEIGHT} / {FPS} fps. "
        "Fill the manifest and price ledger, then validate."
    )


if __name__ == "__main__":
    main()
