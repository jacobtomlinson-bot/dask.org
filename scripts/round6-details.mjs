import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { referenceBrowser } from './reference-browser.mjs';
const refs = await referenceBrowser(),
  b = await chromium.launch(),
  rows = [];
try {
  for (const [label, context, root] of [
    ['reference', refs.context, 'https://www.dask.org'],
    [
      'local',
      await b.newContext({ reducedMotion: 'reduce' }),
      'http://127.0.0.1:4321',
    ],
  ]) {
    let p = await context.newPage();
    await p.setViewportSize({ width: 390, height: 1000 });
    for (const slug of ['home', 'brand-guide', 'press-mentions']) {
      await p.goto(root + '/' + (slug === 'home' ? '' : slug));
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 25));
        }
        scrollTo(0, 0);
      });
      rows.push({
        label,
        slug,
        data: await p.evaluate(() => {
          let info = (e) => {
            let r = e.getBoundingClientRect(),
              s = getComputedStyle(e);
            return {
              tag: e.tagName,
              cls: e.className,
              text: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 1000),
              r: r.toJSON(),
              css: Object.fromEntries(
                [
                  'fontSize',
                  'lineHeight',
                  'fontWeight',
                  'padding',
                  'margin',
                  'display',
                  'gap',
                  'backgroundImage',
                  'backgroundSize',
                  'backgroundPosition',
                ].map((k) => [k, s[k]]),
              ),
            };
          };
          let es = [
              ...document.querySelectorAll(
                'h1,h2,h3,p,blockquote,figcaption,small,a',
              ),
            ].filter((e) => e.getBoundingClientRect().width > 0),
            chosen = es.filter(
              (e) =>
                e.textContent.includes('trailblazer') ||
                e.textContent.trim() === 'Use Cases' ||
                e.textContent.trim() === 'Tone' ||
                e.textContent.includes(
                  'Using AI and machine learning to kickstart climate',
                ) ||
                e.textContent.trim() === 'Colors',
            );
          return {
            all: es.map(info),
            ancestry: chosen
              .filter((e) => e.children.length < 5)
              .map((e) => {
                let a = [];
                for (let i = 0; e && i < 5; i++, e = e.parentElement)
                  a.push(info(e));
                return a;
              }),
            images: [...document.images]
              .filter((e) => e.getBoundingClientRect().width > 0)
              .map((e) => ({ src: e.getAttribute('src'), ...info(e) })),
            rail: [
              ...document.querySelectorAll(
                'a[href="#colors"],a[href="#typography"],a[href="#tone"]',
              ),
            ].map((e) => ({ html: e.innerHTML, info: info(e) })),
          };
        }),
      });
    }
    await p.close();
  }
} finally {
  await refs.browser.close();
  await b.close();
  await fs.writeFile(
    'evidence/round6/details.json',
    JSON.stringify(rows, null, 2),
  );
}
