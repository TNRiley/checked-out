import json, collections, os
from plsfiles import files_for, YEARS, SRC
import csv
cols = {}
for y in YEARS:
    ae, outlet, state = files_for(y)
    assert ae and outlet, (y, ae, outlet)
    with open(ae, newline="", encoding="latin-1") as f:
        h = [c.strip().upper() for c in next(csv.reader(f))]
    cols[y] = h
    print(f"{y} {len(h):4d} cols  {os.path.basename(ae)}")

freq = collections.Counter()
for h in cols.values(): freq.update(set(h))
n = len(cols)
print("\n=== present in all %d years (%d) ===" % (n, sum(1 for v in freq.values() if v==n)))
print(sorted(c for c,v in freq.items() if v==n))
for thresh in (32,31,30,25,20):
    grp = sorted(c for c,v in freq.items() if v==thresh)
    if grp: print(f"\n--- in exactly {thresh} years ({len(grp)}) ---\n{grp}")
json.dump({str(k):v for k,v in cols.items()}, open(os.path.join(SRC,"ae_columns.json"),"w"), indent=0)
