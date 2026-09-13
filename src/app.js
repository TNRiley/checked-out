/* Checked Out — all rendering. D is spliced in by 05_inject.py. */
(function () {
"use strict";

const Y = D.years, LAST = D.lastFull, N = D.national;
const iy = {}; Y.forEach((y, i) => iy[y] = i);
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- formatting ---------- */
const nf = (n, d) => n == null ? "—" : n.toLocaleString("en-US", {minimumFractionDigits: d|0, maximumFractionDigits: d|0});
const bn = n => n == null ? "—" : (n / 1e9).toFixed(2) + " bn";
const mn = n => n == null ? "—" : (n / 1e6).toFixed(1) + "M";
const pct = (n, d) => n == null ? "—" : (n * 100).toFixed(d == null ? 1 : d) + "%";
const sgn = n => (n >= 0 ? "+" : "−") + Math.abs(n).toFixed(1) + "%";
const usd = n => "$" + (n / 1e9).toFixed(2) + " bn";

/* ---------- derived series ---------- */
const CPI = D.cpi, cpiLast = CPI[String(LAST)];
const real = (v, y) => v == null ? null : v * cpiLast / CPI[String(y)];
const upto = y => y <= LAST;

const phys = Y.map((y, i) => upto(y) ? N.physical[i] : null);
const elec = Y.map((y, i) => upto(y) ? (N.elmatcir[i] || null) : null);
const totc = Y.map((y, i) => upto(y) ? N.totcir[i] : null);
const vis  = Y.map((y, i) => upto(y) ? N.visits[i] : null);
const pop  = Y.map((y, i) => upto(y) ? N.popu_und[i] : null);
const physPC = Y.map((y, i) => phys[i] && pop[i] ? phys[i] / pop[i] : null);
const elecPC = Y.map((y, i) => elec[i] && pop[i] ? elec[i] / pop[i] : null);
const visPC  = Y.map((y, i) => vis[i]  && pop[i] ? vis[i]  / pop[i] : null);

const idxOf = y => iy[y];
const at = (arr, y) => arr[idxOf(y)];

const physPeakYear = Y.filter(upto).reduce((b, y) => at(phys, y) > at(phys, b) ? y : b, 1992);
const visPeakYear  = Y.filter(y => upto(y) && at(vis, y)).reduce((b, y) => at(vis, y) > at(vis, b) ? y : b, 1998);
const eShare = y => at(totc, y) ? at(elec, y) / at(totc, y) : null;
const firstTenth = Y.filter(y => upto(y) && eShare(y)).find(y => eShare(y) >= 0.10);

const vs92 = at(phys, LAST) / at(phys, 1992) - 1;
const vsPeak = at(phys, LAST) / at(phys, physPeakYear) - 1;
const visVsPeak = at(vis, LAST) / at(vis, visPeakYear);
const realExp98 = real(at(N.totopexp, 1998), 1998), realExpL = at(N.totopexp, LAST);

/* ---------- text ---------- */
document.getElementById("dek").innerHTML =
  "Thirty-two years of the Public Libraries Survey, every library in the United States, one row each. " +
  "Total circulation looks like it dipped and came back. It did not: <b>" + mn(at(phys, LAST)) +
  " physical items</b> went out the door in FY" + LAST + ", <b>" + sgn(vs92 * 100) +
  "</b> against FY1992 and <b>" + sgn(vsPeak * 100) + "</b> against the FY" + physPeakYear +
  " peak. What held the headline up was electronic lending, now " + pct(eShare(LAST)) +
  " of everything a library circulates.";

const stripe = [
  [mn(at(phys, LAST)), "physical items circulated, FY" + LAST],
  [sgn(vs92 * 100), "against FY1992 — fewer physical items than 32 years ago"],
  [pct(eShare(LAST)), "of circulation is now electronic, from nothing in FY2012"],
  [pct(visVsPeak, 0), "of the FY" + visPeakYear + " visit peak; visits never came back"]
];
document.getElementById("stripe").innerHTML = stripe.map(s =>
  '<div><div class="v">' + s[0] + '</div><div class="k">' + s[1] + "</div></div>").join("");
document.getElementById("stripe-note").innerHTML =
  "Per-capita figures use the unduplicated service population (<code>POPU_UND</code>), the base IMLS uses in its own releases.";

document.getElementById("lede1").innerHTML =
  "<code>TOTCIR</code> runs across all 33 releases, which makes it tempting as a single long series. It is not one: " +
  "when libraries began lending e-books and streaming media, those loans were folded into the same total. " +
  "Split them and the physical line falls through its own starting point — FY" + LAST + " sits below FY1992 " +
  "even though the population served grew by " + sgn((at(pop, LAST) / at(pop, 1998) - 1) * 100) + " since FY1998.";

document.getElementById("note-split").innerHTML =
  "<b>The check that makes this safe.</b> From FY2018 the survey reports physical circulation directly as " +
  "<code>PHYSCIR</code>, and <code>TOTCIR − ELMATCIR</code> equals it to the item, library by library, in every year " +
  "from FY2018 to FY" + LAST + ". Before FY2013 there is nothing to subtract: e-material circulation was not collected, " +
  "so the early line is physical by construction.";

document.getElementById("lede2").innerHTML =
  "Everything indexed to FY1998 = 100, with money in FY" + LAST + " dollars. Real operating spending is up <b>" +
  sgn((realExpL / realExp98 - 1) * 100) + "</b>. Over the same years physical circulation is <b>" +
  sgn((at(phys, LAST) / at(phys, 1998) - 1) * 100) + "</b> and visits are <b>" +
  sgn((at(vis, LAST) / at(vis, 1998) - 1) * 100) + "</b>. The buildings did not close and the staff did not shrink — " +
  "there are more branches and more degreed librarians than in 1998. Fewer people walk in.";

document.getElementById("lede3").innerHTML =
  "The counters that went up are the ones a circulation figure never sees: programs and the people who attend them, " +
  "public internet terminals and the sessions run on them, and electronic lending. Each panel is drawn on its own scale; " +
  "the point is the shape, not the height.";

document.getElementById("lede4").innerHTML =
  "Per-capita physical circulation in FY1998 against FY" + LAST + ", one line per state. Every state falls. " +
  "What differs is how far, and from where — the states that circulated most in 1998 had the furthest to drop.";

document.getElementById("lede5").innerHTML =
  "All " + nf(D.libs.n) + " administrative entities that ever filed a return, with the physical circulation and visits " +
  "each reported in each year. Small libraries are noisy and reporting gaps are common; a flat run of zeros usually " +
  "means a year was not filed rather than a year with no lending.";

document.getElementById("lede6").innerHTML =
  "FY2024 data exists and is included in the search above, but no national total on this page uses it. " +
  "<b>" + nf(D.fy2024.missing) + " of " + nf(D.fy2024.records) + "</b> administrative entities reported no circulation " +
  "at all — not scattered libraries but entire states, Iowa, Massachusetts, Oregon and Florida among them. " +
  "Summing the column anyway produces a collapse that never happened.";

/* ---------- canvas plumbing ---------- */
function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
function setup(cv) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  // The markup height is the CSS height. Read it once and pin it: assigning cv.height
  // below rewrites that same attribute, so reading it again on the next redraw would
  // double the canvas on every hover event until the browser gives up and paints white.
  const h = +(cv.dataset.h || (cv.dataset.h = cv.getAttribute("height")));
  cv.style.height = h + "px";
  const w = cv.clientWidth;
  cv.width = w * dpr; cv.height = h * dpr;
  const g = cv.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, w, h);
  return {g, w, h};
}
const MONO = '"IBM Plex Mono",monospace', SANS = '"Archivo",system-ui,sans-serif';

