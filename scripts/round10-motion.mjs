import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const b = await chromium.launch(),
  out = [];
try {
  for (const width of [320, 360, 390, 479]) {
    const p = await b.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: 'no-preference',
    });
    await p.goto((process.env.BASE_URL || 'http://127.0.0.1:4321') + '/');
    await p.evaluate(() => document.fonts.ready);
    await p.locator('.humans .performance-copy').scrollIntoViewIfNeeded();
    const samples = [];
    for (let i = 0; i < 80; i++) {
      samples.push(
        await p.locator('.humans').evaluate((e) => {
          const copy = e.querySelector('.performance-copy'),
            ps = [...copy.querySelectorAll('p')],
            code = e.querySelector('code'),
            range = document.createRange();
          range.selectNodeContents(copy);
          const r = range.getBoundingClientRect();
          return {
            state: e.querySelector('.terminal').dataset.typing,
            frame: e.querySelector('.terminal').dataset.frame,
            code: code.textContent,
            syntax: code.querySelectorAll('span').length,
            row: e.getBoundingClientRect().width,
            copy: copy.getBoundingClientRect().width,
            lastHeight: ps.at(-1).getBoundingClientRect().height,
            lines: ps.at(-1).textContent,
            doc: document.documentElement.scrollWidth,
            inkRight: r.right,
          };
        }),
      );
      await p.waitForTimeout(180);
    }
    const complete = samples.filter((s) => s.state === 'complete');
    assert.ok(
      complete.some((s) => s.frame === '0'),
      'pandas cycle completes',
    );
    assert.ok(
      complete.some((s) => s.frame === '1'),
      'dask cycle completes',
    );
    assert.ok(
      complete.every((s) => s.syntax >= 3 && s.code.includes('\n\n')),
      'highlighting and newline structure persist',
    );
    assert.ok(
      samples.every((s) => s.doc === width),
      'no horizontal document overflow',
    );
    assert.ok(
      samples.every((s) => s.inkRight <= width + 0.3),
      'all copy ink remains inside viewport',
    );
    const quiet =
        samples.find((s) => !s.state) ||
        samples.reduce((a, b) => (a.copy < b.copy ? a : b)),
      pd = complete.find((s) => s.frame === '0'),
      dd = complete.find((s) => s.frame === '1');
    if (width === 390 || width === 479) {
      const expected =
        width === 390
          ? [329.421875, 350.9375, 363.09375]
          : [404.59375, 430.65625, 445.5625];
      [quiet, pd, dd].forEach((s, i) =>
        assert.ok(
          Math.abs(s.copy - expected[i]) < 0.8,
          `${width} phase ${i}: ${s.copy} vs ${expected[i]}`,
        ),
      );
      assert.ok(
        width !== 390 || quiet.lastHeight > pd.lastHeight,
        'copy genuinely rewraps, not a painted width change',
      );
    }
    out.push({ width, samples });
    await p.screenshot({ path: `evidence/round10/human-local-${width}.png` });
    await p.close();
  }
  for (const width of [390, 479]) {
    const p = await b.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: 'reduce',
    });
    await p.goto((process.env.BASE_URL || 'http://127.0.0.1:4321') + '/');
    await p.locator('.humans').scrollIntoViewIfNeeded();
    const before = await p
      .locator('.humans')
      .evaluate((e) => e.getBoundingClientRect().width);
    await p.waitForTimeout(1500);
    assert.equal(
      await p
        .locator('.humans')
        .evaluate((e) => e.getBoundingClientRect().width),
      before,
    );
    assert.equal(await p.locator('.humans[data-intrinsic]').count(), 0);
    await p.close();
  }
} finally {
  await b.close();
  await fs.writeFile(
    'evidence/round10/human-local.json',
    JSON.stringify(out, null, 2),
  );
}
console.log(
  '4 phone normal-motion cycles and 2 reduced-motion states passed: intrinsic widths, rewrapping, intact tokens/newlines, unclipped ink and no document overflow.',
);
