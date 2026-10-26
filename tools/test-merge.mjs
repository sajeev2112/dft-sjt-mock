// Tests that two copies of progress are combined without losing answers (run: node tools/test-merge.mjs).
// Pulls the real functions out of docs/app.js: mergeState (used by "Combine both" in the Sync panel and when a tab that
// missed another tab's saves writes), and save / catchUp / takeCopy against a stand-in localStorage shared by two "tabs".
import fs from "node:fs";
import vm from "node:vm";
const src = fs.readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");
let pass = 0, fail = 0;
const check = (name, ok) => { if (ok) pass++; else { fail++; console.log("FAIL", name); } };
const cut = (from, to) => { const a = src.indexOf(from), b = src.indexOf(to, a); if (a < 0 || b < 0) throw new Error("not found in app.js: " + from); return src.slice(a, b); };

const Q = Array.from({length: 256}, (_, i) => ({t: i % 2 ? "best3" : "rank"})); // odd = choose three, even = ranking
const head = cut('"use strict";', "const ui0"); // PAPERS ... normalise, mergeState
const store = cut("let storageOk", "// Which view, set and question"); // save, persistAsIs, storedTs, keepUnsaved
const wake = cut("// The copy in localStorage, if another tab", "// Re-rendering rebuilds forms"); // unseenCopy, takeCopy, catchUp
const memStorage = (m = new Map()) => ({getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k)});

// One browser tab running the real code. Tabs made with the same localStorage share it, as real tabs do.
function tab(localStorage){
  const ctx = {Q, localStorage, location: {protocol: "https:", hostname: "example.org"}, crypto: globalThis.crypto, console,
    window: {addEventListener(){}, matchMedia: null}, document: {querySelector: () => null, addEventListener(){}}, renders: 0, setTimeout, clearTimeout};
  vm.createContext(ctx);
  vm.runInContext(head + store + wake + `
    var pendingRender = false; function render(){ globalThis.renders++; } function busyTyping(){ return false; }
    function idbPut(){} function keepPlace(){} function scheduleSync(){}
    try { const raw = localStorage.getItem(STORE); if (raw) S = normalise(JSON.parse(raw)); } catch(e) {}
    knownTs = storedTs();
    globalThis.T = {mergeState, normalise, fresh, save, persistAsIs, catchUp, get S(){ return S; }, set S(v){ S = v; }};`, ctx);
  return ctx.T;
}
const T = tab(memStorage()), {mergeState, normalise} = T;
const paperOf = qi => "p" + (Math.floor(qi / 32) + 1);
// Answer and check a question the way the Check answer button does.
function answer(s, qi, t = Date.now(), g = 10){
  const set = s.sets[paperOf(qi)];
  set.ans[qi] = qi % 2 ? {p: [0, 1, 2]} : {ord: [4, 3, 2, 1, 0], set: true}; set.chk[qi] = true;
  (s.att[qi] = s.att[qi] || []).push({g, m: qi % 2 ? 12 : 20, t});
  return s;
}
const answered = s => Object.keys(s.att).map(Number).sort((a, b) => a - b);
const state = (ts, ...qs) => { const s = T.fresh(); qs.forEach((q, i) => answer(s, q, ts - 100 + i)); s.ts = ts; return s; };
const J = x => JSON.stringify(x);

