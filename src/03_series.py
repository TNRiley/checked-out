#!/usr/bin/env python3
"""National, state and library-level series -> payload.json for the page.

Physical circulation is the spine of this page and is spliced, not read from one
column, because no single column spans the era:

  FY1992-FY2012  TOTCIR              e-material circulation was not collected
  FY2013-FY2024  TOTCIR - ELMATCIR   at the national aggregate level

PHYSCIR exists from FY2016 and is a check, not the source: from FY2018 it equals
TOTCIR - ELMATCIR to the item, and in FY2016/FY2017 (its first two years) it
differs by 1.6% and 0.1% while libraries learned the new line. Using the
subtraction throughout gives one rule for the whole series.

National aggregates stop at FY2023. See the fy2024 block for why.
"""
import json, os, base64, struct, collections, datetime
from plsfiles import SRC

P = json.load(open(os.path.join(SRC, "panel.json")))
CPI = {int(k): v for k, v in json.load(open(os.path.join(SRC, "cpi.json"))).items()}
YEARS = list(range(1992, 2025))
LAST_FULL = 2023                      # FY2024 is not nationally complete

by_year = collections.defaultdict(list)
for r in P: by_year[r["year"]].append(r)

def S(rows, col):
    vs = [r[col] for r in rows if r.get(col) is not None]
    return sum(vs) if vs else None
def N(rows, col):
    return sum(1 for r in rows if r.get(col) is not None)

MEASURES = ["TOTCIR","KIDCIRCL","ELMATCIR","PHYSCIR","VISITS","REGBOR","POPU_LSA","POPU_UND",
            "TOTPRO","TOTATTEN","GPTERMS","PITUSR","TOTOPEXP","STAFFEXP","PRMATEXP","ELMATEXP",
            "TOTSTAFF","LIBRARIA","MASTER","HRS_OPEN","BKVOL","CENTLIB","BRANLIB","BKMOB",
            "LOANFM","LOANTO","TOTINCM","LOCGVT","STGVT","FEDGVT"]

national = {m.lower(): [] for m in MEASURES}
national["physical"] = []
national["n_report"] = []
for y in YEARS:
    rows = by_year[y]
    for m in MEASURES:
        national[m.lower()].append(S(rows, m))
    tc, el = S(rows, "TOTCIR"), S(rows, "ELMATCIR")
    national["physical"].append(tc - el if (tc is not None and y >= 2013 and el) else tc)
    national["n_report"].append(N(rows, "TOTCIR"))

# ---- FY2024 incompleteness, quantified so the page can show it -------------
miss = collections.Counter(); tot = collections.Counter()
for r in by_year[2024]:
    tot[r["STABR"]] += 1
    if r.get("TOTCIR") is None: miss[r["STABR"]] += 1
prev_missing = sum(1 for r in by_year[LAST_FULL] if r.get("TOTCIR") is None)
fy2024 = {"missing": sum(miss.values()), "records": len(by_year[2024]),
          "prevMissing": prev_missing, "prevRecords": len(by_year[LAST_FULL]),
          "states": sorted(([s, miss[s], tot[s]] for s in miss if miss[s] >= 10),
                           key=lambda t: -t[1])}

# ---- states ---------------------------------------------------------------
STATES = sorted({r["STABR"] for r in P if r["STABR"]})
states = []
for st in STATES:
    row = {"st": st, "phys": [], "visits": [], "pop": [], "elmat": [], "opexp": []}
    for y in YEARS:
        rows = [r for r in by_year[y] if r["STABR"] == st]
        tc, el = S(rows, "TOTCIR"), S(rows, "ELMATCIR")
        row["phys"].append(tc - el if (tc is not None and y >= 2013 and el) else tc)
        row["visits"].append(S(rows, "VISITS"))
        row["pop"].append(S(rows, "POPU_LSA"))
        row["elmat"].append(el)
        row["opexp"].append(S(rows, "TOTOPEXP"))
    states.append(row)

# ---- libraries ------------------------------------------------------------
libs = {}
for r in P:
    k = r["FSCSKEY"]
    if not k: continue
    d = libs.setdefault(k, {"name": "", "st": r["STABR"], "city": "", "pop": 0, "last": 0})
    if r["year"] >= d["last"]:
        d["last"] = r["year"]
        d["name"] = (r["LIBNAME"] or d["name"]).title()
        d["city"] = (r["CITY"] or d["city"]).title()
        if r.get("POPU_LSA"): d["pop"] = int(r["POPU_LSA"])

keys = sorted(libs)
idx = {k: i for i, k in enumerate(keys)}
NY = len(YEARS)
circ = [-1] * (len(keys) * NY)     # physical circulation
vis  = [-1] * (len(keys) * NY)
for r in P:
    k = r["FSCSKEY"]
    if k not in idx: continue
    o = idx[k] * NY + (r["year"] - 1992)
    tc, el = r.get("TOTCIR"), r.get("ELMATCIR")
    if tc is not None:
        p = tc - el if (r["year"] >= 2013 and el is not None) else tc
        circ[o] = max(0, int(round(p)))
    if r.get("VISITS") is not None: vis[o] = int(round(r["VISITS"]))

def b64(arr):
    return base64.b64encode(struct.pack("<%di" % len(arr), *arr)).decode()

payload = {
    "generated": datetime.date.today().isoformat(),
    "years": YEARS, "lastFull": LAST_FULL,
    "national": national, "states": states, "fy2024": fy2024,
    "cpi": {str(y): CPI[y] for y in YEARS if y in CPI},
    "libs": {
        "n": len(keys), "ny": NY,
        "name": [libs[k]["name"] for k in keys],
        "st":   [libs[k]["st"] for k in keys],
        "city": [libs[k]["city"] for k in keys],
        "pop":  [libs[k]["pop"] for k in keys],
        "circ": b64(circ), "vis": b64(vis),
    },
}
out = os.path.join(SRC, "payload.json")
json.dump(payload, open(out, "w"), separators=(",", ":"))
print(f"libraries: {len(keys)}   payload: {os.path.getsize(out)/1e6:.2f} MB")
print("\nFY   physical      elec     visits    opexp$   n")
for i, y in enumerate(YEARS):
    n = national
    def g(k): 
        v = n[k][i]; return f"{v/1e6:9.1f}" if v else "        -"
    print(f"{y} {g('physical')} {g('elmatcir')} {g('visits')} {g('totopexp')}  {n['n_report'][i]}")
