#!/usr/bin/env python3
"""Build data/run.json, the actual run shown in the simulator, from the files in data/run2/.

Run from the model working directory (it needs scripts/select.py, scripts/sequence.py, schema/schema.json,
master/master_tagged.csv):
  python3 /path/to/analysismodel/build/export_run.py . /path/to/analysismodel/data
Select and sequence are rerun so the counts match the current catalogue.
"""
import csv, json, re, subprocess, sys
from pathlib import Path

work = Path(sys.argv[1]).resolve()
data = Path(sys.argv[2]).resolve()
run = data / "run2"
cat = work / "master/master_tagged.csv"
sch = work / "schema/schema.json"
rows = {r["id"]: r for r in csv.DictReader(cat.open(encoding="utf-8"))}
schema = json.loads(sch.read_text(encoding="utf-8"))
human = {c["code"]: c["human_involvement"]["level"] for c in schema["check_library"]}
slug = lambda t: re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")
clean = lambda i: re.sub(r"\*\*", "", rows[i]["technique"]).strip().split(" (")[0].strip()
url = lambda i: f"/catalogue/{slug(rows[i]['family'])}/{slug(i)}/"


def sh(*a):
    return subprocess.run(["python3", "-I", *a], cwd=work, capture_output=True, text=True, check=True).stdout


job = json.loads((run / "job.json").read_text())
picks = json.loads((run / "picks.json").read_text())
profile = json.loads((run / "profile.json").read_text())
tmp = Path("/tmp/run2_sel.csv")
sel = sh("scripts/select.py", str(cat), str(run / "job.json"), "--log", str(tmp))
passed_file = str(tmp).replace(".csv", "_passed.json")
removed = {g: int(c) for g, c in re.findall(r"(\w+) (\d+)", re.search(r"Removed by gate: (.*)", sel).group(1))}
passed_n = int(re.search(r"Passed all gates: (\d+) of (\d+)", sel).group(1))
reach = int(re.search(r"reaching the claim level needed \(.*\): (\d+)", sel).group(1))
plan = json.loads((run / "plan.json").read_text())
def items(g):
    out = []
    for t in g["techniques"]:
        out.append({"id": t["id"], "name": clean(t["id"]), "url": url(t["id"]), "note": t.get("added") or ""})
    return out
grp = {g["group_name"]: items(g) for g in plan["groups"]}
names = [g["group_name"] for g in plan["groups"]]
stages = {"frame": grp.get("Clarify the question", []), "prepare": grp.get("Prepare the content", []),
          "analyse": grp.get("Analyse the content", []), "check": grp.get("Test the findings", [])}
checks = [{"id": k, "name": clean(k), "url": url(k),
           "list": [{"code": c, "person": human.get(c, "unknown")} for c in v]} for k, v in plan["checks"].items()]
held = plan["held"]
results = {p.stem: p.read_text(encoding="utf-8") for p in sorted((run / "results").glob("*.md"))}
ck = json.loads((run / "ck17_result.json").read_text())
spans = [(k, s, ok) for k, v in ck.items() for s, ok in v]
src = profile["sources"][0]
used = {i["id"] for s in stages.values() for i in s}
out = {
    "id": "run2", "real": True,
    "name": "Actual run: eight voice AI interviews",
    "request": job["question"], "claim": job["claim_level_needed"], "stakes": job["stakes_tier"], "insight": job["insight_wanted"],
    "profile": job["material_profile"], "basis_map": job["basis"],
    "source": {"file": src["file"], "words": src["stats"]["words"], "characters": src["stats"]["characters"], "lines": src["stats"]["lines"]},
    "total": len(rows), "removed": removed, "passed": passed_n, "reach_claim": reach,
    "picks": [{"id": p["id"], "name": clean(p["id"]), "url": url(p["id"]), "reason": p["reason"]} for p in picks["picks"]],
    "gaps": picks.get("gaps", ""),
    "held": [{"id": h, "name": clean(h), "url": url(h)} for h in held],
    "outside": plan["outside_material"],
    "stages": stages, "checks": checks,
    "results": results,
    "ck17": {"checked": len(spans), "failed": [{"file": k, "span": s} for k, s, ok in spans if not ok]},
    "synthesis": json.loads((run / "synthesis.json").read_text()),
    "answer": json.loads((run / "answer.json").read_text()),
    "spot": json.loads((run / "spot_check_result.json").read_text()),
    "repeat": json.loads((run / "repeat_compare_result.json").read_text()),
    "left_out": plan.get("left_out", {}),
    "specs": {i: rows[i]["output_spec"] for i in used},
}
(data / "run.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
print("wrote", data / "run.json", len(results), "results")
