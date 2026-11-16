import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const out = [];
try {
  for (const width of [390, 601, 768]) {
    const p = await context.newPage();
    await p.setViewportSize({ width, height: 900 });
    await p.goto('https://www.dask.org/brand-guide');
    await p.evaluate(() => document.fonts.ready);
    out.push({
      width,
      grids: await p.evaluate(() =>
        [...document.querySelectorAll('*')]
          .filter((e) => {
            const s = getComputedStyle(e);
            return s.backgroundImage.includes('vector-grid');
          })
          .map((e) => ({
            cls: e.className,
            image: getComputedStyle(e).backgroundImage,
            size: getComputedStyle(e).backgroundSize,
            repeat: getComputedStyle(e).backgroundRepeat,
            position: getComputedStyle(e).backgroundPosition,
          })),
      ),
    });
    await p.close();
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round3/reference-grids.json',
    JSON.stringify(out, null, 2),
  );
}
console.log(JSON.stringify(out, null, 2));
