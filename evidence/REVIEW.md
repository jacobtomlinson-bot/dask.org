# Round14 local review package

Card **549aad55-ef02-4222-a004-0df05ae01ca1** · native Astro Dask.org, six core routes.
Branch `openclaw/dask-org-astro-developer`; base signed round13 `41507da97762ef527b139ccace1eb82ac2da0bfe`.
Main remains sole coordinator, reviewer relay, integration and completion owner.
This package is local-only: no remotes/fetch/push/PR/deployment/CI/auth changes,
helpers, live submissions, main integration or card mutation. Exact signed review
SHA is supplied in the handoff after final verification. **Not an exact-equivalence claim.**

## R13-1 — reading state and actual compact sticky controls

Separated the full-height painted `brand-rail` from its compact interactive
`brand-sidebar`. The latter has its own sticky inset, intrinsic control sizes,
compact reservation and containing-track release; it is no longer a viewport-high
sticky element whose bottom clamp removes otherwise visible controls. Tablet
controls retain their real sizes rather than flex-shrinking into the compact
reservation. The measured tablet painted strip is also restored independently
of the previously accepted content-track reservation: actual edge pixels, not
only the center of the pink rail, are checked.

At768 the pinned first control is **42.65625px** from the viewport top; at1440 it
is **80px**. All four source-visible controls remain physically available in the
exercised intermediate and footer states. Phone/landscape retain their horizontal
sticky bar and native anchor semantics. The SVG paths remain independently drawn.

The reading marker now follows the section intersecting the **viewport midpoint**,
including a genuine **clear state** after Tone. Fresh source observations establish
this in both scroll directions at two viewport heights. It is not based on the
last clicked hash, the top edge, or an unconditional first/last section fallback.
This also corrects round13's mistaken unconditional initial-Logos assumption:
when the midpoint remains in the hero the original has no current section; when
it intersects Logos, Logos is selected. Existing direct-navigation tests still
assert the real hash, usable pin geometry and current-state paint, but no longer
assert that a clicked URL must stay current after a different section occupies
the reading midpoint. The independent source-backed gate checks actual states,
not just a duplicate of the local algorithm.

Evidence: `round14/reference-scroll.json` / `local-scroll.json` contain **836
forward/backward viewport states per side** across390/479/480/601/767/768/769/991/
992/1100/1440 and700/1000px heights. `hits.json` contains **246 real clicks at the
source's physical coordinates**, not label targeting; **88 keyboard Enter
activations** additionally preserve semantic navigation. States unavailable in
the original viewport are not counted as successful click tests. The real final
painted rail column passes **1,342 RGB checks** in `rail-paint.json`.

## R13-2 — real Tone sheets and text stick together

Tone now owns actual foreground sheet elements wrapping its existing text tracks.
The introductory sheet is `position:sticky; top:0`, constrained by the natural
containing section. Measured paper padding/margins and responsive track ownership
replace the previous section-owned decorative foreground. There is no fixed
overlay, section/page minimum-height, overflow clipping, compensating spacer or
downstream offset. The desktop short sheet follows the observed two-fifths
proportion of the intrinsic examples row; the row's natural content still
determines the section extent. Tablet and stacked sheets use their real content
and padding. The trailing stacked-sheet margin belongs to that sheet rather than
being folded into section padding, preserving the actual sticky release point.

AtTone+500 the native heading is **62.046875px at768** and **116.34375px at1440**,
matching the observed pinned reference instead of scrolling hundreds of pixels
above the viewport. Stacked phone/landscape reproduce the same native sticky
travel and original sibling painting order; a later examples paper may paint over
the introductory paper on a stacked tier, just as in the reference. This is not a
claim that a sticky heading is always visually above every later sibling.

All **90 accepted paragraph line arrays and static text bounds** remain covered
by the prior independent fixtures. New checks compare actual sheet rectangles,
heading/intro dimensions, text-to-paper coordinates, entry, pinned travel and
bounded release. Normalized paper error is at most **0.125px**; text-to-paper
error is **0.109375px**. Raw viewport comparisons retain integer document-scroll
rounding separately: paper at most **0.78125px**, heading/intro **0.796875px**.
The pinned phase is compared directly, not normalized away. At1100 the intrinsic
Tone section differs by **0.265625px** from accumulated fluid-unit line rounding;
this is disclosed rather than concealed with a height adjustment.

## R13-3 — foreground card tracks, gaps and row seams

Corrected the actual percentage-sized landscape/tablet foreground cards and the
tablet CTA's margins. The landscape tag gap was undersized: its contribution to
the grid's max-content width explained the767px outer-gutter error. Restoring that
real component gap lets the intrinsic grid size itself correctly; no explicit
page/grid width compensation or section height was added. Phone CTA actions now
own the original stretched containing track while their visible controls retain
the accepted intrinsic sizes. Desktop and neighboring601/992 behavior remain.

