# Dask.org — native Astro core site

Independent Astro implementation of the six core Dask pages: `/`, `/get-started`, `/get-help`, `/powered-by`, `/brand-guide`, `/press-mentions`. This is a **local review implementation, not a deployed site or an exact visual-match claim**.

## Run and verify

Node 22.12+ (verified with Node 24.22.1), npm, and Chromium for Playwright:

```sh
npm ci
npx playwright install chromium # first setup only; use --with-deps if your OS needs it
npm run dev -- --port 4321
# http://127.0.0.1:4321
```

In another terminal:

```sh
npm run build
npm test             # starts/stops a production preview on 127.0.0.1:4322
npm run format:check
npm audit
npm run preview -- --port 4321
```

The test runner makes **no live form submissions**. It starts a production preview, checks the original60 behavior groups, then runs the round2–9 regression suites against that same preview. Focused coverage includes every route at 320/360/390/599/600/601/767/768/990/991/992/993/1099/1100/1101/1440/1599/1600/1601 pixels; visible per-state action labels **and destinations**; persistent brand navigation/active sections/anchor offsets; palette ordering/icons; and all three stacked mobile forms with blocked mutations and truthful Not sent results. Local assets, JS errors, keyboard interactions, logo/palette variants and clipboard copying remain covered. `BASE_URL` can target an already running local server instead of launching preview.

## Edit the site

- `src/layouts/Site.astro`: shared document metadata, header, footer and dialogs.
- `src/components/`: header, footer, hero, support strip, terminal, workload panel and independently drawn icons.
- `src/data/site.ts`: shared destinations, learning resources, sponsor/company/project lists and palette.
- `src/data/home.ts`, `quotes.json`, `cases.json`, `press.json`: editable home and press content.
- `src/pages/`: native Astro page composition and page-specific editorial copy. No component framework or client hydration.
- `src/styles/global.css`: shared tokens, resets, grid backgrounds, hero/terminal/tab primitives. Shared Support frames and copy belong to `support.css`.
- `src/styles/chrome.css`: header/navigation, footer and native submission drawer.
- `src/styles/{home,brand,get-started,get-help,powered-by,press-mentions}.css`: route-owned base and breakpoint rules, imported after `Site` by that route only. `illustrations.css` owns the native dashboard and animation keyframes; `performance.css` owns the gauge/code/counter frames and copy. `learn.css` owns Learn cards/artwork; `support.css` owns shared Support; `copy-papers.css` and `footer-papers.css` define explicit decorative sheets independently of text tracks. There is no refinement stylesheet or page-level style pile: edit the existing selector in its owning base/desktop/tablet/landscape-phone/phone tier rather than appending overrides. Some deliberately generous sections preserve reference whitespace.
- `src/scripts/site.ts`: small native browser interactions; keyboard tab navigation, Escape dismissal, clipboard, form preview, and reduced-motion-aware terminal illustrations.

Use `npm run format` after edits. Repeated structure/content is component- or data-driven. The homepage dashboard, MEMORY/CPU gauges and automatic rolling counter are independently authored HTML/CSS/SVG, not screenshots of the old site. Terminal examples are ordinary text and locally highlighted code. No animation JSON, Webflow generated CSS/JS, jQuery, Webflow library, or third-party client runtime is included.

## Artwork and provenance

`src/data/assets.json` records the original public URL and local path for each downloaded artwork/typeface. All runtime assets are served locally under `public/assets/`; the website does not depend on the former hosting service. `scripts/assets.mjs` refreshes **only listed original artwork/fonts**, never source page CSS/JS. Logos and quotes remain the property/words of their respective owners. The Dask logo/typeface downloads preserve their observed external destinations.

Reference evidence is stored separately under `evidence/reference/`. Reference DOM/computed-style observations are **inspection evidence**, not source implementations or production inputs. The implementation does not render or replay saved DOM or screenshots.

## Backend-dependent UI (not connected)

