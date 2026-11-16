# Round 5 inspected evidence

Fully read independent-round4/REVIEW.md. Its R3-1/R3-2/R3-3 acceptances are retained; R4-1 is the only production correction this round.

Inspected fresh original/native palette pairs at767,768,769,991,992, including tracks, outer edges, all12 cells, paragraph line breaks, initial Salmon/hex/accessibility list and copy button. Tablet cell bounds and paragraph/list wrapping now agree closely.768/769/991 maximum observed cell-box errors are0.03125/0.046875/0.09375px respectively, with maximum initial-copy-box error0.03125px at each width. First and second swatch tracks are intentionally unequal, as observed.767/992 source differences remain visible but their accepted native cell geometry is unchanged.

`reference.json` contains read-only live computed measurements, not production implementation. All reference methods except GET/HEAD are blocked. `accepted-boundaries.json` preserves independently recorded native767/992 box baselines from the prior reviewed SHA. All12 colors were selected and actually copied/read at every tested resize. Selected Salmon survives the viewport changes; a reload then resets initial representative labels for comparison. Calculated contrast labels after selection are intentionally not forced to inaccurate legacy values.

Gallery pairs crop at the larger of the measured palette heights, not at an arbitrary masked fixed height. Uncropped1000px reference/native viewports are retained. Native rail icons, mixed-bold contrast text and background dot phase remain distinguishable; no pixel-exactness claim. Home height and other accepted residuals are not altered by this tablet-only fix.

All18 canonical native captures refreshed against cached traversed originals. Full prior responsive/motion/behavior suite rerun; current final logs and report are adjacent. Main owns the same independent tester re-review and all integration/card decisions.
