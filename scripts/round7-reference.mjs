import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
import { measureTone, screenshotTone } from './tone-measure.mjs';
const { browser, context } = await referenceBrowser(),
  rows = [];
try {
  for (const width of [390, 479, 480, 601, 767, 768, 769, 991, 992, 1440]) {
    const p = await context.newPage();
    await p.setViewportSize({ width, height: 1000 });
    await p.goto('https://www.dask.org/brand-guide');
    await p.evaluate(() => document.fonts.ready);
    const data = await measureTone(p);
    rows.push({ width, ...data });
    await screenshotTone(p, `evidence/round7/reference/tone-${width}.png`);
    await p.close();
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round7/reference.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
