# Does the article accurately diagnose the phenomenon it descr
Claim level needed: describe. Stakes: exploratory.

Check each name below against the reason recorded for that pick. A name that does not match its reason means a wrong ID: fix picks.json and run this step again.

## Clarify the question (5.1)
- FQ-03 Definitional analysis

## Analyse the content (5.3)
- CM1-01 Historical analogy and parallel analysis [needs an additional source: comparator]
- CM1-14 Absence analysis [needs an additional source: reference structure]
- DM-07 Lens application [needs an additional source: reference structure]
- TC1-13 Analysis of competing hypotheses
- TC1-19 Toulmin argument analysis
- TC1-21 Fallacy analysis

## Test the findings (6)
- CH-01 Key assumptions check
- TC1-16 Disconfirmation search
- TC1-18 Internal consistency check

## Additional sources (resolved in 5.2, after this plan; nothing is gathered in step 4)
- CM1-01 needs a comparator. In 5.2: look in the user's material first. If it is not there, find the one item needed, from any source type, and ask the user for it only if none is found. Use it and record the item, its source, its type, the technique and whether code could check its wording. No approval is asked. If none is found, drop CM1-01 and say so.
- CM1-14 needs a reference structure. In 5.2: look in the user's material first. If it is not there, find the one item needed, from any source type, and ask the user for it only if none is found. Use it and record the item, its source, its type, the technique and whether code could check its wording. No approval is asked. If none is found, drop CM1-14 and say so.
- DM-07 needs a reference structure. In 5.2: look in the user's material first. If it is not there, find the one item needed, from any source type, and ask the user for it only if none is found. Use it and record the item, its source, its type, the technique and whether code could check its wording. No approval is asked. If none is found, drop DM-07 and say so.

## Checks by stakes tier, applied to each analysis result
- CM1-01: assumption and limitation statement
- CM1-14: assumption and limitation statement
- DM-07: spot check
- TC1-13: assumption and limitation statement
- TC1-19: spot check
- TC1-21: spot check

Spot check: run spot_check.py where the material lists quotes as Q1 (P1): "...". Otherwise re-read the source against ten quotations taken from the results and record how many were found exactly.

## Pause after step 6 (high stakes only)
If a chosen technique has a check that needs a person, show a small sample of the results with the labels or findings the model produced, and ask the user to review it, skip it or defer it. Skipped or deferred: list the check as not done and limit the confidence label to medium. Below high stakes this pause does not happen.

## Pause after 5.1
If a question technique produced findings, show them and ask the user to keep or edit the request. Edit: run steps 2 to 4 again. No reply: keep the request and say in the answer that it was not confirmed.

## 7 combine the findings (process step, always last)
Findings form: textual. Methods offered to the user:
- convergence matrix (recommended: compares the techniques' findings and marks agreement and dissonance)
- narrative synthesis (recommended: writes the answer after the matrix)
- quantitative pooling (offered only if the user confirms that two or more findings estimate the same quantity on the same scale)
Alongside: one confidence label (high, medium or low) and a one-line reason for each conclusion. A fact about the text (what it contains or lacks, checkable by reading) gets the label none.

## 8 answer: what it is based on (facts only, no judgements about the material)
- Material given: one source(s); content types: text. Name each source, its type and its size.
- Additional sources used: comparator for CM1-01; reference structure for CM1-14; reference structure for DM-07. Name the item, where it came from, its type, the technique that used it and whether code could check its wording.
- Techniques run, and what each used: CH-01 (the findings of the analysis); CM1-01 (the brief and the material); CM1-14 (the brief and the material); DM-07 (the brief and the material); FQ-03 (the brief and the material); TC1-13 (the brief and the material); TC1-16 (the findings of the analysis); TC1-18 (the findings of the analysis); TC1-19 (the brief and the material); TC1-21 (the brief and the material).
- Checks that need a person: left out at this stakes level. State that no person reviewed the results.
- Techniques dropped, and why; files that could not be read.

## Follow-up round (only if the user asks)
No picks were held back by the limit of 10.
After the user reads the synthesis, offer to reassess (at most 5 more techniques per round). If the user accepts, select again with the gaps, silences and conflicts the synthesis found, leave out techniques already run, run the new ones, and synthesise again.

