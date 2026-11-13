#!/usr/bin/env python3
"""Generate the static documentation site into public/.

Sources (all in data/):
  design.md       the design document, split by second-level heading into process pages
  schema.json     field vocabularies, artefact types, check library, phases, tiers
  catalogue.csv   236 techniques, 52 columns
  test-*.md       test evidence

Run from the repository root:  python3 build/build.py
Requires the markdown package (pip install markdown).
"""
import csv
import html
import json
import re
import shutil
import sys
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = ROOT / "public"
ASSETS_SRC = ROOT / "build" / "assets"

SITE = "MANIFST"

schema = json.loads((DATA / "schema.json").read_text(encoding="utf-8"))
rows = list(csv.DictReader((DATA / "catalogue.csv").open(encoding="utf-8")))
design_text = (DATA / "design.md").read_text(encoding="utf-8")

FIELDS = {f["key"]: f for f in schema["fields"]}
CSV_TO_KEY = {f.get("csv_column", f["key"]): f["key"] for f in schema["fields"]}
CHECKS = {c["code"]: c for c in schema["check_library"]}
RELATIONS = [r["name"] for r in schema["relations"]]
BY_ID = {r["id"]: r for r in rows}


def esc(s):
    return html.escape(s or "", quote=True)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def md_block(text):
    return markdown.markdown(text, extensions=["tables", "sane_lists"])


def md_inline(text):
    out = markdown.markdown(text or "")
    out = re.sub(r"^<p>|</p>$", "", out.strip())
    return out


def clean_name(s):
    return re.sub(r"\*\*", "", s).strip()


# ---------------------------------------------------------------- families
FAMILY_ORDER = [
    "Frame the question",
    "Decompose and map",
    "Compare",
    "Trace cause and test claims",
    "Handle evidence",
    "Project forward",
    "Assess actors, options and risks",
    "Challenge",
    "Prepare and extract",
    "Measure and model",
    "Integrate across sources",
    "Check extracted results",
]
FAMILIES = {f: [r for r in rows if r["family"] == f] for f in FAMILY_ORDER}
assert sum(len(v) for v in FAMILIES.values()) == len(rows), "family names do not match the catalogue"
FAM_SLUG = {f: slug(f) for f in FAMILY_ORDER}

# ------------------------------------------------------------ design doc
parts = re.split(r"^## ", design_text, flags=re.M)
doc_title = parts[0].splitlines()[0].lstrip("# ").strip()
doc_intro = "\n".join(parts[0].splitlines()[1:]).strip()
sections = {}
for p in parts[1:]:
    head, _, body = p.partition("\n")
    m = re.match(r"(\d+)\.\s+(.*)", head)
    sections[int(m.group(1))] = (m.group(2).strip(), body.strip())

# Page registry: path -> dict(title, group, kind)
PAGES = []


def add_page(path, title, group, body_html, desc="", toc=True, wide=False, scripts=()):
    PAGES.append(dict(path=path, title=title, group=group, body=body_html, desc=desc, toc=toc, wide=wide, scripts=scripts))


SECTION_PAGE = {
    1: "/",
    2: "/process/",
    3: "/process/intake/",
    4: "/process/choosing-techniques/",
    5: "/process/planning-the-order/",
    6: "/process/running-the-techniques/",
    7: "/process/checks-and-answer/",
    8: "/catalogue/",
    9: "/project/decisions/",
    10: "/project/open-items/",
    11: "/project/files-and-change-rule/",
    12: "/project/files-and-change-rule/",
}


def link_sections(text):
    def rep(m):
        n = int(m.group(2))
        if n in SECTION_PAGE:
            return f"{m.group(1)}[section {n}]({SECTION_PAGE[n]})"
        return m.group(0)

    return re.sub(r"(\()section (\d+)(?=\))", lambda m: rep(m), text)


def section_html(n):
    title, body = sections[n]
    return md_block(link_sections(body))


def split_h3(body):
    """Return list of (heading, body) for a block that uses ### headings."""
    return re.split(r"^### ", body, flags=re.M)


