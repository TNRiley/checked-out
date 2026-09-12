#!/usr/bin/env python3
"""Headline figures, and the verification table REBUILD.md needs."""
import json, os
from plsfiles import SRC
p = json.load(open(os.path.join(SRC,"payload.json")))
Y, n, cpi = p["years"], p["national"], {int(k):v for k,v in p["cpi"].items()}
i = {y:k for k,y in enumerate(Y)}
g = lambda k,y: n[k][i[y]]
CPI23 = cpi[2023]
real = lambda v,y: v*CPI23/cpi[y]

phys = {y: g("physical",y) for y in Y if g("physical",y)}
peak = max((y for y in phys if y<=2023), key=lambda y: phys[y])
print(f"physical circulation peak:  FY{peak}  {phys[peak]/1e6:,.1f}M")
print(f"  FY1992 {phys[1992]/1e6:,.1f}M   FY2023 {phys[2023]/1e6:,.1f}M")
print(f"  2023 vs 1992: {100*(phys[2023]/phys[1992]-1):+.1f}%")
print(f"  2023 vs peak: {100*(phys[2023]/phys[peak]-1):+.1f}%")

vis = {y: g("visits",y) for y in Y if g("visits",y)}
vpeak = max((y for y in vis if y<=2023), key=lambda y: vis[y])
print(f"\nvisits peak: FY{vpeak} {vis[vpeak]/1e6:,.1f}M ; FY2023 {vis[2023]/1e6:,.1f}M "
      f"({100*vis[2023]/vis[vpeak]:.1f}% of peak)")

print(f"\nelectronic: FY2013 {g('elmatcir',2013)/1e6:,.1f}M -> FY2023 {g('elmatcir',2023)/1e6:,.1f}M "
      f"({g('elmatcir',2023)/g('elmatcir',2013):.1f}x)")
for y in Y:
    if y>=2013 and g("totcir",y):
        sh = 100*g("elmatcir",y)/g("totcir",y)
        if sh>=10: print(f"  e-share first passes 10% in FY{y} ({sh:.1f}%)"); break
print(f"  e-share FY2023: {100*g('elmatcir',2023)/g('totcir',2023):.1f}%")

print(f"\noperating expenditure (2023 dollars):")
for y in (1998, 2009, 2019, 2023):
    print(f"  FY{y}  nominal ${g('totopexp',y)/1e9:5.2f}bn   real ${real(g('totopexp',y),y)/1e9:5.2f}bn")
r98, r23 = real(g("totopexp",1998),1998), g("totopexp",2023)
print(f"  real change 1998->2023: {100*(r23/r98-1):+.1f}%")
print(f"  physical circ change  : {100*(phys[2023]/phys[1998]-1):+.1f}%")
print(f"  visits change         : {100*(vis[2023]/vis[1998]-1):+.1f}%")

print("\nper capita (POPU_UND, matching IMLS's published base):")
for y in (1998, 2009, 2019, 2023):
    u = g("popu_und",y)
    print(f"  FY{y}  phys {phys[y]/u:5.2f}   visits {vis[y]/u:5.2f}   total circ {g('totcir',y)/u:5.2f}")

print("\nprograms:", f"FY2004 {g('totpro',2004)/1e6:.1f}M -> FY2023 {g('totpro',2023)/1e6:.1f}M",
      f"| attendance {g('totatten',2004)/1e6:.1f}M -> {g('totatten',2023)/1e6:.1f}M")
print("outlets: central+branch FY1992",
      f"{(g('centlib',1992)+g('branlib',1992)):,.0f} -> FY2023 {(g('centlib',2023)+g('branlib',2023)):,.0f}",
      f"| bookmobiles {g('bkmob',1992):,.0f} -> {g('bkmob',2023):,.0f}")
print("MLS librarians FY1992", f"{g('master',1992):,.0f} -> FY2023 {g('master',2023):,.0f}")
print("\nFY2024 gap:", p["fy2024"]["missing"], "of", p["fy2024"]["records"],
      "| worst:", [s[0] for s in p["fy2024"]["states"][:6]])
