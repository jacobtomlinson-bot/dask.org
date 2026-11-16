import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
const refs = JSON.parse(
    await fs.readFile('evidence/round5/reference.json', 'utf8'),
  ),
  local = JSON.parse(await fs.readFile('evidence/round5/checks.json', 'utf8'));
for (const width of [767, 768, 769, 991, 992]) {
  const a = PNG.sync.read(
      await fs.readFile(`evidence/round5/reference-${width}.png`),
    ),
    b = PNG.sync.read(await fs.readFile(`evidence/round5/local-${width}.png`));
  const height = Math.ceil(
    Math.max(
      refs.find((r) => r.width === width).section.r.height,
      local.find((r) => r.width === width).section.r.height,
    ),
  );
  const out = new PNG({ width: width * 2, height });
  out.data.fill(255);
  PNG.bitblt(a, out, 0, 0, width, Math.min(a.height, height), 0, 0);
  PNG.bitblt(b, out, 0, 0, width, Math.min(b.height, height), width, 0);
  await fs.writeFile(`evidence/round5/pair-${width}.png`, PNG.sync.write(out));
}
await fs.writeFile(
  'evidence/round5/gallery.html',
  `<!doctype html><meta charset=utf-8><title>Round5 tablet palette</title><style>body{font:16px system-ui}img{max-width:100%;height:auto}section{margin-block:2rem}</style><h1>Original LEFT / native RIGHT</h1><p>Read-only live reference. Palette-height crops are not full-page screenshots. Sticky-rail icon offsets and fine background/bold-label differences are not claimed equivalent.</p>${[767, 768, 769, 991, 992].map((w) => `<section><h2>${w}px</h2><img src="pair-${w}.png"></section>`).join('')}<p>Full1000px reference/native viewports are adjacent files. Canonical full-page comparisons: <a href="../round4/gallery.html">six-page gallery</a>. <a href="../REVIEW.md">Review report</a>.</p>`,
);
