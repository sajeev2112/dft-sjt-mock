// Tests the Progress page's logic (run: node tools/test-progress.mjs).
// Pulls the real pure functions out of docs/app.js (daysLeft, dailyGoal, goalText, themeAccuracy, weakestTheme, percentile),
// checks the exam date survives normalise and mergeState (so it goes through Sync), and runs the Worker's mock scores and
// GET /api/mock-stats against an in-memory database (nothing deployed, nothing live touched).
import fs from "node:fs";
import vm from "node:vm";
import { DatabaseSync } from "node:sqlite";
import worker from "../src/worker.js";
const src = fs.readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");
let pass = 0, fail = 0;
const check = (name, ok) => { if (ok) pass++; else { fail++; console.log("FAIL", name); } };
const cut = (from, to) => { const a = src.indexOf(from), b = src.indexOf(to, a); if (a < 0 || b < 0) throw new Error("not found in app.js: " + from); return src.slice(a, b); };
const J = x => JSON.stringify(x);

const pure = cut("function daysLeft(exam, day){", "// How everyone scored on each numbered mock");
const {daysLeft, dailyGoal, goalText, themeAccuracy, weakestTheme, percentile, firstFull, PAPER_BASE} = vm.runInNewContext(pure + ";({daysLeft, dailyGoal, goalText, themeAccuracy, weakestTheme, percentile, firstFull, PAPER_BASE})");

// ---------- days left ----------
check("days left: 12 days", daysLeft("2026-11-11", "2026-10-30") === 12);
check("days left: exam day is 0, the day after is -1", daysLeft("2026-10-30", "2026-10-30") === 0 && daysLeft("2026-10-29", "2026-10-30") === -1);
check("days left: across the clocks going back (25 Oct) and a new year", daysLeft("2026-10-26", "2026-10-24") === 2 && daysLeft("2027-01-02", "2026-12-30") === 3);
check("days left: no date or junk gives null", daysLeft("", "2026-10-30") === null && daysLeft(undefined, "2026-10-30") === null && daysLeft("11/11/2026", "2026-10-30") === null);

// ---------- daily target ----------
const base = {mocksLeft: 6, since: Infinity, mistakes: 150, unseen: 200};
{ const g = dailyGoal(12, base); check("12 days, 6 mocks untaken, 150 mistakes: 1 mock + 15 mistakes", J(g) === J({mock: true, mistakes: 15, fresh: 0}));
  check("the line reads as promised", goalText(12, g) === "12 days left: 1 mock + 15 mistakes today."); }
{ const g = dailyGoal(30, {mocksLeft: 3, since: 2, mistakes: 40, unseen: 120}); // 29 days / 3 mocks: one every 9 days; the last was 2 days ago
  check("not a mock day: mistakes and new questions, in fives", J(g) === J({mock: false, mistakes: 5, fresh: 5}) && goalText(30, g) === "30 days left: 5 mistakes + 5 new questions today."); }
check("a mock is due once its gap has passed", dailyGoal(30, {mocksLeft: 3, since: 9, mistakes: 0, unseen: 0}).mock === true && dailyGoal(30, {mocksLeft: 3, since: 8, mistakes: 0, unseen: 0}).mock === false);
check("more mocks than days: still one a day, never two", dailyGoal(3, {mocksLeft: 6, since: 1, mistakes: 0, unseen: 0}).mock === true);
check("all mocks taken: no mock", dailyGoal(10, {mocksLeft: 0, since: 1, mistakes: 0, unseen: 50}).mock === false);
check("a day's share is 5 to 30, never more than what is left", dailyGoal(100, {mocksLeft: 0, since: 0, mistakes: 3, unseen: 7}).mistakes === 3 && dailyGoal(100, {mocksLeft: 0, since: 0, mistakes: 3, unseen: 7}).fresh === 5 && dailyGoal(2, {mocksLeft: 0, since: 0, mistakes: 500, unseen: 0}).mistakes === 30);
{ const g = dailyGoal(1, base); check("the eve of the exam is a light day: up to 10 mistakes, no mock", J(g) === J({mock: false, mistakes: 10, fresh: 0}) && goalText(1, g) === "1 day left: just 10 mistakes, then rest."); }
check("exam day: nothing", J(dailyGoal(0, base)) === J({mock: false, mistakes: 0, fresh: 0}) && goalText(0, dailyGoal(0, base)).startsWith("It’s exam day"));
check("no date or a past date: no target", dailyGoal(null, base) === null && dailyGoal(-3, base) === null && goalText(-3, null) === "Your exam date has passed." && goalText(null, null) === "");
check("nothing left to do: a retake or a Quick 10", goalText(9, dailyGoal(9, {mocksLeft: 0, since: 1, mistakes: 0, unseen: 0})) === "9 days left: retake your weakest mock or do a Quick 10 today.");
check("singular wording", goalText(20, {mock: false, mistakes: 1, fresh: 1}) === "20 days left: 1 mistake + 1 new question today.");

