import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
const { browser, context } = await referenceBrowser(),
  rows = [];
try {
  for (const width of [390, 479, 480, 601, 767, 768, 769, 991, 992, 1440]) {
    let p = await context.newPage();
    await p.setViewportSize({ width, height: 1000 });
    await p.goto('https://www.dask.org/get-started');
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 40));
      }
      scrollTo({ top: 0, behavior: 'instant' });
    });
    await p.waitForTimeout(700);
    rows.push({
      width,
      ...(await p.evaluate(() => ({
        lines: [
          ...document.querySelectorAll('.get-st-card .bg-line-black'),
        ].map((e) => {
          const r = e.getBoundingClientRect(),
            b = e.parentElement
              .querySelector('.blog-title')
              .getBoundingClientRect();
          return {
            x: r.x - b.x,
            y: r.y - b.y,
            w: r.width,
            h: r.height,
            color: getComputedStyle(e).backgroundColor,
          };
        }),
        art: [
          ...document.querySelectorAll('img[src*="illustration-get-started-"]'),
        ].map((e) => ({
          name: e.src.split('_').at(-1),
          fit: getComputedStyle(e).objectFit,
          position: getComputedStyle(e).objectPosition,
        })),
      }))),
    });
    await p.close();
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round9/reference-learn-paint.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
