# Round 3 — local developer review package

Card: 549aad55-ef02-4222-a004-0df05ae01ca1. Parent reviewed revision: 01a303ea07ffdeb379e2d5c65999edbeab5460b4.

Outcome: **ready_for_review**, not acceptance or exact-equivalence certification. Main owns routing to the same independent tester and all card/completion decisions. The signed exact SHA is in the developer handoff; no remote, push, PR, deployment or CI workflow was created.

## Explicit R2-1..R2-4 responses

- **R2-1:** replaced frozen pixel geometry with shared fluid design units and separately owned phone (<480), landscape-phone (480–767), tablet (768–991), and desktop (≥992) tiers. All six routes and shared chrome use the scale. The 601px brand page now has full-width stacked content and a horizontal sticky bar; desktop/tablet retain their vertical rail. Landscape-specific organization/sponsor, learning, case, quote and support grids were inspected below the fold and corrected, rather than merely suppressing document overflow. Brand specimens scale together, with no measured text collisions. No new overflow-masking workaround was added. Loaded original adoption-chart artwork was restored, with text/art separation checks. Source manifests include the four appropriate responsive grid artworks.
- **R2-2:** shared safe Python token rendering now drives both static Astro output and native typing. Client rendering uses text nodes/spans, not untrusted HTML. Dashboard code uses white-space:pre; terminal lines and syntax classes survive completed frame transitions. Desktop/mobile normal and reduced-motion cases were inspected after complete transitions, not merely at 4000ms.
- **R2-3:** needle rotations use native SVG animateTransform with an explicit gauge-local (0,0) pivot, not CSS rotation around the outer SVG's center. Five sampled normal-motion phases at both1440/390 keep both paths within the SVG and show yellow pixels in each ring. Reduced motion stays static; offscreen/pref-change handling pauses native animation.
- **R2-4:** corrected terminal font/line-height and separated window-body insets from intrinsic pre content. Source newlines do not wrap arbitrarily. All four workload states, both deployment states and installation were captured at767/768/769/991/992 (35 original/native pairs). Landscape tabs/actions and deployment headings were corrected after inspecting those comparisons. Correct section-specific dark/white grid artwork follows each tier. All18 canonical full-page captures were refreshed against the final production build.

## Verified checks

- Astro production build: six requested pages plus explanatory404.
- npm test: **64 production-preview groups passed, 0 failed**. Its aggregates include 141 focused prior-review cases, 72 full-page responsive cases, 28 full-transition/phased motion cases and 12 loaded-artwork bounds/text-separation cases. These are nested counts, not additive independent test totals.
- Responsive captures/checks:320/390/479/480/599/600/601/767/768/991/992/1440 across all six routes. Text-bound checks examine visible headings/paragraphs/buttons/time labels throughout main, not just h1 or scrollWidth; specimen collision checks use text ranges. Existing19-width regressions remain enabled.
- Format check and git diff --check pass; npm audit reports zero known vulnerabilities. The earlier preview-start refusal was an Astro single-preview workspace lock; the owned preview was stopped before the final successful test run.
- Existing B1 destinations/state labels, sticky active navigation, B5 safe forms and B6 document-width gates remain exercised. Local form submits remain prevented and report Not sent; no live form submissions were performed.
- Static Astro/native browser JS/plain CSS only. Original public artwork/fonts are local and source-listed in src/data/assets.json; no production Webflow/jQuery/Lottie implementation dependency.

## Measured typography (reference / native)

| Width | Brand h1 px | Brand body paragraph px |
|---|---|---|
| 320 | 30.72 / 30.72px | 13.6544 / 13.6533px |
| 480 | 25.2624 / 25.2624px | 10.6656 / 10.6667px |
| 601 | 31.6306 / 31.6306px | 13.3542 / 13.3556px |
| 992 | 38.5789 / 38.5778px | 11.0211 / 11.0222px |

| Width | Default workload reference font / line | Native font / line | pre content height reference / native px |
|---|---|---|---|
| 767 | 17.0427px / 25.5641px | 17.0444px / 25.5667px | 230.0625 / 230.0625 |
| 768 | 10.752px / 15.36px | 10.752px / 15.36px | 138.234375 / 138.234375 |
| 769 | 10.766px / 15.38px | 10.766px / 15.38px | 138.375 / 138.375 |
| 991 | 13.874px / 19.82px | 13.874px / 19.82px | 178.3125 / 178.3125 |
| 992 | 9.92px / 14.88px | 9.92px / 14.88px | 133.875 / 133.875 |

## Canonical full-page comparisons

Existing fully traversed originals are reused. Final native captures use the production build and reduced motion. Original animation phases are uncontrolled. Pixelmatch threshold0.1, antialias differences excluded; shorter pages padded white. **Different pixels are not a percent-accuracy score or an acceptance threshold.**

