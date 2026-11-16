import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const p = await context.newPage(),
  out = [];
for (const width of [390, 480, 601, 767, 768, 1440]) {
  await p.setViewportSize({ width, height: 1000 });
  for (const route of ['/get-started', '/']) {
    await p.goto('https://www.dask.org' + route);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    out.push(
      await p.evaluate(
        ({ route, width }) => {
          const h = [...document.querySelectorAll('h2')].find((e) =>
            e.textContent.startsWith(
              route === '/' ? 'Where you can' : 'Learn Your',
            ),
          );
          const base = h.closest('.section-responsive');
          const by = (e) => {
            const r = e.getBoundingClientRect(),
              s = getComputedStyle(e);
            return {
              c: e.className,
              t: e.tagName,
              text:
                e.children.length < 2 ? e.textContent.trim().slice(0, 40) : '',
              r: [r.x, r.y - base.getBoundingClientRect().y, r.width, r.height],
              css: Object.fromEntries(
                [
                  'display',
                  'position',
                  'width',
                  'height',
                  'padding',
                  'margin',
                  'gap',
                  'gridTemplateRows',
                  'gridTemplateColumns',
                  'alignItems',
                  'justifyContent',
                  'backgroundImage',
                  'backgroundSize',
                  'backgroundPosition',
                  'top',
                  'left',
                  'fontSize',
                  'lineHeight',
                  'fontWeight',
                  'aspectRatio',
                ].map((k) => [k, s[k]]),
              ),
            };
          };
          const scope =
            route === '/'
              ? [...document.querySelectorAll('[role=tab]')]
                  .find(
                    (e) => e.textContent.trim() === 'Open Source Deployment',
                  )
                  .closest('.w-tabs')
              : base;
          return {
            route,
            width,
            base: by(base),
            nodes: [scope, ...scope.querySelectorAll('*')]
              .filter((e) => {
                const r = e.getBoundingClientRect();
                return (
                  r.width &&
                  r.height &&
                  (route === '/' ? e.closest('[role=tablist]') : true) &&
                  e.tagName !== 'path' &&
                  e.tagName !== 'g'
                );
              })
              .map(by),
          };
        },
        { route, width },
      ),
    );
  }
}
await fs.writeFile(
  'evidence/round11/structure.json',
  JSON.stringify(out, null, 2),
);
await browser.close();
console.log(out.length + ' structures');
