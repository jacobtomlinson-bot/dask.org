import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { PNG } from 'pngjs';
const dir = 'evidence/round13',
  results = [],
  maxima = {
    hero: 0,
    palette: 0,
    showcase: 0,
    canvases: 0,
    neighbors: 0,
    artworkInk: 0,
  };
let arrays = 0,
  images = 0,
  pixels = 0;
if (process.env.SKIP_COLLECT !== '1') {
  for (const script of [
    'round13-probe.mjs',
    'round13-interactions.mjs',
    'round13-guidance.mjs',
  ])
    await promisify(execFile)(process.execPath, ['scripts/' + script], {
      env: { ...process.env, CAPTURES: '1' },
      maxBuffer: 8 * 1024 * 1024,
    });
}
const ref = JSON.parse(await fs.readFile(dir + '/reference.json', 'utf8')),
  native = JSON.parse(await fs.readFile(dir + '/local.json', 'utf8')),
  assets = JSON.parse(await fs.readFile('src/data/assets.json', 'utf8'));
function check(name, fn) {
  try {
    fn();
    results.push({ name, pass: true });
  } catch (e) {
    results.push({ name, pass: false, error: e.message });
    console.error(name, e.message);
  }
}
function box(a, b, label, owner, tol = 0.2) {
  for (const k of ['x', 'y', 'w', 'h']) {
    const delta = Math.abs(a[k] - b[k]);
    maxima[owner] = Math.max(maxima[owner], delta);
    assert.ok(delta <= tol, `${label}.${k}: ${b[k]} vs ${a[k]} delta ${delta}`);
  }
}
function type(a, b, label) {
  assert.deepEqual(b.lines, a.lines, label + ' exact line array');
  arrays++;
  assert.equal(b.css.fontWeight, a.css.fontWeight, label + ' font weight');
  for (const k of ['fontSize', 'lineHeight'])
    assert.ok(
      Math.abs(parseFloat(a.css[k]) - parseFloat(b.css[k])) < 0.025,
      label + ' ' + k,
    );
}
const selectedHex = (row) =>
  row.palette.cells.find((c) => c.css.color === 'rgba(0, 0, 0, 0)')?.text;
