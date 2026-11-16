import fs from 'node:fs/promises';
import zlib from 'node:zlib';
const read = async (p) => JSON.parse(await fs.readFile(p, 'utf8'));
const dir = 'evidence/round8';
const tests = await read(`${dir}/test-results.json`),
  checks = await read(`${dir}/checks.json`),
  comparisons = await read(`${dir}/comparison.json`),
  audit = await read(`${dir}/audit.json`),
  brush = await read(`${dir}/brush-contour.json`);
if (tests.failed || checks.length !== 10 || comparisons.length !== 18)
  throw new Error('Final full passing evidence required.');
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
const verification = {
  round: 8,
  card: '549aad55-ef02-4222-a004-0df05ae01ca1',
  parent: '139c646ca9a239ee6546e3ff0b9a799ee43ec574',
  outcome: 'ready_for_review',
  tests: { passed: tests.passed, failed: tests.failed, countsAreNested: true },
  surfaceViewports: checks.length,
  exactParagraphLineArrays: 90,
  maxPaperBoundError: Math.max(...checks.map((c) => c.maxPaintError)),
  maxRailBoundError: Math.max(...checks.map((c) => c.maxRailError)),
  canonicalPairs: comparisons.length,
  vulnerabilities: audit.metadata.vulnerabilities,
  runtime,
  exactEquivalenceCertified: false,
  publication:
    'local only; same tester must review new signed SHA; main/card not mutated',
};
await fs.writeFile(
  'evidence/verification.json',
  JSON.stringify(verification, null, 2) + '\n',
);
const table = checks
  .map(
    (c) =>
      `| ${c.width} | ${c.maxPaintError.toFixed(6)} | ${c.maxRailError.toFixed(6)} | ${c.maxParagraphError} | all9 match |`,
  )
  .join('\n');
const heights = [
  'home',
  'get-started',
  'get-help',
  'powered-by',
  'brand-guide',
  'press-mentions',
]
  .map(
    (slug) =>
      `| ${slug} | ${[390, 768, 1440].map((w) => comparisons.find((r) => r.slug === slug && r.width === w).heightDelta).join(' | ')} |`,
  )
  .join('\n');
