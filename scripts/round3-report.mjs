import fs from 'node:fs/promises';
import zlib from 'node:zlib';
const read = async (path) => JSON.parse(await fs.readFile(path, 'utf8'));
const pages = await read('evidence/comparison-scrolled.json');
const tests = await read('evidence/tests/results.json');
const focused = await read('evidence/round2/checks.json');
const responsive = await read('evidence/round3/responsive.json');
const motion = await read('evidence/round3/motion/results.json');
const artwork = await read('evidence/round3/art-bounds.json');
const states = await read('evidence/round3/states/results.json');
const artifacts = [];
for (const file of await fs.readdir('dist/_astro')) {
  const bytes = await fs.readFile('dist/_astro/' + file);
  artifacts.push({
    file,
    bytes: bytes.length,
    gzipBytes: zlib.gzipSync(bytes).length,
  });
}
await fs.writeFile(
  'evidence/runtime-size.json',
  JSON.stringify(artifacts, null, 2) + '\n',
);
const pageRows = pages
  .map(
    (p) =>
      `| ${p.slug} | ${p.view} | ${p.referenceSize?.join('×')} | ${p.localSize?.join('×')} | ${p.differencePercent}% |`,
  )
  .join('\n');
const codeRows = [767, 768, 769, 991, 992]
  .map((width) => {
    const a = states.find(
      (r) =>
        r.width === width &&
        r.state === 'workload-0' &&
        r.label === 'reference',
    ).pre[0];
    const b = states.find(
      (r) =>
        r.width === width && r.state === 'workload-0' && r.label === 'local',
    ).pre[0];
    return `| ${width} | ${a.font} / ${a.line} | ${b.font} / ${b.line} | ${a.height} / ${b.height} |`;
  })
  .join('\n');
const fontRows = [
  [320, 30.72, 13.6544],
  [480, 25.2624, 10.6656],
  [601, 31.6306, 13.3542],
  [992, 38.5789, 11.0211],
]
  .map(([width, h1, body]) => {
    const b = responsive.find(
      (r) => r.route === 'brand-guide' && r.width === width,
    );
    return `| ${width} | ${h1} / ${b.h1.font} | ${body} / ${b.brandParagraph.font} |`;
  })
  .join('\n');
const routes = [
  'home',
  'get-started',
  'get-help',
  'powered-by',
  'brand-guide',
  'press-mentions',
];
const height = async (path) => (await fs.readFile(path)).readUInt32BE(20);
const residuals = [];
for (const route of routes) {
  const a = await height(`evidence/round3/reference/${route}-601.png`);
  const b = await height(`evidence/round3/local/${route}-601.png`);
  residuals.push(`| ${route} | ${a} | ${b} | ${b - a} |`);
}
const report = `# Round 3 — local developer review package

Card: 549aad55-ef02-4222-a004-0df05ae01ca1. Parent reviewed revision: 01a303ea07ffdeb379e2d5c65999edbeab5460b4.

Outcome: **ready_for_review**, not acceptance or exact-equivalence certification. Main owns routing to the same independent tester and all card/completion decisions. The signed exact SHA is in the developer handoff; no remote, push, PR, deployment or CI workflow was created.

## Explicit R2-1..R2-4 responses

- **R2-1:** replaced frozen pixel geometry with shared fluid design units and separately owned phone (<480), landscape-phone (480–767), tablet (768–991), and desktop (≥992) tiers. All six routes and shared chrome use the scale. The 601px brand page now has full-width stacked content and a horizontal sticky bar; desktop/tablet retain their vertical rail. Landscape-specific organization/sponsor, learning, case, quote and support grids were inspected below the fold and corrected, rather than merely suppressing document overflow. Brand specimens scale together, with no measured text collisions. No new overflow-masking workaround was added. Loaded original adoption-chart artwork was restored, with text/art separation checks. Source manifests include the four appropriate responsive grid artworks.
- **R2-2:** shared safe Python token rendering now drives both static Astro output and native typing. Client rendering uses text nodes/spans, not untrusted HTML. Dashboard code uses white-space:pre; terminal lines and syntax classes survive completed frame transitions. Desktop/mobile normal and reduced-motion cases were inspected after complete transitions, not merely at 4000ms.
- **R2-3:** needle rotations use native SVG animateTransform with an explicit gauge-local (0,0) pivot, not CSS rotation around the outer SVG's center. Five sampled normal-motion phases at both1440/390 keep both paths within the SVG and show yellow pixels in each ring. Reduced motion stays static; offscreen/pref-change handling pauses native animation.
- **R2-4:** corrected terminal font/line-height and separated window-body insets from intrinsic pre content. Source newlines do not wrap arbitrarily. All four workload states, both deployment states and installation were captured at767/768/769/991/992 (35 original/native pairs). Landscape tabs/actions and deployment headings were corrected after inspecting those comparisons. Correct section-specific dark/white grid artwork follows each tier. All18 canonical full-page captures were refreshed against the final production build.

## Verified checks

- Astro production build: six requested pages plus explanatory404.
- npm test: **${tests.passed} production-preview groups passed, ${tests.failed} failed**. Its aggregates include ${focused.results.length} focused prior-review cases, ${responsive.length} full-page responsive cases, ${motion.length} full-transition/phased motion cases and ${artwork.length} loaded-artwork bounds/text-separation cases. These are nested counts, not additive independent test totals.
- Responsive captures/checks:320/390/479/480/599/600/601/767/768/991/992/1440 across all six routes. Text-bound checks examine visible headings/paragraphs/buttons/time labels throughout main, not just h1 or scrollWidth; specimen collision checks use text ranges. Existing19-width regressions remain enabled.
- Format check and git diff --check pass; npm audit reports zero known vulnerabilities. The earlier preview-start refusal was an Astro single-preview workspace lock; the owned preview was stopped before the final successful test run.
- Existing B1 destinations/state labels, sticky active navigation, B5 safe forms and B6 document-width gates remain exercised. Local form submits remain prevented and report Not sent; no live form submissions were performed.
- Static Astro/native browser JS/plain CSS only. Original public artwork/fonts are local and source-listed in src/data/assets.json; no production Webflow/jQuery/Lottie implementation dependency.

## Measured typography (reference / native)

| Width | Brand h1 px | Brand body paragraph px |
|---|---|---|
${fontRows}

| Width | Default workload reference font / line | Native font / line | pre content height reference / native px |
|---|---|---|---|
${codeRows}

## Canonical full-page comparisons

Existing fully traversed originals are reused. Final native captures use the production build and reduced motion. Original animation phases are uncontrolled. Pixelmatch threshold0.1, antialias differences excluded; shorter pages padded white. **Different pixels are not a percent-accuracy score or an acceptance threshold.**

| Page | View | Reference size | Native size | Different pixels |
|---|---|---|---|---:|
${pageRows}

## Honest remaining differences / boundaries

Exact equivalence is not established. Native task streams, typing/counter timing and gauge curves are independent reconstructions, not synchronized replicas of the legacy runtime. Some text wrapping, partner-logo sizing, specimen baselines, button/section spacing and footer geometry still differ. For example, the canonical390px home remains about140px longer than the original; the table above retains every measured page-size residual.

Settled601px whole-page heights (not used as an automatic pass/fail threshold):

| Page | Reference px | Native px | Native minus reference |
|---|---:|---:|---:|
${residuals.join('\n')}

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
`;
await fs.writeFile('evidence/REVIEW.md', report);
const css =
  '<style>body{font:16px system-ui;max-width:1200px;margin:2rem auto;padding:0 1rem;background:#fafafa;color:#111}figure{margin:1rem 0}img{max-width:100%;height:auto}section{margin:2rem 0}summary{cursor:pointer;font-weight:bold}.pair{display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:start}a{color:#174ed0}</style>';
