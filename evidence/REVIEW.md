# Round13 local review package

Card: **549aad55-ef02-4222-a004-0df05ae01ca1**
Repository: native Astro Dask.org, six core routes.
Branch: `openclaw/dask-org-astro-developer`
Base: signed round12 `619b6311b1eaf274329a6f055969034dbccb7284`.
Outcome: **ready_for_review**. All final gates passed; the handoff supplies the exact signed SHA.

Main is the sole coordinator, tester relay, integration and completion owner. Local-only: no fetch/remotes/push/PR/deployment/CI/auth changes, helpers, live submissions or main/card mutations. Original requests use the GET/HEAD-only reference harness. No Webflow implementation, generated CSS/JS, runtime or tooling is included in the native project. Public original artwork/fonts retain their existing provenance.

## R12-1 — palette selection reservation and Colors→Typography flow

Replaced copy-height-plus-margin coupling on stacked tiers with **two independent intrinsic grid tracks**. The first reserves the observed copy pane; the second owns the actual swatches and their trailing design canvas. Both use `minmax(max-content, …)`: contrast text may grow rather than being clipped, covered or hidden. Landscape has no section height/min-height compensation, overflow mask, global spacer or downstream section displacement. The copy action's real inline parent line box restores the extra baseline extent at480px rather than introducing a special pixel spacer.

The matrix and Typography boundary now stay invariant across all12 selections and restored Salmon at479/480/601/767. At768 the fresh original has an additional genuine settled White-state exception: equal-width tablet tracks, versus the unequal Salmon tracks. That state is reproduced without changing default tablet geometry. The source exception was checked repeatedly after300/700ms, not dismissed as transition noise. Comparisons map selected colors by **hex identity**, not the source/native menu order.

The original-backed gate compares all12 x/y/width/height tuples and section-relative Typography boundaries after every choice. Live tests check each actual rendered swatch RGB after each selection, unclipped contrast ink, exactly one selected control and the real local clipboard value. All12 colors plus restored Salmon at five widths produce **780 actual RGB samples**. Existing round12 coverage additionally retains its720 selected-state samples and11-width paint/clipboard checks. Correct calculated contrast metadata remains unchanged; this is not an assertion that legacy annotations are byte-identical.

Focused palette matrix maximum: **0.046875px**. Landscape Colors→Typography boundary error is at most0.03125px; the preserved479px portrait boundary differs by0.40625px. Every tested selection has exactly zero native matrix/boundary movement in the stacked tiers.

## R12-2 — Brand-only landscape hero composition

`Hero.astro` identifies the Brand artwork with a local `brand-hero` class. Its landscape copy/art canvas now uses the observed **0.46675 height/width proportion**, with in-flow content and no clipping. Removed the inappropriate inherited minimum extent and terminal paragraph margin from that local composition. No downstream negative section margin was used. Other shared Hero instances and portrait/tablet/desktop composition remain untouched.

Fresh original/native hero heights:

| Width | Original | Native |
|---|---:|---:|
|480|224.046875|224.03125|
|601|280.515625|280.515625|
|767|358|357.984375|

The focused hero/copy maximum, including all paragraph rectangles rather than only section height, is **0.046875px**. All18 canonical route pairs are recaptured; accepted neighboring479/768 behavior and shared heroes remain covered by the full suite.

## R12-3 — genuine showcase canvases, text, alternatives and selected states

The showcase now owns **intrinsic foreground artboards** with the measured Word Mark / Alternatives / Logo Mark canvas proportions, padding and seams. Their real flow replaces the old fixed-height rows. Landscape Word Mark→Logo Mark spacing is restored (including the reported40.86px deficit at601), and Colors follows naturally from the actual final artboard and its own gutter. No palette displacement or page-height concealment is used.

Tablet left/right tracks now put the real logo images at the original x positions; caption type is **15.1603px/25.5974px at768**, not13.475px/20.21px. The same correction covers769/991 and both sides of the767/768/991/992 boundaries. Phone and desktop artboard papers were also reconstructed from their actual measured bounds, preserving copy geometry while removing grid lines that previously showed through the foreground canvases.

All four variants retain the exact original artwork identities. Primary's wide icon viewport and the square colored/white icon viewports are distinguished. Controls use observed intrinsic minimum widths, selected-border geometry, pitch and responsive heights. **Black's selected border is white**; the other selected borders are black. Actual center hit targeting, selected state, assets, keyboard Home/End/arrows and focus are tested. Colored variants now update the left paper as well as the section and artboards, fixing the newly observed white-paper/white-text failure.

Fresh reference/native comparisons cover390/479/480/601/767/768/769/991/992/1100/1440 and all four variants, including restored White. Static image/caption/control/canvas maximum: **0.109375px**. The actual foreground artwork raster-ink maximum is **1.015625px**; this is reported separately from DOM rectangles. Source/native PNG samples verify **1,144 actual opaque paper pixels**, not merely computed background colors. Logo assets are checked against the full original manifest URLs110 times.

### Guidance while selecting/scanning the showcase

A further real selected-state difference was exposed during inspection: the original desktop/tablet guidance paper is sticky with a **40px viewport inset**, whereas the native copy was static. The native copy and its actual paper now travel together, reserving the paper's own measured extent and clamping to its real artwork track. The actual bottom margin is included; phone/landscape retain normal flow. Desktop Download Logos also restores its fixed32px action line box and original margin collapse; tablet/phone/landscape accepted action geometry is retained.

