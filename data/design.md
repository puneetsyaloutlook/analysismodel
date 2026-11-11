# Analysis methods: design document

Version 1.1, 11 November 2026. This document replaces the Schema report. It describes the whole process, from the user's input to the final answer, and is the place to record any change. `schema.json` contains the field vocabularies and tagging rules. Where this document and `schema.json` disagree, fix both in the same edit.

## 1. Purpose and status

The catalogue lists 236 analytical techniques in 12 families. It will become a skill that a chat or agent calls, and a website built from the same CSV. Neither is built, and the user has said the skill is not to be built yet.

Given a brief (one request plus material), the process picks the techniques that fit, runs them in a sensible order with the checks the stakes require, and combines the results into one answer.

Status: every part has been built and tested on small cases. No part has been run end to end on a real brief. All tag values are inference unless a row or a named source says otherwise.

## 2. The process

| Stage | What happens | Who decides | Implemented in |
|---|---|---|---|
| Intake | The user's input becomes a brief and a material profile. Gaps become questions. | Code and model fill in what they can see. The user answers the rest. | `scripts/intake.py` |
| Selection | Gates remove techniques that cannot run on the material. The model picks from those that remain. | Script for gates, model for the pick. | `scripts/select.py`, model |
| Sequencing | The picks are ordered into stages, preparation steps are added, and checks are attached. | Script. | `scripts/sequence.py` |
| Technique application | Each technique runs on the brief, independently of the others. | Model, using the technique record and its output specification. | Model |
| Checking | Each result gets the checks for the stakes tier and claim level. | Model, with code where the check is arithmetic or string matching. | Model, code |
| Synthesis | The findings are combined into an answer, with a confidence label and a one-line reason for each conclusion. | The user chooses the method, with a recommended default. | Model |
| Review | Only if the user asks: the skill selects again for the gaps the synthesis found, runs the new techniques and synthesises again. | The user. | Model, `select.py` |

Three rules apply throughout.

1. Each analytical technique runs on the brief. It does not analyse another technique's output. Preparation steps (their output is still the brief's material), checks (they apply to one result) and challenge techniques (they examine the findings, never the brief) are the only exceptions.
2. Synthesis is a fixed final step, not a technique. The catalogue lists analytical techniques only.
3. Stakes and claim level are set from the job. They are never stored per technique.

## 3. Intake

Intake accepts four kinds of input. For each it records what was measured by code, what the model inferred, and what is unknown.

| Input | How it is read | Limit |
|---|---|---|
| Link to an article or report | The model fetches the page and saves the text with the URL, publisher and date. | The fetch tool can summarise long pages, so quotes cannot be checked against the page. Intake flags this. Above exploratory stakes, ask for the document as a file. |
| Content pasted from an article or report | Saved as text. | Publisher, author and date are unknown unless the user says. |
| Typed text | Under 40 words it is the question. Longer text is material. | A question with no material produces a question asking for material. |
| Collection of documents, such as transcripts | Files or a folder (txt, md, html, docx, pdf, csv, tsv, xlsx). | Unreadable files are listed and the user is asked to paste the text. |

The output is two objects.

- **The brief:** one request, claim level needed, stakes tier and insight wanted. Each field is marked stated, inferred or missing. The request can have several parts or be open-ended, such as "tell me what insights I can get from this article". It is handled as one request and gets one set of techniques. Each pick states which part of the request it serves. For an open request the insight wanted is left empty, so it neither filters nor scores, and the claim level defaults to describe.
- **The material profile:** one value for each gate facet, per source where the facet belongs to a source. Code fills content type, representation, access depth, unit of analysis, source count, linkage, volume, document genre, language, personal and sensitive information signals, and data condition (duplicates, blank share). Units of analysis are offered broadly, because the unit depends on the question: text is offered as document, claim and topic, and as source when there are several.

Questions to the user:

