import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { referenceBrowser } from './reference-browser.mjs';
export function measureRound10(local = false) {
  const rect = (r, y = 0) => ({ x: r.x, y: r.y - y, w: r.width, h: r.height });
  const info = (e, base) => {
    if (!e) return null;
    const r = e.getBoundingClientRect(),
      y = base?.getBoundingClientRect().y || 0,
      s = getComputedStyle(e),
      range = document.createRange();
    range.selectNodeContents(e);
    const lines = [];
    const walk = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walk.nextNode()))
      for (let i = 0; i < n.length; i++) {
        range.setStart(n, i);
        range.setEnd(n, i + 1);
        const b = range.getBoundingClientRect();
        if (!b.width || !b.height) continue;
        let l = lines.find((l) => Math.abs(l.y - b.y) < 1);
        if (!l) lines.push((l = { y: b.y, text: '' }));
        l.text += n.textContent[i];
      }
    range.selectNodeContents(e);
    return {
      tag: e.tagName,
      cls: String(e.className),
      text: e.textContent.trim().replace(/\s+/g, ' '),
      ...rect(r, y),
      ink: rect(range.getBoundingClientRect(), y),
      lines: lines
        .sort((a, b) => a.y - b.y)
        .map((l) => l.text.trim().replace(/\s+/g, ' ')),
      css: Object.fromEntries(
        [
          'fontSize',
          'fontWeight',
          'fontFamily',
          'lineHeight',
          'display',
          'gridTemplateColumns',
          'gridTemplateRows',
          'alignItems',
          'justifyContent',
          'gap',
          'padding',
          'margin',
          'borderLeftWidth',
          'borderTopWidth',
          'objectFit',
          'objectPosition',
          'width',
          'height',
          'minHeight',
          'maxWidth',
          'flex',
          'alignSelf',
          'verticalAlign',
        ].map((k) => [k, s[k]]),
      ),
      natural: e.tagName === 'IMG' ? [e.naturalWidth, e.naturalHeight] : null,
    };
  };
  const pack = (e, base = e) =>
    e
      ? {
          box: info(e, base),
          ancestors: [
            e.parentElement,
            e.parentElement.parentElement,
            e.parentElement.parentElement.parentElement,
          ].map((p) => info(p, base)),
          children: [...e.children].map((p) => info(p, base)),
        }
      : null;
  const byText = (selector, text) =>
    [...document.querySelectorAll(selector)].find((e) =>
      e.textContent.trim().replace(/\s+/g, ' ').startsWith(text),
    );
  const type = document.querySelector('#typography');
  let specimens = [];
  if (type) {
    const cells = local
      ? [...type.querySelectorAll('.type-row')]
      : [...type.querySelectorAll('.one-third')]
          .filter(
            (e) =>
              e.parentElement.querySelectorAll(':scope > .one-third').length ===
              3,
          )
          .filter((e, i) => i % 3 === 0)
          .map((e) => e.parentElement);
    specimens = cells.map((e) => ({
      box: info(e, type),
      cells: [...e.children].map((c) => ({
        box: info(c, type),
        content: info(c.firstElementChild || c, type),
      })),
    }));
  }
  const banks = [
    'Companies Powered',
    'Projects Powered',
    'Organizations That Use',
  ]
    .map((text) => {
      const h = byText('h2', text);
      if (!h) return null;
      const section = h.closest('section') || h.closest('.section-responsive'),
        imgs = [...section.querySelectorAll('img')];
      return {
        title: text,
        box: info(section, section),
        heading: pack(h, section),
        copy: info(
          section.querySelector(
            local ? '.org-intro p' : '.pb-text .text-regular',
          ),
          section,
        ),
        images: imgs.map((e) => ({
          ...pack(e, section),
          src: e.getAttribute('src'),
        })),
      };
    })
    .filter(Boolean);
  const press = [
    ...document.querySelectorAll(local ? '.press-card' : '.press-r-link'),
  ].map((e) => ({
    box: info(e, document.body),
    img: pack(e.querySelector('img'), document.body),
    copy: pack(
      e.querySelector(local ? '.press-copy' : '.title-container'),
      document.body,
    ),
    title: info(e.querySelector('h2'), document.body),
    date: info(
      e.querySelector(local ? 'time' : '.title-container').firstElementChild ||
        e.querySelector('time'),
      document.body,
    ),
  }));
  const closingTitle = byText('h2', 'Super easy to get started'),
    closing = closingTitle
      ? local
        ? closingTitle.closest('section')
        : closingTitle.closest('.section-responsive')
      : null;
  const note = byText(local ? 'p' : 'h2', 'Most people use Dask just on');
  const nb = note
    ? local
      ? note.closest('section')
      : note.closest('.section-responsive')
    : null;
  const casesTitle = byText('h2', 'Use Cases'),
    cs = casesTitle?.closest('section');
  return {
    specimens,
    type: type
      ? {
          box: info(type, type),
          children: [...type.children].map((e) => pack(e, type)),
          intro: info(
            type.querySelector(local ? 'p' : '.mar-top-medium > p'),
            type,
          ),
        }
      : null,
    banks,
    press,
    closing: closing
      ? {
          box: info(closing, closing),
          title: pack(closingTitle, closing),
          body: pack(
            closing.querySelector(local ? 'p' : '.text-medium'),
            closing,
          ),
          action: pack(closing.querySelector('a'), closing),
          code: info(closing.querySelector('pre'), closing),
          terminal: pack(
            closing.querySelector(local ? '.terminal' : '.terminal-window') ||
              closing.querySelector('pre')?.parentElement,
            closing,
          ),
        }
      : null,
    note: nb
      ? {
          box: info(nb, nb),
          text: pack(note, nb),
          image: pack(nb.querySelector('img'), nb),
          action: pack(nb.querySelector('a'), nb),
        }
      : null,
    cases: cs
      ? {
          box: info(cs, cs),
          title: info(casesTitle, cs),
          body: info(casesTitle.nextElementSibling, cs),
          grid: info(
            cs.querySelector(local ? '.cases-grid' : '.use-cases-grid') ||
              cs.querySelector('a:has(h3)')?.parentElement,
            cs,
          ),
          cards: [...cs.querySelectorAll('a:has(h3)')].map((e) => info(e, cs)),
          more: info(byText('h3', 'Want more examples')?.parentElement, cs),
        }
      : null,
    header: [
      ...document.querySelectorAll(
        local
          ? '.site-header nav > *, .site-header .community-toggle, .header-logo'
          : 'a.nav-link,.dropdown-toggle.hide-tablet,.nav-button,.nav-logo img',
      ),
    ]
      .filter((e) => e.getBoundingClientRect().width)
      .map((e) => info(e)),
    overflow: document.documentElement.scrollWidth > innerWidth,
  };
}
if (process.argv[1]?.endsWith('round10-probe.mjs')) {
  const local = process.env.LOCAL_ONLY === '1';
  const { browser, context } = local
    ? await (async () => {
        let browser = await chromium.launch();
        return {
          browser,
          context: await browser.newContext({ reducedMotion: 'reduce' }),
        };
      })()
    : await referenceBrowser();
  const rows = [];
  try {
    for (const width of (
      process.env.WIDTHS || '390,479,480,601,767,768,769,991,992,1100,1440'
    )
      .split(',')
      .map(Number))
      for (const slug of (
        process.env.ROUTES || 'brand-guide,powered-by,press-mentions,home'
      ).split(',')) {
        const p = await context.newPage();
        await p.setViewportSize({ width, height: 1000 });
        await p.goto(
          (local
            ? process.env.BASE_URL || 'http://127.0.0.1:4321'
            : 'https://www.dask.org') +
            '/' +
            (slug === 'home' ? '' : slug),
        );
        await p.evaluate(() => document.fonts.ready);
        await p.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 700) {
            scrollTo({ top: y, behavior: 'instant' });
            await new Promise((r) => setTimeout(r, 30));
          }
          scrollTo({ top: 0, behavior: 'instant' });
        });
        await p.waitForTimeout(700);
        rows.push({
          width,
          slug,
          ...(await p.evaluate(measureRound10, local)),
        });
        await p.close();
      }
  } finally {
    await browser.close();
    await fs.writeFile(
      `evidence/round10/${local ? 'local' : 'reference'}.json`,
      JSON.stringify(rows, null, 2),
    );
  }
  console.log(rows.length, 'round10 records');
}
