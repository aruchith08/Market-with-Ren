#!/usr/bin/env python3
"""Build Ren speech (mouth) cues from measured narration line timings.

The Ren engine does not read audio: it plays back `{start, end, mouth}` cues
whose times are SECONDS RELATIVE TO THE SCENE. This script turns a line of
narration plus its measured start/end into such a cue list, so the mouth
follows the words instead of a metronome.

Input JSON:
{
  "fps": 30,
  "scenes": [
    {"id": "beat-01", "start": 3.0, "end": 8.2,
     "text": "Nifty ended 312 points higher at 24,812."}
  ]
}

Output JSON (scene-local times, ready to drop into the scene's "speech"):
{"fps": 30, "scenes": [{"id": "beat-01", "start": 3.0, "end": 8.2,
  "duration": 5.2, "spoken": true,
  "speech": [{"start": 0.04, "end": 0.13, "mouth": "small"}, ...]}]}

Usage:
  python build_speech_cues.py lines.json -o cues.json
  python build_speech_cues.py cues.json --check
"""
import argparse
import json
import re
import sys

MIN_CUE = 0.06          # engine interpolates over up to 45 ms; shorter never reads
MAX_CUE = 0.22          # longer than this and one shape holds far too long
LEAD_REST = 0.04        # silence at the top of a line
TAIL_REST = 0.06        # mouth closed before the line ends
PUNCT_GAP = 0.09        # breath at commas and full stops
WORD_GAP = 0.055        # small closure between words, so the mouth is not a buzz
COVERAGE = (0.40, 0.85)  # sane share of a scene the mouth should be moving

SHAPES = {"rest", "MBP", "small", "medium", "AA", "EE", "OH", "OO",
          "FV", "L", "TH", "CH", "smile", "teeth"}

DIGRAPHS = [("th", "TH"), ("ch", "CH"), ("sh", "CH"), ("ph", "FV"),
            ("oo", "OO"), ("ee", "EE"), ("ou", "OH"), ("ow", "OH"),
            ("oa", "OH"), ("ai", "EE"), ("ea", "EE"), ("ie", "EE"),
            ("ay", "EE"), ("qu", "small")]
SINGLE = {"a": "AA", "e": "small", "i": "EE", "o": "OH", "u": "OO", "y": "EE",
          "b": "MBP", "m": "MBP", "p": "MBP", "f": "FV", "v": "FV",
          "l": "L", "r": "L", "j": "CH", "g": "small", "c": "small",
          "k": "small", "s": "small", "z": "small", "x": "small",
          "t": "small", "d": "small", "n": "small", "h": "small",
          "w": "small", "q": "small"}


def word_shapes(word):
    """Map one word to an ordered list of mouth shapes."""
    w = word.lower()
    out, i = [], 0
    while i < len(w):
        for dig, shape in DIGRAPHS:
            if w.startswith(dig, i):
                out.append(shape)
                i += len(dig)
                break
        else:
            if w[i] in SINGLE:
                out.append(SINGLE[w[i]])
            i += 1
    deduped = []
    for s in out:
        if not deduped or deduped[-1] != s:
            deduped.append(s)
    return deduped


def events_for(text):
    """Flatten a line into ('gap', seconds) and ('cue', shape) events."""
    events, first_word = [], True
    for tok in re.findall(r"[A-Za-z']+|\d+|[.,;:!?]", text or ""):
        if tok in ".,;:!?":
            events.append(("gap", PUNCT_GAP))
            continue
        shapes = (["small"] * len(tok)) if tok.isdigit() else word_shapes(tok)
        if not shapes:
            continue
        if not first_word:
            events.append(("gap", WORD_GAP))
        first_word = False
        events.extend(("cue", s) for s in shapes)
    return events


