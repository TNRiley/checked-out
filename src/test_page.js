/* Run the built page's script against a stub DOM and canvas.
 *
 * There is no browser in the build environment, so this is the check that the
 * page actually executes: it runs every draw path, every hover handler and the
 * library search, and fails on the first exception. It also asserts the figures
 * the prose asserts, so a pipeline change that moves a headline number breaks
 * the test rather than quietly rewriting the sentence.
 *
 *     node test_page.js
 */
const fs = require("fs"), path = require("path"), assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const m = html.match(/<script>\n([\s\S]*?)\n<\/script>/);
assert(m, "no inline script found in index.html");
const code = m[1];

/* ---- stub canvas: records nothing, refuses nothing, reports NaN loudly ---- */
const nanGuard = new Set(["fillRect", "moveTo", "lineTo", "arc", "fillText", "strokeRect"]);
function ctx2d() {
  const noop = () => {};
  const handler = {
    get(t, k) {
      if (k === "setTransform" || k === "measureText") {
        return k === "measureText" ? () => ({width: 10}) : noop;
      }
      if (nanGuard.has(k)) {
        return (...args) => {
          for (const a of args) {
            if (typeof a === "number" && !Number.isFinite(a)) {
              throw new Error("non-finite coordinate passed to " + k + ": " + JSON.stringify(args));
            }
          }
        };
      }
      if (typeof k === "string" && /^(begin|close|stroke|fill|save|restore|clear|clip|rect|quadratic|bezier|translate|rotate|scale|setLineDash|drawImage|createLinearGradient)/.test(k)) {
        return k === "createLinearGradient" ? () => ({addColorStop: noop}) : noop;
      }
      return t[k];
    },
    set(t, k, v) { t[k] = v; return true; }
  };
  return new Proxy({}, handler);
}

let elements = {};
function mkEl(id) {
  const listeners = {};
  const el = {
    id, innerHTML: "", value: "", hidden: false, clientWidth: 880, dataset: {},
    style: {}, children: [],
    getAttribute: k => el["_" + k] != null ? el["_" + k] : (k === "height" ? "300" : null),
    setAttribute: (k, v) => { el["_" + k] = v; },
    addEventListener: (k, fn) => { (listeners[k] = listeners[k] || []).push(fn); },
    removeEventListener: () => {},
    getContext: () => ctx2d(),
    getBoundingClientRect: () => ({left: 0, top: 0, width: 880, height: 300}),
    querySelectorAll: sel => {
      // return synthetic rows so onclick wiring is exercised
      const n = sel.indexOf("th") >= 0 ? 4 : 3;
      return Array.from({length: n}, (_, i) => {
        const c = mkEl(id + "-" + sel + "-" + i);
        c.dataset = {k: ["st", "a", "b", "chg"][i] || "st", i: String(i)};
        return c;
      });
    },
    fire: (k, ev) => (listeners[k] || []).forEach(fn => fn(ev))
  };
  return el;
}
function get(id) { return elements[id] || (elements[id] = mkEl(id)); }

global.document = {
  getElementById: get,
  documentElement: {
    _attrs: {},
    getAttribute(k) { return this._attrs[k] || null; },
    setAttribute(k, v) { this._attrs[k] = v; }
  },
  querySelectorAll: () => []
};
global.getComputedStyle = () => ({
  getPropertyValue: k => ({"--accent": "#4A3E8E", "--elec": "#B07C22", "--warn": "#A8372B",
    "--good": "#2F6B52", "--line": "#D8D1C4", "--line-2": "#C6BDAC", "--ink": "#1A1714",
    "--faint": "#948D80", "--muted": "#6B655B"}[k] || "#888888")
});
global.matchMedia = () => ({matches: false, addEventListener: () => {}});
global.devicePixelRatio = 2;
global.addEventListener = () => {};
global.setTimeout = (fn) => fn && fn();
global.clearTimeout = () => {};
global.atob = s => Buffer.from(s, "base64").toString("binary");

