import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
import { chromium } from '@playwright/test';
const local = process.env.LOCAL_ONLY === '1',
  out = [];
const { browser, context } = local
  ? await (async () => {
      const browser = await chromium.launch();
      return {
        browser,
        context: await browser.newContext({ reducedMotion: 'reduce' }),
      };
    })()
  : await referenceBrowser();
const base = local
  ? process.env.BASE_URL || 'http://127.0.0.1:4321'
  : 'https://www.dask.org';
try {
  for (const width of [
    390, 479, 480, 601, 767, 768, 769, 991, 992, 1100, 1440,
  ]) {
    const p = await context.newPage();
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(base + '/press-mentions');
    await p.evaluate(() => document.fonts.ready);
    const dividers = await p.evaluate(
      (local) =>
        [
          ...document.querySelectorAll(local ? '.press-card' : '.press-r-link'),
        ].map((e) => {
          const d = e.querySelector(local ? '.press-divider' : '.pr-line'),
            r = d.getBoundingClientRect(),
            c = e.getBoundingClientRect();
          return {
            x: r.x,
            y: r.y - c.y,
            w: r.width,
            h: r.height,
            color: getComputedStyle(d).backgroundColor,
          };
        }),
      local,
    );
    await p.goto(base + '/');
    const controls = await p.evaluate((local) => {
      const frame = document.querySelector(
          local ? '.home-install > .terminal' : '.getstarted-code-wr',
        ),
        f = frame.getBoundingClientRect();
      return [
        ...frame.querySelectorAll(
          local
            ? '.window-bar,.window-bar i'
            : '.performance-code-top,.tap-code-top-dot',
        ),
      ].map((e) => {
        const r = e.getBoundingClientRect();
        return {
          x: r.x - f.x,
          y: r.y - f.y,
          w: r.width,
          h: r.height,
          color: getComputedStyle(e).backgroundColor,
        };
      });
    }, local);
    out.push({ width, dividers, controls });
    await p.close();
  }
} finally {
  await browser.close();
  await fs.writeFile(
    `evidence/round10/${local ? 'local' : 'reference'}-dividers.json`,
    JSON.stringify(out, null, 2),
  );
}
console.log('99 press dividers and 44 closing controls measured.');
