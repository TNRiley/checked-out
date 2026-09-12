#!/usr/bin/env python3
"""Checks that need the full panel rather than the page payload.

The page's methods panel makes one load-bearing claim: that from FY2018 the
survey's own PHYSCIR equals TOTCIR - ELMATCIR for each individual library, which
is what licenses splicing a physical-circulation series across a definition
change. That is a library-level statement and cannot be tested from national
sums, so it is tested here.

    python 06_verify.py
"""
import json, os, collections
from plsfiles import SRC

P = json.load(open(os.path.join(SRC, "panel.json")))
by = collections.defaultdict(list)
for r in P:
    by[r["year"]].append(r)

fail = 0

print("library-level identity  TOTCIR - ELMATCIR == PHYSCIR")
for y in range(2016, 2025):
    rows = [r for r in by[y]
            if all(r.get(c) is not None for c in ("TOTCIR", "PHYSCIR", "ELMATCIR"))]
    bad = [r for r in rows if abs(r["TOTCIR"] - (r["PHYSCIR"] + r["ELMATCIR"])) > 0.5]
    note = ""
    if y <= 2017:
        note = "   (PHYSCIR's first years; libraries still learning the line)"
    elif bad:
        fail += 1
        note = "   <-- UNEXPECTED"
    print(f"  FY{y}  n={len(rows):5d}  mismatching libraries={len(bad):4d}{note}")

print("\nnegative codes are never summed as quantities")
for y in (2009, 2016, 2024):
    rows = by[y]
    neg = sum(1 for r in rows if r.get("TOTCIR") is not None and r["TOTCIR"] < 0)
    print(f"  FY{y}  negative TOTCIR values surviving into the panel: {neg}")
    if neg:
        fail += 1

print("\nFY2024 is not nationally usable")
miss = sum(1 for r in by[2024] if r.get("TOTCIR") is None)
whole = [s for s, n in collections.Counter(
            r["STABR"] for r in by[2024] if r.get("TOTCIR") is None).items()
         if n == sum(1 for r in by[2024] if r["STABR"] == s)]
print(f"  {miss} of {len(by[2024])} entities missing TOTCIR")
print(f"  states reporting none at all: {', '.join(sorted(whole))}")
if miss < 2000:
    fail += 1
    print("  <-- UNEXPECTED: the FY2024 gap this page documents has closed; revisit the exclusion")

print("\nFY2023 by contrast")
m23 = sum(1 for r in by[2023] if r.get("TOTCIR") is None)
print(f"  {m23} of {len(by[2023])} entities missing TOTCIR")

print("\nFAILURES:", fail)
raise SystemExit(1 if fail else 0)
