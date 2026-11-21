#!/usr/bin/env python3
"""Validate an Origami Market Video episode workspace.

Hard failures (exit 1): missing files, unparsable JSON/CSV, missing required
fields, numbers that will not parse, a change and a percent that disagree in
sign, duplicate ids, and impossible timings (a scene ending before it starts).

Warnings (exit 0 unless --strict): runtime drift, overlapping or gapped scenes,
scene/beat cross-reference mismatches, unknown Ren preset names, missing beat
roles, missing disclaimer, advice language in the script, news-desk geometry
outside its fixed band, and empty data fields while the episode is still being
filled in.
"""

import argparse
import csv
import json
import re
from pathlib import Path

REQUIRED_FILES = [
    "research/market_manifest.json",
    "research/price-ledger.csv",
    "editorial/scene-plan.json",
    "editorial/voiceover-script.md",
]

BEAT_FIELDS = [
    "id", "order", "role", "headline", "instrument", "name", "symbol", "exchange",
    "value", "change_abs", "change_pct", "as_of", "session", "source_name", "source_url",
]
DATA_FIELDS = ["instrument", "name", "symbol", "value", "change_abs", "change_pct", "as_of", "source_name", "source_url"]

LEDGER_COLUMNS = [
    "order", "beat_id", "role", "instrument", "name", "symbol", "exchange", "value",
    "change_abs", "change_pct", "as_of", "session", "source_name", "source_url",
]

SESSIONS = {"pre-open", "intraday", "close"}
CHART_TYPES = {"none", "sparkline", "candle", "bars", "heat", "flows"}

# The news desk is fixed furniture, not a per-episode decision. These ranges keep
# it reading as a desk: narrower looks like a bucket, wider invades the caption
# column, and a rim outside the band stops crossing the anchor's waist.
DESK_WIDTH_RANGE = (40.0, 58.0)
DESK_CENTER_RANGE = (74.0, 82.0)
DESK_RIM_RANGE = (86.0, 92.0)
DESK_ASPECT = 1852 / 530  # the trimmed origami desk, width / height
DESK_MAX_BLEED = 140      # the desk may run off the right edge, up to this much

SHOW_NAME = "MARKET WITH REN"
SESSION_LABELS = {"CLOSE", "PRE-MARKET", "WEEKLY"}

# Ren's on-screen box and the desk's position relative to it. The desk is placed
# from Ren's body, not from the canvas, so it lands at his waist whatever the
# anchor's scale — that is the whole point of the ren block.
REN_WIDTH_RANGE = (40.0, 50.0)   # percent of canvas width
DESK_RIM_BAND = (8.0, 25.0)      # percent of Ren's height, above his bottom edge
DESK_CENTRE_TOLERANCE = 6        # px between desk centre and Ren's centre
DESK_AXIS_TOLERANCE = 12         # px an explicit x_px / y_px may stray from the derived box

# Canonical Ren preset names, mirrored from
# assets/ren-character-engine/exports/manifest.json. The engine rejects unknown
# names instead of falling back to a default, so catch typos here first.
REN_EMOTIONS = {
    "neutral", "serious", "focused", "determined", "concerned", "sad", "surprised",
    "alert", "confident", "smiling", "happy", "explaining", "thinking", "skeptical",
    "curious", "relieved", "excited", "disappointed", "angry", "confused",
}
REN_POSES = {"idle", "present", "explain", "point", "point-up", "hand-on-chest", "emphasis", "wave"}
REN_VIEWS = {"front", "three-quarter", "side", "three-quarter-back", "back"}

ADVICE_PATTERNS = [
    r"\bbuy\b", r"\bsell\b", r"\bhold\b", r"target price", r"multibagger",
    r"guaranteed", r"sure[- ]shot", r"will rally", r"must buy", r"\badvice to\b",
]

DURATION_TOLERANCE = 0.5
TIME_PATTERN = re.compile(r"\d{1,2}:\d{2}")
BRIEF_LIMIT = 6