def make_simulator():
    data = json.loads((DATA / "simulator.json").read_text(encoding="utf-8"))
    data = []  # The five recorded test jobs (data/simulator.json) are not shown: they hold no technique results.
    run = json.loads((DATA / "run.json").read_text(encoding="utf-8"))
    _mat = re.sub(r"^# .*\n", "", (DATA / "run1" / "source_material.md").read_text(encoding="utf-8"), count=1)
    run["material_html"] = md_block(demote(_mat))
    run["results_html"] = {k: md_block(demote(v)) for k, v in run.pop("results").items()}
    for pk in run["picks"]:
        pk["ceiling"] = BY_ID[pk["id"]]["claim_ceiling"].strip()
    data.insert(0, run)
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    opts = "".join(f'<option value="{esc(d["id"])}">{esc(d["name"])}</option>' for d in data)
    steps = [st["name"] for st in schema["steps"]]
    rail = "".join(f'<li data-step="{i}"><button type="button" class="step-btn"><span class="dot" aria-hidden="true"></span><span class="lbl">{i + 1}. {esc(t)}</span><span class="st sr"></span></button></li>' for i, t in enumerate(steps))
    body = f"""
<p class="lede">This is an actual run on ten interview quotes from eight participants. Submit the intake form to start it. Every technique in the plan ran, and the findings are in the cards.</p>
<div class="sim-note" id="sim-note"></div>
<div class="sim-controls">
  <label for="sim-job">Brief</label>
  <select id="sim-job">{opts}</select>
  <button type="button" id="sim-run" class="btn">Run to end</button>
  <button type="button" id="sim-step" class="btn">Next step</button>
  <button type="button" id="sim-reset" class="btn">Reset</button>
  <label for="sim-speed">Speed</label>
  <select id="sim-speed"><option value="1">Normal</option><option value="0.4">Fast</option><option value="2.2">Slow</option></select>
</div>
<div class="tally" aria-label="Running totals">
  <div><span class="n" id="t-cat">{len(rows)}</span><span class="k">techniques in the catalogue</span></div>
  <div><span class="n" id="t-pass">-</span><span class="k">eligible</span></div>
  <div><span class="n" id="t-pick">-</span><span class="k">chosen (limit 10)</span></div>
  <div><span class="n" id="t-run">-</span><span class="k">techniques in the plan</span></div>
  <div><span class="n" id="t-person">-</span><span class="k">checks that need a person</span></div>
</div>
<ul class="legend" aria-label="Key to the cards"><li><span class="sw sw-input"></span>Your input: what you enter or decide</li><li><span class="sw sw-work"></span>Work: what code or the model did on the way to the answer</li><li><span class="sw sw-output"></span>Output: the report you receive at the end</li></ul>
<div class="sim-app">
  <ol class="sim-steps" aria-label="Process steps">{rail}</ol>
  <section class="sim-stage" aria-live="polite" aria-labelledby="sim-title">
    <header><h2 id="sim-title">Ready</h2><div class="bar" aria-hidden="true"><i id="sim-bar"></i></div></header>
    <div id="sim-out"></div>
  </section>
</div>
<script type="application/json" id="sim-data">{blob}</script>
"""
    mat = (DATA / "run1" / "source_material.md").read_text(encoding="utf-8")
    mat = re.sub(r"^# .*\n", "", mat, count=1)
    add_page("/simulator/material/", "Submitted content: voice AI interviews", "Overview",
             "<p>This is the content submitted for the run in the simulator. <a href=\"/simulator/\">Back to the simulator</a>.</p>" + md_block(demote(mat)),
             "The content submitted for the simulator run.", toc=False, wide=True)
    add_page("/simulator/", "Simulator", "Overview", body,
             "The eight steps of the process on one screen, replayed from an actual run.", toc=False, wide=True,
             scripts=("/assets/simulator.js",))


# ---------------------------------------------------------------- pages
def make_process_pages():
    # Overview of the process: section 2
    add_page("/process/", "The process", "Process", section_html(2),
             "Eight steps from the user's request to the answer, the terms used, the five kinds of technique and the rules that apply throughout.")
    add_page("/process/intake/", "Step 1: Intake", "Process", section_html(3),
             "How four kinds of input become a brief, and which questions the user is asked.")
    add_page("/process/choosing-techniques/", "Steps 2 and 3: Rule out and choose techniques", "Process", section_html(4),
             "Code removes techniques that cannot run on the material. The model chooses from the eligible ones.")
    add_page("/process/planning-the-order/", "Step 4: Plan the order", "Process", section_html(5),
             "How the chosen techniques are placed in run order and how checks are added.")
    add_page("/process/running-the-techniques/", "Step 5: Run the techniques", "Process", section_html(6),
             "Examine the question, prepare the material and analyse it, and how one technique is run.")
    add_page("/process/checks-and-answer/", "Steps 6 to 8: Check, combine and answer", "Process", section_html(7),
             "How findings are checked and combined, how confidence is labelled, and what the answer states.")


def make_project_pages():
    add_page("/project/decisions/", "Decisions", "Project record", section_html(9),
             "A dated history of the decisions behind the design. The current rules are on the process pages.")
    add_page("/project/open-items/", "Open items", "Project record", section_html(10),
             "What is untested, unbuilt or known to be wrong in the catalogue data.")
    files = section_html(11) + "<h2>Change rule</h2>" + section_html(12)
    add_page("/project/files-and-change-rule/", "Files and change rule", "Project record", files,
             "Which file holds what, and how to change the model without creating conflicts.")
    # test evidence
    t1 = (DATA / "test-output-specs.md").read_text(encoding="utf-8")
    t2 = (DATA / "test-spot-check.md").read_text(encoding="utf-8")
    t1 = re.sub(r"^# .*\n", "", t1, count=1)
    t2 = re.sub(r"^# .*\n", "", t2, count=1)
    body = ("<h2>Output specification test</h2>" + md_block(demote(t1)) +
            "<h2>Spot check of 30 rows</h2>" + md_block(demote(t2)))
    add_page("/project/test-evidence/", "Test evidence", "Project record", body,
             "The two tests run on the catalogue so far.")


