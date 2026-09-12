import csv, collections
from plsfiles import files_for
for y in (2022, 2023, 2024):
    ae,_,_ = files_for(y)
    rows = [{(k or "").strip().upper(): (v or "").strip() for k,v in r.items()}
            for r in csv.DictReader(open(ae, newline="", encoding="latin-1"))]
    miss = collections.Counter(r["STABR"] for r in rows if r.get("TOTCIR","").startswith("-1"))
    tot  = collections.Counter(r["STABR"] for r in rows)
    print(f"\n=== FY{y}: {sum(miss.values())} of {len(rows)} AE records missing TOTCIR ===")
    bad = [(s,n,tot[s]) for s,n in miss.most_common() if n>3]
    for s,n,t in bad[:15]:
        print(f"   {s}  {n:4d}/{t:4d}  {100*n/t:5.1f}% missing")