def _brief(items):
    """Shorten long id lists so one warning line stays readable."""
    items = [str(i) for i in items]
    if len(items) <= BRIEF_LIMIT:
        return ", ".join(items)
    return ", ".join(items[:BRIEF_LIMIT]) + f" (+{len(items) - BRIEF_LIMIT} more)"


def _number(value):
    """Parse a market figure from int, float or a formatted string. None if absent."""
    if value is None:
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if not text:
        return None
    cleaned = text.replace(",", "").replace("%", "").replace("₹", "").replace("+", "")
    cleaned = cleaned.replace("\u2212", "-").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def _is_blank(value):
    return value is None or (isinstance(value, str) and not value.strip())


class Report:
    def __init__(self, strict=False):
        self.strict = strict
        self.failures = 0
        self.warnings = 0

    def ok(self, msg):
        print(f"OK: {msg}")

    def fail(self, msg):
        print(f"FAIL: {msg}")
        self.failures += 1

    def warn(self, msg):
        print(f"WARN: {msg}")
        self.warnings += 1


def load_json(report, path, label):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        report.fail(f"Could not parse {label}: {exc}")
        return None


def check_manifest(report, manifest):
    beats = manifest.get("beats", [])
    if not beats:
        report.fail("market_manifest.json has no beats")
        return {}
    report.ok(f"Manifest has {len(beats)} beat entries")

    ids = {}
    empty = {field: [] for field in DATA_FIELDS}
    roles = []

    for i, beat in enumerate(beats, start=1):
        label = beat.get("id") or f"beat {i}"
        for field in BEAT_FIELDS:
            if field not in beat:
                report.fail(f"{label} missing field: {field}")

        bid = beat.get("id")
        if bid:
            if bid in ids:
                report.fail(f"Duplicate beat id: {bid}")
            ids[bid] = beat

        for field in DATA_FIELDS:
            if _is_blank(beat.get(field)):
                empty[field].append(label)

        role = beat.get("role")
        if role:
            roles.append(role)

        session = beat.get("session")
        if session and session not in SESSIONS:
            report.warn(f"{label} has session '{session}'; expected one of {sorted(SESSIONS)}")

        as_of = beat.get("as_of")
        if not _is_blank(as_of) and not TIME_PATTERN.search(str(as_of)):
            report.warn(f"{label} as_of '{as_of}' has no HH:MM time")

        value = _number(beat.get("value"))
        change = _number(beat.get("change_abs"))
        pct = _number(beat.get("change_pct"))

        for field, raw, parsed in (
            ("value", beat.get("value"), value),
            ("change_abs", beat.get("change_abs"), change),
            ("change_pct", beat.get("change_pct"), pct),
        ):
            if not _is_blank(raw) and parsed is None:
                report.fail(f"{label} {field} '{raw}' is not a number")

        if change is not None and pct is not None and change != 0 and pct != 0:
            if (change > 0) != (pct > 0):
                report.fail(
                    f"{label} change_abs ({change:g}) and change_pct ({pct:g}) disagree in sign"
                )

    for field, labels in empty.items():
        if labels:
            report.warn(f"{len(labels)} beat(s) still have no {field}: {_brief(labels)}")

    mode = str(manifest.get("mode", "post-close")).strip().lower()
    required_roles = {"global_cues", "what_to_watch"} if mode == "pre-market" else {"close_snapshot", "what_to_watch"}
    missing_roles = sorted(required_roles - set(roles))
    if missing_roles:
        report.warn(f"No beat covers required role(s) for mode '{mode}': {', '.join(missing_roles)}")

    duplicates = sorted({r for r in roles if roles.count(r) > 1})
    if duplicates:
        report.warn(f"Role(s) used more than once: {', '.join(duplicates)}")

    if _is_blank(manifest.get("disclaimer")):
        report.warn("market_manifest.json has no disclaimer text")

    duration = manifest.get("duration_seconds")
    if duration is not None and duration != 60:
        report.warn(f"duration_seconds is {duration}; the skill's default is 60")

    if len(beats) != 10:
        report.warn(f"{len(beats)} beats selected; the skill's default lineup is 10")

    return ids