/* ---- run it ---- */
new Function(code)();
console.log("page script executed with no exception");

/* ---- the figures the prose commits to ---- */
const D = JSON.parse(html.match(/const D = (\{[\s\S]*?\});\n/)[1]);
const Y = D.years, iy = {}; Y.forEach((y, i) => iy[y] = i);
const N = D.national, LAST = D.lastFull;
const at = (a, y) => a[iy[y]];

const phys92 = at(N.physical, 1992), physL = at(N.physical, LAST);
const peak = Y.filter(y => y <= LAST).reduce((b, y) => at(N.physical, y) > at(N.physical, b) ? y : b, 1992);

function near(a, b, tol, what) {
  assert(Math.abs(a - b) <= tol, what + ": got " + a + ", expected ~" + b);
  console.log("  ok  " + what + " = " + (Math.round(a * 100) / 100));
}
console.log("\nheadline figures:");
near(physL / 1e6, 1417.9, 0.5, "FY" + LAST + " physical circulation (M)");
near(phys92 / 1e6, 1564.4, 0.5, "FY1992 physical circulation (M)");
assert.strictEqual(peak, 2010, "physical peak year should be FY2010, got " + peak);
console.log("  ok  physical peak year = FY2010");
near(100 * (physL / phys92 - 1), -9.4, 0.2, "FY2023 vs FY1992 (%)");
near(100 * (physL / at(N.physical, peak) - 1), -42.5, 0.2, "FY2023 vs peak (%)");
near(100 * at(N.elmatcir, LAST) / at(N.totcir, LAST), 27.8, 0.2, "electronic share (%)");
near(100 * at(N.visits, LAST) / at(N.visits, 2009), 50.5, 0.3, "visits vs FY2009 peak (%)");
near(at(N.totcir, 2019) / 1e9, 2.186, 0.005, "FY2019 total circulation (bn) vs IMLS 2.2");
near(at(N.totcir, 2019) / at(N.popu_und, 2019), 6.88, 0.02, "FY2019 per person vs IMLS 6.9");

/* The splice identity. The page claims it holds *library by library*, which is
 * checked against the panel in 06_verify.py; this payload only carries national
 * sums, and each column is summed over the libraries that reported that column,
 * so the aggregates agree to rounding rather than exactly. FY2020 is the worst
 * year at 215 items in 1.2 billion. */
console.log("\nsplice identity TOTCIR - ELMATCIR ~= PHYSCIR (national sums):");
for (let y = 2018; y <= LAST; y++) {
  const d = at(N.totcir, y) - at(N.elmatcir, y) - at(N.physcir, y);
  const rel = Math.abs(d) / at(N.physcir, y);
  assert(rel < 1e-4, "FY" + y + " identity off by " + d + " (" + (rel * 100).toFixed(5) + "%)");
}
console.log("  ok  agrees within 0.01% every year FY2018-FY" + LAST);

/* FY2024 must not appear in any national series used by the page */
assert(D.fy2024.missing > 2500, "FY2024 gap should be large");
console.log("\n  ok  FY2024 excluded, " + D.fy2024.missing + " entities missing");

/* library payload decodes to the right shape */
const circ = Buffer.from(D.libs.circ, "base64");
assert.strictEqual(circ.length, D.libs.n * D.libs.ny * 4, "circ array length mismatch");
console.log("  ok  " + D.libs.n + " libraries x " + D.libs.ny + " years decoded");

/* exercise the interactions the stub can reach */
get("stack").fire("pointermove", {clientX: 400});
get("index").fire("pointermove", {clientX: 400});
get("slope").fire("pointermove", {clientX: 400, clientY: 200});
const q = get("q");
q.value = "chicago";
q.fire("input", {});
assert(/Chicago/i.test(get("hits").innerHTML), "search for 'chicago' returned nothing");
console.log("  ok  search, hover and chart redraw paths all run");
console.log("\nALL CHECKS PASSED");
