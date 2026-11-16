import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const dir = 'evidence/round12',
  base = process.env.BASE_URL || 'http://127.0.0.1:4321',
  b = await chromium.launch(),
  results = [];
let failed = 0;
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
  } catch (e) {
    failed++;
    results.push({ name, pass: false, error: e.message });
    console.error(name, e.message);
  }
}
const sha = (v) => createHash('sha256').update(v).digest('hex');
try {
  await check(
    'asset provenance paths are unique and both Pandas variants retain exact source identities',
    async () => {
      const a = JSON.parse(await fs.readFile('src/data/assets.json', 'utf8'));
      assert.equal(new Set(a.map((x) => x.path.toLowerCase())).size, a.length);
      for (const [name, hash] of [
        [
          'gray',
          'dec76ba8f680b191f3d9fb1d066395e7048d421981f45f0ded316b4312d90dc4',
        ],
        [
          'color',
          '5a2dbb218525973760e4c25ba016d7ea0649ad77ed3235ed7e31569b20c6e5d3',
        ],
      ])
        assert.equal(
          sha(await fs.readFile(`public/assets/Pandas_logo-${name}.svg`)),
          hash,
        );
    },
  );
  const c = await b.newContext({
      reducedMotion: 'reduce',
      permissions: ['clipboard-read', 'clipboard-write'],
    }),
    p = await c.newPage();
  for (const width of [768, 769, 991, 992, 1100, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(base);
    for (const start of [0, 1])
      await check(
        `R11-1 ${width} starting ${start}: repeated fixed visible-center hits reverse both ways`,
        async () => {
          const tabs = p.locator('.deployment [role=tab]');
          await tabs.nth(start).click();
          await p.locator('.deployment-switch').scrollIntoViewIfNeeded();
          const r = await p.locator('.deployment-switch').boundingBox(),
            fixed = { x: r.x + r.width / 2, y: r.y + r.height / 2 },
            phases = [];
          for (let i = 0; i < 4; i++) {
            const hit = await p.evaluate(
              ({ x, y }) =>
                document.elementFromPoint(x, y)?.closest('[role=tab]')?.id,
              fixed,
            );
            assert.equal(hit, `deploy-tab-${1 - ((start + i) % 2)}`);
            await p.mouse.click(fixed.x, fixed.y);
            const selected = (start + i + 1) % 2;
            assert.equal(
              await tabs.nth(selected).getAttribute('aria-selected'),
              'true',
            );
            const panel = p.locator(`#deploy-${selected}`);
            assert.equal(await panel.isVisible(), true);
            const href = await panel
              .locator('.workload-actions a')
              .first()
              .getAttribute('href');
            assert.ok(
              selected
                ? href.includes('docs.coiled.io/user_guide')
                : href.endsWith('/deploying.html'),
            );
            phases.push({ hit, selected, href });
          }
          results.push({ width, start, fixed, phases });
        },
      );
  }
  for (const width of [
    390, 479, 480, 601, 767, 768, 769, 991, 992, 1100, 1440,
  ]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(base + '/brand-guide');
    await p.evaluate(() => document.fonts.ready);
    const cells = p.locator('[data-color]');
    await check(
      `R11-3 ${width}: all twelve visible cell paints and labels survive paper layer`,
      async () => {
        await cells.filter({ hasText: '#FC6E6B' }).click();
        const boxes = await cells.evaluateAll((els) => {
          const o = document.querySelector('#colors').getBoundingClientRect();
          return els.map((e) => {
            const r = e.getBoundingClientRect();
            const z = document.createRange();
            z.selectNodeContents(e);
            const ink = z.getBoundingClientRect();
            return {
              hex: e.dataset.color,
              selected: e.getAttribute('aria-pressed') === 'true',
              x: r.x - o.x,
              y: r.y - o.y,
              w: r.width,
              h: r.height,
              ink: {
                x: ink.x - o.x,
                y: ink.y - o.y,
                w: ink.width,
                h: ink.height,
              },
            };
          });
        });
        const png = PNG.sync.read(
          await p
            .locator('#colors')
            .screenshot({ path: `${dir}/palette-paint-${width}.png` }),
        );
        for (const cell of boxes) {
          const x = Math.floor(cell.x + cell.w * 0.87),
            y = Math.floor(cell.y + cell.h * 0.75),
            offset = (y * png.width + x) * 4,
            actual = [...png.data.slice(offset, offset + 3)],
            hex = cell.selected ? '#FC6E6B' : cell.hex,
            expected = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
          assert.deepEqual(actual, expected, `${cell.hex} painted RGB`);
          cell.sample = { x, y, actual };
          if (!cell.selected) {
            let changed = 0;
            for (
              let iy = Math.ceil(cell.ink.y);
              iy < cell.ink.y + cell.ink.h;
              iy++
            )
              for (
                let ix = Math.ceil(cell.ink.x);
                ix < cell.ink.x + cell.ink.w;
                ix++
              ) {
                const j = (iy * png.width + ix) * 4;
                if (expected.some((v, k) => Math.abs(png.data[j + k] - v) > 40))
                  changed++;
              }
            assert.ok(changed > 20, `${cell.hex} visible label ink`);
            cell.labelInkPixels = changed;
          }
        }
        results.push({ width, paint: boxes });
      },
    );
    await check(
      `R11-3 ${width}: all selections and clipboard, restoring Salmon`,
      async () => {
        for (let i = 0; i < 12; i++) {
          const cell = cells.nth(i),
            hex = await cell.getAttribute('data-color');
          await cell.click();
          assert.equal(await cell.getAttribute('aria-pressed'), 'true');
          assert.equal(
            await cell.evaluate((e) => getComputedStyle(e).color),
            'rgba(0, 0, 0, 0)',
            'settled selected labels match original transparent treatment',
          );
          if ([479, 480, 601, 767, 768].includes(width)) {
            const boxes = await cells.evaluateAll((els) => {
              const r = document
                .querySelector('#colors')
                .getBoundingClientRect();
              return els.map((e) => {
                const b = e.getBoundingClientRect();
                return {
                  hex: e.dataset.color,
                  x: b.x - r.x + b.width * 0.87,
                  y: b.y - r.y + b.height * 0.75,
                };
              });
            });
            const image = PNG.sync.read(
                await p.locator('#colors').screenshot(),
              ),
              samples = [];
            for (const box of boxes) {
              const offset =
                  (Math.floor(box.y) * image.width + Math.floor(box.x)) * 4,
                actual = [...image.data.slice(offset, offset + 3)],
                expected = [1, 3, 5].map((i) =>
                  parseInt(box.hex.slice(i, i + 2), 16),
                );
              assert.deepEqual(
                actual,
                expected,
                `${hex} selected: ${box.hex} actual paint`,
              );
              samples.push({ hex: box.hex, actual });
            }
            results.push({ width, selected: hex, samples });
          }
          assert.equal(
            (await p.locator('.color-hex').textContent()).trim(),
            hex,
          );
          await p.locator('.copy-color').click();
          assert.equal(
            await p.evaluate(() => navigator.clipboard.readText()),
            hex,
          );
        }
        await cells.filter({ hasText: '#FC6E6B' }).click();
      },
    );
  }
  const hover = JSON.parse(
    await fs.readFile(`${dir}/source-workload-hover.json`, 'utf8'),
  );
  for (const width of [390, 768, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(base);
    await check(
      `workload hover ${width}: selected white and inactive yellow match original`,
      async () => {
        for (const row of hover.filter((r) => r.width === width)) {
          const tab = p.getByRole('tab', { name: row.label, exact: true });
          await tab.hover();
          assert.equal(
            await tab.evaluate((e) => getComputedStyle(e).color),
            row.color,
          );
        }
      },
    );
  }
  await check(
    'R11-4 actual hero and testimonial use distinct Pandas bytes, no CSS contrast suppression',
    async () => {
      await p.setViewportSize({ width: 1440, height: 1000 });
      await p.goto(base);
      const hero = p.locator('#workload-0 .workload-logos img').last(),
        quote = p.locator('.quote-logo').first();
      assert.equal(
        await hero.getAttribute('src'),
        '/assets/Pandas_logo-gray.svg',
      );
      assert.equal(
        await quote.getAttribute('src'),
        '/assets/Pandas_logo-color.svg',
      );
      for (const e of [hero, quote]) {
        const src = await e.getAttribute('src'),
          hash = sha(
            Buffer.from(await (await fetch(base + src)).arrayBuffer()),
          );
        assert.equal(
          hash,
          src.includes('gray')
            ? 'dec76ba8f680b191f3d9fb1d066395e7048d421981f45f0ded316b4312d90dc4'
            : '5a2dbb218525973760e4c25ba016d7ea0649ad77ed3235ed7e31569b20c6e5d3',
        );
      }
      assert.deepEqual(
        await hero.evaluate((e) => {
          const s = getComputedStyle(e);
          return [s.filter, s.opacity];
        }),
        ['none', '1'],
      );
    },
  );
} finally {
  await b.close();
  await fs.writeFile(
    `${dir}/interactions.json`,
    JSON.stringify({ failed, results }, null, 2) + '\n',
  );
}
console.log(
  results.filter((r) => r.pass).length,
  'interaction/paint/identity groups passed;',
  failed,
  'failed',
);
if (failed) process.exitCode = 1;
