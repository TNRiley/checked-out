import json, os
from plsfiles import SRC
P = json.load(open(os.path.join(SRC,"panel.json")))
print("=== does TOTCIR == PHYSCIR + ELMATCIR, library by library? ===")
for y in range(2016, 2025):
    rs = [r for r in P if r["year"]==y and all(r.get(c) is not None for c in ("TOTCIR","PHYSCIR","ELMATCIR"))]
    bad = [r for r in rs if abs(r["TOTCIR"] - (r["PHYSCIR"]+r["ELMATCIR"])) > 0.5]
    print(f"  FY{y}  n={len(rs):5d}  mismatches={len(bad):4d}" +
          (f"   e.g. {bad[0]['LIBNAME'][:28]} {bad[0]['TOTCIR']:.0f} vs {bad[0]['PHYSCIR']+bad[0]['ELMATCIR']:.0f}" if bad else ""))
print("\n=== per-capita, using POPU_LSA of the same reporting libraries ===")
print(f"{'FY':<6}{'phys circ':>12}{'pop served':>14}{'per capita':>12}{'visits pc':>11}")
for y in sorted({r['year'] for r in P}):
    rs = [r for r in P if r["year"]==y]
    def s(c, req=None):
        return sum(r[c] for r in rs if r.get(c) is not None and (req is None or r.get(req) is not None))
    pop = s("POPU_LSA","TOTCIR")
    if y <= 2012:   phys = s("TOTCIR")
    elif y <= 2015: phys = s("TOTCIR") - s("ELMATCIR")
    else:           phys = s("PHYSCIR")
    vis = s("VISITS","VISITS"); popv = s("POPU_LSA","VISITS")
    print(f"{y:<6}{phys/1e6:>11.1f}M{(pop/1e6 if pop else 0):>13.1f}M"
          f"{(phys/pop if pop else 0):>12.2f}{(vis/popv if popv else 0):>11.2f}")
