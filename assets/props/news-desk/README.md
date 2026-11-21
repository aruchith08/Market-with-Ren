# News Desk Prop

The folded-paper anchor desk Ren stands behind.

## Files

- `red-news-desk.svg` — self-contained asset; the PNG is embedded as base64. Use it directly in HTML/SVG scenes.
- Raster pipelines (FFmpeg, Pillow, canvas) should extract the PNG with `python scripts/prepare_desk.py --out desk.png` rather than redrawing the desk.

## Geometry

- Trimmed aspect ratio: **800 x 229** (3.49:1). There is no padding; the alpha bounds are tight.
- Placed from Ren's box, which is x=600, bottom_y=1800, 480x504 on a 1080x1920 canvas.
- Default desk: **540 x 155 px** at **x=570, rim y=1690**
  - width 50% of canvas width
  - centre x=840 — Ren's centre, taken from his box
  - rim 110px above his `bottom_y`
  - bleeds 30px past the right edge — it does not have to be fully visible

## Why it is placed from Ren's body

A desk positioned as a percentage of the canvas only lands correctly at one anchor scale. Draw Ren 5% larger, or move him 40px down, and a canvas-relative rim sits on his chest or floats below his waist — which is exactly what happened before. Anchoring the rim to `bottom_y` and the centre to his box means the desk follows the character.

The horizontal centre matters for the same reason: anchored to the right edge, the desk slides sideways whenever its width changes. Anchored to Ren, it stays under him at any width.

## Rules

- The desk sits **in front of Ren**, below him in the layer order, and covers his waist. His hands stay above the rim.
- Keep the rim between 8% and 25% of his height above his bottom edge (40–126px for a 504px-tall Ren).
- Keep the width between 40% and 58% of canvas width, and the bleed under about 140px.
- Never crop it from the bottom — the base line is what makes it read as a desk.
- The desk is scenery, not a data surface. No text, price or ticker goes on it.
- Do not recolour it per episode, and do not let its size change between beats.

Get exact numbers, or a visual guide with both axes gridded and Ren's box drawn:

```bash
python scripts/prepare_desk.py --canvas 1080x1920 --ren-bottom 1800 --rim-from-ren 110
python scripts/prepare_desk.py --x-px 570 --y-px 1690      # pin both axes explicitly
python scripts/prepare_desk.py --guide guide.png           # 100px grid, Ren red, desk blue
```

The scene plan accepts the same pair as `x_px` and `y_px`; they override the derived values, and the validator warns if either drifts more than 12px from Ren's body.
