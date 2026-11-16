import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
import { chromium } from '@playwright/test';
const refs = JSON.parse(
    await fs.readFile('evidence/round3/complete-section-metrics.json', 'utf8'),
  ),
  browser = await chromium.launch();
const base = process.env.BASE_URL || 'http://127.0.0.1:4321';
try {
  for (const route of ['home', 'get-started', 'powered-by']) {
    const p = await browser.newPage({
      viewport: { width: 601, height: 900 },
      reducedMotion: 'reduce',
    });
    await p.goto(base + '/' + (route === 'home' ? '' : route));
    let native = await p
      .locator('main>section,footer')
      .evaluateAll((es) => es.map((e) => e.getBoundingClientRect().toJSON()));
    if (route === 'get-started') {
      native = [
        { ...native[0], height: native[0].height + native[1].height },
        ...native.slice(2),
      ];
    }
    const source = refs
      .find((x) => x.slug === (route === 'home' ? '' : route))
      .sections.map((x) => x.r);
    const a = PNG.sync.read(
        await fs.readFile(`evidence/round3/reference/${route}-601.png`),
      ),
      b = PNG.sync.read(
        await fs.readFile(`evidence/round3/local/${route}-601.png`),
      );
    const parts = [];
    for (let i = 0; i < source.length; i++) {
      parts.push([source[i].y, native[i].y]);
      if (source[i].height > 700)
        parts.push([
          source[i].y + source[i].height / 2,
          native[i].y + native[i].height / 2,
        ]);
    }
    const out = new PNG({ width: 600, height: parts.length * 300 });
    out.data.fill(255);
    for (let i = 0; i < parts.length; i++)
      for (let side = 0; side < 2; side++) {
        const src = side ? b : a,
          top = parts[i][side];
        for (let y = 0; y < 300; y++)
          for (let x = 0; x < 300; x++) {
            let sy = Math.min(
                src.height - 1,
                Math.floor(top + (y * 601) / 300),
              ),
              sx = Math.floor((x * 601) / 300),
              off = (sy * src.width + sx) * 4,
              target = ((i * 300 + y) * 600 + side * 300 + x) * 4;
            src.data.copy(out.data, target, off, off + 4);
          }
      }
    await fs.writeFile(
      `evidence/round3/${route}-below-fold.png`,
      PNG.sync.write(out),
    );
    await p.close();
  }
} finally {
  await browser.close();
}
