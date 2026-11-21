---
name: origami-market-video
description: Produce code-rendered 60-second origami-style stock-market recap videos for Indian markets, with Ren as the bottom-right anchor. Use this skill whenever the user wants a daily market wrap, Nifty or Sensex close recap, top gainers and losers explainer, sector or FII-DII story, earnings-day video, pre-market brief, or any short-form market video built from real prices and charts — including planning the beat list, building the source and price ledger, generating reusable templates, or rendering a top-10 market-beat explainer in Sarvam Cowork or a similar environment without relying on a Remotion plugin.
---

# Origami Market Video

## Overview

This skill produces a repeatable **daily stock-market recap video**: 60 seconds, vertical, code-rendered, in a unified **origami paper** visual style, with **Ren** — a waist-up origami anchor — presenting from the bottom-right of the frame. It is built for environments like **Sarvam Cowork** where a Remotion plugin may not exist.

Every episode is market content. Politics, sport, weather and general news are out of scope unless they move prices (a budget, an RBI decision, a tariff, a crude shock, a war that moves oil) — and even then the story is told as a market story: what moved, by how much, and why.

Three modes, same format:

- **Post-close recap** (default) — what the trading day did, told after 15:30 IST.
- **Pre-market brief** — overnight global cues, GIFT Nifty, the day's earnings and data calendar, told before 09:15 IST.
- **Weekly wrap** — the weekend episode, published when the exchanges are shut. Same 60 seconds and same origami system, different spine; see **Closed days and the weekly wrap**.

Default market coverage is **India-first**: NSE and BSE, Nifty 50 and Sensex, Indian sectors and stocks. Global markets appear as context that explains the Indian open or the day's mood.

This skill assumes a **pure-code video workflow**. Prefer **HTML/CSS/SVG/Canvas/JavaScript** and your available renderer over generative video tools. The bundled Ren engine already provides reusable facial, mouth, eye, gesture and overlay behaviour in code.

## Show identity

The show is **MARKET WITH REN**. It is not "News with Ren" — no frame, filename, caption, description or delivery note uses the old name.

- **Masthead**, top-left of every frame: the red folded-paper triangle mark, then `MARKET WITH REN` in bold caps with wide letter-spacing, charcoal on parchment.
- **Dateline**, top-right on the same baseline: `THU 19 NOV 2026 · CLOSE` — weekday, day, month, year, then the session word: `CLOSE`, `PRE-MARKET` or `WEEKLY`.
- A single hairline rule under that row separates the masthead from the beat header.
- The masthead is fixed brand furniture: same position, same size, same spelling in every episode, including the weekly wrap. It never carries data, so it never changes except for the dateline.
- Filenames follow the show: `Market_with_Ren_2026-11-19.mp4`, `Market_with_Ren_Weekly_Wrap_2026-11-22.mp4`.
- The publishing copy opens with the show name, then the date's numbers.

## Output Format

These defaults are assumed by every downstream step. Change them only when the assignment says so, and then change them in the manifest, the scene plan and the delivery notes together so nothing drifts.

- **Canvas:** 1080x1920, 9:16 vertical
- **Frame rate:** 30 fps
- **Duration:** 60 seconds
- **Export:** H.264 MP4, `yuv420p`, AAC audio at 48 kHz
- **Safe zones:** keep the top ~12% and bottom ~20% clear of headlines and captions (platform UI), and never let Ren cover the headline block, the price card or the chart axis
- **On-screen as-of stamp:** every price frame carries its own `as of HH:MM IST, DD MMM YYYY` label
- **Disclaimer:** the video itself carries no disclaimer card or spoken line — it lives in the YouTube description and pinned comment of every episode, in the exact wording under **Disclaimer & Compliance**

The Ren engine renders on a fixed 1000x1050 viewBox; treat it as a component you place and scale inside the 1080x1920 canvas, not as a canvas size of its own.

## Quick Start

1. **Read the task and decide the mode**
   - **Post-close recap** (most requests) → follow **Market Production Workflow** from Step 1.
   - **Pre-market brief** → same workflow, with the overnight-global and calendar beats taking the front slots.
   - **Update/refine an existing episode** → reuse the previous manifest and price ledger, refresh only the changed numbers, and jump to **Storyboard & Scene Planning**.
   - **Only need Ren assets or overlays** → jump to **Ren Character Usage**.

