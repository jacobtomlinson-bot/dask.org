import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser({
  reducedMotion: 'reduce',
});
const p = await context.newPage();
const out = [];
try {
  for (const width of [479, 480, 601, 767, 768, 769, 991, 992, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto('https://www.dask.org/brand-guide');
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 20));
      }
      scrollTo(0, 0);
    });
    await p.waitForTimeout(500);
    out.push(
      await p.evaluate((width) => {
        const info = (e) => {
          if (!e) return null;
          const r = e.getBoundingClientRect(),
            s = getComputedStyle(e);
          return {
            tag: e.tagName,
            cls: String(e.className),
            text: e.children.length
              ? e.childNodes.length
              : e.textContent.trim(),
            x: r.x,
            y: r.y,
            w: r.width,
            h: r.height,
            css: Object.fromEntries(
              [
                'display',
                'position',
                'fontSize',
                'lineHeight',
                'fontWeight',
                'padding',
                'margin',
                'gap',
                'gridTemplateColumns',
                'gridTemplateRows',
                'gridArea',
                'alignItems',
                'justifyContent',
                'flexDirection',
                'width',
                'height',
                'minHeight',
                'maxWidth',
                'boxSizing',
                'verticalAlign',
                'objectFit',
                'border',
                'outline',
                'outlineOffset',
              ].map((k) => [k, s[k]]),
            ),
            children: [...e.children].map((x) => ({
              tag: x.tagName,
              cls: String(x.className),
            })),
          };
        };
        const walk = (e, n) =>
          !e || n < 1 ? [] : [info(e), ...walk(e.parentElement, n - 1)];
        const color = [...document.querySelectorAll('h2')].find(
            (e) =>
              e.textContent === 'Colors' && e.getBoundingClientRect().width,
          ),
          logos = [...document.querySelectorAll('h2')].find(
            (e) => e.textContent === 'Logos',
          ),
          section = logos.closest('section');
        return {
          width,
          hero: walk(document.querySelector('h1'), 4),
          palette: walk(color, 5),
          panes: [
            ...color.closest('section').querySelectorAll('[role=tabpanel]'),
          ].map((e) => ({
            pane: info(e),
            children: [...e.children].map(info),
          })),
          showcase: [
            ...section.querySelectorAll('p,h3,img,[role=tablist],a[role=tab]'),
          ]
            .filter((e) => e.getBoundingClientRect().width)
            .map((e) => ({ self: info(e), parents: walk(e.parentElement, 3) })),
        };
      }, width),
    );
  }
} finally {
  await fs.writeFile(
    'evidence/round13/source-structure.json',
    JSON.stringify(out, null, 2),
  );
  await browser.close();
}
