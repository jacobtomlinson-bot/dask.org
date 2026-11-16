import fs from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import { measureTone, screenshotTone } from './tone-measure.mjs';
const references = JSON.parse(
  await fs.readFile('evidence/round7/reference.json', 'utf8'),
);
const baseline = JSON.parse(
  await fs.readFile('evidence/round7/accepted-phone-baseline.json', 'utf8'),
);
const browser = await chromium.launch(),
  rows = [];
try {
  const p = await browser.newPage({ reducedMotion: 'reduce' });
  for (const ref of references) {
    const width = ref.width;
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(
      (process.env.BASE_URL || 'http://127.0.0.1:4321') + '/brand-guide',
    );
    await p.evaluate(() => document.fonts.ready);
    const native = await measureTone(p);
    let maxParagraphError = 0,
      maxColumnError = 0;
    expect(native.paragraphs).toHaveLength(9);
    for (let i = 0; i < 9; i++) {
      const a = native.paragraphs[i],
        b = ref.paragraphs[i];
      expect(a.lines, `${width} p${i} rendered lines`).toEqual(b.lines);
      for (const key of ['x', 'y', 'width', 'height']) {
        const error = Math.abs(a[key] - b[key]);
        maxParagraphError = Math.max(maxParagraphError, error);
        expect(error, `${width} p${i} ${key}`).toBeLessThan(0.25);
      }
    }
    if (width >= 480) {
      for (let i = 0; i < 2; i++)
        for (const key of ['x', 'y', 'width', 'height']) {
          const error = Math.abs(native.columns[i][key] - ref.columns[i][key]);
          maxColumnError = Math.max(maxColumnError, error);
          expect(error, `${width} column${i} ${key}`).toBeLessThan(0.25);
        }
      expect(Math.abs(native.section.height - ref.section.height)).toBeLessThan(
        0.25,
      );
    } else {
      const accepted = baseline.find((r) => r.width === width);
      for (let i = 0; i < 9; i++)
        for (const key of ['x', 'y', 'width', 'height'])
          expect(
            Math.abs(native.paragraphs[i][key] - accepted.paragraphs[i][key]),
            `${width} preserved phone p${i} ${key}`,
          ).toBeLessThan(0.02);
    }
    const styles = await p.locator('#tone').evaluate((e) => ({
      min: getComputedStyle(e).minHeight,
      height: e.style.height,
      overflow: getComputedStyle(e).overflow,
      breaks: e.querySelectorAll('br').length,
    }));
    expect(['auto', '0px']).toContain(styles.min);
    expect(styles.height).toBe('');
    expect(styles.overflow).toBe('visible');
    expect(styles.breaks).toBe(6);
    await screenshotTone(p, `evidence/round7/local/tone-${width}.png`);
    rows.push({ width, maxParagraphError, maxColumnError, styles, native });
  }
  console.log(
    `${rows.length} tone composition groups passed: both columns, all 90 paragraph bounds and exact rendered line text; accepted phone bounds unchanged.`,
  );
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round7/checks.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
