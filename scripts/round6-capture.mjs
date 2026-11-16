import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { referenceBrowser } from './reference-browser.mjs';
const dir = process.env.EVIDENCE_DIR || 'evidence/round6';
const refs = await referenceBrowser(),
  browser = await chromium.launch(),
  rows = await fs
    .readFile(`${dir}/capture.json`, 'utf8')
    .then(JSON.parse)
    .catch(() => []);
try {
  for (const width of (process.env.WIDTHS || '390').split(',').map(Number)) {
    for (const slug of (
      process.env.ROUTES ||
      'home,get-started,get-help,powered-by,brand-guide,press-mentions'
    ).split(',')) {
      for (const [label, context, root] of [
        ['reference', refs.context, 'https://www.dask.org'],
        [
          'local',
          await browser.newContext({ reducedMotion: 'reduce' }),
          process.env.BASE_URL || 'http://127.0.0.1:4321',
        ],
      ]) {
        if (process.env.LOCAL_ONLY === '1' && label === 'reference') continue;
        const p = await context.newPage();
        await p.setViewportSize({ width, height: 1000 });
        await p.goto(root + '/' + (slug === 'home' ? '' : slug), {
          waitUntil: 'domcontentloaded',
        });
        await p.evaluate(() => document.fonts.ready);
        await p.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            scrollTo({ top: y, behavior: 'instant' });
            await new Promise((r) => setTimeout(r, 40));
          }
          scrollTo({ top: 0, behavior: 'instant' });
        });
        await p.waitForTimeout(700);
        const data = await p.evaluate(() => {
          const info = (e) => {
            const r = e.getBoundingClientRect(),
              s = getComputedStyle(e);
            return {
              tag: e.tagName,
              cls: e.className,
              id: e.id,
              text: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 200),
              r: r.toJSON(),
              css: Object.fromEntries(
                [
                  'fontSize',
                  'fontWeight',
                  'lineHeight',
                  'padding',
                  'margin',
                  'width',
                  'height',
                  'minHeight',
                  'display',
                  'gap',
                  'gridTemplateColumns',
                  'gridTemplateRows',
                  'backgroundImage',
                  'backgroundSize',
                  'backgroundPosition',
                ].map((k) => [k, s[k]]),
              ),
            };
          };
          return {
            height: document.documentElement.scrollHeight,
            backgrounds: [...document.querySelectorAll('*')].flatMap((e) => {
              const r = e.getBoundingClientRect();
              if (r.width <= 0 || r.height <= 0) return [];
              return ['', '::before', '::after'].flatMap((pseudo) => {
                const s = getComputedStyle(e, pseudo || null);
                return s.backgroundImage.includes('url(')
                  ? [
                      {
                        cls: String(e.className),
                        pseudo,
                        r: r.toJSON(),
                        image: s.backgroundImage,
                        size: s.backgroundSize,
                        position: s.backgroundPosition,
                      },
                    ]
                  : [];
              });
            }),
            sections: [...document.querySelectorAll('section,footer,.footer')]
              .filter((e) => {
                const r = e.getBoundingClientRect();
                return (
                  r.height > 0 &&
                  r.width > 0 &&
                  !e.parentElement.closest('section,footer,.footer')
                );
              })
              .map(info),
            text: [
              ...document.querySelectorAll(
                'h1,h2,h3,p,small,time,nav a,.copyright',
              ),
            ]
              .filter((e) => e.getBoundingClientRect().width > 0)
              .map(info),
          };
        });
        const old = rows.findIndex(
          (r) => r.label === label && r.width === width && r.slug === slug,
        );
        if (old >= 0) rows.splice(old, 1);
        rows.push({ label, width, slug, ...data });
        await p.screenshot({
          path: `${dir}/${label}/${slug}-${width}.png`,
          fullPage: true,
        });
        await p.close();
        if (label === 'local') await context.close();
        console.log(label, width, slug, data.height);
      }
    }
  }
} finally {
  await refs.browser.close();
  await browser.close();
  await fs.writeFile(`${dir}/capture.json`, JSON.stringify(rows, null, 2));
}