def check_ledger(report, base, manifest_ids):
    path = base / "research/price-ledger.csv"
    try:
        with path.open("r", encoding="utf-8") as fh:
            reader = csv.DictReader(fh)
            rows = list(reader)
            fieldnames = reader.fieldnames or []
    except Exception as exc:
        report.fail(f"Could not parse price-ledger.csv: {exc}")
        return

    missing = [c for c in LEDGER_COLUMNS if c not in fieldnames]
    if missing:
        report.fail(f"price-ledger.csv missing column(s): {', '.join(missing)}")

    rows = [r for r in rows if any((v or "").strip() for v in r.values() if isinstance(v, str))]
    if not rows:
        report.warn("price-ledger.csv has no data rows")
        return
    report.ok(f"Ledger has {len(rows)} row(s)")

    unknown = []
    bad_numbers = []
    sign_clashes = []

    for i, row in enumerate(rows, start=1):
        beat_id = (row.get("beat_id") or "").strip()
        if beat_id and manifest_ids and beat_id not in manifest_ids:
            unknown.append(beat_id)

        for field in ("value", "change_abs", "change_pct"):
            raw = row.get(field)
            if not _is_blank(raw) and _number(raw) is None:
                bad_numbers.append(f"row {i} {field}")

        change = _number(row.get("change_abs"))
        pct = _number(row.get("change_pct"))
        if change is not None and pct is not None and change != 0 and pct != 0:
            if (change > 0) != (pct > 0):
                sign_clashes.append(f"row {i}")

    if unknown:
        report.warn(f"Ledger row(s) for unknown beat ids: {_brief(sorted(set(unknown)))}")
    if bad_numbers:
        report.warn(f"Ledger value(s) that are not numbers: {_brief(bad_numbers)}")
    if sign_clashes:
        report.fail(f"Ledger row(s) where change and percent disagree in sign: {_brief(sign_clashes)}")

    if manifest_ids and len(rows) < len(manifest_ids):
        report.warn(
            f"Ledger has {len(rows)} row(s) for {len(manifest_ids)} beats — "
            "every on-screen number needs a ledger row"
        )


def check_masthead(report, scene, manifest):
    """The show name is fixed furniture; catch the old brand creeping back."""
    masthead = scene.get("masthead")
    if not isinstance(masthead, dict):
        report.warn(
            f"scene-plan.json has no 'masthead' block; every frame carries '{SHOW_NAME}' "
            "top-left with the dateline top-right"
        )
        return

    text = str(masthead.get("text", "")).strip()
    if not text:
        report.warn(f"masthead.text is empty; it should read '{SHOW_NAME}'")
    elif text.upper() != SHOW_NAME:
        report.warn(f"masthead.text is '{text}'; the show is '{SHOW_NAME}'")

    label = masthead.get("session_label")
    if label and str(label).strip().upper() not in SESSION_LABELS:
        report.warn(
            f"masthead.session_label is '{label}'; use one of {sorted(SESSION_LABELS)}"
        )

    mode = str((manifest or {}).get("mode", "")).strip().lower()
    expected = {"pre-market": "PRE-MARKET", "weekly-wrap": "WEEKLY", "weekly": "WEEKLY"}.get(mode)
    if expected and label and str(label).strip().upper() != expected:
        report.warn(f"masthead.session_label is '{label}' but the manifest mode is '{mode}'")


def _canvas(manifest):
    canvas_w = (manifest or {}).get("width") or 1080
    canvas_h = (manifest or {}).get("height") or 1920
    try:
        return int(canvas_w), int(canvas_h)
    except (TypeError, ValueError):
        return 1080, 1920


