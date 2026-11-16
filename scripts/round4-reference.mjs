import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
const ref = await referenceBrowser(),
  rows = [];
try {
  const p = await ref.context.newPage();
  for (const width of [390, 479, 480, 601, 767, 768, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto('https://www.dask.org/', { waitUntil: 'domcontentloaded' });
    await p.locator('a[href*="uber-lyft"]').first().waitFor();
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 650) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 20));
      }
    });
    await p.waitForTimeout(1200);
    rows.push(
      await p.evaluate((width) => {
        const info = (e) => {
          if (!e) return null;
          let s = getComputedStyle(e);
          return {
            tag: e.tagName,
            text: e.textContent.trim().slice(0, 55),
            cls: e.className,
            r: e.getBoundingClientRect().toJSON(),
            css: Object.fromEntries(
              [
                'display',
                'gridTemplateColumns',
                'gridTemplateRows',
                'gap',
                'padding',
                'margin',
                'fontSize',
                'lineHeight',
                'fontWeight',
                'borderBottom',
                'textAlign',
                'height',
                'minHeight',
                'width',
                'flexDirection',
              ].map((k) => [k, s[k]]),
            ),
          };
        };
        const card = document.querySelector(
          'a[href*="/user_guide/uber-lyft.html"]',
        );
        const more = [...document.querySelectorAll('h3,h2')].find(
          (e) => e.textContent === 'Want more examples?',
        );
        return {
          width,
          card: [info(card), ...card.querySelectorAll('*')].map((e) =>
            e?.nodeType ? info(e) : e,
          ),
          more: [
            info(more.parentElement),
            ...[...more.parentElement.querySelectorAll('*')].map(info),
          ],
          footer: [
            info(document.querySelector('footer,.footer')),
            ...[
              ...document.querySelector('footer,.footer').querySelectorAll('*'),
            ].map(info),
          ],
        };
      }, width),
    );
    for (const [name, l] of [
      [
        'cards',
        p
          .locator('a[href*="/user_guide/uber-lyft.html"]')
          .first()
          .locator('..'),
      ],
      ['footer', p.locator('footer,.footer')],
    ]) {
      await l.screenshot({
        path: `evidence/round4/reference-${name}-${width}.png`,
      });
    }
  }
} finally {
  await ref.browser.close();
  await fs.writeFile(
    'evidence/round4/reference.json',
    JSON.stringify(rows, null, 2),
  );
}