Fresh original-backed checks exercise six widths × White/Pink × seven section-relative scroll positions = **84 viewport groups**. They compare the actual paper and every heading/paragraph/action track, font, weight and line-height. Raw viewport coordinates remain recorded. Chromium rounds document scroll positions to whole CSS pixels; only flowing-phase coordinates are normalized to the same requested component-relative offset. The truly viewport-pinned40px phase is compared directly. Maximum normalized paper/content difference is0.609375px (the previously documented tablet guidance x offset); maximum raw viewport-y difference is **0.7546000px**, recorded separately in `guidance-scroll.json`.

## Smaller concrete repairs and preserved scope

- Initial Brand rail now retains Logos' original selected circle while the hero is above the section. Existing subsequent active-section/anchor behavior is unchanged and all prior rail tests remain required.
- Selected Black outline, actual per-variant foreground papers and the desktop download line box are covered explicitly rather than grouped under vague contour noise.
- No changes to Tone paragraph data/layout, typography specimens, workload/deployment banks, form safeguards, source art identities, redirects or excluded-content scope.

## Verification and evidence

**Final frozen verification:** build passed (7 routes); **75 full regression groups passed,0 failed**; **382 focused groups passed,0 failed**;174 exact caption/hero line arrays;110 exact artwork identities;1,144 actual paper-pixel assertions;780 live all-color RGB samples;123 interaction groups and84 viewport-guidance groups. Formatting/whitespace pass; audit:0 vulnerabilities. Implementation remained frozen throughout this final complete run. Earlier stopped/superseded runs are explicitly separated in iterations/. Source/native state measurements: `evidence/round13/reference.json` / `local.json`. Reproduction scripts: `round13-probe.mjs`, `round13-checks.mjs`, `round13-interactions.mjs`, `round13-guidance.mjs`, `round13-palette-states.mjs`, `round13-gallery.mjs`.

- `gallery.html` / `comparison.json`: all18 canonical pairs at390/768/1440; percentages/heights are diagnostics, not acceptance criteria.
- `states.html`:65 detailed Brand state/boundary pairs; common-scroll full-page raster crops avoid sticky-navigation capture artifacts.
- `reference/` / `local/`: actual source/native captures, including sticky viewport screenshots and Salmon/White→Typography boundary captures.
- `checks.json`, `interactions.json`, `guidance-scroll.json`: exact scoped geometry, line arrays, full artwork identities, physical hits, clipboard, paint and actual ink checks.
- `guidance-reference.json`: frozen fresh original scroll fixture; ordinary regression runs are native-only and do not need live original access.
- `inspection/`: full-page structural overviews, optional finer page strips and selected-state comparison sheets. Overview inspection is not a claim of exhaustive pixel/cross-engine certification.
- `iterations/`: superseded/failed diagnostics and intentionally stopped superseded test runs, **not** final acceptance logs.
- `regressions/`: this run's generated historical JSON/check logs, without rewriting earlier committed source fixtures/screenshots.

```sh
npm ci
npm run build
npm run preview -- --port 4321
# another terminal:
BASE_URL=http://127.0.0.1:4321 npm test
npm run format:check
npm audit
# Explicit read-only original refresh only when desired:
REFERENCE=1 CAPTURES=1 node scripts/round13-probe.mjs
REFRESH_REFERENCE=1 node scripts/round13-guidance.mjs
node scripts/round13-palette-states.mjs
# Native-only focused reproduction, using those frozen original fixtures:
node scripts/round13-checks.mjs
node scripts/round13-gallery.mjs
```

## Honest remaining inventory — no exact-equivalence claim

- Some native gauge/rail/Explore vector contours and background grid/dot phase still differ. Intermediate scroll-driven rail activation thresholds also differ (for example, a768px Logos+300px viewport can show source Colors versus native Logos); accepted anchor-driven states and the newly repaired initial Logos state are preserved. Scoped bounds/ink checks do not certify every internal vector contour.
- Prior small Use Cases767 width−4.25px /991 height+1.625px, Explore boundary1–3px and Press underline quantization remain outside this targeted repair.
- Source border-overlap/shared-header subpixel origins and up-to0.61px tablet guidance x differences remain visible in raw coordinates; no downstream displacement hides them.
- Calculated accessibility combinations intentionally retain the accepted correct calculation rather than reproducing every legacy static annotation; metadata text/wrapping/action placement is not claimed byte-identical to those legacy panes.
- The original Tone introductory paper also has a sticky scroll role; this round preserves the explicitly accepted Tone90 paragraph/paper layout and does not certify its unexercised scrolling phases as equivalent. That is distinct from the newly tested/repaired Logos guidance.
- Unsynchronized dashboard/typing/counter/gauge phases are separate from static defects. Existing normal-motion token/newline/needle/phone-wrapping gates remain required.
- The original320px specimen overlap remains documented:6.109375px source versus6.125px native; this is not new native document overflow.
- Safe local forms truthfully say “Not sent”; backend emulation is not invented. Excluded blog/event redirects remain pending explicit destination decisions.
- Chromium on this host only; no universal browser/device/accessibility or exact-pixel certification.

Same retained independent tester must review the new signed exact SHA before local integration. Main/card/publication remain untouched.