def check_ren(report, scene, manifest):
    """Pin the anchor's box so the desk has something fixed to sit against."""
    ren = scene.get("ren")
    if not isinstance(ren, dict):
        report.warn(
            "scene-plan.json has no 'ren' block; give Ren an explicit box "
            "(x, bottom_y, width, height) so the desk can be placed from his body"
        )
        return None

    canvas_w, canvas_h = _canvas(manifest)
    x = _number(ren.get("x"))
    bottom = _number(ren.get("bottom_y"))
    width = _number(ren.get("width"))
    height = _number(ren.get("height"))

    for field, value in (("x", x), ("bottom_y", bottom), ("width", width), ("height", height)):
        if value is None:
            report.warn(f"ren.{field} is missing or not a number")
    if x is None or bottom is None or width is None or height is None:
        return None

    if ren.get("anchor") and ren["anchor"] != "bottom-centre":
        report.warn(f"ren.anchor is '{ren['anchor']}'; use 'bottom-centre'")

    top = bottom - height
    if top < 0:
        report.warn(f"Ren's box starts above the canvas (top={top:g})")
    if bottom > canvas_h:
        report.warn(f"Ren's box runs past the bottom of the canvas (bottom_y={bottom:g})")
    if x + width > canvas_w:
        report.warn(f"Ren's box runs past the right edge (x+width={x + width:g})")
    if x < canvas_w * 0.5:
        report.warn("Ren's box reaches the middle of the frame and will crowd the caption column")

    width_pct = width / canvas_w * 100
    if not (REN_WIDTH_RANGE[0] <= width_pct <= REN_WIDTH_RANGE[1]):
        report.warn(
            f"Ren is {width_pct:.1f}% of canvas width; keep him between "
            f"{REN_WIDTH_RANGE[0]:g}% and {REN_WIDTH_RANGE[1]:g}%"
        )

    aspect = width / height if height else 0
    if abs(aspect - 1000 / 1050) > 0.06:
        report.warn(
            f"Ren's box aspect is {aspect:.2f}; the engine renders at 1000x1050 (0.95), "
            "so a different ratio stretches him"
        )
    return {"x": x, "bottom": bottom, "width": width, "height": height}


def check_desk(report, scene, manifest, ren):
    """The desk is fixed furniture, placed from Ren's body rather than the canvas.

    It does not have to be fully visible — running off the right edge is fine —
    but its centre must stay on the anchor and its rim must cross his waist.
    """
    desk = scene.get("desk")
    if not isinstance(desk, dict):
        report.warn(
            "scene-plan.json has no 'desk' block — the red news desk is part of the frame design"
        )
        return

    if _is_blank(desk.get("asset")):
        report.warn("desk.asset is empty; point it at assets/props/news-desk/red-news-desk.svg")

    canvas_w, canvas_h = _canvas(manifest)

    if "rim_y_pct" in desk and "rim_from_ren_px" not in desk:
        report.warn(
            "desk uses rim_y_pct; switch to rim_from_ren_px so the rim tracks Ren's body "
            "instead of the canvas edge"
        )

    width_pct = _number(desk.get("width_pct"))
    if width_pct is None:
        report.warn("desk.width_pct is missing; the default is 50")
        width_pct = 50.0
    elif not (DESK_WIDTH_RANGE[0] <= width_pct <= DESK_WIDTH_RANGE[1]):
        report.warn(
            f"desk.width_pct is {width_pct:g}%; keep it between "
            f"{DESK_WIDTH_RANGE[0]:g} and {DESK_WIDTH_RANGE[1]:g} of canvas width"
        )

    layer = desk.get("layer")
    if layer and layer != "front-of-ren":
        report.warn(f"desk.layer is '{layer}'; the desk must sit in front of Ren")

    opacity = _number(desk.get("opacity"))
    if opacity is not None and not (0.9 <= opacity <= 1.0):
        report.warn(f"desk.opacity is {opacity:g}; a faded desk reads as a printing error")

    if ren is None:
        return

    w = round(canvas_w * width_pct / 100)
    h = round(w / DESK_ASPECT)
    centre = round(ren["x"] + ren["width"] / 2)
    x = centre - w // 2

    offset = _number(desk.get("rim_from_ren_px"))
    if offset is None:
        report.warn("desk.rim_from_ren_px is missing; the default is 110")
        offset = 110.0
    rim = round(ren["bottom"] - offset)

    # Explicit overrides win, but only if they still agree with Ren's body on
    # both axes — a hard-coded pair that drifts off the anchor is the bug this
    # whole block exists to prevent.
    x_px = _number(desk.get("x_px"))
    y_px = _number(desk.get("y_px"))
    if x_px is not None:
        if abs(x_px - x) > DESK_AXIS_TOLERANCE:
            report.warn(
                f"desk.x_px is {x_px:g}, {abs(x_px - x):.0f}px from the centre-aligned x "
                f"({x}); it will sit off Ren's centre"
            )
        x = round(x_px)
    if y_px is not None:
        if abs(y_px - rim) > DESK_AXIS_TOLERANCE:
            report.warn(
                f"desk.y_px is {y_px:g}, {abs(y_px - rim):.0f}px from the rim derived from "
                f"Ren's body ({rim}); it will sit off his waist"
            )
        rim = round(y_px)

    band_low = ren["height"] * DESK_RIM_BAND[0] / 100
    band_high = ren["height"] * DESK_RIM_BAND[1] / 100
    if not (band_low <= offset <= band_high):
        report.warn(
            f"desk rim sits {offset:g}px above Ren's bottom edge; keep it between "
            f"{band_low:.0f} and {band_high:.0f}px so it crosses his waist"
        )

    actual_centre = x + w // 2
    report.ok(
        f"desk box x={x} y={rim} {w}x{h} — centre {actual_centre} "
        f"(Ren's centre {centre}), {ren['bottom'] - rim:g}px above his bottom edge"
    )

    bleed = x + w - canvas_w
    if bleed > DESK_MAX_BLEED:
        report.warn(f"desk bleeds {bleed}px past the right edge; keep it under {DESK_MAX_BLEED}px")
    if x <= canvas_w * 0.5:
        report.warn("desk reaches the middle of the frame and will crowd the caption column")
    if rim + h > canvas_h:
        report.warn("desk runs past the bottom of the canvas")


