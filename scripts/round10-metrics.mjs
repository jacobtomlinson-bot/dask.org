import fs from 'node:fs/promises';
const refs = JSON.parse(await fs.readFile('evidence/round10/reference.json')),
  locals = JSON.parse(await fs.readFile('evidence/round10/local.json'));
const metrics = {
  specimenCells: 0,
  organizationImages: 0,
  organizationIntro: 0,
  pressCardTracks: 0,
  closing: 0,
  nav: 0,
  cases: {},
};
const error = (a, b) =>
  Math.max(...['x', 'y', 'w', 'h'].map((k) => Math.abs(a[k] - b[k])));
for (const r of refs) {
  const l = locals.find((l) => l.slug === r.slug && l.width === r.width);
  if (r.type)
    for (let i = 0; i < 11; i++)
      for (let j = 0; j < 3; j++)
        metrics.specimenCells = Math.max(
          metrics.specimenCells,
          error(l.specimens[i].cells[j].box, r.specimens[i].cells[j].box),
          error(
            l.specimens[i].cells[j].content,
            r.specimens[i].cells[j].content,
          ),
        );
  for (const b of r.banks) {
    const a = l.banks.find((a) => a.title === b.title);
    b.images.forEach(
      (im, i) =>
        (metrics.organizationImages = Math.max(
          metrics.organizationImages,
          error(a.images[i].box, im.box),
        )),
    );
    if (b.copy)
      metrics.organizationIntro = Math.max(
        metrics.organizationIntro,
        error(a.copy, b.copy),
        error(a.copy.ink, b.copy.ink),
      );
  }
  if (r.press.length) {
    const ly = l.press[0].box.y,
      ry = r.press[0].box.y;
    for (let i = 0; i < 9; i++)
      for (const key of ['box', 'img', 'copy', 'title', 'date']) {
        const a = ['img', 'copy'].includes(key)
            ? l.press[i][key].box
            : l.press[i][key],
          b = ['img', 'copy'].includes(key)
            ? r.press[i][key].box
            : r.press[i][key];
        metrics.pressCardTracks = Math.max(
          metrics.pressCardTracks,
          error({ ...a, y: a.y - ly }, { ...b, y: b.y - ry }),
        );
      }
  }
  if (r.closing) {
    for (const k of ['title', 'body', 'action'])
      metrics.closing = Math.max(
        metrics.closing,
        error(l.closing[k].box, r.closing[k].box),
        error(l.closing[k].box.ink, r.closing[k].box.ink),
      );
    for (const k of ['text', 'image', 'action'])
      metrics.closing = Math.max(
        metrics.closing,
        error(l.note[k].box, r.note[k].box),
      );
    if (r.closing.code)
      metrics.closing = Math.max(
        metrics.closing,
        error(l.closing.code, r.closing.code),
      );
  }
  if (r.width >= 992)
    for (const name of ['Blog', 'Docs']) {
      const a = l.header.find((a) => a.text === name),
        b = r.header.find((a) => a.text === name);
      if (a && b) metrics.nav = Math.max(metrics.nav, error(a, b));
    }
  if (r.cases)
    metrics.cases[r.width] = {
      heading: error(l.cases.title, r.cases.title),
      gridX: l.cases.grid.x - r.cases.grid.x,
      gridWidth: l.cases.grid.w - r.cases.grid.w,
      gridY: l.cases.grid.y - r.cases.grid.y,
      gridHeight: l.cases.grid.h - r.cases.grid.h,
      ctaY: l.cases.more.y - r.cases.more.y,
    };
}
await fs.writeFile(
  'evidence/round10/geometry-maxima.json',
  JSON.stringify(metrics, null, 2),
);
console.log(metrics);
