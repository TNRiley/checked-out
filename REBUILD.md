# Rebuilding Checked Out

A recipe, not a summary. Assumes a shell, Python 3 and Node, and no other context.

## 1. What is being built

A single self-contained HTML page over the IMLS Public Libraries Survey, FY1992–FY2024.

The effect it exists to show: **`TOTCIR` is not one series.** It appears in all 33
annual releases, which invites treating it as a continuous 33-year measure of
circulation. But when public libraries began lending e-books and streaming media,
those loans were folded into the same column. Read naively, national circulation
dips and recovers. Split physical from electronic and the physical line falls
*through its own starting point*: FY2023 is 1.418 billion physical items against
1.564 billion in FY1992, a 9.4% decline, while the population served grew about a
quarter. Electronic lending — zero before FY2013 — is 27.8% of circulation by FY2023
and is the only thing holding the headline up.

The secondary effect: use and investment moved in opposite directions. Real operating
expenditure is up 31.5% since FY1998; physical circulation is down 16.7% and visits
down 26.2% over the same span, with visits at half their FY2009 peak and no post-2021
recovery. Branches and degreed librarians both *increased*.

## 2. Data sources

### IMLS Public Libraries Survey

Landing page: <https://www.imls.gov/research-evaluation/surveys/public-libraries-survey-pls>

33 CSV zips, FY1992–FY2024, ~2–4 MB each, ~100 MB total. **The URLs are not derivable
from the year.** IMLS moved files between `/sites/default/files/` and dated
subdirectories partway through, and the filename convention changed three times. The
verified table lives in `src/01_download.sh` — copy it rather than guessing. Every
entry in it returned 200 when this was built.

Each zip holds an administrative-entity (AE) file, an outlet file, and for FY1992–FY2020
a state summary. Classify by keyword, not pattern — the names run
`PUPLDF92.csv` → `pupld04a.csv` → `PLS_FY2016_AE_pupld16a_updated.csv` → `PLS_FY24_AE_pud24i.csv`.
Test for `sum`/`state` first, then `out`, then fall through to AE; testing `out` first
is fine but testing for the AE name pattern is not. Files are latin-1, not UTF-8 —
a handful carry stray high bytes in library names.

Use the **imputed** releases (`…i.csv` in later years). They are what IMLS publishes as
the public-use file.

### CPI-U, for constant dollars

BLS public API v1, no key needed, 10-year windows:

```
POST https://api.bls.gov/publicAPI/v1/timeseries/data/
{"seriesid":["CUUR0000SA0"],"startyear":"1992","endyear":"2001","annualaverage":true}
```

Take `periodName == "Annual"`. Four calls cover 1992–2024. FY1992 = 140.3, FY2023 = 304.702.

## 3. Processing decisions, and why

### Negative values are codes, never quantities

Per each release's Appendix A: `-1` missing, `-3` temporarily closed, `-4` not
applicable, `-9` suppressed for confidentiality (applied to salary and benefit fields
when total FTE ≤ 2.00). Read every one as null. **Summing the raw column subtracts
them**, and the error is small enough per-year to look plausible, which is what makes
it dangerous.

### The physical-circulation splice

No single column spans the era, so the series is spliced under one rule:

| years | source |
|---|---|
| FY1992–FY2012 | `TOTCIR` — e-material circulation was not collected, so this is physical by construction |
| FY2013–FY2024 | `TOTCIR − ELMATCIR` at the national aggregate |

`PHYSCIR` exists from FY2016 and is used as a **check, not a source**. From FY2018
`TOTCIR − ELMATCIR == PHYSCIR` for every individual library — 0 mismatches in every
year FY2018–FY2024 (`src/06_verify.py` asserts this). In FY2016 and FY2017, its first
two years, 904 and 40 libraries respectively disagree while they learned the new line,
which is exactly why the subtraction is preferred to the column.

Known bias, stated on the page: a library that folded early e-book loans into `TOTCIR`
before FY2013 makes the pre-2013 physical line slightly too high. That would make the
measured decline *larger*, not smaller — the finding is robust to it.

### Per-capita denominator

Use `POPU_UND` (unduplicated population of legal service areas), not `POPU_LSA`.
`POPU_LSA` double-counts overlapping service areas and runs ~3% higher. This is not a
preference — it is what reproduces IMLS's own published per-capita figures (see the
verification table).

### FY2024 is excluded from every national total

**This is the trap that will bite hardest.** FY2024 downloads cleanly, parses cleanly,
and is catastrophically incomplete: 2,791 of 9,249 administrative entities report no
circulation, and the gaps are whole states, not scattered libraries — Iowa,
Massachusetts, Oregon, Florida and every territory reported none at all. FY2023 has 72
missing by comparison. Summing FY2024 produces a ~40% one-year collapse in circulation
that did not happen.