def demote(text):
    """Turn ## into ### so test documents sit under a page level h2."""
    return re.sub(r"^(#{2,5}) ", lambda m: "#" * (len(m.group(1)) + 1) + " ", text, flags=re.M)


def make_home():
    counts = {f: len(v) for f, v in FAMILIES.items()}
    body = f"""
<p class="lede">MANIFST is a catalogue of analytical techniques and a process for choosing and running them. It takes a request and some material, chooses the analytical techniques that can run on that material, runs them in order, checks their findings and combines them into one answer with a confidence label for each conclusion.</p>
<p>The name is a respelling of manifest. A ship's manifest lists what the ship carries, and something manifest is plain to see. The name is provisional.</p>
<p>The catalogue holds {len(rows)} techniques in {len(FAMILIES)} families. This site documents the process and the catalogue. It is generated from the design document, the schema and the catalogue file in the repository, so it changes only when those change.</p>
<div class="cards">
  <a class="card" href="/process/"><p class="card-title">Process</p><p>Eight steps, from intake to the answer.</p></a>
  <a class="card" href="/catalogue/"><p class="card-title">Catalogue</p><p>{len(rows)} techniques in {len(FAMILIES)} families, with a page for each.</p></a>
  <a class="card" href="/reference/fields/"><p class="card-title">Reference</p><p>The 52 fields, 21 working document types, 18 checks, kinds of technique and stakes levels.</p></a>
  <a class="card" href="/project/decisions/"><p class="card-title">Project record</p><p>Decisions, open items and test evidence.</p></a>
</div>
<h2>Purpose and status</h2>
{section_html(1)}
<h2>Catalogue at a glance</h2>
<table><thead><tr><th>Family</th><th>Techniques</th></tr></thead><tbody>
{''.join(f'<tr><td><a href="/catalogue/{FAM_SLUG[f]}/">{esc(f)}</a></td><td>{counts[f]}</td></tr>' for f in FAMILY_ORDER)}
<tr><td><strong>Total</strong></td><td><strong>{len(rows)}</strong></td></tr></tbody></table>
"""
    add_page("/", "MANIFST", "Overview", body, "Documentation of MANIFST: a catalogue of analytical techniques and a process for choosing and running them.")


def make_catalogue_index():
    intro = section_html(8)
    # Section 8 starts with the family table; keep the prose and the artefact notes, and add search.
    body = f"""
<p>Filter the {len(rows)} techniques by name, purpose or family. Each technique has its own page.</p>
<div class="filter">
  <label for="tech-filter">Filter techniques</label>
  <input id="tech-filter" type="search" autocomplete="off" placeholder="Type a word, such as survey, bias or forecast">
  <label for="fam-filter" class="sr">Family</label>
  <select id="fam-filter"><option value="">All families</option>{''.join(f'<option>{esc(f)}</option>' for f in FAMILY_ORDER)}</select>
  <span id="filter-count" aria-live="polite"></span>
</div>
<table class="tech-table" id="tech-table"><thead><tr><th>ID</th><th>Technique</th><th>Family</th><th>Purpose</th></tr></thead><tbody>
{''.join(f'<tr data-family="{esc(r["family"])}"><td><a href="{tech_url(r)}">{esc(r["id"])}</a></td><td><a href="{tech_url(r)}">{esc(clean_name(r["technique"]))}</a></td><td>{esc(r["family"])}</td><td>{esc(r["purpose"])}</td></tr>' for r in rows)}
</tbody></table>
<h2>Families, field names and working documents</h2>
{intro}
"""
    add_page("/catalogue/", "Catalogue", "Catalogue", body, f"All {len(rows)} techniques, searchable.")


def tech_url(r):
    return f"/catalogue/{FAM_SLUG[r['family']]}/{slug(r['id'])}/"


def make_family_pages():
    for f in FAMILY_ORDER:
        items = FAMILIES[f]
        body = f"""<p>{len(items)} techniques.</p>
<table><thead><tr><th>ID</th><th>Technique</th><th>Purpose</th><th>Evidence status</th></tr></thead><tbody>
{''.join(f'<tr><td><a href="{tech_url(r)}">{esc(r["id"])}</a></td><td><a href="{tech_url(r)}">{esc(clean_name(r["technique"]))}</a></td><td>{esc(r["purpose"])}</td><td>{esc(r["evidence_status"])}</td></tr>' for r in items)}
</tbody></table>"""
        add_page(f"/catalogue/{FAM_SLUG[f]}/", f, "Catalogue", body, f"{len(items)} techniques in the family {f}.")