let html =
  '<!doctype html><meta charset="utf-8"><title>Dask round3 evidence</title>' +
  css +
  '<h1>Round3 — original LEFT / native RIGHT</h1><p>Review evidence, not an equivalence claim. Full pages can be long; expand the view you need. <a href="../REVIEW.md">Measured report</a>.</p>';
for (const route of routes) {
  html += `<section><h2>${route}</h2>`;
  for (const width of [
    320, 390, 479, 480, 599, 600, 601, 767, 768, 991, 992, 1440,
  ]) {
    const view = { 390: 'mobile', 768: 'tablet', 1440: 'desktop' }[width],
      src = view
        ? `../reference/${route}-${view}-scrolled.png`
        : `reference/${route}-${width}.png`;
    html += `<details><summary>${width}px full page</summary><div class="pair"><img loading="lazy" src="${src}" alt="${route} ${width} original"><img loading="lazy" src="local/${route}-${width}.png" alt="${route} ${width} native"></div></details>`;
  }
  html += '</section>';
}
html += '<h2>All workload/deployment/install states</h2>';
for (const width of [767, 768, 769, 991, 992])
  html += `<details><summary>${width}px seven-state inspection sheet</summary><img loading="lazy" src="states/sheet-${width}.png" alt="${width}px original/native seven states"></details>`;
html +=
  '<h2>Motion</h2><p><a href="motion/results.json">Phased bounds, yellow pixels and completed code transitions</a></p>';
await fs.writeFile('evidence/round3/gallery.html', html);
await fs.writeFile(
  'evidence/gallery.html',
  '<!doctype html><meta charset="utf-8"><title>Dask visual evidence</title><h1>Dask visual evidence</h1><p><a href="round3/gallery.html">Current round3 page, state and motion comparisons</a></p><p><a href="REVIEW.md">Current measured review report</a></p>',
);
await fs.writeFile(
  'evidence/round3/verification.json',
  JSON.stringify(
    {
      outcome: 'ready_for_review',
      acceptance: 'independent review required',
      parent: '01a303ea07ffdeb379e2d5c65999edbeab5460b4',
      productionGroups: tests.passed,
      failed: tests.failed,
      focusedCases: focused.results.length,
      responsiveCases: responsive.length,
      motionCases: motion.length,
      artworkCases: artwork.length,
      canonicalPairs: pages.length,
      statePairs: states.length / 2,
      localOnly: true,
    },
    null,
    2,
  ) + '\n',
);