2. **Scaffold an episode workspace**
   - Run `python scripts/init_episode.py <episode-slug> --output <dir>`
   - This creates starter files for the price ledger, manifest, script, scene plan and delivery notes, pre-timed as 10 beats across 60 seconds so you retime rather than invent a structure.

3. **Validate episode data before rendering**
   - Run `python scripts/validate_episode.py <episode-dir>`
   - It fails hard on missing files, unparsable JSON/CSV, missing required fields (symbol, price, change, as-of), duplicate ids and impossible timings.
   - It warns on runtime drift from the 60-second target, overlapping or gapped scenes, beat ids that do not match the manifest, unknown Ren preset names, missing close-snapshot or outlook beats, missing disclaimer, and empty headline or screenshot fields. Add `--strict` to promote warnings to failures — use that before the final export, not while the episode is half-filled.

4. **Use the bundled Ren engine**
   - Read `assets/ren-character-engine/docs/AGENT_QUICKSTART.md`
   - Keep `assets/ren-character-engine/src/ren.js` unchanged unless the task explicitly requires engine work.

5. **Render with the environment you have**
   - Prefer the environment's existing HTML/SVG/video workflow.
   - If frames or stills must be assembled manually, use your available browser renderer and FFmpeg.
   - Do **not** assume a Remotion plugin exists.

## Core Rules

1. **Every number is sourced, timestamped and traceable**
   - Each price, percentage and flow figure carries an instrument, a value, an `as_of` timestamp and a source in the ledger.
   - If two sources disagree, prefer the exchange (NSE/BSE) and record the discrepancy in the ledger.
   - Never round a down day into an up day, and never fill a gap with an estimate. If data is missing at recording time, drop the beat or say plainly that it was unavailable.

2. **This is a market video, not investment advice**
   - No buy, sell or hold calls. No price targets. No "the stock will rally" predictions stated as fact.
   - Describe what happened, the stated reason, and what is scheduled next. Attribute forecasts to the institution that made them ("Nomura expects…").
   - Keep the disclaimer in the publishing copy — description and pinned comment — not on screen. See **Disclaimer & Compliance**.

3. **Do not use AI-generated video footage**
   - Motion comes from code, animation logic, SVG, Canvas, CSS or compositing.
   - Real chart or exchange screenshots may be shown; do not fabricate a broker, exchange or publisher page.

4. **Keep the entire world origami-styled**
   - Ren, ticker ribbons, price cards, candles, heat strips, lower-thirds, transitions and backgrounds should all feel like folded paper.
   - The origami style is not limited to the anchor.

5. **Keep Ren consistent**
   - Ren is waist-up only in this system.
   - Preserve his folded dark-brown hair, faceted cream face, red origami cape/collar, dark clothing and calm-but-determined identity.
   - Use code presets rather than redrawing him.

6. **Protect readability and platform safe zones**
   - Ren sits bottom-right but must not collide with captions, the price card, the chart axis or likely vertical-platform overlays.
   - The headline number — the index level or the percentage — is the most important pixel on screen. Size it accordingly.

7. **Design for low-end agents too**
   - Prefer presets, templates and validation over open-ended reinvention.
   - Use small, explicit JSON or Markdown control files wherever possible.

## Market Production Workflow

### Step 1 — Market data collection

Goal: assemble one verified, timestamped dataset for the trading day before writing a word of script.

**Session clock (IST, Monday–Friday, exchange holidays excluded):**

- Pre-open: 09:00–09:15
- Regular session: 09:15–15:30
- Post-close recaps quote the official close; intraday numbers must be labelled as such and are usually not worth the risk

**Capture for every beat:**

- instrument type — `index`, `stock`, `sector`, `currency`, `commodity`, `flow`, `macro`
- display name and symbol (e.g. `Nifty 50` / `NIFTY`, `Reliance Industries` / `RELIANCE`)
- exchange — `NSE`, `BSE`, or `NA` for non-exchange data
- price or level, absolute change, percentage change
- `as_of` timestamp, and the session it came from (`pre-open`, `intraday`, `close`)
- source name, source URL, and a screenshot path or capture note
- the catalyst: the stated reason for the move, in one clause
- confidence note when anything is thin

