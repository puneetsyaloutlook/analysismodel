# Spot check of master_tagged.csv

Sampled 30 rows across all 12 families: FQ-01, FQ-03, DM-03, DM-12, CM1-04, CM1-12, TC1-08, TC1-19, TC-03, HE1-03, HE1-11, HE-05, PJ-05, PJ-14, PJ-22, AO-02, AO-09, CH-03, CH-11, PE-02, PE-08, MM-03, MM-09, MM-14, IS-01, IS-06, CK-05, CK-12, CK-20, CK-27. Whole-file counts come from scripted checks.

## Row problems

1. TC1-08, claim_ceiling: "associate". The row's own certainty_limits names that as the ceiling. Suggest "estimate an intervention effect".
2. TC-03, access_depth: "requires=aggregate tables". statcheck reads APA-style prose and its fit test rejects tables. Suggest "requires=narrative only".
3. HE-05, model_suitability: "model plus code". Its fit test says judging interval assumptions needs a person. Suggest "human judgement required".
4. CK-12, model_suitability: "model plus code". It needs human-coded annotations. Suggest "human judgement required".
5. CM1-12, source_count: "requires=two or more". The comparator is already external_material_needed, as in siblings CM1-01 and CM1-15, which use "any". Suggest "any".
6. HE1-11, consumes: "evidence base:collected". Its related_techniques reason says bias "must be appraised before pooling". Suggest "evidence base:appraised".
7. PE-02, consumes and produces: it re-runs "the main result" under several cleaning regimes, yet consumes only the raw corpus and produces no result artefact. Suggest consuming result:draft and producing result:checked.
8. CH-03 and CH-11, consumes and produces: both challenge a held judgement but consume "raw dataset or corpus:raw", unlike eight other Challenge rows that consume result, assumptions register or validation report. They also differ from each other (validation report:complete against result:draft) for the same phase. Suggest assumptions register:draft in, validation report:complete out, for both.
9. IS-06, linkage: "requires=shared identifier available". Copy detection compares claims and needs no join key (low confidence). Suggest "any".

## Patterns

- **Frame family, FQ-01 to FQ-05:** each consumes charter or question:agreed and produces :draft, so the state falls. FQ-06 does the reverse. The schema rule for question-only techniques forces "agreed", so the rule needs fixing too.
- **Frame family, minimum_checks:** all six rows share one identical string, including "second technique with different assumptions" at high-stakes. That check suits few framing techniques.
- **Input validation:** the check library lists it for deterministic techniques only. It appears at every tier in 22 non-deterministic rows (for example CM1-12, PJ-05, MM-03, CK-05). HE-06 is deterministic but uses repeat runs and no input validation.
- **access_depth encoding:** the field is ordered, so "requires=narrative only" means the same as "any". The file uses "any" in Handle evidence, Integrate and Project forward, and "narrative only" everywhere else (116 rows against 42). Pick one.
- **not_for_rules:** only 14 of 234 rows use it. HE1-06 and IS-05 use source_dependence, a weight facet, as a hard exclusion.
- **Case style:** family values are capitalised ("Frame the question"), but the schema says value ids are lower case.

## Summary

Of 30 rows checked, 10 had a real problem across 9 findings. Four are clear tag errors (TC1-08, TC-03, HE-05, CK-12). The larger risks are file-wide: the repeated check strings, the input validation misuse and the two encodings of access_depth. No file was edited.
