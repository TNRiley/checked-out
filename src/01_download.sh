#!/usr/bin/env bash
# Downloads every Public Libraries Survey CSV release, FY1992-FY2024.
# URLs are hand-verified (all 33 return 200); IMLS moved files between
# /sites/default/files/ and dated subdirectories partway through, so the
# paths are not derivable from the year and must stay as a literal table.
set -u
cd "$(dirname "$0")/raw" || exit 1
BASE=https://www.imls.gov/sites/default/files

while read -r year path; do
  [ -z "$year" ] && continue
  out="pls_fy${year}.zip"
  if [ -s "$out" ]; then echo "have $year"; continue; fi
  code=$(curl -sL "$BASE/$path" -o "$out" -w "%{http_code}")
  size=$(stat -c%s "$out" 2>/dev/null || echo 0)
  echo "$year $code ${size}b"
  [ "$code" = "200" ] || { echo "FAILED $year"; rm -f "$out"; }
done <<'TABLE'
2024 2026-06/pls_fy2024_csv.zip
2023 2025-08/pls_fy2023_csv.zip
2022 2024-06/pls_fy2022_csv.zip
2021 2023-06/pls_fy2021_csv.zip
2020 2022-07/pls_fy2020_csv.zip
2019 2021-05/pls_fy2019_csv.zip
2018 pls_fy2018_data_files_csv.zip
2017 pls_fy2017_data_files_csv.zip
2016 pls_fy2016_data_files_csv.zip
2015 pls_fy2015_data_files_csv.zip
2014 pls_fy2014_data_files_csv.zip
2013 pupld13a_csv.zip
2012 pupld12a_csv.zip
2011 pupld11b_csv.zip
2010 pupld10a_csv.zip
2009 pupld09a_csv.zip
2008 pupld08a_csv.zip
2007 pupld07a_csv.zip
2006 pupld06a_csv.zip
2005 pupld05a_csv.zip
2004 pupld04a_csv.zip
2003 pupld03a_csv.zip
2002 pupld02b_csv.zip
2001 pupld01b_csv.zip
2000 pupldf00_csv.zip
1999 pupldf99_csv.zip
1998 pupldf98_csv.zip
1997 pupld97a_csv.zip
1996 pupld96a_csv.zip
1995 pupld95a_csv.zip
1994 pupld94a_csv.zip
1993 pupld93a_csv.zip
1992 pupld92a_csv.zip
TABLE
echo "=== done ==="
ls -la | tail -40