- At most four at once, in this order: missing material or question, stakes, claim level, personal data, insight, linking, duplicates. The rest are held back.
- Each question has a recommended answer where one exists and a one-line reason.
- Time structure, collection basis, origin, producer interest and source dependence are never asked. They stay unknown unless the material states them.

Inferred without asking, and shown when the user confirms the brief: personal information as none for report-type documents with no emails, phone numbers or sensitive words; claim level and insight from the wording of the question. An open request such as "what insights can I get" leaves the insight empty.

## 4. Selection

1. Apply the privacy gate against the material profile. Security classification and licence are not used, because every technique is tagged any.
2. Apply the hard gates: content type, unit of analysis, access depth, source count and linkage. Units that a preparation step can derive pass with a note. A technique that fails only on content type or representation also passes with a note when every prepared artefact it consumes is produced by a technique that passed the gates. The check reads the technique records, not the input.
3. Apply the conditional gates when their condition is met: representation, time structure, collection basis, volume, data condition, language, minimum material and material needed from outside the input.
4. Apply `not_for_rules` and `requires`. A technique whose input artefact cannot exist yet, or that needs external material (a comparator, a reference structure or an earlier period), is kept with a note naming what is missing.
5. Count the techniques that reach the claim level needed. Warn if none does. The claim ceiling never removes a technique.
6. Give the model a one-line index (ID, name, purpose, use when) of every technique that passed. The model picks at most 10, in priority order, and the skill shows each pick with a one-line reason. Extra picks are held for the review step. The user can change the list but is not asked to choose from a shortlist.

Weights (insight type, prefers items, evidence status, source facets) change the order of the index only. They never remove a technique.

## 5. Sequencing

| Stage | Contents |
|---|---|
| 0 Frame | Techniques whose phase is frame. |
| 1 Prepare | Techniques whose phase is gather, or verify and prepare. Techniques that produce prepared material a chosen technique needs. De-identification when the material contains personal information. External material that a pick needs to run (41 techniques need one): the skill gathers only that item from a source that is not marketing or personal opinion, shows it to the user, or asks the user for it. If none is found, the technique is dropped and the plan says so. |
| 2 Analyse | Independent techniques, in any order, each on the brief. |
| 3 Check | Techniques whose phase is validate, plus the minimum checks for the stakes tier. |
| 4 Synthesise | A fixed step (section 7). |
| 5 Review | Only if the user asks after reading the synthesis (section 7). |

Checks come from two lists that are combined. Each technique lists its own minimum checks per stakes tier, and each higher tier contains the lower tier's checks. The claim level adds further checks (for example a held-out validation for prediction, or an alternative explanations check for an intervention effect).

## 6. Technique application

The model receives the technique record and its output specification, and writes a result in that shape. An output specification is two to three sentences describing the parts of the result, what each row or cell contains and what the result must name. All 236 techniques have one.

Test result: five techniques were each run with the row only and with the row plus the specification, and scored blind against eight-item checklists. The totals were 33 of 40 without and 37 of 40 with. The specification helped most for absence analysis and disconfirmation search. A full method card is therefore written only for a technique where a test run shows the record and specification produce a wrong or incomplete result. The test had one run per cell, and the same author wrote the specifications and the checklists.

## 7. Synthesis

Synthesis takes the findings of the independent analyses as its input. The skill offers the methods that apply and recommends one. It runs the recommended method if the user does not reply.

| Method | Applies when | Recommended when |
|---|---|---|
| Convergence matrix (agreement, partial agreement, dissonance, silence) | Two or more techniques were run. | Findings are textual or mixed. |
| Narrative synthesis | Always. | Findings are textual or mixed, after the convergence matrix. |
| Quantitative pooling | The user confirms that two or more estimates measure the same quantity on the same scale. | Findings are numeric and the user has confirmed. |
| Decision analysis and weighting | Option ranking is wanted. | Option ranking is wanted. |

After the synthesis the skill offers to reassess. The user decides. If the user accepts, the skill selects again using the gaps, silences and conflicts the synthesis found, leaves out techniques already run, runs the new ones and synthesises again. The skill never loops on its own.

