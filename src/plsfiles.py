"""Locate the three PLS files per year. Naming changed three times in 33 years
(PUPLDF92 -> pupld04a -> PLS_FY2016_AE_... -> PLS_FY24_AE_pud24i), so classify by
keyword rather than pattern. Order matters: 'state'/'sum' and 'out' are tested
before falling through to the administrative-entity file."""
import os, glob, csv
SRC = os.path.dirname(os.path.abspath(__file__))
EX  = os.path.join(SRC, "extracted")

def files_for(year):
    ae = outlet = state = None
    for p in glob.glob(os.path.join(EX, str(year), "*.csv")):
        b = os.path.basename(p).lower()
        if "sum" in b or "state" in b: state = p
        elif "out" in b:               outlet = p
        else:                          ae = p
    return ae, outlet, state

def read_rows(path):
    """PLS files are ASCII/latin-1; a handful carry stray high bytes in library names."""
    with open(path, newline="", encoding="latin-1") as f:
        for row in csv.DictReader(f):
            yield { (k or "").strip().upper(): v for k, v in row.items() }

YEARS = list(range(1992, 2025))
