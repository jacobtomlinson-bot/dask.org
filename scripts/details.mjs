import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const urls = new Set();
context.on('request', (r) => {
  if (/\.(woff2?|ttf|otf)(\?|$)/.test(r.url())) urls.add(r.url());
});
for (const slug of [
  '',
  'get-started',
  'get-help',
  'powered-by',
  'brand-guide',
  'press-mentions',
]) {
  let p = await context.newPage();
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p.goto('https://www.dask.org/' + slug, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const d = await p.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter(
        (e) => !['SCRIPT', 'STYLE', 'PATH', 'svg', 'path'].includes(e.tagName),
      )
      .map((e) => {
        let c = getComputedStyle(e),
          r = e.getBoundingClientRect();
        return {
          tag: e.tagName,
          cls: typeof e.className === 'string' ? e.className : '',
          text: [...e.childNodes]
            .filter((n) => n.nodeType === 3)
            .map((n) => n.textContent)
            .join('')
            .trim(),
          href: e.getAttribute('href'),
          src: e.getAttribute('src'),
          background: c.backgroundImage,
          rect: [r.x, r.y, r.width, r.height],
          display: c.display,
          padding: c.padding,
          gap: c.gap,
          color: c.color,
          font: c.font,
          border: c.border,
        };
      }),
  );
  await fs.writeFile(
    'evidence/reference/' + (slug || 'home') + '-detail.json',
    JSON.stringify(d, null, 2),
  );
  for (const [name, width] of [
    ['tablet', 768],
    ['mobile', 390],
  ]) {
    await p.setViewportSize({ width, height: 900 });
    await p.screenshot({
      path: `evidence/reference/${slug || 'home'}-${name}.png`,
      fullPage: true,
    });
    let btn = p.locator('.w-nav-button');
    if (await btn.isVisible()) {
      await btn.click();
      await p.waitForTimeout(600);
      await p.screenshot({
        path: `evidence/reference/${slug || 'home'}-${name}-nav.png`,
      });
      await fs.writeFile(
        `evidence/reference/${slug || 'home'}-${name}-nav.txt`,
        await p.locator('body').innerText(),
      );
      await btn.click();
    }
  }
  await p.close();
}
await fs.writeFile(
  'evidence/reference/fonts.json',
  JSON.stringify([...urls], null, 2),
);
await browser.close();
