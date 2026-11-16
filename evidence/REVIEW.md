# Round12 local review package

Card: **549aad55-ef02-4222-a004-0df05ae01ca1**
Repository: Dask.org native Astro rebuild, six core pages.
Branch: `openclaw/dask-org-astro-developer`
Base: signed round11 `b85dbd8e070eea745275c017873bc73a1c86ca00`.
Outcome: **ready_for_review**. All final gates passed; the exact signed SHA is in the handoff.

Main remains sole coordinator, tester relay, integration and completion owner. Same retained independent tester must review this new exact SHA. Local only: no fetch, remote, push, PR, deployment, CI/auth changes, live submissions, helpers or card/main mutation. Original browser requests are GET/HEAD-only. No Webflow implementation, runtime or generated styles/scripts are included in the native project.

## R11-1 — physical deployment-switch reversal

The overlapping semantic tabs now give the **inactive tab** the foreground hit area. The decorative switch is still non-interactive markup inside the existing tab, not a nested button or a second competing semantic control. Both label clicks and tablist keyboard behavior remain unchanged. Phone/landscape non-switch controls are unchanged.

`round12-source-switch.mjs` freshly verifies the original at768/769/991/992/1100/1440, starting in either state. The native gate clicks the **same fixed physical switch-center point four times**, starting in each state, checks `elementFromPoint` resolves to the other tab, selected panel and Documentation destination after every hit. Twelve native sequences/48 center clicks; twelve independently captured original sequences. Accepted deployment frame, dots, code, logos and action tracks remain covered by round11's22-state gate.

## R11-2 — Dig Deeper's actual surfaces and intrinsic composition

`deeper.css` owns the component. Removed the old fixed section height/min-height rules and scattered Deeper overrides from `get-started.css`. Markup now separates an upper **#33363D** copy/art grid and a full-width lower **#262326** resource band.

Desktop/tablet copy spans three real columns, with the fourth containing the original artwork. The image's observed frame/margin reserves the upper region's extent; the copy is centered against it. Phone/landscape use real stacked copy, margins, grid gap and centered29vw artwork. The lower band has the observed fixed parent inline line box, fluid link type, responsive five-column/two-column/single-column tracks and gaps. There is no page/section-height compensation or overflow masking.

The SVG retains its own viewBox aspect handling. A second CSS `object-fit:contain` introduced an extra2px letterbox in a1100px diagnostic; using the original viewport-fitting mode restores the measured **actual colored artwork bounds**, including the tall tablet frame, rather than merely equating `<img>` rectangles. Eleven live native screenshot tests sample both solid background bands and compare actual colored-ink bounds with fresh original captures.

All eleven widths390/479/480/601/767/768/769/991/992/1100/1440 compare upper/band/heading/body/art boxes and every resource anchor, actual type/weight/line-height, exact rendered lines and destinations. Scoped rectangle maximum: **0.03125px**.

## R11-3 — palette foreground paint, guidance and intrinsic copy/action flow

The copy sheets remain present. Foreground swatches now own an explicit stacking layer **above the decorative sheet in every tier**, fixing both reported landscape occlusion and a479px edge case exposed by real paint tests. The selected cell paints the selected pane's solid color rather than exposing background-grid dots through an otherwise transparent hole. Copy paper and selected pane colors continue updating together. The settled selected label becomes transparent for every color, including Green; the old green-only white-text override is now limited to non-selected cells. Fresh original settled-state evidence is retained in `source-selected-treatment.json`.

Landscape guidance now uses its actual source text track, paragraph/title/metadata margins and Copy→matrix spacing, not the former narrow paragraph max-width. Every swatch track is compared by hex identity, not source/native DOM order. The768–991 logo-guidance copy now has the observed width and actual paragraph font/line-height/margins, preserving its nine-line text arrays. Tablet palette cells remain unchanged. Desktop palette tracks/intro rhythm are also corrected against freshly measured originals.

Real screenshots verify **all12 cell backgrounds and visible non-selected labels at all11 widths**. All12 selections and clipboard are exercised at every width, restoring Salmon. At479/480/601/767/768, every selection also samples **all12 actual cell paints** (720 additional pixel assertions), so changing the paper color cannot silently re-cover another swatch.

Current scoped palette box maximum: **0.125px**; tablet logo-guidance maximum **0.609375px** (horizontal alignment; exact line arrays preserved). Round5's992px *native-only* boundary snapshot was superseded with the fresh original geometry, retaining its strict0.02px x/width/height tolerance. Its original-backed tablet checks and767 boundary protection were not relaxed. Tone90 paragraphs, specimens and sticky rail checks remain unchanged.

## R11-4 — distinct Pandas identities and actual workload tracks

The two artworks now have unambiguous local paths and independent source-manifest entries:

- Hero gray `/assets/Pandas_logo-gray.svg`, original source suffix `66281656453c4b8c508022ec_Pandas_logo.svg`; SHA256 `dec76ba8f680b191f3d9fb1d066395e7048d421981f45f0ded316b4312d90dc4`.
- Testimonial colored `/assets/Pandas_logo-color.svg`, suffix `66326000a3b83d7c243efd47_Pandas_logo.svg`; SHA256 `5a2dbb218525973760e4c25ba016d7ea0649ad77ed3235ed7e31569b20c6e5d3`.

Removed the ambiguous public file. Resolver lookup is **exact path/basename**, rejecting missing or ambiguous identities instead of accepting the first substring match. Full manifest path uniqueness, both exact byte hashes, actual served hero/testimonial identities and actual hero opacity/filter are asserted. Every workload image is checked against its **full original source URL including the asset hash**, not a hash-stripped basename. Original gray artwork no longer suffers a second grayscale/opacity/brightness transformation.