Keep FY2024 rows in the panel and in the per-library search, where a missing year shows
as a gap. Keep it out of every national and state aggregate. The page devotes a section
to showing the gap rather than hiding the exclusion.

## 4. The page

One HTML file, no build step, no runtime network access. House style: Fraunces /
Archivo / IBM Plex Mono, paper palette, violet accent for physical and ochre for
electronic, theme toggle honouring `prefers-color-scheme`, all charts hand-drawn on
canvas with DPR scaling.

Sections, in order:

1. **What a library circulates** — stacked area, physical under electronic, FY1992–FY2023,
   with a dashed FY1992 reference line the stack falls below, and an items/per-person toggle.
2. **More money, fewer people** — everything indexed to FY1998 = 100: real operating
   spending, degreed librarians, branch count, physical circulation, visits.
3. **What grew instead** — six sparkline panels: programs, attendance, electronic
   circulation, internet terminals, interlibrary loans sent, print volumes held.
4. **By state** — slope chart FY1998 → FY2023 per capita, plus a sortable table. Territories
   (AS, GU, MP, PR, VI) are excluded from state comparisons.
5. **Find yours** — search across all 10,281 administrative entities, with each one's
   physical circulation and visits drawn as a two-line sparkline.
6. **Why this stops at FY2023** — the FY2024 gap, by state.

Payload: national and state series as plain JSON; per-library series as two base64
`Int32Array`s (`circ`, `vis`), 10,281 × 33, `-1` for missing. ~4.2 MB, page ~4.3 MB.

## 5. Verification table

Rebuild is correct if these come out:

| quantity | expected |
|---|---|
| library-years in panel | 302,710 |
| unique administrative entities | 10,281 |
| FY2019 total circulation | 2.186 bn — IMLS published "2.2 billion" |
| FY2019 circulation per capita (`POPU_UND`) | 6.88 — IMLS published 6.9 |
| FY1992 physical circulation | 1,564.4 M |
| FY2010 physical circulation (the peak) | 2,466.0 M |
| FY2023 physical circulation | 1,417.9 M |
| FY2023 vs FY1992 | −9.4% |
| FY2023 vs FY2010 peak | −42.5% |
| electronic share of circulation, FY2023 | 27.8% |
| first year electronic share passes 10% | FY2016 |
| visits peak | FY2009, 1,591.8 M |
| FY2023 visits as share of peak | 50.5% |
| FY2021 visits (the COVID floor) | 417.5 M |
| real operating expenditure change, FY1998→FY2023 | +31.5% (2023 dollars) |
| MLS librarians, FY1992 → FY2023 | 24,526 → 33,968 |
| bookmobiles, FY1992 → FY2023 | 1,066 → 729 |
| FY2024 entities missing `TOTCIR` | 2,791 of 9,249 |
| FY2023 entities missing `TOTCIR` | 72 of 9,252 |
| `TOTCIR − ELMATCIR == PHYSCIR` mismatches, FY2018–FY2024 | 0 every year |

Recognisable checkpoints: FY2021 visits should crater to roughly a quarter of 2019 —
if they do not, closed-building years are being imputed away. Chicago Public Library
and New York Public Library should both appear in the search and both show the 2020–21
notch.

## 6. Running it

```bash
bash src/01_download.sh          # 33 zips into src/raw
python src/02_parse.py           # -> src/panel.json   (302,710 rows, ~200 MB)
python src/03_series.py          # -> src/payload.json (~4.2 MB)
python src/04_stats.py           # headline figures, for checking prose
python src/06_verify.py          # library-level identity + FY2024 gap assertions
python src/05_inject.py          # -> index.html, then wrap + catalog link
node src/test_page.js            # runs the page against a stub DOM, asserts the figures
```

`02_parse.py` needs the zips extracted to `src/extracted/<year>/`; `01_download.sh`
leaves zips only, so extract with the year taken from characters 6–9 of the filename
(`pls_fy1993.zip` → `1993`; off-by-one here yields directories named `993.`).

## 7. What the page must say about itself

- Circulation counts loans, not readers, and never measured everything a library is —
  which is the point of the "what grew instead" section, not a hedge against it.
- FY2020 and FY2021 describe closed buildings, not lost interest.
- Reporting is self-reported and definitions shift under long series.
- Library identifiers are reused and reassigned across 33 years, so an individual
  library's line can break where an administrative entity merged or split.
- Every negative-code convention, the splice rule, the `POPU_UND` choice and the FY2024
  exclusion belong in the methods panel, with the FY2024 exclusion also shown as a
  section rather than buried.