// ---------- theme accuracy and the weakest theme ----------
const themes = {R: "Raising concerns", P: "Probity", C: "Confidentiality", S: "Safeguarding"};
const bank = [{g: "R"}, {g: "R"}, {g: "R"}, {g: "P"}, {g: "P"}, {g: "P"}, {g: "C"}, {g: "S", mk: 1}, {g: "X"}];
const a = (g, m) => [{g, m, t: 1}];
const att = {0: a(10, 20), 1: [{g: 20, m: 20, t: 1}, {g: 5, m: 20, t: 2}], 2: a(12, 12), 3: a(18, 20), 4: a(20, 20), 5: a(12, 12), 6: a(0, 20)};
const acc = themeAccuracy(att, bank, themes, i => !bank[i].mk || !!att[i]);
check("accuracy uses the latest attempt at each question", J(acc.R) === J({g: 27, m: 52, n: 3, total: 3}) && J(acc.P) === J({g: 50, m: 52, n: 3, total: 3}));
check("a mock-only question not yet answered is not counted; unknown themes are ignored", J(acc.S) === J({g: 0, m: 0, n: 0, total: 0}) && !("X" in acc));
check("the weakest theme needs 3 answered (Confidentiality at 0% has only 1)", weakestTheme(acc) === "R" && weakestTheme(acc, 1) === "C");
check("no theme with enough answers: none", weakestTheme(themeAccuracy({}, bank, themes, () => true)) === null);
check("a tie keeps the first theme in order", weakestTheme({A: {g: 5, m: 10, n: 3}, B: {g: 10, m: 20, n: 4}}) === "A");

// ---------- percentile ----------
const dist = Array(101).fill(0); [40, 50, 55, 60, 60, 65, 70, 70, 75, 80].forEach(p => dist[p]++);
check("better than 80%: 8 of 10 scored under 75", percentile(dist, 75) === 80);
check("ties don't count as beaten", percentile(dist, 60) === 30);
check("lowest and highest", percentile(dist, 40) === 0 && percentile(dist, 100) === 100);
check("no data: null (the page then shows nothing or 'not enough results')", percentile(null, 50) === null && percentile(Array(101).fill(0), 50) === null);
check("junk counts are ignored", percentile([1, "x", -4, null, 1], 4) === 50);

