import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { PNG } from 'pngjs';
const dir = 'evidence/round14',
  results = [],
  maxima = {
    rail: 0,
    paper: 0,
    text: 0,
    cards: 0,
    cardChildren: 0,
    cardArt: 0,
  };
let pixels = 0,
  arrays = 0;
if (process.env.SKIP_COLLECT !== '1')
  for (const script of ['round14-probe.mjs', 'round14-hits.mjs']) {
    const { stdout } = await promisify(execFile)(
      process.execPath,
      ['scripts/' + script],
      { env: { ...process.env, CAPTURES: '1' }, maxBuffer: 4 * 1024 * 1024 },
    );
    console.log(stdout.trim());
  }
const refs = JSON.parse(
    await fs.readFile(dir + '/reference-scroll.json', 'utf8'),
  ),
  native = JSON.parse(await fs.readFile(dir + '/local-scroll.json', 'utf8'));
function check(name, fn) {
  try {
    fn();
    results.push({ name, pass: true });
  } catch (e) {
    results.push({ name, pass: false, error: e.message });
    console.error(name, e.message);
  }
}
function near(a, b, t, label, kind) {
  const delta = Math.abs(a - b);
  if (kind) maxima[kind] = Math.max(maxima[kind], delta);
  assert.ok(delta <= t, `${label}: ${a} vs ${b}, delta ${delta}`);
}
assert.equal(native.length, refs.length);
for (let i = 0; i < refs.length; i++) {
  const r = refs[i],
    n = native[i],
    name = `${r.width}/${r.height} ${r.direction} ${r.section}+${r.offset}`;
  assert.deepEqual(
    [n.width, n.height, n.direction, n.section, n.offset],
    [r.width, r.height, r.direction, r.section, r.offset],
  );
  check(
    name +
      ' R13-1 reading marker/clear state, compact control bounds and physical hit',
    () => {
      assert.deepEqual(
        n.links.filter((x) => x.current).map((x) => x.href),
        r.links.filter((x) => x.current).map((x) => x.href),
      );
      for (let j = 0; j < 4; j++) {
        const a = n.links[j],
          b = r.links[j];
        for (const k of ['x', 'w', 'h'])
          near(a[k], b[k], 0.2, `control ${j}.${k}`, 'rail');
        // Before the rail enters, normalize the small existing document-origin delta.
        const nativeY = r.section === 'initial' ? a.y - n.links[0].y : b.y;
        const sourceY = r.section === 'initial' ? b.y - r.links[0].y : a.y;
        near(
          nativeY,
          sourceY,
          r.section === 'initial' ? 0.2 : 1,
          `control ${j}.y`,
          'rail',
        );
        if (b.hit === b.href) assert.equal(a.hit, b.href);
      }
      assert.equal(n.overflow, 0);
    },
  );
  if (r.section === 'tone')
    check(
      name +
        ' R13-2 actual sticky sheet/text travel, bounded release and intrinsic dimensions',
      () => {
        assert.equal(n.paper.position, 'sticky');
        assert.equal(n.paper.top, '0px');
        for (const k of ['x', 'w', 'h'])
          near(n.paper[k], r.paper[k], 0.25, 'paper.' + k, 'paper');
        // Entry is compared relative to its own section (integer scroll rounding is
        // recorded raw); pinned paint is viewport-relative; exit is bottom-relative.
        const origin = (a) =>
          a.paper.y < 0 ? a.tone.y + a.tone.h : a.paper.y > 0 ? a.tone.y : 0;
        near(
          n.paper.y - origin(n),
          r.paper.y - origin(r),
          0.3,
          'actual paper travel',
          'paper',
        );
        for (const part of ['heading', 'intro'])
          for (const k of ['x', 'w', 'h'])
            near(n[part][k], r[part][k], 0.25, part + '.' + k, 'text');
        for (const part of ['heading', 'intro'])
          near(
            n[part].y - n.paper.y,
            r[part].y - r.paper.y,
            0.25,
            part + ' travels with paper',
            'text',
          );
        near(
          n.tone.h,
          r.tone.h,
          r.width < 480 ? 1 : 0.35,
          'intrinsic Tone section height',
        );
      },
    );
  if (r.capture && n.capture) {
    const a = PNG.sync.read(await fs.readFile(n.capture)),
      b = PNG.sync.read(await fs.readFile(r.capture));
    check(name + ' actual foreground paper and full-height rail RGB', () => {
      // Sample blank padding within the true sheet, below the horizontal rail.
      const railBottom =
        r.width < 768 ? Math.max(...r.links.map((e) => e.y + e.h)) + 4 : 0;
      const top = Math.ceil(Math.max(railBottom, Math.ceil(r.paper.y) + 4, 4)),
        bottom = Math.min(r.height - 2, Math.floor(r.paper.y + r.paper.h) - 3);
      if (top < bottom)
        for (let y = top; y < Math.min(bottom, top + 80); y += 4)
          for (
            let x = Math.ceil(r.paper.x) + 3;
            x < Math.ceil(r.paper.x) + 10;
            x += 2
          ) {
            const at = (y * r.width + x) * 4;
            assert.deepEqual(
              [...a.data.subarray(at, at + 3)],
              [...b.data.subarray(at, at + 3)],
              `actual sheet pixel ${x},${y}`,
            );
            pixels++;
          }
      if (r.width >= 768)
        for (
          let y = 20;
          y <
          Math.min(r.height, r.tone.y + r.tone.h - 4, n.tone.y + n.tone.h - 4);
          y += 29
        ) {
          const at = (y * r.width + 1) * 4;
          assert.deepEqual(
            [...a.data.subarray(at, at + 3)],
            [...b.data.subarray(at, at + 3)],
            `rail paint pixel 1,${y}`,
          );
          pixels++;
        }
    });
  }
}
const rc = JSON.parse(await fs.readFile(dir + '/reference-cases.json', 'utf8')),
  nc = JSON.parse(await fs.readFile(dir + '/local-cases.json', 'utf8'));
