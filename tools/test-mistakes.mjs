// Tests the "Practise my mistakes" order and its rolling top-up (run: node tools/test-mistakes.mjs).
// Pulls the real functions out of docs/app.js: mistakeOrder and nextBatch (pure), plus normalise, mergeState and takeCopy
// to check that a quiz list that grows as it tops up survives a reload, a progress code, Sync and another tab's save.
import fs from "node:fs";
import vm from "node:vm";
const src = fs.readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");
let pass = 0, fail = 0;
const check = (name, ok) => { if (ok) pass++; else { fail++; console.log("FAIL", name); } };
const cut = (from, to) => { const a = src.indexOf(from), b = src.indexOf(to, a); if (a < 0 || b < 0) throw new Error("not found in app.js: " + from); return src.slice(a, b); };
const J = x => JSON.stringify(x);

const pure = cut("function mistakeOrder(att, now){", "function mistakesList(){");
const {mistakeOrder, nextBatch} = vm.runInNewContext(pure + ";({mistakeOrder, nextBatch})");
const DAY = 86400000, NOW = Date.UTC(2026, 9, 26, 12), ago = (d, h = 0) => NOW - d * DAY - h * 3600000;
const att = (...xs) => xs.map(([g, m, t]) => ({g, m, t}));

// ---------- the order ----------
{ const o = mistakeOrder({3: att([5, 20, ago(3)]), 30: att([5, 20, ago(30)]), 10: att([5, 20, ago(10)])}, NOW);
  check("oldest mistakes first", J(o) === J([30, 10, 3])); }
{ const o = mistakeOrder({1: att([0, 20, ago(0, 1)]), 2: att([18, 20, ago(2)]), 3: att([0, 12, ago(0, 20)])}, NOW);
  check("a mistake from the last 24 hours comes after older ones, even if it lost more marks", J(o) === J([2, 3, 1])); }
check("the last 24 hours go strictly by time, so the question just got wrong is at the very bottom", J(mistakeOrder({1: att([18, 20, ago(0, 10)]), 2: att([0, 20, ago(0, 0)]), 3: att([0, 12, ago(0, 5)])}, NOW)) === J([1, 3, 2]));
{ const o = mistakeOrder({1: att([16, 20, ago(5, 1)]), 2: att([4, 20, ago(5, 3)]), 3: att([8, 12, ago(5, 2)])}, NOW);
  check("same day: the bigger share of marks lost first", J(o) === J([2, 3, 1])); } // 80%, 67%, 20% lost
{ const o = mistakeOrder({1: att([10, 20, ago(9)], [10, 20, ago(5, 5)]), 2: att([10, 20, ago(9)], [10, 20, ago(8)], [10, 20, ago(5, 1)]), 3: att([20, 20, ago(9)], [10, 20, ago(5, 9)])}, NOW);
  check("same day and same loss: the question wrong more often first", J(o) === J([2, 1, 3])); }
{ const o = mistakeOrder({7: att([10, 20, ago(4, 2)]), 5: att([10, 20, ago(4, 2)]), 6: att([10, 20, ago(4, 6)])}, NOW);
  check("then the earlier attempt, then the lower question number", J(o) === J([6, 5, 7])); }
{ const a = {}; for (let i = 0; i < 40; i++) a[i] = att([i % 7, i % 2 ? 12 : 20, ago(i % 9, i % 5)]);
  const b = {}; for (const k of Object.keys(a).reverse()) b[k] = a[k];
  const o = mistakeOrder(a, NOW);
  check("deterministic: same answer twice and whatever order the questions were saved in", J(o) === J(mistakeOrder(a, NOW)) && J(o) === J(mistakeOrder(b, NOW)));
  check("the input is not changed", J(a[3]) === J(att([3, 12, ago(3, 3)]))); }
{ const o = mistakeOrder({0: [], 1: undefined, 2: "x", 3: null, abc: att([0, 20, ago(2)]), "-1": att([0, 20, ago(2)]), 4: att([0, 20, ago(2)])}, NOW);
  check("questions never attempted (or junk) are left out", J(o) === J([4])); }
check("no attempts at all: nothing to practise", J(mistakeOrder({}, NOW)) === "[]" && J(mistakeOrder(null, NOW)) === "[]" && J(mistakeOrder(undefined, NOW)) === "[]");
{ const o = mistakeOrder({1: [{t: ago(2)}], 2: [{g: 5, m: 12}], 3: [null], 4: [{g: 20}], 5: [{g: 12, m: 12, t: ago(1)}], 6: [{g: 3, m: 20, t: ago(1)}]}, NOW);
  check("missing fields: no score = lost marks, no time = long ago, no maximum = 20", J(o) === J([3, 2, 1, 6])); }
{ const o = mistakeOrder({1: att([5, 20, ago(20)], [20, 20, ago(1)]), 2: att([20, 20, ago(20)], [5, 20, ago(1)]), 3: att([4, 12, ago(20)], [12, 12, ago(19)], [8, 12, ago(2)])}, NOW);
  check("a mistake later answered correctly drops out; a right answer later got wrong is back in", J(o) === J([3, 2])); }