def build_line(text, start, end):
    """Return scene-local cues for one narration line, or [] for silence."""
    events = events_for(text)
    shapes = [p for k, p in events if k == "cue"]
    if not shapes:
        return []

    duration = end - start
    gaps = sum(p for k, p in events if k == "gap")
    budget = duration - LEAD_REST - TAIL_REST - gaps
    if budget < MIN_CUE:
        return []

    keep = min(len(shapes), max(1, int(budget / MIN_CUE)))
    if keep < len(shapes):
        step = len(shapes) / keep
        shapes = [shapes[int(i * step)] for i in range(keep)]
    per = min(budget / len(shapes), MAX_CUE)

    cues, t, idx = [], start + LEAD_REST, 0
    for kind, payload in events:
        if kind == "gap":
            t += payload
            continue
        if idx >= len(shapes):
            break
        cue_end = t + per
        if cue_end > end - TAIL_REST + 1e-9:
            break
        cues.append({"start": round(t - start, 3),
                     "end": round(cue_end - start, 3),
                     "mouth": shapes[idx]})
        t = cue_end
        idx += 1
    return cues


def validate(cues, duration, label, spoken):
    problems, prev_end = [], 0.0
    for i, c in enumerate(cues):
        s, e, m = c.get("start"), c.get("end"), c.get("mouth")
        if m not in SHAPES:
            problems.append(f"{label} cue {i}: unknown mouth shape {m!r}")
        if s is None or e is None:
            problems.append(f"{label} cue {i}: missing start/end")
            continue
        if e <= s:
            problems.append(f"{label} cue {i}: end {e} is not after start {s}")
        elif e - s < MIN_CUE - 1e-9:
            problems.append(f"{label} cue {i}: {round(e - s, 3)}s shorter than {MIN_CUE}s")
        if s < -1e-9 or e > duration + 1e-9:
            problems.append(f"{label} cue {i}: {s}-{e} outside scene 0-{duration}")
        if s < prev_end - 1e-9:
            problems.append(f"{label} cue {i}: overlaps or out of order at {s}")
        prev_end = max(prev_end, e)

    if spoken and not cues:
        problems.append(f"{label}: line is spoken but has no speech cues")
    if cues and duration:
        cov = sum(c["end"] - c["start"] for c in cues) / duration
        if not (COVERAGE[0] <= cov <= COVERAGE[1]):
            problems.append(f"{label}: mouth moves over {cov:.0%} of the scene, "
                            f"expected {COVERAGE[0]:.0%}-{COVERAGE[1]:.0%}")
    return problems


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("-o", "--output")
    ap.add_argument("--check", action="store_true",
                    help="validate an existing cues file instead of building one")
    args = ap.parse_args()

    data = json.load(open(args.input))
    scenes = data.get("scenes", [])
    problems, out = [], []

    if args.check:
        for sc in scenes:
            dur = float(sc.get("duration", float(sc["end"]) - float(sc["start"])))
            problems += validate(sc.get("speech", []), dur,
                                 str(sc.get("id")), bool(sc.get("spoken")))
        for p in problems:
            print("FAIL", p)
        print(f"{len(problems)} problem(s) in {len(scenes)} scene(s)")
        sys.exit(1 if problems else 0)

    for sc in scenes:
        start, end = float(sc["start"]), float(sc["end"])
        if end <= start:
            raise SystemExit(f"scene {sc.get('id')}: end must be after start")
        cues = build_line(sc.get("text", ""), start, end)
        problems += validate(cues, round(end - start, 3), str(sc.get("id")),
                             bool((sc.get("text") or "").strip()))
        out.append({"id": sc.get("id"), "start": start, "end": end,
                    "duration": round(end - start, 3),
                    "spoken": bool((sc.get("text") or "").strip()),
                    "speech": cues})

    for p in problems:
        print("FAIL", p)
    payload = json.dumps({"fps": data.get("fps", 30), "scenes": out}, indent=2)
    if args.output:
        open(args.output, "w").write(payload + "\n")
        total = sum(len(s["speech"]) for s in out)
        print(f"wrote {args.output}: {len(out)} scene(s), {total} cue(s), "
              f"{len(problems)} problem(s)")
    else:
        print(payload)
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
