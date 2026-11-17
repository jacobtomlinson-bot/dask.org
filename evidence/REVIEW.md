# Round15 local review package

Card **549aad55-ef02-4222-a004-0df05ae01ca1** · native Astro Dask.org, six core routes.
Branch `openclaw/dask-org-astro-developer`; base signed round14
`57fefbbc68a7b94810cc498a6761cf20b6764222`.
Main remains sole coordinator, reviewer relay, integration and completion owner.
Local only: no remote/fetch/push/PR/deployment/CI/auth changes, helpers, live
submissions, main integration or card mutation. The exact new signed SHA is
reported in the handoff. **This is not an exact-equivalence claim.**

## R14-1 — Explore's local trailing canvas and actual painted seam

Read the complete independent-round14 report and its residual/seam collectors.
Fresh read-only original observations at390/479/480/601/767/768/769/991/992/1440
show that the pane reserves a width-driven composition canvas, separately from
its action's final inline reservation. Native previously let that last line box
alone determine the pane's contribution, and collapsed the reference's two
trailing inset owners into a slightly different single gutter.

`src/styles/explore.css` now owns that reservation with a preferred pane aspect
ratio: desktop2:1, tablet85:28.4, landscape5:2, phone85:83.4. These ratios are
measured pane-width/pane-height relationships, **not fixed section/page heights**.
`min-block-size:0` avoids reinstating the automatic content minimum; action ink
can retain its source-observed small overhang **without overflow clipping**.
The two original trailing inset contributions are combined locally: desktop
5.625vw+5.0004 fluid rem, tablet14.26vw, landscape17.556vw. Existing phone gutter
is unchanged. Section height remains the sum of real intro, tab, pane and inset
flow; there are no added empty spacer elements, downstream transforms, fixed
section heights or masks. Deeper and all foreground rules/markup/JS are unchanged.

`round15/structure.json` records the original/native action and each real parent,
with rendered rectangles and computed insets. No original generated style sheet
or implementation code was copied. No dependencies or artwork were added.

### Fresh all-state acceptance

`scripts/round15-checks.mjs` independently obtains **60 records**, original and
native, covering three states at all ten requested widths, with fonts loaded,
full-page traversal,350ms settling and reduced motion. Each of30 paired groups
asserts section-relative heading/card/action rectangles, action label/destination,
no document overflow, actual action-bottom-to-boundary extent, and the first
painted #33363D row at x3/10/20 in a full-page PNG. The next sibling's unrelated
wrapper height is deliberately not compared. PNGs retain both the complete
Explore composition and a real action-to-seam strip.

- Maximum trailing-gap error: **0.015625px** (old1–3px mismatch removed).
- Maximum preserved foreground bound error: **0.09375px**.
- Actual painted gap differs by **at most one raster row**. This is retained as a
  limit, not called pixel identity: integer-ceiled action edges can fall on
  different sides of the source/native document's fractional origin. At601 the
  DOM gap is exactly103.296875px on both sides; PNG integer gap is102/103 rather
  than the old102/105. At390 it is80/80;768110/110;1440160/160.
- Each detected gray seam is within one raster row of its actual local section
  boundary, not merely an assertion on computed background color.

The prior foreground-only round11 section-bound tolerance is tightened from3.5px
to0.125px; its old1–3px waiver is removed. The new real-paint gate runs as part of
`npm test`. Existing round11 checks additionally exercise all four bounded arrow
transitions, missing endpoint arrows, keyboard Home/End/ArrowRight, retained focus
and exact destinations at390/768/1440. Prior rail/Tone/cards/clipboard/assets/forms/
normal-motion regressions remain in the full integrated runner.

## Validation and inspected evidence

Integrated runner: **75 completed outer groups with no recorded assertion failures;
no terminal aggregate**. The tool transport interrupted the awaited2400-second
command after600 seconds during round14. Remaining round14 and new round15 gates
completed separately with terminal exit0 under an ordinary2400-second process
lifetime: round14 **1,177 groups**, round15 **30 groups**, all passed. Results
are recorded in `round15/final-gates.log` and `split-coverage.json`.
This is split coverage, not a reported terminal `npm test` pass.

Commands (repository root; loopback static preview serves built `dist/`):

```sh
npm run build
python3 -m http.server 4321 --bind 127.0.0.1 --directory dist
BASE_URL=http://127.0.0.1:4321 npm test
npm run format:check
npm audit --json
git diff --check
```

The requested2400-second process allowance did not override the awaited tool
transport's600-second limit. The separate final-gate command returns immediately
with a durable process handle, avoiding that awaited-call limit. Focused gate can also
be reproduced with `BASE_URL=http://127.0.0.1:4321 node scripts/round15-checks.mjs`.
`round15/{build.log,tests.log,format.log,audit.json,whitespace.log}` retain outcomes.
Historical generated regression results are archived under `round15/regressions/`
before restoring older rounds, keeping the implementation diff reviewable.

Actually inspected the ten `pair-explore-<width>.png` all-state composition
sheets, plus seam-strip contact sheets; `round15/seams.html` links all30 pairs and
raw measurement/pixel results. Also inspected six `overview-<width>-<group>.png`
covering all18 fresh canonical source/native page pairs at390/768/1440.
`round15/gallery.html` links full-resolution page pairs and diagnostic pixel diffs;
source normal motion there is not synchronized with native reduced motion.
These overviews catch broad structural regressions; focused reduced-motion
comparisons establish the local Explore correction, not aggregate pixel scores.

## Remaining inventory / honest limits

- Actual seam raster-gap quantization remains up to1px despite<=0.015625px local
  geometry error. No downstream or foreground offset was introduced to force
  unrelated absolute document origins onto the same integer raster row.
- Optional nonblocking Press polish is deliberately not mixed into this one-file
  production repair. The tester's390 action origin0.203125px and991 leaf origin
  1.0625px residuals remain; same1px yellow border/type/line height and accepted
  native action hitboxes are preserved. No false pixel-identity claim.
- Independently authored internal vector contours, grid/dot phase, antialiasing
  and unsynchronized dashboard/gauge/typing/counter frames remain visibly
  nonidentical in some pairs. No original implementation/runtime was imported
  to remove those differences. Existing scoped normal/reduced-motion tests stay.
- Prior subpixel phone card/artwork accumulation up to0.703125px and Tone1100
  section0.265625px remain disclosed. Canonical whole-document extents are
  diagnostics, not proof of equivalence or justification for page-height offsets.
- This is Chromium-on-host coverage, not universal cross-engine certification.
  Safe forms truthfully remain unsent; backend behavior and pending excluded
  content redirect destinations are not fabricated.

## Integration boundary

Same retained independent tester must review the new **exact signed SHA** before
main integrates it locally. Branch/ref is accessible through the existing shared
Git object store; no fetch is needed. After approval, main may use
`git merge --ff-only <approved-SHA>` in its own authorized checkout. Developer does
not run that integration, move the card, or publish anything. Review handoff is
an intermediate phase, not task completion.

Final gates: build and formatting passed; audit0 vulnerabilities; frozen tested
source/check hashes verified unchanged. Owned loopback preview stopped and port4321
confirmed closed before signing.
