import fs from 'node:fs/promises';
import { referenceBrowser } from './reference-browser.mjs';
const refs = await referenceBrowser(),
  rows = [];
try {
  for (const width of [390, 601, 768, 1440]) {
    let p = await refs.context.newPage();
    await p.setViewportSize({ width, height: 1000 });
    for (const slug of ['home', 'brand-guide', 'press-mentions']) {
      await p.goto('https://www.dask.org/' + (slug === 'home' ? '' : slug));
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 25));
        }
        scrollTo(0, 0);
      });
      let data = await p.evaluate(() => {
        const info = (e) => {
          let r = e.getBoundingClientRect(),
            s = getComputedStyle(e);
          return {
            tag: e.tagName,
            cls: e.className,
            text: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 500),
            r: r.toJSON(),
            css: Object.fromEntries(
              [
                'fontSize',
                'lineHeight',
                'fontWeight',
                'padding',
                'margin',
                'gap',
                'display',
                'backgroundImage',
                'backgroundSize',
                'backgroundPosition',
                'height',
                'minHeight',
              ].map((k) => [k, s[k]]),
            ),
          };
        };
        let selectors =
          '.text-quote,.text-quote>*,.text-quote img,.text-quote .text-small,.quote-name-wr *,.quote-text .text-tiny,.text-quote .text-medium,.quote-text,.quote-text h2,.quote-text .text-large,.quote-text .text-small,.text-quotes-col,.text-quotes-wr,.grid.quotes';
        return {
          containers: [...document.querySelectorAll('.grid.quotes')]
            .flatMap((e) => [e.parentElement, e.parentElement.parentElement])
            .map(info),
          quotes: [...document.querySelectorAll(selectors)].map(info),
          cases: [
            ...document.querySelectorAll(
              '.grid._4-col.use-cases,.heading-large-box.with-white-bg,.mar-top-xsmall,.card.use-cases',
            ),
          ]
            .filter((e) => e.getBoundingClientRect().width > 0)
            .map(info),
          tone: [...document.querySelectorAll('#tone p')]
            .filter((e) => e.getBoundingClientRect().width > 0)
            .map((e) => ({ ...info(e), html: e.innerHTML })),
          pressAside: [...document.querySelectorAll('a,button')]
            .filter((e) => e.textContent.trim() === 'Add a press mention')
            .flatMap((e) => [e, e.parentElement, e.parentElement.parentElement])
            .map(info),
          press: [...document.querySelectorAll('a')]
            .filter(
              (e) =>
                e.textContent.includes(
                  'Using AI and machine learning to kickstart climate',
                ) && e.getBoundingClientRect().width > 0,
            )
            .map((e) => ({
              card: info(e),
              desc: [...e.querySelectorAll('*')].map(info),
            })),
          icons: [
            ...document.querySelectorAll(
              'a[href="#colors"] .embed-icon,a[href="#typography"] .embed-icon,a[href="#tone"] .embed-icon',
            ),
          ].map(info),
        };
      });
      rows.push({ width, slug, ...data });
    }
    await p.close();
  }
} finally {
  await refs.browser.close();
  await fs.writeFile(
    'evidence/round6/reference-components.json',
    JSON.stringify(rows, null, 2),
  );
}
