import { referenceBrowser } from './reference-browser.mjs';
import fs from 'node:fs/promises';
const { browser, context } = await referenceBrowser(),
  p = await context.newPage(),
  hover = [],
  selected = [];
try {
  for (const width of [390, 768, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    await p.goto('https://www.dask.org');
    await p.evaluate(() => document.fonts.ready);
    for (const label of ['Big Pandas', 'Parallel For Loops']) {
      const tab = p.getByRole('tab', { name: label, exact: true });
      await tab.hover();
      await p.waitForTimeout(400);
      hover.push({
        width,
        label,
        color: await tab.evaluate((e) => getComputedStyle(e).color),
      });
    }
  }
  await p.setViewportSize({ width: 601, height: 1000 });
  await p.goto('https://www.dask.org/brand-guide');
  await p.evaluate(() => document.fonts.ready);
  for (const hex of ['#61BA92', '#FC6E6B', '#FFFFFF', '#1F5AFF']) {
    const tab = p
      .locator('.br-g-colors-tabs-menu [role=tab]')
      .filter({ hasText: hex });
    await tab.click();
    await p.waitForTimeout(400);
    selected.push(
      await tab.evaluate((e) => ({
        hex: e.textContent.trim(),
        selected: e.getAttribute('aria-selected'),
        color: getComputedStyle(e).color,
        childColor: getComputedStyle(e.querySelector('.text-medium')).color,
        bg: getComputedStyle(e).backgroundColor,
      })),
    );
  }
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round12/source-workload-hover.json',
    JSON.stringify(hover, null, 2) + '\n',
  );
  await fs.writeFile(
    'evidence/round12/source-selected-treatment.json',
    JSON.stringify(selected, null, 2) + '\n',
  );
}
console.log(
  hover.length,
  'settled original hover states;',
  selected.length,
  'settled original selected-color states',
);
