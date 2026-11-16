import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
if (process.env.SKIP_COLLECT !== '1')
  execFileSync(process.execPath, ['scripts/round10-probe.mjs'], {
    env: { ...process.env, LOCAL_ONLY: '1' },
    stdio: 'pipe',
  });
const refs = JSON.parse(await fs.readFile('evidence/round10/reference.json')),
  locals = JSON.parse(await fs.readFile('evidence/round10/local.json'));
const results = [];
let cells = 0,
  images = 0,
  pressCards = 0,
  lines = 0,
  max = 0;
const close = (a, b, label, tol = 0.4) => {
  for (const k of ['x', 'y', 'w', 'h']) {
    const d = Math.abs(a[k] - b[k]);
    max = Math.max(max, d);
    assert.ok(d <= tol, `${label}.${k}: ${a[k]} vs ${b[k]} (delta ${d})`);
  }
};
const type = (a, b, label) => {
  for (const k of ['fontSize', 'lineHeight'])
    assert.ok(
      Math.abs(parseFloat(a.css[k]) - parseFloat(b.css[k])) < 0.012,
      `${label}.${k}: ${a.css[k]} vs ${b.css[k]}`,
    );
  assert.equal(a.css.fontWeight, b.css.fontWeight, `${label}.weight`);
  assert.equal(
    a.css.fontFamily.split(',')[0].replaceAll('"', ''),
    b.css.fontFamily.split(',')[0].replaceAll('"', ''),
    `${label}.font`,
  );
};
const text = (a, b, label) => {
  assert.deepEqual(a.lines, b.lines, `${label}.lines`);
  lines++;
};
const check = (name, fn) => {
  try {
    fn();
    results.push({ name, pass: true });
  } catch (e) {
    results.push({ name, pass: false, error: e.message });
    console.error('FAIL', name, e.message);
  }
};
for (const r of refs) {
  const l = locals.find((l) => l.width === r.width && l.slug === r.slug);
  assert.ok(l);
  const key = `${r.slug}/${r.width}`;
  if (r.type)
    check(key + ' R9-1 all 33 specimen cells', () => {
      assert.equal(l.specimens.length, 11);
      for (let i = 0; i < 11; i++) {
        close(l.specimens[i].box, r.specimens[i].box, `row ${i}`);
        for (let j = 0; j < 3; j++) {
          const a = l.specimens[i].cells[j],
            b = r.specimens[i].cells[j];
          close(a.box, b.box, `cell ${i}/${j}`);
          close(a.content, b.content, `content ${i}/${j}`);
          close(a.content.ink, b.content.ink, `ink ${i}/${j}`, 1);
          type(a.content, b.content, `type ${i}/${j}`);
          text(a.content, b.content, `text ${i}/${j}`);
          cells++;
        }
      }
    });
  if (r.type)
    check(key + ' R9-1 intro copy wrapping', () => {
      text(l.type.intro, r.type.intro, 'intro');
      close(l.type.intro.ink, r.type.intro.ink, 'intro ink', 1.1);
    });
  for (const bank of r.banks)
    check(key + ' R9-2 ' + bank.title, () => {
      const local = l.banks.find((b) => b.title === bank.title);
      assert.ok(local, 'bank exists');
      assert.equal(local.images.length, bank.images.length);
      for (let i = 0; i < bank.images.length; i++) {
        const a = local.images[i].box,
          b = bank.images[i].box;
        close(a, b, `image ${i}`, 1);
        assert.equal(a.css.objectFit, b.css.objectFit);
        assert.equal(a.css.objectPosition, b.css.objectPosition);
        const af = decodeURI(local.images[i].src).split('/').pop(),
          bf = decodeURI(bank.images[i].src)
            .split('/')
            .pop()
            .split('_')
            .slice(1)
            .join('_');
        assert.equal(af, bf, `image ${i} actual art`);
        images++;
      }
    });
  for (const bank of r.banks.filter((b) => b.copy))
    check(key + ' organization intro copy ' + bank.title, () => {
      const a = l.banks.find((b) => b.title === bank.title).copy;
      type(a, bank.copy, 'intro');
      text(a, bank.copy, 'intro');
      close(a, bank.copy, 'intro', 1);
      close(a.ink, bank.copy.ink, 'intro ink', 1);
    });
  if (r.press.length)
    check(key + ' R9-3 all nine press cards', () => {
      assert.equal(l.press.length, 9);
      const ly = l.press[0].box.y,
        ry = r.press[0].box.y;
      for (let i = 0; i < 9; i++) {
        const a = l.press[i],
          b = r.press[i];
        for (const k of ['box', 'title', 'date', 'img', 'copy']) {
          const aa = k === 'img' || k === 'copy' ? a[k].box : a[k],
            bb = k === 'img' || k === 'copy' ? b[k].box : b[k];
          close(
            { ...aa, y: aa.y - ly },
            { ...bb, y: bb.y - ry },
            `card ${i}/${k}`,
            1,
          );
        }
        type(a.title, b.title, 'title');
        type(a.date, b.date, 'date');
        text(a.title, b.title, 'title');
        text(a.date, b.date, 'date');
        assert.equal(a.img.box.css.objectFit, b.img.box.css.objectFit);
        assert.equal(
          a.img.box.css.objectPosition,
          b.img.box.css.objectPosition,
        );
        pressCards++;
      }
    });
  if (r.closing)
    check(key + ' R9-4 closing CTA/note', () => {
      for (const k of ['title', 'body', 'action']) {
        const a = l.closing[k].box,
          b = r.closing[k].box;
        close(a, b, k, 1);
        close(a.ink, b.ink, k + ' ink', 1.1);
        type(a, b, k);
        text(a, b, k);
      }
      for (const k of ['text', 'image', 'action']) {
        const a = l.note[k].box,
          b = r.note[k].box;
        close(a, b, 'note ' + k, 1);
        if (k !== 'image') {
          close(a.ink, b.ink, 'note ink ' + k, 1.1);
          type(a, b, k);
          text(a, b, k);
        }
      }
      const terminal = r.closing.terminal.ancestors[0];
      close(l.closing.terminal.box, terminal, 'terminal frame', 1.1);
      if (r.closing.code) {
        type(l.closing.code, r.closing.code, 'terminal pre');
        close(l.closing.code, r.closing.code, 'terminal pre', 1.1);
      }
    });
  if (r.cases)
    check(key + ' R9-5 use-case section/header rhythm', () => {
      for (const k of ['title', 'body', 'grid', 'more'])
        if (r.cases[k])
          close(
            l.cases[k],
            r.cases[k],
            k,
            k === 'grid' || k === 'more' ? 4.3 : 0.5,
          );
      assert.ok(
        Math.abs(l.cases.grid.y - r.cases.grid.y) < 0.6,
        'first grid row follows source header rhythm',
      );
      assert.ok(
        Math.abs(l.cases.more.y - r.cases.more.y) < 2,
        'CTA follows intrinsic cards',
      );
      assert.equal(
        l.cases.title.css.borderTopWidth,
        r.cases.title.css.borderTopWidth,
      );
    });
  if (r.header.length && r.width >= 992)
    check(key + ' R9-6 fixed desktop controls', () => {
      for (const name of ['Blog', 'Docs']) {
        const a = l.header.find((a) => a.text === name),
          b = r.header.find((a) => a.text === name);
        assert.ok(a && b);
        close(a, b, name, 0.12);
        type(a, b, name);
        text(a, b, name);
      }
      const a = l.header.find((a) => a.cls === 'community-toggle'),
        b = r.header.find((a) => a.text === 'Community');
      close(a, b, 'Community', 0.12);
      assert.equal(a.css.fontSize, '16px');
      assert.equal(a.css.lineHeight, '24px');
    });
  if (r.width === 991)
    check(key + ' R9-6 tablet drawer boundary', () =>
      assert.ok(!l.header.some((a) => a.text === 'Docs')),
    );
  check(key + ' document has no horizontal overflow', () =>
    assert.equal(l.overflow, false),
  );
}
check('R9-6 settled desktop dropdowns and dismissal', () =>
  execFileSync(process.execPath, ['scripts/round10-dropdown.mjs'], {
    env: process.env,
    stdio: 'pipe',
  }),
);
// Independent rectangles include every divider and illustration control.
execFileSync(process.execPath, ['scripts/round10-press-lines.mjs'], {
  env: { ...process.env, LOCAL_ONLY: '1' },
  stdio: 'pipe',
});
const goldLines = JSON.parse(
  await fs.readFile('evidence/round10/reference-dividers.json'),
);
const nativeLines = JSON.parse(
  await fs.readFile('evidence/round10/local-dividers.json'),
);
for (const gold of goldLines) {
  const native = nativeLines.find((r) => r.width === gold.width);
  check(`press dividers ${gold.width}: all nine`, () => {
    assert.equal(native.dividers.length, 9);
    native.dividers.forEach((a, i) => {
      close(a, gold.dividers[i], `divider ${i}`, 0.12);
      assert.equal(a.color, gold.dividers[i].color);
    });
  });
  check(`closing terminal controls ${gold.width}`, () => {
    assert.equal(native.controls.length, 4);
    native.controls.forEach((a, i) => {
      close(a, gold.controls[i], `window control ${i}`, 0.12);
      assert.equal(a.color, gold.controls[i].color);
    });
  });
}
await fs.writeFile(
  'evidence/round10/checks.json',
  JSON.stringify(
    {
      passed: results.filter((r) => r.pass).length,
      failed: results.filter((r) => !r.pass).length,
      cells,
      images,
      pressCards,
      lines,
      max,
      results,
    },
    null,
    2,
  ),
);
console.log(
  `${results.filter((r) => r.pass).length} round10 component groups passed; ${results.filter((r) => !r.pass).length} failed. ${cells} specimen cells, ${images} images, ${pressCards} press cards, ${lines} exact text arrays.`,
);
if (results.some((r) => !r.pass)) process.exitCode = 1;
