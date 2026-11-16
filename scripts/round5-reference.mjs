import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
const ref = await referenceBrowser(),
  rows = [];
try {
  for (const width of [767, 768, 769, 991, 992]) {
    const p = await ref.context.newPage();
    await p.setViewportSize({ width, height: 1000 });
    await p.goto('https://www.dask.org/brand-guide');
    await p.evaluate(() => document.fonts.ready);
    await p.locator('#colors').scrollIntoViewIfNeeded();
    await p.waitForTimeout(300);
    const result = await p.locator('#colors').evaluate((e) => {
      const top = e.getBoundingClientRect().top,
        info = (x) => {
          const r = x.getBoundingClientRect(),
            s = getComputedStyle(x);
          return {
            text: x.textContent.trim().slice(0, 250),
            tag: x.tagName,
            cls: x.className,
            r: { x: r.x, y: r.y - top, width: r.width, height: r.height },
            css: Object.fromEntries(
              [
                'display',
                'gridTemplateColumns',
                'gridTemplateRows',
                'padding',
                'margin',
                'gap',
                'fontSize',
                'lineHeight',
                'fontWeight',
                'alignItems',
              ].map((k) => [k, s[k]]),
            ),
          };
        };
      const tab = e.querySelector('[role=tab]');
      let ancestors = [],
        x = tab;
      while (x && x !== e.parentElement) {
        ancestors.push(info(x));
        x = x.parentElement;
      }
      return {
        section: info(e),
        ancestors,
        copy: [...e.querySelectorAll('h2,p,.text-small,.text-medium,.button')]
          .map(info)
          .filter((x) => x.r.width > 0),
        colors: [...e.querySelectorAll('[role=tab]')].map(info),
      };
    });
    rows.push({ width, ...result });
    await p.evaluate(() => {
      const e = document.querySelector('#colors');
      scrollTo({
        top: e.getBoundingClientRect().top + scrollY,
        behavior: 'instant',
      });
    });
    await p.screenshot({ path: `evidence/round5/reference-${width}.png` });
    await p.close();
  }
} finally {
  await ref.browser.close();
  await fs.writeFile(
    'evidence/round5/reference.json',
    JSON.stringify(rows, null, 2),
  );
}