function axes(g, x0, y0, x1, y1, ticks, fmt, label) {
  g.strokeStyle = css("--line"); g.lineWidth = 1;
  g.fillStyle = css("--faint"); g.font = "11px " + MONO; g.textAlign = "right";
  ticks.forEach(t => {
    const y = t.y;
    g.beginPath(); g.moveTo(x0, Math.round(y) + .5); g.lineTo(x1, Math.round(y) + .5); g.stroke();
    g.fillText(fmt(t.v), x0 - 8, y + 4);
  });
  if (label) { g.textAlign = "left"; g.fillText(label, x0 - 2, y0 - 12); }
}
function xAxis(g, xs, y, years, step) {
  g.fillStyle = css("--faint"); g.font = "11px " + MONO; g.textAlign = "center";
  years.forEach(yr => { if (yr % step === 0) g.fillText("'" + String(yr).slice(2), xs(yr), y + 16); });
}
function niceTicks(max, n) {
  const raw = max / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) || mag * 10;
  const out = []; for (let v = 0; v <= max * 1.0001; v += step) out.push(v);
  return out;
}

/* ---------- 01 stacked area ---------- */
let stackMode = "abs";
const stackCv = document.getElementById("stack"), stackRead = document.getElementById("stack-read");
let stackHit = null;

