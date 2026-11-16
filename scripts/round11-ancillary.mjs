import { referenceBrowser } from './reference-browser.mjs';
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const ref = process.env.REFERENCE === '1',
  o = ref ? await referenceBrowser() : { browser: await chromium.launch() };
o.context ??= await o.browser.newContext({ reducedMotion: 'reduce' });
let p = await o.context.newPage(),
  rows = [];
for (let width of [390, 601, 768, 991, 992, 1440]) {
  await p.setViewportSize({ width, height: 1000 });
  for (let route of ['get-started', 'powered-by', 'press-mentions']) {
    await p.goto(
      (ref
        ? 'https://www.dask.org'
        : process.env.BASE_URL || 'http://127.0.0.1:4321') +
        '/' +
        route,
    );
    await p.evaluate(() => document.fonts.ready);
    rows.push(
      await p.evaluate(
        ({ width, route }) => {
          const titles =
            route === 'get-started'
              ? [
                  'Ready to dive in?',
                  'Dask has published extensive',
                  'Dask YouTube Channel',
                ]
              : route === 'powered-by'
                ? ['See Python Developers Survey']
                : ['Add a press mention'];
          const info = (e) => {
            let r = e.getBoundingClientRect(),
              s = getComputedStyle(e);
            return {
              tag: e.tagName,
              cls: e.className,
              text: e.textContent.trim(),
              x: r.x,
              y: r.y + scrollY,
              w: r.width,
              h: r.height,
              css: Object.fromEntries(
                [
                  'fontSize',
                  'fontWeight',
                  'lineHeight',
                  'padding',
                  'margin',
                  'textDecoration',
                  'borderBottom',
                  'display',
                ].map((k) => [k, s[k]]),
              ),
            };
          };
          return {
            width,
            route,
            items: titles.map((t) => {
              let e = [...document.querySelectorAll('p,a,span,div,button')]
                .filter(
                  (e) =>
                    e.getBoundingClientRect().width &&
                    e.textContent.trim().replace(/\s+/g, ' ').startsWith(t),
                )
                .at(-1);
              return {
                target: t,
                element: info(e),
                parent: info(e.parentElement),
              };
            }),
          };
        },
        { width, route },
      ),
    );
  }
}
await o.browser.close();
await fs.writeFile(
  `evidence/round11/ancillary-${ref ? 'reference' : 'local'}.json`,
  JSON.stringify(rows, null, 2),
);
console.log(rows.length + ' ancillary records');