const report = `# Round8 developer review package — static paper and rail fidelity

Card549aad55-ef02-4222-a004-0df05ae01ca1. Outcome **ready_for_review**, not independent approval or exact-equivalence certification. Parent139c646ca9a239ee6546e3ff0b9a799ee43ec574. Local branch openclaw/dask-org-astro-developer; exact SSH-signed SHA accompanies the handoff. Main remains sole coordinator/integration owner. Main/card were not mutated; no fetch/remote/push/PR/deploy/CI/live submission occurred.

## Residual-by-residual response

1. **Tone paper-panel paint extents — repaired and directly measured.** The accepted text tracks were correct, but backgrounds covered only the content boxes. Native decorative paper surfaces now extend through the observed gutters/padding. The desktop introductory sheet follows the observed40% content-row proportion; the long sheet follows the intrinsically sized section. Tablet/landscape surfaces expand from the actual text boxes; phone surfaces include their existing final paragraph margin. No text/section height or min-height was introduced, no overflow mask, arbitrary breaks, spacer element or copied source implementation. These are negative-z background surfaces, not masks over content. All90 paragraph line arrays and accepted phone paragraph bounds remain unchanged. Tests additionally inspect actual paper pixels and dark foreground ink in every paragraph, so a covering layer cannot pass on DOM bounds alone.

2. **Dot-grid phase/alignment — corrected missing paint, not a compensating global phase shift.** Fresh source/native grid files have identical SHA-256 hashes at all four responsive tiers (grid-assets.json). The focused tests assert the correct asset, viewport-wide scale and origin at ten widths. Much of the apparent phase mismatch was grid showing through missing paper. No speculative global background offset was added. Remaining full-page background differences are explicitly not all called raster noise: other source copy surfaces still differ, listed below.

3. **Rail geometry and visible state paint — repaired.** Desktop links were52px instead of47.984px with76px pitch instead of63.97px. Tablet SVGs were20px instead of23.05px. At601px landscape, outer icons were about26px too far inward. Controls, gaps, insets and icon boxes now match the observed tiers; max coordinate/size error is${verification.maxRailBoundError}px across320 measured coordinates. Narrow phones retain the observed80px bar/52px controls with fluid internal padding and inline icon baseline behavior, rather than scaling the controls with the type. This also matches479px without changing any Tone-relative paragraph geometry. The active disc is now original lightgrey#f6f6f6 instead of pink, with a15% lightgrey hover surface. Native active-section observation, accessible labels, sticky track and unobscured anchors remain. Fresh settled colors/tone captures at390/1440 show the same current section, background and text color in both sites.

4. **Native artwork contours — improved, not declared exact.** An8x browser-raster comparison separated the brush's genuine divider/bristle/corner differences from one-pixel screenshot phase. The independently authored brush now has the corrected divider height, bristle lengths and crisp handle junctions. No original SVG path was transplanted. A diagnostic white-ink intersection/union comparison, allowing at most1CSSpx translation, improved from${brush[0].inkIoU.toFixed(6)} to${brush[1].inkIoU.toFixed(6)}; required alignment moved from0.625px vertical to0.125px. This is an iteration diagnostic, not an accuracy score. Typography/microphone contours and the brush's remaining curvature differences remain independently drawn approximations.

## Focused measured results

Fresh GET/HEAD-only original references at390/479/480/601/767/768/769/991/992/1440. Coordinates: viewport X, section-relative Y. Paper compares both surfaces' x/y/width/height (80 values); rail compares four controls and icons' x/y/width/height (320 values); paragraphs compare all90 rendered line arrays and their360 bounds.

| Width | Max paper error px | Max rail error px | Max paragraph error px | Rendered lines |
|---:|---:|---:|---:|---|
${table}

Every paper bound differs by at most0.125px. Phone text differs from source by at most0.21875px, but remains unchanged from the previously accepted local baseline; all other paragraph bounds stay within0.0625px. No typography or line-break change was made this round.

## Full checks and fresh comparisons

- npm run build: PASS; seven static outputs including404.
- npm test: **${tests.passed} outer groups passed / ${tests.failed} failed** on the final frozen production build. Prior destination/tab/form/palette/19-width overflow, responsive clipping/artwork, complete motion-cycle/gauge, and strict90-paragraph tests remain included. Nested counts are not additive.
- npm run format:check; git diff --check: PASS.
- npm audit: **0 vulnerabilities**; dependencies unchanged.
- Fresh fully traversed original/native18 page pairs at390/768/1440. All routes were scrolled through to load below-fold artwork before capture. Original normal-motion and native reduced-motion frames are not synchronized.
- Inspected the ten focused Tone pairs/detail strips, low-resolution rail pairs and8x native brush comparison, settled rail states, and fresh390px route overview pairs. Canonical18 full-resolution pairs are available for the tester; this is not a claim that every pixel/state was manually certified.

Canonical full-page height differences, native minus source (diagnostic only):

| Route |390px|768px|1440px|
|---|---:|---:|---:|
${heights}

## Explicit remaining inventory — exact objective remains open

**Reproducible static differences, not dismissed as motion:**
- Fresh overview inspection identified additional dark hero copy surfaces and the Get Help introductory paper surface that still expose native grid where the original paints solid paper. copy-surfaces.json records source/native geometry. For example, original390 Brand Guide's opaque outer copy panel is325.438px wide versus the native290px text wrapper; original Get Help's introductory sheet begins at x31.094/y416.281, versus native text wrapper x43.672/y459. These are different wrapper roles, not evidence to stretch the text. They need component-owned paper-surface treatment analogous to Tone while preserving actual copy tracks.
- The same probe shows original390 Brand Guide's heading has6.5013px bottom separation absent from native; native first body copy starts about6.9px early globally. Get Help introduction starts its paragraph about4.3px lower than the reference. These unmodified hero/help rhythm differences are newly explicit follow-up targets, not irreducible raster noise.
- Independently drawn T/microphone/brush contours are not literal source paths; high-resolution pairs expose remaining static stroke/curve differences. Rail control geometry and settled colors are now strictly measured, but the existing native observer's transition timing is not bit-identical to the former runtime.
- Non-Tone paper boundaries/footer copy paint have not been placed under the same80-coordinate gate. Fresh canonical pairs retain their visible differences; this round does not claim them repaired.
- The canonical accumulated height residual is between−2 and+5px. It is not hidden with page/section heights or overflow rules.

**Separate motion/raster and unverified limits:** original/native typing, dashboard task distribution, counters and gauge phases are not synchronized or bit-identical. Rasterization/subpixel page-origin differences remain even with matching text lines and grid assets. These do not explain away the concrete static inventory above. Chromium only; Firefox/Safari, physical devices, every outbound/download payload and backend integration remain unverified. Local forms still truthfully report Not sent; redirect destinations remain pending and unguessed.

## Artifacts / reproduction / handoff

- round8/REVIEW.md and root REVIEW.md: this package; verification.json and runtime-size.json: current machine-readable summary.
- round8/gallery.html, pair-{route}-{width}.png, comparison.json: all18 refreshed canonical pairs/diffs/heights.
- round8/tone-gallery.html, pair-tone-{width}.png, reference.json, checks.json: ten focused paper/text/rail comparisons, source rendered observations, actual paint/foreground assertions.
- round8/rail-reference.json, rail-settled-states.json and reference/local rail screenshots: geometry, label/state paint evidence. rail-source-states.json is an earlier deliberately unsettled observation; use rail-settled-states.json for steady-state conclusions.
- round8/pair-icon-hires-{1,2,3}.png, icon-brush-before.png, brush-contour.json: independent contour iteration. White-ink threshold220, device scale8, alignment search±8 device pixels; not a perceptual acceptance score.
- round8/copy-surfaces.json: fresh read-only observations supporting the remaining static inventory, not production inputs.
- round8/{build.log,tests.log,test-results.json,format.log,audit.json}: final checks. Historical generated test outputs are restored; current run's nested JSON snapshots are retained under round8/regressions/.

Setup: npm ci; npx playwright install chromium (first setup only). Checks: npm run build; npm test; npm run format:check; npm audit. Focused: run a local production server4321, then node scripts/round8-checks.mjs and node scripts/round8-gallery.mjs. Fresh canonical: WIDTHS=390,768,1440 node scripts/round8-capture.mjs; node scripts/round8-compare.mjs. Read-only original requests are GET/HEAD only; source observations/screenshots never feed production rendering. Shared capture/compare helpers accept EVIDENCE_DIR, avoiding another full historical script copy.

Owned servers are stopped and the worktree is clean at signed handoff. New SHA requires the same tester's independent verdict; prior139c646 approval does not carry over. Main may inspect git show <SHA> from its shared object store without fetch; after exact-SHA approval it may fast-forward locally. No PR/publication is authorized. Main/card remain untouched by this developer.
`;
await fs.writeFile(`${dir}/REVIEW.md`, report);
await fs.writeFile('evidence/REVIEW.md', report);
