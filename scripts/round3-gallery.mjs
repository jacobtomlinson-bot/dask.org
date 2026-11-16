import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
// Contact sheets are inspection aids; originals remain unresized alongside them.
async function sheet(paths, output, cellWidth = 390, cellHeight = 600) {
  const out = new PNG({
    width: cellWidth * 2,
    height: cellHeight * Math.ceil(paths.length / 2),
  });
  out.data.fill(255);
  for (let i = 0; i < paths.length; i++) {
    const p = PNG.sync.read(await fs.readFile(paths[i]));
    const factor = cellWidth / p.width;
    const h = Math.min(cellHeight, Math.ceil(p.height * factor));
    for (let y = 0; y < h; y++)
      for (let x = 0; x < cellWidth; x++) {
        let a =
            (Math.min(p.height - 1, Math.floor(y / factor)) * p.width +
              Math.min(p.width - 1, Math.floor(x / factor))) *
            4,
          b =
            ((Math.floor(i / 2) * cellHeight + y) * out.width +
              (i % 2) * cellWidth +
              x) *
            4;
        p.data.copy(out.data, b, a, a + 4);
      }
  }
  await fs.writeFile(output, PNG.sync.write(out));
}
for (const width of [767, 768, 769, 991, 992]) {
  await sheet(
    [
      'workload-0',
      'workload-1',
      'workload-2',
      'workload-3',
      'deployment-0',
      'deployment-1',
      'install',
    ].flatMap((s) =>
      ['reference', 'local'].map(
        (l) => `evidence/round3/states/${s}-${width}-${l}.png`,
      ),
    ),
    `evidence/round3/states/sheet-${width}.png`,
    390,
    280,
  );
}
const routes = [
  'home',
  'get-started',
  'get-help',
  'powered-by',
  'brand-guide',
  'press-mentions',
];
for (const route of routes)
  await sheet(
    ['desktop', 'tablet', 'mobile'].flatMap((v) => [
      `evidence/reference/${route}-${v}-scrolled.png`,
      `evidence/local/${route}-${v}.png`,
    ]),
    `evidence/round3/${route}-canonical.png`,
    390,
    500,
  );
for (const route of routes) {
  const widths = [320, 390, 479, 480, 599, 600, 601, 767, 768, 991, 992, 1440];
  for (let batch = 0; batch < 3; batch++) {
    const paths = widths.slice(batch * 4, batch * 4 + 4).flatMap((w) => {
      let canonical = { 390: 'mobile', 768: 'tablet', 1440: 'desktop' }[w];
      return [
        canonical
          ? `evidence/reference/${route}-${canonical}-scrolled.png`
          : `evidence/round3/reference/${route}-${w}.png`,
        `evidence/round3/local/${route}-${w}.png`,
      ];
    });
    await sheet(
      paths,
      `evidence/round3/${route}-widths-${batch}.png`,
      300,
      400,
    );
  }
}
