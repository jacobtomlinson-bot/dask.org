import fs from 'node:fs/promises';
import zlib from 'node:zlib';
const read = async (p) => JSON.parse(await fs.readFile(p, 'utf8'));
const pages = await read('evidence/round6/comparison.json');
const tests = await read('evidence/round6/test-results.json');
const focused = await read('evidence/round6/checks.json');
const audit = await read('evidence/round6/audit.json');
const runtime = [];
for (const file of await fs.readdir('dist/_astro')) {
  const bytes = await fs.readFile('dist/_astro/' + file);
  runtime.push({
    file,
    bytes: bytes.length,
    gzipBytes: zlib.gzipSync(bytes).length,
  });
}
const table = pages
  .map(
    (p) =>
      `| ${p.slug} | ${p.width} | ${p.referenceHeight} | ${p.nativeHeight} | ${p.heightDelta} | ${p.differencePercent}% |`,
  )
  .join('\n');
await fs.writeFile(
  'evidence/runtime-size.json',
  JSON.stringify(runtime, null, 2) + '\n',
);
await fs.writeFile(
  'evidence/verification.json',
  JSON.stringify(
    {
      round: 6,
      card: '549aad55-ef02-4222-a004-0df05ae01ca1',
      tests: {
        passed: tests.passed,
        failed: tests.failed,
        countsAreNested: true,
      },
      focusedComponentRecords: focused.length,
      canonicalComparisons: pages.length,
      vulnerabilities: audit.metadata.vulnerabilities,
      publication: 'local only; no remote, PR, deployment or CI changes',
      runtime,
    },
    null,
    2,
  ) + '\n',
);
await fs.writeFile(
  'evidence/REVIEW.md',
  `# Round 6 developer review package

Card: 549aad55-ef02-4222-a004-0df05ae01ca1. Outcome: **ready_for_review**; not independent approval, human acceptance or exact-equivalence certification.
Branch: openclaw/dask-org-astro-developer. Parent: c7231bf6d66cdba5a77145e99f5c842d52ee5e5f. Exact SSH-signed SHA accompanies the handoff. Main is the sole coordinator and integration owner. No remote/push/PR/deploy/CI/live submission was performed.

## Residual-by-residual response

1. **390px homepage +175px:** the nine testimonial cards used oversized logos, wrong author type and card spacing; the intro had an artificial line break. Rebuilt intrinsic card composition in a single testimonials.css owner, restored responsive logo/avatar/author sizing and natural intro wrapping, correct grayscale logos/paper background, and benefit dividers. Removed the old scattered testimonial rules. Use-case caption margins were also too large. Mobile full-page delta is now **−2px**, rather than +175px. The testimonial section is within 0.1px of the fresh source measurement; no fixed section height was introduced.
2. **390px brand +36px:** restored the six meaningful internal example line breaks, the separately sized introductory emphasis paragraph, actual paragraph margins and inter-column gap; removed the mobile tone section's minimum-height crutch. Natural mobile page height now **6945px, equal to source**. The tone section remains about 0.75px shorter; upstream rounding offsets it, so whole-page equality is not proof of pixel equality.
3. **390px press +37px:** corrected image box, card padding, time display (no anonymous inline line-box inflation), last-card margin, and add-mention control geometry. Restored the observed section bottom padding rather than setting page height. Full-page native is **4666px vs source4667px**.
4. **Mixed-bold contrast:** server-rendered and dynamically selected hex values use strong600, while ratings remain normal400. A shared safe fragment renderer and Astro component avoid raw HTML injection. Real contrast calculations, clipboard and selection behavior remain intact; incorrect legacy ratings are not reproduced.
5. **Native rail icons:** independently redrawn upright brush, typography and microphone silhouettes, with measured desktop/tablet/phone icon boxes. Restored the full-height pink rail track behind the viewport-height sticky navigation; the prior implementation left the track white below its first viewport. Active section/anchor behavior is preserved and regression-tested. These are native outlines, not copied original SVG paths; bit-identical icon contours are not certified.
6. **Background grid/dot phase:** distinguished ordinary grids from large-grid-box sections across all six routes, corrected brand viewport alignment behind the rail, restored observed paper content panels, and used the already manifested original half-grid artwork for the desktop closing strips. Get-started hero/install now share one continuous background instead of restarting it at the section boundary. Fine phase/raster differences remain observable in the diff images; no Webflow CSS/runtime was reused.
7. **Typography/logo/spacing:** corrected testimonial type/logo treatment, mobile tone and press flow, tablet footer tracks/line heights/social/copyright placement, phone copyright width/gap, desktop footer column gaps, and intrinsic desktop/tablet use-case heading/caption spacing. Desktop use-case section height is within0.1px of source (previously49px short); tablet within1.5px (previously31px short). No overflow masking or page-height matching was used.

## Verification

- Production build: seven static outputs (six requested pages plus explicit404).
- Full npm test: **${tests.passed} outer groups passed; ${tests.failed} failed**. Nested counts must not be added to that total. Preserved action labels/hrefs, 19-width overflow checks, 72 full-page responsive geometry cases, 28 motion assertions, 12 loaded-art separation cases, 55 landscape/card/footer cases and six tablet palette resize/all-color-copy cases.
- New round6 suite: **${focused.length} responsive component groups** at320/390/479/480/601/767/768/769/991/992/1440 plus eleven background role/continuity assertions. Includes intrinsic sections, nine cards, author/logo sizing and grayscale, six semantic line breaks, safe mixed emphasis after selection, rail icon bounds and footer positions.
- Format check and git diff whitespace check passed. npm audit: **${audit.metadata.vulnerabilities.total} vulnerabilities**. No dependency changes.
- All18 source/native canonical pairs were refreshed after fully traversing each route to trigger lazy artwork; source GET/HEAD only. Source reference captured this round, not reused from the original unscrolled capture. Final local images use reduced motion; source motion is unsynchronized.
- Inspected all18 full-page comparisons in overviews and focused original-left/native-right crops for testimonials, tone, press and use cases. Comparison files and the gallery are independent evidence, not production inputs.

An earlier check overlapped a rebuild and failed on a missing DOM element; it is retained in round6/interrupted-build-{tests.log,results.json}. The reported final suite was rerun against a frozen production build, with no concurrent source/build mutation.

## Measured current canonical residuals

| Route | Width | Source height | Native height | Δpx | Differing pixels |
|---|---:|---:|---:|---:|---:|
${table}

Pixelmatch threshold0.1, antialias excluded, shorter image padded white. **Differing pixels is not percent inaccuracy or perceptual fidelity.** Motion, unsynchronized typing, task arrangement, native focus indication and source lazy loading affect it. Whole-page height matches do not establish component equivalence.

## Evidence and reproduction

- round6/gallery.html: all18 full-resolution source-left/native-right page pairs and diff links.
- round6/capture.json, comparison.json: measured final page/section/text/background observations and differences.
- round6/reference-components.json, layout-probe.json, paint-probe.json: read-only source geometry, semantic content/paint/filter observations used to diagnose root causes.
- round6/checks.json, test-results.json, audit.json, build.log, tests.log, format.log: final checks.
- round6/detail-{quotes,cases,tone,press}-{390,768,1440}.png: aligned component crops; reference/ and local/ hold full captures.
- Source captures contain bounded DOM/style evidence, not generated implementation copied into src. Original art/fonts remain source-listed in src/data/assets.json; no new runtime asset was downloaded.

Run npm ci, npx playwright install chromium (first setup only), npm run build, npm test, npm run format:check, npm audit. For current visual reproduction start npm run preview -- --port 4321, then WIDTHS=390,768,1440 node scripts/round6-capture.mjs; node scripts/round6-compare.mjs. LOCAL_ONLY=1 preserves this round's reference captures when refreshing only native files. BASE_URL overrides the local server. Read-only source probes are scripts/round6-{reference-components,layout-probe,paint-probe}.mjs. node scripts/report.mjs regenerates this report from saved final results.

## Honest limits / next gate

Exact visual equivalence is **not established**. Current static whole-page deltas range−2 to+5px; component-level differences can cancel. Fine typography/raster, native rail contours, background paint/phase, some specimen/logo spacing and independently implemented animation timing/task arrangement can still differ. Native task streams, counters and gauges are not phase-identical to the original; complete-cycle highlighting/newlines, pivots, visible needles and reduced motion remain covered. Safari/Firefox/physical-device rendering and every outbound/download payload are unverified. Local forms deliberately say Not sent and do not transmit; pending redirect destinations remain unguessed. These intentional limits were not hidden behind pixel percentages.

The existing independent tester must review the **new exact SHA**. Earlier approval covered c7231bf, not this revision. Do not mark the objective complete from this handoff. No PR/publication is authorized. The local ref is fetchable through the repository's shared object store; main can inspect git show <SHA> or create its review worktree without networking. Main/card were not mutated.
`,
);
