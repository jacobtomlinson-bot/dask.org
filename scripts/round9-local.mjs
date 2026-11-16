import fs from 'node:fs/promises';
import { measureLayout } from './measure-layout.mjs';
import { chromium } from '@playwright/test';
const browser = await chromium.launch(),
  context = await browser.newContext({ reducedMotion: 'reduce' });
const rows = [];
const maps = {
  'press-mentions': {},
  home: {
    '.container-text.home-hero': '.home-headline',
    '.home-tabs-headline': '.workload-tabs > h2',
    '.home-tabs-menu': '.workload-tabs > .tablist,.deployment .tablist',
    '.home-tabs-content':
      '.workload-tabs .workload-panel:not([hidden]),.deployment .workload-panel:not([hidden])',
    '.performance-text-content': '.performance-copy,.cheap',
    '.performance-img-wr': '.gauge-sheet,.benchmark-art,.human-code',
    '.rows-container': '.rows-total,.cost-total',
    '.headline-full-white': '.performance > h2',
  },
  'get-help': {
    '.get-help-left': '.help-intro',
    '.text-get-help': '.help-answers article',
    '.container-help': '.support-copy',
    '.container-helplogo': '.support-logos a',
  },
  'get-started': {
    '.container-text.get-started': '.install-copy',
    '.h-text.l-grey-bg': '.learn-intro',
    '.blog-title.get-st': '.learn-card',
    '.container-help': '.support-copy',
    '.container-helplogo': '.support-logos a',
  },
  'powered-by': {
    '.container-text.powered-by': '.hero-copy',
    '.pb-text': '.sponsors-intro,.org-intro',
    '.card.logo-with-text': '.sponsor-card',
  },
  'brand-guide': {
    '.container-text.br-guide': '.hero-copy',
    '.brg-text-l:not(.l-grey-bg)': '.brand-logo-copy',
    '.brg-cont-r': '.logo-showcase',
    '.brg-text-r-bot': '.logo-options',
    '.color-text-container': '.palette-copy',
    '.bg-type': '.brand-type > div:first-child',
  },
};
const sections = Object.fromEntries(
  Object.entries(maps).map(([k, v]) => [k, Object.keys(v)]),
);
try {
  for (const width of (process.env.WIDTHS || '390,601,768,1440')
    .split(',')
    .map(Number))
    for (const slug of (
      process.env.ROUTES || Object.keys(sections).join(',')
    ).split(',')) {
      const p = await context.newPage();
      await p.setViewportSize({ width, height: 1000 });
      await p.goto(
        (process.env.BASE_URL || 'http://127.0.0.1:4321') +
          '/' +
          (slug === 'home' ? '' : slug),
      );
      await p.evaluate(() => document.fonts.ready);
      const data = await p.evaluate(measureLayout, {
        selectors: sections[slug],
        map: maps[slug],
      });
      rows.push({ width, slug, ...data });
      await p.close();
      console.log(width, slug);
    }
} finally {
  await browser.close();
  const old = await fs
    .readFile('evidence/round9/local.json', 'utf8')
    .then(JSON.parse)
    .catch(() => []);
  for (const r of rows) {
    const i = old.findIndex((x) => x.width === r.width && x.slug === r.slug);
    if (i >= 0) old.splice(i, 1);
    old.push(r);
  }
  await fs.writeFile(
    'evidence/round9/local.json',
    JSON.stringify(old, null, 2) + '\n',
  );
}