// ---------- practice papers: your first complete attempt ----------
{ const hist = [{name: "Paper 2", total: 32, n: 20, g: 300, m: 560}, {name: "Paper 2", total: 32, n: 32, g: 432, m: 576}, {name: "Paper 2", total: 32, n: 32, g: 560, m: 576}, {name: "Quick 10", total: 10, n: 10, g: 1, m: 1}];
  check("a paper is compared on its first complete attempt: not a partly done one, not a later retake", firstFull(hist, "Paper 2", 32) === 75);
  check("no complete attempt: nothing to compare", firstFull(hist, "Paper 3", 32) === null && firstFull([], "Paper 2", 32) === null && firstFull(undefined, "Paper 2", 32) === null);
  check("papers are numbered apart from the mocks", PAPER_BASE === 100); }
{ // the real logSetIfDone queues a paper's score once, only the first time every question is answered, only with sharing on
  const Q = Array.from({length: 64}, (_, i) => ({t: "rank"}));
  const R = {Q, PAPERS: {p1: {name: "Paper 1", from: 0, to: 32}, p2: {name: "Paper 2", from: 32, to: 64}}, PAPER_IDS: ["p1", "p2"], PAPER_BASE, firstFull, location: {protocol: "https:"}, sent: [],
    range: (a, b) => Array.from({length: b - a}, (_, i) => a + i), isRank: () => true, isMock: () => false, revealed: () => true, started: (set, qi) => qi % 32 < set.done, qScore: () => ({got: 15, max: 20}),
    pct: (g, m) => m ? Math.round(g / m * 100) : 0, saveMockQ(){}, flushMockEvents(){}};
  vm.createContext(R);
  vm.runInContext(cut("function logSetIfDone(id){", "// ---------- community stats") + `
    var mockQ = [], S = {cid: "abcdefgh-1", share: true, hist: [], sets: {p1: {done: 32}, p2: {done: 31}}};
    function listOf(id){ const P = PAPERS[id]; return range(P.from, P.to); } function setName(id){ return PAPERS[id].name; }
    globalThis.X = {logSetIfDone, get q(){ return mockQ; }, S};`, R);
  const X = R.X; X.logSetIfDone("p1"); X.logSetIfDone("p2");
  check("a complete paper queues its score as number 101; a paper with one question unanswered does not", X.q.length === 1 && X.q[0].event === "paper" && X.q[0].no === 101 && X.q[0].p === 75 && X.q[0].client === "abcdefgh-1");
  X.S.sets.p1 = {done: 32}; X.logSetIfDone("p1");
  check("finishing the same paper again (after a reset) sends nothing more", X.q.length === 1 && X.S.hist.length === 3);
  X.S.share = false; X.S.hist = []; X.S.sets.p1 = {done: 32}; X.logSetIfDone("p1");
  check("with anonymous sharing off nothing is sent", X.q.length === 1); }

// ---------- the exam date is saved, combined and synced with the rest of progress ----------
{ const Q = Array.from({length: 64}, (_, i) => ({t: i % 2 ? "best3" : "rank"}));
  const head = cut('"use strict";', "const ui0");
  const ctx = {Q, crypto: globalThis.crypto, location: {protocol: "https:", hostname: "example.org"}, window: {matchMedia: null}};
  vm.createContext(ctx); vm.runInContext(head + ";globalThis.T = {normalise, mergeState};", ctx);
  const {normalise, mergeState} = ctx.T;
  check("normalise keeps a valid exam date and drops junk", normalise({exam: "2026-11-11"}).exam === "2026-11-11" && normalise({exam: "<b>"}).exam === "" && normalise({}).exam === "");
  check("merge: the newer copy's date wins", mergeState({ts: 1, exam: "2026-11-01"}, {ts: 2, exam: "2026-12-01"}).exam === "2026-12-01");
  check("merge: a copy without a date doesn't wipe the other's", mergeState({ts: 1, exam: "2026-11-01"}, {ts: 2}).exam === "2026-11-01"); }

