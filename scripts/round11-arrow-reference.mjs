import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
const { browser, context } = await referenceBrowser(),
  page = await context.newPage(),
  rows = [];
try {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('https://www.dask.org/get-started');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(650);
    for (const [from, selector, to] of [
      ['Ecosystem', '.right-arrow', 'Case studies'],
      ['Case studies', '.left-arrow-middle', 'Ecosystem'],
      ['Case studies', '.right-arrow-middle', 'Examples'],
      ['Examples', '.left-arrow', 'Case studies'],
    ]) {
      await page.getByRole('tab', { name: from, exact: true }).click();
      await page.waitForTimeout(650);
      await page
        .locator('.possibil .w-tab-pane.w--tab-active')
        .locator(selector)
        .click();
      await page.waitForTimeout(650);
      const selected = (
        await page
          .locator('.possibil [role=tab][aria-selected=true]')
          .textContent()
      )
        .trim()
        .replace(/\s+/g, ' ');
      assert.equal(selected, to);
      rows.push({ width, from, selector, observed: selected });
    }
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round11/arrow-transitions-reference.json',
    JSON.stringify(rows, null, 2),
  );
}
console.log(
  rows.length +
    ' fresh source previous/next transitions verified without endpoint wrapping',
);
