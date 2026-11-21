# Verification record

## Executed here

- `node tests/test.js`: 91 checks passed, including 280 emotion/mouth and 200
  emotion/view/facing combinations (480 combination renders).
- Every catalogue state and isolated mouth/eye asset produced structurally checked SVG.
- Checks reject duplicate SVG IDs, missing gradient/clip references, non-finite
  coordinates, raster image elements and external asset references.
- Identical arguments return byte-identical SVG; out-of-order frame requests are
  reproducible. Static mode is actually static. Speech and emotion are independent.
- Invalid preset names, malformed fields, overlapping speech and unsorted acting
  cues produce errors. All three JSON examples pass validation.
- The standalone studio's HTML content was loaded into Chromium and tested:
  controls, timeline, invalid JSON handling, no JavaScript errors and no network requests.
- Five contact sheets were generated from the JavaScript and visually inspected.
- A 10-second, 150-frame silent H.264 demo was actually rendered and encoded:
  540 x 568, 15 fps. This is a character proof, not a final 1080x1920 news video.
- MP4 frames were extracted at 0, 1.8, 3.9, 5.9, 7.8 and 9.3 seconds for inspection.
- Transparent PNG output was exported and alpha-channel bounds were checked.

The command-line SVG tools were tested with Node v22.16.0. Raster/video export
used this container's system Chromium, Python Playwright and FFmpeg. The tests
were not run inside the user's Sarvam Cowork account or with a specific small LLM.

## Limits of verification

The sandbox's administrative policy blocks direct file:// navigation. The studio
was tested by supplying its self-contained HTML to Chromium with Playwright
`set_content`, without changing that policy. A standard browser or local web server
can consume the same HTML. Managed browser restrictions may differ.

Automated checks establish runtime correctness and consistency, not artistic
approval, perfect anatomical realism or accurate speech alignment. The side/back
views are simplified resting drawings. A JSON schema cannot verify story accuracy
or whether the chosen emotion is appropriate for a news topic.

A first long combined sheet-and-video export exceeded the tool execution window;
the included demo was subsequently exported successfully in a separate render.
Full-detail SVG filters are more expensive than `detail: "draft"`. The final MP4
was verified with ffprobe; exact properties are in `tests/video-probe.json`.

For a repeatable production pipeline, keep the renderer and browser versions fixed,
review at the actual on-screen anchor size, and inspect speech cues against the audio.
