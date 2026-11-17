import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { chromium, expect } from '@playwright/test';
const dir = 'evidence/round11',
  base = process.env.BASE_URL || 'http://127.0.0.1:4321';
if (!process.env.SKIP_COLLECT)
  await promisify(execFile)(process.execPath, ['scripts/round11-probe.mjs'], {
    env: { ...process.env, BASE_URL: base },
    maxBuffer: 1024 * 1024,
  });
const refs = JSON.parse(await fs.readFile(dir + '/reference.json')),
  locals = JSON.parse(await fs.readFile(dir + '/local.json')),
  results = [],
  maxima = { learn: 0, explore: 0, deployment: 0 };
let arrays = 0;
function check(name, fn) {
  try {
    fn();
    results.push({ name, passed: true });
  } catch (e) {
    results.push({ name, passed: false, error: String(e) });
  }
}
function near(a, b, t, label) {
  assert.ok(
    Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= t,
    `${label}: ${b} vs ${a}, Δ${b - a}`,
  );
}
function box(a, b, name, kind, t = 0.6) {
  assert.ok(a && b, name);
  for (const k of ['x', 'y', 'w', 'h']) {
    near(a[k], b[k], t, name + '.' + k);
    maxima[kind] = Math.max(maxima[kind], Math.abs(a[k] - b[k]));
  }
}
function text(a, b, name, kind) {
  box(a, b, name, kind);
  assert.deepEqual(b.lines, a.lines, name + ' exact lines');
  arrays++;
  for (const k of ['fontSize', 'lineHeight'])
    near(parseFloat(a.css[k]), parseFloat(b.css[k]), 0.03, name + ' ' + k);
  assert.equal(b.css.fontWeight, a.css.fontWeight, name + ' weight');
  assert.equal(b.css.color, a.css.color, name + ' actual color');
}
function all(a, b, fn) {
  assert.equal(b.length, a.length, 'element count');
  a.forEach((x, i) => fn(x, b[i], i));
}
for (const r of refs) {
  const n = locals.find(
    (n) => n.width === r.width && n.route === r.route && n.state === r.state,
  );
  assert.ok(n);
  assert.equal(n.overflow, false, `overflow ${r.width} ${r.state}`);
  if (r.explore) {
    const a = r.explore,
      b = n.explore;
    check(
      `${r.width} ${r.state}: Explore intro/card lines, tracks and intrinsic actions`,
      () => {
        for (const k of ['heading', 'intro', 'title', 'body', 'action'])
          text(a[k], b[k], k, 'explore');
        box(a.card, b.card, 'card', 'explore');
        assert.equal(
          new URL(b.action.href, 'https://www.dask.org').href,
          new URL(a.action.href, 'https://www.dask.org').href,
        );
      },
    );
    check(
      `${r.width} ${r.state}: all disks, icons, labels, connector segments and both arrow slots`,
      () => {
        all(a.tabs, b.tabs, (x, y, i) => box(x, y, 'disk ' + i, 'explore'));
        all(a.icons, b.icons, (x, y, i) => box(x, y, 'icon ' + i, 'explore'));
        all(a.labels, b.labels, (x, y, i) =>
          text(x, y, 'label ' + i, 'explore'),
        );
        all(a.connectors, b.connectors, (x, y, i) =>
          box(x, y, 'connector ' + i, 'explore'),
        );
        all(a.arrows, b.arrows, (x, y, i) =>
          box(x, y, 'arrow ' + i, 'explore'),
        );
      },
    );
    // The measured width-driven pane preserves its action overhang without clipping.
    // Round15 additionally checks its trailing canvas and actual painted seam.
    check(`${r.width} ${r.state}: no section-height concealment`, () => {
      near(a.section.h, b.section.h, 0.125, 'Explore intrinsic boundary');
      assert.ok(b.card.y + b.card.h <= b.action.y + 0.1);
      assert.ok(b.action.y + b.action.h <= b.section.h + 0.1);
    });
    if (r.state === 'Ecosystem') {
      const a = r.learn,
        b = n.learn;
      check(
        `${r.width}: Learn contains all three illustrations and preserves all five tutorials`,
        () => {
          box(a.section, b.section, 'Learn section', 'learn');
          near(a.nextTop, b.nextTop, 0.6, 'next section boundary');
          text(a.heading, b.heading, 'Learn heading', 'learn');
          text(a.intro, b.intro, 'Learn intro', 'learn');
          all(a.titles, b.titles, (x, y, i) =>
            text(x, y, 'tutorial heading ' + i, 'learn'),
          );
          all(a.body, b.body, (x, y, i) =>
            text(x, y, 'tutorial body ' + i, 'learn'),
          );
          all(a.actions, b.actions, (x, y, i) => {
            box(x.ink, y.ink, 'tutorial action ink ' + i, 'learn');
            assert.deepEqual(y.lines, x.lines);
            arrays++;
          });
          all(a.art, b.art, (x, y, i) => {
            box(x, y, 'art ' + i, 'learn');
            assert.ok(
              y.y + y.h <= b.section.h + 0.6,
              'art must remain before Explore',
            );
          });
          assert.ok(
            b.nextTop >= Math.max(...b.art.map((e) => e.y + e.h)) - 0.6,
            'media cannot occlude Explore',
          );
        },
      );
    }
  } else {
    const a = r.deployment,
      b = n.deployment;
    check(
      `${r.width} ${r.state}: deployment type, action destinations and selector geometry`,
      () => {
        for (const k of ['heading', 'title', 'body'])
          text(a[k], b[k], k, 'deployment');
        all(a.tabs, b.tabs, (x, y, i) =>
          box(x, y, 'control ' + i, 'deployment'),
        );
        all(a.labels, b.labels, (x, y, i) =>
          text(x, y, 'control label ' + i, 'deployment'),
        );
        all(a.actions, b.actions, (x, y, i) => {
          text(x, y, 'action ' + i, 'deployment');
          assert.equal(
            new URL(y.href, 'https://www.dask.org').href,
            new URL(x.href, 'https://www.dask.org').href,
          );
        });
      },
    );
    check(
      `${r.width} ${r.state}: intrinsic logo art and terminal frame/bar/dots/code insets`,
      () => {
        all(a.logos, b.logos, (x, y, i) => {
          box(x, y, 'logo ' + i, 'deployment');
          assert.equal(y.css.opacity, x.css.opacity, 'logo opacity');
          assert.equal(y.css.filter, x.css.filter, 'logo filter');
          assert.equal(
            decodeURIComponent(y.src.split('/').pop()).replaceAll('-2', ' 2'),
            decodeURIComponent(x.src.split('/').pop())
              .replace(/^[a-f0-9]{24,}_/, '')
              .replaceAll('-2', ' 2'),
          );
        });
        for (const k of ['panel', 'terminal', 'bar', 'pre'])
          box(a[k], b[k], k, 'deployment');
        all(a.dots, b.dots, (x, y, i) => {
          box(x, y, 'dot ' + i, 'deployment');
          assert.equal(y.css.backgroundColor, x.css.backgroundColor);
        });
        assert.deepEqual(b.pre.lines, a.pre.lines);
        arrays++;
        near(a.section.h, b.section.h, 0.6, 'deployment section boundary');
      },
    );
  }
}
if (!process.env.SKIP_COLLECT)
  await promisify(execFile)(
    process.execPath,
    ['scripts/round11-ancillary.mjs'],
    { env: { ...process.env, BASE_URL: base } },
  );
