import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
const dir = 'evidence/round7';
const rows = JSON.parse(await fs.readFile(`${dir}/checks.json`, 'utf8'));
for (const row of rows) {
  const { width } = row,
    a = PNG.sync.read(await fs.readFile(`${dir}/reference/tone-${width}.png`)),
    b = PNG.sync.read(await fs.readFile(`${dir}/local/tone-${width}.png`));
  const height = Math.max(a.height, b.height),
    pair = new PNG({ width: width * 2, height });
  pair.data.fill(255);
  PNG.bitblt(a, pair, 0, 0, a.width, a.height, 0, 0);
  PNG.bitblt(b, pair, 0, 0, b.width, b.height, width, 0);
  await fs.writeFile(`${dir}/pair-tone-${width}.png`, PNG.sync.write(pair));
  const pad = (p) => {
    let o = new PNG({ width, height });
    o.data.fill(255);
    PNG.bitblt(p, o, 0, 0, p.width, p.height, 0, 0);
    return o;
  };
  let aa = pad(a),
    bb = pad(b);
  row.pixelDifferencePercent =
    (100 *
      pixelmatch(aa.data, bb.data, null, width, height, { threshold: 0.1 })) /
    width /
    height;
}
await fs.writeFile(
  `${dir}/comparison.json`,
  JSON.stringify(
    rows.map(
      ({
        width,
        maxParagraphError,
        maxColumnError,
        pixelDifferencePercent,
      }) => ({
        width,
        maxParagraphError,
        maxColumnError,
        pixelDifferencePercent,
      }),
    ),
    null,
    2,
  ) + '\n',
);
await fs.writeFile(
  `${dir}/gallery.html`,
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>Round7 tone composition pairs</title><style>body{font:16px system-ui;background:#ddd;margin:2rem}details{background:white;padding:1rem;margin:1rem 0}img{max-width:100%}</style><h1>R6-1: Original left / native right</h1><p>Viewport-wide crops at each section's start. Measured x is viewport-relative; y is section-relative. Nine paragraphs and both text-content columns are compared, not merely section height.</p>${rows.map((r) => `<details><summary>${r.width}px — largest paragraph error ${r.maxParagraphError}px; column error ${r.maxColumnError}px; differing pixels ${r.pixelDifferencePercent.toFixed(3)}%</summary><a href="pair-tone-${r.width}.png"><img src="pair-tone-${r.width}.png" loading="lazy" alt="Tone original left native right at ${r.width}px"></a></details>`).join('')}<p>Pixelmatch threshold0.1, antialias excluded, shorter crop padded white. Pixel difference is not a fidelity score; paint layers, sticky rail and rasterization contribute independently of text geometry.</p>`,
);
console.log(
  rows
    .map(
      (r) =>
        `${r.width}: paragraph ${r.maxParagraphError}px / columns ${r.maxColumnError}px / diff ${r.pixelDifferencePercent.toFixed(3)}%`,
    )
    .join('\n'),
);
