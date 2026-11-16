import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
const dir = 'evidence/round6';
const captures = JSON.parse(await fs.readFile(`${dir}/capture.json`, 'utf8'));
await fs.mkdir(`${dir}/diff`, { recursive: true });
const rows = [];
for (const width of [390, 768, 1440])
  for (const slug of [
    'home',
    'get-started',
    'get-help',
    'powered-by',
    'brand-guide',
    'press-mentions',
  ]) {
    const a = PNG.sync.read(
      await fs.readFile(`${dir}/reference/${slug}-${width}.png`),
    );
    const b = PNG.sync.read(
      await fs.readFile(`${dir}/local/${slug}-${width}.png`),
    );
    const h = Math.max(a.height, b.height),
      w = width;
    const pad = (p) => {
      const o = new PNG({ width: w, height: h });
      o.data.fill(255);
      PNG.bitblt(p, o, 0, 0, p.width, p.height, 0, 0);
      return o;
    };
    const aa = pad(a),
      bb = pad(b),
      diff = new PNG({ width: w, height: h });
    const pixels = pixelmatch(aa.data, bb.data, diff.data, w, h, {
      threshold: 0.1,
    });
    await fs.writeFile(
      `${dir}/diff/${slug}-${width}.png`,
      PNG.sync.write(diff),
    );
    rows.push({
      slug,
      width,
      referenceHeight: a.height,
      nativeHeight: b.height,
      heightDelta: b.height - a.height,
      differentPixels: pixels,
      differencePercent: Number(((100 * pixels) / w / h).toFixed(3)),
      method:
        'pixelmatch threshold 0.1, antialias excluded; shorter image padded white. Source normal motion versus native reduced motion; not phase synchronized.',
    });
    const pair = new PNG({ width: w * 2, height: h });
    pair.data.fill(255);
    PNG.bitblt(a, pair, 0, 0, w, a.height, 0, 0);
    PNG.bitblt(b, pair, 0, 0, w, b.height, w, 0);
    await fs.writeFile(
      `${dir}/pair-${slug}-${width}.png`,
      PNG.sync.write(pair),
    );
  }
await fs.writeFile(
  `${dir}/comparison.json`,
  JSON.stringify(rows, null, 2) + '\n',
);
const sections = [
  ['home', 'quotes', 'What users say about Dask', 'testimonials'],
  ['home', 'cases', 'Use Cases', 'use-cases'],
  ['brand-guide', 'tone', 'Tone', 'brand-tone'],
  ['press-mentions', 'press', 'Add a press mention', 'press-section'],
];
for (const width of [390, 768, 1440])
  for (const [slug, name, text, cls] of sections) {
    const imgs = [];
    for (const label of ['reference', 'local']) {
      const row = captures.find(
        (r) => r.label === label && r.width === width && r.slug === slug,
      );
      const s = row.sections.find((s) =>
        label === 'reference'
          ? s.text.startsWith(text)
          : s.cls.split(' ').includes(cls),
      );
      const p = PNG.sync.read(
        await fs.readFile(`${dir}/${label}/${slug}-${width}.png`),
      );
      if (!s) throw Error(`${label} ${slug} ${name}`);
      const y = Math.round(s.r.y),
        height = Math.min(1000, p.height - y),
        out = new PNG({ width, height });
      PNG.bitblt(p, out, 0, y, width, height, 0, 0);
      imgs.push(out);
    }
    const out = new PNG({
      width: width * 2,
      height: Math.max(...imgs.map((i) => i.height)),
    });
    out.data.fill(255);
    imgs.forEach((p, i) =>
      PNG.bitblt(p, out, 0, 0, width, p.height, i * width, 0),
    );
    await fs.writeFile(
      `${dir}/detail-${name}-${width}.png`,
      PNG.sync.write(out),
    );
  }
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Round 6 source/native visual pairs</title><style>body{font:16px system-ui;margin:2rem;background:#ddd}img{max-width:100%;vertical-align:top}details{background:white;margin:1rem 0;padding:1rem}summary{cursor:pointer}a{color:#124}</style><h1>Round 6 — original left / native right</h1><p>All eighteen page pairs fully traversed. Click a pair for its full-resolution file. Source and native motion are not synchronized. Differences are not an accuracy score.</p>${rows.map((r) => `<details><summary>${r.slug} · ${r.width}px · source ${r.referenceHeight}px / native ${r.nativeHeight}px · Δ${r.heightDelta}px · differing pixels ${r.differencePercent}%</summary><p><a href="diff/${r.slug}-${r.width}.png">Pixel diff</a></p><a href="pair-${r.slug}-${r.width}.png"><img loading="lazy" src="pair-${r.slug}-${r.width}.png" alt="${r.slug} ${r.width}px original left native right"></a></details>`).join('')}`;
await fs.writeFile(`${dir}/gallery.html`, html);
console.log(
  rows
    .map(
      (r) =>
        `${r.slug} ${r.width}: height delta ${r.heightDelta}px; pixel difference ${r.differencePercent}%`,
    )
    .join('\n'),
);
