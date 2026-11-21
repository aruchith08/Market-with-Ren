# Sources, Price Ledger, and QA

## Required fields per beat

For every beat, capture:

- `id` and `order`
- `headline` — what the beat says, in viewer language
- `instrument` — index, stock, sector, currency, commodity, flow or macro
- `name` and `symbol` — display name plus exchange symbol, or `NA` for macro data
- `exchange` — NSE, BSE, or NA
- `value` — level or price, 2 decimals
- `change_abs` and `change_pct` — signed, 2 decimals
- `as_of` — timestamp in IST
- `session` — pre-open, intraday or close
- `source_name` and `source_url`
- `screenshot_path` or `capture_status`
- `catalyst` — the stated reason for the move, one clause
- `verified_summary` and `why_it_matters`
- `confidence_notes`

## Price ledger expectations

The ledger is the audit trail for the episode. Another editor should be able to check every on-screen number in under five minutes.

At minimum, it must answer:

- Where did this number come from, and at what time?
- Was it a close, an intraday print, or a flow figure for the day?
- Did we capture a screenshot?
- What exactly did we say in the video?
- Was there any uncertainty or source disagreement?
- Which beat used it?

A number on screen with no ledger row is a defect, even if the number is right.

## QA checklist

### Data QA

- Does every on-screen number have a ledger row with a source and an `as_of`?
- Do the digits match exactly — no rounding drift between ledger, script and graphic?
- Is every percent signed, and does the sign match the arrow and the colour?
- Are index points and percentages both present where the script claims them?
- Do flows carry the ₹ crore unit?
- Was the episode recorded on a trading day, quoting that day's data?
- Are charts plotted to scale from the ledger numbers?

### Editorial QA

- Are all beats market-relevant?
- Are names, tickers and spellings correct?
- Are there duplicates or near-duplicates?
- Does the lineup reflect what actually mattered that session?
- Does the close snapshot lead, and does "what to watch" close?
- Is there any advice language left in the script?

### Compliance QA

- Is the disclaimer line, verbatim, in the YouTube description?
- Is the same line, with the as-of time, in the pinned comment?
- No buy, sell, hold, target price or guaranteed-outcome phrasing?
- Any forecast attributed to the institution that made it?
- No disclaimer card or spoken disclaimer slipped back into the video?

### Visual QA

- Is every screenshot legible, and is personal or account data blurred?
- Is the news desk in front of Ren, at its fixed size, clear of the caption column?
- Are source credits visible when needed?
- Is Ren consistent from scene to scene?
- Are fold transitions coherent with the art direction?
- Are captions readable over the background at phone scale?
- Is the as-of stamp present and legible on price frames?

### Timing QA

- Is the runtime within target?
- Does each beat get enough time to read its number?
- Are mouth cues approximately aligned with narration?

### Delivery QA

- Is the final MP4 encoded correctly?
- Are subtitles included or exported?
- Are editable source files present?
- Are the price ledger, chart data and disclaimer text shipped with the package?
