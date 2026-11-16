import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { referenceBrowser } from './reference-browser.mjs';
const dir = 'evidence/round14/cases';
await fs.mkdir(dir, { recursive: true });
const reference = await referenceBrowser({ reducedMotion: 'reduce' }),
  browser = await chromium.launch(),
  rows = [];
try {
  for (const [label, context, base] of [
    ['reference', reference.context, 'https://www.dask.org'],
    [
      'local',
      await browser.newContext({ reducedMotion: 'reduce' }),
      process.env.BASE_URL || 'http://127.0.0.1:4321',
    ],
  ]) {
    const p = await context.newPage();
    for (const width of [
      390, 479, 480, 601, 767, 768, 769, 991, 992, 1100, 1440,
    ]) {
      await p.setViewportSize({ width, height: 1000 });
      await p.goto(base);
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 20));
        }
        scrollTo({ top: 0, behavior: 'instant' });
      });
      await p.waitForTimeout(350);
      const box = await p
          .getByRole('heading', { name: 'Use Cases', exact: true })
          .evaluate((e) => {
            let r = e.closest('section').getBoundingClientRect();
            return { y: r.y + scrollY, h: r.height };
          }),
        full = PNG.sync.read(await p.screenshot({ fullPage: true })),
        image = new PNG({ width, height: Math.round(box.h) });
      PNG.bitblt(full, image, 0, Math.round(box.y), width, image.height, 0, 0);
      await fs.writeFile(`${dir}/${label}-${width}.png`, PNG.sync.write(image));
      rows.push({ label, width, box });
    }
    await p.close();
  }
  for (const width of [
    390, 479, 480, 601, 767, 768, 769, 991, 992, 1100, 1440,
  ]) {
    const a = PNG.sync.read(await fs.readFile(`${dir}/reference-${width}.png`)),
      b = PNG.sync.read(await fs.readFile(`${dir}/local-${width}.png`)),
      pair = new PNG({
        width: width * 2,
        height: Math.max(a.height, b.height),
      });
    pair.data.fill(255);
    PNG.bitblt(a, pair, 0, 0, a.width, a.height, 0, 0);
    PNG.bitblt(b, pair, 0, 0, b.width, b.height, width, 0);
    await fs.writeFile(`${dir}/pair-${width}.png`, PNG.sync.write(pair));
  }
} finally {
  await reference.browser.close();
  await browser.close();
  await fs.writeFile(
    dir + '/captures.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
console.log(rows.length, 'fresh foreground Use Cases section crops');
