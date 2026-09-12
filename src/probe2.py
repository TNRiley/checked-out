import csv, collections
from plsfiles import files_for
for y in (1992, 1998, 2009, 2016, 2020, 2024):
    ae,_,_ = files_for(y)
    rows = list(csv.DictReader(open(ae, newline="", encoding="latin-1")))
    rows = [{(k or "").strip().upper(): (v or "").strip() for k,v in r.items()} for r in rows]
    print(f"\n=== {y}  rows={len(rows)} ===")
    for col in ("TOTCIR","VISITS","POPU_LSA","PHYSCIR","ELMATCIR","RSTATUS","STABR"):
        if col not in rows[0]: continue
        vals = [r[col] for r in rows]
        neg = collections.Counter(v for v in vals if v.startswith("-"))
        blank = sum(1 for v in vals if v == "")
        try: nums = [float(v) for v in vals if v and not v.startswith("-")]
        except ValueError: nums = []
        print(f"  {col:9s} blank={blank:5d} neg={dict(neg)} max={max(nums) if nums else '-':>12}")
    print("  RSTATUS dist:", collections.Counter(r.get("RSTATUS","") for r in rows))
