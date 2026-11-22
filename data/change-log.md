This page lists what changed in each version of the design, in plain terms, newest first. The numbers in the last column are decisions on the [decisions page](/project/decisions/), which gives the reason for each. The current version is 1.4.0.

To check which version your copy of the skill follows, open `references/design.md` in the skill folder. The version is stated near the top. The download on the [skill page](/skill/) states the version it carries.

Versions that change only the website say so. The skill is unchanged by them.

| Version | Date | What changed | Decisions |
|---|---|---|---|
| 1.4.0 | 22 Nov 2026 | A new catalogue field, method steps, holds a numbered list of actions for techniques that are in practice or unconfirmed. The technique record shows the steps and the run prompt tells the model to follow them. The 11 Handle evidence rows are written. Ten of them are now documented, because the sources used for the steps opened. Changes the catalogue, schema, skill, prompt, `technique_record.py` and the site. | 63 |
| 1.3.2 | 22 Nov 2026 | CF-04, CF-09 and RC-04 are now documented, from sources found at other addresses. SA-08 is the one conclusion or report technique still unconfirmed. Catalogue evidence text only. | 62 |
| 1.3.1 | 22 Nov 2026 | Nine of the 13 unconfirmed conclusion and report techniques are now documented, after their sources were fetched. Four stay unconfirmed. Catalogue evidence text only. | 61 |
| 1.3.0 | 22 Nov 2026 | The catalogue grows from 236 to 304 techniques. The 68 new ones combine findings, state confidence, structure and display the answer, show risk, recommend and check a report against its evidence. Step 3 still chooses from the 236 analysis techniques. Step 7 chooses up to 3 conclusion techniques and step 8 up to 4 report techniques. The question to choose the combining method is removed. Changes the catalogue, schema, skill, prompts and `select.py`. | 60 |
| 1.2.23 | 22 Nov 2026 | Browser tab titles use STARTthat.WORK, as the logo writes it. The home page tab shows only the name. Website only. | 59 |
| 1.2.22 | 22 Nov 2026 | The site header uses the logo for startthat.work. Website only. | 58 |
| 1.2.21 | 22 Nov 2026 | The name changed from ANLYSIS to startthat.work, which is also the site address. The skill text carries the new name. The rules are unchanged. | 57 |
| 1.2.20 | 21 Nov 2026 | Corrections from a consistency scan: technique pages show which checks are left out below high stakes, two decision points in the schema use the current names, and the open items, Limits and Source research pages match the catalogue. No rule changes. | 56 |
| 1.2.19 | 21 Nov 2026 | Try it is the first group in the navigation. Website only. | 55 |
| 1.2.18 | 21 Nov 2026 | The navigation item and home card Research findings are renamed Source research. Website only. | 54 |
| 1.2.17 | 21 Nov 2026 | Research findings moved from its own group into the project section of the navigation, after Status. Website only. | 53 |
| 1.2.16 | 21 Nov 2026 | The Research findings page moved out of Project record into its own group, Research, and has a card on the home page. Website only. | 52 |
| 1.2.15 | 21 Nov 2026 | New page Research findings, under Project record: what techniques exist, what evidence supports them, how widely they are used and what the catalogue does not cover. Website only. | 51 |
| 1.2.14 | 16 Nov 2026 | The Choose by hand page became Use by hand, moved to Try it and now covers all eight steps, from the brief to the answer. Website only. | 50 |
| 1.2.13 | 15 Nov 2026 | New pages: Choose by hand, Limits and Change log. Website only. | 49 |
| 1.2.12 | 15 Nov 2026 | In the simulator, Start again moved into the left navigation, and the conclusions measure shows the conclusions to review. Website only. | 48 |
| 1.2.11 | 15 Nov 2026 | The simulator shows six measures of the run in place of five counters of technique numbers. Website only. | 47 |
| 1.2.10 | 15 Nov 2026 | The answer groups conclusions as well supported and weaker support, with a caveat on each weaker one. The labels (high, medium, low) are recorded and shown only when you ask. | 46 |
| 1.2.9 | 15 Nov 2026 | The site gained the Use the skill page, with the download and install steps for Claude and GitHub Copilot. Website only. | 45 |
| 1.2.8 | 15 Nov 2026 | The answer starts with a summary in plain sentences. Conclusions have titles instead of codes, and an insight is defined as a finding that goes against or beyond what you would expect. The answer is delivered as a document where the application can make one. | 43, 44 |
| 1.2.7 | 15 Nov 2026 | A technique whose run does not finish is dropped, with the reason, and listed in the answer. | 42 |
| 1.2.6 | 15 Nov 2026 | Outside material is now called additional sources and is found after the plan, one item per need, without asking you to approve it. The skill is named analysis. | 40, 41 |
| 1.2.5 | 14 Nov 2026 | The design was renamed ANLYSIS, and the site address is anlysis.work. | 39 |
| 1.2.4 | 14 Nov 2026 | Checks that need a person apply at high stakes only. At high stakes you review a sample of the results at the end of step 6. | 38 |
| 1.2.3 | 13 Nov 2026 | The plan is a table in four named groups, with each technique described. Outside material is resolved in step 5.2, with your approval. The states of a step, a technique, a check and the answer are defined. | 33 to 37 |
| 1.2.2 | 13 Nov 2026 | Steps 3 and 4 were renamed Choose analysis techniques and Plan analysis sequence. The sequence records a reason for each position. | 32 |
| 1.2.1 | 13 Nov 2026 | The answer is the only output. Everything before it is work, shown as far as the application allows. | 31 |
| 1.2 | 12 Nov 2026 | One numbered process of eight steps. Question techniques run first and you can keep or edit the request. The answer says whether the strength of statement you needed was reached. Step 3 has four criteria. The confidence rule covers agreement, conflict and checks that need a person. Five kinds of technique. One term for one thing. | 24 to 30 |
| 1.1 | 11 Nov 2026 | The brief has one request. The process loops only when you ask. At most ten techniques in the first round and five in each follow-up round. Challenge techniques work on the findings, not on the brief. One confidence label and a one-line reason per conclusion. A technique that fails only on content type or structure is kept when another technique can produce what it needs. | 11 to 23 |
| 1.0 | Before 11 Nov 2026 | The design, the schema and the scripts were reconciled, and ten conflicts between them were resolved. | 1 to 10 |
