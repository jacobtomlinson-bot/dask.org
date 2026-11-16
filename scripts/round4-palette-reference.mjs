import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
const ref = await referenceBrowser(),
  rows = [];
try {
  for (const width of [479, 480, 601, 767, 768]) {
    const p = await ref.context.newPage();
    await p.setViewportSize({ width, height: 1000 });
    await p.goto('https://www.dask.org/brand-guide');
    await p.evaluate(() => document.fonts.ready);
    await p.locator('#colors').scrollIntoViewIfNeeded();
    await p.waitForTimeout(400);
    rows.push({
      width,
      colors: await p
        .locator('.br-g-colors-tabs [role=tab]')
        .evaluateAll((es) =>
          es.map((e) => {
            let s = getComputedStyle(e);
            return {
              text: e.textContent.trim(),
              r: e.getBoundingClientRect().toJSON(),
              padding: s.padding,
              font: s.fontSize,
              line: s.lineHeight,
            };
          }),
        ),
    });
    await p.locator('#colors').screenshot({
      path: `evidence/round4/reference-palette-${width}.png`,
    });
    await p.close();
  }
} finally {
  await ref.browser.close();
  await fs.writeFile(
    'evidence/round4/reference-palette.json',
    JSON.stringify(rows, null, 2),
  );
}
