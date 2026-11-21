# Visual Specification

## Overall look

Everything should look built from folded paper — and the paper should look like it is reporting a market:

- faceted forms
- visible crease logic
- layered paper depth
- warm editorial lighting
- restrained but energetic composition
- numbers treated as the primary graphic, not decoration

## Ren

Ren is waist-up only in the production format.

### Visual identity

- dark brown angular origami hair
- pale faceted face
- sharp eyes
- red folded-paper cape / collar
- dark clothing underlayer
- calm, determined demeanour

### Placement

- default lower-right
- enough inset to avoid mobile UI overlays
- scaled to support rather than dominate the beat
- never over the price card, the chart axis or the headline number

His box on the 1080x1920 canvas — fixed, and the reference for everything else in the corner:

| Property | Value |
| --- | --- |
| x | 600 |
| bottom_y | 1800 |
| width | 480 |
| height | 504 (engine aspect 1000x1050) |
| anchor | bottom-centre, so his centre is x=840 |

The desk, the captions and the safe zones are all measured from this box. Change his scale and the desk has to follow, which is why the scene plan carries the box rather than a percentage.

## Frame structure

Default vertical frame contents:

- masthead: `MARKET WITH REN` top-left with the triangle mark, dateline top-right
- beat number marker
- headline with the one number that must be read first
- price card: name, level, signed change, percent, arrow
- chart panel or screenshot frame
- one-clause catalyst line
- as-of stamp and source credit
- Ren overlay
- news desk, in front of Ren
- captions

## Masthead

The show is **MARKET WITH REN**. The masthead is fixed brand furniture — it appears on every frame, unchanged except for the dateline.

- **Mark:** red folded-paper triangle, about 28x22px at 1080 width, left of the wordmark
- **Wordmark:** `MARKET WITH REN`, bold caps, wide letter-spacing, charcoal, sitting on the same optical baseline as the mark
- **Dateline:** right-aligned on the same baseline — `THU 19 NOV 2026 · CLOSE`, in the smaller dateline size, with the session word in `CLOSE` / `PRE-MARKET` / `WEEKLY`
- **Rule:** one hairline in a warm grey under the whole row, spanning the text column width
- **Clear space:** the row sits inside the top safe zone, with nothing else above it

Never carry data in the masthead, never swap the wordmark for a beat headline, and never abbreviate it to "MWR". A brand that changes between frames stops being a brand.

## Market components

Build these once and reuse them across episodes; consistency is what makes a daily format feel like a product.

### Price card

Name and symbol on top, level large, signed change and percent below, arrow beside the percent. Direction colour on the percent and the arrow only — keep the name and level in charcoal so the card stays readable.

### Ticker ribbon

A folded strip carrying five to eight symbols with their percent moves, used in the intro. Motion: slow horizontal fold-step, not a smooth crawl.

### Candle strip

The last 20–30 sessions as folded-paper candles. One per episode at most. Label the range and the direction colour convention, because a viewer joining mid-scroll has no context.

### Comparison bars

Two to five instruments, bar length proportional to the actual values, with the baseline shown. If the honest bar for a 0.3% move is a sliver, show the sliver — do not scale it up.

### Sector heat strip

Sector tiles tinted by percent move, with the percent printed on each tile. Text carries the meaning; colour reinforces it.

### Flow bars

FII and DII net figures as mirrored paper bars either side of a zero line, in ₹ crore, with the sign visible.

### News desk

The show's fixed furniture: a folded-paper red anchor desk that Ren stands behind. It ships at `assets/props/news-desk/red-news-desk.svg`, trimmed to **800 x 229 px** (about 3.49:1, no padding).

Default placement on the 1080x1920 canvas, with Ren's box at x=600 / bottom_y=1800 / 480x504:

| Property | Value | Note |
| --- | --- | --- |
| width | 540px (50% of canvas width) | usable range 40–58% |
| height | 155px | follows the asset aspect |
| x | 570 | Ren's centre (840) − width/2, clamped at the caption column |
| y (rim) | 1690 | 110px above Ren's bottom edge — the desk top at his mid-torso |
| centre | x=840 | Ren's centre |
| bleed | 30px past the right edge | the desk need not be fully visible |
| layer | in front of Ren, behind captions | his hands stay above the rim |

Rules:

- **Place it from Ren's body, not from the canvas.** The centre comes from his box and the rim is a distance above his `bottom_y`. A canvas percentage (89.2% of height) only works at one anchor scale; the moment Ren is drawn bigger or lower, the desk drifts off his waist — which is exactly what it did before.
- **Both axes can be pinned.** `x_px` and `y_px` override the derived pair when a renderer needs literal numbers; the validator checks each against Ren's body and warns past 12px of drift.
- **The desk may run off the right edge.** Showing the whole table is not the goal — a desk that bleeds off frame reads as furniture, a desk squeezed to fit reads as a sticker. Keep the bleed under about 140px.
- Clamp only at the left, so it never reaches the caption column.
- It is scenery, not a data surface. No text, price, ticker or logo ever goes on it.
- Never recolour it per episode, and never let it change size between beats — the desk is the anchor's furniture, and inconsistency reads as a rendering bug.
- Below 40% width it floats under him and stops reading as furniture. Above 58% too much of it is off-frame and it starts to look like a red wall.
- Never crop it from the bottom; the base line is what makes it read as a desk.
- If Ren's gesture would disappear behind the rim, raise the gesture (`point-up`, `emphasis`) rather than lowering the desk.

Check the pair in your own renderer with `python scripts/prepare_desk.py --guide guide.png` — Ren's box drawn in red, the desk in blue.

## Colour

- parchment / off-white backgrounds
- charcoal and warm black text areas
- deep red paper accents for brand and structure
- **direction:** muted paper green for gains, muted paper red for losses
- muted tan / brown support tones

Rules:

- Direction colour never carries meaning alone — always pair with an arrow and a sign.
- Give brand red and "down" red different tints; using the same red for a headline card and a falling stock reads as an error.
- Test the palette in grayscale. If a gain and a loss look identical in grey, the design is not finished.

## Typography

Bold, highly legible, clear hierarchy, and **tabular figures** so digits do not shift width between frames:

- headline number — largest element on the beat
- instrument name and symbol
- signed change and percent
- catalyst line
- source credit and as-of stamp

Keep decimal places consistent within a beat: 24,812.35 next to 24,540.10, not next to 24,540.

## Chart honesty

- Plot from ledger values only.
- Label the axis, state the period, and show the zero or baseline where the chart type implies one.
- Do not truncate an axis to dramatise a small move without labelling the truncation.
- Never redraw a chart by eye from a screenshot; use the numbers.

## Motion language

Prefer:

- folds
- reveals
- card slides
- staggered panel rises
- paper ribbon expansion
- bar growth from the baseline
- subtle idle character movement

Avoid unless specifically requested:

- hyperactive camera motion
- excessive 3D spin
- ticker-tape scrolling that outruns reading speed
- effects that reduce number legibility
- generic corporate motion unrelated to the origami concept

## Safe-zone guidance

- Keep central reading content away from the extreme edges.
- Reserve the bottom for captions, the as-of stamp and the news desk.
- Ren should not overlap the price card or dense chart labels.
- The desk must not reach into the caption column; the caption sits left, the desk right.
- Test at phone scale, with the platform's UI chrome overlaid if possible.
