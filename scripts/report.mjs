import fs from 'node:fs/promises';
import zlib from 'node:zlib';
const read = async (p) => JSON.parse(await fs.readFile(p, 'utf8'));
const checks = await read('evidence/round4/checks.json'),
  pages = await read('evidence/comparison-scrolled.json'),
  tests = await read('evidence/tests/results.json'),
  refs = await read('evidence/round4/reference.json'),
  tablet = await read('evidence/round5/checks.json'),
  tabletRefs = await read('evidence/round5/reference.json');
const tabletRows = [768, 769, 991]
  .map((width) => {
    const n = tablet.find((r) => r.width === width),
      r = tabletRefs.find((r) => r.width === width).colors[0];
    return `| ${width} | ${r.r.x} | ${n.colors[0].r.x} | ${r.r.width}×${r.r.height} | ${n.colors[0].r.width}×${n.colors[0].r.height} | ${n.maxCellError} | ${n.maxCopyError} |`;
  })
  .join('\n');
const runtime = [];
for (const file of await fs.readdir('dist/_astro')) {
  const bytes = await fs.readFile('dist/_astro/' + file);
  runtime.push({
    file,
    bytes: bytes.length,
    gzipBytes: zlib.gzipSync(bytes).length,
  });
}
await fs.writeFile(
  'evidence/runtime-size.json',
  JSON.stringify(runtime, null, 2) + '\n',
);
const footers = [480, 601, 767]
  .map((w) => {
    const n = checks.find((r) => r.kind === 'footer' && r.width === w),
      s = refs.find((r) => r.width === w).footer[0];
    return `| ${w} | ${s.r.height} | ${n.height} | ${(n.height - s.r.height).toFixed(3)} |`;
  })
  .join('\n');
const table = pages
  .map(
    (p) =>
      `| ${p.slug} | ${p.view} | ${p.referenceSize.join('×')} | ${p.localSize.join('×')} | ${p.differencePercent}% |`,
  )
  .join('\n');
