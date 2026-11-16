# Developer review package — round9

- Card: `549aad55-ef02-4222-a004-0df05ae01ca1` (dask).
- Outcome: **ready_for_review**, local-only intermediate package; no equivalence or reviewer approval claim.
- Branch: `openclaw/dask-org-astro-developer`; exact signed SHA is in the final handoff. Parent implementation: `44a530564e490fadc235898414ed732f276a1976`.
- Main remains sole coordinator, tester relay, integration and completion owner. Main/card were not changed. No remote/fetch/push/PR/deployment/CI, live submission, new runtime dependency or backend work.

## Explicit responses to independent round8 findings

### R8-1 — copy papers and hero rhythm

Implemented explicit decorative copy sheets independently from text tracks in `copy-papers.css`, plus real Help/Learn/Support/sponsor frames in their component owners. This covers the observed hero, workload headline/menu/content, Install/Learn, Help/Support, sponsor/organization introduction and Brand Logos/Typography/palette copy roles. Sheets use the observed RGB and responsive insets; palette sheets inherit the selected color. They do not clip foreground, stretch paragraphs or substitute a broad opaque section overlay. The source Typography sheet's fixed40px sticky inset and phone intrinsic text height are retained rather than blindly scaling a rectangle.

Corrected actual Hero/Install heading/body widths, source-sized paragraph spacing and compact-tier subtitle geometry, including the original responsive outline widths. Inspection also revealed that reused public Hero art had incorrect size/position/cropping: Powered By phone/tablet and Brand tablet now match the measured image rectangles and actual cover/position behavior. Source-backed tests cover both image bounds and real fitting, not only outer wrappers.

### R8-2 — homepage performance/cost and workload copy

`performance.css` now owns copy/code/gauge tracks, artwork frames, typography and ticker layout, removed from the home/illustration override chains. At768–991 Rows/Cost are full-width stacked panels with the original fixed-pixel inner labels/digits and source-sized fluid padding. Corrected machine/human copy, emphasis, inline link line-box behavior, source paragraph spacing and the real human terminal font/insets/bar styling. The source992px Cost paper extends outside the viewport; the native grid matches its **visible** paint while remaining structurally within the viewport (no document overflow mask).

Corrected actual workload title/menu/button geometry and all-label600 emphasis, paragraph rhythm, landscape partner-logo sizes/spacing and terminal flow. The landscape hero headline's collapsed child margin had shifted subsequent content; containing that margin fixes the real flow rather than moving the background or compensating the page height. The desktop home introduction now flows intrinsically with its measured gutter.

### R8-3 — Help phone/tablet composition

`get-help.css` owns source-sized copy tracks, icons, H3/body spacing, paper frames and responsive source link sizes. All four text regions' heading/body rendered-line arrays match at all ten requested widths. Source-sized intrinsic/aspect frames retain the observed centering when line count changes near a breakpoint, with visible overflow rather than text clipping. No fixed Help section height is used.

### R8-4 — Learn cards and actual artwork paint

`learn.css` owns all five cards, typography, heading/body/CTA tracks and three public artwork boxes. Card CTA rows respect min-content plus the observed gap, including the source's overflowing tall descriptions; they do not overlap merely to preserve an arbitrary height. Restored every card's actual decorative divider. Phone artwork uses a genuine flexible column with intrinsic minimum sizes, reproducing the479px top-image shrink without an endpoint pixel cap.

Critically, visual inspection caught a false-positive outer-box match: the tablet middle SVG was letterboxed inside its correct rectangle. Corrected the actual source `cover`/right-center paint, with `contain` on phones/landscape and the observed desktop behavior. All ten widths now assert both element rectangles **and** actual object-fit/position/dividers.

### R8-5 — sponsor flow and typography

Separated sponsor media, divider and copy into component roles; restored all four logos, title/description font sizes/line heights and per-card phone flow. Landscape first-card shrink-to-fit, two-column row rhythm and tablet/desktop frames retain the observed behavior. All four cards' rendered copy arrays, logo/divider bounds and title/body positions are source-backed at all ten widths. External destinations are unchanged.

### R8-6 — shared footer papers/separators

One `Footer.astro` plus `footer-papers.css` implements logo, all four heading/text groups, social and copyright sheets, and independent source-sized separators. Text/layout still belong to the shared chrome owner. Corrected fluid footer logo sizing, desktop gap at992, fractional separator flow and the landscape copyright/paper padding. Paper RGB is `#33363d`; grid remains visible in gutters. Source-backed geometry/color checks explicitly cover all six routes × all ten widths, not just one shared screenshot.

