// Tests the welcome tour (run: node tools/test-tour.mjs).
// Pulls the real tour code out of docs/app.js: when it may start by itself, the "seen" flag, that every step points at an
// element the site really draws, and that finishing or skipping puts you back where you were without saving, syncing,
// counting a visit or touching the address bar. Runs against stand-ins for the page; nothing live is touched.
import fs from "node:fs";
import vm from "node:vm";
const read = f => fs.readFileSync(new URL("../docs/" + f, import.meta.url), "utf8");
const src = read("app.js"), html = read("index.html"), design = read("design.js");
let pass = 0, fail = 0;
const check = (name, ok) => { if (ok) pass++; else { fail++; console.log("FAIL", name); } };
const cut = (from, to) => { const a = src.indexOf(from), b = src.indexOf(to, a); if (a < 0 || b < 0) throw new Error("not found in app.js: " + from); return src.slice(a, b); };

// ---------- when it may start by itself ----------
const line = name => (src.match(new RegExp(`^function ${name}\\(.*\\}$`, "m")) || [""])[0];
const {tourMayStart} = vm.runInNewContext(line("updateMayReload") + "\n" + line("tourMayStart") + ";({tourMayStart})");
const quiet = {view: "results", exam: false, mock: false, timer: false, building: false, typing: false, feedback: false, dialog: false, seen: false, update: false, idle: false};
for (const view of ["mocks", "results", "guide", "settings"]) check(`starts on a quiet ${view} screen`, tourMayStart({...quiet, view}) === true);
check("starts in Practice with nothing under way", tourMayStart({...quiet, view: "practice", idle: true}) === true);
check("not in Practice mid-question, in a quiz or an exam-mode paper", tourMayStart({...quiet, view: "practice", idle: false}) === false);
check("never twice: not once seen", tourMayStart({...quiet, seen: true}) === false);
check("not when this browser can't store the seen flag", tourMayStart({...quiet, seen: null}) === false);
check("not over the update banner", tourMayStart({...quiet, update: true}) === false);
for (const k of ["exam", "mock", "timer", "building", "typing", "feedback", "dialog"]) {
  check(`not when ${k}`, tourMayStart({...quiet, [k]: true}) === false);
  check(`not when ${k}, even in an idle Practice`, tourMayStart({...quiet, view: "practice", idle: true, [k]: true}) === false);
}
check("not on an unknown view", tourMayStart({...quiet, view: "elsewhere", idle: true}) === false);
check("an open tour counts as a dialog, so an update never reloads under it", /const quietFacts = [\s\S]*?\.sp-go:disabled, \.tour"\)/.test(src));
check("the update reload still uses the same quiet check", /updateMayReload\(quietFacts\(\)\)/.test(src));
check("auto-start only when the flag is readable and unset, after a delay", /if \(tourSeen\(\) === false\) \{\s*const wait = setInterval\(/.test(src) && /visibilityState === "visible" && tourMayStart\(tourFacts\(\)\)/.test(src));

// ---------- the seen flag ----------
const seenFn = line("tourSeen");
const seenWith = ls => vm.runInNewContext(`const TOUR_KEY = "dft-tour";\n${seenFn}\ntourSeen()`, {localStorage: ls});
const mem = v => ({getItem: k => k === "dft-tour" ? v : null});
check("seen: not yet", seenWith(mem(null)) === false);
check("seen: finished or skipped", seenWith(mem("1")) === true);
check("seen: storage blocked gives null", seenWith({getItem: () => { throw new Error("blocked"); }}) === null);
check("the flag is not in synced progress", !/S\.tour\b|tour:\s*S\./.test(src) && !/"dft-tour"/.test(src.slice(src.indexOf("function normalise"), src.indexOf("function normalise") + 6000)));

// ---------- the steps point at real elements ----------
const steps = vm.runInNewContext(cut("const tourTab = ", "// true / false, or null") + ";TOUR");
const VIEWS = ["practice", "mocks", "results", "guide", "settings"];
check("6 or 7 steps", steps.length >= 6 && steps.length <= 7);
check("every step has a short title and text", steps.every(s => s.t && s.b && s.t.length <= 40 && s.b.length <= 220));
check("every step's view is a real view (or stays put)", steps.every(s => s.v === null || VIEWS.includes(s.v)));
check("covers every tab, Sync, My mistakes, Explain my mistake and the countdown",
  VIEWS.every(v => steps.some(s => s.v === v)) && steps.some(s => s.at.includes("#syncbtn")) && steps.some(s => /My mistakes/.test(s.b) && /Explain my mistake/.test(s.b)) && steps.some(s => /countdown/.test(s.b)));
check("UK spelling", !steps.some(s => /\b(color|practicing|favorite|center)\b/i.test(s.t + s.b)));
const all = html + src + design;
const exists = sel => {
  const id = sel.match(/#([\w-]+)/), cls = [...sel.matchAll(/\.([\w-]+)/g)].map(m => m[1]), v = sel.match(/data-v="(\w+)"/);
  if (id && !new RegExp(`id="${id[1]}"`).test(all)) return false;
  if (cls.some(c => !new RegExp(`class(Name)?\\s*=\\s*"[^"]*\\b${c}\\b`).test(all))) return false;
  if (v && !(new RegExp(`data-v="${v[1]}"`).test(html) && design.includes(`"${v[1]}"`))) return false;
  return true;
};
steps.forEach((s, i) => s.at.forEach(sel => check(`step ${i + 1}: ${sel} exists in index.html, app.js or design.js`, exists(sel))));
check("the countdown step's box is drawn on the Progress page", /class="pgoal"/.test(src) && steps.find(s => s.at.includes(".pgoal")).v === "results");
check("the exam date field sits in that box", /<div class="pgoal">[\s\S]*?id="examdate"/.test(cut("function todayHtml(", "function themesHtml(")));
check("Settings and the Guide can reopen it", (src.match(/data-act="tour"/g) || []).length >= 2 && /case "tour": startTour\(\); break;/.test(src));

// ---------- start, move, finish, skip: nothing saved, nothing counted, you're put back ----------
const code = cut("let tour = null;", "// First visit after this release");
check("the tour never saves, syncs, counts a visit, sends anything or touches the address bar",
  !/\bsave\(|scheduleSync|countVisit|fetch\(|sendBeacon|location\.|history\.|S\.att|S\.ts/.test(code));
function page(view = "guide", store = new Map()){
  class El {
    constructor(tag = "DIV"){ this.tagName = tag; this.style = {}; this.dataset = {}; this.hidden = false; this.inert = false; this.isConnected = true; this.q = {}; this.on = {}; this.textContent = ""; this.offsetWidth = 320; this.offsetHeight = 140; }
    set innerHTML(v){ this._html = v; } get innerHTML(){ return this._html; }
    querySelector(s){ return this.q[s] || (this.q[s] = new El()); }
    querySelectorAll(){ return []; }
    addEventListener(t, f){ this.on[t] = f; }
    remove(){ this.isConnected = false; ctx.removed++; }
    focus(){ ctx.document.activeElement = this; }
    click(){ if (this.onclick) this.onclick(); }
    getClientRects(){ return [1]; }
    getBoundingClientRect(){ return {left: 20, top: 700, right: 100, bottom: 740, width: 80, height: 40}; }
    scrollIntoView(){} closest(){ return null; }
  }
  const body = new El("BODY"), wrap = new El(), bar = new El(), script = new El("SCRIPT"), prev = new El("BUTTON");
  body.children = [wrap, bar, script];
  body.appendChild = e => body.children.push(e);
  const ctx = {
    TOUR: steps, removed: 0, renders: [], persisted: 0, scrolled: null,
    S: {view, ts: 5}, ui: {citeFrom: view === "guide" ? 2 : null},
    render(){ ctx.renders.push(ctx.S.view); }, persistAsIs(){ ctx.persisted++; }, renderCiteBack(){},
    getComputedStyle: () => ({position: "static"}), setTimeout: f => f(),
    localStorage: {getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v))},
    window: {scrollY: 420, innerHeight: 800, scrollTo(a, b){ ctx.scrolled = typeof a === "object" ? a.top : b; }, addEventListener(){}, removeEventListener(){}},
    document: {body, activeElement: prev, documentElement: {clientWidth: 390},
      createElement: t => new El(t.toUpperCase()), querySelector: () => new El(),
      querySelectorAll: s => s === "[data-tour-inert]" ? body.children.filter(c => c.dataset.tourInert) : []},
  };
  ctx.TOUR_KEY = "dft-tour"; ctx.prev = prev; ctx.wrap = wrap; ctx.script = script;
  vm.createContext(ctx); vm.runInContext(code.replace("let tour = null;", "var tour = null;"), ctx);
  return ctx;
}
{ const p = page("guide"); vm.runInContext("startTour()", p);
  check("starts on step 1 and switches to its tab", p.tour.i === 0 && p.S.view === "practice");
  check("the page behind is made unreachable (not scripts)", p.wrap.inert === true && p.script.inert === false);
  check("focus moves into the card", p.document.activeElement === p.tour.el.querySelector(".tour-next"));
  vm.runInContext("startTour()", p); check("pressing it twice doesn't open two tours", p.tour.i === 0);
  const next = p.tour.el.querySelector(".tour-next");
  for (let i = 1; i < steps.length; i++) next.click();
  check("Next walks every step in order", p.tour.i === steps.length - 1 && p.tour.el.querySelector(".tour-next").textContent === "Done");
  check("each tab is drawn on the way", VIEWS.every(v => p.renders.includes(v)));
  check("moving between steps saves nothing", p.persisted === 0);
  check("Back goes back a step", (vm.runInContext("tourStep(tour.i - 1); tour.i", p)) === steps.length - 2);
  vm.runInContext("tourStep(tour.i + 1)", p); const el = p.tour.el; next.click();
  check("Done closes it", p.tour === null && el.isConnected === false);
  check("...and you're back on your tab, scroll and citation", p.S.view === "guide" && p.scrolled === 420 && p.ui.citeFrom === 2 && p.renders.at(-1) === "guide");
  check("...saved as a tab press would be (no new answers)", p.persisted === 1 && p.S.ts === 5);
  check("...with focus back where it was", p.document.activeElement === p.prev);
  check("...the page usable again", p.wrap.inert === false && !p.wrap.dataset.tourInert);
  check("...and it won't start by itself again", p.localStorage.getItem("dft-tour") === "1"); }
{ const p = page("practice"); vm.runInContext("startTour(); tourStep(3)", p);
  check("skipping mid-way", p.S.view === "results");
  p.tour.el.querySelector(".tour-skip").click();
  check("skip puts you back and marks it seen", p.tour === null && p.S.view === "practice" && p.localStorage.getItem("dft-tour") === "1"); }
{ const p = page("settings"); vm.runInContext("startTour(); tourStep(" + (steps.length - 2) + "); tourStep(" + (steps.length - 1) + ")", p); const r = p.renders.length; // Settings, then Sync (stays put)
  vm.runInContext("endTour()", p);
  check("ending on the tab you started from doesn't redraw or save it again", p.renders.length === r && p.persisted === 0 && p.S.view === "settings"); }
{ const p = page("results"); p.localStorage.setItem = () => { throw new Error("blocked"); };
  let ok = true; try { vm.runInContext("startTour(); endTour()", p); } catch(e) { ok = false; }
  check("works without storage", ok && p.tour === null && p.S.view === "results"); }
{ const p = page("mocks"); vm.runInContext("startTour()", p);
  const key = k => { let stopped = false; p.tour.el.on.keydown({key: k, shiftKey: false, preventDefault(){}, stopPropagation(){ stopped = true; }}); return stopped; };
  check("→ moves on", key("ArrowRight") && p.tour.i === 1);
  check("← moves back, and not before step 1", key("ArrowLeft") && p.tour.i === 0 && key("ArrowLeft") && p.tour.i === 0);
  check("other keys are left alone", key("x") === false);
  key("Escape"); check("Esc skips and puts you back", p.tour === null && p.S.view === "mocks" && p.localStorage.getItem("dft-tour") === "1"); }

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
