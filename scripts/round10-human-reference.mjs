import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
const { browser, context } = await referenceBrowser();
const out = [];
try {
  for (const width of [390, 479]) {
    const p = await context.newPage();
    await p.setViewportSize({ width, height: 1000 });
    await p.goto('https://www.dask.org/');
    await p.evaluate(() => document.fonts.ready);
    await p
      .locator('.performance-text-content')
      .nth(1)
      .scrollIntoViewIfNeeded();
    const samples = [];
    for (let i = 0; i < 100; i++) {
      samples.push(
        await p.evaluate(() => {
          const copy = document.querySelectorAll(
              '.performance-text-content',
            )[1],
            grid = copy.parentElement;
          const nodes = [grid, copy, ...grid.querySelectorAll('*')].filter(
            (e) => e.getBoundingClientRect().width > 0,
          );
          return {
            time: performance.now(),
            doc: document.documentElement.scrollWidth,
            nodes: nodes.map((e) => {
              const r = e.getBoundingClientRect(),
                s = getComputedStyle(e);
              return {
                tag: e.tagName,
                cls: String(e.className),
                text: e.children.length ? '' : e.textContent,
                ...Object.fromEntries(
                  ['x', 'y', 'width', 'height'].map((k) => [k, r[k]]),
                ),
                style: Object.fromEntries(
                  [
                    'display',
                    'width',
                    'minWidth',
                    'maxWidth',
                    'gridTemplateColumns',
                    'flex',
                    'whiteSpace',
                    'overflow',
                    'padding',
                    'margin',
                  ].map((k) => [k, s[k]]),
                ),
              };
            }),
          };
        }),
      );
      await p.waitForTimeout(150);
    }
    out.push({ width, samples });
    await p.close();
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round10/human-reference.json',
    JSON.stringify(out, null, 2),
  );
}
