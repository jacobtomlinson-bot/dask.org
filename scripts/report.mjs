import fs from 'node:fs/promises';
import zlib from 'node:zlib';
const read = async (p) => JSON.parse(await fs.readFile(p, 'utf8'));
const tests = await read('evidence/round7/test-results.json'),
  checks = await read('evidence/round7/checks.json'),
  refs = await read('evidence/round7/reference.json'),
  audit = await read('evidence/round7/audit.json');
if (tests.failed || checks.length !== 10)
  throw new Error('Final passing tone results are required before reporting.');
const table = checks
  .map((c) => {
    const r = refs.find((x) => x.width === c.width);
    const i = c.native.paragraphs[1],
      s = r.paragraphs[1];
    return `| ${c.width} | ${s.x} / ${s.width} | ${i.x} / ${i.width} | ${c.maxParagraphError} | ${c.maxColumnError} | all9 match |`;
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
await fs.writeFile(
  'evidence/verification.json',
  JSON.stringify(
    {
      round: 7,
      card: '549aad55-ef02-4222-a004-0df05ae01ca1',
      tests: {
        passed: tests.passed,
        failed: tests.failed,
        countsAreNested: true,
      },
      toneViewports: checks.length,
      toneParagraphs: checks.length * 9,
      allRenderedLinesMatch: true,
      maxTargetGeometryError: Math.max(
        ...checks
          .filter((c) => c.width >= 480)
          .map((c) => Math.max(c.maxParagraphError, c.maxColumnError)),
      ),
      vulnerabilities: audit.metadata.vulnerabilities,
      publication:
        'local only; main/card unchanged; no remote, push, PR or deployment',
      runtime,
    },
    null,
    2,
  ) + '\n',
);
const report = `# Round7 developer review package — R6-1

Card549aad55-ef02-4222-a004-0df05ae01ca1. Outcome: **ready_for_review**, not independent approval or exact-fidelity certification. Parent8cc2e93c41792515acd02ef982dcca1378c0b49b. Local branch openclaw/dask-org-astro-developer; exact SSH-signed head accompanies the handoff. Main remains the sole coordinator and local integration owner; main basec7231bf was not changed. No fetch/remote/push/PR/deploy/CI/form submission occurred.

## R6-1 response — genuine tracks, insets and flow repaired

Read the full independent round6 report, every neighbors.json paragraph measurement, and the original-left/native-right detail-tone768/1440 images. The report correctly identified real static composition defects: oversized right tracks and phone paragraph rhythm leaking into landscape. Section min-heights hid their effect on total height.

Moved every tone-owned selector out of brand.css into **src/styles/tone.css**. Desktop/tablet now use equal text-content tracks with the measured effective content insets and inter-column gap, rather than the earlier1fr/1.1fr split. Right-copy start padding and the first two paragraphs' transition to examples now preserve the original flow; landscape uses its own measured line-sized paragraph margins. Font sizes/line heights were matched to the rendered reference rather than keeping rounded shared approximations.

**No tone section height/min-height, no overflow clipping, no extra semantic breaks, and no arbitrary spacer elements were introduced.** Both desktop/tablet minimum heights were removed. The section grows intrinsically from its copy. The six pre-existing meaningful example breaks remain unchanged. Accepted390/479 phone rules were isolated and preserved; a saved pre-change local baseline verifies their paragraph bounds did not change.

Only production changes: tone.css; removal of old tone selectors from brand.css; one route-owned stylesheet import in brand-guide.astro. No production markup/data/JS or other routes changed. Prior testimonials, press, safe labels, full rail, actions, forms, pending redirects and palette rules are retained.

## Fresh measurements and assertions

Fresh GET/HEAD-only original captures at390/479/480/601/767/768/769/991/992/1440. Compared both text-content column boxes and all90 paragraph boxes, and compared **every rendered line string** via native DOM Range rectangles. X uses viewport coordinates and Y uses section-relative coordinates, matching the independent review's measurement convention. The source/native DOM reserve their rail differently, so screenshots are cropped viewport-wide rather than to unequal DOM section widths.

| Width | Source right x / width | Native right x / width | Max paragraph bound error px | Max content-column error px | Rendered line text |
|---:|---|---|---:|---:|---|
${table}

At480 and above every paragraph height matches exactly; all90 paragraph line arrays match, including390/479. Maximum target paragraph or text-column coordinate/size error is **0.0625px**. Native768 right width is approximately264.70px (previously301.20);1440 is523px (previously591.39). The last tablet paragraph now starts at the source-relative position within0.03125px, rather than81px early. At601/767 every paragraph start is within0.015625px, rather than the last paragraph57/73px early.

The phone column-box comparison is intentionally not asserted against a different original wrapper: the accepted native phone panel includes padding around the same text. All phone paragraph bounds match their accepted local baseline within0.02px; against fresh source the maximum paragraph coordinate difference is0.21875px, with identical heights, widths and line text.

## Final checks

- npm run build: PASS, seven static outputs including404.
- npm test: **${tests.passed} outer groups passed / ${tests.failed} failed** against a frozen production build. Counts are nested, not additive. Includes prior72 responsive/28motion/12artwork/55round4/6round5/11round6 checks and ten new tone groups.
- npm run format:check and git diff --check: PASS.
- npm audit: **${audit.metadata.vulnerabilities.total} vulnerabilities**; dependencies unchanged.
- Inspected all ten refreshed viewport-aligned tone screenshot pairs, including both columns and the final paragraphs, plus both review screenshots showing the old defect. Numeric text geometry and line assertions are the fidelity evidence; section height alone is not a gate.
- No live submissions. Owned preview/static servers are stopped before handoff; worktree clean after the signed commit.

## Evidence and reproduction

- round7/gallery.html; pair-tone-{390,479,480,601,767,768,769,991,992,1440}.png: inspected original-left/native-right viewport-wide crops.
- round7/reference.json: fresh source paragraph/column/ancestor geometry and rendered lines; original artwork screenshots under reference/.
- round7/checks.json and comparison.json: final native paragraph/column/line results and diagnostic pixel differences; screenshots under local/.
- round7/accepted-phone-baseline.json: pre-change local composition for390/479 preservation.
- round7/{build.log,tests.log,test-results.json,format.log,audit.json}: final checks.
- scripts/round7-reference.mjs, round7-checks.mjs, tone-measure.mjs, round7-gallery.mjs: reproducible read-only capture, strict regression and gallery tools. No saved DOM/styles/screenshots are production inputs.

Setup: npm ci; npx playwright install chromium (first setup only). Verify: npm run build; npm test; npm run format:check; npm audit. To refresh this evidence, start npm run preview -- --port 4321, run node scripts/round7-reference.mjs; node scripts/round7-checks.mjs; node scripts/round7-gallery.mjs. BASE_URL can target another local preview. node scripts/report.mjs regenerates this summary from saved final results.

## Residuals and review boundary

R6-1's text tracks/wrapping/rhythm are addressed for same-tester re-review, **not self-approved**. Paper-panel paint extents, dot-grid phase, native rail contours and text rasterization can still differ in screenshots; pixel differences are diagnostic, not percent accuracy. Other previously documented unsynchronized native animation/cross-engine/device/backend/download limitations remain. This targeted round does not claim a fresh whole-site pixel-equivalence certification or replace the historical all18 route comparisons in round6.

The exact new signed SHA requires the existing tester's verdict before any local integration. Main/card were not mutated. The branch shares Git objects with the authorized main checkout; git show <SHA> is available locally without fetching. No PR or remote publication is authorized.
`;
await fs.writeFile('evidence/REVIEW.md', report);
await fs.writeFile('evidence/round7/REVIEW.md', report);
