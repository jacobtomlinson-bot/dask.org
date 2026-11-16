import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
const dir = 'evidence/round10',
  capture = JSON.parse(await fs.readFile(`${dir}/capture.json`)),
  measurements = JSON.parse(await fs.readFile(`${dir}/reference.json`)),
  local = JSON.parse(await fs.readFile(`${dir}/local.json`));
const pairs = [];
async function pair(name, width, slug, original, native, height) {
  const a = PNG.sync.read(
      await fs.readFile(`${dir}/reference/${slug}-${width}.png`),
    ),
    b = PNG.sync.read(await fs.readFile(`${dir}/local/${slug}-${width}.png`));
  height = Math.ceil(height);
  const out = new PNG({ width: width * 2, height });
  out.data.fill(255);
  for (const [image, left, top] of [
    [a, 0, Math.floor(original)],
    [b, width, Math.floor(native)],
  ])
    PNG.bitblt(
      image,
      out,
      0,
      Math.max(0, top),
      width,
      Math.min(height, image.height - Math.max(0, top)),
      left,
      0,
    );
  await fs.writeFile(`${dir}/detail-${name}-${width}.png`, PNG.sync.write(out));
  pairs.push({ name, width, path: `detail-${name}-${width}.png` });
}
for (const width of [390, 768, 1440])
  for (const slug of ['brand-guide', 'powered-by', 'home', 'press-mentions']) {
    const r = capture.find(
        (x) => x.label === 'reference' && x.width === width && x.slug === slug,
      ),
      l = capture.find(
        (x) => x.label === 'local' && x.width === width && x.slug === slug,
      );
    const find = (row, text) => row.text.find((x) => x.text.startsWith(text));
    const sections =
      slug === 'brand-guide'
        ? [['specimens', 'Typography']]
        : slug === 'powered-by'
          ? [
              ['companies', 'Companies'],
              ['projects', 'Projects Powered'],
            ]
          : slug === 'home'
            ? [
                ['organizations', 'Organizations That'],
                ['closing', 'Super easy'],
                ['note', 'Most people'],
              ]
            : [['press', 'Using AI']];
    for (const [name, text] of sections) {
      const a = find(r, text),
        b = find(l, text);
      if (a && b)
        await pair(
          name,
          width,
          slug,
          Math.max(0, a.r.y - 30),
          Math.max(0, b.r.y - 30),
          name === 'specimens'
            ? Math.min(width * 0.8 + 350, 1100)
            : name === 'companies' || name === 'projects'
              ? 1000
              : name === 'organizations'
                ? Math.min(850, width * 0.5 + 450)
                : name === 'closing'
                  ? Math.min(700, width * 0.4 + 320)
                  : 700,
        );
    }
  }
await fs.writeFile(
  `${dir}/details.html`,
  `<!doctype html><meta charset="utf-8"><title>Round10 aligned components</title><style>body{font:16px system-ui;background:#ddd}img{max-width:100%;display:block}section{margin:40px 0}</style><h1>Original left / Native right — component aligned, not rescaled</h1>${pairs.map((p) => `<section><h2>${p.name} ${p.width}</h2><a href="${p.path}"><img src="${p.path}"></a></section>`).join('')}`,
);
console.log(pairs.length, 'aligned component pairs');
const neighbors = [];
for (const [slug, widths] of [
  ['home', [480, 601, 767]],
  ['press-mentions', [767, 991, 992, 1100]],
])
  for (const width of widths) {
    const a = capture.find(
        (r) => r.label === 'reference' && r.width === width && r.slug === slug,
      ),
      b = capture.find(
        (r) => r.label === 'local' && r.width === width && r.slug === slug,
      );
    await pair(
      `neighbor-${slug}`,
      width,
      slug,
      0,
      0,
      Math.max(a.height, b.height),
    );
    neighbors.push(pairs.at(-1));
  }
await fs.writeFile(
  `${dir}/neighbors.html`,
  `<!doctype html><meta charset="utf-8"><title>Breakpoint pairs</title><style>body{font:16px system-ui}img{max-width:100%;display:block}</style><h1>Breakpoint originals left / native right</h1>${neighbors.map((p) => `<section><h2>${p.name} ${p.width}</h2><a href="${p.path}"><img src="${p.path}"></a></section>`).join('')}`,
);
for (const width of [480, 601, 767]) {
  const a = capture.find(
      (r) => r.label === 'reference' && r.width === width && r.slug === 'home',
    ),
    b = capture.find(
      (r) => r.label === 'local' && r.width === width && r.slug === 'home',
    );
  const ta = a.text.find((e) => e.text === 'Use Cases'),
    tb = b.text.find((e) => e.text === 'Use Cases');
  await pair(
    'cases',
    width,
    'home',
    ta.r.y - 30,
    tb.r.y - 30,
    Math.min(1500, width * 1.65),
  );
}
