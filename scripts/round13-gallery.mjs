import fs from 'node:fs/promises';
const dir = 'evidence/round13';
const widths = [390, 479, 480, 601, 767, 768, 769, 991, 992, 1100, 1440],
  items = [];
for (const width of widths) {
  for (const state of ['initial', '1', '2', '3'])
    items.push({
      title: `Logos ${width} / ${state}`,
      file: `logos-${width}-${state}.png`,
    });
  items.push({
    title: `Palette ${width} / initial`,
    file: `palette-${width}-initial.png`,
  });
}
for (const width of [479, 480, 601, 767, 768])
  for (const state of ['salmon', 'white'])
    items.push({
      title: `Palette boundary ${width} / ${state}`,
      file: `palette-${width}-${state}-boundary.png`,
    });
const html =
  '<!doctype html><meta charset=utf-8><title>Round13 Brand state comparisons</title><style>body{font:16px system-ui;margin:2rem;background:#ddd}section{margin-block:3rem}h2{position:sticky;top:0;background:#ddd;padding:.5rem}figure{margin:0;display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:start}img{width:100%;height:auto;background:#fff}a{color:#183d72}</style><h1>Round13 original / native Brand states</h1><p>GET/HEAD-only source; reduced-motion captures. Both sides fixed at document scroll0 before full-page raster cropping. Coordinates/actual paint and ink are checked separately; no pixel-equivalence claim. <a href="gallery.html">All18 canonical pairs</a> · <a href="checks.json">Focused results</a></p>' +
  items
    .map(
      (i) =>
        `<section><h2>${i.title}</h2><figure><a href="reference/${i.file}"><img loading=lazy src="reference/${i.file}" alt="Original ${i.title}"></a><a href="local/${i.file}"><img loading=lazy src="local/${i.file}" alt="Native ${i.title}"></a></figure></section>`,
    )
    .join('');
await fs.writeFile(dir + '/states.html', html);
console.log(items.length, 'focused pairs');
