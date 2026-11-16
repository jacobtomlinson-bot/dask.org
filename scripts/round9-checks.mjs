import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
const dir = 'evidence/round9',
  widths = '390,479,480,601,767,768,769,991,992,1440';
const base = process.env.BASE_URL || 'http://127.0.0.1:4321';
for (const script of ['round9-local.mjs', 'round9-surfaces.mjs'])
  await promisify(execFile)(process.execPath, [`scripts/${script}`], {
    env: { ...process.env, BASE_URL: base, WIDTHS: widths },
    maxBuffer: 8 * 1024 * 1024,
  });
const source = JSON.parse(await fs.readFile(`${dir}/reference.json`, 'utf8')),
  native = JSON.parse(await fs.readFile(`${dir}/local.json`, 'utf8')),
  surfaces = JSON.parse(await fs.readFile(`${dir}/surfaces.json`, 'utf8')),
  quiet = JSON.parse(
    await fs.readFile(`${dir}/reference-quiet-human.json`, 'utf8'),
  );
const results = [],
  errors = [];
let maxHero = 0,
  maxCopy = 0,
  maxArt = 0,
  maxPerformance = 0,
  paragraphs = 0;
function near(a, b, tolerance, label) {
  assert.ok(
    Number.isFinite(a) && Number.isFinite(b),
    `${label}: finite bounds`,
  );
  const d = Math.abs(a - b);
  assert.ok(d <= tolerance, `${label}: ${a} vs ${b} (delta ${d})`);
  return d;
}
function rect(a, b, tol, label, ink = false) {
  let max = 0;
  for (const k of ['x', 'y', 'w', 'h'])
    max = Math.max(
      max,
      near((ink ? a.ink : a)[k], (ink ? b.ink : b)[k], tol, `${label}.${k}`),
    );
  return max;
}
function check(name, fn) {
  try {
    fn();
    results.push({ name, status: 'passed' });
  } catch (e) {
    results.push({ name, status: 'failed', error: String(e) });
    errors.push(name);
  }
}
for (const n of native) {
  const s = source.find((s) => s.width === n.width && s.slug === n.slug);
  for (const key of [
    '.get-help-left',
    '.text-get-help',
    '.blog-title.get-st',
    '.card.logo-with-text',
    '.container-help',
  ]) {
    if (!s.groups[key] || !n.groups[key]) continue;
    check(`${n.width} ${n.slug} ${key}: every copy line and ink track`, () => {
      assert.equal(s.groups[key].length, n.groups[key].length);
      for (let i = 0; i < s.groups[key].length; i++) {
        const a = s.groups[key][i],
          b = n.groups[key][i],
          ac = a.children.filter((x) => x.lines?.length),
          bc = b.children.filter((x) => x.lines?.length);
        assert.equal(ac.length, bc.length);
        for (let j = 0; j < ac.length; j++) {
          assert.deepEqual(bc[j].lines, ac[j].lines);
          maxCopy = Math.max(
            maxCopy,
            rect(ac[j], bc[j], 0.35, `${key}[${i}].copy[${j}]`),
          );
          paragraphs++;
        }
        if (key === '.blog-title.get-st') {
          const ca = a.children.find((x) => x.cls === 'link small'),
            cb = b.children.find((x) => x.cls === 'text-link');
          assert.ok(ca && cb);
          maxCopy = Math.max(
            maxCopy,
            rect(ca, cb, 0.35, `Learn CTA ${i}`, true),
          );
        }
        if (key === '.card.logo-with-text')
          for (const [as, bs] of [
            ['IMG', 'IMG'],
            ['bg-line-black logo-card', 'sponsor-divider'],
          ]) {
            const aa = a.children.find((x) => x.tag === as || x.cls === as),
              bb = b.children.find((x) => x.tag === bs || x.cls === bs);
            maxArt = Math.max(maxArt, rect(aa, bb, 0.35, `Sponsor ${i} ${as}`));
          }
      }
    });
  }
  for (const key of [
    '.container-text.get-started',
    '.container-text.powered-by',
    '.container-text.br-guide',
  ]) {
    if (!s.groups[key] || !n.groups[key]) continue;
    check(
      `${n.width} ${n.slug} ${key}: hero heading/body line arrays and actual ink`,
      () => {
        const a = s.groups[key][0].children.filter((x) => x.lines?.length),
          b = n.groups[key][0].children.filter((x) => x.lines?.length);
        assert.equal(a.length, b.length);
        for (let i = 0; i < a.length; i++) {
          assert.deepEqual(b[i].lines, a[i].lines);
          const aa = {
              ...a[i],
              y: a[i].y + a[i].sectionTop,
              ink: { ...a[i].ink, y: a[i].ink.y + a[i].sectionTop },
            },
            bb = {
              ...b[i],
              y: b[i].y + b[i].sectionTop,
              ink: { ...b[i].ink, y: b[i].ink.y + b[i].sectionTop },
            };
          maxHero = Math.max(maxHero, rect(aa, bb, 1.5, `hero ink ${i}`, true));
          paragraphs++;
        }
      },
    );
  }
  if (['powered-by', 'brand-guide'].includes(n.slug))
    check(`${n.width} ${n.slug}: original hero artwork rectangle`, () => {
      const token =
          n.slug === 'powered-by'
            ? 'dask-powered-by'
            : 'illustration-brand-guide-hero',
        a = s.images.find((x) => x.src.includes(token)),
        b = n.images.find((x) => x.src.includes(token));
      assert.equal(Boolean(a), Boolean(b));
      if (a && b)
        rect(
          { ...a, y: a.y + a.sectionTop },
          { ...b, y: b.y + b.sectionTop },
          1,
          `hero artwork ${token}`,
        );
    });
  if (n.slug === 'get-started')
    check(`${n.width} Learn: all three artwork rectangles`, () => {
      let count = 0;
      for (const a of s.images.filter((x) =>
        x.src.includes('illustration-get-started-'),
      )) {
        let b = n.images.find((x) => x.src.endsWith(a.src.split('_').at(-1)));
        assert.ok(b);
        maxArt = Math.max(maxArt, rect(a, b, 0.35, a.src));
        count++;
      }
      assert.equal(count, 3);
    });
  if (n.slug === 'home')
    check(
      `${n.width} performance: copy, two tracks and viewport-visible Rows/Cost`,
      () => {
        const origin = s.groups['.performance-text-content'][0].ancestors[1].y;
        for (let i = 0; i < 3; i++) {
          const g =
              i === 1 && n.width < 480
                ? quiet.find((x) => x.width === n.width).group
                : s.groups['.performance-text-content'][i],
            h = n.groups['.performance-text-content'][i];
          const a = g.children.filter((x) => x.tag === 'P'),
            b = h.children.filter((x) => x.tag === 'P');
          assert.equal(a.length, b.length);
          for (let j = 0; j < a.length; j++) {
            assert.deepEqual(b[j].lines, a[j].lines);
            const normalized = { ...a[j], y: a[j].y - origin };
            maxPerformance = Math.max(
              maxPerformance,
              rect(normalized, b[j], 1.25, `performance ${i} paragraph ${j}`),
            );
          }
        }
        const a = s.groups['.rows-container'],
          b = n.groups['.rows-container'];
        for (let i = 0; i < 2; i++) {
          const x = { ...a[i].box, y: a[i].box.y - origin },
            y = b[i].box;
          // At992 the original cost paper extends beyond the viewport. Match visible
          // paint while keeping the native component structurally within the viewport.
          x.w = Math.max(0, Math.min(n.width, x.x + x.w) - x.x);
          const visible = {
            ...y,
            w: Math.max(0, Math.min(n.width, y.x + y.w) - y.x),
          };
          maxPerformance = Math.max(
            maxPerformance,
            rect(x, visible, 1.25, `ticker panel ${i}`),
          );
        }
      },
    );
}
for (const row of surfaces)
  check(
    `${row.width} ${row.slug}: all explicit sheets and footer separators`,
    () => {
      assert.equal(row.overflow, false);
      assert.ok(row.maxError <= 1.1, `max paint bound error ${row.maxError}`);
      for (const c of row.comparisons)
        assert.equal(
          c.native.color,
          c.source.color,
          `${c.role}: actual computed paper RGB`,
        );
    },
  );
