import fs from 'node:fs/promises';
const dir = 'evidence/round14';
const rows = JSON.parse(
  await fs.readFile(dir + '/reference-scroll.json', 'utf8'),
);
const settled = await fs
  .readFile(dir + '/settled-reference.json', 'utf8')
  .then(JSON.parse)
  .catch(() => []);
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
let body =
  '<h1>Round14: actual scroll papers, compact controls and card tracks</h1><p>Source left, native right. Source viewport captures are independently settled350ms; native is reduced motion. Geometry and physical-hit assertions are separate from these raster comparisons. Not an exact-equivalence claim.</p><p><a href="gallery.html">18 canonical route pairs</a> · <a href="checks.json">Focused checks</a> · <a href="hits.json">Real point clicks</a> · <a href="settled-reference.json">Settled source recheck</a></p>';
for (const r of rows.filter((r) => r.capture)) {
  const source =
    settled.find(
      (x) =>
        x.width === r.width &&
        x.height === r.height &&
        x.section === r.section &&
        x.offset === r.offset &&
        x.direction === r.direction,
    )?.capture || r.capture;
  body += `<section><h2>${r.width}×${r.height}: Tone +${r.offset}</h2><div class="pair"><a href="${source.replace(dir + '/', '')}"><img loading="lazy" src="${source.replace(dir + '/', '')}" alt="Original ${r.width} Tone +${r.offset}"></a><a href="${r.capture.replace(dir + '/', '').replace('reference-', 'local-')}"><img loading="lazy" src="${r.capture.replace(dir + '/', '').replace('reference-', 'local-')}" alt="Native ${r.width} Tone +${r.offset}"></a></div></section>`;
}
for (const width of [...new Set(rows.map((r) => r.width))])
  body += `<section><h2>Use Cases — ${width}: all foreground cards, seams and actions</h2><a href="cases/pair-${width}.png"><img loading="lazy" class="cases" src="cases/pair-${width}.png" alt="Original and native Use Cases at${width}"></a></section>`;
await fs.writeFile(
  dir + '/states.html',
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>Round14 fidelity inspection</title><style>body{font:16px system-ui;margin:2rem;background:#ddd;color:#111}section{margin-block:3rem}.pair{display:flex;align-items:start;gap:1rem}.pair a{width:50%}img{display:block;width:100%;height:auto}.cases{max-width:1800px}a{color:#123e9b}</style>${body}</html>`,
);
console.log(
  rows.filter((r) => r.capture).length,
  'scroll pairs and11 foreground-card pairs',
);