// ---------- the Worker: mock scores and GET /api/mock-stats ----------
{ const db = new DatabaseSync(":memory:");
  class Stmt {
    constructor(sql){ this.sql = sql; this.args = []; }
    bind(...x){ this.args = x; return this; }
    async run(){ db.prepare(this.sql).run(...this.args); return {success: true}; }
    async first(){ return db.prepare(this.sql).get(...this.args) ?? null; }
    async all(){ return {results: db.prepare(this.sql).all(...this.args)}; }
    exec(){ const s = db.prepare(this.sql); return /^\s*(SELECT|INSERT.*RETURNING)/i.test(this.sql) ? {results: s.all(...this.args)} : (s.run(...this.args), {results: []}); }
  }
  const env = {DB: {prepare: sql => new Stmt(sql), batch: async st => st.map(s => s.exec())}, ASSETS: {fetch: async () => new Response("asset")}}, ctx = {waitUntil(){}};
  const call = async (method, path, body, ip = "5.5.5.5") => { const r = await worker.fetch(new Request("https://x.dev" + path, {method, body: body && JSON.stringify(body), headers: {"CF-Connecting-IP": ip}}), env, ctx); return [r.status, await r.json().catch(() => null)]; };
  const run = Date.now() - 1000, fin = (client, no, p, r = run) => call("POST", "/api/mock", {client, run: r, event: "finish", mode: "exam", no, p});
  for (let i = 0; i < 9; i++) await fin("peer-client-" + i, 2, 40 + i * 5);
  let [s, d] = await call("GET", "/api/mock-stats?no=2");
  check("fewer than 10 people: only the count, no spread", s === 200 && d.n === 9 && d.min === 10 && !d.dist);
  await fin("peer-client-0", 2, 99, run + 5); // a retake: only the first attempt counts
  await fin("peer-client-9", 2, 90);
  await fin("peer-client-9", 3, 10); // another mock is counted apart
  await call("POST", "/api/mock", {client: "peer-client-x", run, event: "finish", no: 2, p: 101}); // out of range: kept out
  await call("POST", "/api/mock", {client: "peer-client-y", run, event: "start", no: 2, p: 50}); // a start has no score
  await call("POST", "/api/mock", {client: "peer-client-z", run, event: "finish", mode: "exam"}); // an unnumbered mock: no score, still logged
  [s, d] = await call("GET", "/api/mock-stats?no=2");
  check("10 people: the spread of first attempts", s === 200 && d.n === 10 && d.dist.length === 101 && d.dist[40] === 1 && d.dist[99] === 0 && d.dist[90] === 1 && d.dist.reduce((x, y) => x + y, 0) === 10);
  check("the page's percentile from it", percentile(d.dist, 62) === 50);
  check("mocks are counted apart", (await call("GET", "/api/mock-stats?no=3"))[1].n === 1);
  check("bad mock number refused", (await call("GET", "/api/mock-stats?no=0"))[0] === 400 && (await call("GET", "/api/mock-stats?no=abc"))[0] === 400 && (await call("GET", "/api/mock-stats?no=200"))[0] === 400);
  const paper = (client, no, p) => call("POST", "/api/mock", {client, run: Date.now(), event: "paper", no, p});
  for (let i = 0; i < 12; i++) await paper("paper-client-" + i, 103, 50 + i * 3);
  await paper("paper-client-0", 103, 100); // a later complete attempt: only the first counts
  const [bs1] = await paper("paper-client-x", 5, 50), [bs2] = await paper("paper-client-x", 103, 120);
  [s, d] = await call("GET", "/api/mock-stats?no=103");
  check("paper scores: first complete attempt per person, kept apart from the mocks", s === 200 && d.n === 12 && d.dist[50] === 1 && d.dist[100] === 0 && (await call("GET", "/api/mock-stats?no=3"))[1].n === 1);
  check("a paper event can't write a mock's number or a bad score", bs1 === 400 && bs2 === 400);
  check("paper events are not mock runs (the dashboard's completion rate is unchanged)", db.prepare("SELECT COUNT(*) AS c FROM mock_runs").get().c === 14);
  check("the finish events still feed the dashboard's mock_runs", db.prepare("SELECT COUNT(*) AS c FROM mock_runs WHERE status = 'finish'").get().c === 13);
  check("only percentages and the random browser code are stored", J(Object.keys(db.prepare("SELECT * FROM mock_scores LIMIT 1").get())) === J(["client", "no", "p", "t"])); }

