import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const results = [];
for (const slug of [
  'home',
  'get-started',
  'get-help',
  'powered-by',
  'brand-guide',
  'press-mentions',
]) {
  const p = await context.newPage();
  await p.setViewportSize({ width: 390, height: 900 });
  await p.goto('https://www.dask.org/' + (slug === 'home' ? '' : slug), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  results.push({
    slug,
    elements: await p
      .locator('h1,h2,h3,section,.section-responsive,.footer-container')
      .evaluateAll((es) =>
        es.map((e) => {
          let r = e.getBoundingClientRect(),
            s = getComputedStyle(e);
          return {
            text: e.textContent?.trim().slice(0, 60),
            tag: e.tagName,
            rect: [r.x, r.y, r.width, r.height].map(Math.round),
            font: s.font,
            padding: s.padding,
          };
        }),
      ),
    background: await p
      .locator('.bg-black')
      .first()
      .evaluate((e) => ({
        size: getComputedStyle(e).backgroundSize,
        position: getComputedStyle(e).backgroundPosition,
      })),
  });
  await fs.writeFile(
    'evidence/reference/mobile-geometry.json',
    JSON.stringify(results, null, 2),
  );
  await p.close();
}
const p = await context.newPage();
await p.setViewportSize({ width: 1440, height: 1000 });
await p.goto('https://www.dask.org/', { waitUntil: 'domcontentloaded' });
await p.evaluate(() => document.fonts.ready);
await p.locator('.w-dropdown-toggle').first().click();
await p.screenshot({ path: 'evidence/reference/desktop-community.png' });
await p.goto('https://www.dask.org/brand-guide', {
  waitUntil: 'domcontentloaded',
});
console.log(
  'colors',
  await p.locator('[class*=color]').evaluateAll((es) =>
    es.slice(-50).map((e) => ({
      tag: e.tagName,
      cls: e.className,
      text: e.textContent?.slice(0, 120),
    })),
  ),
);
const tabs = p.getByRole('tab');
console.log('tabs', await tabs.allTextContents());
for (let i = 3; i < Math.min(await tabs.count(), 7); i++) {
  await tabs.nth(i).click();
  await p.screenshot({ path: `evidence/reference/brand-logo-state-${i}.png` });
}
await p.goto('https://www.dask.org/press-mentions', {
  waitUntil: 'domcontentloaded',
});
await p.getByText('Add a press mention', { exact: true }).click();
await p.waitForTimeout(400);
await p.screenshot({ path: 'evidence/reference/press-dialog.png' });
await fs.writeFile(
  'evidence/reference/dialog.json',
  JSON.stringify(
    {
      text: await p.locator('body').innerText(),
      fields: await p.locator('input,textarea,select').evaluateAll((es) =>
        es.map((e) => ({
          tag: e.tagName,
          type: e.type,
          name: e.name,
          placeholder: e.placeholder,
          required: e.required,
        })),
      ),
    },
    null,
    2,
  ),
);
await browser.close();
