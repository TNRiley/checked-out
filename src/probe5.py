import json, os, csv
from plsfiles import SRC, files_for
P = json.load(open(os.path.join(SRC,"panel.json")))
by = {}
for r in P: by.setdefault(r["year"], []).append(r)

# POPU_UND straight from the FY2019 file — it is not in the panel
ae,_,_ = files_for(2019)
rows = [{(k or "").strip().upper(): (v or "").strip() for k,v in r.items()}
        for r in csv.DictReader(open(ae, newline="", encoding="latin-1"))]
def f(v):
    try: x=float(v.replace(",",""))
    except: return None
    return None if x<0 else x
und = sum(x for x in (f(r.get("POPU_UND","")) for r in rows) if x is not None)
lsa = sum(x for x in (f(r.get("POPU_LSA","")) for r in rows) if x is not None)
tc  = sum(r["TOTCIR"] for r in by[2019] if r.get("TOTCIR") is not None)
print("=== FY2019 vs IMLS published (2.2bn circulation, 6.9 per person) ===")
print(f"  TOTCIR      {tc/1e9:.3f}bn")
print(f"  POPU_LSA    {lsa/1e6:8.1f}M -> {tc/lsa:.2f} per capita")
print(f"  POPU_UND    {und/1e6:8.1f}M -> {tc/und:.2f} per capita   <- IMLS headline base")

print("\n=== physical circulation: two routes ===")
print(f"{'FY':<6}{'TOTCIR-ELMAT':>14}{'sum PHYSCIR':>14}{'diff':>9}")
for y in range(2013, 2025):
    rs = by[y]
    both = [r for r in rs if r.get("TOTCIR") is not None and r.get("ELMATCIR") is not None]
    a = sum(r["TOTCIR"] - r["ELMATCIR"] for r in both)
    ph = [r["PHYSCIR"] for r in rs if r.get("PHYSCIR") is not None]
    b = sum(ph) if ph else 0
    print(f"{y:<6}{a/1e6:>13.1f}M{(b/1e6 if b else 0):>13.1f}M{((a-b)/1e6 if b else 0):>8.1f}M")
