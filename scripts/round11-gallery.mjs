import fs from 'node:fs/promises';
const dir = 'evidence/round11',
  widths = [390, 479, 480, 601, 767, 768, 769, 991, 992, 1100, 1440],
  escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
let body =
  '<h1>Round11 component states</h1><p>Original left, native right. Fully loaded GET-only source. Native reduced motion. Geometry/line assertions are in checks.json; this is not an equivalence score.</p>';
for (const route of ['get-started', 'home'])
  for (const width of widths)
    for (const state of route === 'home'
      ? ['Open Source Deployment', 'Managed Cloud']
      : ['Ecosystem', 'Case studies', 'Examples']) {
      const suffix =
        route + '-' + width + '-' + state.replaceAll(' ', '-') + '.png';
      body += `<h2>${width} · ${escape(state)}</h2><div class="pair"><img loading="lazy" src="reference-${suffix}" alt="Original ${state} at ${width}"><img loading="lazy" src="local-${suffix}" alt="Native ${state} at ${width}"></div>`;
    }
await fs.writeFile(
  dir + '/states.html',
  '<!doctype html><meta charset="utf-8"><title>Round11 state comparisons</title><style>body{font:16px system-ui;margin:24px;color:#080815}h2{margin-top:48px}.pair{display:flex;align-items:start;gap:8px}.pair img{width:calc(50% - 4px);height:auto;border:1px solid #ccc}</style>' +
    body,
);
console.log('55 paired selected states');
let neighbors =
  '<h1>Learn landscape boundary and neighbors</h1><p>Original left, native right. Full traversed pages plus aligned boundary details; section/art bounds are independently asserted.</p>';
for (const width of [479, 480, 601, 767])
  neighbors += `<h2>${width}px</h2><div class="pair"><img loading="lazy" src="reference/get-started-${width}.png" alt="Original ${width}"><img loading="lazy" src="local/get-started-${width}.png" alt="Native ${width}"></div><img style="max-width:100%" loading="lazy" src="inspect-learn-boundary-${width}.png" alt="Learn/Explore boundary ${width}">`;
await fs.writeFile(
  dir + '/neighbors.html',
  '<!doctype html><meta charset="utf-8"><title>Round11 Learn neighbors</title><style>body{font:16px system-ui;margin:24px}.pair{display:flex;align-items:start;gap:8px}.pair img{width:calc(50% - 4px);height:auto;border:1px solid #ccc}</style>' +
    neighbors,
);
