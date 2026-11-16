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

The test runner makes **no live form submissions**. It checks all six pages at 1440, 768 and 390 pixels, local image/font delivery, no JS errors, no external runtime requests, horizontal overflow, navigation, all content tabs, all logo and color variants, clipboard copying, form dialog behavior, and the local cost illustration. `BASE_URL` can target an already running local server instead of launching preview.

## Edit the site

- `src/layouts/Site.astro`: shared document metadata, header, footer and dialogs.
- `src/components/`: header, footer, hero, support strip, terminal, workload panel and independently drawn icons.
- `src/data/site.ts`: shared destinations, learning resources, sponsor/company/project lists and palette.
- `src/data/home.ts`, `quotes.json`, `cases.json`, `press.json`: editable home and press content.
- `src/pages/`: native Astro page composition and page-specific editorial copy. No component framework or client hydration.
- `src/styles/global.css`: shared design tokens/layout and responsive rules.
- `src/styles/refinements.css`: measured responsive geometry and state adjustments. These are hand-authored observations, not exported/generated Webflow rules. Some deliberately generous page sections preserve the original whitespace.
- `src/scripts/site.ts`: small native browser interactions; keyboard tab navigation, Escape dismissal, clipboard, form preview, and reduced-motion-aware terminal illustrations.

Use `npm run format` after edits. Repeated structure/content is component- or data-driven. The homepage dashboard and benchmark illustration are independently authored HTML/CSS, not screenshots of the old site. Terminal examples are ordinary text and locally highlighted code. No animation JSON, Webflow generated CSS/JS, jQuery, Webflow library, or third-party client runtime is included.

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
node scripts/report.mjs # refresh review summary/gallery after captures
```

`BASE_URL=http://127.0.0.1:<port>` overrides the local target. Reference inspection uses GET/HEAD only and blocks mutation methods. `scripts/inspect.mjs`, `details.mjs`, `states.mjs`, `inspect-states.mjs`, and `responsive-details.mjs` retain the bounded reference-capture workflow, including recovery from incomplete captures. They are development evidence tools only. The reference browser uses Node fetch to satisfy Chromium's requests in this environment; it never imports remote code into production.

- `evidence/comparison-scrolled.json`: final comparison after traversing every reference page to trigger lazy artwork. `comparison.json` retains the initial/unscrolled baseline. Both include per-page dimensions, pixel counts, first-viewport differences and geometry.
- `evidence/local/`, `evidence/reference/`, `evidence/diff/`: final local/reference/full-page diff screenshots.
- `evidence/states/`: screenshots and quantitative differences for workload/deployment/explore tabs, four logo states, twelve palette states, three dialog types, desktop community and tablet/mobile navigation.
- `evidence/tests/results.json`: production-preview assertions and result counts.
- `evidence/REVIEW.md`: measured review summary and residual gaps.

Pixel comparisons use pixelmatch threshold 0.1 with antialias differences excluded. Full-page images of different heights are padded white; **percent different is not a "percent accurate" or perceptual-quality score**. State comparisons use each corresponding component's bounding box, so the legacy sidebar's presence can contribute to differences. Original animations, lazy-loaded artwork and failed external resources can change the reference frame. Closed-menu baselines were captured in fresh pages because an earlier cross-breakpoint capture left the legacy menu open. Such older captures remain clearly named, not silently treated as the default state.

### Known review gaps

Visual identity/layout/content are rebuilt, but exactness is not established. Homepage dashboard/benchmark animation choreography is approximated by independent native illustrations; terminal loops are simplified and honor reduced motion. Mobile brand typography, palette text combinations/contrast labels and the original dynamic form panel still differ. The new palette computes actual WCAG contrast instead of duplicating inconsistent old labels (including mislabeled yellow/slate hex values). Accessibility improvements (semantic headings, native focus-trapped dialogs, keyboard tabs, truthful local form notice) can also differ visually. Only Chromium at the documented widths is measured; Safari/Firefox, other intermediate widths, touch devices, all outbound/download destinations and real backend integration are unverified. The independent tester must review this exact committed SHA before calling the work ready for human acceptance.

## Local integration only

No GitHub repository, remote, push, pull request, deployment, or CI workflow was created. The managed-worktree branch and exact SHA are in the developer handoff. It shares Git objects with the main checkout, so a reviewer can use `git worktree add <review-path> <SHA>` or inspect `git show <SHA>` without networking. The main coordinator owns review routing and Workboard lifecycle; merging remains Jacob's decision.
