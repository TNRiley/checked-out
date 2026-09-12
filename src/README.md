# Pipeline

Run in order. Everything is idempotent; intermediates land in `src/` and are gitignored.

| step | does | writes |
|---|---|---|
| `01_download.sh` | fetches 33 PLS CSV zips | `src/raw/pls_fy*.zip` |
| *(extract)* | unzip each into `src/extracted/<year>/` | |
| `02_parse.py` | one tidy row per library-year, negative codes read as missing | `src/panel.json` (~200 MB) |
| `03_series.py` | national / state / per-library series, spliced physical circulation | `src/payload.json` (~4.2 MB) |
| `04_stats.py` | prints the headline figures the prose quotes | — |
| `06_verify.py` | asserts the library-level splice identity and the FY2024 gap | — |
| `05_inject.py` | splices payload + `app.js` into `template.html`, wraps, links | `index.html` |
| `test_page.js` | runs the built page against a stub DOM, asserts every headline figure | — |

Extraction is not scripted because it is one line, but take the year from characters
6–9 of the filename: `pls_fy1993.zip` → `1993`. Slicing from 7 gives directories named
`993.` and the rest of the pipeline then finds no files at all.

```bash
cd src/raw && for z in pls_fy*.zip; do
  y=${z:6:4}; mkdir -p ../extracted/$y; unzip -o -q -j "$z" -d "../extracted/$y"
done
```

## CPI

`03_series.py` expects `src/cpi.json` — a `{year: index}` map of BLS CPI-U annual
averages, series `CUUR0000SA0`, fetched in four 10-year windows from the BLS public
API v1 (no key required). See REBUILD.md for the request body.

## The two checks worth keeping

`06_verify.py` is not a formality. It asserts that `TOTCIR − ELMATCIR` equals the
survey's own `PHYSCIR` for every individual library from FY2018 on, which is the only
thing licensing the spliced series, and it fails loudly if the FY2024 reporting gap
ever closes — at which point the exclusion on the page should be revisited rather than
left in place.

`test_page.js` asserts the numbers the page's prose states. Change the pipeline and the
test breaks before the sentences start lying.
