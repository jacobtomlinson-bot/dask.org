import fs from 'node:fs';
const r = JSON.parse(fs.readFileSync('evidence/round11/reference.json')),
  l = JSON.parse(fs.readFileSync('evidence/round11/local.json'));
const out = [];
function compare(a, b, path, issues) {
  if (!a || !b) return;
  if (Array.isArray(a)) {
    if (path.endsWith('lines')) {
      if (JSON.stringify(a) !== JSON.stringify(b))
        issues.push(
          path + ' lines ' + JSON.stringify(b) + ' != ' + JSON.stringify(a),
        );
    } else a.forEach((x, i) => compare(x, b[i], path + '.' + i, issues));
    return;
  }
  if (typeof a === 'object') {
    for (const k of Object.keys(a)) {
      if (['ink', 'css', 'href', 'src', 'nextTop'].includes(k)) continue;
      if (['x', 'y', 'w', 'h'].includes(k)) {
        if (Math.abs(a[k] - b[k]) > 0.6)
          issues.push(
            path +
              '.' +
              k +
              ' Δ' +
              (b[k] - a[k]).toFixed(3) +
              ' (' +
              b[k] +
              '/' +
              a[k] +
              ')',
          );
      } else compare(a[k], b[k], path + '.' + k, issues);
    }
  }
}
for (const a of r) {
  const b = l.find(
    (b) => b.width === a.width && b.route === a.route && b.state === a.state,
  );
  const issues = [];
  for (const k of ['explore', 'learn', 'deployment'])
    if (a[k]) compare(a[k], b?.[k], k, issues);
  out.push({ width: a.width, state: a.state, issues });
}
fs.writeFileSync(
  'evidence/round11/differences.json',
  JSON.stringify(out, null, 2),
);
for (const x of out.filter(
  (x) =>
    [390, 601, 768, 1440].includes(x.width) &&
    ['Ecosystem', 'Open Source Deployment', 'Managed Cloud'].includes(x.state),
))
  console.log(
    x.width,
    x.state,
    '\n' +
      x.issues
        .filter(
          (x) =>
            !x.includes('section.lines') &&
            !x.includes('panel.lines') &&
            !x.includes('card.lines') &&
            !x.includes('terminal.lines') &&
            !x.includes('bar.lines') &&
            !x.includes('tabs.') &&
            !x.includes('icons.') &&
            !x.includes('connectors.'),
        )
        .join('\n'),
  );
