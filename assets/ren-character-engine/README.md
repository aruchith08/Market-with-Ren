# Ren Character Engine - procedural origami assets

This package corrects the difference between reference pictures and animation
assets. The authoritative asset is `src/ren.js`: executable JavaScript that draws
Ren using SVG polygons, fold shading, vector paper texture, face geometry, joints
and time-based animation. The PNG sheets are inspection outputs, not inputs.

**Scope:** waist-up Ren character only. There is deliberately no `SKILL.md` or
finished daily-news pipeline yet. Review the character before packaging that skill.

## Start here

Open `studio.html` in a modern browser to review the character interactively.
It is self-contained: no external fonts, CDN, account, API key or Remotion plugin.
A managed browser that blocks local HTML may require serving the folder locally:
`python -m http.server 8000`, then open the local server's `studio.html`.

For an AI agent, give it `docs/AGENT_QUICKSTART.md`, not a request to redraw Ren.

```bash
node tests/test.js
node scripts/render.js --emotion focused --mouth AA --pose present --still --out out/ren.svg
node scripts/validate.js examples/presentation.json
node scripts/render.js --scene examples/presentation.json --at 2.4 --out out/frame.svg
```

No `npm install` is required for SVG generation, tests, model sheets or the studio.
Node.js is required for the command-line tools. The renderer also runs directly in
browser JavaScript without Node.

## Included

- 20 emotion presets; 14 mouth shapes; 9 eye modes and independent gaze.
- 8 waist-up gestures with shoulder, elbow and wrist control.
- Five stylized key-view types, with both directions for angled views.
- Deterministic blink, subtle breathing, head movement and cape drift.
- Numeric emotion transitions and continuous arm-position transitions.
- Independent timed mouth cues with short transitions and silence handling.
- 86 generated transparent SVG assets, with a manifest and feature anchors.
- Five code-rendered model sheets, an offline control studio, three example scenes,
  schema, validation, automated tests and optional PNG/MP4 export.

`present` and `point` gesture toward screen-left, appropriate for an anchor positioned
at the lower-right. Layout insets still need review in the target video/player.

## Generate every exported asset again

```bash
node scripts/export-assets.js
node scripts/sheets.js
node scripts/build-studio.js
```

Deleting all files in `exports/` and `previews/` does not remove the character. The
JavaScript source regenerates the SVG assets and SVG review sheets. PNG/MP4 outputs
need an optional raster renderer.

## Optional PNG and video export

The included Python wrapper requires Playwright and Chromium. MP4 also requires
FFmpeg on PATH. These are optional **rendering tools**, not a Remotion plugin.
Use already-installed tools in Cowork where available. This package has not been
executed inside your particular Sarvam Cowork workspace.

```bash
python -m pip install playwright
python -m playwright install chromium
python scripts/render_media.py --scene examples/presentation.json --at 2.4 --out out/frame.png
python scripts/render_media.py --scene examples/presentation.json --out out/ren.mp4
```

The script detects `CHROME_PATH` or a system Chromium; use `--chrome PATH` to set it.
`--audio narration.wav` muxes supplied narration without time-stretching; audio is
trimmed or silence-padded to the scene duration. Mouth timings must already match.
The included demonstration is silent and uses illustrative speech-shape cues.
H.264 MP4 has no alpha channel; transparent SVG/PNG are the compositing assets.

## What this does, and does not, promise

This is original, editable code using the same procedural-asset principle as the
uploaded Clawd kit. It is not a drop-in copy of Clawd's p5.js/p5.brush renderer.
It does not embed the earlier generated PNGs, trace their pixels, or call an image
model at runtime. Drawn geometry, rather than prompt skill, preserves consistency.

The appearance is a **more geometric vector interpretation** of the reference,
not an exact recreation of the earlier richly shaded generated artwork. It needs
your art review. Front and three-quarter are the presentation views. Side/back
are simplified resting reference views, not a true 3D rig; view changes are discrete.
Arms interpolate positions; different hand drawings switch during the gesture.

A smaller language model can select valid JSON presets without constructing the
art. That reduces its workload, but is not a guarantee of every model's reliability.
The engine does not recognize phonemes, synthesize voice, research news or publish.

## Files

`src/ren.js` - source geometry, presets and renderer.
`studio.html` - self-contained generated review application.
`examples/` - small editable JSON inputs, plus a bottom-right placement example.
`scripts/` - validation, asset export, sheet generation and optional media export.
`exports/` - generated transparent SVGs and their manifest.
`previews/` - code-rendered sheets and silent acting demonstration.
`docs/` - agent instructions, API, speech guide, architecture and scene schema.
`tests/` - automated checks and recorded verification results.

See `docs/TESTING.md` for the tested environment and limits.
