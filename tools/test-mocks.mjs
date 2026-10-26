// Tests the numbered mock papers and the mock archive (run: node tools/test-mocks.mjs).
// Pulls the real functions out of docs/app.js and runs them on the real question bank (docs/questions.js):
// - mockPapers(): Mock 1 to 5 are 56 questions each (37 ranking-type, then 19 best-three), pairwise disjoint, valid,
//   deterministic, unchanged by rewording or by a later Paper 10, and balanced (area, theme, paper, format within 1);
// - the archive: every finished mock is kept for ever (no cap), older full copies are packed intact, nothing is lost
//   across load / reload, progress code, Sync combine and replace, another tab's copy, or the start-up backup;
// - size: a worst-case state, measured against the Sync limit in src/worker.js.
import fs from "node:fs";
import vm from "node:vm";
const src = fs.readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");
const bank = fs.readFileSync(new URL("../docs/questions.js", import.meta.url), "utf8");
const worker = fs.readFileSync(new URL("../src/worker.js", import.meta.url), "utf8");
let pass = 0, fail = 0;
const check = (name, ok) => { if (ok) pass++; else { fail++; console.log("FAIL", name); } };
const cut = (from, to) => { const a = src.indexOf(from), b = src.indexOf(to, a); if (a < 0 || b < 0) throw new Error("not found in app.js: " + from); return src.slice(a, b); };
const J = x => JSON.stringify(x);

const ctx = {console, crypto: globalThis.crypto, location: {protocol: "https:", hostname: "example.org"}, window: {addEventListener(){}, matchMedia: null},
  document: {querySelector: () => null, addEventListener(){}}, TextEncoder, TextDecoder, CompressionStream, DecompressionStream, Response, Blob, btoa, atob, Uint8Array};
vm.createContext(ctx);
vm.runInContext(bank, ctx);
vm.runInContext(cut('"use strict";', "const ui0") + cut("function takeCopy(n){", "// A tab that was asleep") + cut("function mockPapers(bank){", "let mockCache") +
  cut("const b64u = bytes =>", "// ---------- navigation") + `
  const isMock = set => !!set && set.kind === "mock" && set.limit > 0;
  function optPts(set, qi, idx){ const q = Q[qi]; const keyRank = (q, idx) => q.k.indexOf(L[idx]) + 1;
    if (isRank(q)) { const a = set.ans[qi], r = a && a.set ? a.ord.indexOf(idx) + 1 : 0; return r ? Math.max(0, 4 - Math.abs(r - keyRank(q, idx))) : 0; }
    const a = set.ans[qi]; return (a && a.p.includes(idx) && q.k.includes(L[idx])) ? 4 : 0; }
  function qScore(set, qi){ let got = 0; Q[qi].o.forEach((_, idx) => got += optPts(set, qi, idx)); return {got, max: isRank(Q[qi]) ? 20 : 12}; }
  globalThis.T = {Q, mockPapers, normalise, mergeState, fresh, newSet, packMock, unpackMock, addMocks, takeCopy, makeCode, readCode, qScore, MOCK_RANK, MOCK_BEST, MOCK_COUNT,
    get S(){ return S; }, set S(v){ S = v; }};`, ctx);
const T = ctx.T, Q = T.Q;

// ---------- the five papers ----------
const P = T.mockPapers(Q);
check("there are 5 mocks", P.length === 5);
check("each mock has exactly 56 questions", P.every(l => l.length === 56));
check("each is 37 ranking-type then 19 best-three (Part One, then Part Two)", P.every(l => l.slice(0, 37).every(i => Q[i].t !== "best3") && l.slice(37).every(i => Q[i].t === "best3")));
check("only valid question numbers, from Papers 1-9", P.every(l => l.every(i => Number.isInteger(i) && i >= 0 && i < Q.length && Q[i].p >= 1 && Q[i].p <= 9)));
check("no question twice within a mock", P.every(l => new Set(l).size === l.length));
let disjoint = true; for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) if (P[a].some(i => P[b].includes(i))) disjoint = false;
check("the five mocks are pairwise disjoint", disjoint && new Set(P.flat()).size === 280);
check("deterministic: the same lists every time", J(T.mockPapers(Q)) === J(P));
const reworded = Q.map(q => Object.assign({}, q, {s: q.s + " (reworded)", o: q.o.map(([t, w]) => [t + ".", w]), tk: "x", a: "y"}));
check("rewording questions changes nothing", J(T.mockPapers(reworded)) === J(P));
const p10 = Q.concat(Array.from({length: 32}, (_, k) => ({n: 289 + k, p: 10, t: k % 3 ? "rank" : "best3", d: "IPET"[k % 4], g: "R"})));
check("adding a Paper 10 later does not reshuffle Mocks 1-5", J(T.mockPapers(p10)) === J(P));
const fp = P.flat().reduce((h, i, k) => (Math.imul(h, 31) + i * (k + 7)) >>> 0, 7);
check(`the papers match the published version (fingerprint ${fp}; if the question data was changed on purpose, update it here)`, fp === 3993367294);
const out = Q.map((_, i) => i).filter(i => !P.flat().includes(i));
check("what sits out: 1 ranking-type and 7 best-three", out.length === 8 && out.filter(i => Q[i].t === "best3").length === 7);