for (let i = 0; i < rc.length; i++) {
  const r = rc[i],
    n = nc[i],
    t = r.width < 480 ? 1 : 0.25;
  check(
    `${r.width} R13-3 every foreground card, seams, CTA row and artwork`,
    () => {
      for (const k of ['x', 'y', 'w', 'h'])
        near(n.grid[k], r.grid[k], t, 'grid.' + k, 'cards');
      assert.equal(n.cards.length, 7);
      for (let j = 0; j < 7; j++) {
        const a = n.cards[j],
          b = r.cards[j];
        for (const k of ['x', 'y', 'w', 'h'])
          near(a.box[k], b.box[k], t, `card ${j}.${k}`, 'cards');
        assert.equal(a.href, b.href);
        assert.deepEqual(a.heading, b.heading);
        arrays++;
        // Preserve each leaf's actual line array without grouping unrelated CTA
        // baselines that differ by approximately one raster pixel.
        if (a.textRuns && b.textRuns) {
          assert.deepEqual(a.textRuns, b.textRuns);
          arrays += a.textRuns.length;
        }
        for (let m = 0; m < a.children.length; m++)
          for (const k of ['x', 'y', 'w', 'h'])
            near(
              a.children[m][k],
              b.children[m][k],
              t,
              `card ${j} child ${m}.${k}`,
              'cardChildren',
            );
        for (let m = 0; m < a.art.length; m++)
          for (const k of ['x', 'y', 'w', 'h'])
            near(
              a.art[m][k],
              b.art[m][k],
              t,
              `card ${j} art ${m}.${k}`,
              'cardArt',
            );
      }
    },
  );
}
const failed = results.filter((r) => !r.pass);
await fs.writeFile(
  dir + '/checks.json',
  JSON.stringify(
    {
      passed: results.length - failed.length,
      failed: failed.length,
      maxima,
      pixels,
      arrays,
      results,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `${results.length - failed.length} round14 groups passed; ${failed.length} failed; ${pixels} actual pixels; ${arrays} exact line arrays`,
  maxima,
);
if (failed.length) process.exitCode = 1;
