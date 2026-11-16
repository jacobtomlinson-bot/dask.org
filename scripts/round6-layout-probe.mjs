import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
const { browser, context } = await referenceBrowser(),
  rows = [];
for (const width of [390, 601, 768, 1440]) {
  const p = await context.newPage();
  await p.setViewportSize({ width, height: 1000 });
  await p.goto('https://www.dask.org/');
  await p.evaluate(() => document.fonts.ready);
  rows.push({
    width,
    data: await p.evaluate(() => {
      let pick = (e) => {
        let s = getComputedStyle(e);
        return {
          cls: e.className,
          r: e.getBoundingClientRect().toJSON(),
          css: Object.fromEntries(
            [
              'padding',
              'margin',
              'gap',
              'display',
              'flexDirection',
              'alignItems',
              'fontSize',
              'lineHeight',
              'border',
              'height',
              'minHeight',
              'backgroundSize',
            ].map((k) => [k, s[k]]),
          ),
        };
      };
      let g = document.querySelector('.grid._4-col.use-cases');
      return {
        cases: [
          g,
          g.parentElement,
          g.parentElement.parentElement,
          g.parentElement.parentElement.parentElement,
        ].map(pick),
        benefits: [
          ...document.querySelectorAll('.quote-content,.quote-content>*'),
        ].map(pick),
        footer: [...document.querySelectorAll('footer *, .footer *')]
          .filter(
            (e) =>
              e.tagName === 'IMG' ||
              e.textContent.trim().startsWith('Copyright') ||
              e.className === 'footer',
          )
          .map(pick),
      };
    }),
  });
  await p.close();
}
await browser.close();
await fs.writeFile(
  'evidence/round6/layout-probe.json',
  JSON.stringify(rows, null, 2),
);