The event/newsletter/news forms preserve the observed field sets and side-panel structure but use a native accessible `<dialog>`. Their submit handler always prevents transmission and explicitly reports **Not sent**. A visible local-preview notice explains the missing service. No success screen is faked, and no captured form token/action is reused. Select a backend, validation/privacy/retention policy and spam controls before enabling submission.

The original "Add us to Dask support" link is a `#` placeholder; it remains a placeholder, rather than inventing a support workflow. GitHub/Discourse and other ordinary outbound links preserve observed destinations. The illustrative adoption count is the captured value, not a claimed live metric; benchmark/cost illustrations are not measurements performed by this site.

## Blog/event redirects: pending, never guessed

`src/data/redirects.json` is the explicit migration register. Blog/event source routes have `destination: null` and `status: "pending"`. **No redirect is emitted for pending entries.** Existing navigation paths are retained; unmatched paths display the explanatory 404 page locally.

When Jacob supplies an authoritative destination, change that entry to `status: "resolved"`, set its exact destination, and run the build. `astro.config.mjs` emits only resolved 301 mappings. Static Astro emits HTML redirect documents; the final host should translate approved mappings to native HTTP 301 rules. No host/adapter/deployment was selected here. Do not invent wildcard path substitutions without an approved mapping.

## Visual evidence and reproduction

With `npm run dev -- --port 4321` running:

```sh
npm run capture       # 18 local full-page captures, page geometry, pixel diffs
npm run capture:states # read-only live inspection + 31 local/reference state comparisons
node scripts/scroll-reference.mjs # complete below-fold artwork capture
REFERENCE_SCROLLED=1 npm run capture
node scripts/round2-checks.mjs # focused checks against the running local server (also included in npm test)
node scripts/round2-motion.mjs # read-only live/native timed art and reduced-motion checks
node scripts/round3-checks.mjs # 72 full-page responsive checks (included in npm test)
node scripts/round3-motion.mjs # complete token cycles and phased gauge visibility (included)
node scripts/round3-art-bounds.mjs # loaded chart/text separation (included)
node scripts/round3-states.mjs # all workload/deployment/install states at 767/768/769/991/992
node scripts/round3-gallery.mjs
node scripts/round3-sections.mjs
node scripts/report.mjs # refresh the current round-6 review summary (saved final results)
```

`BASE_URL=http://127.0.0.1:<port>` overrides the local target. Reference inspection uses GET/HEAD only and blocks mutation methods. `scripts/inspect.mjs`, `details.mjs`, `states.mjs`, `inspect-states.mjs`, and `responsive-details.mjs` retain the bounded reference-capture workflow, including recovery from incomplete captures. They are development evidence tools only. The reference browser uses Node fetch to satisfy Chromium's requests in this environment; it never imports remote code into production.

- `evidence/comparison-scrolled.json`: historical comparison after traversing every reference page to trigger lazy artwork. `comparison.json` retains the initial/unscrolled baseline. Both include per-page dimensions, pixel counts, first-viewport differences and geometry.
- `evidence/local/`, `evidence/reference/`, `evidence/diff/`: historical local/reference/full-page diff screenshots; current whole-page evidence is in `evidence/round9/`.
- `evidence/states/`: screenshots and quantitative differences for workload/deployment/explore tabs, four logo states, twelve palette states, three dialog types, desktop community and tablet/mobile navigation.
- `evidence/tests/results.json`: production-preview assertions and result counts.
- `evidence/round2/checks.json`: focused production-preview regression results.
- `evidence/round2/motion/`: original/native dashboard, gauges and counter at nominal 0/1500/4000 ms after scroll, plus static reduced-motion checks; results include actual capture delays.
- `evidence/round2/local/`: 320/390 overflow evidence, sticky section anchors, empty/filled mobile panels, and original-left/native-right inspection strips.
- `evidence/REVIEW.md`: current developer review summary and explicit finding responses and honest residuals. Earlier B1–B6 responses are retained in Git history.
- `evidence/round3/gallery.html`: current twelve-width page pairs, all seven terminal states at five neighboring widths, and motion evidence.