function drawStack() {
  const {g, w, h} = setup(stackCv);
  const L = 58, R = 14, T = 18, B = 30;
  const ys = Y.filter(upto);
  const P = stackMode === "abs" ? phys : physPC;
  const E = stackMode === "abs" ? elec : elecPC;
  const max = Math.max.apply(null, ys.map(y => (at(P, y) || 0) + (at(E, y) || 0))) * 1.06;
  const xs = y => L + (w - L - R) * (y - ys[0]) / (ys[ys.length - 1] - ys[0]);
  const yv = v => h - B - (h - B - T) * (v / max);
  const fmt = stackMode === "abs" ? (v => (v / 1e9).toFixed(1) + "bn") : (v => v.toFixed(0));
  axes(g, L, T, w - R, h - B, niceTicks(max, 5).map(v => ({v, y: yv(v)})), fmt,
       stackMode === "abs" ? "items" : "per person");
  xAxis(g, xs, h - B, ys, 5);

  const band = (arrLo, arrHi, color) => {
    g.beginPath();
    ys.forEach((y, i) => { const v = (at(arrLo, y) || 0) + (at(arrHi, y) || 0); i ? g.lineTo(xs(y), yv(v)) : g.moveTo(xs(y), yv(v)); });
    for (let i = ys.length - 1; i >= 0; i--) g.lineTo(xs(ys[i]), yv(at(arrLo, ys[i]) || 0));
    g.closePath(); g.fillStyle = color; g.fill();
  };
  band(phys.map(() => 0), P, css("--accent") + "E6");
  band(P, E, css("--elec") + "E6");

  // FY1992 physical reference
  const ref = at(P, 1992);
  g.setLineDash([4, 4]); g.strokeStyle = css("--line-2"); g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(L, yv(ref)); g.lineTo(w - R, yv(ref)); g.stroke(); g.setLineDash([]);

  // peak marker
  g.fillStyle = css("--ink"); g.font = "600 11px " + SANS; g.textAlign = "center";
  g.fillText("FY" + physPeakYear + " peak", xs(physPeakYear), yv(at(P, physPeakYear)) - 8);
  g.beginPath(); g.arc(xs(physPeakYear), yv(at(P, physPeakYear)), 3, 0, 7); g.fill();

  if (stackHit != null) {
    const y = stackHit;
    g.strokeStyle = css("--ink"); g.globalAlpha = .35; g.lineWidth = 1;
    g.beginPath(); g.moveTo(xs(y), T); g.lineTo(xs(y), h - B); g.stroke(); g.globalAlpha = 1;
  }
  const hy = stackHit != null ? stackHit : LAST;
  stackRead.innerHTML = "FY" + hy + " &nbsp; physical <b>" +
    (stackMode === "abs" ? mn(at(phys, hy)) : nf(at(physPC, hy), 2)) + "</b> &nbsp; electronic <b>" +
    (at(elec, hy) ? (stackMode === "abs" ? mn(at(elec, hy)) : nf(at(elecPC, hy), 2)) : "not collected") +
    "</b>" + (eShare(hy) ? " &nbsp; electronic share <b>" + pct(eShare(hy)) + "</b>" : "");
}
stackCv.addEventListener("pointermove", e => {
  const r = stackCv.getBoundingClientRect(), ys = Y.filter(upto);
  const L = 58, R = 14, frac = (e.clientX - r.left - L) / (r.width - L - R);
  stackHit = ys[Math.max(0, Math.min(ys.length - 1, Math.round(frac * (ys.length - 1))))];
  drawStack();
});
stackCv.addEventListener("pointerleave", () => { stackHit = null; drawStack(); });
document.getElementById("m-abs").onclick = () => { stackMode = "abs"; togglePills("m-abs", "m-pc"); drawStack(); };
document.getElementById("m-pc").onclick = () => { stackMode = "pc"; togglePills("m-pc", "m-abs"); drawStack(); };
function togglePills(on, off) {
  document.getElementById(on).setAttribute("aria-pressed", "true");
  document.getElementById(off).setAttribute("aria-pressed", "false");
}