| Page | View | Reference size | Native size | Different pixels |
|---|---|---|---|---:|
| home | desktop | 1440×8267 | 1440×8289 | 6.018% |
| get-started | desktop | 1440×4252 | 1440×4256 | 2.669% |
| get-help | desktop | 1440×2011 | 1440×2011 | 2.008% |
| powered-by | desktop | 1440×5531 | 1440×5533 | 3.465% |
| brand-guide | desktop | 1440×5128 | 1440×5133 | 6.646% |
| press-mentions | desktop | 1440×2379 | 1440×2379 | 2.017% |
| home | tablet | 768×7905 | 768×7905 | 8.039% |
| get-started | tablet | 768×3771 | 768×3771 | 6.689% |
| get-help | tablet | 768×2079 | 768×2079 | 4.688% |
| powered-by | tablet | 768×4473 | 768×4477 | 4.792% |
| brand-guide | tablet | 768×4216 | 768×4216 | 10.609% |
| press-mentions | tablet | 768×2251 | 768×2251 | 5.354% |
| home | mobile | 390×13663 | 390×13803 | 11.2% |
| get-started | mobile | 390×7137 | 390×7136 | 7.802% |
| get-help | mobile | 390×3766 | 390×3766 | 5.082% |
| powered-by | mobile | 390×13705 | 390×13705 | 4.965% |
| brand-guide | mobile | 390×6945 | 390×6981 | 9.581% |
| press-mentions | mobile | 390×4667 | 390×4704 | 7.493% |

## Honest remaining differences / boundaries

Exact equivalence is not established. Native task streams, typing/counter timing and gauge curves are independent reconstructions, not synchronized replicas of the legacy runtime. Some text wrapping, partner-logo sizing, specimen baselines, button/section spacing and footer geometry still differ. For example, the canonical390px home remains about140px longer than the original; the table above retains every measured page-size residual.

Settled601px whole-page heights (not used as an automatic pass/fail threshold):

| Page | Reference px | Native px | Native minus reference |
|---|---:|---:|---:|
| home | 9065 | 9032 | -33 |
| get-started | 4586 | 4586 | 0 |
| get-help | 2438 | 2438 | 0 |
| powered-by | 6481 | 6486 | 5 |
| brand-guide | 4704 | 4801 | 97 |
| press-mentions | 2572 | 2580 | 8 |

The paired strips are inspection aids, with original LEFT/native RIGHT. Width montages show first-section crops; below-fold montages alternate section starts and selected mid-section crops, which can overlap and are not continuous pages. Full-resolution full pages remain beside them. The twelve-width captures and all-state comparisons were inspected; no claim is made that every pixel or every interaction at every possible width is identical. Remaining browser coverage is Chromium only, not Safari/Firefox or physical devices. External archive payload integrity and real backend behavior are unverified. Backend/privacy/spam decisions and blog/event destinations still require separate authorization; pending redirect mappings remain null and emit no guessed redirect.

## Evidence and reproduction

- round3/gallery.html: all12-width page pairs,70 state captures and motion links.
- round3/responsive.json, local/, reference/: full-page text bounds, typography/rail geometry and new breakpoint originals. Canonical originals remain in reference/.
- round3/states/results.json and sheet-{767,768,769,991,992}.png: all seven requested states at each width. Some state component bounding boxes differ; inspect the source/native images, not just their container size.
- round3/motion/results.json and PNGs: complete token transitions, five normal/reduced gauge phases at1440/390 and visible-yellow counts.
- round3/art-bounds.json: loaded chart within its section without text overlap at all12 widths.
- round3/reference-grids.json, reference-stable.json, complete-section-metrics.json: rendered-reference observations, not copied implementation styles.
- tests/results.json, round2/checks.json, comparison-scrolled.json, runtime-size.json: production checks, preserved regressions, final18 comparisons and measured runtime asset sizes.

Setup/run: npm ci; npm run dev -- --port 4321. Build/test: npm run build; npm test; npm run format:check. npm test owns its preview; if a preview is already running, use BASE_URL=http://127.0.0.1:4321 npm test rather than starting a second Astro preview in the same checkout.

With a local server: node scripts/round3-checks.mjs; node scripts/round3-motion.mjs; node scripts/round3-art-bounds.mjs. Read-only original/local state captures: node scripts/round3-states.mjs (LOCAL_ONLY=1 reuses originals). Final canonical screenshots: REFERENCE_SCROLLED=1 npm run capture. Refresh galleries/summary: node scripts/round3-gallery.mjs; node scripts/round3-sections.mjs; node scripts/report.mjs.

## Local integration only

Branch: openclaw/dask-org-astro-developer. Objects are shared with /home/jtomlinson-bot/Projects/dask/dask.org; the same tester can switch its retained managed worktree to the handoff SHA without fetching anything. A new reviewer can git worktree add an unused local review path at that SHA. After independent review and Jacob's authorization, main may fast-forward the complete branch from the original base; do not cherry-pick only the round3 delta onto the empty initial project. No integration, publication or card transition was performed by the developer.
