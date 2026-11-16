import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const ref = JSON.parse(
    await fs.readFile('evidence/round5/reference.json', 'utf8'),
  ),
  currentPalette = JSON.parse(
    await fs.readFile('evidence/round12/reference.json', 'utf8'),
  ),
  bounds = JSON.parse(
    await fs.readFile('evidence/round5/accepted-boundaries.json', 'utf8'),
  );
const b = await chromium.launch(),
  rows = [],
  base = process.env.BASE_URL || 'http://127.0.0.1:4321';
try {
  const p = await b.newPage({
    viewport: { width: 767, height: 1000 },
    reducedMotion: 'reduce',
  });
  await p.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await p.goto(base + '/brand-guide');
  for (const width of [767, 768, 769, 991, 992, 768]) {
    await p.setViewportSize({ width, height: 1000 });
    await expect(p.locator('[data-color="#FC6E6B"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // Compare the initial representative copy to the initial live reference.
    // Calculated contrast labels after selection intentionally differ from legacy labels.
    await p.goto(base + '/brand-guide');
    await p.evaluate(() => document.fonts.ready);
    const native = await p.locator('#colors').evaluate((e) => {
      const top = e.getBoundingClientRect().top,
        info = (x) => {
          let r = x.getBoundingClientRect();
          return {
            text: x.textContent.trim(),
            tag: x.tagName,
            r: { x: r.x, y: r.y - top, width: r.width, height: r.height },
          };
        };
      return {
        section: info(e),
        copy: [...e.querySelectorAll('h2,p,.copy-color')].map(info),
        colors: [...e.querySelectorAll('[data-color]')].map(info),
      };
    });
    const source = ref.find((r) => r.width === width),
      tablet = width >= 768 && width < 992;
    let maxError = 0,
      maxCopyError = 0;
    for (const color of native.colors) {
      const original = source.colors.find((x) => x.text === color.text);
      if (tablet) {
        for (const k of ['x', 'y', 'width', 'height']) {
          let delta = Math.abs(color.r[k] - original.r[k]);
          maxError = Math.max(maxError, delta);
          expect(delta, `${width} ${color.text} ${k}`).toBeLessThan(0.15);
        }
      } else {
        // Round5 protected an older native desktop boundary, not a live-source
        // measurement. Round12's full-identity fresh source corrects that track.
        const fresh =
          width === 992
            ? currentPalette
                .find((r) => r.route === 'brand-guide' && r.width === width)
                .cells.find((c) => c.lines[0] === color.text)
            : null;
        const old = fresh
          ? { rect: { x: fresh.x, width: fresh.w, height: fresh.h } }
          : bounds
              .find((r) => r.width === width)
              .cells.find((r) => r.text === color.text);
        for (const k of ['x', 'width', 'height'])
          expect(Math.abs(color.r[k] - old.rect[k])).toBeLessThan(0.02);
      }
    }
    if (tablet) {
      for (const item of native.copy) {
        const original = source.copy.find(
          (x) =>
            x.text === item.text &&
            (x.tag === item.tag || item.tag === 'BUTTON'),
        );
        expect(original, `original copy ${item.text}`).toBeTruthy();
        for (const k of ['x', 'y', 'width', 'height']) {
          maxCopyError = Math.max(
            maxCopyError,
            Math.abs(item.r[k] - original.r[k]),
          );
          expect(
            Math.abs(item.r[k] - original.r[k]),
            `${width} copy ${item.text.slice(0, 18)} ${k}`,
          ).toBeLessThan(0.25);
        }
      }
    }
    await p.evaluate(() => {
      const e = document.querySelector('#colors');
      scrollTo({
        top: e.getBoundingClientRect().top + scrollY,
        behavior: 'instant',
      });
    });
    await p.screenshot({ path: `evidence/round5/local-${width}.png` });
    for (let i = 0; i < native.colors.length; i++) {
      await p.locator('[data-color]').nth(i).click();
      await expect(p.locator('[data-color]').nth(i)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(p.locator('.color-hex')).toHaveText(native.colors[i].text);
      await p.locator('.copy-color').click();
      expect(await p.evaluate(() => navigator.clipboard.readText())).toBe(
        native.colors[i].text,
      );
    }
    await p.locator('[data-color="#FC6E6B"]').click();
    rows.push({
      width,
      tablet,
      maxCellError: maxError,
      maxCopyError,
      ...native,
    });
  }
  await p.close();
} finally {
  await b.close();
  await fs.writeFile(
    'evidence/round5/checks.json',
    JSON.stringify(rows, null, 2),
  );
}
console.log(
  `${rows.length} palette resize/geometry/all-color-copy cases passed`,
);