/* ---------- 02 indexed divergence ---------- */
const IDX = [
  {k: "Real operating spending", get: y => real(at(N.totopexp, y), y), c: () => css("--good")},
  {k: "Degreed librarians (FTE)", get: y => at(N.master, y), c: () => css("--elec")},
  {k: "Central libraries + branches", get: y => (at(N.centlib, y) || 0) + (at(N.branlib, y) || 0), c: () => css("--line-2")},
  {k: "Physical circulation", get: y => at(phys, y), c: () => css("--accent")},
  {k: "Visits", get: y => at(vis, y), c: () => css("--warn")}
];
const idxCv = document.getElementById("index"), idxRead = document.getElementById("index-read");
let idxHit = null;
document.getElementById("index-legend").innerHTML = IDX.map(s =>
  '<span><i class="sw" style="background:' + s.c() + '"></i> ' + s.k + "</span>").join("");

function drawIndex() {
  const {g, w, h} = setup(idxCv);
  const L = 48, R = 14, T = 18, B = 30, base = 1998;
  const ys = Y.filter(y => y >= base && upto(y));
  const vals = IDX.map(s => ys.map(y => { const v = s.get(y), b = s.get(base); return v && b ? 100 * v / b : null; }));
  const flat = vals.flat().filter(v => v != null);
  const max = Math.max.apply(null, flat) * 1.05, min = Math.min.apply(null, flat) * 0.95;
  const xs = y => L + (w - L - R) * (y - base) / (ys[ys.length - 1] - base);
  const yv = v => h - B - (h - B - T) * (v - min) / (max - min);
  axes(g, L, T, w - R, h - B, niceTicks(max, 5).filter(v => v >= min).map(v => ({v, y: yv(v)})), v => v.toFixed(0), "FY1998=100");
  xAxis(g, xs, h - B, ys, 5);
  g.strokeStyle = css("--line-2"); g.setLineDash([3, 3]);
  g.beginPath(); g.moveTo(L, yv(100)); g.lineTo(w - R, yv(100)); g.stroke(); g.setLineDash([]);

  IDX.forEach((s, si) => {
    g.strokeStyle = s.c(); g.lineWidth = si >= 3 ? 2.4 : 1.6; g.globalAlpha = si >= 3 ? 1 : .75;
    g.beginPath(); let started = false;
    ys.forEach((y, i) => { const v = vals[si][i]; if (v == null) return; started ? g.lineTo(xs(y), yv(v)) : (g.moveTo(xs(y), yv(v)), started = true); });
    g.stroke(); g.globalAlpha = 1;
  });
  if (idxHit != null) {
    g.strokeStyle = css("--ink"); g.globalAlpha = .3;
    g.beginPath(); g.moveTo(xs(idxHit), T); g.lineTo(xs(idxHit), h - B); g.stroke(); g.globalAlpha = 1;
  }
  const hy = idxHit != null ? idxHit : LAST, hi = ys.indexOf(hy);
  idxRead.innerHTML = "FY" + hy + " &nbsp; " + IDX.map((s, si) =>
    s.k.split(" ")[0].toLowerCase() + " <b>" + (vals[si][hi] == null ? "—" : vals[si][hi].toFixed(0)) + "</b>").join(" &nbsp; ");
}
idxCv.addEventListener("pointermove", e => {
  const r = idxCv.getBoundingClientRect(), ys = Y.filter(y => y >= 1998 && upto(y));
  const frac = (e.clientX - r.left - 48) / (r.width - 62);
  idxHit = ys[Math.max(0, Math.min(ys.length - 1, Math.round(frac * (ys.length - 1))))];
  drawIndex();
});
idxCv.addEventListener("pointerleave", () => { idxHit = null; drawIndex(); });

/* ---------- 03 small multiples ---------- */
const MINIS = [
  {t: "Programs held", p: "Storytimes, classes, lectures, clubs.", k: "totpro", f: mn},
  {t: "Program attendance", p: "People through the door for those programs.", k: "totatten", f: mn},
  {t: "Electronic circulation", p: "E-books, audiobooks, streaming media.", k: "elmatcir", f: mn},
  {t: "Public internet terminals", p: "Machines a visitor can sit down at.", k: "gpterms", f: n => nf(n)},
  {t: "Interlibrary loans sent", p: "Items lent to other libraries.", k: "loanto", f: mn},
  {t: "Print volumes held", p: "The book stock itself.", k: "bkvol", f: mn}
];
document.getElementById("minis").innerHTML = MINIS.map((m, i) =>
  '<div class="card mini"><h3>' + m.t + "</h3><p>" + m.p + '</p><canvas id="mini' + i + '" height="110"></canvas>' +
  '<p class="readout" id="miniread' + i + '"></p></div>').join("");

