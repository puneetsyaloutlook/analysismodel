#!/usr/bin/env python3
"""Export the recorded test jobs to data/simulator.json for the simulator page.

Run from the model working directory (the one that holds scripts/, schema/ and master/):
  python3 /path/to/analysismodel/build/export_simulator.py . /path/to/analysismodel/data/simulator.json

For each of the five test jobs it runs scripts/select.py and scripts/sequence.py and parses their output.
The model's picks are the recorded picks (master/test_jobs/picksN.json). Nothing here runs a technique.
"""
import csv, json, re, subprocess, sys
from pathlib import Path

work = Path(sys.argv[1]).resolve()
out = Path(sys.argv[2])
cat = work / "master/master_tagged.csv"
sch = work / "schema/schema.json"
rows = {r["id"]: r for r in csv.DictReader(cat.open(encoding="utf-8"))}
schema = json.loads(sch.read_text(encoding="utf-8"))
human = {c["code"]: c["human_involvement"]["level"] for c in schema["check_library"]}


def clean(i):
    n = re.sub(r"\*\*", "", rows[i]["technique"]).strip()
    return n.split(" (")[0].strip()


def url(i):
    slug = lambda t: re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")
    return f"/catalogue/{slug(rows[i]['family'])}/{slug(i)}/"


def run(*args):
    return subprocess.run(["python3", "-I", *args], cwd=work, capture_output=True, text=True, check=True).stdout


scenarios = []
for n in range(1, 6):
    jobf = work / f"master/test_jobs/job{n}.json"
    picksf = work / f"master/test_jobs/picks{n}.json"
    tmp = Path(f"/tmp/sim_log{n}.csv")
    job = json.loads(jobf.read_text())
    sel = run("scripts/select.py", str(cat), str(jobf), "--log", str(tmp))
    passed = json.loads(Path(str(tmp).replace(".csv", "_passed.json")).read_text())
    removed = {g: int(c) for g, c in re.findall(r"(\w+) (\d+)", re.search(r"Removed by gate: (.*)", sel).group(1))}
    passed_n = int(re.search(r"Passed all gates: (\d+) of (\d+)", sel).group(1))
    reach = int(re.search(r"reaching the claim level needed \(.*\): (\d+)", sel).group(1))
    seq = run("scripts/sequence.py", str(cat), str(sch), str(jobf), str(picksf), str(Path(str(tmp).replace(".csv", "_passed.json"))))
    sections = {}
    for blk in re.split(r"^## ", seq, flags=re.M)[1:]:
        head, _, body = blk.partition("\n")
        sections[head.strip()] = body.strip()

    def ids(body, with_note=False):
        items = []
        for line in body.splitlines():
            m = re.match(r"- ([A-Z0-9-]+) .*?(?:\(added: (.*)\))?$", line)
            if m:
                items.append({"id": m.group(1), "name": clean(m.group(1)), "url": url(m.group(1)), "note": m.group(2) or ""})
        return items

    stages = {
        "frame": ids(sections.get("0 frame", "")),
        "prepare": ids(sections.get("1 prepare", "")),
        "analyse": ids(sections.get("2 analyse (independent, any order)", "")),
        "check": ids(sections.get("3 check", "")),
    }
    ext = [l[2:] for l in sections.get("External material to gather in stage 1 (only what a pick needs to run)", "").splitlines() if l.startswith("- ")]
    checks = []
    for l in sections["Checks by stakes tier, applied to each analysis result"].splitlines():
        m = re.match(r"- ([A-Z0-9-]+): (.*)", l)
        if m:
            checks.append({"id": m.group(1), "name": clean(m.group(1)), "url": url(m.group(1)),
                           "list": [{"code": c.strip(), "person": human.get(c.strip(), "unknown")} for c in m.group(2).split(",")]})
    synth = sections["4 synthesise (process step, always last)"]
    form = re.search(r"Findings form: (\w+)", synth).group(1)
    methods = []
    for l in synth.splitlines():
        m = re.match(r"- (.*?)(?: \(recommended: (.*)\)| \((offered only.*)\))?$", l)
        if l.startswith("- ") and m:
            methods.append({"name": m.group(1), "recommended": m.group(2) or "", "condition": m.group(3) or ""})
    basis = [l[2:] for l in sections["Answer basis (facts only, no judgements about the material)"].splitlines() if l.startswith("- ")]
    review = sections["5 review (only if the user asks)"]
    held = re.search(r"Held back by the limit of 10 picks: ([^.]*)\.", review)
    picks_doc = json.loads(picksf.read_text())
    uses = {}
    for l in basis:
        if l.startswith("Techniques run"):
            for i, u in re.findall(r"([A-Z0-9-]+) \(([^)]*)\)", l):
                uses[i] = u
    used = {i["id"] for s in stages.values() for i in s}
    specs = {i: rows[i]["output_spec"] for i in used}
    purposes = {i: rows[i]["purpose"] for i in used | {p["id"] for p in picks_doc["picks"]}}
    scenarios.append({
        "id": f"job{n}",
        "name": job["name"],
        "claim": job["claim_level_needed"],
        "stakes": job["stakes_tier"],
        "insight": job.get("insight_wanted", []),
        "profile": job["material_profile"],
        "total": len(rows),
        "removed": removed,
        "passed": passed_n,
        "reach_claim": reach,
        "picks": [{"id": p["id"], "name": clean(p["id"]), "url": url(p["id"]), "reason": p["reason"], "purpose": rows[p["id"]]["purpose"]} for p in picks_doc["picks"]],
        "gaps": picks_doc.get("gaps", ""),
        "held": [{"id": h.strip(), "name": clean(h.strip()), "url": url(h.strip())} for h in held.group(1).split(",")] if held else [],
        "stages": stages,
        "external": ext,
        "checks": checks,
        "findings_form": form,
        "methods": methods,
        "basis": basis,
        "uses": uses,
        "specs": specs,
        "purposes": purposes,
    })
out.write_text(json.dumps(scenarios, ensure_ascii=False, indent=1), encoding="utf-8")
print("wrote", out, len(scenarios), "scenarios")
