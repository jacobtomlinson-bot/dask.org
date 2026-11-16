import { referenceBrowser } from './reference-browser.mjs';
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
const ref = process.env.REFERENCE === '1',
  dir = 'evidence/round13',
  widths = (
    process.env.WIDTHS || '390,479,480,601,767,768,769,991,992,1100,1440'
  )
    .split(',')
    .map(Number),
  browser = ref
    ? await referenceBrowser({ reducedMotion: 'reduce' })
    : { browser: await chromium.launch() };
const context =
    browser.context ||
    (await browser.browser.newContext({
      reducedMotion: 'reduce',
      permissions: ['clipboard-read', 'clipboard-write'],
    })),
  p = await context.newPage(),
  out = [];
await fs.mkdir(dir + '/' + (ref ? 'reference' : 'local'), { recursive: true });
async function captureTarget(selector, path) {
  await p.evaluate(() => scrollTo(0, 0));
  await p.mouse.move(0, 0);
  await p.waitForTimeout(80);
  const rect = await p.locator(selector).evaluate((e) => {
    const r = e.getBoundingClientRect();
    return {
      y: Math.floor(r.y + scrollY),
      h: Math.ceil(r.height),
      w: innerWidth,
    };
  });
  const full = PNG.sync.read(await p.screenshot({ fullPage: true }));
  const crop = new PNG({
    width: rect.w,
    height: Math.min(rect.h, full.height - rect.y),
  });
  PNG.bitblt(full, crop, 0, rect.y, rect.w, crop.height, 0, 0);
  await fs.writeFile(path, PNG.sync.write(crop));
}
try {
  for (const width of widths) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(
      (ref
        ? 'https://www.dask.org'
        : process.env.BASE_URL || 'http://127.0.0.1:4321') + '/brand-guide',
    );
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 15));
      }
      scrollTo(0, 0);
    });
    await p.waitForTimeout(350);
    const collect = () =>
      p.evaluate((local) => {
        const visible = (e) => e && e.getBoundingClientRect().width > 0,
          find = (t) =>
            [...document.querySelectorAll('h2,h3,p')].find(
              (e) => e.textContent.trim() === t && visible(e),
            ),
          logos = find('Logos'),
          origin = logos.getBoundingClientRect(),
          colors = find('Colors'),
          cs = local
            ? document.querySelector('#colors')
            : colors.closest('section'),
          cr = cs.getBoundingClientRect(),
          hero = local
            ? document.querySelector('.page-hero')
            : document.querySelector('.section-responsive.bg-black.powered-by');
        const info = (e, o = origin) => {
          if (!e) return null;
          const r = e.getBoundingClientRect(),
            s = getComputedStyle(e),
            range = document.createRange();
          range.selectNodeContents(e);
          const ink = range.getBoundingClientRect();
          const chars = [];
          const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
          let n;
          while ((n = walker.nextNode()))
            for (let i = 0; i < n.length; i++) {
              if (!n.textContent[i].trim()) continue;
              const a = document.createRange();
              a.setStart(n, i);
              a.setEnd(n, i + 1);
              const q = a.getBoundingClientRect();
              let row = chars.find((x) => Math.abs(x.y - q.y) < 1);
              if (!row) chars.push((row = { y: q.y, text: '' }));
              row.text += n.textContent[i];
            }
          return {
            x: r.x,
            y: r.y - o.y,
            w: r.width,
            h: r.height,
            ink: { x: ink.x, y: ink.y - o.y, w: ink.width, h: ink.height },
            lines: chars.map((x) => x.text),
            text: e.textContent.trim().replace(/\s+/g, ' '),
            src: e.getAttribute('src'),
            css: Object.fromEntries(
              [
                'fontSize',
                'lineHeight',
                'fontWeight',
                'border',
                'outline',
                'outlineOffset',
                'backgroundColor',
                'color',
              ].map((k) => [k, s[k]]),
            ),
          };
        };
        const grid = cs.querySelector(
            local ? '.palette-grid' : '.br-g-colors-tabs-menu',
          ),
          showcase = local
            ? document.querySelector('.logo-showcase')
            : [...document.querySelectorAll('.brand-g-text-r')].find(visible),
          menu = local
            ? document.querySelector('.logo-options [role=tablist]')
            : document.querySelector('.br-g-logos-tabs-menu'),
          imgs = [...showcase.querySelectorAll('img')].filter(visible);
        return {
          logosHeadingDocumentY: origin.y + scrollY,
          hero: info(hero, { y: 0 }),
          heroCopy: [...hero.querySelectorAll('h1,p')]
            .filter(visible)
            .map((e) => info(e, hero.getBoundingClientRect())),
          logos: info(
            local ? document.querySelector('#logos') : logos.closest('section'),
          ),
          guidance: [...logos.parentElement.querySelectorAll('h2,p,a')]
            .filter(visible)
            .map((e) => info(e)),
          showcase: info(showcase),
          captions: ['Word Mark', 'Color Alternatives', 'Logo Mark'].map((t) =>
            info(find(t)),
          ),
          images: imgs.map((e) => info(e)),
          canvases: [
            ...showcase.querySelectorAll(
              local
                ? '.word-mark,.logo-options,.logo-mark'
                : '.brg-cont-r,.brg-text-r-bot',
            ),
          ]
            .filter(visible)
            .map((e) => info(e)),
          controls: [...menu.children].map((e) => info(e)),
          palette: {
            section: info(cs, cr),
            grid: info(grid, cr),
            cells: [...grid.querySelectorAll(local ? 'button' : 'a')].map((e) =>
              info(e, cr),
            ),
            copy: info(
              local
                ? document.querySelector('.palette-copy')
                : colors.parentElement,
              cr,
            ),
            body: [
              ...cs.querySelectorAll(
                local ? '.palette-copy > *' : '.w--tab-active .choose-text > *',
              ),
            ]
              .filter(visible)
              .map((e) => info(e, cr)),
            next: info(document.querySelector('#typography'), cr),
            sectionAbsolute: info(cs, { y: 0 }),
          },
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      }, !ref);
    const initial = await collect();
    out.push({ width, state: 'initial', ...initial });
    if (process.env.CAPTURES === '1') {
      await p.mouse.move(0, 0);
      await captureTarget(
        ref ? '.br-g-logos-tabs' : '.brand-logos',
        `${dir}/${ref ? 'reference' : 'local'}/logos-${width}-initial.png`,
      );
      await captureTarget(
        ref ? '.br-g-colors-tabs' : '.palette-section',
        `${dir}/${ref ? 'reference' : 'local'}/palette-${width}-initial.png`,
      );
    }
    for (const i of [1, 2, 3, 0]) {
      await p
        .locator(ref ? '.br-g-logos-tabs-menu [role=tab]' : '[data-logo-color]')
        .nth(i)
        .click();
      await p.waitForTimeout(ref ? 350 : 20);
      await p.evaluate(() => scrollTo(0, 0));
      await p.waitForTimeout(60);
      out.push({ width, state: 'logo-' + i, ...(await collect()) });
      if (process.env.CAPTURES === '1' && i > 0)
        await captureTarget(
          ref ? '.br-g-logos-tabs' : '.brand-logos',
          `${dir}/${ref ? 'reference' : 'local'}/logos-${width}-${i}.png`,
        );
    }
    if ([479, 480, 601, 767, 768].includes(width)) {
      const cells = p.locator(
        ref ? '.br-g-colors-tabs-menu [role=tab]' : '[data-color]',
      );
      for (let i = 0; i < 12; i++) {
        await cells.nth(i).click();
        await p.waitForTimeout(ref ? 300 : 10);
        out.push({ width, state: 'color-' + i, ...(await collect()) });
      }
      await cells.filter({ hasText: '#FC6E6B' }).click();
      await p.waitForTimeout(300);
      out.push({ width, state: 'salmon-restored', ...(await collect()) });
    }
  }
} finally {
  await fs.writeFile(
    `${dir}/${ref ? 'reference' : 'local'}.json`,
    JSON.stringify(out, null, 2),
  );
  await browser.browser.close();
}
console.log(out.length, 'Brand state records');
