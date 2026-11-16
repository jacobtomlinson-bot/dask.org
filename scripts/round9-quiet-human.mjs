import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
import { measureLayout } from './measure-layout.mjs';
const { browser, context } = await referenceBrowser(),
  rows = [];
try {
  for (const width of [390, 479]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('https://www.dask.org/');
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 40));
      }
      scrollTo({ top: 0, behavior: 'instant' });
    });
    const expected = (329.421875 * width) / 390;
    await page.waitForFunction(
      (expected) =>
        Math.abs(
          document
            .querySelectorAll('.performance-text-content')[1]
            .getBoundingClientRect().width - expected,
        ) < 0.1,
      expected,
      { timeout: 15000 },
    );
    const result = await page.evaluate(measureLayout, {
      selectors: ['.performance-text-content'],
    });
    rows.push({
      width,
      phase: 'quiet source grid width (not altered/frozen)',
      group: result.groups['.performance-text-content'][1],
    });
    await page.close();
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round9/reference-quiet-human.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
