# Resolved blog/event redirects — local review package

Card **549aad55-ef02-4222-a004-0df05ae01ca1**. Retained developer branch
`openclaw/dask-org-astro-developer`, signed base
`ea7e2337aebaabe3ff83259841ddbf4861871728`.
Main is sole coordinator; same independent tester must approve the new exact SHA
before main integrates and publishes the authorized GitHub Pages preview.
Developer performed **no push, PR, publication, deployment, main or card mutation**.

## Requested behavior and implementation

All five mapping entries in `src/data/redirects.json` are resolved to exactly
**https://blog.dask.org/**, with no path, query or fragment retained:

- `/blog`, `/blog/*`
- `/events`, `/events/*`
- `/archive/2022-news-events` (and trailing-slash directory form; not its children)

The finite inventory emits real HTML at `/blog/index.html`, `/events/index.html`
and `/archive/2022-news-events/index.html`, with immediate meta refresh,
`location.replace`, canonical target and a real manual link. This does **not**
claim a server-side301. The previous Astro config's blanket301/wildcard conversion
is removed: static wildcards cannot enumerate arbitrary descendants at build time.

`src/lib/redirects.ts` shares the register between finite route generation and
404 matching. Only the actual `/blog` or `/events` path-segment prefix matches;
`/blogger`, `/blog.html`, `/events-old`, unrelated paths and archive descendants
are not redirected. The matcher first enforces the build's actual BASE_URL mount
boundary. The native404 module therefore works for both `/` and `/dask.org/`
builds, including arbitrary future descendant paths and query/hash removal.
It uses a constant approved destination, never an input-derived external URL.

The unknown-page content now truthfully says the page was not found, with
base-aware home/get-started links and the resolved blog link; no pending-
destination claim remains. No six-page markup, styles, artwork or shared runtime
was changed. All six **built root-hosted HTML files are byte-identical** to the
signed base (`core-before.json`, `core-after.json`, `core-unchanged.json`).

## Verification

- Root production build passes: **10 static files/routes**, including404 and all
  three finite redirect documents. Project-base build also passes.
- `npm run test:redirects`: **116 browser cases pass**, covering both bases,
  JavaScript enabled/disabled, all excluded patterns, arbitrary deep descendants,
  trailing slashes, index documents, exact target/path/query/hash removal,
  source-mount boundary negatives, unrelated unknown paths and real404 status.
- Six generated redirect-document assertions (three per base) verify canonical/
  fallback target and immediate HTML refresh. No literal wildcard output emitted.
- Destination requests are intercepted locally and asserted to equal the exact
  target. **No live destination requests, submissions or mutations are made.**
- The test fixture serves the actual built404 bytes with HTTP404 at the original
  missing URL, not an SPA200 rewrite. It checks actual browser navigation, not
  only source strings or a pure matcher function. Servers bind loopback on
  ephemeral ports and are closed; temporary builds are removed in `finally`.
- Formatting and whitespace checks pass; audit reports **0 vulnerabilities**.
- Focused tests/build/byte-identity are sufficient for this narrow change; the
  lengthy visual/motion/full historical suite was **not rerun**. The focused gate
  is also wired into `npm test`; its old pending assertion now tests resolution.
- Inspected the unknown-page browser screenshots. Shared raw project-base builds
  retain the pre-existing root-relative artwork/font URLs used by the core site;
  this redirect-only follow-up does not alter the main publisher's existing
  asset/link base-rewriting pipeline. The new404 redirect module and explicit
  helpful content links themselves are tested with the actual project base.

Reproduce from the repository root:

```sh
npm run build
npm run test:redirects
npm run build -- --base /dask.org/
npm run format:check
npm audit --json
git diff --check
```

`tests.log`, `build.log`, `build-{root,project}.log`, `checks.json`, `format.log`,
`audit.json`, `whitespace.log` and both unknown-page screenshots are retained here.

## Static-host limits (explicit, not fabricated success)

Known inventory redirects work without JavaScript via HTML meta refresh.
**Arbitrary missing descendants require JavaScript** to run the scoped404 fallback
on GitHub Pages. Without JavaScript they remain genuine404s with a manual blog
link; static hosting cannot send a server catch-all301. The host must actually
serve this build's custom404 at unknown paths. A server's own generic error page
cannot run the fallback. The local Pages-style host verifies this contract; the
published preview has **not** been updated or claimed verified in this turn.

## Handoff

Main sends the exact new signed SHA to the same retained tester, then integrates
and publishes only after approval. The local ref is available through the shared
object store; no developer push/fetch is needed. No new dependencies, CI,
permissions, authentication or live-dask.org changes are included.
