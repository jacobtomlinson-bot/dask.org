# Developer review package — round10

- Card: `549aad55-ef02-4222-a004-0df05ae01ca1` (dask).
- Outcome: **ready_for_review**, local-only intermediate package; not an equivalence or independent-approval claim.
- Branch: `openclaw/dask-org-astro-developer`. Parent: `6cf43ba8f814d0569de87b71eb4506e53885261a`. Exact signed SHA is supplied with the final handoff.
- Main remains sole coordinator, tester relay, integration and completion owner. No main/card mutation, fetch/remote/push/PR/deployment/CI, live submission, new dependency, backend or authentication changes.

## Explicit responses to independent round9 findings

### R9-1 — actual typography specimens

Replaced scattered specimen overrides with `specimens.css`: an intrinsic three-cell row, bottom-aligned cells, real label paragraph margins, actual responsive sample font/weight/line-height matrix, and separately owned intro/action tracks. Printed design labels remain unchanged even when they differ from actual rendering. The desktop paper extent is the observed specimen-panel aspect, not a section-height spacer. Samples/intro can grow and are not clipped.

Fresh reference/native measurements cover **all11 rows ×3 cells ×11 widths =363 cells**, including actual fonts/weights/line-height, exact rendered lines, cell/content rectangles and DOMRange ink. Both intro typography and its fixed inline action strut are measured, not inferred from page height. Accepted Tone/paper/rail geometry is independently rerun.

An explicit compatibility detail: the original itself uses40px for the first sample at320px and its “Inter” ink reaches6.109375px into the next cell. `narrow-specimen-reference.json` records that exact GET-only observation and the non-overlapping360px neighbor. The historical round3 blanket no-collision assertion now compares this one observed source case within0.05px; it remains strict for every other row/view. We did not shrink the specimen or conceal it to pass the old inaccurate assumption. No document overflow results.

### R9-2 — organization banks

`organizations.css` owns both banks, with separate native card/media wrappers, real contained artwork, media insets, intro-to-grid flow, row gaps and trailing gutters. Removed the older fixed overall organization-section heights and conflicting bank rules. Sponsor cards are untouched. The source's fixed inter-component gaps are retained alongside fluid design units.

Intro text tracks are also checked at every width. The project intro centers its whole intrinsic content block in the paper, so the1100px two-line paragraph naturally moves its heading; no1100px y-offset exception is used.

Checks cover **every16 company +28 project +12 homepage image at11 widths =616 images**, their rectangles, intrinsic row positions, source-artwork filenames, actual object-fit and object-position. This restores the phone company lead offset and project pitch, tablet110px row pitch, and the smaller homepage partner artwork without replacing any artwork.

### R9-3 — all nine press cards

Rebuilt the card's native flex composition with independent media/separator/shrink-wrapped copy. Removed the1100px shortcut and tablet section-height constraint. Date400/title700 and exact source type coefficients drive genuine title wrapping. The list owns its trailing reading gutter independently of the symmetric section inset; there is no page-height correction.

Checks cover **all99 cards at11 widths**, including767/768/769/991/992/1100: media bounds/fitting, card frames/pitch, copy tracks, actual date/title fonts/weights and exact line arrays. A separate collector checks **all99 separator rectangles/colors**. In particular, tablet media is122.875×61.438px at768, while the992 title returns to the source423px track/two-line composition. The accepted phone cards/forms remain intact.

### R9-4 — closing CTA/note

`closing.css` owns the real heading/body/action/terminal and navy-note tracks. Restored the45.9936px desktop heading,18px/600 body in the403px track, source-sized action rows,700 note emphasis, contained reused artwork, and actual terminal code typography/insets. The window controls use native primitives with measured size, padding, gap and color, not an imported animation/runtime.

All11 widths compare heading/body/action/note fonts, weight, exact line arrays, ink and section-relative rectangles, terminal frame and pre rectangle. **All44 window-control rectangles/colors** are separately checked. Text is intrinsic; only the deliberately off-canvas illustration has its observed component viewport boundary.

### R9-5 — landscape Use Cases

Restored the480–767 pink frame, real heading inset/minimum frame, section top/bottom breathing room and description-to-grid rhythm. The minimum belongs to the measured heading box and can grow; no card or section content is clipped. Kept the accepted `cases.css` internals unchanged. Tests compare heading/description/grid/CTA section-relative bounds and border quantization across all11 widths, with tight vertical assertions.

The formerly ~74px-early601 grid/CTA now follow the original header rhythm. A small pre-existing intrinsic card-track residual is retained transparently: at767 the whole grid is4.25px narrower (2.125px inset each side); at991 its total intrinsic height differs1.625px. These are recorded as limits, not called identical. New checks bound those fields separately instead of disguising them with spacers or claiming a0.4px whole-component match.