// ---------- mergeState ----------
{ const a = state(1000, 0, 1), b = state(2000, 32, 33, 34), m = mergeState(a, b);
  check("answers made in either copy are all kept", J(answered(m)) === J([0, 1, 32, 33, 34]));
  check("...including the answers themselves, checked", m.sets.p1.chk[1] && m.sets.p2.chk[34] && m.sets.p2.ans[32].ord.length === 5);
  check("the combined copy is as new as the newer one", m.ts === 2000);
  check("inputs are not changed", J(answered(a)) === J([0, 1]) && J(answered(b)) === J([32, 33, 34])); }
{ const a = T.fresh(), b = T.fresh();
  answer(a, 3, 500); a.sets.p1.ans[3] = {p: [5, 6, 7]}; a.ts = 600;
  answer(b, 3, 900); b.ts = 300; // the older copy holds the more recent attempt
  const m = mergeState(a, b);
  check("a question checked in both copies keeps the more recently checked answer", J(m.sets.p1.ans[3].p) === J([0, 1, 2]));
  check("...and both attempts", m.att[3].length === 2 && m.att[3][1].t === 900); }
{ const a = state(100, 5), b = T.fresh(); b.sets.p1.ans[5] = {p: [7]}; b.ts = 999; // newer copy has only an unchecked draft
  const m = mergeState(a, b);
  check("a checked answer beats a newer unchecked draft", m.sets.p1.chk[5] && J(m.sets.p1.ans[5].p) === J([0, 1, 2])); }
{ const a = state(100), b = T.fresh(); a.sets.p1.ans[7] = {p: [1]}; b.sets.p1.ans[7] = {p: [2, 3]}; b.ts = 200;
  check("two unchecked drafts: the newer copy's is kept", J(mergeState(a, b).sets.p1.ans[7].p) === J([2, 3])); }
{ const a = state(100, 9), b = state(200, 9); a.att[9] = [1, 2, 3, 4].map(t => ({g: 1, m: 12, t})); b.att[9] = [3, 4, 5, 6].map(t => ({g: 1, m: 12, t}));
  const m = mergeState(a, b);
  check("attempts are joined without duplicates and capped at 5", J(m.att[9].map(x => x.t)) === J([2, 3, 4, 5, 6])); }
{ const a = state(100), b = state(200);
  a.days["2026-10-20"] = {g: 40, m: 60, n: 5}; b.days["2026-10-20"] = {g: 10, m: 20, n: 1}; b.days["2026-10-21"] = {g: 4, m: 12, n: 1};
  a.flags[3] = 1; b.flags[40] = 1; a.sent[3] = 1; b.fb[40] = 1;
  a.hist = [{t: 1, name: "Paper 1", g: 1, m: 2, n: 1, total: 32}]; b.hist = [{t: 1, name: "Paper 1", g: 1, m: 2, n: 1, total: 32}, {t: 2, name: "Paper 2", g: 1, m: 2, n: 1, total: 32}];
  a.share = true; b.share = false; a.cid = "aaaaaaaa-1"; b.cid = "bbbbbbbb-2"; a.setId = "p3"; a.view = "results";
  a.outbox = [{q: 4, a: "012"}]; b.outbox = [{q: 4, a: "012"}, {q: 41, a: "01234"}];
  const m = mergeState(a, b);
  check("a day's score keeps the fuller count", m.days["2026-10-20"].n === 5 && m.days["2026-10-21"].n === 1);
  check("flags, sent and feedback marks are joined", m.flags[3] && m.flags[40] && m.sent[3] && m.fb[40]);
  check("history is joined without duplicates", m.hist.length === 2);
  check("outbox is joined without duplicates", m.outbox.length === 2);
  check("plain settings come from the newer copy", m.share === false);
  check("this browser's code and place are kept", m.cid === "aaaaaaaa-1" && m.setId === "p3" && m.view === "results"); }
{ const mk = (created, marked) => ({name: "Timed mock", kind: "mock", list: [0, 1, 2], created, limit: 6300, marked, started: true, ans: {}, chk: {}});
  const a = state(100), b = state(200);
  a.sets.custom = mk(10, true); a.mocks = [mk(1, true), mk(2, true)];
  b.sets.custom = mk(20, false); b.mocks = [mk(2, true), mk(3, true)];
  const m = mergeState(a, b);
  check("the more recently built quiz stays current", m.sets.custom.created === 20);
  check("every finished mock from both copies is kept (no cap), including one the other copy replaced", J(m.mocks.map(x => x.created)) === J([1, 2, 3, 10])); }
{ const a = state(100), b = state(200);
  a.sets.custom = {name: "Quick 10", kind: "quick", list: [0, 1, 2, 3], created: 5, ans: {0: {ord: [0, 1, 2, 3, 4], set: true}}, chk: {0: true}, cur: 3, el: 50};
  b.sets.custom = {name: "Quick 10", kind: "quick", list: [0, 1, 2, 3], created: 5, ans: {1: {p: [1, 2, 3]}}, chk: {1: true}, cur: 0, el: 80};
  const m = mergeState(a, b);
  check("the same quiz in both copies is combined", m.sets.custom.chk[0] && m.sets.custom.chk[1] && m.sets.custom.el === 80 && m.sets.custom.cur === 3); }

// idempotent, never reduces the answered count, survives junk
{ const a = state(1000, 0, 1, 40), b = state(2000, 1, 32, 200);
  const m = mergeState(a, b);
  check("combining a copy with itself changes nothing", J(mergeState(a, a)) === J(normalise(a)));
  check("combining again with the same copy changes nothing", J(mergeState(m, b)) === J(m) && J(mergeState(m, a)) === J(m) && J(mergeState(m, m)) === J(m)); }