`workloads.css` owns the workload bank's separate text/action/partner tracks. Restored desktop text fraction/insets, tablet secondary CTA15.1603px/15.1603px type and actual primary-action geometry, source body widths, intrinsic partner sizes/pitch and landscape full-width four-logo ML row. Corrected phone Big Arrays' source single-line secondary action without document overflow, primary ink color and real single-border secondary underlines. Deployment's independently accepted styles/URLs are unchanged.

A visual inspection also exposed an inherited phone-sized landscape terminal and oversized tablet dots. The bank now owns its actual responsive window/bar/dot/code roles via CSS variables. All44 terminal states compare frame/bar/dot/source-code rectangles and exact source-line arrays. Phone terminal height follows its real code: Parallel For Loops no longer loses its last lines to a fixed-height phone box. Empty partner strips collapse on phones and retain the observed landscape media track. The desktop/tablet demo viewports retain their measured media ratios, not a page-height spacer. Selected-tab hover stays white; inactive hover is the original yellow, verified against fresh settled source hover states.

The **current original exposes four workload tabs**, not five: Big Pandas, Parallel For Loops, Big Arrays and Machine Learning. All four are captured and checked at all11 widths (44 selected states,110 actual image identities). No extra state was invented. Both deployment states additionally retain the existing22-state and new physical-hit checks. All scoped workload text/action/logo boxes differ by at most **0.34375px** in the expanded focused run; final maxima are recorded in `checks.json`.

## Verification and reproducibility

Final frozen verification: **build passed (7 routes);74 full regression groups passed,0 failed;215 focused groups passed,0 failed;311 exact text-line arrays;110 full-identity workload images;39 interaction/paint/identity groups;720 additional selected-state RGB samples;11 actual Deeper paint/fitting cases.** Formatting/whitespace passed; audit:0 vulnerabilities. Native layout/data/style implementation stayed frozen throughout the final full run.

All18 canonical pairs were visually inspected as complete page-strip comparisons; all44 workload-state pairs were inspected, with neutral-pointer snapshots and a separate explicit hover gate. Focused Deeper/palette pairs and all11 paint tiers were inspected/tested separately. This does not certify unmeasured vector contours or cross-engine behavior.

Final authoritative logs/results live in `evidence/round12/`:

- `build.log`, `tests.log`, `format.log`, `audit.json` — final gates (read exact outcomes below/in handoff).
- `checks.json`: focused geometry/type/identity gate; `interactions.json`: hit targets, actual pixels, labels, clipboard and selection samples; `deeper-paint.json`: actual band colors and SVG colored-ink bounds.
- `reference.json` / `local.json`: fresh component/state rectangles, exact rendered text-line arrays, computed type/paint and full artwork URLs.
- `source-switch.json`: fresh read-only original fixed-center click sequences.
- `gallery.html` / `comparison.json`: all18 canonical page pairs; `states.html`: all66 focused pairs across11 widths. Native reduced-motion states are explicit; original motion is not synchronized.
- `iterations/`: retained failed/intermediate diagnostics, not final acceptance results. `regressions/`: current run's generated historical regression results, without rewriting previous rounds' committed snapshots.

```sh
npm ci
npm run build
npm run preview -- --port 4321
# another terminal, same checkout:
BASE_URL=http://127.0.0.1:4321 npm test
npm run format:check
npm audit
# Explicit refresh (GET/HEAD-only source):
REFERENCE=1 CAPTURES=1 node scripts/round12-probe.mjs
node scripts/round12-source-switch.mjs
node scripts/round12-source-treatment.mjs
CAPTURES=1 node scripts/round12-probe.mjs
node scripts/round12-checks.mjs
node scripts/round12-gallery.mjs
EVIDENCE_DIR=evidence/round12 WIDTHS=390,768,1440 node scripts/round6-capture.mjs
EVIDENCE_DIR=evidence/round12 node scripts/round6-compare.mjs
```

## Candid remaining limits — not exact equivalence

- Native SVG gauge/rail/Explore internal contours and some grid/dot phase/paint edges still differ. No claim that element-bound checks prove identical internal vector contours.
- Landscape palette's intrinsic trailing region differs from the original pane's reserved background extent: rounded focused capture heights differ by +24/+12/−3px at480/601/767 (`capture-height-inventory.json`). Its guidance, actions and all swatch rectangles/paints are measured separately and now match; no fixed section height or compensating bottom spacer was introduced to conceal the tail discrepancy. See final capture-height inventory.
- Tablet logo-guidance horizontal offset remains at most0.61px. Prior small Use Cases767 width−4.25px /991 height+1.625px, Explore boundary1–3px and Press underline quantization remain documented; they are not declared identical.
- Unsynchronized typing/counter/gauge phases are separate from these static limitations. Existing normal-motion token/newline/needle/phone-wrapping tests remain required.
- Truthful local “Not sent” forms intentionally do not emulate production backends. Blog/event redirect destinations remain explicitly pending, unguessed.
- The legacy320px specimen-overlap warning was checked against the current original: first-row ink overlap6.109375px original versus6.125px native (`320-specimen-diagnostic.json`). It is not a new native-only document overflow; the original narrow composition itself overlaps there.
- Chromium on this host only; no universal browser/device/accessibility or pixel-equivalence certification. Whole-page pixel percentages/heights are diagnostics, not acceptance criteria.

Same independent tester must review the signed exact SHA before main integration. Main/card/publication remain untouched.
