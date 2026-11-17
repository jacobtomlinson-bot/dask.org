import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { referenceBrowser } from './reference-browser.mjs';
const dir = 'evidence/round15',
  widths = [390, 479, 480, 601, 767, 768, 769, 991, 992, 1440],
  states = ['Ecosystem', 'Case studies', 'Examples'];
await fs.mkdir(dir, { recursive: true });
const ref = await referenceBrowser({ reducedMotion: 'reduce' }),
  browser = await chromium.launch(),
  rows = [];
try {
  for (const [label, context, base] of [
    ['reference', ref.context, 'https://www.dask.org'],
    [
      'local',
      await browser.newContext({ reducedMotion: 'reduce' }),
      process.env.BASE_URL || 'http://127.0.0.1:4321',
    ],
  ]) {
    const page = await context.newPage();
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(base + '/get-started');
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 20));
        }
        scrollTo({ top: 0, behavior: 'instant' });
      });
      for (const [index, state] of states.entries()) {
        if (label === 'local')
          await page.locator('.explore-tabs [role=tab]').nth(index).click();
        else
          await page
            .locator('.w-tab-link')
            .filter({ hasText: state })
            .last()
            .click();
        await page.waitForTimeout(350);
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        const data = await page.evaluate((local) => {
          const h = [...document.querySelectorAll('h2')].find(
              (e) => e.textContent.trim() === 'Explore the Possibilities',
            ),
            s = h.closest(local ? 'section' : '.section-responsive'),
            p = s.querySelector(
              local
                ? '.explore-panel:not([hidden])'
                : '.w-tab-pane.w--tab-active',
            ),
            a = p.querySelector('a.button');
          const box = (e) => {
              const r = e.getBoundingClientRect();
              return {
                x: r.x,
                y: r.y + scrollY,
                w: r.width,
                h: r.height,
                bottom: r.bottom + scrollY,
              };
            },
            section = box(s),
            action = box(a),
            pane = box(p),
            card = box(
              p.querySelector(local ? '.explore-card' : '.slider-background') ||
                p.firstElementChild,
            );
          return {
            section,
            action,
            pane,
            card,
            heading: box(h),
            tail: section.bottom - action.bottom,
            href: a.getAttribute('href'),
            actionLabel: a.textContent.trim(),
            overflow: document.documentElement.scrollWidth > innerWidth,
            paint: getComputedStyle(s.nextElementSibling).backgroundColor,
          };
        }, label === 'local');
        const im = PNG.sync.read(await page.screenshot({ fullPage: true }));
        let firstGray = null;
        for (
          let y = Math.floor(data.section.bottom) - 10;
          y < Math.ceil(data.section.bottom) + 15;
          y++
        )
          if (
            [3, 10, 20].every((x) => {
              const i = (y * im.width + x) * 4;
              return (
                im.data[i] === 51 &&
                im.data[i + 1] === 54 &&
                im.data[i + 2] === 61
              );
            })
          ) {
            firstGray = y;
            break;
          }
        assert.notEqual(firstGray, null, 'actual dark seam exists');
        const y0 = Math.floor(data.action.bottom) - 12,
          crop = new PNG({
            width,
            height: Math.ceil(data.section.bottom) + 25 - y0,
          });
        PNG.bitblt(im, crop, 0, y0, width, crop.height, 0, 0);
        await fs.writeFile(
          `${dir}/${label}-${width}-${index}-seam.png`,
          PNG.sync.write(crop),
        );
        const wholeTop = Math.floor(data.section.y),
          whole = new PNG({
            width,
            height: Math.ceil(data.section.bottom) - wholeTop + 25,
          });
        PNG.bitblt(im, whole, 0, wholeTop, width, whole.height, 0, 0);
        await fs.writeFile(
          `${dir}/${label}-${width}-${index}-explore.png`,
          PNG.sync.write(whole),
        );
        rows.push({
          label: label === 'local' ? 'local' : 'reference',
          width,
          state,
          ...data,
          firstGray,
          rasterGap: firstGray - Math.ceil(data.action.bottom),
          edgePhase: firstGray - data.section.bottom,
        });
      }
    }
    await page.close();
  }
} finally {
  await ref.browser.close();
  await browser.close();
  await fs.writeFile(dir + '/seams.json', JSON.stringify(rows, null, 2) + '\n');
}
const results = [];
let maxTail = 0,
  maxForeground = 0,
  maxRaster = 0;
for (const r of rows.filter((r) => r.label === 'reference')) {
  const n = rows.find(
    (n) => n.label === 'local' && n.width === r.width && n.state === r.state,
  );
  try {
    assert.ok(n);
    assert.equal(n.overflow, false);
    assert.equal(n.href, r.href);
    assert.equal(n.actionLabel, r.actionLabel);
    maxTail = Math.max(maxTail, Math.abs(n.tail - r.tail));
    assert.ok(
      Math.abs(n.tail - r.tail) <= 0.125,
      `tail ${n.tail} vs ${r.tail}`,
    );
    for (const k of ['heading', 'card', 'action'])
      for (const axis of ['x', 'y', 'w', 'h']) {
        const a = axis === 'y' ? r[k][axis] - r.section.y : r[k][axis],
          b = axis === 'y' ? n[k][axis] - n.section.y : n[k][axis];
        maxForeground = Math.max(maxForeground, Math.abs(a - b));
        assert.ok(Math.abs(a - b) <= 0.125, `${k}.${axis}: ${b} vs ${a}`);
      }
    maxRaster = Math.max(maxRaster, Math.abs(n.rasterGap - r.rasterGap));
    assert.ok(
      Math.abs(n.rasterGap - r.rasterGap) <= 1,
      `painted gap ${n.rasterGap} vs ${r.rasterGap}`,
    );
    assert.ok(
      Math.abs(n.edgePhase) <= 1 && Math.abs(r.edgePhase) <= 1,
      'actual seam follows the intrinsic boundary within raster quantization',
    );
    results.push({ width: r.width, state: r.state, passed: true });
  } catch (e) {
    results.push({
      width: r.width,
      state: r.state,
      passed: false,
      error: String(e),
    });
  }
}
await fs.writeFile(
  dir + '/checks.json',
  JSON.stringify({ results, maxTail, maxForeground, maxRaster }, null, 2) +
    '\n',
);
for (const r of results.filter((r) => !r.passed)) console.error(r);
console.log(
  `${results.filter((r) => r.passed).length} Explore canvas/state groups passed, ${results.filter((r) => !r.passed).length} failed; max tail ${maxTail}px, foreground ${maxForeground}px, painted gap ${maxRaster}px.`,
);
assert.ok(results.every((r) => r.passed));
