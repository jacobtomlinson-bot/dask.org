import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const p = await context.newPage();
await p.setViewportSize({ width: 390, height: 900 });
const rows = [];
for (const slug of ['brand-guide', 'get-help', 'press-mentions']) {
  await p.goto('https://www.dask.org/' + slug, { waitUntil: 'networkidle' });
  const d = await p.locator('p,img,a,div').evaluateAll((es) =>
    es
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return (
          r.width &&
          ((e.tagName === 'P' && e.closest('.typography')) ||
            (e.tagName === 'IMG' && e.closest('.footer')) ||
            (e.tagName === 'IMG' && e.src.includes('anaconda')) ||
            (e.tagName === 'IMG' && e.closest('.press-mentions-item')) ||
            (/news|press|support/.test(e.className) && e.children.length < 3))
        );
      })
      .map((e) => {
        const r = e.getBoundingClientRect(),
          s = getComputedStyle(e);
        return {
          tag: e.tagName,
          cls: e.className,
          text: e.textContent.trim().slice(0, 70),
          src: e.getAttribute('src'),
          r: [r.x, r.y, r.width, r.height],
          font: s.font,
          padding: s.padding,
          margin: s.margin,
          border: s.border,
          borderTop: s.borderTop,
        };
      }),
  );
  rows.push({ slug, data: d });
  console.log(slug, d);
}
await fs.writeFile(
  'evidence/round2/reference/mobile-details.json',
  JSON.stringify(rows, null, 2),
);
await browser.close();