**The day's standard dataset** — collect these even if some beats get cut:

- Nifty 50 and Sensex close, points and percent
- sector indices: Nifty Bank, IT, Auto, FMCG, Metal, Pharma, Realty, Energy, PSU Bank
- top gainers and losers, with percent move and, where available, volume
- advance/decline count for the NSE
- FII and DII net flows, in ₹ crore
- USD/INR, Brent crude, gold, India VIX
- global cues: US close, major Asian indices, GIFT Nifty
- tomorrow's earnings and macro calendar, and any scheduled data release

**Precision rules:**

- Index levels and prices to 2 decimals; percentages to 2 decimals with an explicit sign
- Flows in ₹ crore, never in "billions of dollars" mixed into the same sentence
- State the unit once per block, then drop it — "Nifty ended 312 points up at 24,812"
- A percentage without its base is meaningless on screen; pair it with the level

### Step 2 — Beat selection

Choose **10 beats** for the 60-second cut unless the assignment asks for a different count.

Timing that the rest of the pipeline assumes:

- **Intro: 0–4 seconds** — the masthead and the greeting line, nothing else
- **Beats: 4–55 seconds** — 10 blocks at 5.1 seconds each
- **Outro: 55–60 seconds** — sign-off

Default beat plan for a post-close recap — reorder freely, drop what the day does not support:

1. **Close snapshot** — Nifty and Sensex, points and percent, the day's character in one clause
2. **The driver** — the single biggest reason the market moved
3. **Top gainer** — stock, percent, catalyst
4. **Second gainer or the midcap/smallcap theme**
5. **Top loser** — stock, percent, catalyst
6. **Sector scorecard** — the sector that led and the sector that dragged
7. **Flows** — FII and DII net buying or selling, ₹ crore
8. **Macro** — rupee, crude, gold, VIX: pick the two that actually moved
9. **Global cues** — what happened overnight and what it means for tomorrow
10. **What to watch** — earnings, data, events scheduled for the next session

Always keep **1** and **10**: the viewer needs the day's number and a reason to return. Two beats on the same stock is a wasted slot; prefer a second theme.

**On a quiet day** — a flat index, no big movers — deepen fewer beats rather than padding. A 6-beat episode with a clear story beats 10 beats of noise, and the validator will warn rather than fail.

### Step 3 — Script writing

Structure: the greeting inside the first four seconds, 10 short beat summaries, one closing line with the outlook. No spoken disclaimer.

**The intro is a fixed line, spoken over the masthead reveal and finished by 0:04 at the latest:**

> "This is Market with Ren — and these are today's stories."

Say it exactly that way, in the same words every episode: it is the show's signature, and it is the only place the viewer learns what they are watching. Do not extend it with the day's numbers — those belong to beat 1, which starts at 0:04. If the line overruns, shorten the pause after the dash, not the words.

Each beat line carries, in this order:

1. the number (level or percent),
2. the name (index, stock or sector),
3. the reason, in a clause.

Write it as a sentence a trader would say out loud, not as a ticker tape:

- Good: "Nifty ended 312 points higher at 24,812, its best close in three weeks."
- Bad: "NIFTY UP 1.27% 24812 +312."

**Budget:** each beat has about 5.1 seconds — roughly 13–16 spoken words. Anything longer gets cut mid-sentence. Say tickers in full for stocks ("Reliance", not "RIL") unless the abbreviation is universal, and gloss jargon the first time it appears ("FIIs — foreign institutional investors — bought…").

### Step 4 — Storyboard & scene planning

Use the episode template files under `assets/templates/episode-template/`.

For each beat, define:

- beat id, order, start and end time
- headline text, and the single number that must be read first
- the instrument block: symbol, display name, price, change, percent, `as_of`
- chart type — sparkline, candle strip, comparison bars, sector heat strip, flow bars, or none
- source screenshot (broker or exchange page, or the outlet's chart) and its credit
- Ren pose / emotion / mouth plan
- transition in and out
- caption line, which must repeat the number

### Step 5 — Visual build

Build each beat with:

- origami paper background
- masthead row: `MARKET WITH REN` top-left, dateline top-right, hairline rule beneath
- folded ribbon headline card
- beat number marker (`01/10`, `02/10`)
- price card: display name, level, signed change, percent, up or down arrow
- chart panel or screenshot frame
- one-clause catalyst line
- as-of stamp
- Ren in the bottom-right
- the red news desk in front of Ren, rim at his waist
- captions

Preferred visual stack:

1. background texture
2. modular beat frame
3. headline and price card
4. chart or screenshot
5. catalyst line and as-of stamp
6. Ren overlay
7. news desk (in front of Ren — his hands stay above the rim)
8. captions
9. transition overlays

### Step 6 — Audio & captions

**Narration is not optional.** A silent or music-only cut is a failed episode, not a stylistic choice. Every beat line in the script must be spoken by one consistent voice across the whole episode.

**The voice is male.** Ren is a boy, and the anchor voice is his — a male English voice, warm and measured, not a presenter shout. Never use a female voice, never alternate between voices, and never pitch-shift a female sample to sound male; it reads as a different character. If the only voice available is female, move down the ladder to one that offers a male.

Voice ladder — take the first that works and record which one you used:

1. **TTSForFree AI Text To Speech** (or the environment's connected TTS tool) — pick **Prabhat (Natural) (India)** (`en-IN`, male, low credit cost) or another warm male English voice. Use `srt_to_speech` against `subtitles.srt` to produce one timeline-aligned MP3. If the rendering sandbox has no outbound internet access, share the generated MP3 link and have the user upload the file back into chat before muxing.
2. `edge-tts` (neural English voices, no key, needs network): `pip install edge-tts`, then `edge-tts --voice en-IN-PrabhatNeural --text "…" --write-media out.mp3`. `en-IN-PrabhatNeural` is male; keep the same voice name every episode.
3. `gTTS` (`pip install gTTS`) as a plain fallback — set `lang="en"` and confirm the output is male before using it.
4. A local synthesiser such as `espeak-ng` only as a last resort — it sounds robotic, so say so in the delivery notes.

Then (audio-first, waveform-measured sync):

- Never assume a generated TTS MP3 matches the target 60-second SRT duration verbatim — capped speech rates often extend natural-paced narration past 60 seconds.
- Always measure the actual audio duration with `ffprobe -show_entries format=duration` AND detect exact inter-cue pause boundaries with `ffmpeg -i voiceover.mp3 -af silencedetect=noise=-28dB:d=0.07 -f null -` (or measure individual segment files).
- Retime the scene plan, beat transitions, and `speech-cues.json` directly to those waveform-measured pause boundaries before rendering or muxing — never clip the audio to 60 seconds or leave beats drifting ahead of the voice. To hit a strict 60-second ceiling, trim words/beats and regenerate the voiceover rather than pushing speech speed past about 1.1×.
- When exporting a re-timed or re-synced cut, write to a fresh filename (e.g. `Market_with_Ren_YYYY-MM-DD_synced.mp4`) so cached previews never serve an earlier unsynced render.
- Mix narration at full level, with background music roughly −18 dB under it. Nothing may mask a spoken number or name.
- **No transition sound effects.** No whooshes, impacts, drum hits, swipes, "paper fold" or "thump" sounds between beats or under a card change. The only sounds in the episode are the voice and the music bed. Cuts are carried by the picture, and a beat landing silently on a fold reads cleaner than one with a knock under it.
- Drive Ren's mouth states from the narration timing blocks; the engine supports mouth presets independently of expression.

Required deliverables:

- narration audio (kept in the assets folder)
- the mixed master audio
- subtitle/caption text (`subtitles.srt`)
- synchronised line or word timing if supported

Numbers must be captioned as spoken and as written: "312 points" on screen matches "three hundred and twelve points" in audio. If phoneme extraction is unavailable, use simple mouth-state timing blocks; the Ren engine supports mouth presets independently of expression.

## Mouth animation — the lip-sync contract

Ren's mouth is driven by a `speech` track on each scene: cues of `{start, end, mouth}` in **seconds, relative to that scene's own start**, ordered, non-overlapping, and inside the scene's duration. The engine interpolates into each shape over up to 45 ms, closes the mouth in the gaps, and treats `speech: []` as silence. It never reads the audio file.

**Order of operations is the whole trick.** Build the mouth after the voice, never before:

1. Finalise the narration audio.
2. Measure each line's real start and end.
3. Generate cues with `scripts/build_speech_cues.py` from those measured timings.
4. Retime the scene plan to the same audio.
5. Render.

If narration changes for any reason — a reworded line, a different voice, a re-timed beat, a re-render of the TTS — **every cue is stale and must be rebuilt.** Cues surviving a narration change are the most common cause of a mouth that runs ahead, lags behind, or freezes.

**Do not cycle shapes on a timer.** The fourteen presets are a visual vocabulary, not speech recognition. `build_speech_cues.py` maps the actual words to shapes — `MBP` for m/b/p closures, `FV` for f/v, `TH`, `CH`, vowels to `AA`/`EE`/`OH`/`OO`, generic consonants to `small`/`medium` — and distributes them across the measured line with a rest between words and a longer one at punctuation. It is an approximation, and should be described as one; it follows the words rather than a metronome.

**Failure modes, in the order they usually appear:**

- cues timed on the episode clock instead of the scene clock — every cue falls outside the scene and the mouth freezes shut;
- one long cue spanning a whole beat — a mouth stuck open for five seconds;
- cues built before the narration was re-rendered — drift that grows across the episode;
- overlapping or unsorted cues — the engine rejects the scene;
- no `speech` track while the emotion preset has an open mouth — the mouth hangs open through silence;
- a standalone mouth overlaid at fixed coordinates on a tilted or rotated head — the mouth detaches from the face. Always render the whole character through `render()` / `renderAt()`, never paste `mouthSVG()` onto a turned head;
- cue times written in milliseconds — everything collapses into the first second;
- shapes too wide or too busy at 300 px — preview at the actual on-screen anchor size, not at 1000 px.

**Silence is explicit.** During the intro, the outro, music-only stretches and any beat whose line was dropped, set `speech: []` so the mouth closes instead of holding the emotion default.

**Validate before export:** `python scripts/build_speech_cues.py <cues.json> --check` must pass — every cue inside its scene, ordered, non-overlapping, no cue under 60 ms, no spoken scene left silent, and the mouth moving over roughly 40–85% of each spoken line. A mouth that moves through 100% of a scene is as wrong as one that never moves.

### Step 7 — QA review

Run `python scripts/validate_episode.py <episode-dir> --strict` first — it catches the mechanical problems (runtime drift, overlapping scenes, broken beat references, mistyped Ren presets, missing prices or disclaimer) faster than eyeballing frames. Then check what a script cannot see:

- every on-screen number matches the ledger, digit for digit
- direction is consistent: a down day has a minus sign, a down arrow and red — never a mixed signal
- ticker and company names spelled correctly
- `as_of` stamps are present and agree with the ledger
- no advice language slipped into the script ("buy", "target", "sure thing", "will rally")
- Ren's mouth follows the narration: no drift at the start or end of a beat, mouth closed in the gaps, every cue inside its own scene, and `build_speech_cues.py --check` passing
- the publishing kit carries the disclaimer, verbatim, in the description and pinned comment, with the correct as-of time
- timing within 60 seconds, safe zones clear, captions readable at phone scale
- the intro greeting is spoken and finished by 0:04, with beat 1 starting on 0:04
- the voice is male and the same voice throughout, and there is no transition sound effect anywhere in the mix — no whoosh, knock or fold hit between beats
- the desk rim crosses Ren's waist, its centre sits on his centre, and it does not change size between beats
- Ren continuous, transitions coherent, audio in sync
- the episode was recorded on a trading day and quotes that day's data

### Step 8 — Final output package

- final MP4
- editable project or source files
- voiceover and subtitle files
- price/data ledger with sources and timestamps
- chart data or the exported chart assets
- article or exchange screenshots
- scene plan
- disclaimer text used
- notes on any unresolved data uncertainty

## Closed days and the weekly wrap

When the exchanges are shut — Saturday, Sunday, or a trading holiday — there is no "market today" episode. Never invent one, and never present Friday's close as today's.

**The weekend episode is a weekly wrap**, in the same 60-second vertical format and the same origami system, saved as `Market_with_Ren_Weekly_Wrap_YYYY-MM-DD.mp4`, with the dateline reading `WEEKLY`. Its spine:

1. **The week in one line** — Nifty and Sensex weekly percentage move.
2. **Best and worst** — the leading and lagging sector or index of the week.
3. **Three single-stock moves** that mattered, each with the stated reason.
4. **The week's biggest event** — policy, earnings or global.
5. **What to watch next week** — scheduled data, earnings dates, Fed or RBI meetings. Events, never forecasts.
6. **Sign-off.**

Charts and counters take more of the frame than screenshots: a wrap is about direction and magnitude, so let the origami charts carry it.

**A mid-week trading holiday:** no daily episode that day; the weekend wrap accounts for that week. If a run is triggered on a closed day, say plainly that the market was shut and produce the weekly wrap rather than a thin or invented daily.

## Disclaimer & Compliance

The owner keeps the 60 seconds clean, so the disclaimer lives in the publishing copy rather than on screen. Every episode carries:

1. **Description** — the disclaimer line, verbatim, near the top of the YouTube description.
2. **Pinned comment** — the same line again, with the as-of time.
3. **In the ledger** — the data source for each number, so any claim can be checked.

Use exactly:

> This video is for information only and is not investment advice. Market data as of <time> IST on <date>. Please consult a SEBI-registered adviser before investing.

No on-screen disclaimer card and no spoken disclaimer line. If `validate_episode.py` warns about a missing disclaimer field, satisfy it through the episode's publishing copy and note that in the delivery notes.

Language to avoid: buy, sell, hold, target price, multibagger, guaranteed, sure-shot, "will hit", "must buy". Language that is fine: rose, fell, ended, closed at, gained, slipped, attracted buying, saw selling, is scheduled to report.

If the user asks for a recommendation, explain that the format reports the market rather than advising on it, and offer the factual version instead.

## Ren Character Usage

The bundled Ren engine lives at:

- `assets/ren-character-engine/`

Read first:

- `assets/ren-character-engine/docs/AGENT_QUICKSTART.md`
- `assets/ren-character-engine/docs/API.md`
- `assets/ren-character-engine/docs/SPEECH.md`

Use Ren as a reusable component, not as a prompt-based character.

### Ren placement

Default:

- lower right corner
- waist-up framing
- moderate scale
- never covering the price card, chart axis or headline-critical text
- standing behind the news desk: the rim crosses his waist, his hands and gestures stay above it, and the desk never rises higher than his chest

**His box is fixed, and everything else is placed from it.** On the 1080x1920 canvas:

| Property | Value |
| --- | --- |
| x | 600 |
| bottom_y | 1800 |
| width | 480 (44.4% of canvas width) |
| height | 504 — the engine's 1000x1050 aspect, so he is never stretched |
| anchor | bottom-centre — his centre sits at x=840 |
| top | 1296 |

The scene plan carries this as the `ren` block. It exists so the desk and the captions have something real to sit against: change his scale and the desk follows, instead of drifting off his waist.

### Ren default behavior

For most market scenes:

- pose: `present` (or `idle` for the intro card)
- emotion: `focused` or `determined`
- eyes: attentive with occasional blink
- mouth: driven by speech states
- motion: subtle idle only

### Preset names the engine actually accepts

The engine validates names strictly and throws on anything else — there is no silent fallback — so use these spellings exactly. Read `assets/ren-character-engine/exports/manifest.json` when in doubt; it is the source of truth.

- **emotion:** `neutral`, `serious`, `focused`, `determined`, `concerned`, `sad`, `surprised`, `alert`, `confident`, `smiling`, `happy`, `explaining`, `thinking`, `skeptical`, `curious`, `relieved`, `excited`, `disappointed`, `angry`, `confused`
- **pose:** `idle`, `present`, `explain`, `point`, `point-up`, `hand-on-chest`, `emphasis`, `wave`
- **view:** `front`, `three-quarter`, `side`, `three-quarter-back`, `back` — combine with `facing: left` or `facing: right` for direction rather than inventing a name like `front-right`
- **mouth:** `rest`, `MBP`, `small`, `medium`, `AA`, `EE`, `OH`, `OO`, `FV`, `L`, `TH`, `CH`, `smile`, `teeth`

### Matching Ren to the market's mood

- **Green day, broad rally** → `confident` or `smiling`, `present`
- **Red day, broad fall** → `concerned`, `focused`, `present`
- **Sharp fall, volatility spike** → `alert` or `serious`, `emphasis`
- **Index level, flows, chart reading** → `present` or `point-up`
- **Sector rotation, "why it moved" beats** → `explaining` or `explain`
- **Neutral, mixed, flat day** → `neutral` or `focused`, `idle`

Ren should reflect the market's tone without celebrating a fall or mourning a rise — he reports, he does not cheer. `facing` only sets the character's turnaround direction; it does not redirect a gesture. To aim a gesture at the chart, pick the pose that already reads that way (`explain`, `point`, `point-up`) and keep `view` at `front` or `three-quarter` — side and back views fall back to a resting turnaround pose, so a gesture there is wasted.

## Visual System

The origami world should feel cohesive, and it should look like a market terminal folded out of paper.

### Color direction

- parchment / off-white backgrounds
- charcoal and warm black text areas
- deep red paper accents for brand and structure
- **direction colours:** muted paper green for gains, muted paper red for losses — always paired with an arrow and an explicit sign so the meaning survives colour-blind viewing and a small phone screen
- muted tan / brown support tones

Do not use the brand red and the "down" red interchangeably in the same frame; give the direction colour its own tint and keep it consistent across the episode.

### Typography direction

Use bold, highly legible typography with clear hierarchy and **tabular figures** so numbers do not jitter between frames:

- the headline number — largest element on the beat
- instrument name and symbol
- signed change and percent
- one-clause catalyst line
- source credit and as-of stamp

### Market components

Build these as reusable paper components rather than one-off layouts:

- **ticker ribbon** — folded strip of symbols and percent moves, used in the intro
- **price card** — name, level, signed change, percent, arrow
- **candle strip** — last 20–30 sessions of folded-paper candles, no more than one beat per episode
- **comparison bars** — two to five instruments, sized honestly to the numbers
- **sector heat strip** — sector tiles tinted by percent move
- **flow bars** — FII and DII net buy/sell as mirrored paper bars
- **news desk** — the fixed red anchor desk Ren stands behind, in `assets/props/news-desk/`

Charts must be plotted from the actual numbers in the ledger, with the axis labelled and the scale stated. A chart that exaggerates a 0.2% move into a cliff is a factual error, not a design choice.

### The news desk

The desk is the show's fixed furniture: every beat, every episode, in front of Ren and behind nothing. It is folded paper, not a glossy prop — the asset is drawn in the same faceted style as the rest of the frame. It is scenery, not a data surface, so no text, price or ticker ever goes on it.

**It is placed from Ren's body, not from the canvas.** On the 1080x1920 canvas with Ren's default box:

| Property | Value | Note |
| --- | --- | --- |
| width | 540px (50% of canvas width) | usable range 40–58% |
| height | 155px | asset aspect 800x229, about 3.49:1 |
| **x** | **570** | Ren's centre (840) − width/2, clamped at the caption column |
| **y (rim)** | **1690** | 110px above Ren's `bottom_y` (1800) — the desk top sits at his mid-torso |
| centre | x=840 | Ren's centre, taken from his box |
| bleed | 30px past the right edge | the desk need not be fully visible |
| layer | in front of Ren, behind captions | his hands stay above the rim |

**Both axes are stored, and both can be pinned explicitly.** The scene plan derives x from Ren's centre and y from his `bottom_y`; if the renderer needs literal numbers, set `x_px` and `y_px` and they win. The validator then checks the override against Ren's body on each axis and warns if it drifts more than 12px — so a hard-coded pair cannot quietly end up off his waist. Keep `rim_from_ren_px` between 8% and 25% of his height (40–126px for a 504px-tall Ren).

Get the numbers for any configuration with `python scripts/prepare_desk.py --canvas 1080x1920 --ren-bottom 1800 --rim-from-ren 110`, or force a pair with `--x-px 570 --y-px 1690`. Add `--guide guide.png` to render a canvas gridded every 100px with Ren's box in red and the desk in blue — the fastest way to see whether the two agree in your own renderer.

Keep the width between 40% and 58% of canvas width. Smaller floats under him and stops reading as furniture; wider than 58% pushes too much of it off-frame and starts to look like a red wall. Do not recolour it, crop it from the bottom, or scale it per beat — a desk that changes size between beats looks like a mistake.

### Transition language

Prefer fold-based transitions:

- paper flap reveal
- triangular wipe
- fold-open headline ribbon
- card collapse into the next beat
- chart unfold / bar rise

### Screenshot treatment

- Use real screenshots inside stylised frames — exchange pages, broker terminals, reputable market outlets.
- Blur or crop account names, holdings and any personal data before use.
- Keep the chart readable enough to establish authenticity.
- Add the source credit on screen when appropriate.
- Do not distort screenshots so much that the instrument or the scale is lost.

## Environment Compatibility

This skill is intentionally compatible with environments that do **not** provide a Remotion plugin.

### Preferred toolchain order

1. Existing native Cowork video or animation workflow
2. Browser-rendered HTML/SVG/CSS scenes
3. Canvas/SVG still or frame rendering
4. FFmpeg assembly and encoding

Use Remotion only if it is independently available; it is **not** required by this skill.

When rendering HTML/SVG scenes with headless Chromium in restricted sandboxes (where Playwright is unavailable or `file://` URLs are blocked by policy), inject the self-contained stage HTML into `about:blank` via Chrome DevTools Protocol (`Page.setDocumentContent`), step frames with `window.setFrame(f)` across parallel worker chunks, and concatenate + mux with FFmpeg.

## Output Pattern

When producing an episode plan, use this structure unless a stronger project-specific format is required:

```markdown
# [Market recap title] — [date]

## Editorial brief
- Session: post-close / pre-market
- Market: NSE / BSE, India
- Target platform and audience
- Duration target and beat count
- Tone

## Market snapshot
- Nifty 50: [level] ([±points], [±%]) as of [HH:MM IST]
- Sensex: [level] ([±points], [±%])
- Advance/decline, India VIX, FII/DII flows

## Beat lineup
1. [Beat] — [instrument] — [number] — [source]
2. ...

## Timing plan
- Intro: 0:00–0:03
- Beat 1: 0:03–0:08.2
- ...
- Outro: 0:55–1:00

## Visual system notes
- Masthead: MARKET WITH REN, dateline with the session word
- Background, price card, chart type, news desk, Ren behaviour, captions, as-of stamp

## Deliverables
- MP4, source files, captions, price ledger, chart data, disclaimer text for the publishing copy
```

## Resources

### references/
- `references/workflow.md` — expanded market workflow, session rules and decision points
- `references/visual-spec.md` — origami style system, market components and layout rules
- `references/source-and-qc.md` — price ledger expectations and the market QA checklist
- `references/ren-quickref.md` — fast guide to Ren presets and usage
- `references/prompt-templates.md` — ready-to-use prompts and instruction blocks

### scripts/
- `scripts/init_episode.py` — scaffold a new episode directory with the market schema
- `scripts/validate_episode.py` — check files, fields, prices, timings and Ren preset names; add `--strict` before a final export
- `scripts/build_speech_cues.py` — turn measured narration line timings into Ren `speech` cues (scene-local seconds, ordered, non-overlapping); `--check` an existing cue file before export
- `scripts/prepare_desk.py` — extract the news-desk raster from the bundled SVG and print its exact placement box for any canvas

### assets/
- `assets/ren-character-engine/` — code-based Ren engine and previews
- `assets/props/news-desk/` — the red anchor desk (self-contained SVG) and its geometry rules
- `assets/templates/episode-template/` — starter files for market episode planning

## Example Requests

- "Make today's 60-second Nifty and Sensex close recap in the origami Ren style."
- "Top five gainers and losers today as a vertical short, with Ren in the lower-right."
- "Explain why the banks dragged the index today — 60 seconds, origami style, no advice."
- "Build the pre-market brief for tomorrow: GIFT Nifty, US close, earnings on the calendar."
- "Turn this price ledger into an origami market video without using Remotion."