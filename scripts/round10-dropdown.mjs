import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { referenceBrowser } from './reference-browser.mjs';
const reference = process.env.REFERENCE === '1';
const { browser, context } = reference
  ? await referenceBrowser()
  : await (async () => {
      const browser = await chromium.launch();
      return {
        browser,
        context: await browser.newContext({ reducedMotion: 'reduce' }),
      };
    })();
const rows = [];
try {
  for (const width of [992, 1100, 1440]) {
    const p = await context.newPage();
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(
      (reference
        ? 'https://www.dask.org'
        : process.env.BASE_URL || 'http://127.0.0.1:4321') + '/',
    );
    await p.evaluate(() => document.fonts.ready);
    if (reference) await p.waitForTimeout(500);
    await p
      .locator(reference ? '.dropdown-toggle.hide-tablet' : '.community-toggle')
      .click();
    await p
      .locator(reference ? '.dropdown-list.w--open' : '#community-links')
      .waitFor({ state: 'visible' });
    const data = await p.evaluate((reference) => {
      const menu = document.querySelector(
          reference ? '.dropdown-list.w--open' : '#community-links',
        ),
        r = menu.getBoundingClientRect();
      const info = (e) => {
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
          text: e.textContent.trim(),
          href: e.getAttribute('href'),
        };
      };
      return {
        box: { x: r.x, y: r.y, w: r.width, h: r.height },
        links: [...menu.querySelectorAll('a')]
          .filter((e) => e.getBoundingClientRect().height > 0)
          .map(info),
      };
    }, reference);
    rows.push({ width, ...data });
    await p.screenshot({
      path: `evidence/round10/dropdown-${reference ? 'reference' : 'local'}-${width}.png`,
    });
    if (!reference) {
      await p.keyboard.press('Escape');
      assert.equal(
        await p.locator('.community-toggle').getAttribute('aria-expanded'),
        'false',
      );
      await p.locator('.community-toggle').click();
      await p.locator('h1').click();
      assert.equal(
        await p.locator('.community-toggle').getAttribute('aria-expanded'),
        'false',
      );
    }
    await p.close();
  }
} finally {
  await browser.close();
}
if (reference)
  await fs.writeFile(
    'evidence/round10/dropdown-reference.json',
    JSON.stringify(rows, null, 2),
  );
else {
  const gold = JSON.parse(
    await fs.readFile('evidence/round10/dropdown-reference.json'),
  );
  for (const a of rows) {
    const b = gold.find((b) => b.width === a.width);
    for (const k of ['x', 'y', 'w', 'h'])
      assert.ok(
        Math.abs(a.box[k] - b.box[k]) < 0.1,
        `${a.width} dropdown ${k}`,
      );
    assert.equal(a.links.length, 3);
    a.links.forEach((l, i) => {
      for (const k of ['x', 'y', 'w', 'h'])
        assert.ok(
          Math.abs(l[k] - b.links[i][k]) < 0.1,
          `${a.width} link${i} ${k}`,
        );
      for (const k of ['font', 'line', 'weight', 'text', 'href'])
        assert.equal(l[k], b.links[i][k]);
    });
  }
  await fs.writeFile(
    'evidence/round10/dropdown-local.json',
    JSON.stringify(rows, null, 2),
  );
  console.log(
    '3 fixed-size desktop dropdown states and6 dismissal transitions matched.',
  );
}
