import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
const { browser, context } = await referenceBrowser();
const p = await context.newPage();
const out = [];
for (const route of ['/get-started', '/']) {
  await p.goto('https://www.dask.org' + route);
  await p.evaluate(() => document.fonts.ready);
  for (const width of [390, 601, 768, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.waitForTimeout(500);
    out.push(
      await p.evaluate(
        ({ width, route }) => {
          const h = [...document.querySelectorAll('h2')].find((e) =>
            e.textContent.startsWith(
              route === '/'
                ? 'Where you can run Dask'
                : 'Explore the Possibilities',
            ),
          );
          const section = h.closest('.section-responsive');
          const r0 = section.getBoundingClientRect();
          const info = (e) => {
            const r = e.getBoundingClientRect(),
              s = getComputedStyle(e);
            return {
              tag: e.tagName,
              c: String(e.className),
              text:
                e.children.length < 2 ? e.textContent.trim().slice(0, 100) : '',
              r: [r.x, r.y - r0.y, r.width, r.height],
              css: Object.fromEntries(
                [
                  'display',
                  'position',
                  'width',
                  'height',
                  'minHeight',
                  'maxWidth',
                  'padding',
                  'margin',
                  'gap',
                  'gridTemplateColumns',
                  'gridTemplateRows',
                  'flexDirection',
                  'justifyContent',
                  'alignItems',
                  'fontSize',
                  'fontWeight',
                  'lineHeight',
                  'backgroundColor',
                  'backgroundImage',
                  'backgroundSize',
                  'backgroundPosition',
                  'border',
                  'transform',
                  'top',
                  'left',
                  'right',
                  'bottom',
                  'objectFit',
                ].map((k) => [k, s[k]]),
              ),
              src: e.getAttribute('src'),
            };
          };
          return {
            width,
            route,
            nodes: [section, ...section.querySelectorAll('*')]
              .filter((e) => {
                const r = e.getBoundingClientRect();
                return (
                  r.width &&
                  r.height &&
                  e.tagName !== 'path' &&
                  e.tagName !== 'g'
                );
              })
              .map(info),
          };
        },
        { width, route },
      ),
    );
  }
}
await fs.writeFile(
  'evidence/round11/rendered-inspection.json',
  JSON.stringify(out, null, 2),
);
await browser.close();
console.log(out.length + ' component inspections');
