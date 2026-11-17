# Current review: resolved blog/event redirects

Card **549aad55-ef02-4222-a004-0df05ae01ca1**.

The current narrow follow-up package is [redirects/REVIEW.md](redirects/REVIEW.md).
All excluded `/blog`, `/blog/*`, `/events`, `/events/*` and
`/archive/2022-news-events` paths now target exactly **https://blog.dask.org/**.
Known inventory emits static HTML redirects; arbitrary missing blog/event
children use a tightly scoped, BASE_URL-aware404 fallback. Unrelated404s remain
helpful. No server-side301 is claimed. JavaScript is required only for arbitrary
missing descendants, not known HTML redirect documents.

Verification: root/project static builds, **116 browser cases**, six unchanged
core-page HTML byte identities, formatting/whitespace and zero-vulnerability
audit. Full historical visual/motion suites were not rerun for this narrow,
nonvisual follow-up; prior round15 evidence remains in `round15/` and Git history.
No push/publication/deployment, main integration or card mutation was performed.
Main must obtain the same independent tester's approval of the new signed exact
SHA before integration and authorized preview publication.