def split_list(s, sep=";"):
    return [x.strip() for x in (s or "").split(sep) if x.strip()]


def pill(text, cls=""):
    return f'<span class="pill {cls}">{esc(text)}</span>'


def kv_table(pairs):
    rows_html = "".join(f"<tr><th scope='row'>{k}</th><td>{v}</td></tr>" for k, v in pairs)
    return f'<table class="kv"><tbody>{rows_html}</tbody></table>'


def artefact_list(s):
    items = split_list(s)
    if not items or items == ["none"]:
        return "None"
    out = []
    for it in items:
        name, _, state = it.partition(":")
        out.append(f'<li><a href="/reference/artefact-types/#{slug(name)}">{esc(name)}</a>' + (f" ({esc(state)})" if state else "") + "</li>")
    return "<ul>" + "".join(out) + "</ul>"


REL_RE = re.compile("(" + "|".join(re.escape(n) for n in sorted(RELATIONS, key=len, reverse=True)) + r") :: ([A-Z0-9-]+) :: ")


def parse_related(s):
    if not s or s.strip() == "none":
        return []
    out = []
    ms = list(REL_RE.finditer(s))
    for i, m in enumerate(ms):
        end = ms[i + 1].start() if i + 1 < len(ms) else len(s)
        text = s[m.end():end].strip().rstrip(";").strip()
        out.append((m.group(1), m.group(2), text))
    return out


CLAIM_PLAIN = {"describe": "describe", "associate": "show a link between things", "predict without implying cause": "predict, without claiming a cause",
               "estimate an intervention effect": "estimate the effect of an action", "explain mechanism or counterfactual": "explain how or why"}
GATE_LABEL = {g["value"]: g.get("label", g["value"]) for g in schema["gate_classes"]}


def flabel(f):
    return f.get("plain_label") or f["label"]


def kind_of(r):
    ph = r["primary_phase"].strip()
    if ph == "frame":
        return "Question technique", "5.1"
    if ph in ("gather", "verify and prepare"):
        return "Preparation technique", "5.2"
    if ph == "validate":
        return ("Challenge technique" if r["family"] == "Challenge" else "Verification technique"), "6"
    return "Analysis technique", "5.3"


