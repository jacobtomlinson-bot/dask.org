import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { referenceBrowser } from './reference-browser.mjs';
export function measure(local) {
  const find = (sel, t, scope = document) =>
    [...scope.querySelectorAll(sel)].find((e) =>
      e.textContent.trim().replace(/\s+/g, ' ').startsWith(t),
    );
  const visible = (e) =>
    e && e.getBoundingClientRect().width && e.getBoundingClientRect().height;
  let section;
  const info = (e) => {
    if (!e) return null;
    const r = e.getBoundingClientRect(),
      s = getComputedStyle(e),
      b = section.getBoundingClientRect(),
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
      lines: lines
        .sort((a, b) => a.y - b.y)
        .map((l) => l.text.trim().replace(/\s+/g, ' ')),
      ink: { x: ink.x, y: ink.y - b.y, w: ink.width, h: ink.height },
      css: Object.fromEntries(
        [
          'fontSize',
          'fontWeight',
          'lineHeight',
          'padding',
          'margin',
          'backgroundColor',
          'color',
          'opacity',
          'filter',
          'backgroundSize',
          'backgroundImage',
          'objectFit',
          'objectPosition',
        ].map((k) => [k, s[k]]),
      ),
      href: e.getAttribute('href'),
      src: e.getAttribute('src'),
    };
  };
  const list = (els) => [...els].filter(visible).map(info);
  if (location.pathname.includes('get-started')) {
    section = find('h2', 'Explore the Possibilities').closest(
      local ? 'section' : '.section-responsive',
    );
    const panel = section.querySelector(
        local ? '.explore-panel:not([hidden])' : '.w--tab-active',
      ),
      card = panel.querySelector(
        local ? '.explore-card' : '.slider-background',
      );
    const explore = {
      section: info(section),
      heading: info(find('h2', 'Explore', section)),
      intro: info(
        section.querySelector(
          local ? '.explore-intro > p' : '.blog-h .text-half',
        ),
      ),
      tabs: list(section.querySelectorAll('[role=tab]')),
      labels: list(
        section.querySelectorAll(local ? '.explore-label' : '.tab-title'),
      ),
      icons: list(
        section.querySelectorAll(local ? '.tab-icon svg' : '.posib-img-icon'),
      ),
      connectors: list(
        section.querySelectorAll(
          local ? '.explore-connector' : '.bg-line-black',
        ),
      ),
      panel: info(panel),
      card: info(card),
      title: info(card.querySelector('h3')),
      body: info(card.querySelector(local ? 'p' : '.text-regular')),
      arrows: list(
        panel.querySelectorAll(
          local ? '[data-select-tab]' : '.container-arrows > *',
        ),
      ),
      action: info(panel.querySelector('a.button')),
    };
    section = find('h2', 'Learn Your Way Around').closest(
      local ? 'section' : '.section-responsive',
    );
    const learn = {
      section: info(section),
      heading: info(find('h2', 'Learn', section)),
      intro: info(
        section.querySelector(local ? '.learn-intro p' : '.h-text p'),
      ),
      titles: list(section.querySelectorAll('h3')),
      body: list(
        section.querySelectorAll(
          local ? '.learn-card p' : '.get-st-card .text-medium',
        ),
      ),
      actions: list(
        section.querySelectorAll(
          local ? '.learn-card .text-link' : '.get-st-card .link',
        ),
      ),
      art: list(
        section.querySelectorAll(
          local ? '.learn-artwork img' : '.get-st-imgs img',
        ),
      ),
      nextTop:
        find('h2', 'Explore')
          .closest(local ? 'section' : '.section-responsive')
          .getBoundingClientRect().top - section.getBoundingClientRect().top,
    };
    return {
      explore,
      learn,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  }
  const tab = find('[role=tab]', 'Open Source Deployment'),
    scope = tab.closest(local ? '[data-tabs]' : '.w-tabs');
  const panel = scope.querySelector(
      local ? '[role=tabpanel]:not([hidden])' : '.w--tab-active',
    ),
    term = panel.querySelector(local ? '.terminal' : '.tab-code-wr');
  section = local
    ? scope.closest('section')
    : panel.querySelector('.section-responsive');
  return {
    deployment: {
      section: info(section),
      heading: info(find('h2', 'Where you can run', section)),
      tabs: list(scope.querySelectorAll('[role=tab]')),
      labels: list(
        scope.querySelectorAll(
          local ? '[role=tab] > span:first-child' : '.run-dask-tab-link > div',
        ),
      ),
      panel: info(local ? panel : panel.querySelector('.run-dask-tabs-wr')),
      title: info(panel.querySelector(local ? 'h2' : '.home-tabs-text h2')),
      body: info(panel.querySelector('p')),
      actions: list(
        panel.querySelectorAll(local ? '.workload-actions a' : '.buttons-wr a'),
      ),
      logos: list(panel.querySelectorAll('img')),
      terminal: info(term),
      bar: info(term.querySelector(local ? '.window-bar' : '.tab-code-top')),
      dots: list(
        term.querySelectorAll(local ? '.window-bar i' : '.tap-code-top-dot'),
      ),
      pre: info(term.querySelector('pre')),
    },
    overflow: document.documentElement.scrollWidth > innerWidth,
  };
}
const ref = process.env.REFERENCE === '1',
  ctx = ref ? await referenceBrowser() : { browser: await chromium.launch() };
ctx.context ??= await ctx.browser.newContext({ reducedMotion: 'reduce' });
const p = await ctx.context.newPage(),
  out = [];
try {
  for (const width of (
    process.env.WIDTHS || '390,479,480,601,767,768,769,991,992,1100,1440'
  )
    .split(',')
    .map(Number)) {
    await p.setViewportSize({ width, height: 1000 });
    for (const route of ['get-started', 'home']) {
      await p.goto(
        (ref
          ? 'https://www.dask.org'
          : process.env.BASE_URL || 'http://127.0.0.1:4321') +
          '/' +
          (route === 'home' ? '' : route),
      );
      await p.evaluate(() => document.fonts.ready);
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 15));
        }
      });
      for (const state of route === 'home'
        ? ['Open Source Deployment', 'Managed Cloud']
        : ['Ecosystem', 'Case studies', 'Examples']) {
        await p.getByRole('tab', { name: state, exact: true }).click();
        await p.waitForTimeout(ref ? 650 : 20);
        const data = await p.evaluate(measure, !ref);
        out.push({ width, route, state, ...data });
        if (process.env.CAPTURES === '1') {
          const key =
            route === 'home'
              ? ref
                ? '.run-dask-tabs-wr'
                : '.deployment'
              : ref
                ? '.possibil'
                : '.explore-section';
          let capture = p.locator(key).filter({ visible: true });
          if (ref) capture = capture.locator('../..');
          await capture.screenshot({
            path: `evidence/round11/${ref ? 'reference' : 'local'}-${route}-${width}-${state.replaceAll(' ', '-')}.png`,
          });
        }
      }
    }
    console.log(width);
  }
} finally {
  await fs.writeFile(
    `evidence/round11/${ref ? 'reference' : 'local'}.json`,
    JSON.stringify(out, null, 2),
  );
  await ctx.browser.close();
}
