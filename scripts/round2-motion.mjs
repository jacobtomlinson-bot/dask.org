import { referenceBrowser } from './reference-browser.mjs';
import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
await fs.mkdir('evidence/round2/motion', { recursive: true });
const ref = await referenceBrowser(),
  browser = await chromium.launch(),
  rows = [];
const base = process.env.BASE_URL || 'http://127.0.0.1:4321';
function difference(a, b) {
  const pa = PNG.sync.read(a),
    pb = PNG.sync.read(b),
    w = Math.max(pa.width, pb.width),
    h = Math.max(pa.height, pb.height);
  function pad(p) {
    const o = new PNG({ width: w, height: h });
    o.data.fill(255);
    PNG.bitblt(p, o, 0, 0, p.width, p.height, 0, 0);
    return o.data;
  }
  const count = pixelmatch(pad(pa), pad(pb), null, w, h, { threshold: 0.1 });
  return {
    referenceSize: [pa.width, pa.height],
    localSize: [pb.width, pb.height],
    pixelsDifferentPercent: (100 * count) / w / h,
  };
}
// Scroll only the page, not overflow-hidden illustration ancestors. Locator screenshots
// can programmatically scroll those ancestors and capture a different visual region.
async function reveal(page, locator) {
  await locator.evaluate((e) => {
    const r = e.getBoundingClientRect();
    window.scrollTo({
      left: 0,
      top: Math.max(0, scrollY + r.top - (innerHeight - r.height) / 2),
      behavior: 'instant',
    });
  });
  await page.waitForTimeout(80);
}
async function captureVisible(page, locator, path) {
  const r = await locator.boundingBox();
  const source = PNG.sync.read(await page.screenshot());
  const x = Math.max(0, Math.floor(r.x)),
    y = Math.max(0, Math.floor(r.y));
  const width = Math.min(source.width - x, Math.ceil(r.x + r.width) - x);
  const height = Math.min(source.height - y, Math.ceil(r.y + r.height) - y);
  if (width <= 0 || height <= 0)
    throw Error('Illustration not visible in viewport');
  const target = new PNG({ width, height });
  PNG.bitblt(source, target, x, y, width, height, 0, 0);
  const bytes = PNG.sync.write(target);
  if (path) await fs.writeFile(path, bytes);
  return bytes;
}
try {
  for (const width of [1440, 390]) {
    const a = await ref.context.newPage(),
      b = await browser.newPage({ reducedMotion: 'no-preference' });
    for (const p of [a, b]) await p.setViewportSize({ width, height: 1000 });
    await Promise.all([
      a.goto('https://www.dask.org', { waitUntil: 'networkidle' }),
      b.goto(base, { waitUntil: 'networkidle' }),
    ]);
    for (const [name, sa, sb] of [
      ['dashboard', '.herohome-lottie', '.dashboard-frame'],
      ['gauges', '.performance-img-wr.bg-grey', '.benchmark-art'],
      ['counter', '.ticker-grid', '.cost-demo'],
    ]) {
      const la = a.locator(sa).first(),
        lb = b.locator(sb).first();
      await Promise.all([reveal(a, la), reveal(b, lb)]);
      const start = Date.now(),
        localFrames = [];
      for (const t of [0, 1500, 4000]) {
        await new Promise((r) =>
          setTimeout(r, Math.max(0, start + t - Date.now())),
        );
        const [aa, bb] = await Promise.all([
          captureVisible(
            a,
            la,
            `evidence/round2/motion/${name}-${width}-${t}-reference.png`,
          ),
          captureVisible(
            b,
            lb,
            `evidence/round2/motion/${name}-${width}-${t}-local.png`,
          ),
        ]);
        localFrames.push(bb);
        rows.push({
          name,
          width,
          afterScrollTargetMs: t,
          actualAfterScrollMs: Date.now() - start,
          ...difference(aa, bb),
          localText: await lb.textContent(),
        });
      }
      const motion = difference(
        localFrames[0],
        localFrames[2],
      ).pixelsDifferentPercent;
      expect(
        motion,
        `${name} ${width} must animate in normal motion`,
      ).toBeGreaterThan(0);
      rows.push({
        name,
        width,
        assertion: 'native normal-motion frame changes',
        pixelsChanged: motion,
      });
    }
    await a.close();
    await b.close();
  }
  const p = await browser.newPage({
    viewport: { width: 390, height: 900 },
    reducedMotion: 'reduce',
  });
  await p.goto(base);
  for (const [name, sel] of [
    ['dashboard', '.dashboard-frame'],
    ['gauges', '.benchmark-art'],
    ['counter', '.cost-demo'],
  ]) {
    const l = p.locator(sel);
    await reveal(p, l);
    const first = await captureVisible(p, l);
    await p.waitForTimeout(1200);
    const last = await captureVisible(p, l);
    const delta = difference(first, last).pixelsDifferentPercent;
    expect(delta, `${name} reduced motion frame remains static`).toBe(0);
    rows.push({
      name,
      width: 390,
      assertion: 'reduced-motion static frame',
      pixelsChanged: delta,
    });
  }
  await p.close();
} finally {
  await ref.browser.close();
  await browser.close();
  await fs.writeFile(
    'evidence/round2/motion/results.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