def check_scene_plan(report, base, manifest_ids, manifest):
    path = base / "editorial/scene-plan.json"
    scene = load_json(report, path, "scene-plan.json")
    if scene is None:
        return

    if "beats" not in scene:
        report.fail("scene-plan.json missing 'beats'")
        return

    check_masthead(report, scene, manifest)
    ren = check_ren(report, scene, manifest)
    check_desk(report, scene, manifest, ren)

    blocks = []
    intro = scene.get("intro")
    if isinstance(intro, dict) and "start" in intro and "end" in intro:
        blocks.append(("intro", intro["start"], intro["end"]))

    scenes = scene.get("beats") or []
    report.ok(f"Scene plan has {len(scenes)} beat scene(s)")

    no_headline, no_shot, no_caption = [], [], []
    bad_ids, no_order, bad_chart = [], [], []
    seen = set()

    for i, item in enumerate(scenes, start=1):
        label = item.get("beat_id") or f"scene {i}"
        start, end = item.get("start"), item.get("end")
        if start is None or end is None:
            report.fail(f"{label} is missing start or end time")
        else:
            if end <= start:
                report.fail(f"{label} ends at {end}s, at or before its start {start}s")
            blocks.append((label, start, end))

        if not item.get("headline"):
            no_headline.append(label)
        if _is_blank(item.get("screenshot_path")):
            no_shot.append(label)
        if _is_blank(item.get("caption")):
            no_caption.append(label)

        chart = item.get("chart")
        if chart and chart not in CHART_TYPES:
            bad_chart.append(f"{label}:{chart}")

        ren = item.get("ren") or {}
        if ren:
            emotion = ren.get("emotion")
            pose = ren.get("pose")
            view = ren.get("view")
            if emotion and emotion not in REN_EMOTIONS:
                report.warn(f"{label} uses unknown Ren emotion '{emotion}'")
            if pose and pose not in REN_POSES:
                report.warn(f"{label} uses unknown Ren pose '{pose}'")
            if view and view not in REN_VIEWS:
                report.warn(f"{label} uses unknown Ren view '{view}'")

        bid = item.get("beat_id")
        if bid:
            if bid in seen:
                report.fail(f"Duplicate scene beat_id: {bid}")
            seen.add(bid)
            if manifest_ids and bid not in manifest_ids:
                bad_ids.append(bid)
        if bid and "order" not in item:
            no_order.append(bid)

    if no_headline:
        report.warn(f"{len(no_headline)} scene(s) still have no headline: {_brief(no_headline)}")
    if no_shot:
        report.warn(f"{len(no_shot)} scene(s) still have no screenshot_path: {_brief(no_shot)}")
    if no_caption:
        report.warn(f"{len(no_caption)} scene(s) still have no caption: {_brief(no_caption)}")
    if bad_chart:
        report.warn(f"Unknown chart type(s): {_brief(bad_chart)}")
    if bad_ids:
        report.warn(f"Scene(s) not present in market_manifest.json: {_brief(bad_ids)}")
    if no_order:
        report.warn(f"Scene(s) missing 'order' for on-screen numbering: {_brief(no_order)}")

    outro = scene.get("outro")
    if isinstance(outro, dict) and "start" in outro and "end" in outro:
        blocks.append(("outro", outro["start"], outro["end"]))

    if not blocks:
        report.fail("scene-plan.json has no usable timed blocks")
        return

    blocks.sort(key=lambda b: b[1])
    for (prev_label, _, prev_end), (label, start, _) in zip(blocks, blocks[1:]):
        if start < prev_end - 1e-6:
            report.warn(f"{label} starts at {start}s, before {prev_label} ends at {prev_end}s")
        elif start > prev_end + 1e-6:
            report.warn(f"{label} starts at {start}s, leaving a gap after {prev_end}s")

    span = blocks[-1][2] - blocks[0][1]
    target = (manifest or {}).get("duration_seconds") or 60
    if abs(span - target) > DURATION_TOLERANCE:
        report.warn(f"Scenes cover {span:g}s; the target runtime is {target:g}s")
    else:
        report.ok(f"Scenes cover {span:g}s, matching the {target:g}s target")


