#!/usr/bin/env python3
"""CK-17 source-span check: every double-quoted span in a result must appear in the source (string match after
lower-casing and removing punctuation). A span containing an ellipsis is split and each part is checked."""
import re, sys, json, glob
def norm(s): return re.sub(r'\s+',' ',re.sub(r"[^a-z0-9' ]+",' ',s.lower().replace('’',"'"))).strip()
src=norm(open('source_material.md',encoding='utf-8').read())
# only the quotes section counts as source for spans (hypothesis text is also source)
out={}
for f in sorted(glob.glob('results/*.md')):
    t=open(f,encoding='utf-8').read()
    spans=re.findall(r'"([^"\n]{3,}?)"',t)
    res=[]
    for s in spans:
        parts=[p for p in re.split(r'\.\.\.|…',s) if norm(p)]
        ok=all(norm(p) in src for p in parts)
        res.append((s,ok))
    out[f.split('/')[-1][:-3]]=res
json.dump(out,open('ck17_result.json','w'),indent=1)
tot=sum(len(v) for v in out.values()); bad=[(k,s) for k,v in out.items() for s,o in v if not o]
print('spans checked',tot,'failed',len(bad))
for k,s in bad: print(k,'|',s)
