The dictionary is the section behind the techniques. Every technique page shows a set of tags, such as "Level of detail available: requires record-level", and the process reads those tags to rule techniques out, choose and order them, and decide which checks to run. The four dictionary pages define each tag, each allowed value, each type of working document, each check and each relation between techniques.

You do not need the dictionary to run the skill or to read the process pages. You need them in three situations:

- You are reading a technique page and want to know exactly what a tag means.
- You want to know why the process removed a technique for your material, or why it kept one.
- You are changing the catalogue or the rules and need to know which field to edit.

## A worked example

Open the page for HE-06, the opt-in panel respondent quality check. Under "Requirements on the material" it shows **Level of detail available**, with the requirement type **Always applies** and the requirement **requires=record-level**.

1. The [Fields](/reference/fields/) page defines "Level of detail available" as the deepest level of detail the material gives access to. The values run from narrative only, through aggregate tables, to record-level, and a requirement means that level or deeper.
2. The same page says what "Always applies" means in the table of requirement types: the technique is removed in step 2 when the material fails the requirement. Level of detail is never waived.
3. So if you give the skill only a summary table of survey results, step 2 removes HE-06, because the technique has to read the answer of each respondent. If you give it the respondent-level file, HE-06 stays eligible.

Another tag on the same page, "Strongest statement: describe", is defined on the Fields page as the strongest claim the technique can support. That field never removes a technique. It only raises a warning when none of the chosen techniques reaches the strength of statement you need.

## What each page answers

| Page | It answers | Read it when |
|---|---|---|
| [Fields](/reference/fields/) | What does each of the 52 tags on a technique page mean, what values can it take, and what does it do in the process: remove a technique, change the order, raise a warning, or nothing? | A technique page uses a tag you do not recognise, or you want to know why a technique was removed. |
| [Working document types](/reference/artefact-types/) | What are the 21 kinds of document that techniques read and make (a coded corpus, a claims register, a validation report and so on), and what states can each be in? | You want to know why a preparation technique was added to the plan, or what a technique needs before it can run. |
| [Check library](/reference/checks/) | What are the 18 checks, what does each test, and does it need a person? | You want to know what the process did to check a result, or which checks are left out below high stakes. |
| [Steps, kinds, stakes and relations](/reference/phases-and-tiers/) | What are the eight steps, the five kinds of technique, the three stakes levels and the seven relations between techniques? | You want the short definitions in one place, or you want to know how two techniques relate (one substitutes for another, or must run after it). |

## How the field groups connect to the steps

The Fields page groups the 52 fields by what they do in the process.

- **Identity fields** name and describe the technique. They are what the model reads when it chooses techniques in step 3.
- **Input profile fields** state what the material must look like. Step 2 tests them against the description of your material and removes techniques that fail.
- **Selection fields** say what the technique is for, such as the kind of finding it produces and the strongest statement it supports. Step 3 uses them to order and choose.
- **Sequencing fields** say what a technique needs as input and makes as output. Step 4 uses them to place techniques in order and to add preparation techniques. The working document types page defines the documents these fields name.
- **Robustness fields** say how reliable a technique is and which checks it needs at each stakes level. Step 6 uses them, together with the check library.
- **Application fields** hold the result format that tells the model what a technique's result must contain.

## Names in the schema and names on the site

The schema keeps its original field names, and some differ from the plain names used on this site, for example "hard gate" in the schema and "Always applies" here. Each page shows both, and the table of names is in section 8 of the design, on the [catalogue page](/catalogue/).
