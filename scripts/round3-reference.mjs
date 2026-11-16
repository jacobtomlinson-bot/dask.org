import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const p = await context.newPage();
const out = [];
try {
  for (const route of ['brand-guide', 'get-started', '']) {
    await p.goto('https://www.dask.org/' + route, {
      waitUntil: 'domcontentloaded',
    });
    await p.evaluate(() => document.fonts.ready);
    for (const width of [390, 480, 601, 767, 768, 992, 1440]) {
      await p.setViewportSize({ width, height: 900 });
      await p.waitForTimeout(500);
      await p.evaluate(() => scrollTo(0, 0));
      out.push({
        route,
        width,
        metrics: await p.evaluate(() => {
          const h = document.querySelector('h1');
          const section = h.closest('section');
          const els = [
            ...new Set([
              document.elementFromPoint(10, 10),
              document.querySelector('img'),
              h,
              h.parentElement,
              h.parentElement.parentElement,
              h.parentElement.querySelector('p'),
              document.querySelector('.sticky-sidebar'),
              document.querySelector('#logos h2'),
            ]),
          ].filter(Boolean);
          return els.map((e) => {
            const s = getComputedStyle(e),
              r = e.getBoundingClientRect();
            return {
              tag: e.tagName,
              cls: e.className,
              text: e.textContent.slice(0, 50),
              x: r.x,
              y: r.y,
              w: r.width,
              h: r.height,
              font: s.fontSize,
              line: s.lineHeight,
              padding: s.padding,
              display: s.display,
              gap: s.gap,
            };
          });
        }),
      });
      if (route === 'brand-guide')
        await p.screenshot({
          path: `evidence/round3/reference-stable-brand-${width}.png`,
        });
    }
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round3/reference-stable.json',
    JSON.stringify(out, null, 2),
  );
}