for (const r of ref) {
  const n = r.state.startsWith('color-')
    ? native.find(
        (n) =>
          n.width === r.width &&
          n.state.startsWith('color-') &&
          selectedHex(n) === selectedHex(r),
      )
    : native.find((n) => n.width === r.width && n.state === r.state);
  assert.ok(n, `${r.width}/${r.state} exists`);
  const key = r.width + '/' + r.state,
    land = r.width >= 480 && r.width <= 767,
    tablet = r.width >= 768 && r.width <= 991;
  if (r.state === 'initial') {
    check(
      key +
        ' R12-2 Brand hero bottom and text tracks, without shared Hero changes',
      () => {
        assert.equal(n.overflow, false);
        if (land) {
          box(r.hero, n.hero, 'hero', 'hero', 0.04);
          for (let i = 0; i < r.heroCopy.length; i++) {
            box(r.heroCopy[i], n.heroCopy[i], 'hero copy' + i, 'hero', 0.15);
            type(r.heroCopy[i], n.heroCopy[i], 'hero copy' + i);
          }
        } else
          assert.ok(
            Math.abs(n.hero.h - r.hero.h) <= 1.2,
            'accepted portrait/tablet/desktop hero retained',
          );
      },
    );
  }
  if (r.state === 'initial' || r.state.startsWith('logo-')) {
    check(
      key +
        ' R12-3 both actual image identities, ink tracks, captions and four alternative controls',
      () => {
        const tol = 0.25;
        assert.equal(n.images.length, 2);
        for (let i = 0; i < 2; i++) {
          box(r.images[i], n.images[i], 'image' + i, 'showcase', tol);
          const asset = assets.find((a) => a.path === n.images[i].src);
          assert.ok(asset, 'local artwork provenance');
          assert.equal(
            decodeURI(asset.url),
            decodeURI(r.images[i].src),
            'exact original artwork identity',
          );
          images++;
        }
        for (let i = 0; i < 3; i++) {
          box(
            r.captions[i].ink,
            n.captions[i].ink,
            'caption ink' + i,
            'showcase',
            tol,
          );
          type(r.captions[i], n.captions[i], 'caption' + i);
        }
        for (let i = 0; i < 4; i++) {
          box(r.controls[i], n.controls[i], 'control' + i, 'showcase', 0.25);
          assert.equal(
            n.controls[i].css.backgroundColor,
            r.controls[i].css.backgroundColor,
          );
          if (r.controls[i].css.border.startsWith('1px'))
            assert.equal(
              n.controls[i].css.border,
              r.controls[i].css.border,
              'actual selected border, including White on Black',
            );
          assert.equal(
            n.controls[i].css.outline.includes('solid'),
            false,
            'no invented outer selection outline',
          );
        }
        {
          const sourceFlow =
            r.palette.sectionAbsolute.y - r.logosHeadingDocumentY;
          const nativeFlow =
            n.palette.sectionAbsolute.y - n.logosHeadingDocumentY;
          assert.ok(
            Math.abs(sourceFlow - nativeFlow) <= 0.25,
            `natural Logos→Colors flow: ${nativeFlow} vs ${sourceFlow}`,
          );
          assert.equal(n.canvases.length, 3);
          for (let i = 0; i < 3; i++) {
            box(r.canvases[i], n.canvases[i], 'canvas' + i, 'canvases', 0.4);
            assert.equal(
              n.canvases[i].css.backgroundColor,
              r.canvases[i].css.backgroundColor,
              'actual state canvas paper',
            );
          }
        }
      },
    );
  }
  if (r.state.startsWith('color-') || r.state === 'salmon-restored') {
    check(
      key +
        ' R12-1 all twelve matrix positions and Typography boundary remain invariant through selection',
      () => {
        const initial = ref.find(
          (x) => x.width === r.width && x.state === 'initial',
        );
        for (const cell of r.palette.cells) {
          const c = n.palette.cells.find((x) => x.text === cell.text);
          box(cell, c, cell.text, 'palette', 0.5);
          const old = initial.palette.cells.find((x) => x.text === cell.text);
          if (r.width < 768)
            box(old, c, cell.text + ' invariant', 'palette', 0.5);
        }
        assert.ok(
          Math.abs(n.palette.next.y - r.palette.next.y) <= 0.5,
          'source Colors→Typography boundary',
        );
        const baseline = native.find(
          (x) => x.width === n.width && x.state === 'initial',
        );
        assert.equal(
          n.palette.next.y,
          baseline.palette.next.y,
          'native selected-state section boundary invariant',
        );
        const action = n.palette.body.at(-1);
        const bottom = action.y + action.h;
        assert.ok(
          r.width >= 768 ||
            bottom <= Math.min(...n.palette.cells.map((c) => c.y)) + 0.1,
          'contrast/action ink is not clipped or covered by swatches',
        );
        assert.equal(n.overflow, false);
      },
    );
  }
}
function artworkInk(image, data, index, bg) {
  const frame = data.images[index],
    top = frame.y - data.logos.y;
  let left = Infinity,
    right = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (
    let y = Math.max(0, Math.floor(top));
    y < Math.min(image.height, Math.ceil(top + frame.h));
    y++
  )
    for (
      let x = Math.max(0, Math.floor(frame.x));
      x < Math.min(image.width, Math.ceil(frame.x + frame.w));
      x++
    ) {
      const k = (y * image.width + x) * 4;
      if (
        bg.reduce((sum, c, j) => sum + Math.abs(c - image.data[k + j]), 0) > 180
      ) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  assert.ok(Number.isFinite(left), 'actual foreground artwork pixels present');
  return {
    x: left,
    y: minY + data.logos.y,
    w: right - left + 1,
    h: maxY - minY + 1,
  };
}
// Real pixels from the common-scroll, fully traversed source/native captures.
for (const width of [...new Set(ref.map((r) => r.width))])
  for (const state of ['initial', 'logo-1', 'logo-2', 'logo-3']) {
    const r = ref.find((r) => r.width === width && r.state === state),
      n = native.find((r) => r.width === width && r.state === state);
    const suffix = state === 'initial' ? 'initial' : state.slice(-1);
    let source, local;
    try {
      source = PNG.sync.read(
        await fs.readFile(`${dir}/reference/logos-${width}-${suffix}.png`),
      );
      local = PNG.sync.read(
        await fs.readFile(`${dir}/local/logos-${width}-${suffix}.png`),
      );
    } catch {
      continue;
    }
    check(`${width}/${state} actual canvas and guidance paper pixels`, () => {
      for (let i = 0; i < 3; i++) {
        const rgb = r.canvases[i].css.backgroundColor
          .match(/\d+/g)
          .slice(0, 3)
          .map(Number);
        for (const [img, data] of [
          [source, r],
          [local, n],
        ]) {
          const c = data.canvases[i],
            y = c.y - data.logos.y;
          for (const [x, z] of [
            [c.x + 4, y + 4],
            [c.x + c.w - 5, y + 4],
            [c.x + 4, y + c.h - 5],
            [c.x + c.w - 5, y + c.h - 5],
          ]) {
            const idx = (Math.floor(z) * img.width + Math.floor(x)) * 4;
            assert.deepEqual(
              [...img.data.slice(idx, idx + 3)],
              rgb,
              'solid state paper, not computed color only',
            );
            pixels++;
          }
        }
      }
      const background = r.canvases[0].css.backgroundColor
        .match(/\d+/g)
        .slice(0, 3)
        .map(Number);
      for (let i = 0; i < 2; i++)
        box(
          artworkInk(source, r, i, background),
          artworkInk(local, n, i, background),
          'actual vector ink' + i,
          'artworkInk',
          width < 480 ? 2.5 : 1.5,
        );
      const expected = r.controls[
        state === 'initial' ? 0 : Number(state.slice(-1))
      ].css.backgroundColor
        .match(/\d+/g)
        .slice(0, 3)
        .map(Number);
      for (const [img, data] of [
        [source, r],
        [local, n],
      ]) {
        const g = data.guidance[0],
          x = g.x + 5,
          y = g.y - data.logos.y + g.h + 4,
          idx = (Math.floor(y) * img.width + Math.floor(x)) * 4;
        assert.deepEqual(
          [...img.data.slice(idx, idx + 3)],
          expected,
          'guidance surface changes with selection (no white-on-white copy)',
        );
        pixels++;
      }
    });
  }
const interactions = JSON.parse(
  await fs.readFile(dir + '/interactions.json', 'utf8'),
);
for (const result of interactions.results)
  check(result.name, () => assert.equal(result.pass, true, result.error));
assert.equal(
  interactions.paints,
  780,
  'all twelve real colors after each selection and restored Salmon at five widths',
);
const guidance = JSON.parse(
  await fs.readFile(dir + '/guidance-scroll.json', 'utf8'),
);
assert.equal(
  guidance.results.length,
  84,
  'all six sticky tiers, two colors and seven viewport positions required',
);
for (const row of guidance.results)
  check(row.name, () => assert.equal(row.pass, true, row.error));
const failures = results.filter((r) => !r.pass);
await fs.writeFile(
  dir + '/checks.json',
  JSON.stringify(
    {
      passed: results.length - failures.length,
      failed: failures.length,
      arrays,
      images,
      pixels,
      maxima,
      results,
    },
    null,
    2,
  ),
);
console.log(
  `${results.length - failures.length} round13 groups passed; ${failures.length} failed; ${arrays} exact caption/hero line arrays, ${images} exact artwork identities, ${pixels} actual paper pixels`,
  maxima,
);
if (failures.length) process.exitCode = 1;
