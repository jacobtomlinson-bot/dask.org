import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
/** Read-only rendered geometry; no source markup/styles are replayed by production. */
export async function measureTone(page) {
  return page.locator('#tone').evaluate((section) => {
    const origin = section.getBoundingClientRect();
    const info = (e) => {
      const r = e.getBoundingClientRect(),
        s = getComputedStyle(e);
      return {
        x: r.x,
        y: r.y - origin.y,
        width: r.width,
        height: r.height,
        css: Object.fromEntries(
          [
            'padding',
            'margin',
            'gap',
            'gridTemplateColumns',
            'display',
            'fontSize',
            'fontFamily',
            'fontWeight',
            'lineHeight',
            'minHeight',
            'backgroundColor',
            'flexDirection',
          ].map((k) => [k, s[k]]),
        ),
      };
    };
    const lines = (e) => {
      const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT),
        groups = [];
      let n;
      while ((n = walker.nextNode()))
        for (let i = 0; i < n.length; i++) {
          const range = document.createRange();
          range.setStart(n, i);
          range.setEnd(n, i + 1);
          const r = range.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          let g = groups.find((g) => Math.abs(g.y - r.y) < 1);
          if (!g) {
            g = { y: r.y, text: '' };
            groups.push(g);
          }
          g.text += n.textContent[i];
        }
      return groups
        .map((g) => g.text.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
    };
    const paragraphs = [...section.querySelectorAll('p')].map((e) => ({
      ...info(e),
      text: e.textContent.trim().replace(/\s+/g, ' '),
      lines: lines(e),
    }));
    const intro = section.querySelector('h2').parentElement;
    let right = section.querySelectorAll('p')[1].parentElement;
    while (right !== section && right.querySelectorAll('p').length !== 8)
      right = right.parentElement;
    return {
      section: info(section),
      columns: [info(intro), info(right)],
      paragraphs,
      ancestors: [intro, right].map((e) => {
        const out = [];
        while (e && e !== section) {
          out.push({ tag: e.tagName, cls: e.className, ...info(e) });
          e = e.parentElement;
        }
        return out;
      }),
      heading: info(section.querySelector('h2')),
    };
  });
}

/** Keep both crops viewport-wide; native reserves a separate rail grid track. */
export async function screenshotTone(page, path) {
  const bounds = await page.locator('#tone').boundingBox();
  const input = PNG.sync.read(await page.screenshot({ fullPage: true }));
  const y = Math.round(bounds.y + (await page.evaluate(() => scrollY)));
  const height = Math.min(Math.round(bounds.height), input.height - y);
  const output = new PNG({ width: input.width, height });
  PNG.bitblt(input, output, 0, y, input.width, height, 0, 0);
  await fs.writeFile(path, PNG.sync.write(output));
}
