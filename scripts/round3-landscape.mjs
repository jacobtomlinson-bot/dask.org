import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const rows = [];
try {
  const p = await context.newPage();
  await p.setViewportSize({ width: 601, height: 900 });
  for (const route of [
    '',
    'get-help',
    'get-started',
    'powered-by',
    'press-mentions',
  ]) {
    await p.goto('https://www.dask.org/' + route, { waitUntil: 'networkidle' });
    rows.push({
      route,
      data: await p.evaluate(() => {
        const chosen = [
          document.querySelector('h1'),
          document.querySelector('h1')?.parentElement,
          ...document.querySelectorAll('h2'),
          ...document.querySelectorAll('[data-animation-type]'),
          ...document.querySelectorAll('.press-mentions-item'),
        ].filter((e) => e && e.getBoundingClientRect().width);
        const list = [
          ...new Set(
            chosen.flatMap((e) => [
              e,
              e.parentElement,
              ...(e.tagName === 'H2'
                ? [e.parentElement?.querySelector('p')]
                : []),
            ]),
          ),
        ].filter(Boolean);
        return list.map((e) => {
          const s = getComputedStyle(e);
          return {
            tag: e.tagName,
            cls: e.className,
            text: e.textContent.slice(0, 50),
            r: e.getBoundingClientRect().toJSON(),
            font: s.fontSize,
            line: s.lineHeight,
            padding: s.padding,
            margin: s.margin,
            grid: s.gridTemplateColumns,
            gap: s.gap,
            transform: s.transform,
          };
        });
      }),
    });
  }
  await p.close();
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round3/landscape-reference.json',
    JSON.stringify(rows, null, 2),
  );
}
console.log(rows.map((x) => [x.route, x.data.length]));