Pixel comparisons use pixelmatch threshold 0.1 with antialias differences excluded. Full-page images of different heights are padded white; **percent different is not a "percent accurate" or perceptual-quality score**. State comparisons use each corresponding component's bounding box, so the legacy sidebar's presence can contribute to differences. Original animations, lazy-loaded artwork and failed external resources can change the reference frame. Closed-menu baselines were captured in fresh pages because an earlier cross-breakpoint capture left the legacy menu open. Such older captures remain clearly named, not silently treated as the default state.

### Known review gaps

Exact visual equivalence is not established. The independently drawn dashboard streams, MEMORY/CPU gauges and automatic counter now preserve those original content types, geometry and normal/reduced-motion behavior, but their animation curves, task distribution, typing and timing are not bit-identical to the old runtime. Original/native timed captures quantify representative differences, not synchronized animation parity. Small text wrapping, section whitespace, footer and specimen differences remain visible in the full-page comparisons. The palette computes real contrast rather than duplicating incorrect legacy labels. Native focus rings and the mandatory local-form notice intentionally differ.

Chromium retains the 19-width regressions plus full-page geometry/captures at 320/390/479/480/599/600/601/767/768/991/992/1440 on all six routes. Workload/deployment/install states also have 769px comparisons. Complete normal/reduced typing transitions, local SVG pivots and visible yellow needles are tested at 1440/390. Safari/Firefox, physical devices, all outbound/download payloads and real backend integration remain unverified. The independent tester must review the exact committed SHA before human acceptance. See `evidence/REVIEW.md` for measured differences and review boundaries.

## Local integration only

No GitHub repository, remote, push, pull request, deployment, or CI workflow was created. The managed-worktree branch and exact SHA are in the developer handoff. It shares Git objects with the main checkout, so a reviewer can use `git worktree add <review-path> <SHA>` or inspect `git show <SHA>` without networking. The main coordinator owns review routing and Workboard lifecycle; merging remains Jacob's decision.

### Fluid layout ownership

Shared `--design-width` in `src/styles/global.css` is the single fluid-unit basis: 1440 desktop, 768 tablet, 748.8 compact landscape-phone, 390 narrow phone. The landscape basis records observed compact type; it is not an assumed device width. Explicit 480/768/992 tiers own the different layouts. Component lengths use rem, true viewport proportions remain vw/percent, and single-pixel borders remain pixels. This avoids freezing 390/768 measurements into every viewport. Appropriate original grid artwork is selected through shared tokens. Route CSS still owns its own section grids and spacing; no refinements stylesheet or late global homepage pile was introduced.

`src/utils/code.ts` shares safe tokens between Astro and native typing. SVG gauge rotation is explicitly around each local `(0,0)` pivot; reduced-motion preference changes pause it. The original adoption survey chart is static public artwork, source-listed separately from the independently drawn animated homepage gauges.

Astro allows only one preview per checkout. `npm test` starts/stops its own preview; stop an owned preview first or point `BASE_URL` at that existing server. Tests never submit to the live site.

## Historical whole-site review evidence

`evidence/round6/gallery.html` preserves the fully traversed18 route-width pairs and the round6 residual table is retained in Git history. The previously reported390px home/brand/press height gaps became−2/0/−1px. That round's67-group test run and prior independent acceptance are historical, not an exact-fidelity claim or approval of the latest SHA. Current targeted findings/results follow below.

## Historical round 8 — paper surfaces and rail fidelity

`src/styles/tone.css` keeps the accepted text tracks and intrinsic paragraph flow. Decorative paper surfaces now extend through their observed padding; the desktop short sheet follows the observed40% row proportion. These are background paint layers, not content clipping or section-height masks. All90 paragraph line arrays remain equal to the fresh reference.

The brand rail now uses measured control dimensions, spacing, icon boxes and settled active/hover colors. Narrow phones retain80px bars and52px controls, with viewport-relative internal padding; landscape has independent fluid controls. The native brush contour was refined from rendered artwork inspection, not copied SVG paths. Active-section observation and keyboard/anchor behavior are retained.

