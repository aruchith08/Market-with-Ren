# Why this is usable by a smaller model

The model does not construct geometry. A fixed, tested JavaScript engine handles
folded polygons, paper texture, hair, face, clothes, hands and animation.
A small scene JSON selects presets and their times. Validation rejects unknown
names and malformed or overlapping cues. Preview and export use the same renderer.

This is the useful principle from the uploaded Clawd animation kit: keep the
character implementation fixed; let the agent call an API. Ren's original renderer
uses SVG rather than Clawd's p5.js/p5.brush watercolor implementation. No Clawd
source code is included. The original art reference informs Ren's appearance.

Loading order for an agent:
1. Read AGENT_QUICKSTART.md.
2. Copy a small example JSON.
3. Read API.md or SPEECH.md only for an unfamiliar field.
4. Do not load or rewrite source geometry during ordinary video creation.

This is progressive disclosure, not an expectation that a low-capability model can
reproduce a complex drawing from natural-language instructions. Reliable preset
selection is a much smaller task than writing a new animation engine each day.

All character randomness is deterministic seeded variation. There are no texture
image inputs, hidden raster plates, image-model calls, CDN requests or frame-state
physics. Paper grain is an SVG filter/pattern, and all forms are vector geometry.

Future news-skill integration can consume the source engine, manifest and scene
schema. Research, article capture, narration generation, news timing and publication
are deliberately outside this package.
