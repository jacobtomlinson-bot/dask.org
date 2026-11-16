import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
const browser = await chromium.launch();
const results = [];
const scrolled = process.env.REFERENCE_SCROLLED === '1';
const diffDir = scrolled ? 'evidence/diff-scrolled' : 'evidence/diff';
await fs.mkdir('evidence/local', { recursive: true });
await fs.mkdir(diffDir, { recursive: true });
for (const [view, width, height] of [
  ['desktop', 1440, 1000],
  ['tablet', 768, 900],
  ['mobile', 390, 900],
])
  for (const slug of [
    'home',
    'get-started',
    'get-help',
    'powered-by',
    'brand-guide',
    'press-mentions',
  ]) {
    const p = await browser.newPage({
      viewport: { width, height },
      reducedMotion: 'reduce',
    });
    await p.goto(
      (process.env.BASE_URL || 'http://127.0.0.1:4321') +
        '/' +
        (slug === 'home' ? '' : slug),
      { waitUntil: 'networkidle' },
    );
    await p.evaluate(() => document.fonts.ready);
    const output = `evidence/local/${slug}-${view}.png`;
    await p.screenshot({ path: output, fullPage: true });
    const geometry = await p
      .locator('h1,h2,h3,main>section,footer')
      .evaluateAll((es) =>
        es.map((e) => {
          let r = e.getBoundingClientRect();
          return {
            tag: e.tagName,
            text: e.textContent.trim().slice(0, 60),
            rect: [r.x, r.y, r.width, r.height].map(Math.round),
          };
        }),
      );
    const reference = `evidence/reference/${slug}-${view}${scrolled ? '-scrolled' : view === 'desktop' ? '' : '-closed'}.png`;
    let comparison;
    try {
      const a = PNG.sync.read(await fs.readFile(reference)),
        b = PNG.sync.read(await fs.readFile(output));
      const h = Math.max(a.height, b.height),
        w = Math.max(a.width, b.width);
      const pad = (p) => {
        let out = new PNG({ width: w, height: h, fill: true });
        out.data.fill(255);
        PNG.bitblt(p, out, 0, 0, p.width, p.height, 0, 0);
        return out;
      };
      const aa = pad(a),
        bb = pad(b),
        diff = new PNG({ width: w, height: h });
      const different = pixelmatch(aa.data, bb.data, diff.data, w, h, {
        threshold: 0.1,
      });
      const top = pixelmatch(
        aa.data.subarray(0, w * height * 4),
        bb.data.subarray(0, w * height * 4),
        null,
        w,
        height,
        { threshold: 0.1 },
      );
      await fs.writeFile(
        `${diffDir}/${slug}-${view}.png`,
        PNG.sync.write(diff),
      );
      comparison = {
        referenceSize: [a.width, a.height],
        localSize: [b.width, b.height],
        differentPixels: different,
        differencePercent: Number(((100 * different) / w / h).toFixed(3)),
        topViewportDifferencePercent: Number(
          ((100 * top) / w / height).toFixed(3),
        ),
        method:
          'pixelmatch threshold 0.1; antialias excluded; shorter full-page capture padded white',
      };
    } catch (error) {
      comparison = { error: String(error) };
    }
    results.push({ slug, view, ...comparison, geometry });
    await p.close();
    console.log(slug, view, comparison.differencePercent);
  }
await fs.writeFile(
  scrolled ? 'evidence/comparison-scrolled.json' : 'evidence/comparison.json',
  JSON.stringify(results, null, 2) + '\n',
);
await browser.close();
