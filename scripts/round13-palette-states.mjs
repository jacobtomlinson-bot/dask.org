import { referenceBrowser } from './reference-browser.mjs';
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import fs from 'node:fs/promises';
const ref = await referenceBrowser({ reducedMotion: 'reduce' }),
  b = await chromium.launch(),
  rows = [],
  dir = 'evidence/round13';
try {
  for (const [label, context, base] of [
    ['reference', ref.context, 'https://www.dask.org'],
    [
      'local',
      await b.newContext({ reducedMotion: 'reduce' }),
      process.env.BASE_URL || 'http://127.0.0.1:4321',
    ],
  ]) {
    const p = await context.newPage();
    for (const width of [479, 480, 601, 767, 768]) {
      await p.setViewportSize({ width, height: 1000 });
      await p.goto(base + '/brand-guide');
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 20));
        }
      });
      for (const hex of ['#FC6E6B', '#FFFFFF']) {
        await p
          .locator(
            label === 'local'
              ? '[data-color="' + hex + '"]'
              : '.br-g-colors-tabs-menu [role=tab]',
          )
          .filter(label === 'local' ? {} : { hasText: hex })
          .click();
        await p.waitForTimeout(400);
        await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await p.mouse.move(0, 0);
        const box = await p.evaluate((local) => {
          const h = [...document.querySelectorAll('h2')].find(
              (e) =>
                e.textContent.trim() === 'Colors' &&
                e.getBoundingClientRect().width,
            ),
            s = local ? h.closest('#colors') : h.closest('section'),
            r = s.getBoundingClientRect(),
            t = document.querySelector('#typography'),
            next = [...t.querySelectorAll('h2')]
              .find((e) => e.getBoundingClientRect().width)
              .getBoundingClientRect(),
            grid = s.querySelector(
              local ? '.palette-grid' : '.br-g-colors-tabs-menu',
            );
          return {
            top: Math.floor(r.y + scrollY),
            height:
              Math.ceil(next.bottom + scrollY + 30) - Math.floor(r.y + scrollY),
            next: t.getBoundingClientRect().y - r.y,
            cells: [...grid.querySelectorAll(local ? 'button' : 'a')].map(
              (e) => {
                const a = e.getBoundingClientRect();
                return {
                  hex: e.textContent.trim(),
                  x: a.x,
                  y: a.y - r.y,
                  w: a.width,
                  h: a.height,
                };
              },
            ),
          };
        }, label === 'local');
        const full = PNG.sync.read(await p.screenshot({ fullPage: true })),
          crop = new PNG({ width, height: box.height });
        PNG.bitblt(full, crop, 0, box.top, width, box.height, 0, 0);
        await fs.writeFile(
          `${dir}/${label}/palette-${width}-${hex === '#FFFFFF' ? 'white' : 'salmon'}-boundary.png`,
          PNG.sync.write(crop),
        );
        rows.push({ label, width, hex, ...box });
      }
    }
    await p.close();
  }
} finally {
  await ref.browser.close();
  await b.close();
  await fs.writeFile(
    dir + '/palette-selected.json',
    JSON.stringify(rows, null, 2),
  );
}
console.log(rows.length, 'fresh palette/boundary state captures');
