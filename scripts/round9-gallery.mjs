import fs from 'node:fs/promises';
import { PNG } from 'pngjs';
const dir = 'evidence/round9',
  source = JSON.parse(await fs.readFile(`${dir}/reference.json`, 'utf8')),
  native = JSON.parse(await fs.readFile(`${dir}/local.json`, 'utf8'));
for (const width of [390, 768, 1440])
  for (const [name, slug, key] of [
    ['performance', 'home', '.performance-text-content'],
    ['learn', 'get-started', '.h-text.l-grey-bg'],
    ['sponsors', 'powered-by', '.pb-text'],
    ['support', 'get-help', '.container-help'],
  ]) {
    const ss = source.find((x) => x.width === width && x.slug === slug),
      nn = native.find((x) => x.width === width && x.slug === slug);
    let starts = [],
      heights = [];
    for (const [label, row] of [
      ['reference', ss],
      ['local', nn],
    ]) {
      let g = row.groups[key][0],
        start,
        end;
      if (name === 'performance') {
        start = label === 'reference' ? g.ancestors[1].y : g.box.sectionTop;
        const last = row.groups['.rows-container'][1].box;
        end = last.y + last.sectionTop + last.h + 100;
      } else if (name === 'learn') {
        start = g.box.sectionTop;
        const cards = row.groups['.blog-title.get-st'];
        const last = cards.at(-1).box;
        end = last.y + last.sectionTop + last.h + 80;
      } else if (name === 'sponsors') {
        start = g.box.sectionTop;
        const cards = row.groups['.card.logo-with-text'];
        const last = cards.at(-1).box;
        end = last.y + last.sectionTop + last.h + 60;
      } else {
        start = g.box.sectionTop;
        const logos = row.groups['.container-helplogo'];
        const last = logos.at(-1).box;
        end = last.y + last.sectionTop + last.h + 50;
      }
      starts.push(Math.floor(start));
      heights.push(Math.ceil(end - start));
    }
    const imgs = [];
    for (const [i, label] of ['reference', 'local'].entries()) {
      const p = PNG.sync.read(
        await fs.readFile(`${dir}/${label}/${slug}-${width}.png`),
      );
      const h = Math.min(heights[i], p.height - starts[i]);
      const out = new PNG({ width, height: h });
      PNG.bitblt(p, out, 0, starts[i], width, h, 0, 0);
      imgs.push(out);
    }
    const pair = new PNG({
      width: width * 2,
      height: Math.max(...imgs.map((p) => p.height)),
    });
    pair.data.fill(255);
    for (let i = 0; i < 2; i++)
      PNG.bitblt(
        imgs[i],
        pair,
        0,
        0,
        imgs[i].width,
        imgs[i].height,
        width * i,
        0,
      );
    await fs.writeFile(`${dir}/${name}-${width}.png`, PNG.sync.write(pair));
  }
