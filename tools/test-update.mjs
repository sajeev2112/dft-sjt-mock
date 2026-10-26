// Tests that site updates and reloads never lose progress or interrupt a quiz (run: node tools/test-update.mjs).
// Pulls the real functions out of docs/app.js and runs them against stand-ins for the browser's storage.
import fs from "node:fs";
import vm from "node:vm";
const src = fs.readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");
let pass = 0, fail = 0;
const check = (name, ok) => { if (ok) pass++; else { fail++; console.log("FAIL", name); } };

// 1. When the site may reload itself to install an update
const fn = src.match(/^function updateMayReload\(f\)\{.*\}$/m);
check("updateMayReload is a one-line function in app.js", !!fn);
const may = fn ? vm.runInNewContext(`(${fn[0]})`) : () => null;
const quiet = {view: "results", exam: false, mock: false, timer: false, building: false, typing: false, feedback: false, dialog: false};
for (const view of ["mocks", "results", "guide", "settings"]) check(`reloads on a quiet ${view} screen`, may({...quiet, view}) === true);
check("never reloads in Practice, even with nothing answered", may({...quiet, view: "practice"}) === false);
for (const k of ["exam", "mock", "timer", "building", "typing", "feedback", "dialog"]) check(`no reload when ${k}`, may({...quiet, [k]: true}) === false);
check("no reload on an unknown view", may({...quiet, view: "elsewhere"}) === false);

// 2. The update reload must not mark progress as changed (that made Sync see a false conflict) or call save()
const blk = src.slice(src.indexOf('if ("serviceWorker" in navigator'), src.indexOf("applyPlace(true);"));
check("update block found", blk.length > 500);
check("update block never calls save()", !/\bsave\(/.test(blk));
check("update reload writes with keepUnsaved()", /reloadNow = \(\) => \{[^}]*keepUnsaved\(\)/.test(blk));
check("Refresh now and a deferred update both use reloadNow", /addEventListener\("click", reloadNow\)/.test(blk) && /hashchange", \(\) => setTimeout\(reloadIfQuiet/.test(blk));
check("the backup is read before anything can overwrite it", /async function idbPut\(json\)\{ try \{ if \(idbFirst\) await idbFirst;/.test(src) && /^idbFirst = idbGet\(\);$/m.test(src) && /const backup = await idbFirst;/.test(src));
check("the freshest copy wins at start-up", /if \(b\.ts > \(S\.ts \|\| 0\)\)/.test(src));
check("page close keeps unsaved work and this tab's place", /addEventListener\("pagehide", \(\) => \{ clearTimeout\(idbTimer\); keepUnsaved\(\); keepPlace\(true\); \}\)/.test(src));

// 3. keepUnsaved / keepPlace / applyPlace against fake storage
const a = src.indexOf("// The timestamp of the copy in localStorage"), b = src.indexOf("\n}\n", src.indexOf("function applyPlace(")) + 3;
const helpers = a < 0 ? "" : src.slice(a, b);
check("storage helpers found", !!helpers);
function world(){
  const store = (m = new Map()) => ({getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k)});
  const set = (extra) => Object.assign({ans: {}, chk: {}, cur: 0, el: 0, marked: false}, extra);
  const ctx = {
    STORE: "dft-sjt-mock-v5", PAPER_IDS: ["p1", "p2"], localStorage: store(), sessionStorage: store(), timerOn: false, autoPausedSet: null, ui: {summary: false}, writes: 0, idb: 0,
    num: (v, max = 1e9) => { v = Number(v); return Number.isFinite(v) && v >= 0 && v <= max ? v : 0; },
    isMock: s => !!s && s.kind === "mock" && s.limit > 0,
    S: {ts: 100, view: "practice", setId: "custom", sets: {p1: set(), p2: set(), custom: set({list: [5, 9, 12], created: 777, kind: "mistakes"})}},
  };
  ctx.listOf = id => id === "custom" ? ctx.S.sets.custom.list : [0, 1, 2, 3, 4];
  ctx.persistAsIs = () => { ctx.writes++; ctx.localStorage.setItem(ctx.STORE, JSON.stringify(ctx.S)); };
  ctx.idbPut = () => { ctx.idb++; };
  vm.createContext(ctx); vm.runInContext(helpers || "function keepUnsaved(){} function keepPlace(){} function applyPlace(){}", ctx);
  return ctx;
}
{ const w = world(); w.localStorage.setItem(w.STORE, JSON.stringify({...w.S, ts: 150})); w.S.sets.custom.ans[5] = {p: [1]};
  vm.runInContext("keepUnsaved()", w);
  check("a tab holding an older copy than another tab saved writes nothing", w.writes === 0 && JSON.parse(w.localStorage.getItem(w.STORE)).ts === 150); }
{ const w = world(); w.localStorage.setItem(w.STORE, JSON.stringify(w.S)); w.S.sets.custom.el = 42;
  vm.runInContext("keepUnsaved()", w);
  check("unsaved seconds are written as the page closes", w.writes === 1 && JSON.parse(w.localStorage.getItem(w.STORE)).sets.custom.el === 42);
  check("...without marking progress as changed", w.S.ts === 100); }
{ const w = world(); w.localStorage.setItem(w.STORE, JSON.stringify(w.S));
  vm.runInContext("keepUnsaved()", w);
  check("an unchanged copy only refreshes the backup", w.writes === 0 && w.idb === 1); }
{ const w = world(); w.S.sets.custom.cur = 2; w.timerOn = true;
  vm.runInContext("keepPlace(true)", w);
  w.S.setId = "p2"; w.S.view = "results"; w.S.sets.custom.cur = 0; w.timerOn = false; // what another tab left in localStorage
  vm.runInContext("applyPlace(true)", w);
  check("a reload returns this tab to its own quiz and question", w.S.setId === "custom" && w.S.sets.custom.cur === 2 && w.S.view === "practice");
  check("a running practice clock carries over a reload", w.timerOn === true); }
{ const w = world(); vm.runInContext("keepPlace(true)", w);
  const p = JSON.parse(w.sessionStorage.getItem("dft-place")); p.run = true; p.at = Date.now() - 3600000; w.sessionStorage.setItem("dft-place", JSON.stringify(p));
  vm.runInContext("applyPlace(true)", w);
  check("an old clock flag (a later visit, not a reload) is ignored", w.timerOn === false); }
{ const w = world(); vm.runInContext("keepPlace()", w);
  w.S.sets.custom.created = 888; w.S.setId = "p1"; // another tab replaced the quiz
  vm.runInContext("applyPlace(true)", w);
  check("a place in a quiz that has since been replaced is ignored", w.S.setId === "p1"); }
{ const w = world(); w.sessionStorage.setItem("dft-place", JSON.stringify({setId: "__proto__", cur: 1})); w.S.setId = "p1";
  vm.runInContext("applyPlace(true)", w);
  check("a malformed place is ignored", w.S.setId === "p1"); }

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