function drawMini(i) {
  const m = MINIS[i], cv = document.getElementById("mini" + i);
  const {g, w, h} = setup(cv);
  const pts = Y.filter(upto).map(y => ({y, v: at(N[m.k], y)})).filter(p => p.v != null);
  if (!pts.length) return;
  const T = 8, B = 16, L = 2, R = 2;
  const max = Math.max.apply(null, pts.map(p => p.v)) * 1.08;
  const x0 = pts[0].y, x1 = pts[pts.length - 1].y;
  const xs = y => L + (w - L - R) * (y - x0) / (x1 - x0);
  const yv = v => h - B - (h - B - T) * (v / max);
  g.beginPath();
  pts.forEach((p, k) => k ? g.lineTo(xs(p.y), yv(p.v)) : g.moveTo(xs(p.y), yv(p.v)));
  g.lineTo(xs(x1), h - B); g.lineTo(xs(x0), h - B); g.closePath();
  g.fillStyle = css("--accent") + "22"; g.fill();
  g.beginPath();
  pts.forEach((p, k) => k ? g.lineTo(xs(p.y), yv(p.v)) : g.moveTo(xs(p.y), yv(p.v)));
  g.strokeStyle = css("--accent"); g.lineWidth = 1.8; g.stroke();
  g.fillStyle = css("--faint"); g.font = "10px " + MONO;
  g.textAlign = "left"; g.fillText("'" + String(x0).slice(2), L, h - 3);
  g.textAlign = "right"; g.fillText("'" + String(x1).slice(2), w - R, h - 3);
  const a = pts[0].v, b = pts[pts.length - 1].v;
  document.getElementById("miniread" + i).innerHTML =
    m.f(a) + " → <b>" + m.f(b) + "</b> &nbsp;<span class=" + (b >= a ? '"up"' : '"down"') + ">" +
    sgn((b / a - 1) * 100) + "</span>";
}

/* ---------- 04 state slope ---------- */
let slopeMetric = "phys";
const slopeCv = document.getElementById("slope"), slopeRead = document.getElementById("slope-read");
let slopeHit = null;
const SKIP = new Set(["AS", "GU", "MP", "PR", "VI"]);

function stateRows() {
  const A = 1998, B = LAST;
  return D.states.filter(s => !SKIP.has(s.st)).map(s => {
    const num = slopeMetric === "phys" ? s.phys : s.visits;
    const a = num[idxOf(A)], b = num[idxOf(B)];
    const pa = s.pop[idxOf(A)], pb = s.pop[idxOf(B)];
    if (!a || !b || !pa || !pb) return null;
    return {st: s.st, a: a / pa, b: b / pb, chg: (b / pb) / (a / pa) - 1};
  }).filter(Boolean);
}
function drawSlope() {
  const {g, w, h} = setup(slopeCv);
  const rows = stateRows();
  const T = 26, B = 26, L = 60, R = 60;
  const max = Math.max.apply(null, rows.map(r => Math.max(r.a, r.b))) * 1.06;
  const yv = v => h - B - (h - B - T) * (v / max);
  const xa = L, xb = w - R;
  g.strokeStyle = css("--line"); g.lineWidth = 1;
  [xa, xb].forEach(x => { g.beginPath(); g.moveTo(x, T); g.lineTo(x, h - B); g.stroke(); });
  g.fillStyle = css("--faint"); g.font = "11px " + MONO;
  g.textAlign = "center"; g.fillText("FY1998", xa, T - 10); g.fillText("FY" + LAST, xb, T - 10);
  rows.forEach(r => {
    const hit = slopeHit === r.st;
    g.strokeStyle = hit ? css("--ink") : css("--accent");
    g.globalAlpha = hit ? 1 : .34; g.lineWidth = hit ? 2.4 : 1.2;
    g.beginPath(); g.moveTo(xa, yv(r.a)); g.lineTo(xb, yv(r.b)); g.stroke();
    g.globalAlpha = 1;
  });
  g.font = "10px " + MONO;
  const label = (x, side) => {
    const used = [];
    rows.slice().sort((p, q) => (side === "a" ? q.a - p.a : q.b - p.b)).forEach(r => {
      const y = yv(side === "a" ? r.a : r.b);
      if (used.some(u => Math.abs(u - y) < 10)) return;
      used.push(y);
      g.fillStyle = slopeHit === r.st ? css("--ink") : css("--faint");
      g.textAlign = side === "a" ? "right" : "left";
      g.fillText(r.st + " " + (side === "a" ? r.a : r.b).toFixed(1), side === "a" ? x - 7 : x + 7, y + 3);
    });
  };
  label(xa, "a"); label(xb, "b");
  const med = rows.slice().sort((p, q) => p.chg - q.chg)[Math.floor(rows.length / 2)];
  slopeRead.innerHTML = slopeHit
    ? "<b>" + slopeHit + "</b> &nbsp; " + rows.find(r => r.st === slopeHit).a.toFixed(2) + " → <b>" +
      rows.find(r => r.st === slopeHit).b.toFixed(2) + "</b> per person &nbsp; <span class='down'>" +
      sgn(rows.find(r => r.st === slopeHit).chg * 100) + "</span>"
    : rows.length + " states and DC · median change <b>" + sgn(med.chg * 100) +
      "</b> · rising: <b>" + rows.filter(r => r.chg > 0).length + "</b>";
}
slopeCv.addEventListener("pointermove", e => {
  const r = slopeCv.getBoundingClientRect(), rows = stateRows();
  const h = +slopeCv.dataset.h, T = 26, B = 26, L = 60, R = 60;
  const max = Math.max.apply(null, rows.map(q => Math.max(q.a, q.b))) * 1.06;
  const yv = v => h - B - (h - B - T) * (v / max);
  const x = e.clientX - r.left, y = e.clientY - r.top;
  const t = Math.max(0, Math.min(1, (x - L) / (r.width - L - R)));
  let best = null, bd = 14;
  rows.forEach(q => { const yy = yv(q.a) + (yv(q.b) - yv(q.a)) * t; const d = Math.abs(yy - y); if (d < bd) { bd = d; best = q.st; } });
  if (best !== slopeHit) { slopeHit = best; drawSlope(); }
});
slopeCv.addEventListener("pointerleave", () => { slopeHit = null; drawSlope(); });
document.getElementById("s-phys").onclick = () => { slopeMetric = "phys"; togglePills("s-phys", "s-vis"); drawSlope(); stateTable(); };
document.getElementById("s-vis").onclick = () => { slopeMetric = "vis"; togglePills("s-vis", "s-phys"); drawSlope(); stateTable(); };

