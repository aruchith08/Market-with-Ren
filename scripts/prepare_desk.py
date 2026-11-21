#!/usr/bin/env python3
"""Prepare the bundled news-desk prop for a render.

The desk ships as a self-contained SVG (the PNG is embedded as base64) because
the skill only stores text files. This script pulls the image back out, so a
raster pipeline (FFmpeg, Pillow, a canvas renderer) can use it directly, and it
prints the exact placement box for a given canvas.

The desk is placed from **Ren's body**, not from the canvas: the centre comes
from his box and the rim sits a fixed number of pixels above his bottom edge, so
the desk lands at his waist whatever scale the anchor is drawn at. The box is
then clamped so it never reaches the caption column.

Usage:
    python scripts/prepare_desk.py --out desk.png
    python scripts/prepare_desk.py --guide guide.png
    python scripts/prepare_desk.py --canvas 1080x1920 --width-pct 50
    python scripts/prepare_desk.py --ren-bottom 1800 --rim-from-ren 110

Defaults match the skill's spec: Ren at x=600, bottom_y=1800, 480x504; desk 50%
of canvas width, rim 110px above Ren's bottom edge.
"""

import argparse
import base64
import re
from pathlib import Path

ASSET = Path(__file__).resolve().parent.parent / "assets/props/news-desk/red-news-desk.svg"
DESK_ASPECT = 1852 / 530  # width / height of the trimmed origami desk

DEFAULT_WIDTH_PCT = 50.0
DEFAULT_REN_X = 600
DEFAULT_REN_BOTTOM = 1800
DEFAULT_REN_WIDTH = 480
DEFAULT_REN_HEIGHT = 504
DEFAULT_RIM_FROM_REN = 110
MIN_LEFT_PCT = 50.0           # never let the desk reach into the caption column
MAX_BLEED = 140               # the desk may run off the right edge, but not endlessly
PARCHMENT = (232, 224, 208)


def load_png_bytes(asset=ASSET):
    if not asset.exists():
        raise SystemExit(f"Desk asset not found: {asset}")
    text = asset.read_text(encoding="utf-8")
    match = re.search(r"base64,([A-Za-z0-9+/=]+)", text)
    if not match:
        raise SystemExit(f"No embedded image found in {asset}")
    return base64.b64decode(match.group(1))


def geometry(canvas_w, canvas_h, width_pct, ren_x, ren_bottom, ren_width,
             rim_from_ren, height_override=None):
    """Desk box, derived from Ren's body then clamped at the caption column."""
    width = round(canvas_w * width_pct / 100)
    height = height_override or round(width / DESK_ASPECT)
    centre = round(ren_x + ren_width / 2)
    x = centre - width // 2
    x = max(x, round(canvas_w * MIN_LEFT_PCT / 100))
    y = round(ren_bottom - rim_from_ren)
    return {"x": x, "y": y, "width": width, "height": height, "centre": centre}