check("a time in the future (another device's clock) counts as recent", J(mistakeOrder({1: att([0, 20, NOW + 5 * DAY]), 2: att([0, 20, ago(1)])}, NOW)) === J([2, 1]));
{ const a = {}; for (let i = 0; i < 5000; i++) a[i] = Array.from({length: 5}, (_, j) => ({g: (i * 7 + j) % 21, m: 20, t: ago((i * 13) % 400, j)}));
  const t0 = Date.now(), o = mistakeOrder(a, NOW), ms = Date.now() - t0;
  const want = Object.keys(a).filter(k => a[k][4].g < 20).length;
  let sorted = true; const day = i => Math.floor((NOW - a[i][4].t) / DAY);
  for (let k = 1; k < o.length; k++) if (day(o[k]) > day(o[k - 1])) sorted = false;
  check("thousands of questions x 5 attempts: every mistake once, oldest days first, quickly", o.length === want && new Set(o).size === o.length && sorted && ms < 1000); }

// ---------- topping up ----------
check("next batch: skips what is already queued, keeps the order, stops at n", J(nextBatch([9, 4, 7, 1, 3, 8], [4, 1], 3)) === J([9, 7, 3]));
check("next batch: nothing left gives nothing", J(nextBatch([4, 1], [1, 4], 5)) === "[]" && J(nextBatch([], [], 5)) === "[]");
check("next batch: questions answered in this quiz and still wrong may come round again", J(nextBatch([9, 4, 7, 1], [4, 1, 7], 5, [1, 4])) === J([9, 4, 1]));
{ // the real topUp, driven the way the Check and Next buttons drive it
  const roll = cut("function mistakeOrder(att, now){", '// "Finish for now"');
  const R = {S: {att: {}}, isQi: i => Number.isInteger(i) && i >= 0 && i < 1000, Date: {now: () => R.now}, now: NOW};
  vm.createContext(R); vm.runInContext(roll + ";globalThis.X = {topUp, upNext, rollLeft, mistakesList, ROLL};", R);
  const X = R.X, a = R.S.att;
  for (let i = 0; i < 12; i++) a[i] = att([5, 20, ago(30 - i)]); // question 0 is the oldest mistake, 11 the newest
  a[50] = att([20, 20, ago(40)]); // got right long ago: not a mistake
  const set = {list: X.mistakesList().slice(0, X.ROLL), cur: 0, ans: {}, chk: {}, kind: "mistakes", marked: false};
  check("a round starts with the 5 oldest mistakes", J(set.list) === J([0, 1, 2, 3, 4]));
  // answer the question on screen: right (full marks) for 1, 2, 4, 5, ...; wrong again (below full marks) for 0 and 3
  const answer = (right) => { const qi = set.list[set.cur]; R.now += 60000; set.ans[qi] = {p: [0, 1, 2]}; set.chk[qi] = true; a[qi].push({g: right ? 20 : 12, m: 20, t: R.now}); };
  const next = () => { if (set.cur >= set.list.length - 1) { if (!X.topUp(set)) return false; } set.cur++; return true; }; // Next at the end tops up, or finishes
  const seen = []; let snap = null;
  for (let n = 0; n < 40; n++) { const qi = set.list[set.cur]; seen.push(qi); answer(!(qi === 0 || qi === 3) || seen.filter(x => x === qi).length > 1); if (qi === 3 && !snap) snap = X.mistakesList(); if (!next()) break; }
  check("a perfect answer clears the mistake: it is never brought back", seen.filter(x => x === 1).length === 1 && !X.mistakesList().includes(1));
  check("an imperfect answer keeps it as a mistake, moved to the bottom of the order", snap && J(snap) === J([4, 5, 6, 7, 8, 9, 10, 11, 0, 3]));
  check("...and it comes round again in the same session, after every older mistake", J(seen) === J([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 3]));
  check("topping up then stops when no mistakes are left, and the list holds each question once", X.mistakesList().length === 0 && new Set(set.list).size === set.list.length && set.list.length === 12);
  check("a question coming round again is cleared to answer afresh at the end of the quiz", J(set.list.slice(-2)) === J([0, 3]) && set.chk[0] && set.chk[3]); }
{ // never straight away: the question just got wrong is not repeated next, even when it is the only mistake left
  const R = {S: {att: {7: att([5, 20, ago(9)])}}, isQi: () => true, Date: {now: () => NOW}};
  vm.createContext(R); vm.runInContext(cut("function mistakeOrder(att, now){", '// "Finish for now"') + ";globalThis.X = {topUp};", R);
  const set = {list: [7], cur: 0, ans: {7: {p: [1, 2, 3]}}, chk: {7: true}}; R.S.att[7].push({g: 4, m: 12, t: NOW});
  check("the only mistake left, just got wrong again: no top-up (it waits for the next round)", R.X.topUp(set) === 0 && J(set.list) === "[7]");
  set.list = [7, 9]; set.cur = 1; set.chk[9] = true; R.S.att[9] = att([0, 20, NOW - 1000]);
  check("...but once another question has been answered after it, it comes back", R.X.topUp(set) === 1 && J(set.list) === J([9, 7]) && !set.chk[7] && set.chk[9] && set.cur === 0); }