const verification = {
  round: 5,
  card: '549aad55-ef02-4222-a004-0df05ae01ca1',
  tests: { passed: tests.passed, failed: tests.failed, countsAreNested: true },
  focusedComponentRecords: checks.length,
  tabletResizeRecords: tablet.length,
  canonicalComparisons: pages.length,
  publication: 'local only; no remote, PR or deployment',
  runtime,
};
await fs.writeFile(
  'evidence/verification.json',
  JSON.stringify(verification, null, 2) + '\n',
);
await fs.writeFile(
  'evidence/REVIEW.md',
  `# Round 5 developer review package

Card: 549aad55-ef02-4222-a004-0df05ae01ca1. Outcome: **ready_for_review**, not independent approval or exact visual equivalence.
Branch: openclaw/dask-org-astro-developer. Exact signed SHA is supplied with the handoff; this report is part of that commit. Previous tester-reviewed SHA: ac63e838f5fd9f11ab84eed7fcde649d91c8bd0f. Independent round4 review accepted all three R3 fixes and requested only the tablet palette correction below.

## R4-1 — tablet palette geometry and copy flow

Corrected only the768–991 tablet-owned palette rules in src/styles/brand.css: measured unequal swatch tracks/insets, gap, fluid row heights, constrained copy width and source-sized paragraph/hex/list/button rhythm. Copy no longer borrows width from the matrix. Reused the already source-listed tablet grid artwork at viewport scale; no new assets/runtime/dependencies. Colors remain native buttons with calculated accessible contrast and real clipboard copying.

Fresh GET/HEAD-only original captures at767/768/769/991/992, all12 cell rectangles and visible initial copy rectangles stored in round5/reference.json. Every tablet cell x/y/width/height is asserted within0.15px; every initial copy box within0.25px. Actual worst errors are below. At768 the copy paragraph is249.421875px wide and101.09375px tall, matching the original. No fixed-height text clipping introduced.

| Width | Original first x | Native first x | Original cell | Native cell | Worst cell error px | Worst copy-box error px |
|---|---|---|---|---|---|---|
${tabletRows}

Round4 assertions now compare tablet geometry too, not just column counts. New round5 checks exercise767→768→769→991→992→768 resize transitions, preserve selected Salmon across each transition, then reload for representative initial-reference copy comparison. All12 color selections and actual clipboard writes/reads are exercised after each resize. Dynamic contrast labels remain correctly calculated rather than copying inaccurate legacy labels; those lists can differ from the original after selection.767/992 cell x/width/height are unchanged within0.02px from the accepted ac63 baseline for all12 cells.

## Prior accepted findings (preserved)

### R3-1 — landscape palette
Native three-column/four-row matrix at480–767, retaining one-column phone and two-column tablet interaction/layout tiers. Measured fixed9px/30px swatch padding and fluid source font/line-height give matching landscape cell dimensions; no fixed-height clipping. At601 each cell is169.875×38.03125px. All12 visible color positions/dimensions are compared by color (the original DOM order differs from visual order), within0.1px at480/601/767. Neighbor479/768 screenshots, column/row assertions, all12 selections, and actual clipboard copy pass. Original artwork/runtime is not used to implement this interaction.

### R3-2 — shared landscape footer
Two-column/two-row navigation across all six routes; logo, group spacing, socials and copyright independently measured, fluid at480–767. Heading x/y positions agree within0.6px and intrinsic total height within1px at480/601/767. No landscape fixed height/min-height substitutes for content. Phone and tablet tiers remain separate and retain their prior behavior.42 route/width footer records cover390/479/480/601/767/768/1440.

| Width | Original height | Native height | Delta px |
|---|---|---|---|
${footers}

### R3-3 — all six cards and CTA
All six cards now have a real decorative native horizontal divider between artwork and content, separately owned content padding, semibold Tools/Data labels and medium-weight source-sized tags. Artwork windows, text, tags, separators and CTA share one clear base/three-breakpoint stylesheet (src/styles/cases.css);206 lines of repeated old card overrides removed from home.css. Cards and the section grow intrinsically instead of fixed card/section heights. Desktop CTA retains the observed386px minimum (not a fixed height); phone/tablet remove that minimum. Landscape grid uses intrinsic fit-content width, matching observed source shrink-wrapping. Phone CTA is left-aligned:390px heading inset19.5px, Demo Day button179.28×49.89px. Fully loaded original/native all-six-card and CTA sheets inspected at390/601/768/1440, plus boundary widths. State-specific external destinations unchanged.

## Checks and reproduction

- npm run build: seven static routes, including explicit404 for pending content.
- npm test: **${tests.passed} groups passed, ${tests.failed} failed**. Nested focused cases are not additional independent totals:141 prior review cases,72 responsive text/artwork/collision captures,28 normal/reduced full-transition motion cases,12 loaded-art bounds cases,55 round4 component/route/width records and6 tablet resize/geometry/all-color-copy records.
- npm run format:check and git diff --check passed; npm audit reports zero vulnerabilities.
- Final SSH commit signature verification is recorded in the handoff. Main and tester retain independent review ownership.

Run npm ci; npm run build; npm test. npm test starts/stops its own production preview4322; BASE_URL can target a running local server. npm run dev -- --port 4321 or npm run preview -- --port 4321 serves the site. See README for spaced executable commands. No live forms submitted. Original reference harness aborts every method except GET/HEAD.

Focused evidence/regeneration (with local server4321):

- node scripts/round4-checks.mjs — columns/rows, original dimensions, all-color states/copy, all-route footer relationships, all-card divider/content containment, phone CTA dimensions.
- node scripts/round4-reference.mjs — fresh read-only original fully loaded all-card/footer captures, seven widths.
- node scripts/round4-palette-reference.mjs — fresh original palette479/480/601/767/768; computed dimensions and component shots.
- REFERENCE_SCROLLED=1 npm run capture — all18 canonical native full pages/diffs against cached fully traversed original references.
- node scripts/round4-gallery.mjs; node scripts/report.mjs — current visual gallery/report.

## Inspected artifacts

- round5/gallery.html and pair-{767,768,769,991,992}.png: fresh original LEFT/native RIGHT palette comparisons, visually inspected including copy wrapping and neighboring tiers.
- round5/checks.json: source/native box metrics and worst errors; round5/test-run.txt and build-run.txt: final full-suite/build logs.
- node scripts/round5-reference.mjs; node scripts/round5-checks.mjs; node scripts/round5-gallery.mjs reproduce the focused evidence with a local server4321.

- round4/gallery.html: original LEFT/native RIGHT, all-card and footer sheets at seven widths; all18 full-page pairs.
- round4/cards-phone-upper.png and cards-phone-lower.png: all six fully loaded phone artworks/dividers/content plus left CTA.
- round4/cards-pair-{601,768,1440}.png: all cards/CTA at landscape/tablet/desktop.
- round4/footer-pair-{479,480,601,767,768}.png: boundary/interior composition. Local footer captures exist separately for each of six routes.
- round4/reference-palette.json, reference.json and checks.json: reproducible measured golden/reference/native data, not production implementation.
- round4/*-chrome-inspection.png: every route, desktop/tablet/mobile first-view and independently bottom-anchored footer crops. Full pages retained alongside these crops.
- round3/responsive.json and motion/results.json regenerated against this build; all earlier animation/typing/gauge/terminal/overflow repairs remain passing.

## Honest residuals and limits

No exact-equivalence or independent-approval claim. Chromium only. Animation phases are not synchronized with the original. Existing non-blocking geometry/artwork/antialiasing residuals remain: at390 native home is175px taller than cached original, brand36px and press37px taller. Native card widths differ by subpixels to about4.3px in inspected responsive samples; the601 first-card height matches258.203125px, phone350.78125 versus350.8125px. The previously disclosed tablet matrix/copy gap is now corrected and source-asserted. Fine mixed-bold contrast-label styling, background dot phase and native rail icons remain visually distinguishable; neighboring767/992 differences against the live original are preserved accepted residuals, not claimed equivalent. No backend submissions or archive payload integrity validated; safe local Not sent and pending redirect mappings remain explicit.

Pixel differences below are diagnostic percentages over compared image area, **not accuracy scores**; dimensions, antialiasing and animations affect them. All18 native canonical captures were refreshed; canonical original captures were reused rather than fetched again. Focused round4 component originals were fetched fresh.

| Route | View | Original size | Native size | Different pixels |
|---|---|---|---|---|
${table}

## Local integration boundary

No remote/push/PR/deployment/CI or main/card mutation. The signed branch shares the original repository object store; main can inspect the reported SHA directly with git show, or check it out in the retained tester worktree. Only after required approval, main may fast-forward its original base to this branch. Do not integrate based solely on this developer handoff.
`,
);