That historical runner had **69 outer groups**, including ten new paper/rail groups with actual foreground/paper pixel checks, all90 exact paragraph line arrays, all80 paper boundary coordinates and all320 rail control/icon coordinates at390/479/480/601/767/768/769/991/992/1440. Prior geometry, safe forms, all-state actions, palette, motion and overflow suites remain included.

With a local production server on4321:

```sh
node scripts/round8-reference.mjs      # fresh read-only original paper/text evidence
node scripts/round8-rail-reference.mjs # fresh original rail dimensions/crops
node scripts/round8-checks.mjs         # fixture-backed, included in npm test
node scripts/round8-gallery.mjs        # ten viewport-aligned Tone pairs
WIDTHS=390,768,1440 node scripts/round8-capture.mjs # all18 original/native pairs
node scripts/round8-compare.mjs
node scripts/round8-icons.mjs          # 8x rendered contour diagnostics
node scripts/round8-icon-metrics.mjs
node scripts/report.mjs
```

That report remains in Git history. Historical fully traversed18 page comparisons: `evidence/round8/gallery.html`. Focused ten-width paper/rail results: `evidence/round8/checks.json`; Tone pairs: `evidence/round8/tone-gallery.html`. Historical round6/7 evidence stays historical. Exact equivalence is still not certified: independently drawn icon contours, other paper boundaries, tiny upstream text/section offsets and unsynchronized native animation can differ. See the explicit residual inventory in the report. No backend, redirect destination, dependency, deployment or remote publication changed. Main obtains the same tester's verdict on the exact signed SHA before further local integration.

## Historical round9 — six-route static composition

The six independent round8 findings are addressed in the component owners, not by hiding overflow or compensating page heights. Help and Support now use their source-sized paper/copy frames; Learn owns all five cards, dividers and three artwork boxes **including real contain/cover paint**, not only image bounds. Sponsor logo/divider/copy flow is intrinsic. The homepage has source-sized copy/code tracks, fully stacked tablet Rows/Cost, correct shared label emphasis, real workload tab insets and contained landscape headline margins. The source's original off-viewport992px counter edge is matched as visible paint without native document overflow. Footer sheets and separators are shared by all six routes. Palette sheets follow selection. Accepted Tone/rail composition and safe form behavior are retained.

With a built production preview on4321:

```sh
node scripts/round9-reference.mjs #60 fully traversed, read-only original page/width records
node scripts/round9-quiet-human.mjs #observe an unaltered quiet original typing phase
node scripts/round9-learn-paint-reference.mjs #actual source image-fit and every card divider
node scripts/round9-checks.mjs #included in npm test
EVIDENCE_DIR=evidence/round9 WIDTHS=390,768,1440 node scripts/round6-capture.mjs
EVIDENCE_DIR=evidence/round9 node scripts/round6-compare.mjs
node scripts/round9-gallery.mjs
```

The runner has70 outer groups (nested focused counts are not additive). Current evidence/report: `evidence/REVIEW.md`, `evidence/round9/checks.json`, `evidence/round9/surfaces.json`, `evidence/round9/gallery.html` and the original-left/native-right component pairs. The original390px human-copy track changes329.42→350.94→329.42px during typing; `reference-human-phases.json` records that real layout change. Static comparison explicitly selects the observed quiet phase rather than passing off a changing frame as a static defect.

This remains a review candidate, not an exact-equivalence certification. Native dashboard/gauge/counter/rail contours and unsynchronized animation still differ. Real backends, unresolved redirects and browser/device limits remain as documented above. Main obtains the same independent tester's verdict for the new exact signed local SHA before integration.

## Historical round10 — actual specimens, organization banks, press and typing states

Round9's six repairs remain covered. This iteration adds component-owned
`specimens.css`, `organizations.css`, and `closing.css`, removing their older
scattered overrides. Specimens use their **actual rendered** font matrix rather
than the nominal printed labels. Organization artwork has separate media/card
frames and intrinsic rows. Press cards use separate media, separator, and
shrink-wrapped copy tracks. Desktop navigation is fixed16px/24px with70×42px
Docs controls; only the logo remains fluid.

