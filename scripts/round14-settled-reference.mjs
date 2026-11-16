import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { referenceBrowser } from './reference-browser.mjs';
// Independently re-observe every source fixture after 350ms, including backward
// travel. This distinguishes a CSS marker-color transition from a static state.
const dir = 'evidence/round14';
const refs = JSON.parse(
  await fs.readFile(dir + '/reference-scroll.json', 'utf8'),
);
const ref = await referenceBrowser({ reducedMotion: 'reduce' }),
  rows = [];
await fs.mkdir(dir + '/settled', { recursive: true });
try {
  const p = await ref.context.newPage();
  for (const width of [...new Set(refs.map((r) => r.width))])
    for (const height of [700, 1000]) {
      await p.setViewportSize({ width, height });
      await p.goto('https://www.dask.org/brand-guide');
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 20));
        }
        scrollTo({ top: 0, behavior: 'instant' });
      });
      const start = await p.evaluate(() =>
        Object.fromEntries(
          ['logos', 'colors', 'typography', 'tone'].map((id) => [
            id,
            document.getElementById(id).getBoundingClientRect().y + scrollY,
          ]),
        ),
      );
      for (const r of refs.filter(
        (r) => r.width === width && r.height === height,
      )) {
        await p.evaluate(
          (y) => scrollTo({ top: y, behavior: 'instant' }),
          r.section === 'initial' ? 0 : start[r.section] + r.offset,
        );
        await p.waitForTimeout(350);
        const data = await p.evaluate(() => {
          const links = [...document.querySelectorAll('a[href]')].filter(
            (e) =>
              ['#logos', '#colors', '#typography', '#tone'].includes(
                e.getAttribute('href'),
              ) && e.getBoundingClientRect().width,
          );
          const box = (e) => {
            const r = e.getBoundingClientRect();
            return { x: r.x, y: r.y, w: r.width, h: r.height };
          };
          const h = [...document.querySelectorAll('h2')].find(
            (e) => e.textContent.trim() === 'Tone',
          );
          return {
            scrollY,
            links: links.map((e) => ({
              ...box(e),
              href: e.getAttribute('href'),
              current: e.classList.contains('w--current'),
            })),
            paper: box(h.closest('.brg-text-l')),
            heading: box(h),
            intro: box(h.nextElementSibling),
          };
        });
        assert.deepEqual(
          data.links.filter((e) => e.current).map((e) => e.href),
          r.links.filter((e) => e.current).map((e) => e.href),
        );
        let max = 0;
        for (const part of ['paper', 'heading', 'intro'])
          for (const k of ['x', 'y', 'w', 'h'])
            max = Math.max(max, Math.abs(data[part][k] - r[part][k]));
        assert.ok(
          max < 1,
          'settled actual geometry matches frozen source observation',
        );
        const row = {
          width,
          height,
          direction: r.direction,
          section: r.section,
          offset: r.offset,
          settleMs: 350,
          maxGeometryDelta: max,
          ...data,
        };
        if (r.capture) {
          row.capture = `${dir}/settled/reference-${width}-${height}-tone-${r.offset}.png`;
          await p.screenshot({ path: row.capture });
        }
        rows.push(row);
      }
    }
} finally {
  await ref.browser.close();
  await fs.writeFile(
    dir + '/settled-reference.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
console.log(
  rows.length,
  '350ms-settled bidirectional source states independently confirm reading markers and sheet geometry',
);
