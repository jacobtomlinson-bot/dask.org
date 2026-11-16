# Intermediate diagnostics, not final proof

The `local-scroll-first`, `local-scroll-mixed-before-final`,
`local-scroll-before-rail-paint` and matching earlier card snapshots are superseded
by the frozen final `../local-scroll.json` and `../local-cases.json`.
Early failures identified compact-control flex shrinking, incorrect rail-pixel
sampling beyond the rail into footer paint, fractional screenshot-index math,
and the phone CTA's invisible parent-track width. Those were investigated and
resolved before final acceptance; they are not reported as passed runs.
`initial-incorrect-viewport-diagnostic.json` came from passing viewport options
to an existing BrowserContext's newPage call (ignored by that API); it was not
used as a767px reference. The later explicit setViewportSize observations and
fresh per-width source fixtures are authoritative.
