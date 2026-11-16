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
  `# Local developer review package\n\nCard: 549aad55-ef02-4222-a004-0df05ae01ca1 (dask)\n\nOutcome: **ready_for_review**, not visual-equivalence acceptance. Main must send the committed local SHA to the independent tester. No reviewer approval has been obtained or claimed. No remote, push, PR, deployment or CI workflow was created.\n\n## Verified checks\n\n- Production Astro build: six requested pages plus explanatory 404.\n- Playwright production-preview assertions: **${tests.passed} passed, ${tests.failed} failed**.\n- Prettier format check passed; npm audit reports no known dependency vulnerabilities at verification time.\n- Runtime is static HTML/CSS plus native browser JavaScript; no client framework hydration or Webflow implementation assets.\n- Artwork and fonts are local; source manifest: src/data/assets.json.\n- Form submissions prevented (including native method=dialog fallback); no live mutation tests performed.\n\n## Full-page visual comparisons\n\nAll six pages were traversed from top to bottom at 1440×1000, 768×900, and 390×900 to trigger reference lazy artwork. These **fully scrolled** references are more representative than an initial full-page screenshot taken without scrolling. Local captures honor reduced motion. Reference animations are uncontrolled, and dynamic/lazy resources can vary.\n\n| Page | View | Reference size | Local size | Pixels different | First viewport different |\n|---|---|---|---|---:|---:|\n${rows}\n\nMethod: pixelmatch threshold 0.1, antialias differences excluded, shorter images padded white. These are pixel differences, **not percent accuracy**. No pixel-perfect threshold has passed. Geometry and exact pixel counts are in comparison-scrolled.json. Initial/unscrolled comparison.json is retained for transparency (${initial.length} views).\n\n## Interactive states\n\n${states.length} reference/local comparisons are in states/results.json, with both screenshots and diffs. Includes four workload tabs, two deployment tabs, three exploration tabs, four logo color states, twelve palette selections, three submission panels, and desktop/tablet/mobile navigation. Corresponding component bounding boxes differ (legacy captures can include their sidebar); this affects state-level pixel percentages.\n\n## Residual gaps / decisions\n\n1. Exact visual equivalence is **not** established. Homepage dashboard/charts and animation timing are independently recreated/simplified, not original Lottie/Webflow effects. Terminal loops are native and reduced-motion-aware.\n2. Mobile brand typography/table spacing, some footer/section spacing, palette presentation/contrast labels and form-panel details remain visually different. Original label errors are not used to copy an incorrect hex code.\n3. Native semantic tabs/dialogs, focus management, Escape dismissal, reduced motion, and the mandatory truthful local-form notice intentionally differ from the legacy implementation. Form services, privacy policy and spam handling require a separate authorized decision.\n4. All observed organization/project/case artwork is present, including below-fold assets that were absent from some unscrolled reference frames. Captured adoption metrics are static historical copy, not live measurements.\n5. Blog/event destinations remain null/pending in src/data/redirects.json; no guessed redirects. The original support-add link is an observed # placeholder.\n6. Verified Chromium only. Safari/Firefox, widths other than the three captured widths, physical devices, external/download destination health, and production hosting/real submissions are unverified. Fixed/minimum heights preserve reference whitespace and need independent responsive edge-case review.\n\n## Reproduce and integrate locally\n\nSee ../README.md for npm ci, npm run dev, npm run build, npm test, npm run format:check and capture commands. For fully scrolled comparison: run node scripts/scroll-reference.mjs, then REFERENCE_SCROLLED=1 npm run capture.\n\nUse the exact SHA in the developer handoff. Objects are shared with /home/jtomlinson-bot/Projects/dask/dask.org; a tester can git worktree add its managed review path at that SHA without fetching a remote. Do not merge or publish before Jacob's authorization and the mandatory independent review.\n`,
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
