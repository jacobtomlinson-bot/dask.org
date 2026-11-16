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

The test runner makes **no live form submissions**. It starts a production preview, checks the original 60 behavior groups, then runs `scripts/round2-checks.mjs` against that same preview. Focused coverage includes every route at 320/360/390/599/600/601/767/768/990/991/992/993/1099/1100/1101/1440/1599/1600/1601 pixels; visible per-state action labels **and destinations**; persistent brand navigation/active sections/anchor offsets; palette ordering/icons; and all three stacked mobile forms with blocked mutations and truthful Not sent results. Local assets, JS errors, keyboard interactions, logo/palette variants and clipboard copying remain covered. `BASE_URL` can target an already running local server instead of launching preview.

## Edit the site

- `src/layouts/Site.astro`: shared document metadata, header, footer and dialogs.
- `src/components/`: header, footer, hero, support strip, terminal, workload panel and independently drawn icons.
- `src/data/site.ts`: shared destinations, learning resources, sponsor/company/project lists and palette.
- `src/data/home.ts`, `quotes.json`, `cases.json`, `press.json`: editable home and press content.
- `src/pages/`: native Astro page composition and page-specific editorial copy. No component framework or client hydration.
- `src/styles/global.css`: shared tokens, resets, grid backgrounds, hero/support/terminal/tab primitives.
- `src/styles/chrome.css`: header/navigation, footer and native submission drawer.
- `src/styles/{home,brand,get-started,get-help,powered-by,press-mentions}.css`: route-owned base and breakpoint rules, imported after `Site` by that route only. `illustrations.css` owns the three native homepage drawings. There is no refinement stylesheet or page-level style pile: edit the existing selector in its owning base/desktop/tablet/landscape-phone/phone tier rather than appending overrides. Some deliberately generous sections preserve reference whitespace.
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
node scripts/report.mjs # refresh the current round-3 review summary/gallery
```

`BASE_URL=http://127.0.0.1:<port>` overrides the local target. Reference inspection uses GET/HEAD only and blocks mutation methods. `scripts/inspect.mjs`, `details.mjs`, `states.mjs`, `inspect-states.mjs`, and `responsive-details.mjs` retain the bounded reference-capture workflow, including recovery from incomplete captures. They are development evidence tools only. The reference browser uses Node fetch to satisfy Chromium's requests in this environment; it never imports remote code into production.

- `evidence/comparison-scrolled.json`: final comparison after traversing every reference page to trigger lazy artwork. `comparison.json` retains the initial/unscrolled baseline. Both include per-page dimensions, pixel counts, first-viewport differences and geometry.
- `evidence/local/`, `evidence/reference/`, `evidence/diff/`: final local/reference/full-page diff screenshots.
- `evidence/states/`: screenshots and quantitative differences for workload/deployment/explore tabs, four logo states, twelve palette states, three dialog types, desktop community and tablet/mobile navigation.
- `evidence/tests/results.json`: production-preview assertions and result counts.
- `evidence/round2/checks.json`: focused production-preview regression results.
- `evidence/round2/motion/`: original/native dashboard, gauges and counter at nominal 0/1500/4000 ms after scroll, plus static reduced-motion checks; results include actual capture delays.
- `evidence/round2/local/`: 320/390 overflow evidence, sticky section anchors, empty/filled mobile panels, and original-left/native-right inspection strips.
- `evidence/REVIEW.md`: current round-3 measured summary, explicit R2-1..R2-4 responses and honest residuals. Earlier B1–B6 responses are retained in Git history.
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
