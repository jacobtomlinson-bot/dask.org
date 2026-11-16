import fs from 'node:fs/promises';
import { measureLayout } from './measure-layout.mjs';
import { referenceBrowser } from './reference-browser.mjs';
const { browser, context } = await referenceBrowser();
const rows = [];
const sections = {
  'press-mentions': [],
  home: [
    '.container-text.home-hero',
    '.home-tabs-headline',
    '.home-tabs-menu',
    '.home-tabs-content',
    '.headline-full-white',
    '.performance-text-content',
    '.performance-img-wr',
    '.rows-container',
  ],
  'get-help': [
    '.get-help-left',
    '.text-get-help',
    '.container-help',
    '.container-helplogo',
  ],
  'get-started': [
    '.container-text.get-started',
    '.h-text.l-grey-bg',
    '.blog-title.get-st',
    '.container-help',
    '.container-helplogo',
  ],
  'powered-by': [
    '.container-text.powered-by',
    '.pb-text',
    '.card.logo-with-text',
  ],
  'brand-guide': [
    '.container-text.br-guide',
    '.brg-text-l:not(.l-grey-bg)',
    '.brg-cont-r',
    '.brg-text-r-bot',
    '.color-text-container',
    '.bg-type',
  ],
};
try {
  for (const width of (
    process.env.WIDTHS || '390,479,480,601,767,768,769,991,992,1440'
  )
    .split(',')
    .map(Number))
    for (const slug of (
      process.env.ROUTES || Object.keys(sections).join(',')
    ).split(',')) {
      const p = await context.newPage();
      await p.setViewportSize({ width, height: 1000 });
      await p.goto('https://www.dask.org/' + (slug === 'home' ? '' : slug));
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 40));
        }
        scrollTo({ top: 0, behavior: 'instant' });
      });
      await p.waitForTimeout(700);
      await p.evaluate(() => document.fonts.ready);
      const data = await p.evaluate(measureLayout, {
        selectors: sections[slug],
      });
      rows.push({ width, slug, ...data });
      await p.close();
      console.log(width, slug);
    }
} finally {
  await browser.close();
  const old = await fs
    .readFile('evidence/round9/reference.json', 'utf8')
    .then(JSON.parse)
    .catch(() => []);
  for (const r of rows) {
    const i = old.findIndex((x) => x.width === r.width && x.slug === r.slug);
    if (i >= 0) old.splice(i, 1);
    old.push(r);
  }
  await fs.writeFile(
    'evidence/round9/reference.json',
    JSON.stringify(old, null, 2) + '\n',
  );
}