const rows = [], spread = (label, f, vals) => { let w = 0; for (const v of vals) { const c = P.map(l => l.filter(i => f(Q[i]) === v).length); w = Math.max(w, Math.max(...c) - Math.min(...c)); rows.push([label + " " + v, ...c, Math.max(...c) - Math.min(...c)]); } return w; };
const THEMES = vm.runInContext("THEMES", ctx), DOMAINS = vm.runInContext("DOMAINS", ctx);
const sd = spread("Area", q => q.d, Object.keys(DOMAINS)), sg = spread("Theme", q => q.g, Object.keys(THEMES)), sp = spread("Paper", q => q.p, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
const st = spread("Format", q => q.t, ["rank", "consider", "best3"]);
const s1 = spread("Part One paper", q => q.t === "best3" ? 0 : q.p, [1, 2, 3, 4, 5, 6, 7, 8, 9]), s2 = spread("Part Two paper", q => q.t === "best3" ? q.p : 0, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
spread("Level", q => q.p <= 3 ? "standard (P1-3)" : q.p <= 7 ? "advanced (P4-7)" : "expert (P8-9)", ["standard (P1-3)", "advanced (P4-7)", "expert (P8-9)"]);
check("balanced: every area within 1 question across the mocks", sd <= 1);
check("balanced: every theme within 1", sg <= 1);
check("balanced: every paper within 1", sp <= 1);
check("balanced: ranking vs considerations within 1", st <= 1);
check("balanced: each part's papers within 1", s1 <= 1 && s2 <= 1);
if (process.argv.includes("--table")) { console.log("| | Mock 1 | Mock 2 | Mock 3 | Mock 4 | Mock 5 | spread |\n|---|---|---|---|---|---|---|"); rows.forEach(r => console.log("| " + r.join(" | ") + " |")); console.log("Sitting out: " + out.map(i => "Q" + (i + 1)).join(", ")); }

// ---------- the archive: every finished mock is kept ----------
let seed = 11; const rnd = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
// A finished attempt the way the app holds it in the quiz slot (answers, checks, seconds per question).
function attempt(no, created, full = false){
  const list = no ? P[no - 1] : Array.from({length: 56}, (_, k) => (k * 5 + created) % Q.length).filter((x, i, a) => a.indexOf(x) === i);
  const s = T.newSet({name: no ? "Mock " + no : "Timed mock", kind: "mock", list, created, limit: 6300, started: true, marked: true, logged: true, mode: "exam", el: 4000 + rnd(2000), mockNo: no, qt: {}});
  list.forEach(qi => { if (!full && rnd(9) === 0) return; // some left blank
    s.ans[qi] = Q[qi].t === "best3" ? {p: [rnd(8), rnd(8), rnd(8)].filter((x, i, a) => a.indexOf(x) === i)} : {ord: [0, 1, 2, 3, 4].sort(() => rnd(3) - 1), set: true}; s.chk[qi] = true; s.qt[qi] = 30 + rnd(200); });
  return s;
}
const marks = s => s.list.map(qi => T.qScore(s, qi).got);
const same = (a, b) => !!a && !!b && J(a.list) === J(b.list) && J(marks(a)) === J(marks(b)) && a.el === b.el && a.created === b.created && (a.mockNo || 0) === (b.mockNo || 0) && J(a.list.map(i => (a.qt || {})[i] || 0)) === J(b.list.map(i => (b.qt || {})[i] || 0));
const T0 = Date.UTC(2026, 9, 1);
// 30 attempts (all five papers several times, plus earlier random ones), stored the way they used to be: whole quizzes
const atts = Array.from({length: 30}, (_, k) => attempt(k % 6, T0 + k * 3600000));
{ const s = T.fresh(); s.mocks = JSON.parse(J(atts)); s.ts = 100;
  const n = T.normalise(JSON.parse(J(s)));
  check("30 finished attempts in an older copy: all 30 kept (no cap)", n.mocks.length === 30);
  check("...each packed, with the same answers, marks, seconds, time used and mock number", atts.every(a => same(a, T.unpackMock(n.mocks.find(m => m.created === a.created)))));
  check("...and loading again (reload, update reload) changes nothing", J(T.normalise(JSON.parse(J(n)))) === J(n));
  const best = no => atts.filter(a => (a.mockNo || 0) === no).sort((x, y) => marks(y).reduce((p, q) => p + q) - marks(x).reduce((p, q) => p + q))[0];
  check("...the best attempt of every paper is there", [1, 2, 3, 4, 5].every(no => n.mocks.some(m => m.created === best(no).created))); }
{ // today's users: up to 3 archived whole quizzes plus a finished mock in the quiz slot
  const s = T.fresh(); s.mocks = JSON.parse(J(atts.slice(0, 3))); s.sets.custom = JSON.parse(J(atts[3])); s.setId = "custom"; s.ts = 100;
  const n = T.normalise(JSON.parse(J(s)));
  check("migration: the 3 archived mocks and the one in the quiz slot are all kept", n.mocks.length === 4 && atts.slice(0, 4).every(a => same(a, T.unpackMock(n.mocks.find(m => m.created === a.created)))));
  check("...and the quiz slot still holds its mock, unchanged", same(n.sets.custom, atts[3])); }
{ const a = T.fresh(), b = T.fresh(); a.mocks = atts.slice(0, 12).map(T.packMock); b.mocks = atts.slice(8, 30).map(T.packMock); a.ts = 100; b.ts = 200;
  b.sets.custom = atts[0]; a.sets.custom = JSON.parse(J(atts[29])); a.sets.custom.created = T0 + 99 * 3600000; // a's slot has an attempt b has never seen
  const m = T.mergeState(a, b);
  check("Sync 'Combine both' / another tab's save: every attempt from both copies is kept", m.mocks.length === 31);
  check("...combining again changes nothing", J(T.mergeState(m, a)) === J(m) && J(T.mergeState(m, b)) === J(m)); }
{ // another tab's copy (or a restored safety copy) taken in place: this tab's attempts are never dropped
  const mine = T.fresh(); mine.mocks = atts.slice(0, 20).map(T.packMock); mine.ts = 500; mine.view = "practice";
  const theirs = T.fresh(); theirs.mocks = atts.slice(15, 25).map(T.packMock); theirs.ts = 900;
  T.S = T.normalise(mine); T.takeCopy(T.normalise(theirs));
  check("taking another copy (other tab, restore, Sync replace) keeps this copy's attempts too", T.S.mocks.length === 25); }
{ // Sync "Replace this device's progress with the other device's", via the real adopt()
  const c2 = {};
  vm.createContext(Object.assign(c2, ctx)); vm.runInContext(bank, c2);
  vm.runInContext(cut('"use strict";', "const ui0") + cut("function adopt(data, ts){", "// Before Sync replaces a whole copy") + `
    var SY = {lastTs: 0}, saved = 0, ui = {}, timerOn = false, autoPausedSet = null;
    function persistAsIs(){} function saveLink(){} function render(){} function save(){ saved++; }
    globalThis.A = {adopt, normalise, fresh, get S(){ return S; }, set S(v){ S = v; }, get saved(){ return saved; }};`, c2);
  const A = c2.A, here = A.fresh(); here.mocks = atts.slice(0, 10).map(T.packMock); here.sets.custom = atts[10]; A.S = A.normalise(here);
  const there = A.fresh(); there.mocks = atts.slice(20, 24).map(T.packMock); there.ts = 5000;
  A.adopt(J(there), 5000);
  check("Sync replace (adopt): the other copy's progress is taken, and this device's finished mocks are kept", A.S.mocks.length === 15 && A.S.ts === 5000);
  check("...and saved again so they reach Sync too", A.saved === 1); }
{ // progress code round trip (copy on one device, paste on another), through the real makeCode / readCode
  const s = T.fresh(); s.mocks = atts.map(T.packMock); s.sets.custom = atts[29]; s.ts = 1234; T.S = T.normalise(s);
  const code = await T.makeCode(), back = await T.readCode(code);
  check("progress code: all 30 attempts come back intact", back.mocks.length === 30 && atts.every(a => same(a, T.unpackMock(back.mocks.find(m => m.created === a.created))))); }
{ const junk = T.normalise({mocks: [null, 5, "x", {a: 3}, {list: "bad"}, {list: [1e9], a: ""}, {list: [0, 0, 1], a: "99999,01234,,", created: 7}, {kind: "mock", list: [2], marked: false}]});
  check("junk in the saved list is ignored and nothing throws", junk.mocks.length === 1 && junk.mocks[0].created === 7 && T.unpackMock(junk.mocks[0]).list.length === 2); }

// ---------- size of a worst-case state against the Sync limit ----------
const SYNC_MAX = Number((worker.match(/const SYNC_MAX = (\d+)/) || [])[1]);
function worst(nMocks){
  const s = T.fresh(), now = Date.UTC(2026, 9, 26); s.ts = now; s.cid = "12345678-1234-1234-1234-123456789abc";
  for (const id of Object.keys(s.sets)) if (s.sets[id]) { const P0 = vm.runInContext(`PAPERS["${id}"]`, ctx); for (let qi = P0.from; qi < P0.to; qi++) {
    s.sets[id].ans[qi] = Q[qi].t === "best3" ? {p: [5, 6, 7]} : {ord: [4, 3, 2, 1, 0], set: true}; s.sets[id].chk[qi] = true; s.sets[id].qs = s.sets[id].qs || {}; s.sets[id].qs[qi] = 899; } s.sets[id].el = 99999; }
  Q.forEach((q, qi) => { s.att[qi] = Array.from({length: 5}, (_, k) => ({g: 17, m: 20, t: now - k * 86400000 - 123456, s: 3599})); s.flags[qi] = 1; s.sent[qi] = 1; s.fb[qi] = 1; });
  for (let d = 0; d < 400; d++) { const t = new Date(now - d * 86400000); s.days[t.toISOString().slice(0, 10)] = {g: 1234, m: 2345, n: 99}; }
  s.hist = Array.from({length: 200}, (_, k) => ({t: now - k * 3600000, name: "Earlier random mock with a long name (old version) xxxxxxxxxxxxxxxxxxxx", g: 999, m: 1120, n: 56, total: 56, mode: "exam", c: now - k * 3600000}));
  s.outbox = Array.from({length: 300}, (_, k) => ({q: 1 + k % 288, a: "01234", s: 3599}));
  const long = "x".repeat(1500); s.plan = {at: now, sig: "s".repeat(40), plan: {overview: long, this_week: long, priorities: [0, 1, 2].map(() => ({focus: "f".repeat(120), why: long, read: long, do: long, sections: [0, 1, 2].map(() => ({id: "i".repeat(12), title: "t".repeat(80)}))}))}};
  s.sets.custom = attempt(1, now, true); s.setId = "custom";
  s.mocks = Array.from({length: nMocks}, (_, k) => T.packMock(attempt(1 + k % 5, now - (k + 1) * 3600000, true)));
  return J(T.normalise(JSON.parse(J(s)))).length;
}
const sizes = [0, 5, 30, 100, 200].map(n => [n, worst(n)]);
console.log("Worst-case saved progress (all 288 answered with 5 attempts each, every flag, 200 history rows, full study plan):");
sizes.forEach(([n, c]) => console.log(`  ${String(n).padStart(3)} finished mocks: ${c.toLocaleString("en-GB")} characters (${Math.round(c / SYNC_MAX * 100)}% of the Sync limit of ${SYNC_MAX.toLocaleString("en-GB")})`));
const per = Math.round((sizes[3][1] - sizes[0][1]) / 100);
console.log(`  each finished mock adds about ${per} characters; the Sync limit is reached after about ${Math.floor((SYNC_MAX - sizes[0][1]) / per)} finished mocks`);
check("a worst-case state with 100 finished mocks fits under the Sync limit", sizes[3][1] < SYNC_MAX);
check("a finished mock is stored compactly (under 1,000 characters)", per < 1000);

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
