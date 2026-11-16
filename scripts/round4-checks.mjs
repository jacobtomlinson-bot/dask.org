import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const b = await chromium.launch(),
  rows = [],
  base = process.env.BASE_URL || 'http://127.0.0.1:4321';
const reference = JSON.parse(
  await fs.readFile('evidence/round4/reference.json', 'utf8'),
);
const paletteReference = JSON.parse(
  await fs.readFile('evidence/round4/reference-palette.json', 'utf8'),
);
await fs.mkdir('evidence/round4', { recursive: true });
try {
  for (const width of [390, 479, 480, 601, 767, 768, 1440]) {
    const p = await b.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: 'reduce',
    });
    await p.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    for (const slug of [
      '',
      'get-started',
      'get-help',
      'powered-by',
      'brand-guide',
      'press-mentions',
    ]) {
      await p.goto(base + '/' + slug);
      await p.evaluate(() => document.fonts.ready);
      const footer = await p.locator('footer').evaluate((e) => {
        const top = e.getBoundingClientRect().top;
        return {
          top,
          height: e.getBoundingClientRect().height,
          heads: [...e.querySelectorAll('h2')].map((x) => {
            let r = x.getBoundingClientRect();
            return { x: r.x, y: r.y - top, w: r.width, h: r.height };
          }),
          logo: e
            .querySelector('.footer-brand img')
            .getBoundingClientRect()
            .toJSON(),
          socials: e.querySelector('.socials').getBoundingClientRect().toJSON(),
          copyright: e
            .querySelector('.copyright')
            .getBoundingClientRect()
            .toJSON(),
        };
      });
      const columns = width < 480 ? 1 : width < 768 ? 2 : 4;
      expect(new Set(footer.heads.map((x) => Math.round(x.x))).size).toBe(
        columns,
      );
      if (columns === 2) {
        expect(footer.heads[0].y).toBeCloseTo(footer.heads[1].y);
        expect(footer.heads[2].y).toBeCloseTo(footer.heads[3].y);
        expect(footer.heads[2].y).toBeGreaterThan(footer.heads[0].y + 50);
        const original = reference.find((r) => r.width === width).footer;
        const origin = original[0].r.y;
        for (const [i, label] of [
          'Get Started',
          'Community',
          'Blog',
          'Brand',
        ].entries()) {
          const heading = original.find(
            (e) => e.cls.includes('text-medium footer-nav') && e.text === label,
          );
          expect(Math.abs(footer.heads[i].x - heading.r.x)).toBeLessThan(0.6);
          expect(
            Math.abs(footer.heads[i].y - (heading.r.y - origin)),
          ).toBeLessThan(0.6);
        }
        expect(Math.abs(footer.height - original[0].r.height)).toBeLessThan(1);
      }
      await p.locator('footer').screenshot({
        path: `evidence/round4/local-footer-${slug || 'home'}-${width}.png`,
      });
      rows.push({ kind: 'footer', slug, width, ...footer });
      if (slug === 'brand-guide' && width < 1000) {
        const colors = p.locator('[data-color]');
        const palette = await colors.evaluateAll((es) =>
          es.map((e) => ({
            color: e.dataset.color,
            ...e.getBoundingClientRect().toJSON(),
          })),
        );
        expect(new Set(palette.map((r) => Math.round(r.x))).size).toBe(
          width < 480 ? 1 : width < 768 ? 3 : 2,
        );
        expect(new Set(palette.map((r) => Math.round(r.y))).size).toBe(
          width < 480 ? 12 : width < 768 ? 4 : 6,
        );
        if (width >= 480 && width < 768) {
          const original = paletteReference.find(
            (r) => r.width === width,
          ).colors;
          for (let i = 0; i < palette.length; i++) {
            const source = original.find((e) => e.text === palette[i].color);
            expect(Math.abs(palette[i].x - source.r.x)).toBeLessThan(0.1);
            expect(Math.abs(palette[i].width - source.r.width)).toBeLessThan(
              0.1,
            );
            expect(Math.abs(palette[i].height - source.r.height)).toBeLessThan(
              0.1,
            );
            expect(
              Math.abs(
                palette[i].y - palette[0].y - (source.r.y - original[0].r.y),
              ),
            ).toBeLessThan(0.1);
          }
        }
        await p
          .locator('.palette-section')
          .screenshot({ path: `evidence/round4/local-palette-${width}.png` });
        for (let i = 0; i < palette.length; i++) {
          await colors.nth(i).click();
          await expect(colors.nth(i)).toHaveAttribute('aria-pressed', 'true');
          await expect(p.locator('.color-hex')).toHaveText(palette[i].color);
        }
        await colors.first().click();
        await p.locator('.copy-color').click();
        expect(await p.evaluate(() => navigator.clipboard.readText())).toBe(
          palette[0].color,
        );
        await colors.nth(4).click();
        rows.push({ kind: 'palette', width, palette });
      }
      if (!slug) {
        await expect(p.locator('.case')).toHaveCount(6);
        const cards = await p.locator('.case').evaluateAll((es) =>
          es.map((e) => {
            let d = e.querySelector('.case-divider'),
              a = e.querySelector('.case-art'),
              i = e.querySelector('.case-info');
            return {
              r: e.getBoundingClientRect().toJSON(),
              art: a.getBoundingClientRect().toJSON(),
              divider: d.getBoundingClientRect().toJSON(),
              info: i.getBoundingClientRect().toJSON(),
              labelWeight: getComputedStyle(e.querySelector('small'))
                .fontWeight,
              img: e.querySelector('img').naturalWidth,
            };
          }),
        );
        for (const c of cards) {
          expect(c.divider.height).toBeGreaterThan(1);
          expect(c.divider.y).toBeGreaterThanOrEqual(c.art.bottom);
          expect(c.info.y).toBeGreaterThanOrEqual(c.divider.bottom);
          expect(Number(c.labelWeight)).toBeGreaterThanOrEqual(600);
          expect(c.img).toBeGreaterThan(0);
          expect(c.info.bottom).toBeLessThanOrEqual(c.r.bottom + 1);
        }
        await p
          .locator('.cases-grid')
          .screenshot({ path: `evidence/round4/local-cards-${width}.png` });
        const cta = await p.locator('.more-cases').evaluate((e) => ({
          box: e.getBoundingClientRect().toJSON(),
          heading: e.querySelector('h3').getBoundingClientRect().toJSON(),
          button: e.querySelector('.button').getBoundingClientRect().toJSON(),
        }));
        if (width === 390) {
          expect(cta.heading.x - cta.box.x).toBeCloseTo(19.5, 0);
          expect(cta.button.height).toBeCloseTo(49.9, 0);
          expect(cta.button.width).toBeCloseTo(179.3, 0);
        }
        rows.push({ kind: 'cards', width, cards, cta });
      }
    }
    await p.close();
  }
} finally {
  await b.close();
  await fs.writeFile(
    'evidence/round4/checks.json',
    JSON.stringify(rows, null, 2),
  );
}
console.log(`${rows.length} component/route/width checks passed`);
