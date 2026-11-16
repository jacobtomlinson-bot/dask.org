import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
const refs = JSON.parse(
    await fs.readFile('evidence/round14/reference-scroll.json', 'utf8'),
  ),
  rows = [];
let pixels = 0;
for (const r of refs.filter((r) => r.capture && r.width >= 768)) {
  const a = PNG.sync.read(await fs.readFile(r.capture)),
    b = PNG.sync.read(
      await fs.readFile(r.capture.replace('/reference-', '/local-')),
    );
  // The tablet's real painted strip is 7.26vw, separately from the unchanged
  // content reservation. Check the final painted pixel, not merely its center.
  const x =
    r.width < 992
      ? Math.floor(r.width * 0.0726)
      : Math.ceil(r.width * 0.05625) - 1;
  let count = 0;
  for (let y = 10; y < Math.min(r.height, r.tone.y + r.tone.h) - 4; y += 17) {
    const at = (y * r.width + x) * 4,
      expected = [...a.data.subarray(at, at + 3)];
    if (expected.join(',') !== '239,21,97') continue;
    assert.deepEqual(
      [...b.data.subarray(at, at + 3)],
      expected,
      `${r.width}/${r.height} Tone+${r.offset} rail edge ${x},${y}`,
    );
    count++;
  }
  pixels += count;
  rows.push({
    width: r.width,
    height: r.height,
    offset: r.offset,
    x,
    pixels: count,
  });
}
await fs.writeFile(
  'evidence/round14/rail-paint.json',
  JSON.stringify({ pixels, rows }, null, 2) + '\n',
);
console.log(pixels, 'actual final-column rail-edge pink pixels passed');