let sortKey = "chg", sortDir = 1;
function stateTable() {
  const rows = stateRows();
  rows.sort((p, q) => (p[sortKey] - q[sortKey]) * sortDir);
  const head = [["st", "State"], ["a", "FY1998"], ["b", "FY" + LAST], ["chg", "Change"]];
  const t = document.getElementById("sttable");
  t.innerHTML = "<thead><tr>" + head.map(hd =>
    "<th" + (hd[0] === sortKey ? ' aria-sort="' + (sortDir > 0 ? "ascending" : "descending") + '"' : "") +
    ' data-k="' + hd[0] + '" class="' + (hd[0] === "st" ? "" : "mono") + '">' + hd[1] + "</th>").join("") +
    "</tr></thead><tbody>" + rows.map(r =>
      "<tr><td>" + r.st + '</td><td class="mono">' + r.a.toFixed(2) + '</td><td class="mono">' + r.b.toFixed(2) +
      '</td><td class="mono ' + (r.chg >= 0 ? "up" : "down") + '">' + sgn(r.chg * 100) + "</td></tr>").join("") +
    "</tbody>";
  t.querySelectorAll("th").forEach(th => th.onclick = () => {
    const k = th.dataset.k;
    if (k === sortKey) sortDir *= -1; else { sortKey = k; sortDir = k === "st" ? 1 : 1; }
    stateTable();
  });
}

/* ---------- 05 library finder ---------- */
function decode(b64) {
  const bin = atob(b64), len = bin.length, u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
  return new Int32Array(u8.buffer);
}
const LIB = D.libs, LCIRC = decode(LIB.circ), LVIS = decode(LIB.vis), NY = LIB.ny;
const haystack = LIB.name.map((n, i) => (n + " " + LIB.city[i] + " " + LIB.st[i]).toLowerCase());
const qEl = document.getElementById("q"), hitsEl = document.getElementById("hits"), pane = document.getElementById("libpane");

qEl.addEventListener("input", () => {
  const q = qEl.value.trim().toLowerCase();
  if (q.length < 2) { hitsEl.hidden = true; return; }
  const out = [];
  for (let i = 0; i < haystack.length && out.length < 40; i++) if (haystack[i].indexOf(q) >= 0) out.push(i);
  hitsEl.innerHTML = out.map(i =>
    '<button data-i="' + i + '">' + LIB.name[i] + ' <span class="st">' + LIB.city[i] + ", " + LIB.st[i] +
    (LIB.pop[i] ? " · pop " + nf(LIB.pop[i]) : "") + "</span></button>").join("") ||
    '<button disabled style="color:var(--faint)">no match</button>';
  hitsEl.hidden = false;
  hitsEl.querySelectorAll("button[data-i]").forEach(b => b.onclick = () => showLib(+b.dataset.i));
});

