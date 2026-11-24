The skill runs the startthat.work process on your question and your material. It is named `analysis`. It works in Claude and in GitHub Copilot, because both read the same skill format: a folder with a `SKILL.md` file, reference files and scripts.

<p><a class="button" href="/downloads/analysis.zip" download>Download analysis.zip</a> Version 1.5.6, 287 KB. It unzips to one folder named <code>analysis</code>.</p>

If you cannot install a skill, or want to see what the process does, you can follow the same steps yourself: see [Use by hand](/by-hand/).

## What is in the zip

- `SKILL.md`: the instructions the model follows, step by step.
- `references/`: the design document, the schema, the catalogue of 304 techniques and the prompts used for choosing techniques, combining the findings and writing the answer.
- `scripts/`: seven small Python scripts for intake, ruling out techniques, planning the sequence, and the checks that code can do. They write only to the paths the skill passes them, which are in a working folder named `analysis_run`.

Read `SKILL.md` and the scripts before you install them, as you would for any skill. The same files are described on the [process pages](/process/) of this site.

## What you need

- Python 3 and a way for the model to run code. In Claude this is the code execution setting. In Copilot it is terminal access.
- Extra tools for some file types. PDF files need `pdftotext` (from the poppler tools). HTML, Word and Excel files need the Python packages `beautifulsoup4`, `python-docx` and `openpyxl`. Text, Markdown, CSV and TSV files need nothing extra. Claude's code execution environment normally has these already. On your own computer, install any that are missing.
- A request and some material: documents, interview transcripts, a data file, pasted article text or a link to an article.
- Time and usage allowance. A run starts many separate model calls, one for each technique and each check. One run inside Claude on an article, under an earlier version, used about 1.4 million input tokens in the main conversation and about 570,000 more across five separate agents. If a call stops, for example because you reached a usage limit, that technique is dropped and the answer says so (decision 42).

## Use it in Claude

This covers claude.ai and the Claude desktop app. Custom skills are available on the Free, Pro, Max, Ultra, Team and Enterprise plans.

1. Turn on code execution. On Free, Pro, Max and Ultra, go to **Settings > Capabilities** and turn on **Code execution and file creation** (called **Create and edit files** in the newer layout). On Team and Enterprise, an owner turns it on in **Organization settings > Plugins & skills**, and an owner can also switch off skills that users create. If skills look greyed out, code execution is usually off.
2. Go to **Customize > Skills**, select **+**, then **+ Create skill**, then **Upload a skill**.
3. Upload `analysis.zip` without unzipping it. The folder inside the zip must be named `analysis`, because a folder name that differs from the skill name makes the upload fail.
4. Check that the skill is switched on in the list.
5. Start a new chat, attach your material and ask. Claude uses a skill when it judges that the skill fits, so naming it makes it certain.

An example request:

> Use the analysis skill. The attached article claims that human review of AI output reliably catches errors. Does the article's argument hold? The result will inform a decision, and I want conclusions with how well each is supported.

**Claude Code.** Claude Code reads skills from folders and does not need the zip uploaded. Unzip `analysis.zip` so that `SKILL.md` is at `~/.claude/skills/analysis/SKILL.md` (for every project) or `.claude/skills/analysis/SKILL.md` inside one project, then start a new session and ask for the skill by name.

## Use it in GitHub Copilot

Skills work in Copilot Chat in VS Code, in the GitHub Copilot CLI and in the Copilot cloud agent. Copilot reads a skill from a folder, so you unzip the file and do not upload it.

1. Unzip `analysis.zip`. You get a folder named `analysis`.
2. Copy the whole folder, not only `SKILL.md`, into one of these places. The folder name must stay `analysis`, because it has to match the skill's name.
   - **One repository:** `.github/skills/analysis/` in the repository. Contributors who open the repository get the skill. Copilot also reads `.claude/skills/` and `.agents/skills/` in a repository.
   - **Every project on your computer:** `~/.copilot/skills/analysis/` (in your home folder). Copilot also reads `~/.claude/skills/`.
3. Start a new chat. In VS Code, open Copilot Chat in agent mode. Type `/` and choose `analysis` from the list, then add your request after it. You can also describe the task and let Copilot pick the skill from its description. If `analysis` is not in the `/` list, the folder is in the wrong place or its name is wrong.
4. Put your material where the agent can read it: files in the open folder, or text pasted into the chat.

Three things to know in Copilot:

- **Separate agents.** The skill asks the model to run each technique as a separate agent. Where that is not possible it says to run the techniques one after the other, say so in the answer, and carry on. Expect a slower run in that case.
- **Working files.** The run writes its working files to a folder named `analysis_run` in the folder where you start it. Add it to `.gitignore` if that folder is a repository, so that it is not committed.
- **Not tested.** The skill has not been run in Copilot. If something fails, the part to look at first is the step that starts separate agents.

## What it asks you

The process stops for you at six points only, and the skill shows you what you need to decide each time:

1. Confirming the brief the skill has built from your request and material. Before that it asks at most four questions at a time about anything missing, such as what the result will be used for.
2. After the first group of techniques examines your question: keep the request as it is, or edit it.
3. At high stakes only: reviewing a small sample of the results before they are combined.
4. Choosing how the findings are combined, when more than one method applies.
5. Confirming that numeric estimates measure the same thing, when the findings are numbers.
6. After the answer: whether to run a follow-up round.

The skill finds any additional sources a technique needs by itself, after the plan exists, and lists each one in the answer. It does not ask you to approve them (decision 40).

## What you get

One answer, in this order: a summary of two to four paragraphs, the conclusions, insights where the analysis found something that goes against what the question or the material would lead a reader to expect, what was not covered, the strength of statement reached, what the answer is based on, and an offer of a follow-up round. The conclusions come in two groups: those that are well supported, and those with weaker support, each of which carries a sentence saying why. Each conclusion has a title that states the finding. The labels (high, medium and low) are recorded and shown if you ask for them. The [answer step](/process/checks-and-answer/) explains the form, and the [simulator](/simulator/) replays a stored run so you can see the form before you install anything.

Where the application can create a document, the answer is delivered as a document you can keep, share and export. Otherwise it is given in the chat.

## What has and has not been tested

The skill has run once end to end on an article, with each technique as a separate agent, and once inside Claude on the same article under an earlier version. It has not run in GitHub Copilot. These parts have not been run anywhere: the high-stakes review of a sample, delivery of the answer as a document, the personal information waiver, and a follow-up round. The confidence rule is a design choice, and the tags that decide which techniques fit are inference unless a catalogue row says otherwise. The open items on the [status page](/status/#open-items) list the rest.

## Updating

The first line of `references/design.md` inside the zip gives the version. To update in Claude, delete the skill from **Customize > Skills** and upload the new zip. To update in Copilot or Claude Code, replace the `analysis` folder with the new one.

## Sources for the installation steps

- [Use Skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude-ai), Anthropic support.
- [Use Agent Skills in VS Code](https://code.visualstudio.com/docs/agent-customization/agent-skills), Visual Studio Code documentation.
- [About Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills), GitHub documentation.
- [Use Skills in Claude Code](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview), Claude Platform documentation.