// ---------- backfilling paper scores from answers already stored (tools/backfill-paper-scores.mjs) ----------
{ const {scorePapers, toSql} = await import("./backfill-paper-scores.mjs");
  // the page's own scoring, from the real app.js and the real question bank
  const R = {}; vm.createContext(R);
  vm.runInContext(fs.readFileSync(new URL("../docs/questions.js", import.meta.url), "utf8") + ";" + cut("const isRank = q => q.t", "const localNum") +
    cut("const keyRank = (q, idx)", "function band(") + ";globalThis.X = {Q, qScore, isRank};", R);
  const {Q, qScore, isRank} = R.X;
  let seed = 11; const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const answer = qi => isRank(Q[qi]) ? {ord: [0, 1, 2, 3, 4].sort(() => rnd() - 0.5), set: true} : {p: [0, 1, 2, 3, 4, 5, 6, 7].sort(() => rnd() - 0.5).slice(0, 3)};
  const stored = (qi, x) => isRank(Q[qi]) ? x.ord.join("") : x.p.slice().sort((p, q) => p - q).join(""); // exactly what the page sends to /api/answers
  const rows = [], mine = {}; // mine[client|paper] = the page's own "first full attempt" %
  for (const [client, paper, upto] of [["backfill-aaaa1", 1, 32], ["backfill-aaaa1", 4, 32], ["backfill-bbbb2", 1, 32], ["backfill-cccc3", 9, 32], ["backfill-dddd4", 2, 31]]) {
    const set = {ans: {}}; let g = 0, m = 0;
    for (let qi = (paper - 1) * 32; qi < (paper - 1) * 32 + upto; qi++) { const x = set.ans[qi] = answer(qi); const sc = qScore(set, qi); g += sc.got; m += sc.max; rows.push({client, q: qi + 1, a: stored(qi, x)}); }
    if (upto === 32) mine[client + "|" + paper] = Math.round(g / m * 100); // pct(g, m), as logSetIfDone sends it
  }
  rows.push({client: "backfill-aaaa1", q: 1, a: "43210"}); // a later answer to the same question: the first one stands (the table only keeps first answers anyway)
  rows.push({client: "x", q: 1, a: "01234"}, {client: "backfill-eeee5", q: 2, a: "9"}, {client: "backfill-eeee5", q: 999, a: "01234"}, null); // junk is skipped
  const types = new Set([0, 3, 8].flatMap(p => Q.slice(p * 32, p * 32 + 32).map(q => q.t)));
  check("the test papers include ranking, consider and best-three questions", types.has("rank") && types.has("consider") && types.has("best3"));
  const sc = scorePapers(rows), key = s => s.client + "|" + (s.no - 100);
  check("one score per complete paper; a paper with 31 answered is left out", sc.length === 4 && !sc.some(s => s.client === "backfill-dddd4"));
  check("the backfilled score equals the page's own score for the same answers", sc.every(s => s.p === mine[key(s)]) && Object.keys(mine).length === 4);
  const sql = toSql(sc, 1234);
  check("the SQL only inserts, never overwrites, and holds nothing but the browser code, number, % and time", sc.length === sql.trim().split("\n").length && sql.split("\n").filter(Boolean).every(l => /^INSERT OR IGNORE INTO mock_scores \(client, no, p, t\) VALUES \('[A-Za-z0-9-]{8,64}', 1\d\d, \d{1,3}, 1234\);$/.test(l)));
  // run it against a local test database where one person's browser has already sent its own score
  const db = new DatabaseSync(":memory:");
  db.exec("CREATE TABLE mock_scores (client TEXT NOT NULL, no INTEGER NOT NULL, p INTEGER NOT NULL, t INTEGER NOT NULL, PRIMARY KEY (client, no))");
  db.prepare("INSERT INTO mock_scores VALUES (?, ?, ?, ?)").run("backfill-bbbb2", 101, 7, 99);
  db.exec(sql); db.exec(sql); // running it twice changes nothing
  const got = db.prepare("SELECT client, no, p FROM mock_scores ORDER BY client, no").all().map(r => [r.client, r.no, r.p]);
  check("a score the browser already sent is never overwritten, and a second run adds nothing", J(got) === J([["backfill-aaaa1", 101, mine["backfill-aaaa1|1"]], ["backfill-aaaa1", 104, mine["backfill-aaaa1|4"]], ["backfill-bbbb2", 101, 7], ["backfill-cccc3", 109, mine["backfill-cccc3|9"]]])); }

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exitCode = 1;
