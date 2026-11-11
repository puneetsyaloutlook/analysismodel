#!/usr/bin/env python3
"""Check the built site: internal links, anchors, dashes, banned words, US spellings."""
import re, sys
from pathlib import Path
from html.parser import HTMLParser
PUB = Path(__file__).resolve().parent.parent / "public"
BANNED = "align boasts comprehensive crucial delve ecosystem elevate empower foster journey landscape leverage navigating nuanced pivotal realm robust stakeholders tapestry testament transformative underscore unlock unprecedented".split()
US = r"\b\w*(?:ize|izes|ized|izing|ization|yze|yzed|yzing|or\b)"  # filtered below
US_WORDS = "organize organization analyze analyzed behavior color center favor honor program's modeling labeled canceled license".split()
class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.ids=set(); s.links=[]; s.text=[]; s.skip=0
    def handle_starttag(s,t,a):
        a=dict(a)
        if 'id' in a: s.ids.add(a['id'])
        if t=='a' and 'href' in a: s.links.append(a['href'])
        if t in('script','style'): s.skip+=1
    def handle_endtag(s,t):
        if t in('script','style'): s.skip-=1
    def handle_data(s,d):
        if not s.skip: s.text.append(d)
pages={}
for f in PUB.rglob('*.html'):
    p=P(); p.feed(f.read_text(encoding='utf-8')); pages[f]=p
bad=0
def rel(f): return '/'+str(f.relative_to(PUB).parent).replace('.','')+'/' if f.name=='index.html' else '/'+f.name
paths={('/'+str(f.relative_to(PUB).parent)+'/').replace('/./','/'):p for f,p in pages.items() if f.name=='index.html'}
for f,p in pages.items():
    here=str(f.relative_to(PUB))
    for l in p.links:
        if l.startswith(('http','mailto:')): continue
        base,_,frag=l.partition('#')
        if base=='' : tgt=p
        else:
            if base not in paths: print('BROKEN',here,l); bad+=1; continue
            tgt=paths[base]
        if frag and frag not in tgt.ids: print('BAD ANCHOR',here,l); bad+=1
    txt=' '.join(p.text)
    for m in re.finditer('[–—]|--',txt): print('DASH',here,txt[max(0,m.start()-30):m.end()+30]); bad+=1
    low=txt.lower()
    authored = not here.startswith(('catalogue/','reference/'))  # catalogue and schema text uses defined terms such as robustness and stakeholders
    for w in (BANNED if authored else []):
        for m in re.finditer(r'\b'+w+r'\w*',low):
            print('BANNED',here,w,'|',low[max(0,m.start()-40):m.end()+30].replace('\n',' ')); bad+=1
    for w in US_WORDS:
        if re.search(r'\b'+w+r'\b',low): print('US?',here,w)
print('pages',len(pages),'problems',bad)
