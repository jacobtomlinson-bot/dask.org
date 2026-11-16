import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const dir = 'evidence/round12',
  results = [],
  errors = [],
  maxima = { deeper: 0, workload: 0, palette: 0, logoGuidance: 0 };
let arrays = 0,
  images = 0;
if (process.env.SKIP_COLLECT !== '1')
  for (const script of [
    'round12-probe.mjs',
    'round12-interactions.mjs',
    'round12-paint.mjs',
  ])
    await promisify(execFile)(process.execPath, ['scripts/' + script], {
      env: { ...process.env },
      maxBuffer: 4 * 1024 * 1024,
    });
const reference = JSON.parse(
    await fs.readFile(`${dir}/reference.json`, 'utf8'),
  ),
  local = JSON.parse(await fs.readFile(`${dir}/local.json`, 'utf8')),
  assets = JSON.parse(await fs.readFile('src/data/assets.json', 'utf8'));
function check(name, fn) {
  try {
    fn();
    results.push({ name, pass: true });
  } catch (e) {
    errors.push(name);
    results.push({ name, pass: false, error: String(e) });
    console.error(name, e.message);
  }
}
function box(a, b, label, owner, tol = 0.35) {
  for (const k of ['x', 'y', 'w', 'h']) {
    const d = Math.abs(a[k] - b[k]);
    maxima[owner] = Math.max(maxima[owner], d);
    assert.ok(d <= tol, `${label}.${k}: ${b[k]} vs ${a[k]} delta ${d}`);
  }
}
function text(a, b, label) {
  assert.deepEqual(b.lines, a.lines, label + ' exact line arrays');
  arrays++;
  for (const k of ['fontSize', 'lineHeight'])
    assert.ok(
      Math.abs(parseFloat(a.css[k]) - parseFloat(b.css[k])) < 0.02,
      label + ' ' + k,
    );
  assert.equal(b.css.fontWeight, a.css.fontWeight, label + ' actual weight');
}
for (const r of reference) {
  const n = local.find(
      (n) => n.width === r.width && n.route === r.route && n.state === r.state,
    ),
    key = `${r.route}/${r.width}/${r.state}`;
  assert.ok(n, key);
  if (r.route === 'get-started') {
    check(
      key +
        ' R11-2 upper/band intrinsic extents, copy, artwork and five resource tracks',
      () => {
        for (const k of ['upper', 'band', 'heading', 'body', 'art'])
          box(r[k], n[k], k, 'deeper');
        text(r.heading, n.heading, 'heading');
        text(r.body, n.body, 'body');
        assert.equal(n.links.length, 5);
        for (let i = 0; i < 5; i++) {
          box(r.links[i], n.links[i], `link${i}`, 'deeper');
          text(r.links[i], n.links[i], `link${i}`);
          assert.equal(n.links[i].href, r.links[i].href);
        }
      },
    );
  }
  if (r.route === 'brand-guide') {
    check(
      key +
        ' R11-3 guidance actual track, exact wrapping and tablet logo guidance',
      () => {
        box(r.body, n.body, 'palette intro', 'palette', 0.4);
        text(r.body, n.body, 'palette intro');
        if (r.width >= 768 && r.width <= 991) {
          box(r.logoBody, n.logoBody, 'logo guidance', 'logoGuidance', 0.8);
          text(r.logoBody, n.logoBody, 'logo guidance');
        }
      },
    );
    check(
      key + ' R11-3 each actual swatch track by identity (not DOM sorting)',
      () => {
        assert.equal(n.cells.length, 12);
        for (const cell of r.cells) {
          const hex = cell.lines[0],
            other = n.cells.find((c) => c.lines[0] === hex);
          assert.ok(other, hex);
          box(cell, other, hex, 'palette', 0.5);
        }
      },
    );
  }
  if (r.route === 'home') {
    check(
      key + ' lower inventory: actual terminal viewport, dots and source text',
      () => {
        for (const slot of ['terminal', 'window', 'code'])
          box(r[slot], n[slot], slot, 'workload', 0.4);
        for (let i = 0; i < 3; i++)
          box(r.dots[i], n.dots[i], 'dot' + i, 'workload', 0.4);
        text(r.code, n.code, 'terminal source');
      },
    );
    check(
      key +
        ' R11-4 heading/body and both action fonts, exact lines and targets',
      () => {
        assert.deepEqual(n.tabs, r.tabs);
        text(r.heading, n.heading, 'heading');
        box(r.heading.ink, n.heading.ink, 'heading ink', 'workload', 0.8);
        text(r.body, n.body, 'body');
        box(r.body, n.body, 'body', 'workload', 0.4);
        assert.equal(n.actions.length, r.actions.length);
        for (let i = 0; i < r.actions.length; i++) {
          text(r.actions[i], n.actions[i], `action${i}`);
          box(r.actions[i], n.actions[i], `action${i}`, 'workload', 1.1);
          assert.equal(n.actions[i].href, r.actions[i].href);
        }
      },
    );
    check(
      key +
        ' R11-4 all actual artwork source identities and intrinsic logo tracks',
      () => {
        assert.equal(n.logos.length, r.logos.length);
        for (let i = 0; i < r.logos.length; i++) {
          const entry = assets.find((a) => a.path === n.logos[i].src);
          assert.ok(entry, n.logos[i].src);
          assert.equal(
            decodeURI(entry.url),
            decodeURI(r.logos[i].src),
            'full original URL including identity hash',
          );
          box(r.logos[i], n.logos[i], `logo${i}`, 'workload', 0.85);
          assert.equal(n.logos[i].css.filter, r.logos[i].css.filter);
          assert.equal(n.logos[i].css.opacity, r.logos[i].css.opacity);
          images++;
        }
      },
    );
  }
}
const paint = JSON.parse(await fs.readFile(`${dir}/deeper-paint.json`, 'utf8'));
assert.equal(paint.length, 11, 'all eleven fresh paint cases required');
for (const row of paint)
  check(
    `get-started/${row.width} R11-2 actual painted bands and illustration bounds`,
    () => {
      for (const k of ['x', 'y', 'w', 'h'])
        assert.ok(Math.abs(row.source[k] - row.native[k]) <= 1.5);
    },
  );
const interactions = JSON.parse(
  await fs.readFile(`${dir}/interactions.json`, 'utf8'),
);
for (const r of interactions.results.filter((r) => 'pass' in r))
  check(r.name, () => assert.equal(r.pass, true, r.error));
await fs.writeFile(
  `${dir}/checks.json`,
  JSON.stringify(
    {
      passed: results.length - errors.length,
      failed: errors.length,
      arrays,
      images,
      maxima,
      results,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `${results.length - errors.length} round12 groups passed, ${errors.length} failed; ${arrays} exact text arrays, ${images} identity-checked images`,
  maxima,
);
if (errors.length) process.exitCode = 1;