def make_technique_page(r):
    tid = r["id"]
    name = clean_name(r["technique"])
    fam = r["family"]
    # overview
    ov = f"""
<p class="lede">{esc(r['purpose'])}</p>
<div class="meta-row">{pill(fam)}{pill('Evidence: ' + r['evidence_status'])}{pill(kind_of(r)[0] + ', runs in step ' + kind_of(r)[1])}{pill('Strongest statement: ' + CLAIM_PLAIN.get(r['claim_ceiling'].strip(), r['claim_ceiling']))}</div>
<h2 id="what-it-does">What it does</h2><p>{esc(r['what_it_does'])}</p>
<h2 id="use-when">When to use it</h2><p>{esc(r['use_when'])}</p>
<h2 id="fit-test">When it does not fit</h2><p>{esc(r['fit_test'])}</p>
<h2 id="result-format">Result format</h2><p>{esc(r['output_spec'])}</p>
"""
    # requirements: facets that are not 'any'
    req_rows, free = [], []
    for key, f in FIELDS.items():
        if f["group"] != "input profile":
            continue
        col = f.get("csv_column", key)
        v = r.get(col, "any")
        if v.strip() == "any":
            free.append(flabel(f))
            continue
        req_rows.append(
            f'<tr><th scope="row"><a href="/reference/fields/#{key}">{esc(flabel(f))}</a></th><td>{pill(GATE_LABEL[f["gate_class"]], "g-" + slug(f["gate_class"]))}</td><td><code>{esc(v)}</code></td></tr>')
    req = "<h2 id=\"requirements\">Requirements on the material</h2>"
    if req_rows:
        req += '<table><thead><tr><th>Property</th><th>Requirement type</th><th>Requirement</th></tr></thead><tbody>' + "".join(req_rows) + "</tbody></table>"
    else:
        req += "<p>No requirement on any property of the material.</p>"
    if free:
        req += f'<p class="small">Not restricted on: {esc(", ".join(free))}.</p>'
    req += kv_table([
        ("Minimum material", esc(r["requires_minimum"])),
        ("Outside material needed", esc(r["external_material_needed"])),
        ("Not for (rules)", esc(r["not_for_rules"])),
        ("Not for (text)", esc(r["not_for_text"])),
    ])
    # selection and sequencing
    seq = "<h2 id=\"choosing-and-ordering\">Choosing and ordering</h2>" + kv_table([
        ("Kind of technique", esc(kind_of(r)[0] + ", runs in step " + kind_of(r)[1])),
        ("Phase tag", esc(r["primary_phase"])),
        ("Other phase tags", esc(r["other_phases"])),
        ("Kind of finding", esc(r["insight_type"])),
        ("Question answered", esc(r["question_answered"])),
        ("Strongest statement it supports", esc(CLAIM_PLAIN.get(r["claim_ceiling"].strip(), r["claim_ceiling"]))),
        ("Needs as input", artefact_list(r["consumes"])),
        ("Makes as output", artefact_list(r["produces"])),
        ("Must exist first", artefact_list(r["requires"])),
        ("Loop target", esc(r["loop_target"])),
    ])
    # checks
    by_tier = {}
    for it in split_list(r["minimum_checks"]):
        tier, _, code = it.partition(":")
        by_tier.setdefault(tier.strip(), []).append(code.strip())
    chk_rows = []
    for tier in ["exploratory", "decision-informing", "high-stakes"]:
        for code in by_tier.get(tier, []):
            c = CHECKS.get(code)
            hi = c["human_involvement"]["level"] if c else "unknown"
            corr = c["counts_as_corroboration"] if c else "unknown"
            chk_rows.append(f'<tr><td>{esc(tier)}</td><td><a href="/reference/checks/#{slug(code)}">{esc(code)}</a></td><td>{esc(hi)}</td><td>{esc(corr)}</td></tr>')
    chk = "<h2 id=\"checks\">Library checks by stakes</h2><p>Each stakes level includes the checks of the level below it. Repeatability: " + esc(r["repeatability"]) + ".</p>"
    chk += '<table><thead><tr><th>Stakes</th><th>Check</th><th>Person involved</th><th>Counts as a different method</th></tr></thead><tbody>' + "".join(chk_rows) + "</tbody></table>"
    # failure modes
    fail = "<h2 id=\"failure-modes-and-limits\">Failure modes and limits</h2>" + kv_table([
        ("Model suitability", esc(r["model_suitability"])),
        ("Typical model failure", esc(r["typical_model_failure"])),
        ("Error sources", esc("; ".join(split_list(r["error_sources"])))),
        ("Certainty limits", esc(r["certainty_limits"])),
    ])
    # related
    rel = parse_related(r["related_techniques"])
    relh = ""
    if rel:
        li = []
        for rname, rid, text in rel:
            tgt = BY_ID.get(rid)
            link = f'<a href="{tech_url(tgt)}">{esc(rid)} {esc(clean_name(tgt["technique"]))}</a>' if tgt else esc(rid)
            li.append(f"<li><strong>{esc(rname)}</strong> {link}: {esc(text)}</li>")
        relh = "<h2 id=\"related-techniques\">Related techniques</h2><ul>" + "".join(li) + "</ul>"
    # evidence
    ev = "<h2 id=\"evidence\">Evidence and tag basis</h2><p>" + md_inline(r["status_and_evidence"]) + f'</p><p class="small">Tag basis: {esc(r["tag_basis"])}. All tag values are inference unless a source is named.</p>'
    body = ov + req + seq + chk + fail + relh + ev
    add_page(tech_url(r), f"{tid} {name}", "Catalogue", body, r["purpose"])