The answer also states its basis as facts: what the user gave (each source, its type and size), any external material gathered and where from, which techniques ran and what each used, which techniques were dropped and why, any files that could not be read, and any checks not done because they need a person. It makes no judgement about whether the material is representative or sufficient, because the user chose the material and knows its limits.

Each conclusion in the answer gets one confidence label (high, medium or low) and a one-line reason. The reviewer reads the label to decide whether to trust the item or redo it. The rule is simple and is a design choice, not a published method:

- High: two or more techniques that count as corroboration (they differ in assumptions, data or direction of bias) support the conclusion and the checks for the stakes tier passed.
- Medium: one technique supports it and its checks passed, or several support it and a check failed.
- Low: one technique supports it and it was not checked, or its checks failed.

A challenge finding does not change the label. Challenging adds a finding and takes nothing away from what was already found, and anything can be challenged. The finding appears in the answer next to the conclusion it examines.

A check that failed or was skipped is named in the reason. The checks still run in stage 3 by stakes tier. They are not reported one by one.

The synthesis methods come from reviews of how to combine evidence from studies. Using them to combine the findings of techniques within one job is an extrapolation, and only abstracts and summary pages were read.

## 8. Catalogue and schema

| Family | Techniques |
|---|---|
| Frame the question | 6 |
| Decompose and map | 21 |
| Compare | 17 |
| Trace cause and test claims | 34 |
| Handle evidence | 29 |
| Project forward | 25 |
| Assess actors, options and risks | 19 |
| Challenge | 15 |
| Prepare and extract | 14 |
| Measure and model | 16 |
| Integrate across sources | 11 |
| Check extracted results | 29 |
| Total | 236 |

Each technique has 52 columns in `master/master_tagged.csv`: identity and text (ID, family, subgroup, name, what it does, fit test, status and evidence), 44 tag columns, and the output specification. Tag columns fall into five groups: input profile, selection, sequencing, robustness and the identity fields purpose and use when. Gate classes are hard gate, conditional, weight, advisory and not applicable. Claim ceiling is advisory.

The CSV is rebuilt from `master_base.csv` and the `tags_*.json` files. The output specifications are stored in `master/specs/out_*.json` and are added after the rebuild.

Artefact types (21), each tagged with a kind: brief (charter or question), prepared material (data source inventory, raw dataset or corpus, data dictionary, codebook, data quality report, screening log, cleaned dataset, feature set, training sample, held-out test sample, coded corpus, entity table, evidence base, claims register), finding (assumptions register, hypotheses matrix, comparison matrix, result, validation report) and report (final report). The held-out test sample is single use.

Stakes tiers: exploratory (the result decides what to look at next), decision-informing (one input to a decision that can be revisited at moderate cost) and high-stakes (a costly or hard to reverse decision, or one that affects rights, safety or finances, or an authoritative publication).

## 9. Decisions made in this consolidation

