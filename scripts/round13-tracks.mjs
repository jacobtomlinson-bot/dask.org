import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser({
    reducedMotion: 'reduce',
  }),
  p = await context.newPage(),
  out = [];
try {
  for (const width of [479, 480, 601, 767, 768, 769, 991, 992, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto('https://www.dask.org/brand-guide');
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    out.push(
      await p.evaluate((width) => {
        const info = (e) => {
          if (!e) return null;
          const r = e.getBoundingClientRect(),
            s = getComputedStyle(e),
            range = document.createRange();
          range.selectNodeContents(e);
          const z = range.getBoundingClientRect();
          return {
            cls: e.className,
            text: e.childElementCount ? undefined : e.textContent.trim(),
            x: r.x,
            y: r.y,
            w: r.width,
            h: r.height,
            ink: { x: z.x, y: z.y, w: z.width, h: z.height },
            css: Object.fromEntries(
              [
                'display',
                'position',
                'top',
                'bottom',
                'left',
                'right',
                'height',
                'minHeight',
                'maxHeight',
                'fontSize',
                'lineHeight',
                'fontWeight',
                'padding',
                'margin',
                'gap',
                'alignItems',
                'justifyContent',
                'gridTemplateRows',
                'gridTemplateColumns',
                'border',
                'outline',
                'boxShadow',
              ].map((k) => [k, s[k]]),
            ),
          };
        };
        let nav = document.querySelector('.br-g-colors-tabs-menu'),
          a = nav,
          anc = [];
        for (let i = 0; i < 4; i++, a = a.parentElement) anc.push(info(a));
        const hero =
          document.querySelector('h1').closest('.hero-section') ||
          document.querySelector('h1').parentElement.parentElement.parentElement
            .parentElement;
        const logo = document.querySelector('.br-g-logos-tabs-menu');
        return {
          width,
          palette: anc,
          hero: info(hero),
          logoMenu: info(logo),
          controls: [...logo.children].map(info),
          logoTexts: [...document.querySelectorAll('.brand-g-text-r p')]
            .filter((e) => e.getBoundingClientRect().width)
            .map(info),
          logoGrid: [...document.querySelectorAll('.brand-g-text-r')]
            .filter((e) => e.getBoundingClientRect().width)
            .map(info),
        };
      }, width),
    );
  }
} finally {
  await fs.writeFile(
    'evidence/round13/source-tracks.json',
    JSON.stringify(out, null, 2),
  );
  await browser.close();
}
