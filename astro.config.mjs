import { defineConfig } from 'astro/config';
import mappings from './src/data/redirects.json' with { type: 'json' };
const redirects = Object.fromEntries(
  mappings
    .filter((m) => m.status === 'resolved' && m.destination)
    .map((m) => [m.source, { status: 301, destination: m.destination }]),
);
export default defineConfig({
  output: 'static',
  site: 'https://www.dask.org',
  redirects,
  devToolbar: { enabled: false },
});
