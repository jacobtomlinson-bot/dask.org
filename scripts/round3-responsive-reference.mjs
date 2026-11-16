import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const rows = [];
await fs.mkdir('evidence/round3/reference', { recursive: true });
try {
  for (const route of [
    '',
    'get-started',
    'get-help',
    'powered-by',
    'brand-guide',
    'press-mentions',
  ]) {
    const p = await context.newPage();
    for (const width of [320, 479, 480, 599, 600, 601, 767, 991, 992]) {
      await p.setViewportSize({ width, height: 900 });
      await p.goto('https://www.dask.org/' + route, {
        waitUntil: 'networkidle',
      });
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 800) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 15));
        }
        scrollTo(0, 0);
      });
      await p.waitForTimeout(300);
      await p.screenshot({
        path: `evidence/round3/reference/${route || 'home'}-${width}.png`,
        fullPage: true,
      });
      rows.push({
        route: route || 'home',
        width,
        data: await p.evaluate(() => ({
          height: document.body.scrollHeight,
          h1: getComputedStyle(document.querySelector('h1')).fontSize,
          sections: [...document.querySelectorAll('section')].map((e) => ({
            cls: e.className,
            ...e.getBoundingClientRect().toJSON(),
          })),
        })),
      });
    }
    await p.close();
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round3/responsive-reference.json',
    JSON.stringify(rows, null, 2),
  );
}
console.log(rows.length + ' responsive original captures');
