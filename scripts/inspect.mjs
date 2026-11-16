import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch();
const context = await browser.newContext();
await context.route('**/*', async (route) => {
  if (!['GET', 'HEAD'].includes(route.request().method())) return route.abort();
  try {
    const r = await fetch(route.request().url());
    await route.fulfill({
      status: r.status,
      headers: Object.fromEntries(
        [...r.headers].filter(
          ([k]) => !['content-encoding', 'content-length'].includes(k),
        ),
      ),
      body: Buffer.from(await r.arrayBuffer()),
    });
  } catch {
    await route.abort();
  }
});
const pages = [
  '',
  'get-started',
  'get-help',
  'powered-by',
  'brand-guide',
  'press-mentions',
];
for (const slug of pages) {
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('https://www.dask.org/' + slug, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  const data = await page.evaluate(() => {
    const styles = (e) => {
      let c = getComputedStyle(e),
        r = e.getBoundingClientRect();
      return {
        tag: e.tagName,
        text: e.innerText?.slice(0, 180),
        class: e.className,
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        css: Object.fromEntries(
          [
            'fontFamily',
            'fontSize',
            'fontWeight',
            'lineHeight',
            'color',
            'backgroundColor',
            'padding',
            'margin',
            'gap',
            'display',
            'gridTemplateColumns',
            'borderRadius',
            'maxWidth',
            'textAlign',
          ].map((k) => [k, c[k]]),
        ),
      };
    };
    return {
      title: document.title,
      text: document.body.innerText,
      images: [...document.images].map((i) => ({
        src: i.src,
        alt: i.alt,
        w: i.width,
        h: i.height,
      })),
      links: [...document.querySelectorAll('a')].map((a) => ({
        text: a.innerText,
        href: a.getAttribute('href'),
      })),
      elements: [
        ...document.querySelectorAll(
          'h1,h2,h3,h4,p,section,header,footer,nav,[role=tab],button,input,form',
        ),
      ].map(styles),
      fonts: [...document.styleSheets].flatMap((s) => {
        try {
          return [...s.cssRules]
            .filter((r) => r.type === 5)
            .map((r) => r.cssText);
        } catch {
          return [];
        }
      }),
    };
  });
  await fs.writeFile(
    'evidence/reference/' + (slug || 'home') + '.json',
    JSON.stringify(data, null, 2),
  );
  await page.screenshot({
    path: 'evidence/reference/' + (slug || 'home') + '-desktop.png',
    fullPage: true,
  });
  console.log(slug || 'home', data.text);
  await page.close();
}
await browser.close();
