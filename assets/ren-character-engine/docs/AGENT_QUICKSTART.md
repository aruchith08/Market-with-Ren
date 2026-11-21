# Ren: agent quickstart

Use this file first. Do not read the entire renderer for normal production.

## Your job
Choose presets and timestamps. Do not redraw Ren, generate new character images,
replace `src/ren.js`, or invent preset names. The renderer owns the geometry.
Work only in a copy of an example JSON file. This is a character asset engine,
not the complete news production skill.

## Make a still

```bash
node scripts/render.js --emotion concerned --mouth OO --pose present --still --out out/ren.svg
```

## Make an animation

1. Copy `examples/presentation.json` to `examples/my-scene.json`.
2. Set `duration`, `fps`, and `character` defaults.
3. Set `acting` cues with increasing `at` times. Choose an emotion and gesture.
4. Set `speech` cues using real, externally supplied mouth timings. Do not claim
   a demonstration cycle is synchronized narration. Use `speech: []` for silence.
5. Run `node scripts/validate.js examples/my-scene.json`.
6. Run `node scripts/render.js --scene examples/my-scene.json --at 2.4 --out out/check.svg`.
7. Inspect several faces, gesture extremes, and transitions before exporting.
8. Use `python scripts/render_media.py --scene examples/my-scene.json --out out/ren.mp4`
   only when Python Playwright, Chromium and FFmpeg are available.

## Allowed values

Emotion: `neutral`, `serious`, `focused`, `determined`, `concerned`, `sad`,
`surprised`, `alert`, `confident`, `smiling`, `happy`, `explaining`, `thinking`,
`skeptical`, `curious`, `relieved`, `excited`, `disappointed`, `angry`, `confused`.

Gesture: `idle`, `present`, `explain`, `point`, `point-up`, `hand-on-chest`,
`emphasis`, `wave`. Gestures act in front and three-quarter views. Side and back
views use a resting turnaround pose.

Mouth: `auto`, `rest`, `MBP`, `small`, `medium`, `AA`, `EE`, `OH`, `OO`, `FV`,
`L`, `TH`, `CH`, `smile`, `teeth`. `auto` selects the emotion's mouth in a still;
it does not listen to audio. Speech cues must name an explicit shape, not `auto`.

View: `front`, `three-quarter`, `side`, `three-quarter-back`, `back`.
Facing: `left` or `right`. This controls turnaround direction, not gesture direction.

Eyes: `auto`, `open`, `half`, `closed`, `wide`, `narrow`, `happy`, `wink-left`,
`wink-right`. Gaze: `[x,y]`, each from -1 to 1; negative x is screen-left,
negative y is up in the front view. Profile direction mirrors local gaze.

## Rules

Use `front` for the speaking news anchor. Keep serious news expressions restrained.
Set `motion: 0` and `blink: false` for a locked inspection frame. Use the same seed
for the same character. Set a unique `id` for each instance placed in one SVG/DOM.
Keep `background: "transparent"` when compositing. Do not change the palette.
Read `docs/API.md` only for integration. Run `node tests/test.js` after any engine
edit. A validation error means fix the JSON; do not bypass validation.
