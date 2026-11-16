import { referenceBrowser } from './reference-browser.mjs';
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const ref = await referenceBrowser({ reducedMotion: 'reduce' }),
  b = await chromium.launch(),
  dir = 'evidence/round13',
  rows = [],
  results = [];
let maximum = 0,
  rawViewportYMaximum = 0;
if (process.env.REFRESH_REFERENCE !== '1')
  rows.push(
    ...JSON.parse(await fs.readFile(dir + '/guidance-reference.json', 'utf8')),
  );
try {
  for (const [label, context, base] of [
    ...(process.env.REFRESH_REFERENCE === '1'
      ? [['reference', ref.context, 'https://www.dask.org']]
      : []),
    [
      'local',
      await b.newContext({ reducedMotion: 'reduce' }),
      process.env.BASE_URL || 'http://127.0.0.1:4321',
    ],
  ]) {
    const p = await context.newPage();
    for (const width of [768, 769, 991, 992, 1100, 1440]) {
      await p.setViewportSize({ width, height: 1000 });
      await p.goto(base + '/brand-guide');
      await p.evaluate(() => document.fonts.ready);
      for (const state of [0, 1]) {
        await p
          .locator(
            label === 'local'
              ? '[data-logo-color]'
              : '.br-g-logos-tabs-menu [role=tab]',
          )
          .nth(state)
          .click();
        await p.waitForTimeout(350);
        const start = await p.evaluate((local) => {
          const h = [...document.querySelectorAll('h2')].find(
            (e) =>
              e.textContent.trim() === 'Logos' &&
              e.getBoundingClientRect().width,
          );
          return (
            (local
              ? document.querySelector('#logos')
              : h.closest('section')
            ).getBoundingClientRect().y + scrollY
          );
        }, label === 'local');
        for (const offset of [0, 100, 200, 300, 450, 650, 900]) {
          await p.evaluate(
            (y) => scrollTo({ top: y, behavior: 'instant' }),
            start + offset,
          );
          await p.waitForTimeout(60);
          const data = await p.evaluate((local) => {
            const h = [...document.querySelectorAll('h2')].find(
                (e) =>
                  e.textContent.trim() === 'Logos' &&
                  e.getBoundingClientRect().width,
              ),
              el = local
                ? document.querySelector('.brand-logo-copy')
                : h.closest('.brg-text-l'),
              r = el.getBoundingClientRect(),
              s = local
                ? getComputedStyle(el, '::before')
                : getComputedStyle(el),
              info = (e) => {
                const r = e.getBoundingClientRect(),
                  s = getComputedStyle(e);
                return {
                  x: r.x,
                  y: r.y,
                  w: r.width,
                  h: r.height,
                  font: s.fontSize,
                  line: s.lineHeight,
                  weight: s.fontWeight,
                  text: e.textContent.trim().replace(/\s+/g, ' '),
                };
              };
            return {
              scroll: scrollY,
              paper: local
                ? {
                    x: r.x + parseFloat(s.left),
                    y: r.y + parseFloat(s.top),
                    w: parseFloat(s.width),
                    h: parseFloat(s.height),
                  }
                : { x: r.x, y: r.y, w: r.width, h: r.height },
              items: [...el.querySelectorAll('h2,p,a')].map(info),
            };
          }, label === 'local');
          rows.push({
            label,
            width,
            state,
            offset,
            requestedScroll: start + offset,
            ...data,
          });
          if ([768, 1440].includes(width) && offset === 300)
            await p.screenshot({
              path: `${dir}/${label}/guidance-${width}-${state}-scroll300.png`,
            });
        }
      }
    }
    await p.close();
  }
  for (const source of rows.filter((r) => r.label === 'reference')) {
    const n = rows.find(
      (r) =>
        r.label === 'local' &&
        r.width === source.width &&
        r.state === source.state &&
        r.offset === source.offset,
    );
    try {
      // Chromium scroll offsets are whole CSS pixels. Compare flow at the same
      // requested component-relative offset, preserving raw viewport evidence.
      // The genuinely viewport-pinned phase must instead stay at exactly40px.
      const pinned =
        Math.abs(source.paper.y - 40) < 0.1 && Math.abs(n.paper.y - 40) < 0.1;
      const sourceRounding = pinned
        ? 0
        : source.scroll - source.requestedScroll;
      const nativeRounding = pinned ? 0 : n.scroll - n.requestedScroll;
      rawViewportYMaximum = Math.max(
        rawViewportYMaximum,
        Math.abs(n.paper.y - source.paper.y),
      );
      assert.ok(
        Math.abs(n.paper.y - source.paper.y) <= 1,
        'raw viewport paper mismatch exceeds integer-scroll rounding',
      );
      for (const k of ['x', 'y', 'w', 'h']) {
        const delta = Math.abs(
          n.paper[k] +
            (k === 'y' ? nativeRounding : 0) -
            source.paper[k] -
            (k === 'y' ? sourceRounding : 0),
        );
        maximum = Math.max(maximum, delta);
        assert.ok(
          delta <= (k === 'y' ? 0.4 : 0.2),
          `paper ${k}: ${n.paper[k]} vs ${source.paper[k]}`,
        );
      }
      assert.equal(n.items.length, source.items.length);
      for (let i = 0; i < source.items.length; i++) {
        assert.equal(n.items[i].text, source.items[i].text);
        assert.equal(n.items[i].weight, source.items[i].weight);
        for (const prop of ['font', 'line'])
          assert.ok(
            Math.abs(
              parseFloat(n.items[i][prop]) - parseFloat(source.items[i][prop]),
            ) < 0.025,
            `item${i} actual ${prop}`,
          );
        for (const k of ['x', 'y', 'w', 'h']) {
          const delta = Math.abs(
            n.items[i][k] +
              (k === 'y' ? nativeRounding : 0) -
              source.items[i][k] -
              (k === 'y' ? sourceRounding : 0),
          );
          maximum = Math.max(maximum, delta);
          assert.ok(
            delta <= 0.85,
            `item${i}.${k}: ${n.items[i][k]} vs ${source.items[i][k]}`,
          );
        }
      }
      results.push({
        name: `${source.width}/${source.state}/${source.offset} actual sticky paper and all guidance/action tracks`,
        pass: true,
      });
    } catch (e) {
      results.push({
        name: `${source.width}/${source.state}/${source.offset}`,
        pass: false,
        error: e.message,
      });
      console.error(results.at(-1));
    }
  }
} finally {
  await b.close();
  await ref.browser.close();
  if (process.env.REFRESH_REFERENCE === '1')
    await fs.writeFile(
      dir + '/guidance-reference.json',
      JSON.stringify(
        rows.filter((r) => r.label === 'reference'),
        null,
        2,
      ),
    );
  await fs.writeFile(
    dir + '/guidance-scroll.json',
    JSON.stringify({ maximum, rawViewportYMaximum, rows, results }, null, 2),
  );
  console.log(
    results.filter((r) => r.pass).length,
    'sticky guidance groups passed;',
    results.filter((r) => !r.pass).length,
    'failed;',
    maximum,
    'px max',
  );
  if (results.some((r) => !r.pass)) process.exitCode = 1;
}
