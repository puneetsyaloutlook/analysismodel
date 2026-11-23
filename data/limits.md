This page says what startthat.work does not do, what has not been tested and where its answers are weaker than they look. It is written for someone deciding whether to rely on it. The [status page](/status/) lists the same gaps as open items for the project.

## What has been tested

The process has run completely once, on an article of about 2,050 words with a two-part question, under version 1.5.1, with each technique as a separate agent. The run's author answered the questions the process asks of a user, so the user's side of the process has not been tested. The skill has also been run once inside Claude, by its author, on the same article, under an earlier version. It has not been run in GitHub Copilot. Following the process by hand, as described on [Use by hand](/by-hand/), has not been tested by anyone. The page restates the process. The stored run is the evidence for every claim on this site about how the process behaves, and it is one run on one article. The outside sources in that run were read as search summaries, so code could not check their wording, and the conclusions that depend on them are limited to medium.

Not run at all:

- The high-stakes path: the pause at the end of step 6 that asks a person to review a sample of the results.
- The rule that keeps personal information out of techniques that cannot take it, and the waiver that keeps a technique when de-identification runs first.
- Step 5.2 when no source can be found for a technique that needs one. The stored run found all four it needed, and found none for one question.
- The follow-up round.
- The edit option after 5.1, and a user's own answers to the scope and outside evidence questions. The run's author kept the request and accepted both in place of the user.

## What the answer rests on

Every technique in a run reads the same material and is run by the same language model. Two techniques that agree are therefore not independent evidence. The process counts them as different when they read the material in different ways, for example one counts cases and one looks for statements that contradict a finding. That is a design choice and not a published method, and it is untested. The answer says this as a limit.

The grouping of conclusions into well supported and weaker support follows that rule. Treat the groups as how well the techniques support a conclusion as it is written, and not as the likelihood that it is true.

The process does not judge whether your material is representative or large enough, because you chose it and know its limits. A well supported conclusion can still rest on one short article.

## Checks that need a person

Checks that need a person apply at high stakes only. Below high stakes the plan leaves them out and the answer says that no person reviewed the results. For a decision that is costly or hard to reverse, set the stakes to high-stakes and review the sample you are shown. That path has not been run.

Checks by code cover few cases for some techniques. In the stored run the spot check compared 2 to 10 quotations for each of three techniques. The technique that quotes the article least, lens application, was checked on two.

## The catalogue

The 304 techniques are described from published sources, but most of the sources opened were abstracts or secondary pages. Evidence status comes from the three reports, and a row moves up when a source that opened describes the technique: 55 techniques are tested, 237 documented, 4 in practice and 8 unconfirmed. Method steps are written for every practice and unconfirmed row that had none, 54 rows. Some of the steps are the model's reading of a row description, and the source line on each list says so. Choosing conclusion and report techniques in steps 7 and 8 has not been run yet. Two techniques, AO-19 and PE-14, are in neither report, and their status comes from the sources on their own pages. No framework specifies checks for each stakes level, so that field is inference. All tag values are inference unless a row or a named source says otherwise.

A spot check of 30 rows found problems. Six were fixed. Others remain, for example inconsistent inputs and outputs on a few techniques, and about 30 relations to techniques in other families that were chosen from titles or short descriptions.

Result formats, which tell the model what a technique's result must contain, were tested on five of the 236 analysis techniques. In that test they raised the score from 33 of 40 to 37 of 40, with one run per case and the same author writing the formats and the checklists.

## What the process cannot read or judge

- Intake does not read images, audio or video.
- The rules for document type, language and personal information are untested on long documents, scanned PDFs and non-English text.
- The strength of statement and kind of finding are inferred from keywords in your request, so check what the process inferred when it shows you the brief.
- The minimum amounts of material that some techniques state are not applied by the script. Check them yourself.
- The process chooses at most ten techniques in a first round. That number is a default and not a measured value. In an early test the model, reading the full list, found 22 of 32 expected techniques, and that was before the catalogue and the choice criteria changed. It has not been measured again.

## What is not recorded

The skill does not record how long a run takes or how many tokens it uses, so the site cannot show either.

## What it does not do

The process works on the material you give it. It does not design a study, and it does not collect new material apart from the single additional item a technique may need (step 5.2). It does not review the results for you unless you set the stakes to high-stakes and review the sample. It can help you decide what to look at and what the material does and does not show. It does not replace review by someone who knows the subject.
