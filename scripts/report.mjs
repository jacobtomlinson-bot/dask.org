import fs from 'node:fs/promises';
import zlib from 'node:zlib';
const pages = JSON.parse(
  await fs.readFile('evidence/comparison-scrolled.json', 'utf8'),
);
const initial = JSON.parse(
  await fs.readFile('evidence/comparison.json', 'utf8'),
);
const states = JSON.parse(
  await fs.readFile('evidence/states/results.json', 'utf8'),
);
const tests = JSON.parse(
  await fs.readFile('evidence/tests/results.json', 'utf8'),
);
const review = JSON.parse(
  await fs.readFile('evidence/round2/checks.json', 'utf8'),
);
const motion = JSON.parse(
  await fs.readFile('evidence/round2/motion/results.json', 'utf8'),
);
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
const rows = pages
  .map(
    (p) =>
      `| ${p.slug} | ${p.view} | ${p.referenceSize?.join('×')} | ${p.localSize?.join('×')} | ${p.differencePercent ?? p.error}% | ${p.topViewportDifferencePercent}% |`,
  )
  .join('\n');
await fs.writeFile(
  'evidence/REVIEW.md',
  `# Local developer review package\n\nCard: 549aad55-ef02-4222-a004-0df05ae01ca1 (dask)\n\nOutcome: **ready_for_review**, not visual-equivalence acceptance. Main must send the committed local SHA to the independent tester. No reviewer approval has been obtained or claimed. No remote, push, PR, deployment or CI workflow was created.\n\n## Verified checks\n\n- Production Astro build: six requested pages plus explanatory 404.\n- Playwright production-preview groups: **${tests.passed} passed, ${tests.failed} failed**, including the focused round-2 aggregate detailed below.\n- Prettier format check passed; npm audit reports no known dependency vulnerabilities at verification time.\n- Runtime is static HTML/CSS plus native browser JavaScript; no client framework hydration or Webflow implementation assets.\n- Artwork and fonts are local; source manifest: src/data/assets.json.\n- Form submissions prevented (including native method=dialog fallback); no live mutation tests performed.\n\n## Full-page visual comparisons\n\nAll six reference pages were traversed from top to bottom at 1440×1000, 768×900, and 390×900 to trigger reference lazy artwork; those original captures are reused rather than duplicated. All 18 final local views were refreshed after the shared and route-owned CSS changes. These **fully scrolled** references are more representative than an initial full-page screenshot taken without scrolling. Local captures honor reduced motion. Reference animations are uncontrolled, and dynamic/lazy resources can vary.\n\n| Page | View | Reference size | Local size | Pixels different | First viewport different |\n|---|---|---|---|---:|---:|\n${rows}\n\nMethod: pixelmatch threshold 0.1, antialias differences excluded, shorter images padded white. These are pixel differences, **not percent accuracy**. No pixel-perfect threshold has passed. Geometry and exact pixel counts are in comparison-scrolled.json. Initial/unscrolled comparison.json is retained for transparency (${initial.length} views).\n\n## Interactive states\n\n${states.length} reference/local comparisons are in states/results.json, with both screenshots and diffs. Includes four workload tabs, two deployment tabs, three exploration tabs, four logo color states, twelve palette selections, three submission panels, and desktop/tablet/mobile navigation. Corresponding component bounding boxes differ (legacy captures can include their sidebar); this affects state-level pixel percentages.\n\n## Residual gaps / decisions\n\n1. Exact visual equivalence is **not** established. Dashboard task/progress drawing, MEMORY/CPU resource gauges and automatic counters are native reconstructions. Their curves, task distribution, typing and timings still differ from original runtime frames; timed component captures are in round2/motion/results.json. These are observed differences, not antialias-only claims.
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

Focused regression suite: **${review.passed} passed, ${review.failed} failed** (included under the production npm test aggregate). Motion suite: **${motion.filter((x) => x.assertion).length} native normal/reduced-motion assertions passed**, with 18 original/native timed comparisons. Actual capture delays are recorded because reference/native animation phases are not synchronized.\n\n## Reproduce and integrate locally\n\nSee ../README.md for npm ci, npm run dev, npm run build, npm test, npm run format:check and capture commands. For fully scrolled comparison: run node scripts/scroll-reference.mjs, then REFERENCE_SCROLLED=1 npm run capture.\n\nUse the exact SHA in the developer handoff. Objects are shared with /home/jtomlinson-bot/Projects/dask/dask.org; a tester can git worktree add its managed review path at that SHA without fetching a remote. Do not merge or publish before Jacob's authorization and the mandatory independent review.\n`,
);
const esc = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('"', '&quot;');
await fs.writeFile(
  'evidence/gallery.html',
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>Dask visual review evidence</title><style>body{font:16px/1.5 system-ui;margin:32px;background:#f6f6f6;color:#080815}h1{font-size:32px}summary{cursor:pointer;font-weight:bold;padding:16px;background:#fff;margin-top:12px}.pair{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}img{width:100%;height:auto}h3{font-size:16px}a{color:#183d72}</style><h1>Dask: reference / native Astro / diff</h1><p>Pixel differences are not an accuracy score. See <a href="REVIEW.md">review boundaries</a>. All references below were scrolled fully before capture.</p>${pages.map((p) => `<details><summary>${esc(p.slug)} · ${esc(p.view)} · ${p.differencePercent}% pixels different</summary><div class="pair"><div><h3>Reference</h3><img loading="lazy" src="reference/${p.slug}-${p.view}-scrolled.png"></div><div><h3>Local</h3><img loading="lazy" src="local/${p.slug}-${p.view}.png"></div><div><h3>Diff</h3><img loading="lazy" src="diff-scrolled/${p.slug}-${p.view}.png"></div></div></details>`).join('')}<h2>Interactive states</h2>${states.map((s) => `<details><summary>${esc(s.name)} · ${s.differentPercent}% pixels different (bounding boxes vary)</summary><div class="pair">${['reference', 'local', 'diff'].map((k) => `<div><h3>${k}</h3><img loading="lazy" src="states/${s.name}-${k}.png"></div>`).join('')}</div></details>`).join('')}</html>`,
);
console.log('Wrote review report and screenshot gallery');
