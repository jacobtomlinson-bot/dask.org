import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
import { chromium } from '@playwright/test';
import { referenceBrowser } from './reference-browser.mjs';
const ref = process.env.REFERENCE === '1',
  outdir = 'evidence/round12',
  widths = (
    process.env.WIDTHS || '390,479,480,601,767,768,769,991,992,1100,1440'
  )
    .split(',')
    .map(Number);
const o = ref ? await referenceBrowser() : { browser: await chromium.launch() };
o.context ??= await o.browser.newContext({ reducedMotion: 'reduce' });
const p = await o.context.newPage(),
  rows = [];
function measure({ local, route }) {
  const find = (sel, t, scope = document) =>
    [...scope.querySelectorAll(sel)].find(
      (e) =>
        e.getBoundingClientRect().width &&
        e.getBoundingClientRect().height &&
        e.textContent.trim().startsWith(t),
    );
  let section;
  const info = (e) => {
    if (!e) return null;
    const r = e.getBoundingClientRect(),
      b = section.getBoundingClientRect(),
      s = getComputedStyle(e),
      range = document.createRange(),
      lines = [];
    let n;
    const walk = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    while ((n = walk.nextNode()))
      for (let i = 0; i < n.length; i++) {
        range.setStart(n, i);
        range.setEnd(n, i + 1);
        const t = range.getBoundingClientRect();
        if (!t.width || !t.height) continue;
        let l = lines.find((l) => Math.abs(l.y - t.y) < 1);
        if (!l) lines.push((l = { y: t.y, text: '' }));
        l.text += n.textContent[i];
      }
    range.selectNodeContents(e);
    const ink = range.getBoundingClientRect();
    return {
      x: r.x,
      y: r.y - b.y,
      w: r.width,
      h: r.height,
      ink: { x: ink.x, y: ink.y - b.y, w: ink.width, h: ink.height },
      lines: lines
        .sort((a, b) => a.y - b.y)
        .map((l) => l.text.trim().replace(/\s+/g, ' ')),
      css: Object.fromEntries(
        [
          'fontSize',
          'fontWeight',
          'lineHeight',
          'padding',
          'margin',
          'gap',
          'gridTemplateColumns',
          'backgroundColor',
          'color',
          'filter',
          'opacity',
          'objectFit',
          'position',
          'left',
        ].map((k) => [k, s[k]]),
      ),
      src: e.getAttribute('src'),
      href: e.getAttribute('href'),
    };
  };
  if (route === 'get-started') {
    const h = find('h2', 'Dig Deeper');
    section = local ? h.closest('.deeper') : h.closest('.section-responsive');
    const upper = local ? section.querySelector('.deeper-upper') : section,
      band = local
        ? section.querySelector('.deeper-links')
        : section.nextElementSibling;
    return {
      upper: info(upper),
      band: info(band),
      heading: info(h),
      body: info(
        find('p,div', 'Dask has published extensive', section)
          .lastElementChild ||
          find('p,div', 'Dask has published extensive', section),
      ),
      art: info(section.querySelector('img')),
      links: [...band.querySelectorAll('a')].map(info),
      wrappers: [...band.children].map(info),
    };
  }
  if (route === 'brand-guide') {
    const h = find('h2', 'Colors');
    section = local ? h.closest('#colors') : h.closest('section');
    const copy = local
      ? section.querySelector('.palette-copy')
      : h.parentElement;
    const logo = find('h2', 'Logos') || find('h2', 'Logo');
    return {
      heading: info(h),
      body: info(copy.querySelector('p')),
      copy: info(copy),
      grid: info(
        local
          ? section.querySelector('.palette-grid')
          : section.querySelector('.br-g-colors-tabs-menu'),
      ),
      cells: [
        ...(local
          ? section.querySelectorAll('[data-color]')
          : section.querySelectorAll('.w-tab-menu a')),
      ].map(info),
      logoBody: info(
        (local
          ? document.querySelector('.brand-logo-copy')
          : logo.parentElement
        ).querySelector('p'),
      ),
    };
  }
  const first = find('[role=tab]', 'Big Pandas');
  const tabs = local
    ? first.closest('.workload-tabs')
    : first.closest('.w-tabs');
  section = local
    ? tabs.querySelector('[role=tabpanel]:not([hidden])')
    : tabs.querySelector('.w-tab-pane.w--tab-active');
  const copy = local
    ? section.querySelector('.workload-copy')
    : section.querySelector('.home-tabs-text');
  return {
    tabs: [...tabs.querySelectorAll('[role=tab]')].map((e) =>
      e.textContent.trim(),
    ),
    terminal: info(section.querySelector(local ? '.terminal' : '.tab-code-wr')),
    window: info(
      section.querySelector(local ? '.window-bar' : '.tab-code-top'),
    ),
    dots: [
      ...section.querySelectorAll(
        local ? '.window-bar i' : '.tap-code-top-dot',
      ),
    ].map(info),
    code: info(section.querySelector('pre')),
    copy: info(copy),
    heading: info(copy.querySelector('h2')),
    body: info(copy.querySelector('p')),
    actions: [...copy.querySelectorAll('a')].map(info),
    logos: [
      ...section.querySelectorAll(
        local ? '.workload-logos img' : '.home-tabs-logo-img',
      ),
    ].map(info),
  };
}
try {
  for (const width of widths) {
    await p.setViewportSize({ width, height: 1000 });
    for (const route of ['get-started', 'brand-guide', 'home']) {
      if (process.env.ROUTES && !process.env.ROUTES.split(',').includes(route))
        continue;
      await p.goto(
        (ref
          ? 'https://www.dask.org'
          : process.env.BASE_URL || 'http://127.0.0.1:4321') +
          (route === 'home' ? '/' : '/' + route),
      );
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 12));
        }
        scrollTo(0, 0);
      });
      const states =
        route === 'home'
          ? [
              'Big Pandas',
              'Parallel For Loops',
              'Big Arrays',
              'Machine Learning',
            ]
          : ['default'];
      for (const state of states) {
        if (route === 'home') {
          await p.getByRole('tab', { name: state, exact: true }).click();
          await p.waitForTimeout(400);
        }
        let data = await p.evaluate(measure, { local: !ref, route });
        rows.push({ width, route, state, ...data });
        if (process.env.CAPTURES === '1') {
          // State comparisons use a neutral pointer; hover has its own live gate.
          await p.mouse.move(0, 0);
          await p.waitForTimeout(350);
          const target =
            route === 'home'
              ? p.locator(ref ? '.w-tabs' : '.workload-tabs').filter({
                  has: p.getByRole('tab', {
                    name: 'Big Pandas',
                    exact: true,
                  }),
                })
              : route === 'get-started'
                ? p.locator(
                    ref ? '.section-responsive.bg-darkgrey.get-st' : '.deeper',
                  )
                : p.locator(ref ? 'section' : '#colors').filter({
                    has: p.getByRole('heading', {
                      name: 'Colors',
                      exact: true,
                    }),
                  });
          const path = `${outdir}/${ref ? 'reference' : 'local'}-${route}-${width}-${state.replaceAll(' ', '-')}.png`;
          if ((ref && route === 'get-started') || (!ref && route === 'home')) {
            const rect = await target.evaluate((e) => {
              const r = e.getBoundingClientRect();
              if (e.matches('.workload-tabs')) {
                const start = e
                    .querySelector('.tablist')
                    .getBoundingClientRect(),
                  end = e
                    .querySelector('[role=tabpanel]:not([hidden])')
                    .getBoundingClientRect();
                return {
                  x: r.x,
                  y: start.y + scrollY,
                  w: r.width,
                  h: end.bottom - start.y,
                };
              }
              return {
                x: 0,
                y: r.y + scrollY,
                w: r.width,
                h:
                  r.height +
                  e.nextElementSibling.getBoundingClientRect().height,
              };
            });
            const full = PNG.sync.read(await p.screenshot({ fullPage: true })),
              crop = new PNG({
                width: Math.round(rect.w),
                height: Math.round(rect.h),
              });
            PNG.bitblt(
              full,
              crop,
              Math.round(rect.x),
              Math.round(rect.y),
              crop.width,
              crop.height,
              0,
              0,
            );
            await fs.writeFile(path, PNG.sync.write(crop));
          } else await target.screenshot({ path });
        }
      }
    }
  }
} finally {
  await o.browser.close();
  await fs.writeFile(
    `${outdir}/${process.env.DATA_FILE || (ref ? 'reference' : 'local') + '.json'}`,
    JSON.stringify(rows, null, 2) + '\n',
  );
}
console.log(rows.length, 'round12 records');