def check_script(report, base):
    path = base / "editorial/voiceover-script.md"
    try:
        text = path.read_text(encoding="utf-8")
    except Exception as exc:
        report.fail(f"Could not read voiceover-script.md: {exc}")
        return

    # The disclaimer lives in the publishing copy (description and pinned
    # comment), not in the video, so the script is only scanned for advice.
    lowered = text.lower()
    hits = []
    for pattern in ADVICE_PATTERNS:
        match = re.search(pattern, lowered)
        if match:
            hits.append(match.group(0))
    if hits:
        report.warn(f"Possible advice language in the script: {_brief(sorted(set(hits)))}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("episode_dir")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="treat warnings as failures (use before a final export)",
    )
    args = parser.parse_args()

    base = Path(args.episode_dir).resolve()
    if not base.exists():
        raise SystemExit(f"Episode directory not found: {base}")

    report = Report(strict=args.strict)

    present = True
    for rel in REQUIRED_FILES:
        if not (base / rel).exists():
            report.fail(f"Missing required file: {rel}")
            present = False
        else:
            report.ok(f"Found {rel}")

    manifest = None
    manifest_ids = {}
    manifest_path = base / "research/market_manifest.json"
    if manifest_path.exists():
        manifest = load_json(report, manifest_path, "market_manifest.json")
        if manifest is not None:
            manifest_ids = check_manifest(report, manifest)

    if present and (base / "research/price-ledger.csv").exists():
        check_ledger(report, base, manifest_ids)

    if present and (base / "editorial/scene-plan.json").exists():
        check_scene_plan(report, base, manifest_ids, manifest)

    if present and (base / "editorial/voiceover-script.md").exists():
        check_script(report, base)

    print()
    if report.failures or (report.strict and report.warnings):
        print(
            f"Episode workspace has {report.failures} failure(s) "
            f"and {report.warnings} warning(s)."
        )
        raise SystemExit(1)

    print(
        f"Episode workspace looks structurally valid "
        f"({report.warnings} warning(s))."
    )
    raise SystemExit(0)


if __name__ == "__main__":
    main()
