import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
const dir = 'evidence/round8';
const pixels = (p) => {
  const out = new Set();
  for (let y = 0; y < p.height; y++)
    for (let x = 0; x < p.width; x++) {
      const at = (y * p.width + x) * 4;
      if (Math.min(...p.data.subarray(at, at + 3)) > 220) out.add(y * 1024 + x);
    }
  return out;
};
const reference = pixels(
  PNG.sync.read(await fs.readFile(`${dir}/reference/icon-hires-1.png`)),
);
const rows = [];
for (const [state, path] of [
  ['before', `${dir}/icon-brush-before.png`],
  ['after', `${dir}/local/icon-hires-1.png`],
]) {
  const native = pixels(PNG.sync.read(await fs.readFile(path)));
  let best = { inkIoU: 0, alignmentCSSpx: [] };
  for (let dx = -8; dx <= 8; dx++)
    for (let dy = -8; dy <= 8; dy++) {
      let intersection = 0;
      for (const at of native)
        if (reference.has(at + dy * 1024 + dx)) intersection++;
      const inkIoU =
        intersection / (reference.size + native.size - intersection);
      if (inkIoU > best.inkIoU)
        best = { inkIoU, alignmentCSSpx: [dx / 8, dy / 8] };
    }
  rows.push({ state, ...best });
}
await fs.writeFile(
  `${dir}/brush-contour.json`,
  JSON.stringify(rows, null, 2) + '\n',
);
console.log(rows);
