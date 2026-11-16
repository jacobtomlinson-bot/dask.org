# Round 2 visual inspection notes

Reference is LEFT and native Astro is RIGHT in `local/*-pair-*.png` and `local/*-three-views.png`. Three-view sheets show desktop, tablet, then mobile. Existing fully scrolled reference captures were reused; new live inspection is read-only and mutation methods are blocked.

## Images inspected

- All six `local/*-three-views.png` sheets: 18 refreshed first-view layouts, not merely diff percentages.
- Homepage mobile dashboard, all workload/actions/logos/terminal, gauge/copy ordering, human code, counters/deployment, and closing/footer strips.
- Brand mobile logo alternatives, full grouped palette, typography and tone transition; desktop/tablet guide overview; all four sticky anchor captures at desktop/mobile.
- Get-started learning cards, illustration band, exploration controls and deeper section; get-help support/footer; powered-by project/logo band; press cards through the later entries and footer transitions.
- All three empty/filled mobile submission panels and the refreshed interaction-state gallery. Original/native motion samples are separately captured at nominal 0/1500/4000 ms after scrolling.

## Corrections driven by actual images

Tablet hero intrinsic sizing initially collapsed the headline beside a fixed-width drawing; corrected with minmax tracks and measured illustration placement. Route-CSS extraction initially changed the get-started cascade; imports now follow Site. Mobile performance art is before copy, terminals use compact source-measured text, and partner rows are restored. The mobile grid uses the distinct original mobile SVG, not a compressed desktop grid. Brand swatches follow column grouping rather than interleaved DOM order. Footer sizes/spacing, support graphics and press image/divider geometry were further adjusted after image inspection.

The transformed dashboard cannot be captured safely with locator.screenshot: Playwright may scroll an overflow-hidden ancestor and produce a header crop. `round2-motion.mjs` now scrolls only the page and crops the visible region from an ordinary viewport screenshot. The motion assertion was kept, not relaxed; normal-motion changes and static reduced-motion frames are verified.

## Remaining differences — not an equivalence claim

Native task distribution, resource-needle curves, code typing and counter timing are independent reconstructions, not synchronized original-runtime playback. Mobile brand specimen baselines/wrapping, some below-fold section/caption spacing, and long-page offsets still differ. Original/native motion comparison boxes can have different visible bounds; the counter reference grid also includes adjacent caption space.

Final full-page dimensions/differences are in `../comparison-scrolled.json`, and state/motion measurements in `../states/results.json` and `motion/results.json`. In the captured 390px view the homepage is 140px taller, brand guide 36px taller and press page 37px taller than the retained reference; the other three page heights differ by at most 1px. Matching total height alone does not prove local geometry matches.

Pixelmatch percentages are neither accuracy nor approval. The same independent tester must decide acceptance on the new signed local SHA. Browser coverage is Chromium only; native focus rings and the truthful local form notice intentionally differ. No real submission, remote publication, deployment, CI workflow or guessed redirect was performed.
