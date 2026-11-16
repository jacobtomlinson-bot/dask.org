// Capture below-fold content only after scrolling through every section to trigger native lazy artwork.
import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const results = [];
try {
  for (const [view, width, height] of [
    ['desktop', 1440, 1000],
    ['tablet', 768, 900],
    ['mobile', 390, 900],
  ])
    for (const slug of [
      'home',
      'get-started',
      'get-help',
      'powered-by',
      'brand-guide',
      'press-mentions',
    ]) {
      const p = await context.newPage();
      await p.setViewportSize({ width, height });
      await p.goto('https://www.dask.org/' + (slug === 'home' ? '' : slug), {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      await p.evaluate(() => document.fonts.ready);
      const total = await p.evaluate(
        () => document.documentElement.scrollHeight,
      );
      for (let y = 0; y < total; y += height * 0.8) {
        await p.evaluate((y) => scrollTo(0, y), y);
        await p.waitForTimeout(100);
      }
      await p.waitForTimeout(1200);
      await p.evaluate(() => scrollTo(0, 0));
      await p.waitForTimeout(500);
      await p.screenshot({
        path: `evidence/reference/${slug}-${view}-scrolled.png`,
        fullPage: true,
      });
      results.push({
        slug,
        view,
        width,
        height,
        pageHeight: await p.evaluate(
          () => document.documentElement.scrollHeight,
        ),
        brokenImages: await p
          .locator('img')
          .evaluateAll((images) =>
            images
              .filter((i) => !i.complete || !i.naturalWidth)
              .map((i) => i.src),
          ),
      });
      await fs.writeFile(
        'evidence/reference/scrolled.json',
        JSON.stringify(results, null, 2),
      );
      await p.close();
      console.log(slug, view);
    }
} finally {
  await browser.close();
}