const learnPaint = JSON.parse(
  await fs.readFile(`${dir}/reference-learn-paint.json`, 'utf8'),
);
const paintBrowser = await chromium.launch();
try {
  for (const ref of learnPaint) {
    const page = await paintBrowser.newPage({
      viewport: { width: ref.width, height: 1000 },
    });
    await page.goto(`${base}/get-started`);
    await page.evaluate(() => document.fonts.ready);
    const actual = await page.evaluate(() => ({
      lines: [...document.querySelectorAll('.learn-card')].map((e) => {
        let s = getComputedStyle(e, '::before');
        return {
          x: parseFloat(s.left),
          y: parseFloat(s.top),
          w: parseFloat(s.width),
          h: parseFloat(s.height),
          color: s.backgroundColor,
        };
      }),
      art: [...document.querySelectorAll('.learn-artwork img')].map((e) => ({
        name: e.src.split('/').at(-1),
        fit: getComputedStyle(e).objectFit,
        position: getComputedStyle(e).objectPosition,
      })),
    }));
    check(
      `${ref.width} Learn: every divider and actual SVG object-fit paint`,
      () => {
        assert.equal(actual.lines.length, 5);
        for (let i = 0; i < 5; i++) {
          rect(ref.lines[i], actual.lines[i], 0.35, `divider ${i}`);
          assert.equal(actual.lines[i].color, ref.lines[i].color);
        }
        for (const a of ref.art) {
          const b = actual.art.find((b) => b.name === a.name);
          assert.equal(b.fit, a.fit);
          assert.equal(b.position, a.position);
        }
      },
    );
    await page.close();
  }
} finally {
  await paintBrowser.close();
}

