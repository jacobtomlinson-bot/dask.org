import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
const dir = 'evidence/round9',
  base = process.env.BASE_URL || 'http://127.0.0.1:4321';
const refs = JSON.parse(await fs.readFile(`${dir}/reference.json`, 'utf8'));
const widths = (
  process.env.WIDTHS || '390,479,480,601,767,768,769,991,992,1440'
)
  .split(',')
  .map(Number);
const routes = (
  process.env.ROUTES ||
  'home,get-started,get-help,powered-by,brand-guide,press-mentions'
).split(',');
const roles = {
  home: [
    ['.container-text.home-hero', '.home-headline', true],
    ['.home-tabs-headline', '.workload-tabs > h2', true],
    ['.home-tabs-menu', '.workload-tabs > .tablist', true],
    ['.home-tabs-content', '.workload-tabs .workload-panel', true],
  ],
  'get-started': [
    ['.container-text.get-started', '.install-copy', true],
    ['.h-text.l-grey-bg', '.learn-intro', true],
    ['.blog-title.get-st', '.learn-card', false],
    ['.container-help', '.support-copy', false],
    ['.container-helplogo', '.support-logos a', false],
  ],
  'get-help': [
    ['.get-help-left', '.help-intro', false],
    ['.text-get-help', '.help-answers article', false],
    ['.container-help', '.support-copy', false],
    ['.container-helplogo', '.support-logos a', false],
  ],
  'powered-by': [
    ['.container-text.powered-by', '.hero-copy', true],
    ['.pb-text', '.sponsors-intro,.org-intro', true],
    ['.card.logo-with-text', '.sponsor-card', false],
  ],
  'brand-guide': [
    ['.container-text.br-guide', '.hero-copy', true],
    [
      '.brg-text-l:not(.l-grey-bg)',
      '.brand-logo-copy,.brand-type > div:first-child',
      true,
    ],
    ['.color-text-container', '.palette-copy', true],
  ],
};
const footerRoles = [
  ['f-bg-col logo', '.footer-brand > a', '::before'],
  ['f-bg-col nav', '.footer-nav h2', '::before'],
  ['f-bg-line', '.footer-nav h2', '::after'],
  ['f-bg-col nav-text', '.footer-links', '::before'],
  ['f-bg-col social', '.socials', '::before'],
  ['f-bg-col text', '.copyright', '::before'],
];
const browser = await chromium.launch(),
  rows = [];
try {
  for (const width of widths)
    for (const slug of routes) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        reducedMotion: 'reduce',
      });
      await page.goto(`${base}/${slug === 'home' ? '' : slug}`);
      await page.evaluate(() => document.fonts.ready);
      const data = await page.evaluate(
        ({ roles, footerRoles }) => {
          const box = (e, pseudo) => {
            let r = e.getBoundingClientRect(),
              s = getComputedStyle(e, pseudo || null),
              section = e
                .closest('section,footer')
                ?.getBoundingClientRect() || { y: 0 };
            let x = r.x,
              y = r.y,
              w = r.width,
              h = r.height;
            if (pseudo && s.content !== 'none') {
              x += parseFloat(s.left) || 0;
              y += parseFloat(s.top) || 0;
              w = parseFloat(s.width);
              h = parseFloat(s.height);
            } else if (pseudo) {
              s = getComputedStyle(e);
            }
            return {
              x,
              y,
              w,
              h,
              sectionTop: section.y,
              color: s.backgroundColor,
              text: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 80),
            };
          };
          return {
            papers: roles.map(([key, selector, pseudo]) => ({
              key,
              selector,
              boxes: [...document.querySelectorAll(selector)]
                .filter((e) => e.getBoundingClientRect().width > 0)
                .map((e) => box(e, pseudo ? '::before' : null)),
            })),
            footer: footerRoles.map(([key, selector, pseudo]) => ({
              key,
              selector,
              boxes: [...document.querySelectorAll(selector)].map((e) =>
                box(e, pseudo),
              ),
            })),
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        },
        { roles: roles[slug] || [], footerRoles },
      );
      const source = refs.find((r) => r.width === width && r.slug === slug);
      const comparisons = [];
      for (const role of data.papers) {
        let gold = source.groups[role.key];
        for (let i = 0; i < role.boxes.length; i++) {
          const a = gold[i]?.box,
            b = role.boxes[i];
          if (!a) continue;
          const nativeTop = b.y - b.sectionTop;
          let sourceTop = a.y;
          // Original hero/workload wrappers are div-based (no nearest section); use the
          // corresponding native section's measured start, never a page-height delta.
          if (a.sectionTop === 0) sourceTop = a.y - b.sectionTop;
          comparisons.push({
            role: role.key,
            index: i,
            source: {
              x: a.x,
              y: sourceTop,
              w: a.w,
              h: a.h,
              color: a.css.backgroundColor,
            },
            native: { ...b, y: nativeTop },
            delta: {
              x: b.x - a.x,
              y: nativeTop - sourceTop,
              w: b.w - a.w,
              h: b.h - a.h,
            },
          });
        }
      }
      for (const role of data.footer) {
        let gold = source.footer.filter((z) =>
          role.key === 'f-bg-col nav'
            ? /^f-bg-col nav(?: last)?$/.test(z.cls)
            : z.cls === role.key,
        );
        for (let i = 0; i < role.boxes.length; i++) {
          let a = gold[i],
            b = role.boxes[i];
          comparisons.push({
            role: role.key,
            index: i,
            source: {
              x: a.x,
              y: a.y,
              w: a.w,
              h: a.h,
              color: a.css.backgroundColor,
            },
            native: { ...b, y: b.y - b.sectionTop },
            delta: {
              x: b.x - a.x,
              y: b.y - b.sectionTop - a.y,
              w: b.w - a.w,
              h: b.h - a.h,
            },
          });
        }
      }
      rows.push({
        width,
        slug,
        overflow: data.overflow,
        comparisons,
        maxError: Math.max(
          ...comparisons.flatMap((c) => Object.values(c.delta).map(Math.abs)),
        ),
      });
      await page.close();
    }
} finally {
  await browser.close();
  await fs.writeFile(
    `${dir}/surfaces.json`,
    JSON.stringify(rows, null, 2) + '\n',
  );
}
for (const row of rows)
  console.log(
    row.width,
    row.slug,
    row.maxError.toFixed(3),
    row.comparisons
      .filter((c) => Object.values(c.delta).some((v) => Math.abs(v) > 1))
      .map(
        (c) =>
          `${c.role}[${c.index}]:${Object.values(c.delta)
            .map((x) => x.toFixed(2))
            .join(',')}`,
      )
      .join(' '),
  );
if (
  process.env.ASSERT === '1' &&
  rows.some((r) => r.overflow || r.maxError > 1)
)
  process.exitCode = 1;