def make_reference():
    # fields
    groups = []
    for g in ["identity", "input profile", "selection", "sequencing", "robustness", "application"]:
        fs = [f for f in schema["fields"] if f["group"] == g]
        if fs:
            groups.append((g, fs))
    body = [f"<p>{len(schema['fields'])} fields. The requirement type says what a field does when techniques are ruled out and chosen. Field keys are the names used in the schema and the catalogue file.</p>"]
    body.append("<h2 id=\"requirement-types\">Requirement types</h2><table><thead><tr><th>Type</th><th>Name in the schema</th><th>Meaning</th></tr></thead><tbody>" +
                "".join(f"<tr><td>{esc(c.get('label', c['value']))}</td><td><code>{esc(c['value'])}</code></td><td>{esc(c['definition'])}</td></tr>" for c in schema["gate_classes"]) + "</tbody></table>")
    for g, fs in groups:
        body.append(f"<h2 id=\"{slug(g)}\">{esc(g[0].upper() + g[1:])} fields</h2>")
        for f in fs:
            vals = ""
            if f.get("values"):
                vals = "<table class='vals'><thead><tr><th>Value</th><th>Meaning</th></tr></thead><tbody>" + "".join(
                    f"<tr><td><code>{esc(v['value'])}</code></td><td>{esc(v.get('definition', ''))}</td></tr>" for v in f["values"]) + "</tbody></table>"
            body.append(f"""<section class="field" id="{f['key']}"><h3>{esc(flabel(f))} {pill(GATE_LABEL[f['gate_class']], 'g-' + slug(f['gate_class']))}</h3>
<p class="small">Schema name: <code>{esc(f['key'])}</code>{' (' + esc(f['label']) + ')' if f.get('plain_label') else ''}</p>
<p>{esc(f['definition'])}</p>
<p class="small"><strong>Tagging rule.</strong> {esc(f.get('tagging_rule', ''))}</p>
{vals}</section>""")
    add_page("/reference/fields/", "Fields", "Reference", "".join(body), "All 52 catalogue fields grouped by purpose, with requirement type and values.")

    # artefacts
    ab = ["<p>Working documents are what techniques need as input and make as output. The schema calls them artefacts. The order of preparation techniques follows from them.</p>"]
    kinds = {}
    for a in schema["artefact_types"]:
        kinds.setdefault(a["kind"], []).append(a)
    for k, items in kinds.items():
        ab.append(f"<h2 id=\"{slug(k)}\">{esc(k[0].upper() + k[1:])}</h2>")
        for a in items:
            st = ", ".join(a["states"]) if a.get("states") else "none"
            ab.append(f'<section class="field" id="{slug(a["name"])}"><h3>{esc(a["name"][0].upper() + a["name"][1:])}</h3><p>{esc(a["definition"])}</p><p class="small">States: {esc(st)}.{" Single use." if a.get("single_use") else ""}</p></section>')
    add_page("/reference/artefact-types/", "Working document types", "Reference", "".join(ab), "The 21 types of working document and their states.")

    # checks
    cb = ["<p>" + esc(schema.get("check_library_note", "")) + "</p>",
          "<table><thead><tr><th>Check</th><th>What it tests</th><th>Person involved</th><th>Corroboration</th></tr></thead><tbody>"]
    for c in schema["check_library"]:
        cb.append(f'<tr id="{slug(c["code"])}"><td><strong>{esc(c["code"])}</strong><br><span class="small">{esc(c["definition"])}</span></td><td>{esc(c["tests"])}</td><td>{esc(c["human_involvement"]["level"])}<br><span class="small">{esc(c["human_involvement"]["detail"])}</span></td><td>{esc(c["counts_as_corroboration"])}</td></tr>')
    cb.append("</tbody></table>")
    add_page("/reference/checks/", "Check library", "Reference", "".join(cb), "The 18 checks, what each tests and whether a person is needed.")

    # phases and tiers
    KIND = {"frame": "Question technique, 5.1", "gather": "Preparation technique, 5.2", "verify and prepare": "Preparation technique, 5.2",
            "analyse": "Analysis technique, 5.3", "validate": "Verification or challenge technique, step 6", "conclude": "Not a technique: step 7", "report": "Not a technique: step 8"}
    pb = ["<h2 id=\"steps\">Process steps</h2><table><thead><tr><th>Step</th><th>What happens</th></tr></thead><tbody>" +
          "".join(f"<tr><td>{esc(st['number'])}. {esc(st['name'])}</td><td>{esc(st['does'])}</td></tr>" for st in schema["steps"]) + "</tbody></table>",
          "<h2 id=\"phases\">Kinds of technique</h2><p>Each technique has a phase tag. The tag gives its kind and the step it runs in.</p><table><thead><tr><th>Phase tag</th><th>Kind and step</th><th>Definition of the tag</th></tr></thead><tbody>"]
    for p in schema["phases"]:
        pb.append(f"<tr><td>{esc(p['name'])}</td><td>{esc(KIND.get(p['name'], ''))}</td><td>{esc(p['definition'])}</td></tr>")
    pb.append("</tbody></table>")
    if schema.get("phase_mapping_note"):
        pb.append(f"<p class=\"small\">{esc(schema['phase_mapping_note'])}</p>")
    pb.append("<h2 id=\"stakes-tiers\">Stakes</h2><table><thead><tr><th>Level</th><th>Definition</th></tr></thead><tbody>")
    for t in schema["tiers"]["definitions"]:
        pb.append(f"<tr><td>{esc(t['tier'])}</td><td>{esc(t['definition'])}</td></tr>")
    pb.append("</tbody></table>")
    pb.append("<h2 id=\"relations\">Relations between techniques</h2><table><thead><tr><th>Relation</th><th>Strength</th><th>Meaning</th></tr></thead><tbody>")
    for rl in schema["relations"]:
        pb.append(f"<tr><td>{esc(rl['name'])}</td><td>{esc(rl['strength'])}</td><td>{esc(rl['definition'])}</td></tr>")
    pb.append("</tbody></table>")
    add_page("/reference/phases-and-tiers/", "Steps, kinds of technique, stakes and relations", "Reference", "".join(pb), "Process steps, kinds of technique, stakes levels and the relations between techniques.")