function showLib(i) {
  hitsEl.hidden = true; qEl.value = LIB.name[i];
  const c = [], v = [];
  for (let k = 0; k < NY; k++) {
    c.push(LCIRC[i * NY + k] < 0 ? null : LCIRC[i * NY + k]);
    v.push(LVIS[i * NY + k] < 0 ? null : LVIS[i * NY + k]);
  }
  const yrs = Y.map((y, k) => ({y, c: c[k], v: v[k]}));
  const filled = yrs.filter(r => r.c != null);
  const first = filled[0], last = filled[filled.length - 1];
  pane.innerHTML = '<div class="libcard"><h3>' + LIB.name[i] + '</h3><div class="sub">' +
    LIB.city[i] + ", " + LIB.st[i] + (LIB.pop[i] ? " · serves " + nf(LIB.pop[i]) : "") +
    " · " + (filled.length ? "FY" + first.y + "–FY" + last.y + ", " + filled.length + " years filed" : "no circulation filed") +
    '</div><canvas id="libcv" height="150"></canvas>' +
    '<div class="legend"><span><i class="sw" style="background:var(--accent)"></i> Physical circulation</span>' +
    '<span><i class="sw" style="background:var(--warn)"></i> Visits</span></div>' +
    '<div class="libstats">' +
      (first ? "<div><b>" + nf(first.c) + "</b>physical, FY" + first.y + "</div>" : "") +
      (last ? "<div><b>" + nf(last.c) + "</b>physical, FY" + last.y + "</div>" : "") +
      (first && last && first.c ? '<div><b class="' + (last.c >= first.c ? "up" : "down") + '">' +
        sgn((last.c / first.c - 1) * 100) + "</b>over that span</div>" : "") +
    "</div></div>";
  drawLib(c, v);
}
function drawLib(c, v) {
  const cv = document.getElementById("libcv"); if (!cv) return;
  const {g, w, h} = setup(cv);
  const T = 10, B = 18, L = 2, R = 2;
  const maxC = Math.max.apply(null, c.filter(x => x != null).concat([1]));
  const maxV = Math.max.apply(null, v.filter(x => x != null).concat([1]));
  const xs = k => L + (w - L - R) * k / (NY - 1);
  const line = (arr, max, color, width) => {
    g.strokeStyle = color; g.lineWidth = width; g.beginPath(); let on = false;
    arr.forEach((val, k) => {
      if (val == null) { on = false; return; }
      const y = h - B - (h - B - T) * (val / max);
      on ? g.lineTo(xs(k), y) : (g.moveTo(xs(k), y), on = true);
    });
    g.stroke();
  };
  line(c, maxC, css("--accent"), 2);
  line(v, maxV, css("--warn"), 1.4);
  g.fillStyle = css("--faint"); g.font = "10px " + MONO;
  g.textAlign = "left"; g.fillText("'92", L, h - 4);
  g.textAlign = "right"; g.fillText("'24", w - R, h - 4);
  g.textAlign = "center"; g.fillText("each line scaled to its own maximum", w / 2, h - 4);
}

/* ---------- 06 the FY2024 gap ---------- */
function drawGap() {
  const cv = document.getElementById("gap"), {g, w, h} = setup(cv);
  const rows = D.fy2024.states.slice(0, 14);
  const T = 14, B = 26, L = 40, R = 56;
  const bw = (h - T - B) / rows.length;
  const max = 100;
  rows.forEach((r, i) => {
    const share = 100 * r[1] / r[2];
    const y = T + i * bw;
    g.fillStyle = css("--warn"); g.globalAlpha = share >= 99 ? .95 : .55;
    g.fillRect(L, y + 2, (w - L - R) * share / max, bw - 4);
    g.globalAlpha = 1;
    g.fillStyle = css("--muted"); g.font = "11px " + MONO; g.textAlign = "right";
    g.fillText(r[0], L - 8, y + bw / 2 + 4);
    g.fillStyle = css("--faint"); g.textAlign = "left";
    g.fillText(r[1] + "/" + r[2], L + (w - L - R) * share / max + 8, y + bw / 2 + 4);
  });
  g.fillStyle = css("--faint"); g.font = "11px " + MONO; g.textAlign = "center";
  g.fillText("share of a state's libraries reporting no FY2024 circulation", w / 2, h - 6);
  document.getElementById("gap-read").innerHTML =
    "<b>" + nf(D.fy2024.missing) + "</b> of " + nf(D.fy2024.records) +
    " entities missing, against <b>" + nf(D.fy2024.prevMissing) + "</b> in FY" + LAST + ".";
}

