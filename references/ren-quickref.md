# Ren Quick Reference

The production-ready Ren engine is bundled under `assets/ren-character-engine/`.

Read:
- `docs/AGENT_QUICKSTART.md`
- `docs/API.md`
- `docs/SPEECH.md`

## Default usage

Use Ren as a reusable coded overlay.

Typical settings:
- view: `front`
- placement: lower-right overlay
- emotion: `focused` or `determined`
- motion: subtle idle
- mouth: speech-timed presets

## Matching Ren to the market

- green day, broad rally → `confident` or `smiling` + `present`
- red day, broad fall → `concerned` + `present`
- sharp fall or VIX spike → `alert` or `serious` + `emphasis`
- index level, flows, chart reading → `present` or `point-up`
- "why it moved" / sector rotation → `explaining` or `explain`
- mixed, flat day → `neutral` or `focused` + `idle`
- pre-market brief → `focused` + `present`

Ren reports the market; he does not cheer a fall or celebrate a rally. On extreme days, dial the emotion down rather than up.

## Valid preset names

The engine throws on unknown names instead of falling back, so copy these spellings from `assets/ren-character-engine/exports/manifest.json` rather than guessing.

- emotion: `neutral` `serious` `focused` `determined` `concerned` `sad` `surprised` `alert` `confident` `smiling` `happy` `explaining` `thinking` `skeptical` `curious` `relieved` `excited` `disappointed` `angry` `confused`
- pose: `idle` `present` `explain` `point` `point-up` `hand-on-chest` `emphasis` `wave`
- view: `front` `three-quarter` `side` `three-quarter-back` `back`, rotated with `facing: left|right` (turnaround only — gestures only read in the front and three-quarter views)
- mouth: `rest` `MBP` `small` `medium` `AA` `EE` `OH` `OO` `FV` `L` `TH` `CH` `smile` `teeth`

There is no `explain-left`, `explain-right`, `smile-soft` or `corner-overlay` preset — `corner-overlay` is the example file `examples/corner-overlay.js` that shows placement, not a pose name.

## Important rule

Do not replace Ren with freshly generated character art unless the task explicitly asks for redesign work. Prefer the engine and its existing presets.
