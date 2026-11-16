import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const result = [];
for (const width of [1440, 768, 390])
  for (const slug of [
    'get-started',
    'get-help',
    'brand-guide',
    'powered-by',
    'press-mentions',
    'home',
  ]) {
    let p = await context.newPage();
    await p.setViewportSize({ width, height: 900 });
    await p.goto('https://www.dask.org/' + (slug === 'home' ? '' : slug), {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await p.evaluate(() => document.fonts.ready);
    result.push({
      width,
      slug,
      data: await p.evaluate(() =>
        [
          ...document.querySelectorAll(
            'h1,h2,p,.section-responsive,.footer-container,.footer-grid,.bg-black,.container-helplogo,.home-tabs-menu,.home-tab-link,.run-dask-tab-link,.br-g-colors-tabs-menu,.color-text-container,.br-guide-type-text',
          ),
        ]
          .filter((e) => e.getBoundingClientRect().width > 0)
          .map((e) => {
            let s = getComputedStyle(e),
              r = e.getBoundingClientRect();
            return {
              tag: e.tagName,
              cls: e.className,
              text: e.textContent.trim().slice(0, 55),
              r: [r.x, r.y, r.width, r.height].map(Math.round),
              font: s.font,
              padding: s.padding,
              margin: s.margin,
              bgSize: s.backgroundSize,
              bgPosition: s.backgroundPosition,
              columns: s.gridTemplateColumns,
            };
          }),
      ),
    });
    await fs.writeFile(
      'evidence/reference/responsive-details.json',
      JSON.stringify(result, null, 2),
    );
    await p.close();
  }
await browser.close();
