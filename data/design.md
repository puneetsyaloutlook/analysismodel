# startthat.work: design document

Version 1.5.5, 24 November 2026. This document describes the whole process, from the user's request to the answer, and is the place to record any change. `schema.json` contains the field vocabularies and tagging rules. Where this document and `schema.json` disagree, fix both in the same edit.

## 1. Purpose and status

startthat.work is the name of the whole design: the catalogue, the process and the rules. It is also the address of the site (decision 57). It replaces "analysis model", which was confused with the language model that does the work. In this document "the model" always means the language model. The skill that runs the process is named analysis (decision 41).

The catalogue lists 304 techniques in 19 families: 236 analysis techniques in 12 families, which steps 3 to 6 use, and 68 techniques for combining and reporting in 7 families, which steps 7 and 8 use. It is packaged as a skill that a chat or agent calls. The skill is built (a zip with the process, the catalogue, the schema, the prompts and seven scripts). The user has run it once inside Claude, on an article (decision 40 came from that run). Its high-stakes path, personal information waiver and follow-up round have not been run.

Given a brief, the process chooses the techniques that fit, runs them in order, checks their findings and combines them into one answer.

Status:

- Every part has been built and tested on small cases.
- One complete run was done on 23 November 2026, on an article of about 2,050 words with a two-part question, under version 1.5.1 of this design, with each technique as a separate agent (decision 67). It replaced an earlier run on ten interview quotes, made on 13 November 2026 under version 1.2.4. Its output is shown in the simulator on the documentation site.
- The documentation site is built from this document, the schema and the catalogue. It also has a page, Use the skill, with the skill to download and the steps to install it in Claude and in GitHub Copilot (decision 45).
- Version 1.2 changes six rules (decisions 24 to 30 in section 9). Versions 1.2.1 to 1.2.23 add decisions 31 to 59. Versions 1.3.0 to 1.5.5 add decisions 60 to 70. The scripts and the skill follow version 1.2.10 (versions 1.2.11 to 1.2.23 change the site and the record only, except that 1.2.21 changes the name in the skill text). Version 1.3.0 changes the catalogue, the schema, steps 3, 7 and 8, the prompts, `select.py` and the skill text. Versions 1.3.1 and 1.3.2 change catalogue evidence text only. Version 1.4.0 adds the catalogue field `method_steps` and changes the schema, the technique record, the run prompt, the skill text and the site. Version 1.4.1 writes method steps for the other 43 rows and changes catalogue evidence text only. Version 1.5.0 changes steps 1 to 3, 5.2, 7 and 8, adds the catalogue column `question_scope` and changes the schema, the scripts, the prompts and the skill text (decision 65). Version 1.5.1 changes the order of the Try it group in the site navigation and the skill is unchanged (decision 66). Version 1.5.2 replaces the run shown in the simulator and the skill is unchanged (decision 67). The stored run follows version 1.5.1. Version 1.5.3 adds a preview image and preview tags to the site and the skill is unchanged (decision 68). Version 1.5.4 replaces the logo in the site header and the skill is unchanged (decision 69). Version 1.5.5 adds a favicon to the site and the skill is unchanged (decision 70). Section 10 lists what is untested.
- All tag values are inference unless a row or a named source says otherwise.

## 2. The process

The process has eight steps. The numbers are used the same way in this document, the schema and the simulator.

| Step | What happens | Who does it |
|---|---|---|
| 1. Intake | The user's input becomes a brief. Gaps become questions to the user. | Code and the model fill in what they can read. The user answers the rest. |
| 2. Rule out techniques | Each technique is tested against the brief. Techniques that cannot run on the material are removed. The rest are eligible. | Code |
| 3. Choose analysis techniques | The model reads a list of the eligible techniques and chooses at most 10, with a reason for each. | The model. The user can change the list where the application shows it. |
| 4. Plan analysis sequence | The chosen techniques are placed in a sequence, with a description of what each technique does and a note of which need additional sources. Preparation techniques and checks are added. | Code |
| 5. Run the techniques | 5.1 Examine the question. 5.2 Prepare the material, including any additional sources. 5.3 Analyse the material. | The model, with code for arithmetic and text matching. The user confirms the request after 5.1. |
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
| Technique | Any of the 304 techniques in the catalogue. 236 are analysis techniques, which steps 3 to 6 use, and 68 are techniques for combining and reporting, which steps 7 and 8 use. The step names call the first group analysis techniques. |
| Requirement | A condition a technique places on the brief. A technique that fails a requirement is removed. |
| Eligible technique | A technique that meets every requirement that applies. |
| Chosen technique | An eligible technique the model selected in step 3. |
| Sequence | The order in which the chosen techniques run, in four named groups. |
| Reserve list | Techniques the model wanted beyond the limit. They are offered in a follow-up round. |
| Removed, dropped | Removed: failed a requirement in step 2. Dropped: chosen, then left out because the additional source it needs was not found, or because its run did not finish. |
| Result | Everything one technique produces. |
| Finding | One statement in a result. |
| Conclusion | One statement in the answer, drawn from the findings. It has a title that states the finding as a sentence, an explanation, a confidence label and a reason. The label and reason are recorded. The answer groups conclusions by the label and shows it only when the user asks (decision 46). |
| Insight | A finding that goes against, or beyond, what the request or the material would lead a reader to expect. It states the expectation and what the analysis found instead. |
| Summary | The first part of the answer: the direct answer to the request in plain sentences, with how far to trust it and what it leaves open. |
| Library check | One of the 18 checks in the check library, such as a spot check or repeat runs. It is applied to one result. |
| Work | Everything produced in steps 1 to 7: the description of the material, the eligible and chosen techniques, the sequence, each technique's result, the checks and the combined findings. |
| Output | The answer given to the user in step 8. It is the only output. |
| Follow-up round | A second pass through steps 2 to 8, run only when the user asks for it after reading the answer. |

### Kinds of technique

Every technique belongs to one of seven kinds. The kind decides what the technique works on and when it runs.

| Kind | Works on | Produces | Runs in |
|---|---|---|---|
| Question technique | The request | Findings about the request | 5.1 |
| Preparation technique | The material | Prepared material | 5.2 |
| Primary technique | The material, including prepared material | The findings that the answer is built on | 5.3 |
| Verification technique | The findings of the analysis | Findings about those findings | 6 |
| Challenge technique | The findings of the analysis | Findings that question them | 6 |
| Conclusion technique | The findings of the analysis and of steps 5 and 6 | A conclusion, or a statement of how sure it is | 7 |
| Report technique | The conclusions | The written answer, its display or a check of it | 8 |

The kind comes from the technique's phase tag: frame gives a question technique, gather or verify and prepare gives a preparation technique, analyse gives a primary technique, and validate gives a verification technique or, in the Challenge family, a challenge technique. Conclude gives a conclusion technique and report gives a report technique (decision 60).

### Rules that apply throughout

1. A primary technique works on the material. It never works on another primary technique's result. Primary techniques are independent of each other and can run in any order.
2. Steps 7 and 8 each have a fixed part that always runs and a part chosen from the catalogue. The fixed part is not a technique. The chosen techniques work on the findings and the conclusions, never on the material alone (decision 60).
3. Stakes and strength of statement are set for the brief. They are never stored per technique.
4. Only the user changes the request. The process can show the user what it found about the request and ask. It never rewrites the request itself.
5. The process never starts a follow-up round on its own.
6. A technique whose run does not finish is dropped, with the reason. The process never writes a result for it. The answer lists it among the techniques that were dropped.

