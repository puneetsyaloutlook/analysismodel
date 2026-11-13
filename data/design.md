# MANIFST: design document

Version 1.2.3, 13 November 2026. This document describes the whole process, from the user's request to the answer, and is the place to record any change. `schema.json` contains the field vocabularies and tagging rules. Where this document and `schema.json` disagree, fix both in the same edit.

## 1. Purpose and status

MANIFST is the working name for the whole design: the catalogue, the process and the rules. It replaces "analysis model", which was confused with the language model that does the work. In this document "the model" always means the language model. The name is a respelling of manifest (a ship's list of what it carries, and a word for something plain to see) and is provisional.

The catalogue lists 236 analytical techniques in 12 families. It will become a skill that a chat or agent calls. The user has said the skill is not to be built yet.

Given a brief, the process chooses the techniques that fit, runs them in order, checks their findings and combines them into one answer.

Status:

- Every part has been built and tested on small cases.
- One complete run was done on 11 November 2026, on ten interview quotes, under version 1.1 of this design. Its output is shown in the simulator on the documentation site.
- The documentation site is built from this document, the schema and the catalogue.
- Version 1.2 changes six rules (decisions 24 to 30 in section 9). Versions 1.2.1 to 1.2.3 add decisions 31 to 34. The scripts and the stored run still follow version 1.1. Section 10 lists what has to change.
- All tag values are inference unless a row or a named source says otherwise.

## 2. The process

The process has eight steps. The numbers are used the same way in this document, the schema and the simulator.

| Step | What happens | Who does it |
|---|---|---|
| 1. Intake | The user's input becomes a brief. Gaps become questions to the user. | Code and the model fill in what they can read. The user answers the rest. |
| 2. Rule out techniques | Each technique is tested against the brief. Techniques that cannot run on the material are removed. The rest are eligible. | Code |
| 3. Choose analysis techniques | The model reads a list of the eligible techniques and chooses at most 10, with a reason for each. | The model. The user can change the list where the application shows it. |
| 4. Plan analysis sequence | The chosen techniques are placed in a sequence, with a description of what each group does and a note of which techniques need outside material. Preparation techniques and checks are added. | Code |
| 5. Run the techniques | 5.1 Examine the question. 5.2 Prepare the material, including any outside material, which the user approves. 5.3 Analyse the material. | The model, with code for arithmetic and text matching. The user confirms the request after 5.1 and approves any outside material in 5.2. |
| 6. Check the findings | Verification and challenge techniques run on the findings. The library checks are applied to each result. | The model and code. Checks that need a person are listed as not done. |
| 7. Combine the findings | The findings become conclusions. Each conclusion gets a confidence label and a one-line reason. | The model. The user can choose the method. |
| 8. Answer | The answer is given with a list of what it is based on. The user can ask for a follow-up round. | The model. The user decides on a follow-up round. |

### Terms

Each term below has one meaning in this document.

| Term | Meaning |
|---|---|
| Request | What the user asks, in their words. It can have several parts or be open-ended. |
| Settings | The three answers that shape the run: stakes, strength of statement needed, and kind of finding wanted. |
| Material | The content the user gives for analysis. |
| Description of the material | The properties of the material that requirements are tested against, such as content type and number of sources. |
| Brief | The request, the settings, the material and the description of the material. |
| Technique | Any of the 236 analytical techniques in the catalogue. The step names call them analysis techniques. |
| Requirement | A condition a technique places on the brief. A technique that fails a requirement is removed. |
| Eligible technique | A technique that meets every requirement that applies. |
| Chosen technique | An eligible technique the model selected in step 3. |
| Sequence | The order in which the chosen techniques run, in four groups. |
| Reserve list | Techniques the model wanted beyond the limit. They are offered in a follow-up round. |
| Removed, dropped | Removed: failed a requirement in step 2. Dropped: chosen, then left out because outside material it needs was not found or the user did not approve it. |
| Result | Everything one technique produces. |
| Finding | One statement in a result. |
| Conclusion | One statement in the answer, drawn from the findings. |
| Library check | One of the 18 checks in the check library, such as a spot check or repeat runs. It is applied to one result. |
| Work | Everything produced in steps 1 to 7: the description of the material, the eligible and chosen techniques, the sequence, each technique's result, the checks and the combined findings. |
| Output | The answer given to the user in step 8. It is the only output. |
| Follow-up round | A second pass through steps 2 to 8, run only when the user asks for it after reading the answer. |

### Kinds of technique

Every technique belongs to one of five kinds. The kind decides what the technique works on and when it runs.

| Kind | Works on | Produces | Runs in |
|---|---|---|---|
| Question technique | The request | Findings about the request | 5.1 |
| Preparation technique | The material | Prepared material | 5.2 |
| Primary technique | The material, including prepared material | The findings that the answer is built on | 5.3 |
| Verification technique | The findings of the analysis | Findings about those findings | 6 |
| Challenge technique | The findings of the analysis | Findings that question them | 6 |

The kind comes from the technique's phase tag: frame gives a question technique, gather or verify and prepare gives a preparation technique, analyse gives a primary technique, and validate gives a verification technique or, in the Challenge family, a challenge technique.

### Rules that apply throughout

1. A primary technique works on the material. It never works on another primary technique's result. Primary techniques are independent of each other and can run in any order.
2. Combining the findings (step 7) is a fixed step, not a technique. The catalogue lists techniques only.
3. Stakes and strength of statement are set for the brief. They are never stored per technique.
4. Only the user changes the request. The process can show the user what it found about the request and ask. It never rewrites the request itself.
5. The process never starts a follow-up round on its own.

## 3. Step 1: Intake

Intake accepts four kinds of input. For each it records what code measured, what the model inferred and what is unknown.

| Input | How it is read | Limit |
|---|---|---|
| Link to an article or report | The model fetches the page and saves the text with the URL, publisher and date. | The fetch tool can summarise long pages, so quotes cannot be checked against the page. Intake flags this. Above exploratory stakes, ask for the document as a file. |
| Content pasted from an article or report | Saved as text. | Publisher, author and date are unknown unless the user says. |
| Typed text | Under 40 words it is the request. Longer text is material. | A request with no material produces a question asking for material. |
| Collection of documents, such as transcripts | Files or a folder (txt, md, html, docx, pdf, csv, tsv, xlsx). | Unreadable files are listed and the user is asked to paste the text. |

The output is the brief. Each part is marked stated, inferred or missing.

**The request.** One request, which can have several parts or be open-ended, such as "tell me what insights I can get from this article". It is treated as one request and gets one set of techniques.

**The settings.**

| Setting | Question to the user | Values | What it changes |
|---|---|---|---|
| Stakes | What will the result be used for? | Exploratory: the result decides what to look at next. Decision-informing: one input to a decision that can be revisited at moderate cost. High-stakes: a costly or hard to reverse decision, one that affects rights, safety or finances, or an authoritative publication. | Higher stakes add library checks. |
| Strength of statement needed | What is the strongest statement you need to make? | Describe. Show a link between things. Predict, without claiming a cause. Estimate the effect of an action. Explain how or why. | It adds library checks, guides the choice in step 3 and is reported in the answer. It never removes a technique. |
| Kind of finding wanted | What kind of finding are you after? | Pattern, difference, contradiction, cause, trend, gap, risk, option ranking. More than one can apply. | It guides the choice in step 3. It never removes a technique. |

For an open-ended request the kind of finding is left empty and the strength of statement defaults to describe.

**The description of the material.** One value for each property that a requirement tests, recorded per source where the property belongs to a source. Code fills content type, structure, level of detail available, unit of analysis, number of sources, whether sources can be joined, amount of material, document type, language, signs of personal and sensitive information, and known data problems (duplicates, share of blanks). Units of analysis are offered broadly, because the unit depends on the request: text is offered as document, claim and topic, and as source when there are several.

Questions to the user:

- At most four at once, in this order: missing material or request, stakes, strength of statement, personal information, kind of finding, joining of sources, duplicates. The rest are not asked in that round.
- Each question has a recommended answer where one exists and a one-line reason.
- Time structure, how the sample was chosen, origin, the producer's interest and whether sources depend on each other are never asked. They stay unknown unless the material states them.
- Security classification and licence are not asked, because no technique uses them.

Inferred without asking, and shown when the user confirms the brief: no personal information, for report-type documents with no emails, phone numbers or sensitive words; strength of statement and kind of finding, from the wording of the request.

## 4. Steps 2 and 3: Rule out and choose analysis techniques

### Step 2: Rule out techniques

Code tests every technique against the description of the material. A technique that fails a requirement is removed. The requirements are applied in this order.

1. **Personal information.** A technique that cannot take personal information is removed when the material has it. It is kept, with a note, when de-identification is in the plan and runs before it. It is removed when the material is marked sensitive and the user has not agreed to de-identify.
2. **Requirements that always apply:** content type, unit of analysis, level of detail available, number of sources and whether sources can be joined. A unit that a preparation technique can derive passes with a note.
3. **Requirements that apply in some cases:** structure, time structure, how the sample was chosen, amount of material, known data problems, language, minimum amounts and material needed from outside the input. Each applies only when its stated condition is met.
4. **Each technique's own exclusions and inputs.** A technique whose input cannot exist yet, or that needs outside material (a comparator, a reference structure or an earlier period), is kept with a note naming what is missing.

One waiver applies. A technique that fails only on content type or structure is kept, with a note, when every prepared input it needs is produced by an eligible technique. The level of detail, the unit of analysis and the other requirements are never waived.

Step 2 also counts the eligible techniques that reach the strength of statement needed, and warns when none does.

### Step 3: Choose analysis techniques

The model receives the brief and a one-line entry (ID, name, purpose, use when) for every eligible technique. The entries are ordered by a score for kind of finding and evidence status. The score changes the order only.

The model chooses at most 10 techniques, using these criteria in order:

1. Every part of the request has at least one technique.
2. At least one technique reaches the strength of statement needed, when an eligible one fits the request. If none fits, the model says so and gives the reason.
3. The techniques match the kind of finding wanted, where the user gave one.
4. Where two techniques serve the same part of the request, prefer a pair with different methods, so that their agreement adds confidence (section 7).

The model records a one-line reason for each chosen technique, naming the part of the request it serves. The reasons are kept with the plan (section 5). The chosen techniques are work (section 7), so the user sees them only where the application shows work. Where it does, the user can change the list but is not asked to choose from it.

Limits. All kinds of technique count towards the 10. Preparation techniques added for a chosen technique, de-identification and library checks do not count. Techniques the model wanted beyond the limit go on the reserve list. A follow-up round adds at most 5. The numbers are defaults chosen here, not measured.

## 5. Step 4: Plan analysis sequence

Code places the chosen techniques in one sequence. Each technique's kind decides its group and position, and the plan describes what each group does for the request.

The plan is shown as a table with one row per technique, in running order and without numbers. The columns are the group (First, Next, Then, Last, each with a short name such as "Look at your question"), the technique, what the group does, and whether the technique needs outside material: none, or a comparator, a reference structure or an earlier period. The group and its description are shown once and cover all the techniques in the group. The table does not say that a group runs before another because it has to. It says what the group does and, where the order matters to the user, what follows from it.

| Position | What runs | What it does for the request |
|---|---|---|
| First | Techniques that examine the question | Checks how the question is worded, what its terms mean and what it assumes. If a technique finds a problem, the user sees it and can change the question before the rest runs. |
| Second | Techniques that prepare the material | Gets the content ready: checks how reliable the sources are and puts the content in the form later techniques need. De-identification, when it is needed, is the first of these. |
| Third | Primary techniques, which analyse the material | Does the main analysis. Each technique analyses the content on its own, so a finding that several of them reach counts for more. |
| Last | Techniques that check the findings, then the library checks | Tests the findings: checks quotes against the content, looks for evidence against the findings and tests how easily they change. |

A position with no chosen technique is left out. Steps 5 and 6 run this sequence: the first three positions are sub-steps 5.1 to 5.3 and the last is step 6.

The plan also adds two things, each with its reason:

- A preparation technique that produces an input a chosen technique needs. The reason names the technique that needs it.
- De-identification, when the material has personal information.

The plan keeps the reason for each chosen technique from step 3 and the reason for each addition, and describes what each group does. The plan is work (section 7). The reasons are kept so that the answer can describe the process followed.

Outside material. 41 of the 236 techniques need a comparator (14), a reference structure (25) or an earlier period (2). Step 4 only records the need in the third column of the table. Nothing is searched for or gathered in step 4, because no technique has run. Step 5.2 resolves the need.

Library checks come from two lists that are combined. Each technique lists its own minimum checks for each stakes level, and each higher level includes the checks of the level below. The strength of statement adds further checks, for example a held-out validation for prediction or an alternative explanations check for the effect of an action.

## 6. Step 5: Run the techniques

### 5.1 Examine the question

Question techniques run first. Each one produces findings about the request, such as a term that can be read two ways.

When 5.1 produced findings, the process shows them and asks the user one thing: keep the request as it is, or edit it.

- If the user keeps the request, the run continues at 5.2 with the same techniques.
- If the user edits the request, steps 2 to 4 run again on the new request, because different techniques may now fit. Question techniques that already ran are not chosen again. The user is asked only once per round.
- If the user does not reply, the request stays as it is, the run continues, and the answer says the request was not confirmed.
- If no question technique was chosen, 5.1 is skipped and nothing is asked.

The findings from 5.1 are kept in every case. They go to step 7 with the other findings and appear in the answer.

### 5.2 Prepare the material

Preparation techniques run in the order their inputs require. Their output is still the brief's material.

Outside material. For each chosen technique that needs it, 5.2 resolves the need in this order:

1. Look in the user's content. If the item is already there, use it and note where.
2. If not, find the one item the technique needs, from a source that is not marketing or personal opinion, or ask the user to supply it. Nothing else is gathered.
3. Show the user the item and its source. The user approves it before any technique uses it.
4. If none is found, or the user does not approve it, the technique is dropped. The answer says which technique was dropped and why.

Outside material is the one case where content the user did not supply enters the analysis, which is why the user approves it.

### 5.3 Analyse the material

Each primary technique runs on the brief, independently of the others.

### How a technique is run

The model receives the technique record and its result format, and writes a result in that format. A result format is two to three sentences describing the parts of the result, what each row or cell contains and what the result must name. All 236 techniques have one.

Test result: five techniques were each run with the record only and with the record plus the result format, and scored blind against eight-item checklists. The totals were 33 of 40 without and 37 of 40 with. The result format helped most for absence analysis and disconfirmation search. A full method card is therefore written only for a technique where a test run shows the record and result format produce a wrong or incomplete result. The test had one run per cell, and the same author wrote the result formats and the checklists.

## 7. Steps 6 to 8: Check, combine and answer

### Step 6: Check the findings

Three things happen, in this order.

1. **Verification techniques** run on the findings of the analysis, for example a search for disconfirming statements or a sensitivity analysis.
2. **Challenge techniques** run on the findings of the analysis, for example devil's advocacy or a premortem. They never challenge the brief.
3. **Library checks** are applied to each result, as set by the stakes and the strength of statement.

A library check that needs a person is not done by the process. Human review sample, independent review and expert review always need a person. Gold standard agreement needs a person unless the material already has labels made by trained people. A spot check can be done by code or a person. The answer lists every check that was not done.

### Step 7: Combine the findings

The process offers the methods that apply and recommends one. It runs the recommended method if the user does not reply.

| Method | Applies when | Recommended when |
|---|---|---|
| Agreement table (agree, partly agree, conflict, not covered) | Two or more techniques ran. | Findings are text or mixed. |
| Narrative summary | Always. | Findings are text or mixed, after the agreement table. |
| Pooling of estimates | The user confirms that two or more estimates measure the same thing on the same scale. | Findings are numeric and the user has confirmed. |
| Decision analysis and weighting | An option ranking is wanted. | An option ranking is wanted. |

For each conflict between findings, the process names the cause or states that the conflict is unresolved.

Each conclusion gets one confidence label (high, medium or low) and a one-line reason. The user reads the label to decide whether to trust the conclusion or redo the work. The rule is a design choice, not a published method, and is untested.

| Label | When it is given |
|---|---|
| High | Two or more techniques with different methods agree, and their checks passed. |
| Medium | One technique supports the conclusion and its checks passed. Or two or more techniques agree, and a check failed or was not done, or a verification finding limits the conclusion, or the techniques do not have different methods. |
| Low | One technique supports the conclusion and none of its checks passed. Or techniques conflict and the conflict is unresolved. |

Different methods. Every technique in a run reads the same material and is run by the same model, so two techniques cannot be independent in data or model. They count as having different methods when they read the material in different ways, for example one counts cases and one searches for disconfirming statements. The model states the difference in the reason. Two techniques tagged as substitutes for each other do not count. The answer states the shared material and model as a limit.

Checks that need a person. A check that was not done because it needs a person is named in the reason. At high stakes it limits the label to medium until a person does it. At lower stakes it does not change the label.

Failed checks at high stakes. At high stakes a failed check makes the label low for each conclusion that depends on it, and the reason names the check.

Challenge findings do not change the label. A challenge finding is an added finding and appears in the answer next to the conclusion it examines.

### Step 8: Answer

The answer is the only output of the process. Everything produced in steps 1 to 7 is work.

- The answer is always given to the user. It must be complete without the work, so it names the techniques that ran and the checks that were not done.
- The work is kept. How much of it the user sees depends on the application that runs the process: it can show the work as it happens, show it on request or not show it.
- Where the process asks the user to decide something, it always shows what the user needs for that decision: the brief at intake, the findings from 5.1, any outside material found in 5.2, the methods offered in step 7 and the gaps behind a follow-up round.
- The user can change the chosen techniques only in an application that shows them.

The answer gives the conclusions with their labels and reasons. It then states three things as facts.

**Strength of statement reached.** Which chosen techniques reach the strength of statement the user needed, and which conclusions they support. When none did, the answer says so in its first lines.

**What the answer is based on.**

- What the user gave: each source, its type and size.
- Any outside material used, where it came from and that the user approved it.
- Which techniques ran and what each worked on.
- Which techniques were dropped, and why.
- Any files that could not be read.
- Any checks that were not done.
- Whether the user confirmed the request after 5.1.

The answer can also include a section on the process followed: the techniques chosen, the sequence they ran in and the recorded reasons for both. Whether the answer includes this section by default is not yet decided (section 10).

The answer makes no judgement about whether the material is representative or sufficient, because the user chose the material and knows its limits.

**Follow-up round.** The process offers one. If the user accepts, steps 2 to 4 run again for the gaps and unresolved conflicts found in step 7, leaving out techniques that already ran and starting from the reserve list. The new techniques run, and steps 6 to 8 are repeated with all the findings.

The methods in step 7 come from reviews of how to combine evidence from studies. Using them to combine the findings of techniques within one run is an extrapolation, and only abstracts and summary pages were read.

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

Each technique has 52 columns in `master/master_tagged.csv`: identity and text (ID, family, subgroup, name, what it does, fit test, status and evidence), 44 tag columns, and the result format. Tag columns fall into five groups: input profile, selection, sequencing, robustness and the identity fields purpose and use when.

The schema and the scripts keep their original field names. This table gives the name used in this document for each.

| Name in the schema | Name in this document |
|---|---|
| Gate, gate class | Requirement, requirement type |
| Hard gate | Always applies |
| Conditional | Applies in some cases |
| Weight | Changes the order |
| Advisory | Raises a warning |
| Material profile, facet | Description of the material, property |
| Claim level needed, claim ceiling | Strength of statement needed, strongest statement a technique supports |
| Associate; predict without implying cause; estimate an intervention effect; explain mechanism or counterfactual | Show a link between things; predict, without claiming a cause; estimate the effect of an action; explain how or why |
| Stakes tier | Stakes |
| Insight type | Kind of finding |
| Representation | Structure |
| Access depth | Level of detail available |
| Linkage | Whether sources can be joined |
| Collection basis | How the sample was chosen |
| Volume class, data condition flags | Amount of material, known data problems |
| Artefact; consumes; produces | Working document; needs as input; makes as output |
| Output specification | Result format |
| Answer basis | What the answer is based on |
| Convergence matrix; dissonance; silence | Agreement table; conflict; not covered |
| Phase (frame, gather, verify and prepare, analyse, validate) | Kind of technique (section 2) |
| Pick, held | Chosen technique, reserve list |
| Review | Follow-up round |

The CSV is rebuilt from `master_base.csv` and the `tags_*.json` files. The result formats are stored in `master/specs/out_*.json` and are added after the rebuild.

Working documents. The schema defines 21 types, each tagged with a kind: brief (charter or question), prepared material (data source inventory, raw dataset or corpus, data dictionary, codebook, data quality report, screening log, cleaned dataset, feature set, training sample, held-out test sample, coded corpus, entity table, evidence base, claims register), finding (assumptions register, hypotheses matrix, comparison matrix, result, validation report) and report (final report). The held-out test sample is single use.

## 9. Decisions

This section is a dated history. The current rules are in sections 2 to 7. Where an entry below differs from those sections, those sections apply.

Conflicts found when the design was consolidated (version 1.0):

| # | Conflict found | Decision |
|---|---|---|
| 1 | The schema called claim ceiling a hard gate. The script uses it as a count and warning, because as a gate it removed structuring and appraisal techniques (8 of 32 expected picks passed, then 30 of 32 after the change). | Claim ceiling raises a warning only. `schema.json` is changed. |
| 2 | The schema said to return a shortlist of 5 to 15 by score. A score-ranked list of 15 found 8 of 32 expected picks, and the model reading the full list found 22 of 32. | The model reads the list of every eligible technique. Scores order it only. |
| 3 | The schema said the model chooses techniques and orders them by the working documents they need. The ordering rule orders by kind. | Kind decides the order. Input dependencies apply only among preparation techniques. |
| 4 | Frame techniques took the agreed brief as input and produced a draft. | Frame techniques produce a finding and do not change the brief. Replaced in part by decision 25. |
| 5 | The schema fields used `technique_id` and `technique_name`, and lacked five CSV columns. | The schema now lists all columns and maps the two names to `id` and `technique`. The validator skips the text columns. |
| 6 | Family names are capitalised in the CSV, and the schema said value ids are lower case. | Family names are labels in sentence case. The convention is reworded. |
| 7 | Test jobs used `language: English`, which is not a schema value. | Language is `single` or `multiple`. The two jobs are corrected. |
| 8 | The Schema report described the older design (234 techniques, three input types replaced, no ordering step and no combining step). | This document replaces it. The old report is kept as `Schema report (superseded).md`. |
| 9 | Early wording called selection tags "input values". | Material profile (facts about the material) and job settings (question, claim level, stakes, insight). The selection rules are the tags on each technique. |
| 10 | Intake first offered only document and claim as units for text, which removed 82 techniques that the hand-written test job kept. | Intake offers every unit the material can support. |

Decisions made with the user for version 1.1 (11 November 2026):

| # | Question | Decision |
|---|---|---|
| 11 | Does the brief need a specific question? | No. The brief has one request, which can have several parts or be open-ended. |
| 12 | Should the process loop? | Only when the user asks after reading the answer. |
| 13 | Should correlated errors between techniques be handled? | No. The techniques share one material and one model by design. The answer states this as a limit. |
| 14 | What does the process do when a technique needs material outside the input? | It gathers only what that technique needs to run, never material in general. |
| 15 | How much should the output say about certainty? | One confidence label and a one-line reason per conclusion. Likelihood terms and roll-ups are dropped. |
| 16 | Do challenge techniques challenge the brief? | No. Only the user changes the brief. Challenge techniques examine the findings, so they run in step 6. Nine techniques (CH-01 to CH-05, CH-08, CH-10 to CH-12) now list the result as an input. |
| 17 | Should the strength of statement be limited by what the material can support? | No. The answer describes what it is based on as facts and does not judge the material. |
| 18 | Should intake ask about classification and licence? | No. No technique uses them. Both fields stay in the schema, marked not used. |
| 19 | Which checks need a person? | The check library states it for each check (field `human_involvement`). A check that needs a person is not done by the process and is listed as not done. |
| 20 | Is there a limit on techniques? | Yes. At most 10 in the first round and at most 5 in each follow-up round. |
| 21 | Do challenge findings affect confidence? | No. A challenge finding is an added finding. |
| 22 | Leftover text from the earlier design. | Removed: the three-way gate at the end of preparation, the four-output set (claim level achieved, certainty, likelihood term), and the wording "claim level the evidence supports". Changed in part by decision 26. |
| 23 | Step 2 judged only the material as given, so a technique that needs a table of coded themes was removed for a text input even though a coding technique could produce it. | A content type or structure failure is waived when every prepared input the technique needs is produced by an eligible technique. On the five test jobs this restores 0 to 6 techniques. |

Decisions made with the user for version 1.2 (12 November 2026), after a review of the design for logic and wording:

| # | Problem found | Decision |
|---|---|---|
| 24 | "Stage" named three sequences: seven process stages, six plan stages numbered from 0, and seven technique phases. "Brief" had two definitions. | One numbered list of eight steps, with sub-steps 5.1 to 5.3. The brief is the request, the settings, the material and the description of the material. |
| 25 | Frame techniques ran first, but nothing used their findings until the end. | They run first as 5.1. The process shows their findings and the user keeps or edits the request. An edit runs steps 2 to 4 again. |
| 26 | The strength of statement was asked for, and the answer never said whether it was reached. | The model chooses at least one technique that reaches it when one fits. The answer states which techniques reached it and which conclusions they support. |
| 27 | The choice in step 3 had no stated criteria. | Four criteria, in order: cover every part of the request, reach the strength needed, match the kind of finding, prefer pairs with different methods. |
| 28 | The confidence rule did not cover agreement without checks, conflicts or checks that need a person. Its test for independence could never be met, because every technique shares the material and the model. | The rule in section 7. Independence means different methods. |
| 29 | A technique that cannot take personal information was removed even when de-identification would run first. | It is kept, with a note, when de-identification is in the plan. |
| 30 | Rule 1 listed three exceptions and did not cover the verification techniques. Several rules were stated only in this history. Words such as check, review, result and gate had more than one meaning or needed decoding. | Five kinds of technique, each defined by what it works on. All current rules are in sections 2 to 7. One term for one thing, listed in section 2, with the schema names mapped in section 8. |
| 31 | The design did not say which results the user receives and which are working material. Decided on 13 November 2026. | The answer in step 8 is the only output. Everything before it is work, shown as the running application allows. Decision points always show what the user needs to decide. |
| 32 | Step 4 showed the sequence under the numbers of later sub-steps, and gave no reason for the order. Decided on 13 November 2026. | Steps 3 and 4 are named "Choose analysis techniques" and "Plan analysis sequence". The plan is one sequence with a stated reason for each position, shown without sub-step numbers. The reasons for choosing and sequencing are recorded for a possible section in the answer on the process followed. The kind of technique that runs in 5.3 is renamed from analysis technique to primary technique, because "analysis technique" now means any technique. |
| 33 | Step 4 told the user what was or was not gathered from outside, before any technique had run. The design did not say when outside material is gathered or that the user approves it. Decided on 13 November 2026. | Step 4 records only which techniques need outside material, as a column in the plan table (group, technique, why the group runs there, needs outside material). Step 5.2 resolves each need: content first, then one item from a source that is not marketing or opinion, or from the user. The user approves any outside item before use. Step 8 reports it. |
| 34 | The step 4 table explained each group by saying it runs before or after another, which tells the user nothing, because something has to run first. Decided on 13 November 2026. | The table says what each group does for the request, and mentions the order only where it has a consequence for the user (the question can be changed after the first group). The reason for each chosen technique stays in step 3. |

## 10. Open items

Not yet changed to version 1.2:

- `select.py` does not apply the personal information waiver (decision 29).
- `sequence.py` still labels the sequence as stages 0 to 3, has no pause after 5.1, does not describe what each group does and does not list which techniques need outside material as a column (decisions 24, 25, 32 and 33). Nothing yet asks the user to approve outside material in 5.2.
- The instruction given to the model in step 3 does not yet state the four criteria (decisions 26 and 27).
- The stored run of 11 November followed version 1.1. Its two question techniques ran first and the user was not asked to confirm the request. Its answer does not state the strength of statement reached.
- The schema and the catalogue keep their original field names (section 8).

Design:

- `select.py` notes techniques that need outside material, and `sequence.py` lists what to gather. Neither script finds the material. The process does that at run time. The minimum amounts field (`requires_minimum`) is still not applied by the script.
- The deployment settings (highest permitted privacy class, code execution, human reviewer) are in the schema and not in `select.py`.
- Step 3 recall (22 of 32) was measured before the catalogue changes and the four criteria, and has not been re-run. AO-09 and AO-15 were missed on test job 5. Their use-when text was improved and not retested.
- Origin, the producer's interest and whether sources depend on each other are not inferred from the publisher, so appraisal techniques see unknown.
- The confidence rule, the request confirmation after 5.1 and the follow-up round are untested.
- Not decided: whether the answer includes a section on the process followed by default, or only on request.
- Steps 6 to 8 have run once, on one small brief.
- Result formats are tested on five of 236 techniques.
- The skill is not built.
- Intake does not read images, audio or video. The rules for document type, language and personal information are untested on long documents, scanned PDFs and non-English text. The rules for strength of statement and kind of finding are keyword matches.

Catalogue data (from the spot check; the first six were fixed):

- Fixed: TC1-08 (claim ceiling), TC-03 (access depth), HE-05 and CK-12 (model suitability), CM1-12 (source count), HE1-11 (consumes appraised evidence base).
- Not fixed: PE-02 (consumes and produces no result artefact), CH-03 and CH-11 (inconsistent consumes and produces), IS-06 (linkage requirement).
- Frame family: FQ-01 to FQ-06 share one identical minimum-checks string, including a second technique at high stakes.
- Input validation is listed for deterministic techniques but used by 22 non-deterministic rows. HE-06 (deterministic) uses repeat runs.
- Only 14 of 236 rows use `not_for_rules`. HE1-06 and IS-05 use source dependence, a field that only changes the order, as an exclusion.
- Access depth is written two ways for the same meaning (`any` and `requires=narrative only`). Use `any`.
- About 30 relation targets in other families were chosen from titles or short descriptions.
- No working document type for diagrams, argument maps, personas, a labelled gold set, an event table or a provenance graph. No unit of analysis for actor, case, option, text span or event.
- Review the 15 techniques whose strongest statement is the effect of an action and the 12 whose strongest statement is how or why.
- Some frameworks could not be confirmed (the PHIA technique list, Heuer and Pherson names). Most opened sources were abstracts or secondary pages. No framework specifies checks per stakes level, so that field is entirely inference.

## 11. Files

| File | Role |
|---|---|
| `master/Analysis methods design.md` | This document. |
| `schema/schema.json` | Field vocabularies, requirement types, working document types, check library, stakes levels, and the rules for steps 1 to 8. Version 1.2.3. |
| `master/master_tagged.csv` | The catalogue: 236 rows, 52 columns, with result formats. |
| `master/master_base.csv`, `master/tags/tags_A.json` to `tags_F.json` | Sources of the CSV text and tags. |
| `master/specs/out_1.json` to `out_6.json` | Result formats. |
| `scripts/intake.py`, `select.py`, `sequence.py`, `validate_tags.py` | Process scripts for steps 1, 2 and 4, and the tag validator. |
| `master/test_jobs/`, `intake_test/`, `master/card_test/` | Test briefs, intake inputs and the result format test. |
| `master/spot_check.md` | The independent check of 30 rows. |
| `run1/` | The complete run of 11 November 2026: inputs, plan, results and combined findings. |

## 12. Change rule

A change to a field, a requirement, a step or a method is made in `schema.json` and in this document together. A change to a technique's text or tags is made in the source files and the CSV is rebuilt. After any change, run the validator (`python3 -I scripts/validate_tags.py master/tags/tags_*.json`), then run `select.py` and `sequence.py` on the test briefs and compare the counts with the last recorded run.
