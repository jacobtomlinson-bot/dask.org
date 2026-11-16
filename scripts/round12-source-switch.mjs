import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const { browser, context } = await referenceBrowser(),
  p = await context.newPage(),
  rows = [];
try {
  for (const width of [768, 769, 991, 992, 1100, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto('https://www.dask.org');
    await p.evaluate(() => document.fonts.ready);
    const first = p.getByRole('tab', {
        name: 'Open Source Deployment',
        exact: true,
      }),
      second = p.getByRole('tab', { name: 'Managed Cloud', exact: true });
    await first.click();
    const fixed = await first.evaluate((e) => {
      const r = e.getBoundingClientRect(),
        size = parseFloat(getComputedStyle(e).backgroundSize);
      return { x: r.right - size / 2, y: r.y + r.height / 2 };
    });
    assert.ok(Number.isFinite(fixed.x));
    for (const start of [0, 1]) {
      await (start ? second : first).click();
      const phases = [];
      for (let i = 0; i < 4; i++) {
        const hit = await p.evaluate(
          ({ x, y }) =>
            document
              .elementFromPoint(x, y)
              ?.closest('[role=tab]')
              ?.getAttribute('data-w-tab'),
          fixed,
        );
        await p.mouse.click(fixed.x, fixed.y);
        await p.waitForTimeout(150);
        const selected = await second.getAttribute('aria-selected');
        assert.equal(selected, (start + i + 1) % 2 ? 'true' : 'false');
        phases.push({ hit, selected });
      }
      rows.push({ width, start, fixed, phases });
    }
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round12/source-switch.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
console.log(rows.length, 'original fixed-center reversal sequences');
