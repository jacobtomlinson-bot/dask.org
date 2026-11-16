# Local developer review package

Card: 549aad55-ef02-4222-a004-0df05ae01ca1 (dask)

Outcome: **ready_for_review**, not visual-equivalence acceptance. Main must send the committed local SHA to the independent tester. No reviewer approval has been obtained or claimed. No remote, push, PR, deployment or CI workflow was created.

## Verified checks

- Production Astro build: six requested pages plus explanatory 404.
- Playwright production-preview assertions: **60 passed, 0 failed**.
- Prettier format check passed; npm audit reports no known dependency vulnerabilities at verification time.
- Runtime is static HTML/CSS plus native browser JavaScript; no client framework hydration or Webflow implementation assets.
- Artwork and fonts are local; source manifest: src/data/assets.json.
- Form submissions prevented (including native method=dialog fallback); no live mutation tests performed.

## Full-page visual comparisons

All six pages were traversed from top to bottom at 1440×1000, 768×900, and 390×900 to trigger reference lazy artwork. These **fully scrolled** references are more representative than an initial full-page screenshot taken without scrolling. Local captures honor reduced motion. Reference animations are uncontrolled, and dynamic/lazy resources can vary.

| Page | View | Reference size | Local size | Pixels different | First viewport different |
|---|---|---|---|---:|---:|
| home | desktop | 1440×8267 | 1440×8285 | 6.346% | 8.914% |
| get-started | desktop | 1440×4252 | 1440×4256 | 2.675% | 1.901% |
| get-help | desktop | 1440×2011 | 1440×2011 | 2.066% | 2.715% |
| powered-by | desktop | 1440×5531 | 1440×5533 | 3.42% | 4.596% |
| brand-guide | desktop | 1440×5128 | 1440×5132 | 4.626% | 3.719% |
| press-mentions | desktop | 1440×2379 | 1440×2379 | 2.066% | 1.977% |
| home | tablet | 768×7905 | 768×7905 | 9.755% | 18.077% |
| get-started | tablet | 768×3771 | 768×3771 | 6.689% | 5.526% |
| get-help | tablet | 768×2079 | 768×2079 | 4.698% | 6.643% |
| powered-by | tablet | 768×4473 | 768×4477 | 4.755% | 8.935% |
| brand-guide | tablet | 768×4216 | 768×4216 | 6.708% | 7.617% |
| press-mentions | tablet | 768×2251 | 768×2251 | 5.358% | 5.47% |
| home | mobile | 390×13663 | 390×13803 | 13.443% | 17.042% |
| get-started | mobile | 390×7137 | 390×7136 | 8.385% | 6.257% |
| get-help | mobile | 390×3766 | 390×3766 | 6.627% | 4.806% |
| powered-by | mobile | 390×13705 | 390×13705 | 5.264% | 10.809% |
| brand-guide | mobile | 390×6945 | 390×6946 | 14.808% | 9.728% |
| press-mentions | mobile | 390×4667 | 390×4667 | 4.52% | 4.321% |

Method: pixelmatch threshold 0.1, antialias differences excluded, shorter images padded white. These are pixel differences, **not percent accuracy**. No pixel-perfect threshold has passed. Geometry and exact pixel counts are in comparison-scrolled.json. Initial/unscrolled comparison.json is retained for transparency (18 views).

## Interactive states

31 reference/local comparisons are in states/results.json, with both screenshots and diffs. Includes four workload tabs, two deployment tabs, three exploration tabs, four logo color states, twelve palette selections, three submission panels, and desktop/tablet/mobile navigation. Corresponding component bounding boxes differ (legacy captures can include their sidebar); this affects state-level pixel percentages.

## Residual gaps / decisions

1. Exact visual equivalence is **not** established. Homepage dashboard/charts and animation timing are independently recreated/simplified, not original Lottie/Webflow effects. Terminal loops are native and reduced-motion-aware.
2. Mobile brand typography/table spacing, some footer/section spacing, palette presentation/contrast labels and form-panel details remain visually different. Original label errors are not used to copy an incorrect hex code.
3. Native semantic tabs/dialogs, focus management, Escape dismissal, reduced motion, and the mandatory truthful local-form notice intentionally differ from the legacy implementation. Form services, privacy policy and spam handling require a separate authorized decision.
4. All observed organization/project/case artwork is present, including below-fold assets that were absent from some unscrolled reference frames. Captured adoption metrics are static historical copy, not live measurements.
5. Blog/event destinations remain null/pending in src/data/redirects.json; no guessed redirects. The original support-add link is an observed # placeholder.
6. Verified Chromium only. Safari/Firefox, widths other than the three captured widths, physical devices, external/download destination health, and production hosting/real submissions are unverified. Fixed/minimum heights preserve reference whitespace and need independent responsive edge-case review.

## Reproduce and integrate locally

See ../README.md for npm ci, npm run dev, npm run build, npm test, npm run format:check and capture commands. For fully scrolled comparison: run node scripts/scroll-reference.mjs, then REFERENCE_SCROLLED=1 npm run capture.

Use the exact SHA in the developer handoff. Objects are shared with /home/jtomlinson-bot/Projects/dask/dask.org; a tester can git worktree add its managed review path at that SHA without fetching a remote. Do not merge or publish before Jacob's authorization and the mandatory independent review.