The normal-motion phone human row now derives its width from the currently
rendered native code line plus its real frame insets. It changes copy wrapping
through pandas/Dask states. The performance section provides the same decorative
viewport boundary observed on the original, without clipping copy ink or hiding
document-wide overflow. Reduced motion remains stable. At320px, the original's
fixed40px first specimen reaches6.11px into its next cell; the regression compares
that observed exception explicitly rather than shrinking the font to pass a
false no-collision assertion.

```sh
npm ci
npm run build
npm run preview -- --port 4321
# in another terminal:
node scripts/round10-probe.mjs             # GET/HEAD-only fresh reference geometry
node scripts/round10-press-lines.mjs       # original dividers/window controls
node scripts/round10-checks.mjs            # all eleven responsive widths
node scripts/round10-motion.mjs            # real native cycles + reduced motion
npm test                                  # includes both new regression groups
npm run format:check
npm audit
EVIDENCE_DIR=evidence/round10 WIDTHS=390,768,1440 node scripts/round6-capture.mjs
EVIDENCE_DIR=evidence/round10 node scripts/round6-compare.mjs
node scripts/round10-gallery.mjs
```

Current response/evidence inventory: `evidence/REVIEW.md` and
`evidence/round10/`. `gallery.html` has18 canonical full-page pairs;
`details.html` aligns the changed components. Full-page differences mix static
paint with unsynchronized motion and are not an acceptance score. This remains a
local review candidate, not an exact-equivalence or cross-browser certification.
Main retains integration/completion ownership and sends the exact signed SHA to
the same independent tester before integration. Forms remain truthful local
“Not sent” flows; unresolved redirects remain pending, not guessed.

Round10 frozen verification: **72 outer groups, 193 focused groups, 673 exact text-line arrays; zero failures**. See the review report for bounded geometry errors and remaining differences.

## Round11: Learn flow, Explore states and deployment

Round11 review evidence is in `evidence/round11/` and `evidence/REVIEW.md`.
Landscape Learn now has an in-flow overlapping illustration track: the images
reserve their real extent before Explore. Explore owns its intro, intrinsic
cards, circular tabs, segmented connectors and bounded previous/next actions in
`explore.css`. Deployment has separate selector, logo and terminal ownership in
`deployment.css`; the existing workload banks are not restyled. Its switch is
native CSS, state-driven by the semantic tabs. Phone logo rows preserve artwork
ratios and the original flex behavior rather than equal-width logo caps.

```sh
npm run build
npm run preview -- --port 4321
# In another terminal (references are GET/HEAD-only):
REFERENCE=1 CAPTURES=1 node scripts/round11-probe.mjs
REFERENCE=1 node scripts/round11-ancillary.mjs
CAPTURES=1 node scripts/round11-probe.mjs
node scripts/round11-checks.mjs
npm test
npm run format:check
npm audit
EVIDENCE_DIR=evidence/round11 WIDTHS=390,768,1440 node scripts/round6-capture.mjs
EVIDENCE_DIR=evidence/round11 node scripts/round6-compare.mjs
node scripts/round11-gallery.mjs
```

`states.html` contains all55 selected-state pairs across11 widths. `gallery.html`
contains the18 canonical route pairs. Assertions compare actual copy lines,
fonts, element/ink rectangles, Learn's section boundary, every logo, controls,
arrows, action destinations and keyboard states. An original fixed slider-pane
viewport is not recreated as a fixed native section height: intrinsic action
flow can leave a small1–3px boundary difference, documented in the report.
No exact-equivalence or cross-browser certification is implied.

Round11 frozen verification: **73 outer groups, 178 focused groups, 627 exact text-line arrays; zero failures**. Build, formatting and audit passed (0 vulnerabilities).

## Round12: hit targets, real paint and artwork identity

