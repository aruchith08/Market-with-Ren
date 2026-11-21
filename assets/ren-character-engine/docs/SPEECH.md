# Mouth animation: shapes are not speech recognition

The fourteen drawings are useful mouth-shape presets, often called visemes. They
provide the visual vocabulary; they do not infer a pronunciation from an audio file.
Use timings from an external aligner, your narration provider when available, or
manually reviewed timings. Do not label arbitrary cycling as accurate lip-sync.

| Shape | Visual purpose |
| --- | --- |
| rest | Closed resting line, with emotional smile/frown |
| MBP | Closed lip contact for m/b/p-like closure |
| small / medium | Generic small and medium openings |
| AA | Broad open vowel |
| EE | Wide, narrow opening with visible teeth |
| OH | Tall rounded opening |
| OO | Small rounded/pursed opening |
| FV | Upper teeth contacting lower-lip region |
| L | Tongue raised inside an open mouth |
| TH | Tongue near the front teeth |
| CH | Narrow teeth-visible consonant shape |
| smile | Open smile |
| teeth | Clenched teeth reaction |

These are stylized approximations, not a complete anatomical phoneme inventory.
A phoneme-to-viseme mapping can vary by language and narration style.

Provide cues as `{start, end, mouth}` in seconds. The engine interpolates into each
shape over up to 45 ms and closes during silence. It does not change the recorded
voice speed. Emotions and speech remain separate channels. Use `speech: []` to
silence a character even when its emotion normally has an open mouth.

For reading the news, avoid exaggerated mouth widths or constant head motion.
Preview at the actual on-screen anchor size; a shape visible at 1000 px may be
hard to distinguish at 300 px. Neither the example timeline nor the included MP4
contains real narration; they demonstrate the controls only.
