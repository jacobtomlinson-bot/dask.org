import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const out = [];
for (const slug of [
  'home',
  'get-started',
  'get-help',
  'powered-by',
  'brand-guide',
  'press-mentions',
]) {
  for (const [view, width, height] of [
    ['mobile', 390, 900],
    ['tablet', 768, 900],
  ]) {
    const p = await context.newPage();
    await p.setViewportSize({ width, height });
    await p.goto('https://www.dask.org/' + (slug === 'home' ? '' : slug), {
      waitUntil: 'networkidle',
    });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({
      path: `evidence/reference/${slug}-${view}-closed.png`,
      fullPage: true,
    });
    out.push({
      slug,
      view,
      elements: await p
        .locator('h1,h2,h3,section,.section-responsive,.footer-container')
        .evaluateAll((es) =>
          es.map((e) => {
            let r = e.getBoundingClientRect(),
              s = getComputedStyle(e);
            return {
              text: e.textContent?.trim().slice(0, 65),
              tag: e.tagName,
              rect: [r.x, r.y, r.width, r.height],
              font: s.font,
              padding: s.padding,
            };
          }),
        ),
    });
    await p.close();
  }
}
const p = await context.newPage();
await p.setViewportSize({ width: 1440, height: 1000 });
await p.goto('https://www.dask.org/', { waitUntil: 'networkidle' });
await p.locator('.w-dropdown-toggle').first().click();
await p.screenshot({ path: 'evidence/reference/desktop-community.png' });
await p.goto('https://www.dask.org/brand-guide', { waitUntil: 'networkidle' });
const tabs = p.getByRole('tab');
console.log('brand tabs', await tabs.allTextContents());
for (let i = 3; i < Math.min(await tabs.count(), 7); i++) {
  await tabs.nth(i).click();
  await p.screenshot({ path: `evidence/reference/brand-logo-state-${i}.png` });
}
console.log(
  'color buttons',
  await p.locator('[class*=color]').evaluateAll((es) =>
    es.slice(-30).map((e) => ({
      tag: e.tagName,
      cls: e.className,
      text: e.textContent?.slice(0, 150),
    })),
  ),
);
await p.goto('https://www.dask.org/press-mentions', {
  waitUntil: 'networkidle',
});
await p.getByText('Add a press mention', { exact: true }).click();
await p.waitForTimeout(400);
await p.screenshot({ path: 'evidence/reference/press-dialog.png' });
out.push({
  dialog: await p.locator('body').innerText(),
  fields: await p.locator('input,textarea,select').evaluateAll((es) =>
    es.map((e) => ({
      tag: e.tagName,
      type: e.type,
      name: e.name,
      placeholder: e.placeholder,
      required: e.required,
    })),
  ),
});
await fs.writeFile(
  'evidence/reference/states.json',
  JSON.stringify(out, null, 2),
);
await browser.close();
