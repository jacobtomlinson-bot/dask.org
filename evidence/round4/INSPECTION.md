# Round 4 visual inspection notes

Original/reference is left in paired sheets. New live component references use the existing GET/HEAD-only reference browser and fully loaded lazy artwork. No original implementation/CSS/JS was copied into production.

- Cards390: inspected both phone-upper/lower pairs at readable size: all six artwork windows, dividers, titles, Tools/Data labels, tags and data lines; left CTA and its full-sized button now agree closely. Native first card350.78125px vs original350.8125px; CTA height308.8125 vs309.8125px. A roughly1px button/link border/box residual is not hidden by fixed heights.
- Cards601: all six plus CTA inspected together. Intrinsic fit-content sizing restores source landscape width rather than stretching cards to section width. First card native234.6875px wide vs original236.359375px; both258.203125px high. Artwork/divider/content spacing agrees closely; small width/edge/font differences remain.
- Cards768: all six inspected with original, including the multi-line Tools row and NASA/XGBoost titles; row content remains contained without height clipping. Desktop1440 sheet inspected too; its observed386px minimum CTA size is explicitly native min-block-size, not a clipped fixed card height.
- Palette479/480/601/767/768: inspected one-column→three-column→two-column transitions. Landscape source cell dimensions/relative positions are asserted by hex value, not original DOM order, for all12 colors. Actual clipboard write/read verified with all-color selection behavior. Existing tablet box-size mismatch is documented rather than claimed exact.
- Footer480/601/767: source/native group/logo/social/copyright composition inspected; measured heading positions differ<0.6px and total heights<1px. All six routes have separate captured footer images and layout assertions; neighbors479/768 retain phone/tablet composition.
- All18 canonical routes/views re-captured. First-view and independently bottom-anchored footer sheets for all six routes inspected; full unscaled originals and natives retained. These do not assert that every pixel or unsynchronized animation frame is equivalent.
- Full72 responsive text-bound/collision captures,28 full-cycle/phased-motion checks,12 loaded adoption-art checks and prior141 focused behavior cases remain exercised by the full runner. No live form submissions.

The still-present whole-page residuals are listed in ../REVIEW.md. Main owns independent tester re-review of the new signed SHA; this is developer evidence, not approval.
