import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
const { browser, context } = await referenceBrowser();
const rows = [];
try {
  for (const width of [390, 479, 480, 601, 767, 768, 769, 991, 992, 1440]) {
    const p = await context.newPage();
    await p.setViewportSize({ width, height: 1000 });
    await p.goto('https://www.dask.org/brand-guide');
    await p.evaluate(() => document.fonts.ready);
    const data = await p
      .locator('a[href="#tone"]')
      .first()
      .evaluate((last) => {
        const group = last.parentElement,
          bar = group.parentElement;
        const origin = bar.getBoundingClientRect();
        const box = (e) => {
          const r = e.getBoundingClientRect();
          return {
            x: r.x,
            y: r.y - origin.y,
            width: r.width,
            height: r.height,
          };
        };
        return {
          bar: box(bar),
          items: [...group.querySelectorAll('a')].map((e) => ({
            box: box(e),
            icon: box(e.querySelector('svg')),
          })),
        };
      });
    rows.push({ width, ...data });
    const group = p.locator('a[href="#tone"]').first().locator('..');
    await group.screenshot({
      path: `evidence/round8/reference/rail-${width}.png`,
    });
    for (const [i, e] of (await group.locator('svg').all()).entries())
      await e.screenshot({
        path: `evidence/round8/reference/icon-${width}-${i}.png`,
      });
    await p.close();
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round8/rail-reference.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
