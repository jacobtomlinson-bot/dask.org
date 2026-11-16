import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
import { measureTone, screenshotTone } from './tone-measure.mjs';
const { browser, context } = await referenceBrowser();
const rows = [];
try {
  for (const width of [390, 479, 480, 601, 767, 768, 769, 991, 992, 1440]) {
    const p = await context.newPage();
    await p.setViewportSize({ width, height: 1000 });
    await p.goto('https://www.dask.org/brand-guide');
    await p.evaluate(() => document.fonts.ready);
    const paint = await p.locator('#tone').evaluate((section) => {
      const o = section.getBoundingClientRect();
      return [section, ...section.querySelectorAll('*')].map((e) => {
        const s = getComputedStyle(e),
          r = e.getBoundingClientRect();
        return {
          tag: e.tagName,
          cls: e.className,
          x: r.x,
          y: r.y - o.y,
          w: r.width,
          h: r.height,
          style: Object.fromEntries(
            [
              'display',
              'backgroundColor',
              'backgroundImage',
              'backgroundSize',
              'backgroundPosition',
              'backgroundRepeat',
              'padding',
              'margin',
              'height',
              'minHeight',
              'maxHeight',
              'boxSizing',
              'borderWidth',
              'alignSelf',
              'alignItems',
              'gridTemplateColumns',
            ].map((k) => [k, s[k]]),
          ),
          children: [...e.children].map((x) => x.className),
        };
      });
    });
    rows.push({ width, ...(await measureTone(p)), paint });
    await screenshotTone(p, `evidence/round8/reference/tone-${width}.png`);
    await p.close();
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round8/reference.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
