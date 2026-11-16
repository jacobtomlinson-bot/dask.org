// Read-only reference inspection: POST, PUT, PATCH and DELETE are blocked by referenceBrowser.
import { referenceBrowser } from './reference-browser.mjs';
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
const ref = await referenceBrowser(),
  browser = await chromium.launch(),
  local = await browser.newContext({ reducedMotion: 'reduce' }),
  base = process.env.BASE_URL || 'http://127.0.0.1:4321';
const rows = [];
await fs.mkdir('evidence/states', { recursive: true });
async function compare(name, a, b) {
  const pa = PNG.sync.read(await fs.readFile(a)),
    pb = PNG.sync.read(await fs.readFile(b));
  let w = Math.max(pa.width, pb.width),
    h = Math.max(pa.height, pb.height);
  function pad(p) {
    const out = new PNG({ width: w, height: h });
    out.data.fill(255);
    PNG.bitblt(p, out, 0, 0, p.width, p.height, 0, 0);
    return out;
  }
  const x = pad(pa),
    y = pad(pb),
    diff = new PNG({ width: w, height: h });
  const count = pixelmatch(x.data, y.data, diff.data, w, h, { threshold: 0.1 });
  await fs.writeFile(`evidence/states/${name}-diff.png`, PNG.sync.write(diff));
  rows.push({
    name,
    reference: [pa.width, pa.height],
    local: [pb.width, pb.height],
    differentPercent: Number(((100 * count) / w / h).toFixed(3)),
  });
}
async function pages(slug, width = 1440) {
  const a = await ref.context.newPage(),
    b = await local.newPage();
  for (const [p, root] of [
    [a, 'https://www.dask.org'],
    [b, base],
  ]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(root + '/' + slug, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await p.evaluate(() => document.fonts.ready);
  }
  return [a, b];
}
async function snap(name, a, b, la, lb) {
  for (const [p, l, kind] of [
    [a, la, 'reference'],
    [b, lb, 'local'],
  ]) {
    await l.scrollIntoViewIfNeeded();
    await p.waitForTimeout(650);
    await l.screenshot({ path: `evidence/states/${name}-${kind}.png` });
  }
  await compare(
    name,
    `evidence/states/${name}-reference.png`,
    `evidence/states/${name}-local.png`,
  );
  await fs.writeFile(
    'evidence/states/results.json',
    JSON.stringify(rows, null, 2),
  );
}
try {
  let [a, b] = await pages('');
  for (let i = 0; i < 4; i++) {
    await a.locator('.home-tabs [role=tab]').nth(i).click();
    await b.locator('.workload-tabs [role=tab]').nth(i).click();
    await snap(
      'workload-' + i,
      a,
      b,
      a.locator('.home-tabs-wr'),
      b.locator('.workload-tabs'),
    );
  }
  for (let i = 0; i < 2; i++) {
    await a.locator('.run-dask-tabs [role=tab]').nth(i).click();
    await b.locator('.deployment [role=tab]').nth(i).click();
    await snap(
      'deployment-' + i,
      a,
      b,
      a.locator('.run-dask-tabs'),
      b.locator('.deployment'),
    );
  }
  await a.close();
  await b.close();
  [a, b] = await pages('get-started');
  for (let i = 0; i < 3; i++) {
    await a
      .getByRole('tab')
      .filter({ hasText: ['Ecosystem', 'Case', 'Examples'][i] })
      .first()
      .click();
    await b.locator('.explore-tabs [role=tab]').nth(i).click();
    await snap(
      'explore-' + i,
      a,
      b,
      a.locator('.section-responsive.bg-largegridbox'),
      b.locator('.explore-section'),
    );
  }
  await a.close();
  await b.close();
  [a, b] = await pages('brand-guide');
  for (let i = 0; i < 4; i++) {
    await a.getByRole('tab').nth(i).click();
    await b.locator('[data-logo-color]').nth(i).click();
    await snap('logo-' + i, a, b, a.locator('#logos'), b.locator('#logos'));
  }
  for (let i = 0; i < 12; i++) {
    await a
      .getByRole('tab')
      .nth(i + 4)
      .click();
    await b.locator('[data-color]').nth(i).click();
    await snap(
      'palette-' + i,
      a,
      b,
      a.locator('.br-g-colors-tabs'),
      b.locator('.palette-section'),
    );
  }
  await a.close();
  await b.close();
  [a, b] = await pages('press-mentions');
  await a.getByText('Add a press mention', { exact: true }).click();
  await b.getByRole('button', { name: 'Add a press mention' }).click();
  for (let i = 0; i < 3; i++) {
    await a.getByRole('tab').nth(i).click();
    await b.locator('.dialog-tabs [role=tab]').nth(i).click();
    await snap('dialog-' + i, a, b, a.locator('body'), b.locator('body'));
  }
  await a.close();
  await b.close();
  for (const width of [1440, 768, 390]) {
    [a, b] = await pages('', width);
    if (width === 1440) {
      await a.locator('.w-dropdown-toggle').first().click();
      await b.getByRole('button', { name: 'Community', exact: true }).click();
    } else {
      await a.locator('.w-nav-button').click();
      await b.getByRole('button', { name: 'Open menu' }).click();
    }
    for (const [p, kind] of [
      [a, 'reference'],
      [b, 'local'],
    ]) {
      await p.waitForTimeout(300);
      await p.screenshot({ path: `evidence/states/nav-${width}-${kind}.png` });
    }
    await compare(
      'nav-' + width,
      `evidence/states/nav-${width}-reference.png`,
      `evidence/states/nav-${width}-local.png`,
    );
    await a.close();
    await b.close();
  }
  // Earlier responsive inspection timed out here; fill the one missing closed-nav baseline only.
  const p = await ref.context.newPage();
  await p.setViewportSize({ width: 768, height: 900 });
  await p.goto('https://www.dask.org/press-mentions', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({
    path: 'evidence/reference/press-mentions-tablet-closed.png',
    fullPage: true,
  });
  await p.close();
} finally {
  await ref.browser.close();
  await browser.close();
  await fs.writeFile(
    'evidence/states/results.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
console.log('Compared', rows.length, 'interaction states');
