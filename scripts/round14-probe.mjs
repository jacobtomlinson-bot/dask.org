import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { referenceBrowser } from './reference-browser.mjs';
const dir = 'evidence/round14';
await fs.mkdir(dir + '/captures', { recursive: true });
const reference = process.env.REFERENCE === '1';
const label = reference ? 'reference' : 'local';
const ref = reference
  ? await referenceBrowser({ reducedMotion: 'reduce' })
  : null;
const browser = ref?.browser || (await chromium.launch());
const context =
  ref?.context || (await browser.newContext({ reducedMotion: 'reduce' }));
const base = reference
  ? 'https://www.dask.org'
  : process.env.BASE_URL || 'http://127.0.0.1:4321';
const widths = (
  process.env.WIDTHS || '390,479,480,601,767,768,769,991,992,1100,1440'
)
  .split(',')
  .map(Number);
const heights = (process.env.HEIGHTS || '700,1000').split(',').map(Number);
const rows = [],
  cases = [];
try {
  for (const width of widths) {
    const p = await context.newPage();
    for (const height of process.env.CASES_ONLY === '1' ? [] : heights) {
      await p.setViewportSize({ width, height });
      await p.goto(base + '/brand-guide');
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 20));
        }
        scrollTo({ top: 0, behavior: 'instant' });
      });
      await p.waitForTimeout(250);
      const starts = await p.evaluate(() =>
        Object.fromEntries(
          ['logos', 'colors', 'typography', 'tone'].map((id) => [
            id,
            document.getElementById(id).getBoundingClientRect().y + scrollY,
          ]),
        ),
      );
      const targets = [{ section: 'initial', offset: 0, y: 0 }];
      for (const section of ['logos', 'colors', 'typography', 'tone'])
        for (const offset of section === 'tone'
          ? [0, 100, 200, 500, 800, 1300]
          : [0, 100, 300, 600])
          targets.push({ section, offset, y: starts[section] + offset });
      for (const direction of ['forward', 'backward'])
        for (const target of direction === 'forward'
          ? targets
          : [...targets].reverse()) {
          await p.evaluate(
            (y) => scrollTo({ top: y, behavior: 'instant' }),
            target.y,
          );
          await p.waitForTimeout(110);
          const data = await p.evaluate((local) => {
            const box = (e) => {
              if (!e) return null;
              const r = e.getBoundingClientRect(),
                s = getComputedStyle(e);
              return {
                x: r.x,
                y: r.y,
                w: r.width,
                h: r.height,
                bg: s.backgroundColor,
                position: s.position,
                top: s.top,
              };
            };
            const heading = [...document.querySelectorAll('h2')].find(
              (e) => e.textContent.trim() === 'Tone',
            );
            const paper = local
              ? heading.closest('.tone-sheet')
              : heading.closest('.brg-text-l');
            const links = [...document.querySelectorAll('a[href]')]
              .filter(
                (e) =>
                  ['#logos', '#colors', '#typography', '#tone'].includes(
                    e.getAttribute('href'),
                  ) && e.getBoundingClientRect().width,
              )
              .map((e) => {
                const r = box(e),
                  x = r.x + r.w / 2,
                  y = r.y + r.h / 2;
                return {
                  ...r,
                  href: e.getAttribute('href'),
                  current: local
                    ? e.hasAttribute('aria-current')
                    : e.classList.contains('w--current'),
                  hit:
                    document
                      .elementFromPoint(x, y)
                      ?.closest('a')
                      ?.getAttribute('href') ?? null,
                };
              });
            const tone = document.getElementById('tone');
            return {
              scrollY,
              maxScroll: document.documentElement.scrollHeight - innerHeight,
              links,
              paper: box(paper),
              heading: box(heading),
              intro: box(heading.nextElementSibling),
              tone: box(tone),
              footer: box(document.querySelector('footer')),
              sections: Object.fromEntries(
                ['logos', 'colors', 'typography', 'tone'].map((id) => [
                  id,
                  box(document.getElementById(id)),
                ]),
              ),
              overflow: document.documentElement.scrollWidth - innerWidth,
            };
          }, !reference);
          const row = {
            label,
            width,
            height,
            direction,
            section: target.section,
            offset: target.offset,
            requested: target.y,
            ...data,
          };
          if (
            process.env.CAPTURES === '1' &&
            direction === 'forward' &&
            target.section === 'tone' &&
            [0, 500, 1300].includes(target.offset)
          ) {
            row.capture = `${dir}/captures/${label}-${width}-${height}-tone-${target.offset}.png`;
            await p.screenshot({ path: row.capture });
          }
          rows.push(row);
        }
    }
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(base + '/');
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 20));
      }
      scrollTo({ top: 0, behavior: 'instant' });
    });
    await p.waitForTimeout(200);
    cases.push({
      label,
      width,
      ...(await p.evaluate((local) => {
        const heading = [...document.querySelectorAll('h2')].find(
            (e) => e.textContent.trim() === 'Use Cases',
          ),
          section = heading.closest('section'),
          grid = section.querySelector('a:has(h3)').parentElement,
          origin = section.getBoundingClientRect();
        const box = (e) => {
          const r = e.getBoundingClientRect();
          return { x: r.x, y: r.y - origin.y, w: r.width, h: r.height };
        };
        const lines = (e) => {
          const out = [],
            walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode()))
            for (let i = 0; i < node.length; i++) {
              const r = document.createRange();
              r.setStart(node, i);
              r.setEnd(node, i + 1);
              const b = r.getBoundingClientRect();
              if (!b.width || !b.height) continue;
              let line = out.find((x) => Math.abs(x.y - b.y) < 1);
              if (!line) out.push((line = { y: b.y, text: '' }));
              line.text += node.textContent[i];
            }
          return out
            .map((x) => x.text.replace(/\s+/g, ' ').trim())
            .filter(Boolean);
        };
        return {
          section: box(section),
          grid: box(grid),
          cards: [...grid.children].map((e) => ({
            box: box(e),
            href: e.getAttribute('href'),
            children: [...e.children].map(box),
            heading: lines(e.querySelector('h3')),
            textRuns: [...e.querySelectorAll('*')]
              .filter((e) => !e.children.length && e.textContent.trim())
              .map((e) => lines(e)),
            copy: lines(e),
            art: [...e.querySelectorAll('img')].map(box),
          })),
        };
      }, !reference)),
    });
    if (process.env.CAPTURES === '1') {
      await p
        .getByRole('heading', { name: 'Use Cases', exact: true })
        .scrollIntoViewIfNeeded();
      await p.screenshot({
        path: `${dir}/captures/${label}-cases-${width}.png`,
        fullPage: true,
      });
    }
    await p.close();
  }
} finally {
  if (process.env.CASES_ONLY !== '1')
    await fs.writeFile(
      `${dir}/${label}-scroll.json`,
      JSON.stringify(rows, null, 2) + '\n',
    );
  await fs.writeFile(
    `${dir}/${label}-cases.json`,
    JSON.stringify(cases, null, 2) + '\n',
  );
  await browser.close();
}
console.log(
  label,
  rows.length,
  'bidirectional viewport states;',
  cases.length,
  'seven-card structural records',
);