// ---------- a growing quiz list survives saving, Sync and other tabs ----------
const Q = Array.from({length: 288}, (_, i) => ({t: i % 2 ? "best3" : "rank"}));
const ctx = {Q, crypto: globalThis.crypto, console, location: {protocol: "https:", hostname: "example.org"}, window: {addEventListener(){}, matchMedia: null}, document: {querySelector: () => null, addEventListener(){}}};
vm.createContext(ctx);
vm.runInContext(cut('"use strict";', "const ui0") + cut("function takeCopy(n){", "// A tab that was asleep") + ";globalThis.T = {normalise, mergeState, fresh, newSet, takeCopy, get S(){ return S; }, set S(v){ S = v; }};", ctx);
const T = ctx.T;
const quiz = (list, extra) => T.newSet(Object.assign({name: "My mistakes", kind: "mistakes", list, created: 777}, extra));
{ const s = T.fresh(), all = Q.map((_, i) => i); s.sets.custom = quiz(all.slice().reverse()); s.setId = "custom"; s.sets.custom.cur = 250;
  all.forEach(i => { s.sets.custom.ans[i] = i % 2 ? {p: [0, 1, 2]} : {ord: [0, 1, 2, 3, 4], set: true}; s.sets.custom.chk[i] = true; });
  const n = T.normalise(JSON.parse(JSON.stringify(s)));
  check("a rolling list as long as the whole bank survives a reload / progress code", n.sets.custom && n.sets.custom.list.length === 288 && n.sets.custom.list[0] === 287 && Object.keys(n.sets.custom.chk).length === 288 && n.sets.custom.cur === 250 && n.sets.custom.kind === "mistakes"); }
{ const old = T.fresh(); old.sets.custom = quiz([10, 20, 30, 40, 50], {cur: 4}); old.setId = "custom"; old.ts = 1000;
  const grew = JSON.parse(JSON.stringify(old)); grew.sets.custom.list.push(60, 70); grew.sets.custom.ans[60] = {ord: [4, 3, 2, 1, 0], set: true}; grew.sets.custom.chk[60] = true; grew.sets.custom.cur = 5; grew.ts = 2000;
  const m = T.mergeState(old, grew);
  check("merge: the topped-up copy's longer list is kept with its answers", J(m.sets.custom.list) === J([10, 20, 30, 40, 50, 60, 70]) && m.sets.custom.chk[60]);
  const m2 = T.mergeState(grew, old);
  check("merge either way round gives the same list", J(m2.sets.custom.list) === J(m.sets.custom.list));
  check("...and each copy stays on the question it was on", m.sets.custom.cur === 4 && m2.sets.custom.cur === 5); }
{ const base = T.fresh(); base.sets.custom = quiz([1, 2, 3, 4, 5]); base.setId = "custom";
  const a = JSON.parse(JSON.stringify(base)), b = JSON.parse(JSON.stringify(base));
  a.sets.custom.list.push(7, 9); a.sets.custom.ans[9] = {p: [1, 2, 3]}; a.sets.custom.chk[9] = true; a.sets.custom.cur = 6; a.ts = 3000;
  b.sets.custom.list.push(8, 7); b.sets.custom.ans[8] = {ord: [1, 0, 2, 3, 4], set: true}; b.sets.custom.chk[8] = true; b.sets.custom.cur = 5; b.ts = 2000;
  const m = T.mergeState(b, a);
  check("merge: two devices that topped up differently keep every question and answer, once each", J(m.sets.custom.list) === J([1, 2, 3, 4, 5, 7, 9, 8]) && m.sets.custom.chk[8] && m.sets.custom.chk[9]);
  check("...and this device stays on its question (8), not on the same position in the other list", m.sets.custom.list[m.sets.custom.cur] === 8);
  T.S = T.normalise(a); T.S.sets.custom.cur = 6; T.S.view = "practice"; const held = T.S.sets.custom;
  T.takeCopy(T.normalise(JSON.parse(JSON.stringify(m))));
  check("another tab's combined copy: this tab keeps the question it is on and the same set object", T.S.sets.custom === held && T.S.sets.custom.list[T.S.sets.custom.cur] === 9 && T.S.sets.custom.list.length === 8); }
{ const o = T.fresh(); o.sets.custom = quiz(Array.from({length: 20}, (_, i) => i * 3), {cur: 19}); o.sets.custom.kind = "mistakes";
  const n = T.normalise(JSON.parse(JSON.stringify(o)));
  check("an older fixed 20-question My mistakes quiz loads as a mistakes quiz that can grow", n.sets.custom.kind === "mistakes" && n.sets.custom.list.length === 20 && !n.sets.custom.marked); }

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
