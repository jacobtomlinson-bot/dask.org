import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser();
const p = await context.newPage();
await p.setViewportSize({ width: 1440, height: 1000 });
await p.goto('https://www.dask.org/brand-guide', {
  waitUntil: 'domcontentloaded',
});
await p.evaluate(() => document.fonts.ready);
const out = { logos: [], colors: [] };
for (let i = 0; i < 4; i++) {
  await p.getByRole('tab').nth(i).click();
  await p.waitForTimeout(650);
  out.logos.push(
    await p.locator('#logos .w-tab-pane.w--tab-active').evaluate((e) => {
      let s = getComputedStyle(e);
      return {
        text: e.innerText,
        bg: s.backgroundColor,
        color: s.color,
        ancestors: [e.parentElement, e.parentElement.parentElement].map(
          (p) => ({
            bg: getComputedStyle(p).backgroundColor,
            opacity: getComputedStyle(p).opacity,
          }),
        ),
      };
    }),
  );
}
for (let i = 0; i < 12; i++) {
  await p
    .getByRole('tab')
    .nth(i + 4)
    .click();
  await p.waitForTimeout(650);
  out.colors.push(
    await p.locator('.br-g-colors-tabs .w--tab-active').evaluate((e) => {
      let child = e.firstElementChild,
        s = getComputedStyle(child);
      return {
        text: e.innerText,
        bg: s.backgroundColor,
        color: s.color,
        opacity: s.opacity,
        parentBg: getComputedStyle(e).backgroundColor,
      };
    }),
  );
}
await fs.writeFile(
  'evidence/reference/palette-observed.json',
  JSON.stringify(out, null, 2),
);
console.log(out);
await browser.close();
