import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
const { browser, context } = await referenceBrowser();
const out = [];
try {
  for (const width of [390, 601, 768, 992, 1440]) {
    const p = await context.newPage();
    await p.setViewportSize({ width, height: 1000 });
    await p.goto('https://www.dask.org/press-mentions');
    await p.evaluate(() => document.fonts.ready);
    out.push({
      width,
      press: await p
        .locator('.press-r-link')
        .first()
        .evaluate((e) =>
          [e, ...e.querySelectorAll('*')].map((x) => {
            let s = getComputedStyle(x),
              r = x.getBoundingClientRect();
            return {
              tag: x.tagName,
              cls: String(x.className),
              x: r.x,
              y: r.y,
              w: r.width,
              h: r.height,
              css: Object.fromEntries(
                [
                  'display',
                  'width',
                  'height',
                  'margin',
                  'padding',
                  'flex',
                  'border',
                  'objectFit',
                  'fontSize',
                  'fontWeight',
                  'lineHeight',
                  'alignItems',
                ].map((k) => [k, s[k]]),
              ),
            };
          }),
        ),
    });
    await p.goto('https://www.dask.org/brand-guide');
    out.at(-1).intro = await p
      .locator('#typography .brg-text-l')
      .evaluate((e) =>
        [e, ...e.querySelectorAll('*')].map((x) => {
          let s = getComputedStyle(x),
            r = x.getBoundingClientRect();
          return {
            tag: x.tagName,
            cls: String(x.className),
            text: x.textContent.trim(),
            x: r.x,
            y: r.y,
            w: r.width,
            h: r.height,
            css: Object.fromEntries(
              [
                'display',
                'width',
                'height',
                'margin',
                'padding',
                'fontFamily',
                'fontSize',
                'fontWeight',
                'lineHeight',
                'alignItems',
              ].map((k) => [k, s[k]]),
            ),
          };
        }),
      );
    await p.close();
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round10/details-reference.json',
    JSON.stringify(out, null, 2),
  );
}
