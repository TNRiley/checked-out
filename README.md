# 📚 Checked Out

**American public libraries circulate fewer physical items than they did in 1992 — and the headline number is built so you cannot see it.**

→ **[Open it](https://tnriley.github.io/checked-out/)**

Thirty-three annual releases of the IMLS Public Libraries Survey, FY1992 through FY2024, every administrative entity in the United States, assembled into one 302,710-row panel. Total circulation looks like it sagged and recovered. It did not. TOTCIR spans all 33 years, which makes it tempting as a single series, but its meaning changed underneath: when libraries began lending e-books and streaming media those loans were folded into the same column. Split them and FY2023 physical circulation is 1.42 billion items — 9.4% below FY1992 and 42.5% below the FY2010 peak — while the population served grew by a quarter. Electronic lending, nothing at all before FY2013, is now 27.8% of everything a library circulates and is the only reason the headline holds up. Visits are worse and simpler: half the FY2009 peak, with no recovery after 2021. Meanwhile real operating spending is up 31.5% since FY1998, and there are more branches and more degreed librarians than there were then. The page splits the series, indexes money against use, shows what did grow (programs, attendance, terminals, interlibrary loans), slopes every state from FY1998 to FY2023, and lets you search all 10,281 libraries that ever filed a return to find your own. Two traps are documented rather than smoothed over: the survey's negative values are missing-data codes that silently subtract if summed, and FY2024 cannot carry a national total at all — 2,791 of 9,249 entities filed no circulation, including every library in Iowa, Massachusetts, Oregon and Florida, so summing it produces a collapse that never happened.

## Running it

One self-contained HTML file. No build step, no server, no network access at runtime — open `index.html` in a browser, or serve the directory with any static host.

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Rebuilding it from scratch

[REBUILD.md](REBUILD.md) is written for an LLM with a shell and nothing else: the data sources and their quirks, the processing decisions, the page's structure and interactions, and a table of expected values to check the result against.

## Source

The full build pipeline is in [`src/`](src/), with a README describing how to regenerate the page from scratch.

## Data

- **[IMLS Public Libraries Survey, FY1992–FY2024 public-use data files](https://www.imls.gov/research-evaluation/surveys/public-libraries-survey-pls)** — Public domain — a work of the United States Government
- **[US Bureau of Labor Statistics, CPI-U annual averages (series CUUR0000SA0), used only to put operating expenditure in constant dollars](https://www.bls.gov/cpi/)** — Public domain — a work of the United States Government

Every figure on the page is computed from the data shipped with it. Check the page's own methods panel for how each number is derived and where it should not be pushed.

## Built with

python 3, 33-release schema reconciliation, spliced series with an identity check, vanilla JS, canvas, base64 Int32Array payload, node DOM-stub page test.

## Licence

Code is MIT (see [LICENSE](LICENSE)). Data keeps the licence of its source, listed above.

---

Part of [Quick Projects](https://github.com/TNRiley/quick-projects) — one self-contained thing, built in one session. First published 2026-09-12.