def write_guide(path, canvas_w, canvas_h, box, ren_x, ren_bottom, ren_width, ren_height):
    """Canvas with both axes drawn, so x and y can be checked at a glance."""
    try:
        import io

        from PIL import Image, ImageDraw
    except ImportError:
        raise SystemExit("--guide needs Pillow: pip install pillow")

    desk = Image.open(io.BytesIO(load_png_bytes())).convert("RGBA")
    desk = desk.resize((box["width"], box["height"]), Image.LANCZOS)

    canvas = Image.new("RGB", (canvas_w, canvas_h), PARCHMENT)
    d = ImageDraw.Draw(canvas)

    # grid every 100px, heavier every 500
    for x in range(0, canvas_w, 100):
        heavy = x % 500 == 0
        d.line([x, 0, x, canvas_h], fill=(210, 202, 188) if not heavy else (196, 187, 172), width=1)
        if heavy:
            d.text((x + 4, 4), str(x), fill=(120, 112, 100))
            d.text((x + 4, canvas_h - 14), str(x), fill=(120, 112, 100))
    for y in range(0, canvas_h, 100):
        heavy = y % 500 == 0
        d.line([0, y, canvas_w, y], fill=(210, 202, 188) if not heavy else (196, 187, 172), width=1)
        if heavy:
            d.text((4, y + 2), str(y), fill=(120, 112, 100))
            d.text((canvas_w - 40, y + 2), str(y), fill=(120, 112, 100))

    canvas.paste(desk, (box["x"], box["y"]), desk)

    top = ren_bottom - ren_height
    d.rectangle([ren_x, top, ren_x + ren_width, ren_bottom], outline=(180, 40, 40), width=3)
    d.text((ren_x + 8, top + 8),
           f"REN  x={ren_x} y={top}  {ren_width}x{ren_height}  bottom_y={ren_bottom}",
           fill=(180, 40, 40))
    centre = ren_x + ren_width // 2
    d.line([centre, top, centre, canvas_h], fill=(180, 40, 40), width=1)
    d.text((centre + 6, top - 16), f"centre_x={centre}", fill=(180, 40, 40))
    d.line([ren_x, ren_bottom, ren_x + ren_width, ren_bottom], fill=(180, 40, 40), width=3)

    d.rectangle([box["x"], box["y"], box["x"] + box["width"], box["y"] + box["height"]],
                outline=(20, 90, 160), width=3)
    d.text((box["x"] + 8, box["y"] - 18),
           f"DESK  x={box['x']} y={box['y']}  {box['width']}x{box['height']}",
           fill=(20, 90, 160))
    d.line([0, box["y"], canvas_w, box["y"]], fill=(20, 90, 160), width=1)
    d.text((8, box["y"] - 16), f"rim y={box['y']}", fill=(20, 90, 160))

    canvas.save(path)
    print(f"wrote guide {path} — Ren in red, desk in blue, 100px grid on both axes")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--canvas", default="1080x1920", help="canvas size, e.g. 1080x1920")
    parser.add_argument("--width-pct", type=float, default=DEFAULT_WIDTH_PCT,
                        help="desk width as a percentage of canvas width (default 50)")
    parser.add_argument("--ren-x", type=int, default=DEFAULT_REN_X,
                        help="left edge of Ren's box (default 600)")
    parser.add_argument("--ren-bottom", type=int, default=DEFAULT_REN_BOTTOM,
                        help="bottom edge of Ren's box (default 1800)")
    parser.add_argument("--ren-width", type=int, default=DEFAULT_REN_WIDTH,
                        help="width of Ren's box (default 480)")
    parser.add_argument("--ren-height", type=int, default=DEFAULT_REN_HEIGHT,
                        help="height of Ren's box (default 504)")
    parser.add_argument("--rim-from-ren", type=float, default=DEFAULT_RIM_FROM_REN,
                        help="desk rim, in pixels above Ren's bottom edge (default 110)")
    parser.add_argument("--x-px", type=float, default=None,
                        help="force the desk's left edge in pixels (overrides Ren-derived x)")
    parser.add_argument("--y-px", type=float, default=None,
                        help="force the desk's rim in pixels (overrides Ren-derived y)")
    parser.add_argument("--out", help="write the PNG here")
    parser.add_argument("--guide", help="write a placement guide PNG here (needs Pillow)")
    args = parser.parse_args()

    try:
        canvas_w, canvas_h = (int(v) for v in args.canvas.lower().split("x"))
    except ValueError:
        raise SystemExit("--canvas must look like 1080x1920")

    box = geometry(canvas_w, canvas_h, args.width_pct, args.ren_x, args.ren_bottom,
                   args.ren_width, args.rim_from_ren)
    derived_x, derived_y = box["x"], box["y"]
    if args.x_px is not None:
        box["x"] = round(args.x_px)
    if args.y_px is not None:
        box["y"] = round(args.y_px)

    print(
        f"desk box: x={box['x']} y={box['y']} "
        f"width={box['width']} height={box['height']}"
    )
    if args.x_px is not None or args.y_px is not None:
        print(
            f"overrides applied — derived was x={derived_x} y={derived_y} "
            f"(drift {box['x'] - derived_x:+d}px on x, {box['y'] - derived_y:+d}px on y)"
        )
    print(
        f"placed from Ren: centre {box['centre']}px, rim {args.rim_from_ren:g}px above "
        f"his bottom edge ({args.ren_bottom})"
    )

    bleed = box["x"] + box["width"] - canvas_w
    print(f"bleeds {bleed}px past the right edge" if bleed > 0 else
          f"fully inside the frame, {-bleed}px clear of the right edge")
    print(f"clearance below: {canvas_h - (box['y'] + box['height'])}px")

    if bleed > MAX_BLEED:
        print(f"warning: {bleed}px of bleed is too much; keep it under {MAX_BLEED}px")
    if box["x"] <= canvas_w * MIN_LEFT_PCT / 100:
        print("warning: the desk reaches the middle of the frame and will crowd the caption column")

    if args.guide:
        write_guide(args.guide, canvas_w, canvas_h, box, args.ren_x, args.ren_bottom,
                    args.ren_width, args.ren_height)

    data = load_png_bytes()
    if args.out:
        out = Path(args.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(data)
        print(f"wrote {out} ({len(data)} bytes, 800x229)")
    else:
        print(f"embedded PNG: {len(data)} bytes, 800x229")


if __name__ == "__main__":
    main()