| # | Conflict found | Decision |
|---|---|---|
| 1 | The schema called claim ceiling a hard gate. The script uses it as a count and warning, because as a gate it removed structuring and appraisal techniques (8 of 32 expected picks passed, then 30 of 32 after the change). | Claim ceiling is advisory. `schema.json` is changed. |
| 2 | The schema said to return a shortlist of 5 to 15 by score. A score-ranked list of 15 found 8 of 32 expected picks, and the model reading the index found 22 of 32. | The model reads the index of everything that passed the gates. Scores order it only. |
| 3 | The schema said the model chooses techniques and orders them by the artefacts they consume. The sequencing rule orders by stage. | Stage rules decide the order. Artefact dependencies apply only inside the prepare stage. |
| 4 | Frame techniques consume the agreed brief and produce a draft, so the state falls. | Frame techniques (reframing, decision-first framing, definitions, multiple models, SMART check) are additive. Each shows what the question looks like from one angle and produces a finding that goes to the synthesis next to the others. They do not change the brief and nothing returns to selection. They now produce a result, not a revised brief. |
| 5 | The schema fields used `technique_id` and `technique_name`, and lacked five CSV columns. | The schema now lists all columns and maps the two names to `id` and `technique`. The validator skips the text columns. |
| 6 | Family names are capitalised in the CSV, and the schema said value ids are lower case. | Family names are labels in sentence case. The convention is reworded. |
| 7 | Test jobs used `language: English`, which is not a schema value. | Language is `single` or `multiple`. The two jobs are corrected. |
| 8 | The Schema report described the older design (234 techniques, three input types replaced, no sequencing or synthesis). | This document replaces it. The old report is kept as `Schema report (superseded).md`. |
| 9 | Early wording called selection tags "input values". | Material profile (facts about the material) and job settings (question, claim level, stakes, insight). The selection rules are the tags on each technique. |
| 10 | Intake first offered only document and claim as units for text, which removed 82 techniques that the hand-written test job kept. | Intake offers every unit the material can support. |

Decision 4 is a design choice made here and has not been reviewed.

Decisions made with the user after the first version:

| # | Question | Decision |
|---|---|---|
| 11 | Does the brief need a specific question? | No. The brief is one request, which can have several parts or be open-ended. One set of techniques serves it, and each pick states which part it serves. |
| 12 | Should the process loop? | Only when the user asks after reading the synthesis. The skill then selects again for the gaps found. |
| 13 | Should correlated errors between techniques be handled? | No. The techniques share one material and one model by design. The synthesis states this as a limit. |
| 14 | What does the process do when a technique needs material outside the input? | It gathers only what that technique needs to run (a comparator, a reference structure or an earlier period), never material in general. |
| 15 | How much should the output say about certainty? | One confidence label and a one-line reason per conclusion. The reviewer redoes the work if it does not feel right, so likelihood terms and roll-ups are dropped. |
| 16 | Do challenge techniques challenge the brief? | No. The user has standing over the brief and the skill does not. Challenge techniques (devil's advocacy, premortem, red team, steelmanning, key assumptions check and similar) examine the findings of the analysis, so they run in stage 3. Nine techniques (CH-01 to CH-05, CH-08, CH-10 to CH-12) now list the result as an input. |
| 17 | Should the claim level be limited by what the material can support? | No. The output describes its basis as facts and does not judge the material. |
| 18 | Should intake ask about classification and licence? | No. No technique uses them, so asking changes nothing. Both fields stay in the schema, marked not applicable, in case a deployment needs them. Personal data is still asked, because it adds the de-identification step and removes the few techniques that cannot take personal information. |
| 19 | Which checks need a person? | The model states it for each check in the check library (field human_involvement). Needed: human review sample, independent review, expert review. Conditional: gold standard agreement, needed unless the material already has labels made by trained people. Optional: spot check, which code or a person can do. All others need no person. A check that needs a person is not done by the process, and the answer basis lists it as not done. The user reviews the whole answer. |
| 20 | Is there a limit on techniques? | Yes. The model picks at most 10 in the first round, in priority order. Preparation steps added for a pick, de-identification and checks do not count. Extra picks are held and offered at the review step, and each review round adds at most 5. The numbers are defaults chosen here, not measured. |
| 21 | Do challenge findings affect confidence? | No. A challenge technique adds a finding. It does not reduce the validity of what was found, and anything can be challenged. The finding goes into the synthesis next to the conclusion it examines. |
| 22 | Leftover text from the earlier design | Removed: the three-way gate at the end of preparation, the four-output set (claim level achieved, certainty, likelihood term), and the wording "claim level the evidence supports". The claim level needed now adds checks and triggers a warning when no technique reaches it. |
| 23 | Selection judged only the material as given, so a technique that needs a table of coded themes was removed for a text input even though a coding technique could produce it. | A content type or representation failure is waived when every prepared artefact the technique consumes is produced by a technique that passed the gates. On the five test jobs this restores 0 to 6 techniques, because most of them also fail on access depth or unit of analysis, which are not waived. |

## 10. Open items

Design:

- `select.py` notes techniques that need external material, and `sequence.py` lists what to gather. Neither script finds the material. The skill does that at run time. The minimum-material field (`requires_minimum`) is still not applied by the script.
- The deployment settings (highest permitted privacy class, code execution, human reviewer) are in the schema and not in `select.py`.
- Selection recall (22 of 32) was measured before the catalogue changes and has not been re-run. AO-09 and AO-15 were missed on job 5. Their use-when text was improved and not retested.
- Origin, producer interest and source dependence are not inferred from the publisher, so appraisal techniques see unknown.
- The confidence rule is untested.
- The review step is described in the sequencer output and not tested.
- Synthesis has never run on real results. Confidence labels are untested.
- Output specifications are tested on five of 236 techniques.
- The skill, the website and an end-to-end run on a real brief are not built.
- Intake does not read images, audio or video. Genre, language and privacy rules are untested on long documents, scanned PDFs and non-English text. Claim level and insight rules are keyword matches.

Catalogue data (from the spot check; the first six were fixed):

- Fixed: TC1-08 (claim ceiling), TC-03 (access depth), HE-05 and CK-12 (model suitability), CM1-12 (source count), HE1-11 (consumes appraised evidence base).
- Not fixed: PE-02 (consumes and produces no result artefact), CH-03 and CH-11 (inconsistent consumes and produces), IS-06 (linkage requirement).
- Frame family: FQ-01 to FQ-06 share one identical minimum-checks string, including a second technique at high stakes.
- Input validation is listed for deterministic techniques but used by 22 non-deterministic rows. HE-06 (deterministic) uses repeat runs.
- Only 14 of 236 rows use `not_for_rules`. HE1-06 and IS-05 use source dependence, a weight, as a hard exclusion, which conflicts with the rule that weights never remove a technique.
- Access depth is written two ways for the same meaning (`any` and `requires=narrative only`). Pick `any`.
- About 30 relation targets in other families were chosen from titles or short descriptions.
- No artefact type for diagrams, argument maps, personas, a labelled gold set, an event table or a provenance graph. No unit of analysis for actor, case, option, text span or event.
- Review the 15 techniques at the intervention effect ceiling and the 12 at the mechanism or counterfactual ceiling.
- Some frameworks could not be confirmed (the PHIA technique list, Heuer and Pherson names). Most opened sources were abstracts or secondary pages. No framework specifies checks per stakes tier, so that field is entirely inference.

## 11. Files

| File | Role |
|---|---|
| `master/Analysis methods design.md` | This document. |
| `schema/schema.json` | Field vocabularies, gate classes, artefact types, check library, tiers, matching, sequencing, synthesis, intake, application. Version 1.1.0. Previous version: `schema/schema.before_consolidation.json`. |
| `master/master_tagged.csv` | The catalogue: 236 rows, 52 columns, with output specifications. |
| `master/master_base.csv`, `master/tags/tags_A.json` to `tags_F.json` | Sources of the CSV text and tags. |
| `master/specs/out_1.json` to `out_6.json` | Output specifications. |
| `scripts/intake.py`, `select.py`, `sequence.py`, `validate_tags.py` | Process scripts and the tag validator. |
| `master/test_jobs/`, `intake_test/`, `master/card_test/` | Test jobs, intake inputs and the output specification test. |
| `master/spot_check.md` | The independent check of 30 rows. |

## 12. Change rule

A change to a field, a gate, a stage or a method is made in `schema.json` and in this document together. A change to a technique's text or tags is made in the source files and the CSV is rebuilt. After any change, run the validator (`python3 -I scripts/validate_tags.py master/tags/tags_*.json`), then run `select.py` and `sequence.py` on the test jobs and compare the counts with the last recorded run.
