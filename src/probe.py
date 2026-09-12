import json
cols = json.load(open("ae_columns.json"))
want = ["POPU_LSA","POPU_UND","VISITS","REGBOR","TOTCIR","KIDCIRCL","PHYSCIR","ELMATCIR",
        "EBOOK","AUDIO","VIDEO","AUDIO_PH","AUDIO_DL","VIDEO_PH","VIDEO_DL","EBOOKS",
        "TOTPRO","TOTATTEN","KIDPRO","KIDATTEN","YAPRO","YAATTEN",
        "GPTERMS","PITUSR","WEBVISIT","TOTOPEXP","TOTEXPCO","STAFFEXP","PRMATEXP","ELMATEXP",
        "TOTSTAFF","LIBRARIA","MASTER","HRS_OPEN","TOTCOLL","BKVOL","LOANFM","LOANTO","CENTLIB","BRANLIB","BKMOB"]
years = sorted(cols, key=int)
def runs(present):
    out, start = [], None
    for y in years:
        if y in present and start is None: start = y
        elif y not in present and start is not None:
            out.append((start, prev)); start = None
        prev = y
    if start is not None: out.append((start, years[-1]))
    return out
for w in want:
    yrs = [y for y in years if w in cols[y]]
    if not yrs: print(f"{w:10s} ABSENT"); continue
    r = runs(set(yrs))
    print(f"{w:10s} {len(yrs):2d}y  " + ", ".join(f"{a}-{b}" for a,b in r))
