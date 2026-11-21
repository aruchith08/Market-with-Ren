# Episode Template — Market Recap

Starter layout for one origami market episode.

Folders:
- `research/` — market manifest, price ledger, screenshots
- `editorial/` — voiceover script and scene plan
- `assets/` — locally stored graphics, chart exports, overlays
- `renders/` — previews and final outputs

Files:
- `research/market_manifest.json` — the 10 beats with instruments, values and as-of timestamps
- `research/price-ledger.csv` — the audit trail: one row per number on screen
- `editorial/scene-plan.json` — timings, charts, Ren plans and the fixed news-desk geometry
- `editorial/voiceover-script.md` — narration (no spoken disclaimer; that lives in the publishing copy)

The scene plan carries the fixed furniture: the `masthead` block (`MARKET WITH REN` plus the session word) and the `desk` block — 50% of canvas width, centred on Ren at 78.2%, rim at 89.2% of height, in front of Ren, bleeding 35px off the right edge. Leave both alone unless the canvas or the show changes.

Scaffold a filled-in version of this shape with `python scripts/init_episode.py <slug> --output <dir>` instead of copying the folder by hand.