### R9-6 — fixed desktop navigation

Separated fixed desktop controls from the fluid root/logo:16px/24px labels,20px control gaps and70×42px Docs at992/1100/1440. Removed the conflicting1100px fluid-gap override. Existing fluid logo and991px drawer boundary remain intact. Shared-header measurements are checked on all four captured routes at the desktop widths and the drawer neighbor; all six routes' navigation is also exercised by the full suite. The attached desktop dropdown has its own fixed240×198px frame,16px regular links and native decorative separators, with source-backed992/1100/1440 checks for frame/link geometry, destinations, Escape and outside dismissal.

### R9-7 — content-driven phone human copy

The native typing lifecycle measures the **currently rendered code DOMRange plus actual frame insets** to derive the row's intrinsic width. It is not a timed width animation or a hardcoded width sequence. At390, quiet/pandas/Dask states reproduce ~329.42/350.94/363.09px copy tracks and the final paragraph's four/three-line transition;479px has its corresponding states. Token spans and newline structure survive complete cycles.

`human-reference.json` contains200 fresh source samples; `human-local.json` samples normal motion at320/360/390/479 plus stable reduced-motion states. Assertions check both completed frames, highlighting/newlines, state widths, document width and copy ink inside the viewport. The original performance section explicitly clips decorative overhang; the native component has the same local boundary. It does not globally mask overflow or clip text. Reduced motion intentionally stays stable.

## Verification and inspected evidence

Final build/test/format/audit results are recorded in `round10/build.txt`, `tests.txt`, `format.txt`, `audit.json`, `checks.json`, and the regression summaries. Final frozen build passed; **72 outer regression groups passed, 0 failed**, including **193 focused round10 groups**, **673 exact rendered text-line arrays**, 363 specimen cells, 616 images, 99 press cards/dividers and44 window controls. Four normal-motion phone cycles and two reduced-motion states passed. Formatting/whitespace checks passed; dependency audit reports **0 vulnerabilities**. Exact signed SHA is supplied in the final handoff.

Measured maximum absolute geometry errors: specimen cells0.03125px, organization images0.40625px, organization intro0.109375px, press tracks0.265625px, closing tracks0.109375px and navigation0.015625px. These maxima do not include the explicitly bounded Use Cases residuals below. Final refreshed company/project details and desktop dropdown pairs were also visually inspected; native dotted-separator raster/paint differs from the source and is not represented as exact.

- Fresh GET/HEAD-only source measurements:44 route/width records at390/479/480/601/767/768/769/991/992/1100/1440, plus narrow320/360 specimens and independently observed typing phases.
- `round10/gallery.html`:18 canonical original-left/native-right page pairs. `neighbors.html` and the raw captures additionally cover landscape/press boundaries; two extra organization neighbor captures cover601/1100.
- `round10/details.html`:21 component-aligned specimen, organization, press, CTA/note pairs. Full page thumbnails: `inspect-*.png`.
- `reference-dividers.json` / `local-dividers.json`:99 separators and44 controls per side.
- `reference.json` / `local.json`: full raw element/ink/font/line data. `checks.json`: exhaustive target assertions. Historical regression artifacts are retained under `round10/regressions/` rather than silently replacing older rounds' reports.
- All18 canonical pairs and targeted typography/closing/press/organization details were inspected; additional boundary captures are included for independent review. No live form submission is required or performed.

## Honest limits / remaining differences

This is **not exact-equivalence certification**. The bounded intrinsic Use Cases residuals above remain. Native dashboard/gauge/counter/rail contours and small grid/dot/paint-phase differences remain measurable; page captures also contain unsynchronized normal motion versus stable reduced-motion native frames. Whole-page pixel percentages and height deltas are diagnostics, not acceptance evidence. Target measurements do not certify unmeasured elements or browsers.

The source's own320px specimen overlap is reproduced explicitly, not waived as a native deviation. Native local forms still prevent submission and truthfully report “Not sent”; no backend is fabricated. Blog/event redirect destinations remain explicitly pending, not guessed. Validation is Chromium on this host, not cross-engine, device or accessibility certification.

## Local integration instructions

Do not integrate merely because this package exists. Main sends the final exact signed SHA to the **same independent tester**. Only after that SHA is approved may main fast-forward the authorized local checkout using the shared object store (no fetch/push/PR needed): `git merge --ff-only <approved-SHA>`. This developer did not integrate main or change the card. The final handoff confirms clean status and stopped owned listeners.
