# Origami Market Video Workflow

## Goal

Produce a repeatable, code-rendered 60-second stock-market recap with Ren as the anchor, real prices as the content, and a folded-paper visual world.

## Operating sequence

1. Confirm the session: post-close recap, pre-market brief, or weekly wrap.
2. Collect and timestamp the day's market data.
3. Select the beat lineup.
4. Draft script and timing.
5. Build the scene plan with instruments and charts.
6. Render Ren overlays, price cards and market components.
7. Assemble scenes.
8. Add narration and captions.
9. Run QA, including the number check.
10. Export deliverables with the price ledger.

## Core constraints

- Do not rely on a Remotion plugin.
- Use code-rendered assets rather than generative video.
- Every number is sourced, timestamped and traceable to the ledger.
- Keep real chart or exchange screenshots authentic, and blur personal data.
- Preserve Ren's identity.
- Maintain a unified origami art direction.
- Never give investment advice.

## Editorial defaults

- Format: vertical 9:16, 1080x1920
- Frame rate: 30 fps
- Duration: 60 seconds
- Count: 10 beats
- Intro / body / outro: 4s / 51s / 5s
- Audio: one male English voice, music bed only — no transition sound effects
- Export: H.264 MP4, yuv420p, AAC 48 kHz
- Coverage: NSE and BSE first, global as context
- Show: MARKET WITH REN — fixed masthead, dateline carries the session word
- Disclaimer: publishing copy only (description and pinned comment), never on screen
- Tone: premium, concise, factual, unexcited

## Session rules

| Session | Window (IST) | What the episode is |
| --- | --- | --- |
| Pre-open | 09:00–09:15 | GIFT Nifty, overnight US and Asia, the day's calendar |
| Regular | 09:15–15:30 | Intraday numbers only if labelled; usually avoid |
| Post-close | after 15:30 | Official closes, full recap — the default mode |

Markets are shut on weekends and exchange holidays. On those days, either skip the episode or make it explicitly a weekly wrap — never dress last Friday's numbers as today's.

## Data collection checklist

Collect before scripting:

- Nifty 50 and Sensex: level, points change, percent change, close
- Sector indices: Bank, IT, Auto, FMCG, Metal, Pharma, Realty, Energy, PSU Bank
- Top gainers and losers with percent and, where available, volume
- NSE advance/decline count
- FII and DII net flows in ₹ crore
- USD/INR, Brent crude, gold, India VIX
- Global: US close, major Asian indices, GIFT Nifty
- Next session's earnings and macro calendar

For each item record: instrument type, name, symbol, exchange, value, absolute change, percent change, `as_of`, session, source name, source URL, screenshot path, catalyst, confidence note.

## Decision rules

### If two sources disagree

Prefer the exchange (NSE or BSE) figure. Record both in the ledger with a confidence note. If the gap is large enough to change the sentence, say "reported at" rather than picking silently.

### If the data is incomplete

Drop the beat or state that the figure was unavailable at recording time. Never estimate, interpolate or carry yesterday's number forward. A 9-beat episode is fine; an invented number is not.

### If the day was flat

Deepen fewer beats: the driver, one or two movers, flows, and what to watch. Do not pad with non-market filler to reach ten.

### If the day was extreme

A crash or a record high needs a calmer, more factual script, not more drama. Keep Ren restrained (`serious`, `alert`, `concerned`), keep the numbers exact, and avoid superlatives that will age badly by the next session.

### If the user asks what to buy

Explain that the format reports the market rather than advising on it, then offer the factual version: what moved, why, and what is scheduled.

### If the environment lacks automation features

Create the plan and asset instructions first, use simple HTML/SVG or still-frame workflows, and keep the package easy to hand off.

## When updating an existing episode

If the task is to refresh an episode:

- preserve the established layout and motion language,
- replace only the numbers and beats that changed,
- re-timestamp every `as_of`,
- keep beat numbering and timing synchronised,
- rerun the validator and the number check on every edited scene.