Fresh measured reference/native at767: grid **x87.65625, width591.6875px**;
first card **x89.328125, width293.59375px**. At768 the first foreground card is
**216.84375px** wide; at991 it is **279.8125px** wide, and total grid height is
**1068.71875px**, matching the source. Every one of the seven cards is asserted,
including internal child tracks, artwork, CTA row position, exact leaf line arrays
and original destination strings. At the requested767/768/769/991 widths, maximum
card-bound error is **0.03125px**, not the previous several-pixel track error.
The complete eleven-width gate covers **77 foreground cards and561 exact
heading/leaf text-line arrays**. Narrow-phone cumulative card positions retain a
maximum **0.703125px** rounding difference; full card sections were inspected.

## Verification and inspected evidence

The frozen final suite passed **76 regression groups,0 failures**. Build and
formatting passed; audit reports **0 vulnerabilities**. Frozen implementation
hashes were reverified after the suite. The exact signed SHA is in the handoff.
The new focused gate passes **1,177 groups,0 failures**, including **5,521 actual
foreground/rail RGB samples**. The separate final-column rail audit adds1,342
actual pink samples. Physical-click/keyboard results are separate from those
static group counts. `geometry-summary.json` preserves raw maxima by component
and card width rather than using aggregate pixel percentages as acceptance.

- `gallery.html`:18 freshly traversed canonical route pairs, six routes at390/
  768/1440. All18 overview pairs were inspected, not treated as pixel-equivalent.
- `states.html`:66 actual viewport scroll pairs at two heights and three Tone
  phases, plus11 complete Use Cases section pairs. Eleven responsive contact
  sheets and all eleven card section pairs were inspected; full-size files are
  linked for independent reproduction.
- `settled-reference.json` and `settled/`: independent350ms-settled source recheck
  of all836 forward/backward states, separating marker-color transition frames
  from persistent geometry/selection. The original collection records its raw
  geometry; the settled recheck is an additional observation, not a replacement
  fixture copied from the native result.
- `reference-cases.json` / `local-cases.json`, `cases/`, `checks.json`, `hits.json`,
  `rail-paint.json`: actual per-element/state geometry, lines, targets and paint.
- `build.log`, `tests.log`, `format.log`, `whitespace.log`, `audit.json`: final
  command results. Historical test-generated outputs are archived under
  `regressions/` before restoring old fixtures; abandoned/intermediate diagnostics
  are separated under `iterations/`, not treated as final acceptance.

Reproduction commands are in README's Round14 section. Ordinary tests use frozen
source evidence and navigate the local preview only. Optional explicit original
refreshes use the GET/HEAD-only browser harness. No Webflow implementation,
generated CSS/JS, runtime or tools are copied into production; original public
artwork/fonts retain the existing provenance manifest. This round adds no
production dependencies or assets.

## Remaining inventory and scope limits

- This is scoped Chromium evidence on this host, not cross-engine or literal
  whole-site exactness certification. Current350ms reference states do not
  synchronize normal-motion dashboards, counters or typing phases; existing
  normal/reduced-motion behavioral regressions remain required.
- Grid/dot phase, antialiasing and independently authored internal vector contours
  remain visibly different in some comparisons. They are not silently dismissed
  as motion noise, nor are aggregate difference pixels used to invent a new
  contour scale correction without an actual reference-backed cause.
- Small static differences remain: phone card/artwork cumulative positions up to
  0.703125px; Tone1100 section0.265625px; previously documented Explore boundary
  around1–3px and Press underline quantization. Canonical Brand/get-started desktop
  document extents can differ by4px despite the accepted local component geometry;
  no page-height compensation was applied. Raw per-route diagnostics remain.
- Correct calculated contrast metadata preserves the previously accepted policy,
  not every legacy annotation/category/typo. New rail/Tone/card work does not change
  palette pixels, all-color clipboard behavior, selected artwork identities or
  typography specimens. Logo guidance's separate40px sticky inset is retained.
- Forms still prevent network submission and truthfully report “Not sent”; pending
  excluded blog/event redirects remain unguessed. No backend success, content,
  authorization or deployment was fabricated.

## Integration boundary

The signed branch/ref is fetchable through the existing shared object store;
no remote fetch is required. Main must send the exact new SHA to the **same
independent tester** before any local integration. Only after that gate may main
integrate the approved exact commit (for example, `git merge --ff-only <SHA>` in
its own authorized checkout). Developer has not run that integration command,
published a PR or moved the Workboard card. Review handoff is not task completion.
