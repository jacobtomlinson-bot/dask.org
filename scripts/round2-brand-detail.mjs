import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const p = await context.newPage();
await p.setViewportSize({ width: 390, height: 900 });
await p.goto('https://www.dask.org/brand-guide', { waitUntil: 'networkidle' });
const data = await p.locator('p,div,span').evaluateAll((es) =>
  es
    .filter(
      (e) =>
        (e.closest('.typography') || e.closest('.tone')) &&
        e.children.length === 0,
    )
    .map((e) => {
      const r = e.getBoundingClientRect(),
        s = getComputedStyle(e);
      return {
        text: e.textContent.trim().slice(0, 150),
        r: [r.x, r.y, r.width, r.height],
        font: s.font,
        margin: s.margin,
      };
    }),
);
console.log(data.slice(0, 55));
await fs.writeFile(
  'evidence/round2/reference/brand-type-details.json',
  JSON.stringify(data, null, 2),
);
await browser.close();