const ancillaryRef = JSON.parse(
  await fs.readFile(dir + '/ancillary-reference.json'),
);
const ancillaryLocal = JSON.parse(
  await fs.readFile(dir + '/ancillary-local.json'),
);
for (const r of ancillaryRef) {
  const n = ancillaryLocal.find(
    (n) => n.width === r.width && n.route === r.route,
  );
  check(
    r.width +
      ' ' +
      r.route +
      ': ancillary type, weights and actual action underline',
    () => {
      r.items.forEach((x, i) => {
        const a = x.element,
          b = n.items[i].element;
        for (const k of ['fontSize', 'lineHeight'])
          near(
            parseFloat(a.css[k]),
            parseFloat(b.css[k]),
            0.03,
            x.target + ' ' + k,
          );
        assert.equal(b.css.fontWeight, a.css.fontWeight);
        if (r.route === 'press-mentions') {
          for (const k of ['x', 'w', 'h'])
            near(a[k], b[k], 0.25, 'underline ' + k);
          near(a.y, b.y, 1.1, 'underline y');
          assert.equal(b.css.borderBottom, a.css.borderBottom);
        }
      });
    },
  );
}
const browser = await chromium.launch();
try {
  for (const width of [390, 768, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: 'reduce',
    });
    await page.goto(base + '/get-started');
    await page.evaluate(() => document.fonts.ready);
    const tabs = page.locator('.explore-tabs [role=tab]'),
      panel = () => page.locator('.explore-panel:not([hidden])');
    for (const [from, to, direction] of [
      [0, 1, 'Next'],
      [1, 0, 'Previous'],
      [1, 2, 'Next'],
      [2, 1, 'Previous'],
    ]) {
      await tabs.nth(from).click();
      assert.equal(
        await panel().locator('[data-select-tab]').count(),
        from === 1 ? 2 : 1,
      );
      await panel()
        .getByRole('button', { name: new RegExp('^' + direction) })
        .click();
      await expect(tabs.nth(to)).toHaveAttribute('aria-selected', 'true');
      await expect(panel().locator('h3')).toHaveText(
        ['Ecosystem', 'Case studies', 'Examples'][to],
      );
      await expect(tabs.nth(to)).toBeFocused();
    }
    await tabs.nth(0).click();
    assert.equal(
      await panel()
        .getByRole('button', { name: /Previous/ })
        .count(),
      0,
    );
    await tabs.nth(2).click();
    assert.equal(
      await panel().getByRole('button', { name: /Next/ }).count(),
      0,
    );
    await tabs.nth(0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await page.keyboard.press('End');
    await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Home');
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    results.push({
      name: `${width}: four bounded arrows, no endpoint wrap, keyboard and retained focus`,
      passed: true,
    });
    await page.goto(base + '/');
    const deployment = page.locator('.deployment'),
      deployTabs = deployment.locator('[role=tab]');
    const poses = [];
    for (let i = 0; i < 2; i++) {
      await deployTabs.nth(i).click();
      await expect(deployTabs.nth(i)).toHaveAttribute('aria-selected', 'true');
      if (width >= 768) {
        let r = await deployment.locator('.deployment-switch').boundingBox(),
          thumb = await deployment
            .locator('.deployment-switch i')
            .boundingBox();
        near(
          width === 1440 ? 40.0032 : 21.335,
          r.width,
          0.05,
          'native switch width',
        );
        poses.push(thumb.x);
      }
    }
    if (width >= 768)
      assert.ok(
        poses[1] > poses[0] + 5,
        'switch knob must reflect selected state',
      );
    else await expect(deployment.locator('.deployment-switch')).toBeHidden();
    await deployTabs.nth(0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(deployTabs.nth(1)).toBeFocused();
    results.push({
      name: `${width}: deployment stateful switch/phone tabs and keyboard`,
      passed: true,
    });
    await page.close();
  }
} catch (e) {
  results.push({
    name: 'interactive regressions',
    passed: false,
    error: String(e),
  });
} finally {
  await browser.close();
}
await fs.writeFile(
  dir + '/checks.json',
  JSON.stringify(
    {
      passed: results.filter((x) => x.passed).length,
      failed: results.filter((x) => !x.passed).length,
      arrays,
      maxima,
      results,
    },
    null,
    2,
  ),
);
for (const x of results.filter((x) => !x.passed))
  console.error(x.name, x.error);
console.log(
  `${results.filter((x) => x.passed).length} round11 groups passed, ${results.filter((x) => !x.passed).length} failed; ${arrays} exact line arrays; ${JSON.stringify(maxima)}`,
);
if (results.some((x) => !x.passed)) process.exitCode = 1;
