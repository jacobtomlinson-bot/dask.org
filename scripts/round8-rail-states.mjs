import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { referenceBrowser } from './reference-browser.mjs';
const refs = await referenceBrowser(),
  browser = await chromium.launch();
const context = await browser.newContext({ reducedMotion: 'reduce' }),
  rows = [];
try {
  for (const width of [390, 1440])
    for (const [label, c, root] of [
      ['reference', refs.context, 'https://www.dask.org'],
      ['local', context, process.env.BASE_URL || 'http://127.0.0.1:4321'],
    ]) {
      const p = await c.newPage();
      await p.setViewportSize({ width, height: 1000 });
      await p.goto(root + '/brand-guide');
      await p.evaluate(() => document.fonts.ready);
      for (const state of ['colors', 'tone']) {
        await p.locator(`a[href="#${state}"]`).first().click();
        await p.waitForTimeout(2200);
        const nav = p.locator('a[href="#tone"]').first().locator('..');
        rows.push({
          width,
          label,
          state,
          items: await nav.locator('a').evaluateAll((es) =>
            es.map((e) => {
              let s = getComputedStyle(e);
              return {
                href: e.getAttribute('href'),
                cls: e.className,
                current: e.getAttribute('aria-current'),
                background: s.backgroundColor,
                color: s.color,
                radius: s.borderRadius,
              };
            }),
          ),
        });
        await nav.screenshot({
          path: `evidence/round8/${label}/rail-settled-${state}-${width}.png`,
        });
      }
      await p.close();
    }
} finally {
  await refs.browser.close();
  await browser.close();
  await fs.writeFile(
    'evidence/round8/rail-settled-states.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
