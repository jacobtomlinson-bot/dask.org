/* Rendered DOM/ink measurements only: no source stylesheets or runtime implementation. */
export function measureLayout({ selectors, map = {} }) {
  const lines = (e) => {
    if (!e.matches('h1,h2,h3,p,.text-small,.text-medium')) return undefined;
    const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT),
      groups = [];
    let n;
    while ((n = w.nextNode()))
      for (let i = 0; i < n.length; i++) {
        const r = document.createRange();
        r.setStart(n, i);
        r.setEnd(n, i + 1);
        const b = r.getBoundingClientRect();
        if (!b.width || !b.height) continue;
        let g = groups.find((x) => Math.abs(x.y - b.y) < 1);
        if (!g) {
          g = { y: b.y, t: '' };
          groups.push(g);
        }
        g.t += n.textContent[i];
      }
    return groups.map((g) => g.t.replace(/\s+/g, ' ').trim()).filter(Boolean);
  };
  const info = (e) => {
    const r = e.getBoundingClientRect(),
      s = getComputedStyle(e);
    const section = e.closest('section,footer,.footer');
    const o = section?.getBoundingClientRect() || { y: 0 };
    const range = document.createRange();
    range.selectNodeContents(e);
    const ink = range.getBoundingClientRect();
    return {
      lines: lines(e),
      tag: e.tagName,
      cls: String(e.className),
      text: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 160),
      x: r.x,
      y: r.y - o.y,
      w: r.width,
      h: r.height,
      sectionTop: o.y,
      ink: { x: ink.x, y: ink.y - o.y, w: ink.width, h: ink.height },
      css: Object.fromEntries(
        [
          'display',
          'position',
          'width',
          'height',
          'minHeight',
          'maxWidth',
          'padding',
          'margin',
          'gap',
          'gridTemplateColumns',
          'gridTemplateRows',
          'flexDirection',
          'alignItems',
          'justifyContent',
          'backgroundColor',
          'fontSize',
          'fontWeight',
          'lineHeight',
          'borderTop',
          'borderBottom',
        ].map((k) => [k, s[k]]),
      ),
    };
  };
  return {
    groups: Object.fromEntries(
      selectors.map((selector) => [
        selector,
        [...document.querySelectorAll(map[selector] || selector)]
          .filter(
            (e) =>
              e.getBoundingClientRect().width > 0 &&
              e.getBoundingClientRect().height > 0,
          )
          .map((e) => ({
            box: info(e),
            ancestors: [e.parentElement, e.parentElement.parentElement].map(
              info,
            ),
            children: [...e.querySelectorAll('*')]
              .filter(
                (e) =>
                  e.getBoundingClientRect().width > 0 &&
                  e.getBoundingClientRect().height > 0 &&
                  !['path', 'g', 'svg', 'br'].includes(e.tagName.toLowerCase()),
              )
              .map(info),
          })),
      ]),
    ),
    footer: [...document.querySelectorAll('footer *, .footer *')]
      .filter(
        (e) =>
          e.getBoundingClientRect().width > 0 &&
          e.getBoundingClientRect().height > 0 &&
          !['path', 'g', 'svg', 'br'].includes(e.tagName.toLowerCase()),
      )
      .map(info),
    images: [...document.images]
      .filter((e) => e.getBoundingClientRect().width > 0)
      .map((e) => ({ src: e.getAttribute('src'), ...info(e) })),
  };
}
