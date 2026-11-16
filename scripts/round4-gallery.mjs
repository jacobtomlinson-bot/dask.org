import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
async function pair(a, b, path, width = 390, start = 0, height) {
  const imgs = await Promise.all(
    [a, b].map(async (p) => PNG.sync.read(await fs.readFile(p))),
  );
  const scaledHeight = Math.max(
    ...imgs.map((p) => Math.ceil((p.height * width) / p.width)),
  );
  height ??= scaledHeight - start;
  const out = new PNG({ width: width * 2, height });
  out.data.fill(255);
  for (let side = 0; side < 2; side++) {
    let p = imgs[side],
      factor = p.width / width;
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        let sy = Math.floor((y + start) * factor),
          sx = Math.floor(x * factor);
        if (sy >= p.height) continue;
        let i = (sy * p.width + sx) * 4,
          o = (y * out.width + x + side * width) * 4;
        p.data.copy(out.data, o, i, i + 4);
      }
  }
  await fs.writeFile(path, PNG.sync.write(out));
}
for (let w of [390, 479, 480, 601, 767, 768, 1440]) {
  await pair(
    `evidence/round4/reference-cards-${w}.png`,
    `evidence/round4/local-cards-${w}.png`,
    `evidence/round4/cards-pair-${w}.png`,
    w === 390 ? 330 : 390,
  );
  await pair(
    `evidence/round4/reference-footer-${w}.png`,
    `evidence/round4/local-footer-home-${w}.png`,
    `evidence/round4/footer-pair-${w}.png`,
  );
}
await pair(
  'evidence/round4/reference-cards-390.png',
  'evidence/round4/local-cards-390.png',
  'evidence/round4/cards-phone-upper.png',
  330,
  0,
  1250,
);
await pair(
  'evidence/round4/reference-cards-390.png',
  'evidence/round4/local-cards-390.png',
  'evidence/round4/cards-phone-lower.png',
  330,
  1250,
);
for (const route of [
  'home',
  'get-started',
  'get-help',
  'powered-by',
  'brand-guide',
  'press-mentions',
])
  for (const view of ['desktop', 'tablet', 'mobile']) {
    await pair(
      `evidence/reference/${route}-${view}-scrolled.png`,
      `evidence/local/${route}-${view}.png`,
      `evidence/round4/${route}-${view}-full.png`,
      240,
    );
  }
await fs.writeFile(
  'evidence/round4/gallery.html',
  `<!doctype html><meta charset="utf-8"><title>Round 4 comparison evidence</title><style>body{font:16px system-ui;background:#eee}img{max-width:100%;height:auto;display:block}details{background:white;padding:1rem;margin:1rem}</style><h1>Original LEFT / native RIGHT</h1><p>Read-only live component references; canonical full-page references cached after traversal. Pixels and animation phases are not equivalence proof.</p>${['cards', 'footer'].flatMap((k) => [390, 479, 480, 601, 767, 768, 1440].map((w) => `<details><summary>${k} ${w}px</summary><img src="${k}-pair-${w}.png"></details>`)).join('')}${['home', 'get-started', 'get-help', 'powered-by', 'brand-guide', 'press-mentions'].flatMap((s) => ['desktop', 'tablet', 'mobile'].map((v) => `<details><summary>${s} ${v}</summary><img src="${s}-${v}-full.png"></details>`)).join('')}`,
);
for (const route of [
  'home',
  'get-started',
  'get-help',
  'powered-by',
  'brand-guide',
  'press-mentions',
]) {
  const out = new PNG({ width: 780, height: 1800 });
  out.data.fill(255);
  for (const [row, view] of ['desktop', 'tablet', 'mobile'].entries()) {
    const paths = [
      `evidence/reference/${route}-${view}-scrolled.png`,
      `evidence/local/${route}-${view}.png`,
    ];
    for (let side = 0; side < 2; side++) {
      const p = PNG.sync.read(await fs.readFile(paths[side]));
      const factor = p.width / 390;
      for (let y = 0; y < 600; y++)
        for (let x = 0; x < 390; x++) {
          const sx = Math.floor(x * factor),
            sy =
              y < 300
                ? Math.floor(y * factor)
                : Math.max(0, p.height - Math.floor((600 - y) * factor));
          const a = (Math.min(p.height - 1, sy) * p.width + sx) * 4,
            b = ((row * 600 + y) * 780 + side * 390 + x) * 4;
          p.data.copy(out.data, b, a, a + 4);
        }
    }
  }
  await fs.writeFile(
    `evidence/round4/${route}-chrome-inspection.png`,
    PNG.sync.write(out),
  );
}