### Status

The process defines the states of a run so that whatever runs it (a chat, an agent, an editor assistant or a script) can show where the run is. The design defines the states. It does not define how they are delivered: an application can narrate them, send them as events, keep them in a record or map them to its own task list. A run does not have to be resumable.

| Applies to | States |
|---|---|
| A step | Waiting to start. Running. Waiting for you. Done. Skipped (the step does not apply, for example 5.1 when no question technique was chosen). |
| A technique | Removed (step 2). Eligible. Chosen. Reserve. Running. Done. Dropped (with the reason). |
| A library check | Done. Not done, because it needs a person and the user did not review the sample (high stakes only). Left out, because it needs a person and the stakes are below high-stakes. |
| The answer | Not yet given. Given. |

A step is waiting for you only at one of the decision points: confirm the brief, parts the material cannot answer, confirm the request after 5.1, review a sample of the results (high stakes only), confirm that estimates measure the same thing, or ask for a follow-up round. The status names the decision point, so the application can show what the user needs to decide.

Rules for the status:

- The process sets the state before a step begins and after it ends, so the state is never behind the run.
- At most one step is waiting for you at a time.
- A step is done only when all its sub-steps are done or skipped.
- The status is work. The answer is the only output.

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

**Parts of the request and their scope.** The model splits the request into parts and tags each part with a scope. A part has scope material when the supplied material can answer it: what the text says, how it argues, what it contains or leaves out. A part has scope topic when answering it needs evidence about the world beyond the supplied material, for example whether a text's account of practice is accurate. Code cannot tell the two apart, so the model proposes a scope for each part from the wording and the user confirms it. The parts and their scopes are part of the brief, and only the user changes them (decision 65).

**The settings.**

| Setting | Question to the user | Values | What it changes |
|---|---|---|---|
| Stakes | What will the result be used for? | Exploratory: the result decides what to look at next. Decision-informing: one input to a decision that can be revisited at moderate cost. High-stakes: a costly or hard to reverse decision, one that affects rights, safety or finances, or an authoritative publication. | Higher stakes add library checks. |
| Strength of statement needed | What is the strongest statement you need to make? | Describe. Show a link between things. Predict, without claiming a cause. Estimate the effect of an action. Explain how or why. | It adds library checks, guides the choice in step 3 and is reported in the answer. It never removes a technique. |
| Kind of finding wanted | What kind of finding are you after? | Pattern, difference, contradiction, cause, trend, gap, risk, option ranking. More than one can apply. | It guides the choice in step 3. It never removes a technique. |

For an open-ended request the kind of finding is left empty and the strength of statement defaults to describe.

**The description of the material.** One value for each property that a requirement tests, recorded per source where the property belongs to a source. Code fills content type, structure, level of detail available, unit of analysis, number of sources, whether sources can be joined, amount of material, document type, language, signs of personal and sensitive information, and known data problems (duplicates, share of blanks). Units of analysis are offered broadly, because the unit depends on the request: text is offered as document, claim and topic, and as source when there are several.

Questions to the user:

- At most four at once, in this order: missing material or request, the scope of each part, stakes, strength of statement, personal information, kind of finding, joining of sources, duplicates. The rest are not asked in that round.
- Each question has a recommended answer where one exists and a one-line reason.
- When the brief is confirmed, the process shows the request restated in one sentence and split into its parts, each with its scope. The user can correct a part or a scope before any technique is chosen.
- Time structure, how the sample was chosen, origin, the producer's interest and whether sources depend on each other are never asked. They stay unknown unless the material states them.
- Security classification and licence are not asked, because no technique uses them.

Inferred without asking, and shown when the user confirms the brief: no personal information, for report-type documents with no emails, phone numbers or sensitive words; strength of statement and kind of finding, from the wording of the request.

## 4. Steps 2 and 3: Rule out and choose analysis techniques

### Step 2: Rule out techniques

Code tests every technique against the description of the material. A technique that fails a requirement is removed. The requirements are applied in this order.

1. **Personal information.** A technique that cannot take personal information is removed when the material has it. It is kept, with a note, when de-identification is in the plan and runs before it. It is removed when the material is marked sensitive and the user has not agreed to de-identify.
2. **Requirements that always apply:** content type, unit of analysis, level of detail available, number of sources and whether sources can be joined. A unit that a preparation technique can derive passes with a note.
3. **Requirements that apply in some cases:** structure, time structure, how the sample was chosen, amount of material, known data problems, language, minimum amounts and additional sources needed. Each applies only when its stated condition is met.
4. **Each technique's own exclusions and inputs.** A technique whose input cannot exist yet, or that needs an additional source (a comparator, a reference structure or an earlier period), is kept with a note naming what is missing.

One waiver applies. A technique that fails only on content type or structure is kept, with a note, when every prepared input it needs is produced by an eligible technique. The level of detail, the unit of analysis and the other requirements are never waived.

Step 2 also counts the eligible techniques that reach the strength of statement needed, and warns when none does.

Question scope. Each technique has a question scope (the catalogue column `question_scope`): text, when the technique examines the supplied text itself (its argument, wording, credibility or omissions); topic, when it needs evidence about the world beyond the supplied material; both, when it works on the material as data about the world; and not applicable for conclude and report techniques. Scope does not remove a technique. It orders the list: when the brief has a part with scope topic, techniques with scope topic or both are scored higher, and the entry for each technique shows its scope so that the model can match it to the part it serves (decision 65).

### Step 3: Choose analysis techniques

The model receives the brief and a one-line entry (ID, name, purpose, use when) for every eligible technique. The entries are ordered by a score for kind of finding and evidence status. The score changes the order only. The list holds analysis techniques only. Techniques whose phase is conclude or report are left out, because steps 7 and 8 choose them (decision 60).

The model chooses at most 10 techniques, using these criteria in order:

1. Every part of the request has at least one technique that can answer that part. A technique counts for a part only if its requirements are met by the material or by something 5.2 can supply, and only if its scope fits the part: a technique with scope text serves only parts with scope material. Matching the wording of a part is not enough.
2. At least one technique reaches the strength of statement needed, when an eligible one fits the request. If none fits, the model says so and gives the reason.
3. The techniques match the kind of finding wanted, where the user gave one.
4. Where two techniques serve the same part of the request, prefer a pair with different methods, so that their agreement adds confidence (section 7).

The model records a one-line reason for each chosen technique, naming the part of the request it serves. For each part that no eligible technique can answer, it records the part and the reason in the plan as a part the material cannot answer.

Parts the material cannot answer. When such a part exists, the process stops and asks the user one question with three choices: add outside evidence (5.2 then gathers it, and the part is chosen again), edit the request, or continue without that part. With no reply the run continues without the part, and the first paragraph of the answer says which part was not answered (decision 65). A part with scope topic is not unanswerable when outside evidence is permitted, because 5.2 supplies it. The reasons are kept with the plan (section 5). The chosen techniques are work (section 7), so the user sees them only where the application shows work. Where it does, the user can change the list but is not asked to choose from it.

Limits. All kinds of technique count towards the 10. Preparation techniques added for a chosen technique, de-identification and library checks do not count. Techniques the model wanted beyond the limit go on the reserve list. A follow-up round adds at most 5. The numbers are defaults chosen here, not measured.

## 5. Step 4: Plan analysis sequence

Code places the chosen techniques in one sequence. Each technique's kind decides its group and position. The groups do no work themselves, so the plan describes what each technique does.

