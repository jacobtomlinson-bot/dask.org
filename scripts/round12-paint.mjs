import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir = 'evidence/round12',
  reference = JSON.parse(
    await fs.readFile(`${dir}/reference.json`, 'utf8'),
  ).filter((r) => r.route === 'get-started'),
  browser = await chromium.launch(),
  rows = [];
const bbox = (png, rect) => {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -1,
    y1 = -1,
    count = 0;
  for (
    let y = Math.max(0, Math.ceil(rect.y));
    y < Math.min(png.height, rect.y + rect.h);
    y++
  )
    for (
      let x = Math.max(0, Math.ceil(rect.x));
      x < Math.min(png.width, rect.x + rect.w);
      x++
    ) {
      const i = (y * png.width + x) * 4,
        c = [...png.data.slice(i, i + 3)];
      if (Math.max(...c) - Math.min(...c) > 90) {
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
        count++;
      }
    }
  assert.ok(count > 100, 'actual saturated artwork paint exists');
  return {
    x: x0 - rect.x,
    y: y0 - rect.y,
    w: x1 - x0 + 1,
    h: y1 - y0 + 1,
    count,
  };
};
try {
  const p = await browser.newPage({ reducedMotion: 'reduce' });
  for (const r of reference) {
    await p.setViewportSize({ width: r.width, height: 1000 });
    await p.goto(
      (process.env.BASE_URL || 'http://127.0.0.1:4321') + '/get-started',
    );
    await p.evaluate(() => document.fonts.ready);
    const actual = await p.locator('.deeper').evaluate((e) => {
      const r = e.getBoundingClientRect(),
        art = e.querySelector('img').getBoundingClientRect();
      return {
        upper: e.querySelector('.deeper-upper').getBoundingClientRect().height,
        art: { x: art.x, y: art.y - r.y, w: art.width, h: art.height },
      };
    });
    const path = `${dir}/local-get-started-${r.width}-default.png`;
    const native = PNG.sync.read(
        await p.locator('.deeper').screenshot({ path }),
      ),
      original = PNG.sync.read(
        await fs.readFile(
          `${dir}/reference-get-started-${r.width}-default.png`,
        ),
      );
    const sample = (png, x, y) => [
      ...png.data.slice(
        (Math.floor(y) * png.width + x) * 4,
        (Math.floor(y) * png.width + x) * 4 + 3,
      ),
    ];
    assert.deepEqual(
      sample(native, 3, 20),
      [51, 54, 61],
      `${r.width} upper actual gray paint`,
    );
    assert.deepEqual(
      sample(original, 3, 20),
      [51, 54, 61],
      `${r.width} reference upper gray`,
    );
    assert.deepEqual(
      sample(native, 3, actual.upper + 10),
      [38, 35, 38],
      `${r.width} lower actual dark paint`,
    );
    assert.deepEqual(
      sample(original, 3, r.upper.h + 10),
      [38, 35, 38],
      `${r.width} reference lower dark`,
    );
    const a = bbox(original, r.art),
      b = bbox(native, actual.art);
    for (const k of ['x', 'y', 'w', 'h'])
      assert.ok(
        Math.abs(a[k] - b[k]) <= 1.5,
        `${r.width} actual illustration ${k}: ${b[k]} vs ${a[k]}`,
      );
    rows.push({
      width: r.width,
      source: a,
      native: b,
      upperGray: [51, 54, 61],
      lowerGray: [38, 35, 38],
    });
  }
  await p.close();
} finally {
  await browser.close();
  await fs.writeFile(
    `${dir}/deeper-paint.json`,
    JSON.stringify(rows, null, 2) + '\n',
  );
}
console.log(
  rows.length,
  'two-band actual paint and visible artwork-fitting groups passed',
);