# ------------------------------------------------------------------ nav
NAV = [
    ("Overview", [("/", "Overview"), ("/simulator/", "Simulator")]),
    ("Process", [("/process/", "The process"), ("/process/intake/", "1. Intake"), ("/process/choosing-techniques/", "2 and 3. Rule out and choose"),
                 ("/process/planning-the-order/", "4. Plan the order"), ("/process/running-the-techniques/", "5. Run the techniques"),
                 ("/process/checks-and-answer/", "6 to 8. Check, combine and answer")]),
    ("Catalogue", [("/catalogue/", "All techniques")] + [(f"/catalogue/{FAM_SLUG[f]}/", f"{f} ({len(FAMILIES[f])})") for f in FAMILY_ORDER]),
    ("Reference", [("/reference/fields/", "Fields"), ("/reference/artefact-types/", "Working document types"),
                   ("/reference/checks/", "Check library"), ("/reference/phases-and-tiers/", "Steps, kinds, stakes and relations")]),
    ("Project record", [("/project/decisions/", "Decisions"), ("/project/open-items/", "Open items"),
                        ("/project/test-evidence/", "Test evidence"), ("/project/files-and-change-rule/", "Files and change rule")]),
]
# Reading order: all nav pages including family pages
ORDER = [p[0] for _, items in NAV for p in items]


def nav_html(current):
    out = []
    for grp, items in NAV:
        open_attr = " open" if any(current == u or (grp == "Catalogue" and current.startswith("/catalogue/")) or (grp != "Catalogue" and current.startswith(u) and u != "/") for u, _ in items) or grp == "Overview" else ""
        lis = []
        for u, t in items:
            is_family = re.match(r"/catalogue/[a-z0-9-]+/$", u) and u != "/catalogue/"
            cur = ' aria-current="page"' if (u == current or (is_family and current.startswith(u))) else ""
            lis.append(f'<li><a href="{u}"{cur}>{esc(t)}</a></li>')
        if grp == "Overview":
            out.append(f'<ul class="nav-top">{"".join(lis)}</ul>')
        else:
            out.append(f'<details{open_attr}><summary>{esc(grp)}</summary><ul>{"".join(lis)}</ul></details>')
    return "<nav aria-label=\"Documentation\">" + "".join(out) + "</nav>"


def crumbs(page):
    path = page["path"]
    items = [("/", "Overview")]
    if path == "/":
        return ""
    if path.startswith("/process/"):
        items.append(("/process/", "Process")) if path != "/process/" else None
    elif path.startswith("/catalogue/"):
        items.append(("/catalogue/", "Catalogue"))
        segs = path.strip("/").split("/")
        if len(segs) == 3:
            fam = next(f for f in FAMILY_ORDER if FAM_SLUG[f] == segs[1])
            items.append((f"/catalogue/{segs[1]}/", fam))
    elif path.startswith("/reference/"):
        items.append(("/reference/fields/", "Reference"))
    elif path.startswith("/project/"):
        items.append(("/project/decisions/", "Project record"))
    # drop duplicates of current
    items = [i for i in items if i[0] != path]
    parts = [f'<li><a href="{u}">{esc(t)}</a></li>' for u, t in items]
    parts.append(f'<li aria-current="page">{esc(page["title"])}</li>')
    return '<nav class="crumbs" aria-label="Breadcrumb"><ol>' + "".join(parts) + "</ol></nav>"


def add_heading_ids(body):
    seen = set()

    def rep(m):
        lvl, attrs, inner = m.group(1), m.group(2), m.group(3)
        if "id=" in attrs:
            i = re.search(r'id="([^"]+)"', attrs).group(1)
            seen.add(i)
            return m.group(0)
        i = slug(re.sub(r"<[^>]+>", "", inner)) or "section"
        base, n = i, 2
        while i in seen:
            i = f"{base}-{n}"
            n += 1
        seen.add(i)
        return f'<h{lvl}{attrs} id="{i}">{inner}</h{lvl}>'

    return re.sub(r"<h([23])([^>]*)>(.*?)</h\1>", rep, body, flags=re.S)


def toc_html(body):
    hs = re.findall(r'<h([23])[^>]*id="([^"]+)"[^>]*>(.*?)</h\1>', body, flags=re.S)
    hs = [(l, i, re.sub(r"<[^>]+>", "", t).strip()) for l, i, t in hs]
    # technique field pages have many h3: keep h2 only if more than 25 entries
    if len(hs) > 25:
        hs = [h for h in hs if h[0] == "2"]
    if len(hs) < 2:
        return ""
    lis = "".join(f'<li class="l{l}"><a href="#{i}">{esc(t)}</a></li>' for l, i, t in hs)
    return f'<nav class="toc" aria-label="On this page"><h2>On this page</h2><ul>{lis}</ul></nav>'


