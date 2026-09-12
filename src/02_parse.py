#!/usr/bin/env python3
"""Build one tidy library-year panel from 33 annual PLS releases.

Two things here are not optional:

1. Negative values are codes, not quantities. -1 missing, -3 temporarily closed,
   -4 not applicable, -9 suppressed for confidentiality (per each release's
   Appendix A). Summing them raw silently subtracts from every national total.

2. FY2024 cannot carry a national total. Iowa, Massachusetts, Oregon, Florida and
   Puerto Rico reported no circulation at all and 2,786 of 9,249 records are
   missing TOTCIR — whole states, not scattered libraries. The panel keeps FY2024
   rows so the gap can be shown, but 03_series.py builds national series to FY2023.
"""
import csv, json, os, sys
from plsfiles import files_for, YEARS, SRC

NUM = ["POPU_LSA","POPU_UND","TOTCIR","KIDCIRCL","PHYSCIR","ELMATCIR","VISITS","REGBOR",
       "TOTPRO","TOTATTEN","GPTERMS","PITUSR","WEBVISIT","TOTOPEXP","STAFFEXP",
       "PRMATEXP","ELMATEXP","TOTSTAFF","LIBRARIA","MASTER","HRS_OPEN","BKVOL",
       "CENTLIB","BRANLIB","BKMOB","LOANFM","LOANTO","TOTINCM","LOCGVT","STGVT",
       "FEDGVT","EBOOK","AUDIO","VIDEO","AUDIO_PH","AUDIO_DL","VIDEO_PH","VIDEO_DL",
       "TOTCOLL","CAPITAL","SALARIES","BENEFIT"]
TXT = ["FSCSKEY","LIBNAME","STABR","CITY","CNTY","RSTATUS","STATSTRU"]

def num(v):
    """Return a float, or None for a missing/closed/NA/suppressed code."""
    v = (v or "").strip().replace(",", "")
    if not v or v.upper() in ("M", "NA", "."):
        return None
    try:
        f = float(v)
    except ValueError:
        return None
    return None if f < 0 else f      # every negative is a code, never a quantity

def main():
    panel, counts = [], {}
    for y in YEARS:
        ae, _, _ = files_for(y)
        rows = list(csv.DictReader(open(ae, newline="", encoding="latin-1")))
        n = 0
        for r in rows:
            r = {(k or "").strip().upper(): v for k, v in r.items()}
            rec = {"year": y}
            for c in TXT:
                rec[c] = (r.get(c) or "").strip()
            for c in NUM:
                if c in r:
                    rec[c] = num(r[c])
            panel.append(rec); n += 1
        counts[y] = n
        print(f"FY{y}  {n:5d} records", flush=True)

    out = os.path.join(SRC, "panel.json")
    json.dump(panel, open(out, "w"), separators=(",", ":"))
    print(f"\nwrote {out}  {len(panel)} library-years  {os.path.getsize(out)/1e6:.1f} MB")

if __name__ == "__main__":
    main()