/* ---------- methods + footer ---------- */
document.getElementById("methods").innerHTML =
  "<h4>Source</h4><p>The IMLS Public Libraries Survey, 33 annual public-use releases, FY1992 through FY2024, " +
  "administrative-entity files. Every figure here is computed from those files; nothing is copied from an IMLS report. " +
  "FY2019 total circulation comes out at " + bn(at(N.totcir, 2019)) + " against the " +
  "2.2 bn IMLS published, and " + nf(at(N.totcir, 2019) / at(N.popu_und, 2019), 2) + " per person against their 6.9.</p>" +

  "<h4>Negative numbers are codes</h4><p>The survey encodes <code>-1</code> missing, <code>-3</code> temporarily closed, " +
  "<code>-4</code> not applicable and <code>-9</code> suppressed for confidentiality. They are read as missing, never as " +
  "quantities — summing the column raw subtracts them from the national total.</p>" +

  "<h4>The physical series is spliced</h4><p>FY1992–FY2012 uses <code>TOTCIR</code>, which could only be physical: " +
  "e-material circulation was not collected. FY2013 onward uses <code>TOTCIR − ELMATCIR</code>. From FY2018 that " +
  "subtraction equals the survey's own <code>PHYSCIR</code> exactly, library by library; in FY2016 and FY2017, its first " +
  "two years, the two differ by 1.6% and 0.1% while libraries learned the line. One consequence: a library that folded " +
  "early e-book loans into <code>TOTCIR</code> before FY2013 makes the pre-2013 physical line slightly too high, which " +
  "would make the real decline larger, not smaller.</p>" +

  "<h4>Per person</h4><p>Denominator is <code>POPU_UND</code>, the unduplicated population of legal service areas, which " +
  "is what IMLS uses in its own per-capita figures. <code>POPU_LSA</code> double-counts overlapping service areas and runs " +
  "about 3% higher, which would understate every per-capita figure on this page.</p>" +

  "<h4>FY2024 is excluded from every total</h4><p>" + nf(D.fy2024.missing) + " of " + nf(D.fy2024.records) +
  " entities filed no circulation, including every library in Iowa, Massachusetts, Oregon and Florida. The year is kept " +
  "in the per-library search, where a missing year simply shows as a gap, and kept out of everything national.</p>" +

  "<h4>What this cannot tell you</h4><p>Circulation counts loans, not readers, and a library's worth was never only its " +
  "circulation — that is rather the point of section 03. Reporting is self-reported and definitions shift underneath " +
  "long series; the 2020 and 2021 figures describe closed buildings, not lost interest. Library identifiers are reused and " +
  "reassigned over 33 years, so a single library's line can break where an administrative entity merged or split.</p>";

document.getElementById("foot").innerHTML =
  "Data: <a href='https://www.imls.gov/research-evaluation/surveys/public-libraries-survey-pls'>IMLS Public Libraries Survey</a>, " +
  "FY1992–FY2024 public-use files (US Government work, public domain). Price adjustment: " +
  "<a href='https://www.bls.gov/cpi/'>BLS CPI-U</a> annual averages. " +
  "Built " + D.generated + " · " + nf(D.libs.n) + " libraries · " + nf(302710) + " library-years. " +
  "<a href='https://github.com/TNRiley/checked-out'>Source and rebuild instructions</a>.";

/* ---------- theme + boot ---------- */
function redraw() {
  drawStack(); drawIndex(); MINIS.forEach((_, i) => drawMini(i)); drawSlope(); drawGap();
  const cv = document.getElementById("libcv");
  if (cv) { const i = LIB.name.indexOf(qEl.value); if (i >= 0) showLib(i); }
}
document.getElementById("theme").onclick = () => {
  const cur = document.documentElement.getAttribute("data-theme");
  const dark = cur ? cur === "dark" : matchMedia("(prefers-color-scheme:dark)").matches;
  document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
  redraw();
};
matchMedia("(prefers-color-scheme:dark)").addEventListener("change", redraw);
let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(redraw, 120); });
stateTable();
redraw();
})();
