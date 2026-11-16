import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { referenceBrowser } from './reference-browser.mjs';
const refs = await referenceBrowser(),
  browser = await chromium.launch(),
  context = await browser.newContext({ reducedMotion: 'reduce' }),
  rows = [];
try {
  for (const width of [390, 768, 1440])
    for (const slug of ['brand-guide', 'powered-by', 'get-help', 'get-started'])
      for (const [label, c, root] of [
        ['reference', refs.context, 'https://www.dask.org'],
        ['local', context, process.env.BASE_URL || 'http://127.0.0.1:4321'],
      ]) {
        const p = await c.newPage();
        await p.setViewportSize({ width, height: 1000 });
        await p.goto(root + '/' + slug);
        await p.evaluate(() => document.fonts.ready);
        const data = await p.evaluate(() => {
          const out = [];
          const firstH1 = document.querySelector('h1');
          const hero = firstH1.closest('section');
          const h2 = [...document.querySelectorAll('h2')].find((e) =>
            e.textContent.includes('Asking for help'),
          );
          const targets = [
            firstH1,
            hero?.querySelector('p'),
            h2?.parentElement.querySelector('p'),
          ].filter(Boolean);
          for (const e of targets) {
            let a = [],
              x = e;
            for (let i = 0; x && i < 5; i++, x = x.parentElement) {
              let r = x.getBoundingClientRect(),
                s = getComputedStyle(x);
              a.push({
                tag: x.tagName,
                cls: x.className,
                text: x.textContent.trim().slice(0, 70),
                r: r.toJSON(),
                style: Object.fromEntries(
                  [
                    'backgroundColor',
                    'padding',
                    'margin',
                    'display',
                    'position',
                    'lineHeight',
                    'fontSize',
                  ].map((k) => [k, s[k]]),
                ),
              });
            }
            out.push(a);
          }
          return out;
        });
        rows.push({ width, slug, label, data });
        await p.close();
      }
} finally {
  await refs.browser.close();
  await browser.close();
  await fs.writeFile(
    'evidence/round8/copy-surfaces.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
