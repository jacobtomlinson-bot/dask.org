# Local developer review package

Card: 549aad55-ef02-4222-a004-0df05ae01ca1 (dask)

Outcome: **ready_for_review**, not visual-equivalence acceptance. Main must send the committed local SHA to the independent tester. No reviewer approval has been obtained or claimed. No remote, push, PR, deployment or CI workflow was created.

## Verified checks

- Production Astro build: six requested pages plus explanatory 404.
- Playwright production-preview groups: **61 passed, 0 failed**, including the focused round-2 aggregate detailed below.
- Prettier format check passed; npm audit reports no known dependency vulnerabilities at verification time.
- Runtime is static HTML/CSS plus native browser JavaScript; no client framework hydration or Webflow implementation assets.
- Artwork and fonts are local; source manifest: src/data/assets.json.
- Form submissions prevented (including native method=dialog fallback); no live mutation tests performed.

## Full-page visual comparisons

All six reference pages were traversed from top to bottom at 1440×1000, 768×900, and 390×900 to trigger reference lazy artwork; those original captures are reused rather than duplicated. All 18 final local views were refreshed after the shared and route-owned CSS changes. These **fully scrolled** references are more representative than an initial full-page screenshot taken without scrolling. Local captures honor reduced motion. Reference animations are uncontrolled, and dynamic/lazy resources can vary.

| Page | View | Reference size | Local size | Pixels different | First viewport different |
|---|---|---|---|---:|---:|
| home | desktop | 1440×8267 | 1440×8289 | 6.157% | 5.034% |
| get-started | desktop | 1440×4252 | 1440×4256 | 2.67% | 1.926% |
| get-help | desktop | 1440×2011 | 1440×2011 | 2.008% | 2.743% |
| powered-by | desktop | 1440×5531 | 1440×5533 | 3.419% | 4.625% |
| brand-guide | desktop | 1440×5128 | 1440×5133 | 6.646% | 2.479% |
| press-mentions | desktop | 1440×2379 | 1440×2379 | 2.017% | 2.006% |
| home | tablet | 768×7905 | 768×7905 | 8.597% | 7.492% |
| get-started | tablet | 768×3771 | 768×3771 | 6.709% | 5.542% |
| get-help | tablet | 768×2079 | 768×2079 | 4.711% | 6.661% |
| powered-by | tablet | 768×4473 | 768×4477 | 4.761% | 8.933% |
| brand-guide | tablet | 768×4216 | 768×4216 | 10.665% | 7.824% |
| press-mentions | tablet | 768×2251 | 768×2251 | 5.364% | 5.484% |
| home | mobile | 390×13663 | 390×13803 | 11.2% | 5.555% |
| get-started | mobile | 390×7137 | 390×7136 | 7.803% | 6.059% |
| get-help | mobile | 390×3766 | 390×3766 | 5.082% | 4.731% |
| powered-by | mobile | 390×13705 | 390×13705 | 5.041% | 10.536% |
| brand-guide | mobile | 390×6945 | 390×6981 | 9.602% | 7.608% |
| press-mentions | mobile | 390×4667 | 390×4704 | 7.493% | 3.291% |

Method: pixelmatch threshold 0.1, antialias differences excluded, shorter images padded white. These are pixel differences, **not percent accuracy**. No pixel-perfect threshold has passed. Geometry and exact pixel counts are in comparison-scrolled.json. Initial/unscrolled comparison.json is retained for transparency (18 views).

## Interactive states

31 reference/local comparisons are in states/results.json, with both screenshots and diffs. Includes four workload tabs, two deployment tabs, three exploration tabs, four logo color states, twelve palette selections, three submission panels, and desktop/tablet/mobile navigation. Corresponding component bounding boxes differ (legacy captures can include their sidebar); this affects state-level pixel percentages.

## Residual gaps / decisions