Current review package: `evidence/REVIEW.md` and `evidence/round12/`.
Deployment switches reverse on repeated physical center clicks, not just label
clicks. `deeper.css` owns the intrinsic two-region Dig Deeper composition;
`workloads.css` separates hero workload text/action/logo tracks from deployment.
Workload terminal viewports/dots/code and settled tab-hover colors are also
source-backed; phone code height is intrinsic. Palette tests sample screenshot
pixels through every selection, including the
formerly covered landscape cells. Original gray and colored Pandas artwork now
have distinct manifest paths and verified byte identities; `asset()` uses exact,
unambiguous names rather than substring lookup.

```sh
npm run build
npm run preview -- --port 4321
# In a second terminal:
BASE_URL=http://127.0.0.1:4321 npm test
npm run format:check
npm audit
# Optional fresh read-only source/state evidence:
REFERENCE=1 CAPTURES=1 node scripts/round12-probe.mjs
node scripts/round12-source-switch.mjs
node scripts/round12-source-treatment.mjs
CAPTURES=1 node scripts/round12-probe.mjs
node scripts/round12-checks.mjs
node scripts/round12-gallery.mjs
```

The current original has four workload tabs; all four are checked at11 widths,
with both deployment states covered independently. `states.html` contains66
focused source/native pairs and `gallery.html` contains18 canonical page pairs.
The report distinguishes actual paint/ink checks from computed styles, records
remaining static contours/phase/trailing-region differences and does **not**
claim exact equivalence. Backend-dependent forms and unresolved redirects retain
the safe, explicit behavior described above. No publication is authorized.

Round12 final frozen verification: **74 full regression groups,215 focused groups,
311 exact line arrays,110 workload asset identities;0 failures**. There are39
interaction/paint/identity groups,720 additional selected-state RGB samples and11
actual Deeper paint/fitting cases. Build/format/whitespace pass; audit0.

## Round13 — Brand selected-state and intrinsic-flow fidelity

`evidence/REVIEW.md` and `evidence/round13/` are the current review package;
older round sections above are historical. This round restores invariant stacked
palette tracks across all12 choices, the Brand-only landscape hero extent, and
real responsive logo artboards, captions, controls and selected foreground papers.
It also restores the logo guidance's actual desktop/tablet40px sticky inset,
track-end constraint, download action line box and initial Logos rail highlight.

The new original-backed gate covers11 widths, all four logo variants and all12
palette choices at five boundary widths. It checks real click targets, clipboard,
painted colors, actual artwork ink, exact original asset identities and seven
viewport scroll positions in each of two guidance states at six widths. Ordinary
regression runs use frozen original evidence and only navigate the local preview.

```sh
npm run build
npm run preview -- --port 4321
# another terminal:
BASE_URL=http://127.0.0.1:4321 npm test
npm run format:check
npm audit
# Optional explicit GET/HEAD-only original refresh:
REFERENCE=1 CAPTURES=1 node scripts/round13-probe.mjs
REFRESH_REFERENCE=1 node scripts/round13-guidance.mjs
node scripts/round13-palette-states.mjs
# Native-only focused gate and evidence gallery:
node scripts/round13-checks.mjs
node scripts/round13-gallery.mjs
```

`round13/gallery.html` contains all18 canonical pairs; `states.html` contains65
focused pairs, supplemented by real viewport guidance captures. Source/native
raw geometry, exact lines and actual paper/foreground pixels are distinguished
from whole-page pixel percentages. Correct calculated contrast annotations,
truthful unsent forms and pending excluded-content redirects remain intact.
The review report explicitly inventories remaining vector/grid, intermediate
rail/Tone scroll behavior and small pre-existing geometry differences. **This is
not an exact-equivalence or cross-engine certification.**

Round13 frozen gate: **75 full groups,382 focused groups;0 failures**. Build,
formatting and whitespace pass; audit0. Targeted static artwork/caption/control
rectangles differ by at most0.109375px, palette tracks0.046875px and actual
foreground raster bounds1.015625px in the exercised cases. Review the explicit
remaining inventory before interpreting those scoped measurements.