def prev_next(page):
    path = page["path"]
    prev = nxt = None
    segs = path.strip("/").split("/")
    if path.startswith("/catalogue/") and len(segs) == 3:
        fam = next(f for f in FAMILY_ORDER if FAM_SLUG[f] == segs[1])
        items = FAMILIES[fam]
        idx = next(i for i, r in enumerate(items) if tech_url(r) == path)
        if idx > 0:
            prev = (tech_url(items[idx - 1]), f"{items[idx-1]['id']} {clean_name(items[idx-1]['technique'])}")
        if idx < len(items) - 1:
            nxt = (tech_url(items[idx + 1]), f"{items[idx+1]['id']} {clean_name(items[idx+1]['technique'])}")
    elif path in ORDER:
        i = ORDER.index(path)
        titles = {u: t for _, its in NAV for u, t in its}
        if i > 0:
            prev = (ORDER[i - 1], titles[ORDER[i - 1]])
        if i < len(ORDER) - 1:
            nxt = (ORDER[i + 1], titles[ORDER[i + 1]])
    if not (prev or nxt):
        return ""
    p = f'<a class="prev" href="{prev[0]}"><span>Previous</span>{esc(prev[1])}</a>' if prev else "<span></span>"
    n = f'<a class="next" href="{nxt[0]}"><span>Next</span>{esc(nxt[1])}</a>' if nxt else "<span></span>"
    return f'<nav class="pager" aria-label="Previous and next page">{p}{n}</nav>'


TEMPLATE = """<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=Public+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body class="{bodycls}">
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <button class="menu-btn" aria-expanded="false" aria-controls="sidebar">Menu</button>
  <a class="brand" href="/">{site}</a>
  <div class="search" role="search">
    <label for="q" class="sr">Search the documentation</label>
    <input id="q" type="search" autocomplete="off" placeholder="Search pages and techniques" aria-controls="results">
    <ul id="results" hidden></ul>
  </div>
</header>
<div class="shell">
  <aside id="sidebar" class="side">{nav}</aside>
  <main id="main" class="content">
    {crumbs}
    <h1>{h1}</h1>
    <div class="prose">{body}</div>
    {pager}
  </main>
  <aside class="rail">{toc}</aside>
</div>
<script src="/assets/site.js" defer></script>
{scripts}
</body>
</html>
"""


def render(page):
    # Keep JSON data blocks out of the table wrapping and heading id passes.
    blocks = re.findall(r'<script type="application/json".*?</script>', page["body"], flags=re.S)
    body = page["body"]
    for n, blk in enumerate(blocks):
        body = body.replace(blk, f"@@JSON{n}@@")
    body = add_heading_ids(body)
    body = re.sub(r"<table", '<div class="table-wrap"><table', body)
    body = body.replace("</table>", "</table></div>")
    for n, blk in enumerate(blocks):
        body = body.replace(f"@@JSON{n}@@", blk)
    title = page["title"] if page["path"] != "/" else f"{SITE}: documentation"
    full_title = f"{page['title']} | {SITE}" if page["path"] != "/" else f"{SITE}: documentation"
    html_out = TEMPLATE.format(
        title=esc(full_title), desc=esc(page["desc"][:200]), site=esc(SITE), nav=nav_html(page["path"]),
        crumbs=crumbs(page), h1=esc(page["title"] if page["path"] != "/" else SITE), body=body,
        pager=prev_next(page) if not page.get("wide") else "", toc=toc_html(body) if page["toc"] else "",
        bodycls="wide" if page.get("wide") else "", scripts="".join(f'<script src="{u}" defer></script>' for u in page.get("scripts", ())))
    dest = OUT / page["path"].strip("/") / "index.html" if page["path"] != "/" else OUT / "index.html"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(html_out, encoding="utf-8")


def make_search_index():
    idx = []
    for p in PAGES:
        if re.match(r"/catalogue/[a-z0-9-]+/[a-z0-9-]+/$", p["path"]):
            continue
        idx.append({"t": p["title"], "u": p["path"], "g": p["group"], "d": p["desc"]})
    for r in rows:
        idx.append({"t": f"{r['id']} {clean_name(r['technique'])}", "u": tech_url(r), "g": r["family"], "d": r["purpose"]})
    (OUT / "assets").mkdir(parents=True, exist_ok=True)
    (OUT / "assets" / "search.json").write_text(json.dumps(idx, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    shutil.copytree(ASSETS_SRC, OUT / "assets", dirs_exist_ok=True)

    make_home()
    make_process_pages()
    make_catalogue_index()
    make_family_pages()
    for r in rows:
        make_technique_page(r)
    make_reference()
    make_project_pages()
    make_simulator()
    for p in PAGES:
        render(p)
    make_search_index()
    (OUT / "404.html").write_text(
        TEMPLATE.format(title="Page not found | " + SITE, desc="Page not found", site=SITE, nav=nav_html("/404"), crumbs="",
                        h1="Page not found", body='<p>This page does not exist. Use the search box or the menu, or go to the <a href="/">overview</a>.</p>',
                        pager="", toc="", bodycls="", scripts=""), encoding="utf-8")
    print(f"Wrote {len(PAGES)} pages and search index to {OUT}")


if __name__ == "__main__":
    main()
