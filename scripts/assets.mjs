// Public artwork and typefaces only; never downloads page CSS, JS or animation implementations.
import fs from 'node:fs/promises';
const pages = [
  'home',
  'get-started',
  'get-help',
  'powered-by',
  'brand-guide',
  'press-mentions',
];
const urls = new Set(
  JSON.parse(await fs.readFile('evidence/reference/fonts.json', 'utf8')).filter(
    (x) => x.includes('Inter-') || x.includes('Inconsolata-Regular'),
  ),
);
for (const page of pages) {
  const d = JSON.parse(await fs.readFile(`evidence/reference/${page}.json`));
  d.images.forEach((i) => urls.add(i.src));
  const details = JSON.parse(
    await fs.readFile(`evidence/reference/${page}-detail.json`),
  );
  details.forEach((e) => {
    for (const m of e.background.matchAll(/url\("([^"]+)"\)/g)) urls.add(m[1]);
  });
}
await fs.mkdir('public/assets', { recursive: true });
const manifest = [];
for (const url of urls) {
  let name = decodeURIComponent(new URL(url).pathname.split('/').pop())
    .replace(/^[a-f\d]{24}_/, '')
    .replaceAll(' ', '-');
  let path = `/assets/${name}`;
  try {
    let response = await fetch(url);
    if (!response.ok) throw Error(response.status);
    await fs.writeFile(
      'public' + path,
      Buffer.from(await response.arrayBuffer()),
    );
    manifest.push({
      path,
      url,
      kind: /\.ttf$/.test(name) ? 'font' : 'artwork',
    });
  } catch (error) {
    console.error(url, String(error));
  }
}
await fs.writeFile(
  'src/data/assets.json',
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log('Saved', manifest.length, 'public assets');
