# Renderer API

## Load

```javascript
// Node.js
const Ren = require('./src/ren.js');
const fs = require('node:fs');
const svg = Ren.render({
  emotion: 'concerned', mouth: 'OO', pose: 'present',
  view: 'front', time: 2.4, seed: 7,
  background: 'transparent', width: 1000, height: 1050
});
fs.writeFileSync('ren.svg', svg);
```

In a browser, load `src/ren.js` with a script tag. `window.Ren` is available.
Set a trusted container's `innerHTML` to `Ren.render(options)`. Scene values are
strictly validated; the engine never accepts arbitrary SVG strings or external URLs.

## Methods

`render(options)` returns a complete SVG document for one character.
`validateScene(scene)` returns true or throws a descriptive error.
`stateAt(scene, seconds)` resolves options, face, joints and mouth at that time.
`renderAt(scene, seconds)` returns a complete SVG at the supplied scene time.
`frame(scene, frameNumber)` renders frame N at N/fps. Frame numbers start at zero.
`mouthSVG(name)` returns just the mouth, centered at local (0,0).
`eyesSVG(name, options)` returns the eyes and brows in their canonical coordinates.
`CATALOG`, `PALETTE` and `DEFAULTS` are immutable. Read them; do not modify them.

## Render options

| Key | Default | Meaning |
| --- | --- | --- |
| emotion | neutral | Named acting preset |
| pose | idle | Named arm gesture |
| mouth | auto | Emotion default or explicit mouth shape |
| eyes | auto | Emotion default or explicit eye mode |
| gaze | [0,0] | Each axis -1 to 1 |
| view | front | Named drawn view |
| facing | left | Direction for angled views |
| blink | true | Auto, false, or explicit closure from 0 to 1 |
| motion | 1 | Idle-motion amount from 0 to 2 |
| time | 0 | Seconds, nonnegative |
| seed | 7 | Stable blink timing offset |
| width / height | 1000 / 1050 | Output dimensions; SVG viewBox stays fixed |
| background | transparent | Transparent or six-digit hex color |
| id | ren | Safe unique identifier for gradients, clips and groups |
| detail | full | full or draft; draft omits texture and gradients |
| headTilt | 0 | Additional tilt in degrees, -12 to 12 |

Unknown options, invalid names and non-finite values are errors, not silent defaults.

## Scene structure

```json
{
  "version": 1,
  "fps": 30,
  "duration": 4,
  "transition": 0.3,
  "character": {"emotion": "neutral", "pose": "idle"},
  "acting": [
    {"at": 0, "emotion": "neutral"},
    {"at": 1, "emotion": "explaining", "pose": "present"}
  ],
  "speech": [
    {"start": 1.2, "end": 1.4, "mouth": "MBP"},
    {"start": 1.4, "end": 1.7, "mouth": "AA"}
  ]
}
```

All times are seconds. Endpoints are exclusive for speech. Cues must be ordered,
non-overlapping and within duration. The optional `metadata` object is for notes.
Acting cues inherit fields from earlier cues. Leave at least the chosen transition
duration between cues for fully completed acting transitions.

An absent `speech` track leaves the emotion/manual mouth active. An empty `speech`
array means silence. Gaps between speech cues close the mouth. Speech overrides
mouth appearance without changing eyebrows, gaze, posture or character proportions.

## Geometry and layering

Canonical canvas: 1000 x 1050. The shoulders are (315,639) and (685,639). The head
pivots at (500,550); front-view mouth origin is (500,493), eyes at (443,403) and
(557,403). `exports/manifest.json` records these. Isolated eyes have SVG viewBox
(350,330,300,135); isolated mouths have viewBox (-80,-45,160,90).

Rear cape -> rear sleeves -> torso -> collar/sword -> forearms/hands -> head.
The head owns its feature coordinates and transformation. Do not overlay the
standalone mouth on a rotated head using fixed screen coordinates; prefer `render()`.

Use a unique id per simultaneous character to avoid SVG gradient/clip collisions.
SVG output is byte-deterministic for identical inputs. Raster anti-aliasing and
filters can differ slightly across browser engines or versions. Use one pinned
browser for a production render. Frames may be requested in any order.

## Placement

Use `examples/corner-overlay.js` for a transparent 1080x1920 composition. Adjust
its layout constants after checking the target video app's controls and captions.
Do not assume one inset works for every platform or screen.