1. Exact visual equivalence is **not** established. Dashboard task/progress drawing, MEMORY/CPU resource gauges and automatic counters are native reconstructions. Their curves, task distribution, typing and timings still differ from original runtime frames; timed component captures are in round2/motion/results.json. These are observed differences, not antialias-only claims.
2. Small text wrapping, typography/specimen baselines, footer and section whitespace differences remain. The complete page differences above are not acceptance thresholds; the independent tester still decides whether the original visual/behavior requirements are met.
3. Native semantic tabs/dialogs, keyboard focus rings, reduced motion, and the mandatory truthful local-form notice intentionally differ. Forms never claim success; services, privacy/retention and spam controls require a separate authorized decision.
4. Organization/project/case artwork remains locally served. Captured adoption metrics are historical copy, not live measurements. Logo/font download destinations are preserved; archive payload integrity remains unverified.
5. Blog/event destinations remain null/pending in src/data/redirects.json; no guessed redirects. The original support-add link remains its observed # placeholder.
6. Chromium only: behavior at 19 widths (320/360/390/599/600/601/767/768/990/991/992/993/1099/1100/1101/1440/1599/1600/1601), full-page visual captures at 1440/768/390 and selected 320 screenshots. Safari/Firefox, physical devices, arbitrary widths, production hosting and real submissions remain unverified.

## Round 2: explicit independent-review responses

The prior SHA acfc9b7 received CHANGES_REQUIRED. No approval is implied by this developer package.

- **B1**: workload secondary actions are data-driven for all four tabs; both deployment states retain documentation/video actions. Inline performance/cost anchors, homepage Get started and en/latest Install Now destinations restored. Focused desktop/mobile assertions check each active panel’s visible label + exact href, not a global URL set.
- **B2**: Dashboard.astro draws the original two-pane notebook/task/progress composition with native SVG bars. Gauges.astro draws MEMORY/CPU rings, labels and moving needles. CostCounter.astro is automatic, with no substituted range input. Native CSS/JS choreography pauses offscreen; reduced motion uses static representative content. Mobile partner rows and compact terminal geometry restored. Timed normal-motion original/native captures plus native motion/static assertions are in round2/motion/.
- **B3**: BrandNav.astro supplies native Dask/brush/type/microphone artwork; sticky desktop rail/mobile bar, active-section observation and unobscured scroll offsets are implemented. Tests navigate Logos -> Colors -> Typography -> Tone and back while the rail remains available at desktop and mobile.
- **B4**: corrected swatch sequence and column grouping/selected-salmon gap, 156×58.5 mobile logo specimens, table tracks/wrapping, shared button dimensions, original mobile grid artwork, measured desktop dropdown and footer spacing. All six routes re-captured at all three visual widths and actual images inspected. Remaining differences are disclosed above, not mislabeled exactness.
- **B5**: mobile drawer stacks three tabs and both names; close control is top-right; field/textarea/submit baselines are measured against the original. Empty and filled captures cover all three forms; safe prevented submissions still report Not sent. Keyboard Escape/focus behavior is exercised.
- **B6**: press cards use min-width:0/fluid headings and brand specimens use minmax(0,1fr) tracks. No new clipping/overflow:hidden workaround. Every route passes intrinsic-width assertions at 320/360/390 and breakpoint neighbors; screenshots retain 320 evidence.
- **DRY**: removed refinements.css and the homepage/brand page-style piles. Shared primitives/chrome and six route-owned styles each have explicit base and responsive ownership; route CSS imports follow Site so the cascade stays intentional. Repeated workload CTAs remain editable data.

Focused regression suite: **141 passed, 0 failed** (included under the production npm test aggregate). Motion suite: **9 native normal/reduced-motion assertions passed**, with 18 original/native timed comparisons. Actual capture delays are recorded because reference/native animation phases are not synchronized.

## Reproduce and integrate locally

See ../README.md for npm ci, npm run dev, npm run build, npm test, npm run format:check and capture commands. For fully scrolled comparison: run node scripts/scroll-reference.mjs, then REFERENCE_SCROLLED=1 npm run capture.

Use the exact SHA in the developer handoff. Objects are shared with /home/jtomlinson-bot/Projects/dask/dask.org; a tester can git worktree add its managed review path at that SHA without fetching a remote. Do not merge or publish before Jacob's authorization and the mandatory independent review.
