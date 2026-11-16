import fs from 'node:fs/promises';
const dir = 'evidence/round12',
  rows = JSON.parse(await fs.readFile(`${dir}/reference.json`, 'utf8'));
let body =
  '<h1>Round12 focused comparisons</h1><p>Original left, native right. GET/HEAD-only original. Source component boxes and copy are measured separately; native motion uses reduced-motion representative states. This is not an equivalence score.</p>';
for (const r of rows) {
  const suffix = `${r.route}-${r.width}-${r.state.replaceAll(' ', '-')}.png`;
  body += `<h2>${r.route} · ${r.width} · ${r.state}</h2><div class="pair"><img loading="lazy" src="reference-${suffix}" alt="Original"><img loading="lazy" src="local-${suffix}" alt="Native"></div>`;
}
await fs.writeFile(
  `${dir}/states.html`,
  '<!doctype html><meta charset="utf-8"><title>Round12 component comparisons</title><style>body{font:16px system-ui;margin:24px;color:#080815}h2{margin-top:48px}.pair{display:flex;gap:12px;align-items:start}.pair img{width:calc(50% - 6px);height:auto;border:1px solid #ddd}</style>' +
    body,
);
console.log(rows.length, 'focused pairs');
