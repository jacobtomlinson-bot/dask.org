import { referenceBrowser } from './reference-browser.mjs';
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const ref = await referenceBrowser(),
  browser = await chromium.launch(),
  base = process.env.BASE_URL || 'http://127.0.0.1:4321',
  rows = process.env.LOCAL_ONLY
    ? JSON.parse(
        await fs.readFile('evidence/round3/states/results.json', 'utf8'),
      ).filter((r) => r.label === 'reference')
    : [];
await fs.mkdir('evidence/round3/states', { recursive: true });
async function snap(p, selector, name, label) {
  const el = p.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  await el.screenshot({ path: `evidence/round3/states/${name}-${label}.png` });
  return await el.evaluate((e) => ({
    rect: e.getBoundingClientRect().toJSON(),
    pre: [...e.querySelectorAll('pre')]
      .filter((x) => x.getBoundingClientRect().width)
      .map((x) => ({
        text: x.textContent,
        font: getComputedStyle(x).fontSize,
        line: getComputedStyle(x).lineHeight,
        whiteSpace: getComputedStyle(x).whiteSpace,
        height: x.getBoundingClientRect().height,
        scrollWidth: x.scrollWidth,
        width: x.clientWidth,
      })),
  }));
}
try {
  for (const width of [767, 768, 769, 991, 992]) {
    const a = await ref.context.newPage(),
      b = await browser.newPage({ reducedMotion: 'reduce' });
    for (const [p, root, label] of [
      ...(process.env.LOCAL_ONLY
        ? []
        : [[a, 'https://www.dask.org', 'reference']]),
      [b, base, 'local'],
    ]) {
      await p.setViewportSize({ width, height: 900 });
      await p.goto(root, { waitUntil: 'networkidle' });
      for (let i = 0; i < 4; i++) {
        await p
          .locator(
            label === 'local'
              ? '.workload-tabs [role=tab]'
              : '.home-tabs [role=tab]',
          )
          .nth(i)
          .click();
        rows.push({
          width,
          label,
          state: 'workload-' + i,
          ...(await snap(
            p,
            label === 'local' ? '.workload-tabs' : '.home-tabs-wr',
            `workload-${i}-${width}`,
            label,
          )),
        });
      }
      for (let i = 0; i < 2; i++) {
        await p
          .locator(
            label === 'local'
              ? '.deployment [role=tab]'
              : '.run-dask-tabs [role=tab]',
          )
          .nth(i)
          .click();
        rows.push({
          width,
          label,
          state: 'deployment-' + i,
          ...(await snap(
            p,
            label === 'local' ? '.deployment' : '.run-dask-tabs',
            `deployment-${i}-${width}`,
            label,
          )),
        });
      }
      await p.goto(root + '/get-started', { waitUntil: 'networkidle' });
      rows.push({
        width,
        label,
        state: 'install',
        ...(await snap(
          p,
          label === 'local' ? '.install-section' : '.hero-columns.get-started',
          `install-${width}`,
          label,
        )),
      });
      await p.close();
    }
  }
} finally {
  await ref.browser.close();
  await browser.close();
  await fs.writeFile(
    'evidence/round3/states/results.json',
    JSON.stringify(rows, null, 2),
  );
}
console.log(rows.length + ' state captures');
