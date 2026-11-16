import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
await fs.mkdir('evidence/round2/reference', { recursive: true });
const results = [];
for (const width of [1440, 390]) {
  const p = await context.newPage();
  await p.setViewportSize({ width, height: 1000 });
  await p.goto('https://www.dask.org', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1500);
  results.push({
    width,
    route: '/',
    elements: await p
      .locator('a,button,p,h1,h2,h3,svg,canvas,[data-animation-type]')
      .evaluateAll((es) =>
        es
          .map((e) => {
            const r = e.getBoundingClientRect(),
              s = getComputedStyle(e);
            return {
              tag: e.tagName,
              text: e.textContent?.trim().slice(0, 110),
              href: e.getAttribute('href'),
              class: e.className?.baseVal ?? e.className,
              rect: { x: r.x, y: r.y, w: r.width, h: r.height },
              font: s.font,
              padding: s.padding,
              bg: s.backgroundImage,
              bgSize: s.backgroundSize,
            };
          })
          .filter((e) => e.rect.w && e.rect.h),
      ),
  });
  for (let i = 0; i < 3; i++) {
    await p.screenshot({
      path: `evidence/round2/reference/home-${width}-${i}.png`,
    });
    await p.waitForTimeout(1600);
  }
  await p.evaluate(() => scrollTo(0, innerWidth < 600 ? 2100 : 1450));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `evidence/round2/reference/gauges-${width}.png` });
  await p.evaluate(() => scrollTo(0, innerWidth < 600 ? 3000 : 2400));
  await p.waitForTimeout(1500);
  for (let i = 0; i < 3; i++) {
    await p.screenshot({
      path: `evidence/round2/reference/cost-${width}-${i}.png`,
    });
    await p.waitForTimeout(1300);
  }
  await p.goto('https://www.dask.org/brand-guide', {
    waitUntil: 'networkidle',
  });
  await p.waitForTimeout(1000);
  results.push({
    width,
    route: 'brand-guide',
    elements: await p.locator('a,button,p,h1,h2,h3,img,nav').evaluateAll((es) =>
      es
        .map((e) => {
          const r = e.getBoundingClientRect(),
            s = getComputedStyle(e);
          return {
            tag: e.tagName,
            text: e.textContent?.trim().slice(0, 60),
            class: e.className,
            rect: { x: r.x, y: r.y, w: r.width, h: r.height },
            font: s.font,
            padding: s.padding,
            bg: s.backgroundImage,
            bgSize: s.backgroundSize,
            position: s.position,
          };
        })
        .filter((e) => e.rect.w && e.rect.h),
    ),
  });
  await p.close();
}
await fs.writeFile(
  'evidence/round2/reference/geometry.json',
  JSON.stringify(results, null, 2),
);
await browser.close();
