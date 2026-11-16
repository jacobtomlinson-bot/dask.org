import { expectReadingMarker } from './brand-reading-check.mjs';
import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
import { chromium, expect } from '@playwright/test';
import { measureTone, screenshotTone } from './tone-measure.mjs';
const references = JSON.parse(
  await fs.readFile('evidence/round8/reference.json', 'utf8'),
);
const rails = JSON.parse(
  await fs.readFile('evidence/round8/rail-reference.json', 'utf8'),
);
const browser = await chromium.launch(),
  rows = [];
try {
  const p = await browser.newPage({ reducedMotion: 'reduce' });
  for (const ref of references) {
    const { width } = ref;
    await p.setViewportSize({ width, height: 1000 });
    await p.goto(
      (process.env.BASE_URL || 'http://127.0.0.1:4321') + '/brand-guide',
    );
    await p.evaluate(() => document.fonts.ready);
    const native = await measureTone(p);
    let maxParagraphError = 0;
    for (let i = 0; i < 9; i++) {
      expect(native.paragraphs[i].lines, `${width} p${i} line text`).toEqual(
        ref.paragraphs[i].lines,
      );
      for (const k of ['x', 'y', 'width', 'height']) {
        const error = Math.abs(native.paragraphs[i][k] - ref.paragraphs[i][k]);
        maxParagraphError = Math.max(maxParagraphError, error);
        expect(error, `${width} p${i} ${k}`).toBeLessThan(0.25);
      }
    }
    const paint = await p.locator('#tone').evaluate((section) => {
      const origin = section.getBoundingClientRect();
      const box = (el, pseudo) => {
        const parent = el.getBoundingClientRect(),
          s = getComputedStyle(el, pseudo);
        return {
          x: parent.x + parseFloat(s.left),
          y: parent.y - origin.y + parseFloat(s.top),
          width: parseFloat(s.width),
          height: parseFloat(s.height),
          z: s.zIndex,
          color: s.backgroundColor,
        };
      };
      // Tone now has real sticky sheets, not section-owned decorative masks.
      const panels = [...section.querySelectorAll(':scope > .tone-sheet')].map(
        (e) => {
          const r = e.getBoundingClientRect(),
            style = getComputedStyle(e);
          return {
            x: r.x,
            y: r.y - origin.y,
            width: r.width,
            height: r.height,
            color: style.backgroundColor,
          };
        },
      );
      const s = getComputedStyle(section);
      return {
        panels,
        background: {
          size: s.backgroundSize,
          position: s.backgroundPosition,
          repeat: s.backgroundRepeat,
          image: s.backgroundImage,
        },
        sectionHeight: origin.height,
      };
    });
    const sourcePanels = ref.paint.filter((e) => e.cls.includes('brg-text-l'));
    let maxPaintError = 0;
    for (let i = 0; i < 2; i++) {
      const a = paint.panels[i],
        b = sourcePanels[i];
      for (const [k, sourceKey] of [
        ['x', 'x'],
        ['y', 'y'],
        ['width', 'w'],
        ['height', 'h'],
      ]) {
        const error = Math.abs(a[k] - b[sourceKey]);
        maxPaintError = Math.max(maxPaintError, error);
        expect(error, `${width} surface${i} ${k}`).toBeLessThan(0.35);
      }
      expect(a.color).toBe('rgb(246, 246, 246)');
    }
    // Same artwork, viewport-wide size, origin and vertical period: changing the
    // global dot phase cannot compensate for missing paper. No phase override.
    const sourceImage = ref.paint[0].style.backgroundImage.match(
      /vector-grid[^/]*\.svg/,
    )[0];
    expect(paint.background.image).toContain(sourceImage);
    expect(paint.background.position.replace(' 0%', ' 0px')).toBe(
      width >= 768 ? '100% 0px' : '50% 0px',
    );
    expect(
      Math.abs(
        parseFloat(paint.background.size) -
          width * (width < 480 ? 1.28 : width < 768 ? 1.03 : 1),
      ),
    ).toBeLessThan(0.01);
    const rail = await p.locator('.brand-sidebar').evaluate((nav) => {
      const origin = nav.closest('.brand-rail').getBoundingClientRect();
      const box = (e) => {
        const r = e.getBoundingClientRect();
        return { x: r.x, y: r.y - origin.y, width: r.width, height: r.height };
      };
      return {
        items: [...nav.querySelectorAll('a')].map((e) => ({
          box: box(e),
          icon: box(e.querySelector('img,svg')),
        })),
      };
    });
    const sourceRail = rails.find((r) => r.width === width);
    let maxRailError = 0;
    for (let i = 0; i < 4; i++)
      for (const part of ['box', 'icon'])
        for (const k of ['x', 'y', 'width', 'height']) {
          const error = Math.abs(
            rail.items[i][part][k] - sourceRail.items[i][part][k],
          );
          maxRailError = Math.max(maxRailError, error);
          expect(error, `${width} rail${i} ${part} ${k}`).toBeLessThan(0.2);
        }
    await screenshotTone(p, `evidence/round8/local/tone-${width}.png`);
    await p
      .locator('.brand-sidebar')
      .screenshot({ path: `evidence/round8/local/rail-${width}.png` });
    for (const [i, e] of (
      await p.locator('.brand-sidebar img,.brand-sidebar svg').all()
    ).entries())
      await e.screenshot({
        path: `evidence/round8/local/icon-${width}-${i}.png`,
      });
    const raster = PNG.sync.read(
      await fs.readFile(`evidence/round8/local/tone-${width}.png`),
    );
    for (const [i, paragraph] of native.paragraphs.entries()) {
      let ink = 0;
      for (
        let y = Math.max(0, Math.ceil(paragraph.y));
        y < Math.min(raster.height, Math.floor(paragraph.y + paragraph.height));
        y++
      )
        for (
          let x = Math.ceil(paragraph.x);
          x < Math.floor(paragraph.x + paragraph.width);
          x++
        ) {
          const at = (y * raster.width + x) * 4;
          if (Math.max(...raster.data.subarray(at, at + 3)) < 70) ink++;
        }
      expect(
        ink,
        `${width} paragraph${i} foreground remains painted`,
      ).toBeGreaterThan(20);
    }
    for (const [i, panel] of paint.panels.entries()) {
      const x = Math.ceil(panel.x + 2),
        y = Math.round(panel.y + panel.height * 0.6);
      const at = (y * raster.width + x) * 4;
      expect(
        [...raster.data.subarray(at, at + 3)],
        `${width} paper${i} actual paint`,
      ).toEqual([246, 246, 246]);
    }
    for (const state of ['colors', 'tone']) {
      const link = p.locator(`.brand-sidebar a[href="#${state}"]`);
      await link.click();
      await expect(p).toHaveURL(new RegExp('#' + state + '$'));
      await expectReadingMarker(p);
    }
    rows.push({
      width,
      maxParagraphError,
      maxPaintError,
      maxRailError,
      paint,
      rail,
      native,
    });
  }
  console.log(
    `${rows.length} surface/rail/phase groups passed; 90 exact paragraph line arrays preserved.`,
  );
} finally {
  await browser.close();
  await fs.writeFile(
    'evidence/round8/checks.json',
    JSON.stringify(rows, null, 2) + '\n',
  );
}