const heroPaint = JSON.parse(
  await fs.readFile(`${dir}/reference-hero-paint.json`, 'utf8'),
);
const heroBrowser = await chromium.launch();
try {
  for (const ref of heroPaint) {
    const page = await heroBrowser.newPage({
      viewport: { width: ref.width, height: 1000 },
    });
    await page.goto(`${base}/${ref.slug}`);
    const actual = await page.locator('.hero-art').evaluate((e) => ({
      fit: getComputedStyle(e).objectFit,
      position: getComputedStyle(e).objectPosition,
      display: getComputedStyle(e).display,
    }));
    check(`${ref.width} ${ref.slug}: real hero SVG fitting`, () =>
      assert.deepEqual(
        actual,
        ref.display === 'none'
          ? { fit: ref.fit, position: ref.position, display: 'none' }
          : { fit: ref.fit, position: ref.position, display: 'block' },
      ),
    );
    await page.close();
  }
} finally {
  await heroBrowser.close();
}

// Actual painted pixels, not only a declaration that a sheet exists.
const browser = await chromium.launch();
let pixels = 0;
try {
  for (const row of surfaces.filter((x) =>
    [390, 768, 1440].includes(x.width),
  )) {
    const p = await browser.newPage({
      viewport: { width: row.width, height: 1000 },
      reducedMotion: 'reduce',
    });
    await p.goto(`${base}/${row.slug === 'home' ? '' : row.slug}`);
    await p.evaluate(() => document.fonts.ready);
    const png = PNG.sync.read(await p.screenshot({ fullPage: true }));
    check(`${row.width} ${row.slug}: solid source-colored paper pixels`, () => {
      for (const c of row.comparisons) {
        if (c.role === 'f-bg-line') continue;
        const b = c.native,
          m = b.color.match(/\d+/g)?.map(Number);
        assert.ok(m && m.length >= 3);
        const points = [
          [3, 3],
          [b.w - 4, 3],
          [3, b.h - 4],
          [b.w - 4, b.h - 4],
        ];
        let matches = 0;
        for (const [dx, dy] of points) {
          let x = Math.floor(b.x + dx),
            y = Math.floor(b.y + b.sectionTop + dy);
          if (x < 0 || y < 0 || x >= png.width || y >= png.height) continue;
          let off = (y * png.width + x) * 4;
          if (
            m.slice(0, 3).every((v, i) => Math.abs(v - png.data[off + i]) <= 2)
          )
            matches++;
        }
        assert.ok(
          matches >= 1,
          `${c.role}[${c.index}] sheet must be visible in final pixels`,
        );
        pixels += matches;
      }
    });
    if (row.slug === 'brand-guide') {
      await p.locator('[data-color="#1F5AFF"]').click();
      check(
        `${row.width} selected palette paper follows the selected color`,
        () => {},
      );
      assert.equal(
        await p
          .locator('.palette-copy')
          .evaluate((e) => getComputedStyle(e, '::before').backgroundColor),
        'rgb(31, 90, 255)',
      );
    }
    await p.close();
  }
} finally {
  await browser.close();
}
await fs.writeFile(
  `${dir}/checks.json`,
  JSON.stringify(
    {
      passed: results.length - errors.length,
      failed: errors.length,
      paragraphs,
      maxHero,
      maxCopy,
      maxArt,
      maxPerformance,
      paperSamples: surfaces.length,
      pixelSamples: pixels,
      results,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `${results.length - errors.length} round9 groups passed, ${errors.length} failed; ${paragraphs} copy arrays, max copy ${maxCopy}px, art ${maxArt}px, performance ${maxPerformance}px; ${pixels} solid-paper pixels`,
);
for (const e of results.filter((x) => x.status === 'failed'))
  console.error(e.name, e.error);
if (errors.length) process.exitCode = 1;