The plan is shown as a table of techniques under four group headings, in running order and without numbers. The columns are the technique, what the technique does (the catalogue's one-sentence purpose), and whether it needs an additional source: none, or a comparator, a reference structure or an earlier period.

| Position | Group name | What runs |
|---|---|---|
| 1 | Clarify the question | Techniques that examine the question |
| 2 | Prepare the content | Techniques that prepare the material. De-identification, when it is needed, is the first of these. |
| 3 | Analyse the content | Primary techniques, which analyse the material. They are independent of each other, so a finding that several reach counts for more. |
| 4 | Test the findings | Techniques that check the findings, then the library checks |

The plan is work (section 7), so the user may never see it. It does not carry decision points. The one decision that follows from the order, whether to reword the question after the first group, is asked in 5.1.

A position with no chosen technique is left out. Steps 5 and 6 run this sequence: the first three positions are sub-steps 5.1 to 5.3 and the last is step 6.

The plan also adds two things, each with its reason:

- A preparation technique that produces an input a chosen technique needs. The reason names the technique that needs it.
- De-identification, when the material has personal information.

The plan keeps the reason for each chosen technique from step 3 and the reason for each addition. The plan is work (section 7). The reasons are kept so that the answer can describe the process followed.

Additional sources. 41 of the 236 techniques need a comparator (14), a reference structure (25) or an earlier period (2). Step 4 only records the need in the third column of the table. Nothing is searched for or gathered in step 4, because no technique has run. Step 5.2 resolves the need. The 68 conclude and report techniques need outside material of other kinds: audience information (10), decision information (2) and a panel (1), besides a comparator (7) and a reference structure (24). Step 5.2 does not gather any of it. The model takes it from the brief or from the technique record, and drops the technique when it is not there (decision 60).

Library checks come from two lists that are combined. Each technique lists its own minimum checks for each stakes level, and each higher level includes the checks of the level below. The strength of statement adds further checks, for example a held-out validation for prediction or an alternative explanations check for the effect of an action.

## 6. Step 5: Run the techniques

### 5.1 Examine the question

Question techniques run first. Each one produces findings about the request, such as a term that can be read two ways.

When 5.1 produced findings, the process shows them and asks the user one thing: keep the request as it is, or edit it.

- If the user keeps the request, the run continues at 5.2 with the same techniques.
- If the user edits the request, steps 2 to 4 run again on the new request, because different techniques may now fit. Question techniques that already ran are not chosen again. The user is asked only once per round.
- If the user does not reply, the request stays as it is, the run continues, and the answer says the request was not confirmed.
- If no question technique was chosen, 5.1 is skipped and nothing is asked.

The only choices are keep and edit. A user who wants the answer to draw on more than their own material edits the request to say so, and steps 2 to 4 then show which techniques need additional sources. The process does not add other options to the question.

The findings from 5.1 are kept in every case. They go to step 7 with the other findings and appear in the answer.

### 5.2 Prepare the material

Preparation techniques run in the order their inputs require. Their output is still the brief's material.

Additional sources. For each chosen technique that needs one, 5.2 resolves the need in this order, after the plan exists:

1. Look in the user's material. If the item is already there, use it and note where.
2. If not, find the one item the technique needs. Any source type can be used, and the item is recorded with its type and what it can show (see Source types below). Ask the user to supply it only when no suitable item is found.
3. Use the item. Record the item, its source, its source type, the technique that used it and whether code could check its wording.
4. If none is found, the technique is dropped. The answer says which technique was dropped and why.

Nothing else is gathered for additional sources. No source is searched for before the plan, and no list of sources is offered. Gathering outside evidence for a part with scope topic is a separate action, described next. The user is not asked to approve an item, for three reasons. Techniques already work without approval. The user chose the scope when they kept or edited the request at 5.1. The rule on sources applies to the model. The answer lists every additional source (section 7), so the user can check or reject any of them, and a follow-up round can run again without one. A finding that rests on a source whose wording code could not check, such as a summary returned by a fetch tool, is limited in confidence (section 7).

Gathering outside evidence. For each part with scope topic, and only when the user has allowed outside evidence (the choice at the end of step 3, or the answer to the scope question), 5.2 gathers an evidence base:

1. Write one to four questions for the part, each one a question that evidence could answer, such as how common something is, whether one measure predicts another, or what a group of vendors claims or does.
2. Search for sources for each question. No source type is excluded: research, government and standards bodies, vendors, consultancies, trade press, marketing, opinion and social media can all be sources. Save each source as a file with its link, publisher and date.
3. Record each source in `evidence_base.json` with its type, how it was read (full text, search summary or fetch summary) and what it is used to show (see Source types).
4. Techniques that consume an evidence base use these files. The evidence base is the only outside material they read.

Source types. A source is used for one of two purposes, and the record says which. To show what the source says or does, any source type is primary evidence: what a vendor claims, how it prices, what a consultancy framework measures, what an author argues. To show what is true of the world, a promotional, advocacy or opinion source cannot stand alone: the claim is reported as unconfirmed unless a source that does not gain from the claim agrees. Where the question is about promotion itself, such as how vendors describe the value of a product, promotional sources are the material and count as primary. The answer states, for each finding that rests on outside evidence, which purpose its sources served (decision 65).

### 5.3 Analyse the material

Each primary technique runs on the brief, independently of the others.

### How a technique is run

The model receives the technique record and its result format, and writes a result in that format. A result format is two to three sentences describing the parts of the result, what each row or cell contains and what the result must name. All 304 techniques have one.

A technique whose evidence status is Practice or Unconfirmed also carries method steps (the field `method_steps`): a numbered list of what to do, in order, written from a named source and ending with that source. The record passes the steps to the model, which follows them in order and says where the material cannot supply what a step needs. The other techniques run from the record and the result format, and the model supplies the method from its own knowledge. All 54 practice and unconfirmed rows at the time of decision 63 have steps (decisions 63 and 64).

Test result: five techniques were each run with the record only and with the record plus the result format, and scored blind against eight-item checklists. The totals were 33 of 40 without and 37 of 40 with. The result format helped most for absence analysis and disconfirmation search. Method steps are therefore written for the practice and unconfirmed rows, where the model has less published method to draw on, and for any other technique where a test run shows the record and result format produce a wrong or incomplete result. The test had one run per cell, and the same author wrote the result formats and the checklists.

## 7. Steps 6 to 8: Check, combine and answer

### Step 6: Check the findings

Three things happen, in this order.

1. **Verification techniques** run on the findings of the analysis, for example a search for disconfirming statements or a sensitivity analysis.
2. **Challenge techniques** run on the findings of the analysis, for example devil's advocacy or a premortem. They never challenge the brief.
3. **Library checks** are applied to each result, as set by the stakes and the strength of statement.

A library check that needs no person is done by the process, by code or by running the technique again. That includes spot checks and repeat runs. Human review sample, independent review and expert review always need a person. Gold standard agreement needs a person unless the material already has labels made by trained people.

Checks that need a person apply at high stakes only. Below high stakes the plan leaves them out, because a wrong conclusion is cheap to find and correct and the check would not change any label. The answer then says that no person reviewed the results. At high stakes the process stops at the end of step 6, shows the user a small sample of the results with the labels or findings the model produced, and the user reviews it, skips it or defers it. Reviewing the sample tests the output, not the decision points inside the process, so it takes minutes and not the time of redoing the analysis.

### Step 7: Combine the findings

Step 7 has a fixed part and a chosen part. The user is not asked to choose between them (decision 60).

Fixed part. These methods run when their condition is met.

| Method | Runs when |
|---|---|
| Agreement table (agree, partly agree, conflict, not covered) | Two or more techniques ran. |
| Narrative summary | Always, after the agreement table. |
| Pooling of estimates | The user confirms that two or more estimates measure the same thing on the same scale. |
| Decision analysis and weighting | An option ranking is wanted. |

Chosen part. `select.py` writes a list of the eligible conclusion techniques (families CF and UC). The model reads the request, the stakes and the findings, and chooses at most 3, with a one-line reason for each. A technique that needs a reference structure gets one by the same lookup as 5.2 (the user's material first, then one item from any source type, recorded with its type). A technique that needs outside material that the brief does not hold and that cannot be looked up (a panel, or decision information) is dropped, and the answer says so. The step 7 agent applies the chosen techniques as it writes the conclusions. They change how a conclusion is formed or how its uncertainty is stated. They do not change the label rule below.

For each conflict between findings, the process names the cause or states that the conflict is unresolved.

Each conclusion gets one confidence label (high, medium or low) and a one-line reason. The label is recorded for every conclusion. The answer groups the conclusions by it and shows the label itself only when the user asks (decision 46). The rule is a design choice, not a published method, and is untested.

| Label | When it is given |
|---|---|
| High | Two or more techniques with different methods agree, and their checks passed. |
| Medium | One technique supports the conclusion and its checks passed. Or two or more techniques agree, and a check failed or was not done, or a verification finding limits the conclusion, or the techniques do not have different methods. |
| Low | One technique supports the conclusion and none of its checks passed. Or techniques conflict and the conflict is unresolved. |

Different methods. Every technique in a run reads the same material and is run by the same model, so two techniques cannot be independent in data or model. They count as having different methods when they read the material in different ways, for example one counts cases and one searches for disconfirming statements. The model states the difference in the reason. Two techniques tagged as substitutes for each other do not count. The answer states the shared material and model as a limit.

Checks that need a person. They apply at high stakes only. A check that the user did not review is named in the reason and limits the label to medium until a person does it. Below high stakes the check is left out and does not change the label.

Additional sources. A conclusion that depends on an additional source whose wording code could not check, for example a summary returned by a fetch tool, is limited to medium, and the reason names the source.

Failed checks at high stakes. At high stakes a failed check makes the label low for each conclusion that depends on it, and the reason names the check.

Challenge findings do not change the label. A challenge finding is an added finding and appears in the answer next to the conclusion it examines.

Facts about the text. A finding that states what the supplied text contains or lacks, and that anyone can check by reading it (for example that it names no source for a claim, or that it uses a word in two senses), is a fact about the text. It is recorded with the label none and a reason that says it was read directly from the text. A judgement about the text, such as whether its argument is sound, is an inference and gets a label (decision 65).

Titles and scope. Each conclusion has a title that states the finding as a sentence, an explanation of two to four sentences, the label and a reason in plain words. A statement about what the process did not look at is not a conclusion and gets no label. It goes in the answer under what was not covered. A statement that the material does not contain something, found by a technique, is a conclusion and gets a label.

Insights. When the request asks for insights, or when a conclusion goes against what the request assumed, step 7 also writes insights. Each states what the request or the material would lead a reader to expect, what the analysis found instead, and why the difference matters. An insight gets a label by the same rule as the conclusions it rests on. A recommendation is not an insight. The answer gives recommendations only when the request asks for them.

### Step 8: Answer

The answer is the only output of the process. Everything produced in steps 1 to 7 is work.

- Where the application can create a document, the answer is delivered as a document, so that the user can keep, share and export it. Otherwise it is given in the reply (decision 44).
- The answer is always given to the user. It must be complete without the work, so it names the techniques that ran and the checks that were not done.
- The work is kept. How much of it the user sees depends on the application that runs the process: it can show the work as it happens, show it on request or not show it.
- Where the process asks the user to decide something, it always shows what the user needs for that decision: the brief at intake, the findings from 5.1, the estimates that may be pooled and the gaps behind a follow-up round.
- The user can change the chosen techniques only in an application that shows them.

Choosing report techniques. `select.py` writes a list of the eligible report techniques (families SA, VD, RU, RA and RC). The model chooses at most 4, with a one-line reason for each. Recommendation techniques (RA) are chosen only when the request asks for recommendations or names an audience. Display techniques (VD and RU) are chosen only when the answer shows numbers or charts. A technique that needs outside material that the brief does not hold, such as audience information, is dropped. The step 8 agent applies the chosen techniques as it writes the answer. They change how the parts below are written and shown, not which parts there are or the fixed words. A technique that checks the report (RC) checks the written answer against the conclusions, and the agent corrects the answer, never a conclusion or a label.

The answer has these parts, in this order.

1. **Summary.** The direct answer to the request, in two to four short paragraphs of whole sentences with no technique codes. It says what the analysis found, in the order a reader needs it, how far to trust it and what it leaves open. A reader who has seen nothing else must be able to understand what was found.
2. **Conclusions,** in three groups. Facts about the text (label none) come first, shown without a label under the heading "What the text contains" and introduced by the fixed words below. Then well supported conclusions (label high), then then conclusions with weaker support (label medium or low). Each shows its title and its explanation. In the second group each also carries a caveat: one or two plain sentences saying why the support is weaker. The conclusions have no codes, and the answer shows the labels and their reasons only when the user asks for them. Each group is introduced by the fixed words below.
3. **Insights,** when step 7 wrote any, introduced by the fixed words below. An insight whose label is medium or low carries a caveat in the same way.
4. **What was not covered.** The parts of the request the analysis did not answer, and what the process did not look at. These have no label. When a part of the request could not be answered, the first paragraph of the summary says which part and why.
5. **Strength of statement reached.**
6. **What the answer is based on.**
7. **The offer of a follow-up round.**

Fixed words for the groups of conclusions. Well supported: "Two or more techniques that read the material in different ways agree on each of these conclusions, and the checks on them passed." Weaker support: "The analysis supports these conclusions less well. After each one, a sentence says why." Limit, added to the first group shown: "All the techniques read the same material and used the same language model, which limits how far any conclusion can be trusted."

Fixed words for the labels, used only when the user asks to see them: "Confidence shows how well the analysis supports a conclusion as it is written. It does not show how important the conclusion is. High means two or more techniques that read the material in different ways agree, and their checks passed. Medium means one technique supports it, or several agree but a check failed or was not done, or they read the material in the same way. Low means one technique supports it and its checks did not pass, or the techniques conflict and the conflict is not resolved. All the techniques read the same material and used the same language model, which limits every label."

Fixed words for the insights: "An insight is a finding that goes against, or beyond, what your question or the material would lead a reader to expect. Each one states the expectation and what the analysis found instead."

Parts 5 and 6 are stated as facts.

**Strength of statement reached.** Which chosen techniques reach the strength of statement the user needed, and which conclusions they support. When none did, the answer says so in its first lines.

**What the answer is based on.**

- What the user gave: each source, its type and size.
- Any additional sources used: the item, where it came from, its type, which technique used it, and whether code could check its wording.
- Which techniques ran and what each worked on.
- Which techniques were dropped, and why.
- Which conclusion and report techniques were chosen, which were dropped and why.
- Any files that could not be read.
- Any checks that were not done, and whether a person reviewed the results.
- Whether the user confirmed the request after 5.1.

The answer can also include a section on the process followed: the techniques chosen, the sequence they ran in and the recorded reasons for both. Whether the answer includes this section by default is not yet decided (section 10).

The answer makes no judgement about whether the material is representative or sufficient, because the user chose the material and knows its limits.

**Follow-up round.** The process offers one. If the user accepts, steps 2 to 4 run again for the gaps and unresolved conflicts found in step 7, leaving out techniques that already ran and starting from the reserve list. The new techniques run, and steps 6 to 8 are repeated with all the findings.

The fixed methods in step 7 come from reviews of how to combine evidence from studies. Using them to combine the findings of techniques within one run is an extrapolation, and only abstracts and summary pages were read. The 68 conclusion and report techniques come from a third research report (22 November 2026): 22 are tested, 45 documented and 1 unconfirmed. The third report had 13 unconfirmed rows, and twelve were confirmed on 22 November 2026 from sources that opened (decisions 61 and 62).

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
| Analysis techniques, subtotal | 236 |
| Combine findings into conclusions (CF) | 9 |
| State confidence and uncertainty (UC) | 12 |
| Structure the written answer (SA) | 8 |
| Design the display (VD) | 15 |
| Display risk and uncertainty (RU) | 9 |
| Recommend and tailor to the audience (RA) | 10 |
| Hold the report to its evidence (RC) | 5 |
| Conclusion and report techniques, subtotal | 68 |
| Total | 304 |

Each technique has 54 columns in `master/master_tagged.csv`: identity and text (ID, family, subgroup, name, what it does, fit test, status and evidence), 45 tag columns, the result format and the method steps (filled for practice and unconfirmed rows). Tag columns fall into five groups: input profile, selection, sequencing, robustness and the identity fields purpose and use when.

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
| 14 | What does the process do when a technique needs something the user's material does not contain? | It gathers only what that technique needs to run, never material in general. |
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
| 33 | Step 4 told the user what was or was not gathered from outside, before any technique had run. The design did not say when outside material is gathered or that the user approves it. Decided on 13 November 2026. | Step 4 records only which techniques need outside material, as a column in the plan table (group, technique, why the group runs there, needs outside material). Step 5.2 resolves each need: content first, then one item from a source that is not marketing or opinion, or from the user. The user approves any outside item before use. Step 8 reports it. Decision 40 removed the approval. |
| 34 | The step 4 table explained each group by saying it runs before or after another, which tells the user nothing, because something has to run first. Decided on 13 November 2026. | The table says what each group does for the request, and mentions the order only where it has a consequence for the user (the question can be changed after the first group). The reason for each chosen technique stays in step 3. |
| 35 | The group names First and Next only gave the order. Look at your question was vague. The description belonged to the group, which does no work, and not to the techniques. Decided on 13 November 2026. | Groups are named by their purpose: Clarify the question, Prepare the content, Analyse the content, Test the findings. The table describes each technique, using the catalogue's description. The plan is work and carries no decision points. |
| 36 | One group had a note about rewording the question and the others had none. The plan is work, so the user may not see it, and the note did not tell the user anything at the point of decision. Decided on 13 November 2026. | The note is removed. The decision to reword the question is asked in 5.1. The plan carries no decision points. |
| 37 | Nothing in the design said what a runner could show about where a run is, so each application would have had to invent states. Decided on 13 November 2026. | Section 2 defines the states of a step, a technique, a library check and the answer, and the decision points a step can wait at. How the states are delivered is left to the application, because resuming a run later is not a requirement. |
| 38 | A plan at decision-informing stakes listed checks that need a person and the run showed them as not done. The user could not act on them and they read as failures. Whether to ask is a question of stakes, and a person cannot check every decision inside the process. Decided on 14 November 2026. | Checks that need a person apply at high stakes only. Below high stakes the plan leaves them out and the answer says that no person reviewed the results. At high stakes the process asks the user to review a sample of the results at the end of step 6, a new decision point. Checks that need no person, including spot checks and repeat runs, are always done by the process. |
| 39 | The provisional name ANLYSIS was replaced when the address anlysis.work was registered. The correctly spelt analysis.work is a premium domain. Decided on 14 November 2026. | The name is ANLYSIS in running text, to refer to the design, the process and the skill, and ANLYSIS.work when it refers to the site or its address. The GitHub repository keeps the name `analysismodel` until the site is deployed. |
| 40 | The 5.1 question gained an option the design did not have (add outside sources). A search for a pool of 11 sources then ran before the plan existed, and the user was asked to select from the list. The user pointed out that techniques do not need approval for what they need to do, and that everything not typed in by the user is outside, so the word did not separate anything. Decided on 15 November 2026. | Sources the process finds are called additional sources, and the user's material is what the user typed, attached or linked. 5.1 offers only keep or edit. 5.2 runs after the plan, finds one item per need, uses it and records it. The approval decision point is removed, leaving six. The answer lists each additional source, and a conclusion that depends on one whose wording code could not check is limited to medium. This supersedes the approval in decision 33. |
| 41 | The skill and the site do not have to share a name. Decided on 15 November 2026. | The skill is named analysis (folder `analysis`, file `analysis.zip`, working folder `analysis_run`). ANLYSIS stays the name of the design and ANLYSIS.work the site (decision 39). |
| 42 | In the user's run inside Claude, a subagent stopped because the user's weekly usage limit in Claude was reached. The design did not say what the process does when a technique's run does not finish, for that or any other reason. Decided on 15 November 2026. | The technique is dropped with the reason "did not finish". The process never writes its result itself, tells the user which technique stopped, and lists it among the techniques dropped in the answer. |
| 43 | The answer in the user's own run was hard to read. The summary was one short paragraph of compressed sentences. Conclusions were named by codes (T1 to T7) that the answer never explained. A conclusion about what the process had not looked at carried a high label, which read as confidence that the topic was examined. The insights were recommendations, not findings. Decided on 15 November 2026. | The answer starts with a summary of two to four short paragraphs. Each conclusion has a title that states the finding, with its label and reason after it. The meaning of the labels is stated in fixed words before the first conclusion, and says the label measures support for the conclusion as written, not importance. A statement about what the process did not look at is not a conclusion: it goes under what was not covered, with no label. An insight is a finding that goes against or beyond what the request or the material would lead a reader to expect, and states the expectation and the finding. Recommendations are given only when the request asks for them. |
| 44 | The answer was given as text in the conversation, which is awkward to keep, share or export. Decided on 15 November 2026. | Where the application can create a document, the answer is delivered as a document. Otherwise it is given in the reply. |
| 45 | The site documented the design, and nothing on it said how to get the skill or install it. Decided on 15 November 2026. | The site has a page, Use the skill. It offers `analysis.zip` for download, gives installation steps for Claude (claude.ai, Claude desktop and Claude Code) and for GitHub Copilot (VS Code, Copilot CLI and the Copilot cloud agent), says what to give the skill, what it asks and what it returns, and says what has and has not been tested. The zip is the only form in which the scripts are published. The page text is `data/use-the-skill.md` and the zip is `data/analysis.zip`, both in the site repository, and the build copies the zip to the site. |
| 46 | The confidence label (high, medium, low) reads as a statement about the analysis and not about the subject, which makes the answer harder to read. The user wanted conclusions grouped by how well they are supported, with the label shown only on request. Decided on 15 November 2026. | The label and its reason are still recorded for every conclusion and insight in step 7. The answer shows conclusions in two groups: well supported (label high) and weaker support (label medium or low). Each conclusion in the second group, and each insight whose label is medium or low, carries a caveat: one or two plain sentences saying why the support is weaker. The answer shows the labels and reasons only when the user asks for them, with the fixed words for the labels. The label rule in section 7 is unchanged. Decision 43's requirement to state the confidence levels before the first conclusion is replaced by the fixed words for the groups. |
| 47 | The simulator showed five counters that only tracked how the technique numbers narrowed (the catalogue total, techniques that passed, chosen, placed in sequence, checks that need a person). Decided on 15 November 2026. | The simulator shows six measures of the run, each filled in when its step finishes: words of material read, techniques run and how many were dropped, additional sources used, checks done and how many were not done, conclusions to review (those with weaker support) and insights. Each is counted from the stored run. Time taken and tokens used are not recorded by the skill, so the simulator does not show them. This changes the site only. |
| 48 | In the simulator the Start again button sat in the bar above the measures, away from the other controls in the left navigation. The conclusions measure read "4 and 5", which does not say what to do with the numbers. Decided on 15 November 2026. | Start again is an item under Simulator in the left navigation, shown once a run has started. The conclusions measure shows one number, the conclusions with weaker support, labelled conclusions to review. Decision 47 is otherwise unchanged. This changes the site only. |
| 49 | The site explained the model and the project but gave a reader no way to use the catalogue without the skill, no plain statement of what the process does not do, and no list of what changed in each version. Decided on 15 November 2026. | Three pages are added. Choose by hand, under Techniques, shows how to use the catalogue with the same steps as the process. Limits states what has been tested, what the answer rests on, the catalogue's weaknesses, what the process cannot read or judge and what is not recorded. Change log lists each version, newest first, in plain terms, with its decisions. The page texts are `data/choose-by-hand.md`, `data/limits.md` and `data/change-log.md`. The build fails if the newest row of the change log is not this document's version. This changes the site only. |
| 50 | The page Choose by hand sat under Techniques and stopped after the choice of techniques and the plan of checks. It is a way of running the whole process without the skill, so it belongs next to the skill and has to cover all eight steps. Decided on 16 November 2026. | The page is renamed Use by hand and moves to Try it, after Skill. It follows the eight steps in order: write the brief, rule out, choose, plan the sequence, run the techniques (including additional sources and a run that does not finish), check, combine (the methods, the label rule and the rules for insights) and write the answer. It ends with what the reader loses compared with the skill. The Limits page says that running the process by hand has not been tested. The page text is `data/use-by-hand.md`. This changes the site only. |
| 51 | The research behind the catalogue was in two reports and some survey notes that were not on the site. A reader could not see what techniques exist, what evidence supports them, how widely they are used or what the catalogue does not cover. Decided on 21 November 2026. | The site has a page, Research findings, under Project record. It combines the two technique reports with research on how widely techniques are used and on the frameworks consultancies publish. It has three levels: a summary, six themes, and 29 findings in six groups, each finding with one caveat and its sources. The last section lists the 236 techniques with their evidence status. The findings are expandable, and each group has its own colour. The page text is `data/research-findings.md`. This changes the site only. |
| 52 | The Research findings page was placed under Project record. Project record is about how the project was built (decisions, test evidence, files). The research is the background input to the catalogue and does not belong with it. Decided on 21 November 2026. | The page moves to its own group in the navigation, Research, at `/research/`, and has a card on the home page. The old address redirects to the new one. Decision 51 is otherwise unchanged. This changes the site only. |
| 53 | Decision 52 gave the research its own group in the navigation. The user wanted it in the project section, as its own page next to Status, and not under Project record, which is about how the project was built. Decided on 21 November 2026. | The page Research findings is an item in the project section of the navigation, after Status. It stays at `/research/` and keeps its card on the home page. Decision 52 is replaced for the placement only. This changes the site only. |
| 54 | The navigation called the page Research findings. The user wanted it called Source research, because it is the research the catalogue was built from. Decided on 21 November 2026. | The navigation item and the home page card are named Source research. The page keeps its title, its address `/research/` and its content. This changes the site only. |
| 55 | The navigation started with The model, which suits a reader who wants the design. A new reader wants to see what the process does and to use it first. Decided on 21 November 2026. | Try it (Simulator, Skill, Use by hand) is the first group in the navigation, before The model. The order of the previous and next links on each page follows the navigation. This changes the site only. |
| 56 | A consistency scan of the site found statements that no longer matched the catalogue or the rules. Technique pages listed checks that need a person at decision-informing stakes without saying that decision 38 leaves them out. The schema named two decision points with old terms (synthesis method, commensurable estimates). Three open items gave counts that had changed or described a problem that was fixed. The Limits page said every evidence status came from the earlier reports, which is not true of AO-19 and PE-14. The Source research page called the five whys documented and showed "Also serves" notes as part of technique names. Decided on 21 November 2026. | Technique pages mark a check that needs a person, below high stakes, as left out, and say why. The schema uses the names the skill and the site use: choose the combining method, and confirm that estimates measure the same thing. The open items give the current counts and drop the fixed item. The Limits page names the two techniques. The Source research page is corrected. No rule changes. |
| 57 | The name ANLYSIS read as a technical label and gave no sense of what the site is for. The user wanted a casual name that says something about the site, in the form of a short phrase that the .work address completes. Decided on 22 November 2026. | The name is startthat.work, and it is also the address of the site. It replaces ANLYSIS and anlysis.work in running text, the site, the simulator, the README, the schema title, the skill text and the design. The skill keeps the name analysis (decision 41). Decisions 39 and 41 and the change-log row for 1.2.5 keep the old name because they record what was decided then. The GitHub repository keeps the name `analysismodel`. The domain startthat.work has to be registered and added to the Vercel project, and anlysis.work should redirect to it. Both are done outside the repository. This supersedes decision 39. |
| 58 | The site header still showed the logo for the old name. The user supplied a logo for startthat.work: the words start and that and the .work ending, with a play mark. The header image text also read startthat.work.work after the rename. Decided on 22 November 2026. | The header uses the supplied logo (`build/assets/logo.svg`) and its text description is the name followed by the word home. The change affects the website only. |
| 59 | The home page tab read "startthat.work: documentation", which described the site as a manual. The user wanted the tab to carry only the name, written as the logo writes it. Decided on 22 November 2026. | Browser tab titles use STARTthat.WORK, as the logo does. The home page tab shows only that name, and every other page shows its title, a vertical bar and the name. Running text, headings and the address stay startthat.work. |
| 60 | The catalogue had no technique for the last two phases, conclude and report. Step 7 offered four fixed methods and asked the user to choose, and step 8 wrote the answer in one fixed form. A third research report found 68 techniques for combining findings, stating confidence, structuring the answer, displaying it, showing uncertainty, recommending and checking a report against its evidence. The user asked for them to be added and for steps 7 and 8 to choose from them as step 3 does, with the decision kept simple. Decided on 22 November 2026. | The 68 techniques join the catalogue (304 in 19 families), tagged like the others. Their material tags are any, because they work on findings, and what they need (findings from two or more techniques, a panel, audience information) is stated in the minimum requirements. Step 3 chooses from analysis techniques only. Step 7 chooses at most 3 conclusion techniques and step 8 at most 4 report techniques, each with a reason, and drops any that needs outside material the brief does not hold. The fixed parts stay: the agreement table, the narrative summary, pooling, decision analysis, the confidence rule and the seven parts of the answer. The decision point choose the combining method is removed, so five decision points remain. The schema adds the values none (insight type), how sure (question answered) and audience information, decision information and panel (outside material). Their claim ceiling is the highest value, so no gate removes them, and the strength of statement reached comes from the analysis techniques only. The stored run and simulator were made on the 236 analysis techniques and keep their numbers. Kinds of technique rise from five to seven. |
| 61 | Thirteen of the 68 new techniques were unconfirmed because their sources were blocked when the third report was written. The user approved fetching the pages. Decided on 22 November 2026. | Each source was fetched again. Nine rows are now documented, because a source opened and described the technique: CF-05, CF-06, CF-07, CF-08, RA-05, RA-07, RA-08, RA-10 and RC-05. CF-09 is still unconfirmed because only the RAND/UCLA half was confirmed. CF-04 (the EFSA guidance) and RC-04 (the guidelines it names) did not open. SA-08 (the pyramid principle) was found only on promotional or personal pages, which are not used as a basis. No test of effect was found for any of them. Several rows rest on an abstract or a summary page, and each row says so. The evidence status of the catalogue is now 55 tested, 192 documented, 13 in practice and 44 unconfirmed. RA-08 changed its description to match what the sources confirm. |
| 62 | Four of the 68 new techniques were still unconfirmed after decision 61. The user had no PDFs to supply, so other copies were searched for. Decided on 22 November 2026. | CF-04, CF-09 and RC-04 are now documented. CF-04 rests on the EFSA guidance abstract and full text, CF-09 on a review of the nominal group technique and on the RAND/UCLA manual, and RC-04 on the EQUATOR Network, the PRISMA 2020 statement and the BMJ author guidance. SA-08 stays unconfirmed, because its structure appeared only on promotional or personal pages. The evidence status of the catalogue is now 55 tested, 195 documented, 13 in practice and 41 unconfirmed. |
| 63 | The model runs a technique from its record, so for a method with little published description it fills in the steps from its own knowledge and can get them wrong. The user was content with some variation for well documented techniques and wanted the less documented ones hardwired to reduce that. Decided on 22 November 2026. | A new catalogue field, `method_steps`, holds a numbered list of steps for each technique whose evidence status is Practice or Unconfirmed (54 rows at the time). Each list is written from a source that opened and ends with a line naming that source. The technique record shows the steps, and the run prompt tells the model to follow them in order. Techniques that are Tested or Documented run as before. The steps are written family by family. The 11 Handle evidence rows are done: HE1-04, HE1-05, HE1-06, HE1-10, HE1-15, HE1-16, HE1-17, HE1-18, HE1-19, HE1-20 and HE1-21. Writing the steps used sources that opened for ten rows that were unconfirmed, so they are now documented. The evidence status of the catalogue is now 55 tested, 205 documented, 13 in practice and 31 unconfirmed. This replaces the rule that a full method card is written only after a test run shows a wrong result. |
| 64 | Decision 63 wrote steps for 11 of the 54 practice and unconfirmed rows. The other 43 were written on 22 November 2026. | Each of the 43 rows now has `method_steps`, and each list ends with a line naming its source. Where a source that opened describes the technique, the row moved to Documented (32 rows). Where none was found, the steps follow the row description and the source line says so. Several lists cover only part of a technique, and the status text names the part (IS-09 quantitising only, PJ-21 robust decision making only). The evidence status of the catalogue is now 55 tested, 237 documented, 4 in practice and 8 unconfirmed. This changes catalogue evidence text and `method_steps` only. |
| 65 | The skill was tested on one article, with a question about whether the article's account of a phenomenon was accurate and its point of view valid. Every technique read only the article, so the result was a check of the article against itself. Seven faults were found: intake never asked whether the material could answer the question; step 3 passed a technique that matched the wording of a part but could not answer it; the skill had no way to gather evidence about a topic; step 2 did not consider the kind of question; confidence labels rewarded agreement between techniques reading the same page; conclusion and report techniques that need a reference structure were always dropped; and catalogue IDs HE-01 and HE1-01 were easy to confuse. Decided on 22 November 2026. | The brief is split into parts, each with a scope, material or topic, which the user confirms (section 3). The catalogue has a new column, `question_scope`, tagged by reading each row, which orders the list in step 2 and limits text-scope techniques to material parts in step 3. A part that no eligible technique can answer stops the run for one question: add outside evidence, edit the request or continue without it (section 4). Step 5.2 gains an evidence-gathering action for topic parts with no source type excluded, and each source is recorded by what it can show: what it says or does, or what is true of the world (section 6). The rule that additional sources must not be marketing or opinion is removed. Facts about the text get no confidence label (section 7). Conclusion techniques can look up a reference structure. The plan prints the name beside each ID, and the model checks each name against its reason. This changes the catalogue, the schema, steps 1, 2, 3, 5.2, 7 and 8, the scripts, the prompts and the skill text. It has not been run. |
| 66 | The Try it group in the navigation started with the Simulator. The user wanted the Simulator last in the group, after the pages that explain how to use the skill and the process. Decided on 23 November 2026. | Try it is Skill, Use by hand, Simulator. The order of the previous and next links on each page follows the navigation. Decision 55 is otherwise unchanged. This changes the site only. |
| 67 | The simulator replayed a run on ten interview quotes, made under version 1.2.4. It showed none of the changes of version 1.5.0, and its question was unlike the one that exposed the faults of decision 65. The skill at version 1.5.1 was run end to end on that article, with each technique as a separate agent. Its author took the user's decisions: the two parts of the request and their scope, outside evidence, keeping the question after 5.1, and the combining method. The run found that the plan did not list repeat runs, that the step 7 agent named a technique that did not run, and that the simulator had no place for facts about the text, the parts of the request or the outside sources. Decided on 23 November 2026. | The simulator replays the article run. Its page shows the parts of the request, the outside sources and what each is used to show, the repeat runs, the techniques used to state the conclusions, and the facts about the text as a separate group. `export_run.py` reads the current catalogue and schema. The skill is unchanged. This changes the site only. |
| 68 | Shared links to the site showed no preview image. The user supplied a 1200 by 630 image, with the line "Your topic and your material, matched to the right analysis methods" and the logo. Decided on 24 November 2026. | The image is `build/assets/og-image.png` and is served at `/assets/og-image.png`. Every page, and the not found page, carries Open Graph and Twitter card tags for the title, description, address and image, with a text description of the image. The tags use the absolute address https://startthat.work, so previews work only once that domain serves the site. The image text says "right analysis methods", which claims more than the tests have shown. This changes the site only. |
| 69 | The user supplied a new logo for startthat.work, drawn as the words START, that and WORK, without a full stop, after a play mark in a circle. Decided on 24 November 2026. | The header uses the new logo (`build/assets/logo.svg`), replacing the one of decision 58. The image is 399 by 58, so the header image attributes are 282 by 41 and its height stays 2.4 rem. The text description is unchanged. The preview image of decision 68 contains the earlier logo and is not changed. This changes the site only. |
| 70 | Browser tabs and bookmarks showed no icon for the site. The user supplied a favicon: the play mark of the logo, in green, in a circle. Decided on 24 November 2026. | The favicon is `build/assets/favicon.svg`. Browsers that do not use SVG icons get `favicon.ico` (16, 32 and 48 pixels, served at the site root) and an apple touch icon (`build/assets/apple-touch-icon.png`, 180 pixels, on white). The two bitmap files were drawn from the supplied SVG, so a change to the SVG needs them made again. Every page links all three. This changes the site only. |

## 10. Open items

- Twelve rows are still practice or unconfirmed: FQ-04, DM-07, CM1-09, CM1-11, TC1-18, TC1-25, HE1-04, PJ-10, PJ-11, CH-11, CH-13 and CK-18. Their steps come from the row description, and a source that describes the technique would move each to Documented.

Changed since the run of 13 November 2026 (version 1.2.4):

- Version 1.2.6 changed how additional sources are handled and renamed the skill (decisions 40 and 41). Version 1.2.7 added the rule for a run that does not finish (decision 42). Version 1.2.8 changed the answer form and its delivery (decisions 43 and 44). Version 1.2.10 groups the conclusions by support and shows the labels only on request (decision 46). None of these versions has been run inside Claude.

- The stored run follows version 1.5.1 for every step. The 5.1 findings were not shown to a person: the run's author kept the request and chose the combining method in place of the user, and accepted the scope given to each part of the request and permission for outside evidence. Each technique ran as a separate agent. After the run, the names of one technique were corrected in the stored conclusions and answer, because the step 7 agent had called Toulmin argument analysis "argument mapping", a technique that did not run.
- The personal information waiver in `select.py` (decision 29) has not been tested on content that contains personal information.
- The changes of version 1.5.0 (decision 65) ran end to end once, in the stored run: the scope of each part, topic scoring, outside evidence in step 5.2, the label for facts about the text, and conclusion and report techniques. Not tested: the pause for a part that no technique can answer (the stored run had none), and a user's own answers to the scope and outside evidence questions.
- Step 5.2 has run to the end under decision 40 once. The four sources were read as search summaries, so code could not check their wording and the conclusions that depend on them are limited to medium. One question, how organisations measure their AI programs, found no source. The step does not say how much of a source to read.
- The step 8 agent was not given the catalogue ceilings, so the strength of statement reached is worked out from the catalogue by the application. The stored run carried out the spot checks (by code) and the repeat runs (DM-07 and TC1-19). It is at exploratory stakes, so the checks that need a person were left out and the answer says that no person reviewed the results. The plan did not list repeat runs, which step 6 of the skill describes, so the run started them by hand. The spot check compared 2 to 10 quotations for each of three techniques.
- The high-stakes path has not been run: the pause at the end of step 6 that asks the user to review a sample of the results, and the cap of the label at medium when the user does not.
- The spot check by code covers few pairs for some techniques (0 to 3 for HE1-14, HE1-15, MM-10 and TC1-13), so it says little about them.

Not changed:

- The schema and the catalogue keep their original field names (section 8).

Design:

- `select.py` notes techniques that need additional sources, and `sequence.py` lists what to gather. Neither script finds the material. The process does that at run time. The minimum amounts field (`requires_minimum`) is still not applied by the script.
- The deployment settings (highest permitted privacy class, code execution, human reviewer) are in the schema and not in `select.py`.
- Step 3 recall (22 of 32) was measured before the catalogue changes and the four criteria, and has not been re-run. AO-09 and AO-15 were missed on test job 5. Their use-when text was improved and not retested.
- Origin, the producer's interest and whether sources depend on each other are not inferred from the publisher, so appraisal techniques see unknown.
- The confidence rule, the request confirmation after 5.1 and the follow-up round are untested.
- Not decided: whether the answer includes a section on the process followed by default, or only on request.
- Steps 6 to 8 have run once, on one small brief.
- Result formats are tested on five of 236 techniques.
- The answer form of decisions 43, 44 and 46 has been tested only by running steps 7 and 8 again on the stored run, and step 8 again after decision 46. The user's request for the labels is not yet tested. Delivery of the answer as a document has not been run inside Claude.
- The skill has not been run in GitHub Copilot. Its instructions say to start separate agents and, where that is not possible, to run each technique in turn. How Copilot handles that, and whether it asks for approval before each script, is untested.
- The skill has run once inside Claude, started by the user on an article. Its technique runs, checks, combining and answer steps ran as separate subagents. The output of that run is not stored here, and the changes in versions 1.2.6 to 1.2.10 have not been run there.
- Intake does not read images, audio or video. The rules for document type, language and personal information are untested on long documents, scanned PDFs and non-English text. The rules for strength of statement and kind of finding are keyword matches.

Catalogue data (from the spot check; the first six were fixed):

- Fixed: TC1-08 (claim ceiling), TC-03 (access depth), HE-05 and CK-12 (model suitability), CM1-12 (source count), HE1-11 (consumes appraised evidence base).
- Not fixed: PE-02 (consumes and produces no result artefact), CH-03 and CH-11 (inconsistent consumes and produces), IS-06 (linkage requirement).
- Frame family: FQ-01 to FQ-06 share one identical minimum-checks string, including a second technique at high stakes.
- Input validation is listed for deterministic techniques but used by 23 non-deterministic rows. HE-06 (deterministic) uses repeat runs.
- Only 14 of 236 rows use `not_for_rules`. HE1-06 and IS-05 use source dependence, a field that only changes the order, as an exclusion.
- About 30 relation targets in other families were chosen from titles or short descriptions.
- No working document type for diagrams, argument maps, personas, a labelled gold set, an event table or a provenance graph. No unit of analysis for actor, case, option, text span or event.
- SA-08 (the pyramid principle) is the one conclusion or report technique still unconfirmed. Its structure was found only on promotional or personal pages, so a book or an article from a publisher or university is the next source to find. Choosing them in steps 7 and 8, and applying them in the step 7 and 8 agents, has not been run.
- Review the 9 techniques whose strongest statement is the effect of an action and the 5 whose strongest statement is how or why.
- Some frameworks could not be confirmed (the PHIA technique list, Heuer and Pherson names). Most opened sources were abstracts or secondary pages. No framework specifies checks per stakes level, so that field is entirely inference.

## 11. Files

| File | Role |
|---|---|
| `master/Analysis methods design.md` | This document. |
| `schema/schema.json` | Field vocabularies, requirement types, working document types, check library, stakes levels, and the rules for steps 1 to 8. Version 1.2.23. |
| `master/master_tagged.csv` | The catalogue: 304 rows, 54 columns, with result formats and method steps. |
| `master/master_base.csv`, `master/tags/tags_A.json` to `tags_F.json` | Sources of the CSV text and tags. |
| `master/specs/out_1.json` to `out_6.json` | Result formats. |
| `scripts/intake.py`, `select.py`, `sequence.py`, `validate_tags.py` | Process scripts for steps 1, 2 and 4, and the tag validator. |
| `master/test_jobs/`, `intake_test/`, `master/card_test/` | Test briefs, intake inputs and the result format test. |
| `master/spot_check.md` | The independent check of 30 rows. |
| `analysis.zip` | The skill: `SKILL.md`, `references/` (this document, the schema, the catalogue and the prompts) and `scripts/`. The site repository keeps a copy as `data/analysis.zip`, which the site offers for download. |
| `data/use-by-hand.md`, `data/limits.md`, `data/change-log.md`, `data/research-findings.md` | The text of the pages Use by hand, Limits, Change log and Source research, in the site repository. |
| `run2/` | The complete run of 13 November 2026: inputs, plan, results, combined findings and answer. |

## 12. Change rule

A change to a field, a requirement, a step or a method is made in `schema.json` and in this document together. A change to a technique's text or tags is made in the source files and the CSV is rebuilt. When the skill changes, replace `data/analysis.zip` in the site repository with the new zip, so that the download matches the version in this document. Add a row to `data/change-log.md` for every new version. The build fails when the newest row does not match the version at the top of this document. When section 10 or the tested items change, update `data/limits.md` to match. After any change, run the validator (`python3 -I scripts/validate_tags.py master/tags/tags_*.json`), then run `select.py` and `sequence.py` on the test briefs and compare the counts with the last recorded run.
