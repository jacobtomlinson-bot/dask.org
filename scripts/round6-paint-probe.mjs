import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
const { browser, context } = await referenceBrowser(),
  rows = [];
for (const width of [390, 768, 1440]) {
  const p = await context.newPage();
  await p.setViewportSize({ width, height: 1000 });
  for (const slug of ['', 'brand-guide']) {
    await p.goto('https://www.dask.org/' + slug);
    await p.evaluate(() => document.fonts.ready);
    rows.push({
      width,
      slug,
      paint: await p.evaluate(() => {
        let qs = [
          '.quote-text',
          '.quote-text>div',
          '.quote-content',
          '.text-quote img',
          '#logos',
          '#logos>div',
          '#logos .container',
          '#typography',
          '#typography>div',
          '#typography .grid',
          '#typography .grid>div',
          '#tone',
          '#tone>div',
          '#tone .grid',
          '#tone .grid>div',
          '#tone p',
        ];
        return [...document.querySelectorAll(qs.join(','))].map((e) => {
          let s = getComputedStyle(e);
          return {
            cls: e.className,
            tag: e.tagName,
            r: e.getBoundingClientRect().toJSON(),
            bg: s.backgroundColor,
            repeat: s.backgroundRepeat,
            filter: s.filter,
            pad: s.padding,
            display: s.display,
          };
        });
      }),
    });
  }
  await p.close();
}
await browser.close();
await fs.writeFile(
  'evidence/round6/paint-probe.json',
  JSON.stringify(rows, null, 2),
);