let seed = 7; const rnd = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
let fuzzOk = true, idemOk = true;
for (let i = 0; i < 300; i++) {
  const mk = () => { const s = T.fresh(); s.ts = rnd(5000); for (let k = rnd(30); k > 0; k--) answer(s, rnd(256), rnd(5000), rnd(20)); for (let k = rnd(5); k > 0; k--) { const q = rnd(256); s.sets[paperOf(q)].ans[q] = q % 2 ? {p: [rnd(8)]} : {ord: [0, 1, 2, 3, 4], set: false}; } return s; };
  const a = mk(), b = mk(), m = mergeState(a, b);
  const all = new Set([...answered(normalise(a)), ...answered(normalise(b))]);
  if (answered(m).length < all.size || ![...all].every(q => m.att[q] && m.sets[paperOf(q)].ans[q])) fuzzOk = false;
  if (J(mergeState(m, b)) !== J(m) || J(mergeState(m, a)) !== J(m)) idemOk = false;
}
check("300 random pairs: every question answered in either copy is still answered", fuzzOk);
check("300 random pairs: combining is idempotent", idemOk);
{ let ok = true;
  for (const [x, y] of [[null, undefined], ["x", 5], [[], {}], [{sets: "bad", att: [1, 2], ts: -5}, {att: {"__proto__": [1], "-1": [{}], "999": [{}], "3": "no"}, sets: {p1: {ans: {3: "junk", 4: {ord: [9, 9]}}, chk: null}}, mocks: "no", hist: [null, 3], days: {"bad": {}}}],
    [{ts: 1e20, sets: {custom: {list: "x"}}}, {plan: {plan: {overview: 5}}, outbox: [{q: "x"}], flags: {"abc": 1}}]]) {
    try { const m = mergeState(x, y); if (!m.sets.p1 || !Array.isArray(m.mocks) || Object.keys(m.att).length || m.ts < 0) ok = false; } catch(e) { ok = false; console.log(e); }
  }
  check("malformed copies are cleaned, not trusted, and don't throw", ok);
  const good = state(100, 0, 1), m = mergeState(good, {sets: {p1: {ans: {0: "junk"}, chk: {0: false}}}, ts: 999});
  check("...and never cost the good copy its answers", J(answered(m)) === J([0, 1]) && m.sets.p1.chk[0]); }

// ---------- two tabs sharing one localStorage (the stale-tab problem) ----------
{ const ls = memStorage(), A = tab(ls);
  answer(A.S, 0); A.save();
  const B = tab(ls); // opened after A's first answer
  for (const q of [32, 33, 34]) { answer(B.S, q); B.save(); }
  answer(A.S, 1); A.save(); // A was asleep and never heard B's saves
  const s = JSON.parse(ls.getItem("dft-sjt-mock-v5"));
  check("a tab that missed another tab's saves keeps them when it saves", J(answered(s)) === J([0, 1, 32, 33, 34]));
  check("...and its own copy now has them too", J(answered(A.S)) === J([0, 1, 32, 33, 34]));
  check("...saved as the newest copy", s.ts > B.S.ts);
  check("a reload of either tab has everything", J(answered(tab(ls).S)) === J([0, 1, 32, 33, 34])); }
{ const ls = memStorage(), A = tab(ls); answer(A.S, 0); A.save();
  const B = tab(ls); answer(B.S, 40); B.save(); A.S.sets.p1.cur = 7;
  A.catchUp(true);
  check("waking up takes the other tab's newer copy", J(answered(A.S)) === J([0, 40]));
  check("...but keeps this tab's own question", A.S.sets.p1.cur === 7); }
{ const ls = memStorage(), A = tab(ls); answer(A.S, 0); answer(A.S, 2); A.save();
  const B = tab(ls); delete B.S.sets.p1.ans[2]; delete B.S.sets.p1.chk[2]; B.save(); // "Try again" on question 3 in the other tab
  A.S.sets.p1.el += 5; A.save(false, true); // the practice clock ticks in the sleeping tab
  const s = JSON.parse(ls.getItem("dft-sjt-mock-v5"));
  check("a clock tick in a stale tab takes the newer copy instead of bringing back what it removed", !s.sets.p1.ans[2] && s.sets.p1.ans[0]); }
{ const ls = memStorage(), A = tab(ls); answer(A.S, 0); A.save();
  const B = tab(ls); answer(B.S, 50); B.save();
  A.S.sets.p1.cur = 3; A.persistAsIs(); // the stale tab moves to another question
  const s = JSON.parse(ls.getItem("dft-sjt-mock-v5"));
  check("moving between questions in a stale tab never writes its older copy over the newer one", J(answered(s)) === J([0, 50]) && s.ts === B.S.ts); }
{ const ls = memStorage(), A = tab(ls); answer(A.S, 0); A.save();
  const B = tab(ls); answer(B.S, 50); B.save();
  const cid = A.S.cid; A.S = A.fresh(); A.S.cid = cid; A.save(true, false, true); // Clear everything in the stale tab
  const s = JSON.parse(ls.getItem("dft-sjt-mock-v5"));
  check("Clear everything is not undone by combining", answered(s).length === 0 && s.ts > B.S.ts); }
{ const ls = memStorage(), A = tab(ls); answer(A.S, 0); A.save(); const t = A.S.ts;
  A.persistAsIs();
  check("moving around without answering doesn't mark progress as changed", A.S.ts === t && JSON.parse(ls.getItem("dft-sjt-mock-v5")).ts === t); }

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
