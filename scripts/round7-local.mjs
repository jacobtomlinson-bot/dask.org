import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { measureTone, screenshotTone } from './tone-measure.mjs';
const b = await chromium.launch(),
  rows = [];
try {
  const p = await b.newPage({ reducedMotion: 'reduce' });
  for (const width of [390, 479, 480, 601, 767, 768, 769, 991, 992, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(
      (process.env.BASE_URL || 'http://127.0.0.1:4321') + '/brand-guide',
    );
    await p.evaluate(() => document.fonts.ready);
    rows.push({ width, ...(await measureTone(p)) });
    if (!process.env.BASELINE)
      await screenshotTone(p, `evidence/round7/local/tone-${width}.png`);
  }
} finally {
  await b.close();
  await fs.writeFile(
    `evidence/round7/${process.env.BASELINE ? 'accepted-phone-baseline' : 'local'}.json`,
    JSON.stringify(rows, null, 2) + '\n',
  );
}