## Evidence and measurements

All requested widths: **390/479/480/601/767/768/769/991/992/1440**.

- `round9/reference.json`:60 fresh read-only, font-ready, fully traversed original page/width records; actual DOM Range ink, line arrays, paper/color and image bounds. `round9/local.json` is the corresponding native inventory.
- `round9/reference-learn-paint.json`: all50 dividers and all30 original image fitting states.
- `round9/reference-hero-paint.json`: original hero image fitting/visibility by responsive tier.
- `round9/checks.json`:229 focused groups, including370 exact copy-line arrays, actual ink/CTA/image/divider bounds, all60 paper/footer route-width cases, palette selection and final painted pixels.
- Measured card/support copy/CTA maximum error: **0.25px**; reused Learn/sponsor artwork/divider bound error: **0.25px**. Hero/Install actual ink maximum: **1.265625px** (separately reported, not folded into the card metric).
- Target performance paragraph/viewport-visible ticker bound maximum: **0.609375px**.
- `round9/surfaces.json`: measured sheet/separator coordinates and RGB. Largest boundary error **0.89304px**. `round9/measurements-summary.json` records scope separately.
- Actual final-pixel checks found1210 solid source-colored paper samples in the18 canonical route-width screenshots; these are not only CSS declarations.
- `round9/gallery.html`, `pair-<route>-<width>.png`, `reference/`, `local/`, `diff/`, `capture.json`, `comparison.json`: all18 canonical full-page pairs at390/768/1440, all fully traversed.
- Inspected all18 route tops and all18 route footers (`top-all-*.png`, `footer-all-*.png`), plus full-page overview pairs, performance/Learn/sponsor/Support detail pairs and the retained cases/quotes/Tone/press detail strips. Inspection caught and led to fixes for missing Learn dividers, wrong real SVG paint and hero illustration size/cropping.

`round9/reference-human-phases.json` records an original phone layout change after the typing observer activates:329.42→350.94→329.42px. This is reproducible animation-dependent geometry, not a static source width. `reference-quiet-human.json` records an unaltered quiet phase for static comparison; the original was not frozen or edited.

## Verification

Final build:PASS (six core routes plus404). Focused suite:229 passed/0 failed. Full runner: **70 passed/0 failed**; final result is recorded in `round9/tests.log` and `round9/regressions/outer-results.json`; nested focused counts are **not additive**. Format, diff integrity and dependency-audit evidence are alongside them. No backend call is made by the tests. Accepted Tone90 paragraph arrays/papers and rail states remain in the full runner.

## Honest remaining limits

- **Exact equivalence is not certified.** Independently authored dashboard/gauge/rolling-digit and rail contours still have static drawing, spacing and raster differences. Their unsynchronized task distributions, typing and timings are not bit-identical to the original. The human terminal matches measured frame/type behavior, but a timed screenshot need not contain the same partial code.
- The original phone human-copy track transiently grows during typing. Native retains the stable quiet layout rather than deliberately reproducing that transient overflow. This is a known behavior difference, supported by phase measurements, not dismissed as antialias noise.
- Hero/Install ink can differ by up to1.265625px; paper/separator bounds by up to0.89304px. Non-target typography/specimen/organization details and some grid/contour/raster differences remain visible. The full-page comparison records them; a low pixel percentage or similar page height is not acceptance.
- At992, the original counter extends beyond the viewport. Native preserves viewport-visible paint without intentionally extending the document; off-viewport element width is therefore not identical.
- Native focus rings and the safe local form notice/Not sent result intentionally differ from a live delivery workflow. Backends, redirect destinations, all third-party/download payloads, Safari/Firefox and physical devices remain unverified. Pending redirects are not guessed.

## Reproduce and integrate locally

See root `README.md` for `npm ci`, Chromium setup, dev/preview, build, full tests and individual evidence commands. `BASE_URL=http://127.0.0.1:4321` reuses an existing static preview; `npm test` without it starts/stops its own4322 preview. Reference tools allow GET/HEAD only.

After main obtains the same independent tester's approval of the **new exact SHA**, shared Git objects permit `git show <SHA>` or a local fast-forward from the main checkout with no fetch/network. Do not integrate/publish based on an older approval. The developer's final handoff records the exact signed SHA, clean status and stopped owned server. Main owns integration and Workboard reconciliation.
