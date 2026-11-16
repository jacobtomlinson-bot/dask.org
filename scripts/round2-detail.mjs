import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const p = await context.newPage();
await p.setViewportSize({ width: 390, height: 900 });
const all = [];
for (const route of ['', 'brand-guide']) {
  await p.goto('https://www.dask.org/' + route, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  const data = await p
    .locator('div,section,p,a,img,pre,code')
    .evaluateAll((es) =>
      es
        .map((e) => {
          let r = e.getBoundingClientRect(),
            s = getComputedStyle(e);
          return {
            tag: e.tagName,
            cls: e.className,
            text: e.children.length ? '' : e.textContent.trim().slice(0, 80),
            src: e.getAttribute('src'),
            r: [r.x, r.y, r.width, r.height],
            font: s.font,
            weight: s.fontWeight,
            padding: s.padding,
            margin: s.margin,
            bg: s.backgroundImage,
            size: s.backgroundSize,
            repeat: s.backgroundRepeat,
          };
        })
        .filter(
          (e) =>
            e.r[2] &&
            e.r[3] &&
            (e.bg !== 'none' ||
              e.tag === 'PRE' ||
              e.tag === 'CODE' ||
              e.cls.includes('performance') ||
              e.text.includes('#FFFFFF') ||
              e.text.includes('Dask DataFrames') ||
              e.cls.includes('logo') ||
              e.cls.includes('home-tab')),
        ),
    );
  all.push({ route, data });
}
await fs.writeFile(
  'evidence/round2/reference/details.json',
  JSON.stringify(all, null, 2),
);
await browser.close();
