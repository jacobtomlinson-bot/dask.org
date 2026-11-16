import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { referenceBrowser } from './reference-browser.mjs';
const refs = await referenceBrowser({ deviceScaleFactor: 8 });
const browser = await chromium.launch();
const context = await browser.newContext({
  deviceScaleFactor: 8,
  reducedMotion: 'reduce',
});
try {
  for (const [label, c, root] of [
    ['reference', refs.context, 'https://www.dask.org'],
    ['local', context, process.env.BASE_URL || 'http://127.0.0.1:4321'],
  ]) {
    const p = await c.newPage();
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p.goto(root + '/brand-guide');
    await p.evaluate(() => document.fonts.ready);
    const nav = p.locator('a[href="#tone"]').first().locator('..');
    for (const [i, e] of (await nav.locator('svg').all()).entries())
      await e.screenshot({
        path: `evidence/round8/${label}/icon-hires-${i + (label === 'local' ? 1 : 0)}.png`,
      });
    await p.close();
  }
} finally {
  await refs.browser.close();
  await browser.close();
}
