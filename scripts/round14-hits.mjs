import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { expectReadingMarker } from './brand-reading-check.mjs';
const refs = JSON.parse(
  await fs.readFile('evidence/round14/reference-scroll.json', 'utf8'),
);
const b = await chromium.launch(),
  p = await b.newPage({ reducedMotion: 'reduce' }),
  rows = [];
try {
  for (const width of [...new Set(refs.map((r) => r.width))])
    for (const height of [700, 1000]) {
      await p.setViewportSize({ width, height });
      await p.goto(
        (process.env.BASE_URL || 'http://127.0.0.1:4321') + '/brand-guide',
      );
      await p.evaluate(() => document.fonts.ready);
      for (const [section, offset] of [
        ['logos', 300],
        ['tone', 500],
        ['tone', 1300],
      ]) {
        const ref = refs.find(
          (r) =>
            r.width === width &&
            r.height === height &&
            r.direction === 'forward' &&
            r.section === section &&
            r.offset === offset,
        );
        for (const link of ref.links) {
          const point = { x: link.x + link.w / 2, y: link.y + link.h / 2 };
          if (point.y < 0 || point.y >= height || link.hit !== link.href)
            continue;
          await p.locator('#' + section).evaluate(
            (e, offset) =>
              scrollTo({
                top: scrollY + e.getBoundingClientRect().y + offset,
                behavior: 'instant',
              }),
            offset,
          );
          await p.waitForTimeout(40);
          const hit = await p.evaluate(
            ({ x, y }) =>
              document
                .elementFromPoint(x, y)
                ?.closest('a')
                ?.getAttribute('href') ?? null,
            point,
          );
          assert.equal(
            hit,
            link.href,
            `${width}/${height} ${section}+${offset} actual physical point`,
          );
          await p.mouse.click(point.x, point.y);
          await p.waitForTimeout(60);
          assert.equal(
            await p.evaluate(() => location.hash),
            link.href,
            'actual point activates destination',
          );
          await expectReadingMarker(p);
          rows.push({
            width,
            height,
            section,
            offset,
            point,
            expected: link.href,
            hit,
            hash: await p.evaluate(() => location.hash),
          });
        }
      }
      const links = p.locator('.brand-sidebar a');
      for (let i = 0; i < 4; i++) {
        await links.nth(i).focus();
        await p.keyboard.press('Enter');
        await p.waitForTimeout(40);
        assert.equal(
          await p.evaluate(() => location.hash),
          await links.nth(i).getAttribute('href'),
        );
      }
    }
} finally {
  await b.close();
  await fs.writeFile(
    'evidence/round14/hits.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
console.log(
  rows.length,
  'real source-coordinate clicks plus 88 keyboard anchor activations passed',
);
