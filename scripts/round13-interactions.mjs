import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const b = await chromium.launch(),
  c = await b.newContext({
    reducedMotion: 'reduce',
    permissions: ['clipboard-read', 'clipboard-write'],
  }),
  p = await c.newPage(),
  results = [],
  base = process.env.BASE_URL || 'http://127.0.0.1:4321',
  dir = 'evidence/round13',
  reference = JSON.parse(await fs.readFile(dir + '/reference.json', 'utf8'));
let paints = 0;
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
  } catch (e) {
    results.push({ name, pass: false, error: e.message });
    console.error(name, e.message);
  }
}
try {
  for (const width of [479, 480, 601, 767, 768]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(base + '/brand-guide');
    await p.evaluate(() => document.fonts.ready);
    const source = reference.find(
      (x) => x.width === width && x.state === 'initial',
    );
    for (const index of [...Array(12).keys(), 4])
      await check(
        `${width} color ${index}: original matrix/boundary, all real colors, unclipped contrast and clipboard`,
        async () => {
          await p.locator('[data-color]').nth(index).click();
          const data = await p.evaluate(() => {
            const section = document.querySelector('#colors'),
              r = section.getBoundingClientRect(),
              q = document.querySelector('.accessible-colors'),
              range = document.createRange();
            range.selectNodeContents(q);
            const ink = range.getBoundingClientRect(),
              action = document
                .querySelector('.copy-color')
                .getBoundingClientRect();
            return {
              cells: [...document.querySelectorAll('[data-color]')].map((e) => {
                const b = e.getBoundingClientRect();
                return {
                  hex: e.dataset.color,
                  x: b.x,
                  y: b.y - r.y,
                  w: b.width,
                  h: b.height,
                  docY: b.y + scrollY,
                };
              }),
              next:
                document.querySelector('#typography').getBoundingClientRect()
                  .y - r.y,
              contrast: {
                left: ink.left,
                right: ink.right,
                bottom: ink.bottom,
                track: q.getBoundingClientRect().toJSON(),
                actionTop: action.top,
              },
              hex: document.querySelector('.color-hex').textContent,
              selected: [...section.querySelectorAll('[aria-pressed=true]')]
                .length,
              overflow: document.documentElement.scrollWidth > innerWidth,
            };
          });
          assert.equal(data.selected, 1);
          assert.equal(data.overflow, false);
          assert.ok(
            Math.abs(data.next - source.palette.next.y) <= 0.5,
            'Typography boundary',
          );
          for (const cell of data.cells) {
            const sourceState = reference.find(
              (x) =>
                x.width === width &&
                x.state.startsWith('color-') &&
                x.palette.cells.some(
                  (c) =>
                    c.text === data.hex && c.css.color === 'rgba(0, 0, 0, 0)',
                ),
            );
            const original = sourceState.palette.cells.find(
              (x) => x.text === cell.hex,
            );
            for (const k of ['x', 'y', 'w', 'h'])
              assert.ok(
                Math.abs(cell[k] - original[k]) <= 0.5,
                cell.hex + ' invariant ' + k,
              );
          }
          assert.ok(
            data.contrast.right <= data.contrast.track.right + 0.1,
            'contrast fits available text track',
          );
          assert.ok(
            data.contrast.bottom <= data.contrast.actionTop + 0.1,
            'all contrast lines above live copy action',
          );
          const image = PNG.sync.read(await p.screenshot({ fullPage: true }));
          for (const cell of data.cells) {
            const pos =
              (Math.floor(cell.docY + cell.h - 4) * image.width +
                Math.floor(cell.x + 7)) *
              4;
            assert.deepEqual(
              [...image.data.slice(pos, pos + 3)],
              cell.hex.match(/[\dA-F]{2}/gi).map((x) => parseInt(x, 16)),
              cell.hex + ' actual rendered pixel',
            );
            paints++;
          }
          await p.locator('.copy-color').click();
          assert.equal(
            await p.evaluate(() => navigator.clipboard.readText()),
            data.hex,
          );
        },
      );
  }
  for (const width of [
    390, 479, 480, 601, 767, 768, 769, 991, 992, 1100, 1440,
  ]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(base + '/brand-guide');
    await check(
      `${width} initial marker follows source viewport midpoint, including a clear hero state`,
      async () => {
        await p.waitForTimeout(100);
        const data = await p.evaluate(() => {
          const midpoint = innerHeight / 2;
          const links = [...document.querySelectorAll('.brand-sidebar a')];
          return {
            expected: links
              .filter((e) => {
                const r = document
                  .querySelector(e.hash)
                  .getBoundingClientRect();
                return r.top <= midpoint && r.bottom >= midpoint;
              })
              .map((e) => e.hash),
            actual: links
              .filter((e) => e.hasAttribute('aria-current'))
              .map((e) => e.hash),
          };
        });
        assert.deepEqual(data.actual, data.expected);
      },
    );
    for (let i = 0; i < 4; i++)
      await check(
        `${width} logo ${i}: physical swatch hit and real state surface/asset switch`,
        async () => {
          const tab = p.locator('[data-logo-color]').nth(i);
          await tab.scrollIntoViewIfNeeded();
          const box = await tab.boundingBox(),
            hit = await p.evaluate(
              ({ x, y }) =>
                document
                  .elementFromPoint(x, y)
                  ?.closest('button')
                  ?.getAttribute('data-logo-color'),
              { x: box.x + box.width / 2, y: box.y + box.height / 2 },
            );
          assert.equal(hit, await tab.getAttribute('data-logo-color'));
          await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          assert.equal(await tab.getAttribute('aria-selected'), 'true');
          const bg = await tab.getAttribute('data-logo-color');
          assert.equal(
            await p
              .locator('.brand-logos')
              .evaluate((e) => e.style.getPropertyValue('--logo-paper')),
            bg,
          );
          assert.equal(
            await p
              .locator('.brand-logo-copy')
              .evaluate((e) => getComputedStyle(e, '::before').backgroundColor),
            await tab.evaluate((e) => getComputedStyle(e).backgroundColor),
          );
          assert.equal(
            await p.locator('[data-logo-color][aria-selected=true]').count(),
            1,
          );
        },
      );
    if ([390, 768, 1440].includes(width))
      await check(
        `${width} logo keyboard semantics and focus retained`,
        async () => {
          const first = p.locator('[data-logo-color]').first();
          await first.focus();
          await p.keyboard.press('End');
          assert.equal(
            await p
              .locator('[data-logo-color]')
              .nth(3)
              .getAttribute('aria-selected'),
            'true',
          );
          await p.keyboard.press('ArrowRight');
          assert.equal(await first.getAttribute('aria-selected'), 'true');
          await p.keyboard.press('ArrowLeft');
          assert.equal(
            await p
              .locator('[data-logo-color]')
              .nth(3)
              .getAttribute('aria-selected'),
            'true',
          );
          await p.keyboard.press('Home');
          assert.equal(await first.getAttribute('aria-selected'), 'true');
        },
      );
  }
} finally {
  await b.close();
  const failed = results.filter((x) => !x.pass).length;
  await fs.writeFile(
    dir + '/interactions.json',
    JSON.stringify(
      { passed: results.length - failed, failed, paints, results },
      null,
      2,
    ),
  );
  console.log(
    `${results.length - failed} Brand interaction groups passed; ${failed} failed; ${paints} actual swatch pixels`,
  );
  if (failed) process.exitCode = 1;
}
