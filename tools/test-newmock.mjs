// Tests the brand-new mocks and their mock-only questions (run: node tools/test-newmock.mjs).
// This strips the real Mock 1 (mk: 1) and Mock 2 (mk: 2) blocks from an in-memory copy of docs/questions.js, appends 56
// synthetic mock-only questions (37 ranking-type, then 19 best-three) for Mock 1, and 56 more for Mock 2, runs the real load
// code and the real functions from docs/app.js on it, and compares with the real bank. Nothing is written to disk. Checks:
// - the brand-new mock: 56 questions, Part One ranking-type then Part Two best-three, fixed order, disjoint from the five
//   fixed mocks (which stay exactly as they are), offered only with exactly 37 + 19;
// - Mock 2: its own 56, shown second; the five fixed papers become Mock 3 to Mock 7, Mock 1 and every saved number unchanged;
// - labels: brand-new = Mock 1, the fixed papers Mock 2 to Mock 6 (and Mock 1 to 5 without the new questions), both ways;
//   an attempt saved as "Mock 2" keeps its stored number and name but is shown as Mock 3 everywhere;
// - practice: Quick 10, area, theme and flagged quizzes, builder theme counts and Results totals never use a mock-only
//   question until it has been answered; then Weak spots, My mistakes and Results include it;
// - tools/build.js refuses a wrong number of mock-only questions (112 = 56 + 56); docs/admin.js labels them.
import fs from "node:fs";
import vm from "node:vm";
const read = f => fs.readFileSync(new URL("../" + f, import.meta.url), "utf8");
const src = read("docs/app.js"), buildSrc = read("tools/build.js"), adminSrc = read("docs/admin.js");
const realBankSrc = read("docs/questions.js");
// These tests build their own synthetic mock-only questions, so work from Papers 1-9 alone: without the real RW_M1 and RW_M2
// blocks and without Paper 10 (the blocks sit just before "const Q = ["; Mock 1, Paper 10 and Mock 2 are checked on the real bank below).
const stripM2 = t => t.replace(/\/\/ ---- Mock 2: brand-new questions[^\n]*\nconst RW_M2 = [\s\S]*?;\n(?=const Q = \[)/, "").replace(", ...RW_M2]", "]");
const realNoM2Src = stripM2(realBankSrc); // the real bank as it was before Mock 2 (Papers 1-10 and Mock 1)
if (/RW_M2/.test(realNoM2Src)) throw new Error("could not strip the Mock 2 block from docs/questions.js");
const bankSrc = realNoM2Src.replace(/\/\/ ---- Mock 1: brand-new questions[\s\S]*?\nconst RW_M1 = [\s\S]*?;\n(?=\/\/ ---- Paper 10)/, "").replace(/\/\/ ---- Paper 10[^\n]*\n(const RW_10_\d = [\s\S]*?;\n){4}(?=const Q = \[)/, "").replace(", ...RW_M1, ...RW_10_1, ...RW_10_2, ...RW_10_3, ...RW_10_4]", "]");
if (/RW_M1|RW_10_/.test(bankSrc)) throw new Error("could not strip the Mock 1 and Paper 10 blocks from docs/questions.js");
let pass = 0, fail = 0;
const check = (name, ok) => { if (ok) pass++; else { fail++; console.log("FAIL", name); } };
const cutOf = text => (from, to) => { const a = text.indexOf(from), b = text.indexOf(to, a); if (a < 0 || b < 0) throw new Error("not found: " + from); return text.slice(a, b); };
const cut = cutOf(src);
const J = x => JSON.stringify(x);

// ---------- 56 synthetic mock-only questions ----------
const L = "ABCDEFGH", perm = k => { const a = [..."ABCDE"]; for (let j = 4; j > 0; j--) { const r = (k * 7 + j * 3) % (j + 1); [a[j], a[r]] = [a[r], a[j]]; } return a.join(""); };
function synthetic(n = 56, nRank = 37, extra = {}){
  return Array.from({length: n}, (_, k) => { const best = k >= nRank, t = best ? "best3" : k % 4 === 3 ? "consider" : "rank";
    return Object.assign({mk: 1, t, d: "IPET"[k % 4], g: "CRKFSWMPTHIN"[k % 12], a: "Synthetic " + (k + 1), k: best ? ["ABC", "BDF", "CEH", "ADG"][k % 4] : perm(k),
      s: `Synthetic brand-new scenario ${k + 1}.`, o: Array.from({length: best ? 8 : 5}, (_, j) => [`Option ${j + 1} of new question ${k + 1}.`, `Why option ${j + 1} sits where it does.`]), tk: "A synthetic takeaway.", r: []}, extra); });
}
// The question file with extra questions appended to Q, as the real ones are (see HANDOVER / the integration notes).
const withNew = items => bankSrc.replace("const Q = [", "const RW_M1 = " + J(items) + ";\nconst Q = [").replace(/(\.\.\.RW_9_4)\];/, "$1, ...RW_M1];");
// ...and with a second block (Mock 2, mk: 2) after the first
const withNew2 = (items, items2) => withNew(items).replace("const Q = [", "const RW_M2 = " + J(items2) + ";\nconst Q = [").replace(/(\.\.\.RW_M1)\];/, "$1, ...RW_M2];");
const synthetic2 = (n = 56, nRank = 37) => synthetic(n, nRank, {mk: 2}).map((q, k) => Object.assign(q, {a: "Synthetic Mock 2 item " + (k + 1), s: `Synthetic Mock 2 scenario ${k + 1}.`}));

// ---------- the app, in a sandbox ----------
function app(bankText){
  const els = {};
  const ctx = {console, crypto: globalThis.crypto, location: {protocol: "https:", hostname: "example.org", hash: ""}, window: {addEventListener(){}, matchMedia: null},
    document: {querySelector: () => null, querySelectorAll: () => [], addEventListener(){}, getElementById: id => els[id] || (els[id] = {innerHTML: "", id})}, confirm: () => true, TextEncoder, TextDecoder, fetch: () => Promise.reject(new Error("offline"))};
  vm.createContext(ctx);
  vm.runInContext(bankText, ctx);
  vm.runInContext(cut('"use strict";', "const ui0") + cut("// ---------- set helpers ----------", "// ---------- recording attempts") +
    cut("// ---------- timed mock ----------", "function timeUp(){") + cut("function mistakeOrder(att, now){", "// ---------- side panel") +
    cut("// ---------- progress (the Results page, renamed) ----------", "// ---------- guide ----------") + `
    var ui = {rdet: {}, warned: {}, summary: false}, timerOn = false, autoPausedSet = null, saved = 0, PLAYBOOKS = {};
    function save(){ saved++; } function render(){} function scrollToCard(){} function markSet(){} function focusCard(){} function announce(){}
    function addAttemptFor(qi, g, m, t){ (S.att[qi] = S.att[qi] || []).push({g, m, t: t || Date.now()}); }
    globalThis.T = {Q, DOMAINS, THEMES, PAPER_IDS, PAPERS, mockPapers, newMockPaper, NEW_LIST, NEW_MOCK, NEW_LIST2, NEW_MOCK2, NEWEST_MOCK, MOCK_ORDER, mockLabel, mockNoOf, mockCountWord, PRACTICE, forPractice, flagList,
      mockPaperList, nextMock, buildQuiz, builderHtml, renderResults, renderMocks, mockCardsHtml, peersHtml, mockSummaryHtml, quizName, setName, histName, weakList, mistakesList,
      normalise, mergeState, fresh, newSet, packMock, unpackMock, addMocks, addAttemptFor, get S(){ return S; }, set S(v){ S = v; }};`, ctx);
  ctx.T.els = els; return ctx.T;
}
const R = app(bankSrc), N = app(withNew(synthetic())); // R: the real bank today; N: the real bank plus 56 synthetic mock-only questions
const mk = N.Q.map((_, i) => i).filter(i => N.Q[i].mk);

// ---------- the bank and the load code ----------
check("the synthetic bank has 288 practice + 56 mock-only questions (Q289-Q344)", N.Q.length === 344 && mk.length === 56 && mk[0] === 288 && mk[55] === 343);
check("mock-only questions get paper 0 (no paper) and keep their site-wide numbers 289-344", mk.every(i => N.Q[i].p === 0 && N.Q[i].n === i + 1));
check("every practice question keeps its paper (1-9) and number", R.Q.every((q, i) => N.Q[i].p === q.p && N.Q[i].n === q.n && N.Q[i].k === q.k));
check("the paper tabs are still Papers 1 to 9 only", J(N.PAPER_IDS) === J(R.PAPER_IDS) && N.PAPER_IDS.length === 9);
check("PRACTICE is the 288 practice questions in both banks", N.PRACTICE.length === 288 && J(N.PRACTICE) === J(R.PRACTICE));

// ---------- the brand-new mock ----------
const NL = N.NEW_LIST, fixed = N.mockPapers(N.Q);
check("the brand-new mock has the 56 mock-only questions, each once", NL.length === 56 && new Set(NL).size === 56 && NL.every(i => N.Q[i].mk));
check("...Part One = the 37 ranking-type, then Part Two = the 19 best-three", NL.slice(0, 37).every(i => N.Q[i].t !== "best3") && NL.slice(37).every(i => N.Q[i].t === "best3"));
check("...Part Two in the order written, Part One in a fixed shuffled order", J(NL.slice(37)) === J(mk.slice(37)) && J(NL.slice(0, 37)) !== J(mk.slice(0, 37)) && J([...NL.slice(0, 37)].sort((a, b) => a - b)) === J(mk.slice(0, 37)));
check("...deterministic (the same order every time, on every device)", J(N.newMockPaper(N.Q)) === J(NL) && J(app(withNew(synthetic())).NEW_LIST) === J(NL));
const rew = N.Q.map(q => Object.assign({}, q, {s: q.s + " reworded", o: q.o.map(o => [o[0] + ".", o[1]])}));
check("...rewording a question never moves it", J(N.newMockPaper(rew)) === J(NL));
check("the five fixed mocks are exactly as before (adding mock-only questions changes none of them)", J(fixed) === J(R.mockPapers(R.Q)));
check("the brand-new mock overlaps none of the five fixed mocks", fixed.every(l => l.every(i => !NL.includes(i))));
check("mockPaperList: 6 is the brand-new mock, 1-5 the fixed papers", J(N.mockPaperList(6)) === J(NL) && [1, 2, 3, 4, 5].every(n => J(N.mockPaperList(n)) === J(fixed[n - 1])));
check("today's bank (no mock-only questions): no brand-new mock", R.NEW_LIST.length === 0 && R.mockPaperList(6).length === 0);
for (const [label, items] of [["55 mock-only", synthetic(55)], ["57 mock-only", synthetic(57, 38)], ["38 ranking + 18 best-three", synthetic(56, 38)], ["36 ranking + 20 best-three", synthetic(56, 36)]]) {
  const X = app(withNew(items));
  check(`wrong counts (${label}): the brand-new mock is not offered, numbering unchanged, and the questions stay out of practice`, X.NEW_LIST.length === 0 && J(X.MOCK_ORDER) === J([1, 2, 3, 4, 5]) && X.PRACTICE.length === 288);
}

// ---------- labels: one mapping, both ways ----------
check("with the brand-new mock: display order is brand-new, then the five fixed papers", J(N.MOCK_ORDER) === J([6, 1, 2, 3, 4, 5]) && N.mockCountWord() === "six");
check("...brand-new (mockNo 6) is shown as Mock 1, mockNo 1-5 as Mock 2-6", N.mockLabel(6) === "Mock 1" && [1, 2, 3, 4, 5].every(n => N.mockLabel(n) === "Mock " + (n + 1)));
check("...and back: Mock 1 is mockNo 6, Mock k (k = 2-6) is mockNo k - 1", N.mockNoOf(1) === 6 && [2, 3, 4, 5, 6].every(k => N.mockNoOf(k) === k - 1) && N.mockNoOf(7) === 0);
check("...round trip for every mock", N.MOCK_ORDER.every(no => N.mockNoOf(+N.mockLabel(no).slice(5)) === no));
check("without it (today): Mock 1-5 as before", J(R.MOCK_ORDER) === J([1, 2, 3, 4, 5]) && [1, 2, 3, 4, 5].every(n => R.mockLabel(n) === "Mock " + n && R.mockNoOf(n) === n) && R.mockCountWord() === "five");
check("an earlier random mock (mockNo 0) is 'Earlier random mock' either way", N.mockLabel(0) === "Earlier random mock" && R.mockLabel(0) === "Earlier random mock");

// ---------- an attempt saved before the switch ----------
function attempt(T, no, created){
  const list = T.mockPaperList(no), s = T.newSet({name: "Mock " + no, kind: "mock", list, created, limit: 6300, started: true, marked: true, logged: true, mode: "exam", el: 4200, mockNo: no});
  list.forEach((qi, k) => { s.ans[qi] = T.Q[qi].t === "best3" ? {p: [0, 1, 2]} : {ord: [0, 1, 2, 3, 4], set: true}; s.chk[qi] = true; });
  return s;
}
const T0 = Date.UTC(2026, 9, 20, 10), old = R.packMock(attempt(R, 2, T0)); // saved today as "Mock 2" (mockNo 2)
const savedJson = J({v: 5, ts: 100, cid: "12345678-abcd", sets: {}, mocks: [old], hist: [{t: T0 + 3600000, name: "Mock 2", g: 500, m: 1000, n: 56, total: 56, mode: "exam", c: T0}], att: {0: [{g: 10, m: 20, t: T0}]}});
N.S = N.normalise(JSON.parse(savedJson));
check("loading it with the new questions keeps its stored number and name (mockNo 2, 'Mock 2')", N.S.mocks.length === 1 && N.S.mocks[0].mockNo === 2 && N.S.mocks[0].name === "Mock 2" && J(N.S.mocks[0].list) === J(old.list));
N.renderMocks(); const mh = N.els["view-mocks"].innerHTML;
check("Mock exams tab: the old attempt is listed under its new label, Mock 3", /<b>Mock 3<\/b> · attempt 1/.test(mh) && !/<b>Mock 2<\/b> · attempt/.test(mh));
check("...its card (the fixed paper it was) shows Completed under Mock 3", /data-arg="2"><b>Mock 3 <span class="mst done">Completed/.test(mh));
const u = N.unpackMock(N.S.mocks[0]);
check("...review summary heading, Retake and quiz name all say Mock 3 (the stored name 'Mock 2' is never shown)", N.quizName(u) === "Mock 3" && (N.S.sets.custom = u, N.S.setId = "custom", /Mock 3 complete/.test(N.mockSummaryHtml(u)) && /Retake Mock 3/.test(N.mockSummaryHtml(u)) && !/Mock 2/.test(N.mockSummaryHtml(u))));
N.S.sets.custom = null; N.S.setId = "p1";
check("...the Progress page's mock list names it Mock 3", /<b>Mock 3<\/b> · first attempt/.test(N.peersHtml()));
N.renderResults(); const rh = N.els["view-results"].innerHTML;
check("...Completed sets row shows Mock 3, not its stored 'Mock 2'", /<td>Mock 3 <button[^>]*data-act="mock-open"/.test(rh) && !/<td>Mock 2/.test(rh));
check("...a row whose mock isn't kept falls back to its stored name", N.histName({name: "Timed mock"}, 0) === "Timed mock");
R.S = R.normalise(JSON.parse(savedJson)); R.renderMocks();
check("without the new questions the same attempt is still Mock 2 (nothing changes until they arrive)", /<b>Mock 2<\/b> · attempt 1/.test(R.els["view-mocks"].innerHTML) && R.quizName(R.unpackMock(R.S.mocks[0])) === "Mock 2");

// ---------- the Mock exams tab ----------
N.S = N.fresh(); N.renderMocks(); const tab = N.els["view-mocks"].innerHTML, cards = [...tab.matchAll(/data-kind="mock" data-arg="(\d)"><b>(Mock \d)/g)].map(m => [+m[1], m[2]]);
check("six cards, the brand-new mock first as Mock 1, then Mock 2-6 (mockNo 1-5)", J(cards) === J([[6, "Mock 1"], [1, "Mock 2"], [2, "Mock 3"], [3, "Mock 4"], [4, "Mock 5"], [5, "Mock 6"]]));
check("...only the first card has the 'Brand new questions' badge", (tab.match(/Brand new questions/g) || []).length === 1 && /data-arg="6"><b>Mock 1 <span class="mst new">Not started<\/span> <span class="mnew">Brand new questions/.test(tab));
check("...the intro says Mock 1 is made entirely of brand-new questions", /Six fixed papers/.test(tab) && /Mock 1 is made entirely of brand-new questions that are not in any practice paper/.test(tab));
check("...and the new card says 'All new to you'", /data-arg="6">.*?All new to you/.test(tab));
R.S = R.fresh(); R.renderMocks(); const tabR = R.els["view-mocks"].innerHTML;
check("today: five cards Mock 1-5, no badge, no brand-new sentence", (tabR.match(/class="bcard mcard"/g) || []).length === 5 && !/Brand new|brand-new/.test(tabR) && /Five fixed papers/.test(tabR));
check("the home button's next mock is the brand-new one first", N.nextMock() === 6 && R.nextMock() === 1);

// ---------- starting, finishing and keeping the brand-new mock ----------
N.S = N.fresh(); N.buildQuiz("mock", "6"); let c = N.S.sets.custom;
check("starting it: the quiz slot holds the 56 brand-new questions in order, mockNo 6, exam mode, 105 minutes", c && J(c.list) === J(NL) && c.mockNo === 6 && c.mode === "exam" && c.limit === 6300 && N.setName("custom") === "Mock 1");
NL.slice(0, 40).forEach(qi => { c.ans[qi] = N.Q[qi].t === "best3" ? {p: [0, 1, 2]} : {ord: [4, 3, 2, 1, 0], set: true}; });
const keep = J(N.S), back = N.normalise(JSON.parse(keep));
check("resuming after a reload: same list, answers and mockNo", J(back.sets.custom.list) === J(NL) && back.sets.custom.mockNo === 6 && Object.keys(back.sets.custom.ans).length === 40);
N.buildQuiz("mock", "6");
check("pressing it again resumes the same attempt (no new one)", N.S.sets.custom.created === c.created);
c.marked = true; c.started = true; NL.slice(0, 40).forEach(qi => { c.chk[qi] = true; N.addAttemptFor(qi, 10, N.Q[qi].t === "best3" ? 12 : 20); });
N.addMocks(N.S.mocks, [N.packMock(c)]);
const packed = N.S.mocks[0], un = N.unpackMock(packed);
check("finished and archived for ever: packed with mockNo 6 and all 56 questions, unpacked intact", packed.mockNo === 6 && J(un.list) === J(NL) && Object.keys(un.ans).length === 40);
const other = N.fresh(); other.ts = 999; const merged = N.mergeState(N.normalise(JSON.parse(J(N.S))), other);
check("Sync 'Combine both' keeps it", merged.mocks.length === 1 && merged.mocks[0].mockNo === 6);
N.renderMocks(); const after = N.els["view-mocks"].innerHTML;
check("Previous mocks lists it as Mock 1, and its card shows Completed and 40 of 56 seen before", /<b>Mock 1<\/b> · attempt 1/.test(after) && /data-arg="6"><b>Mock 1 <span class="mst done">Completed.*?40 of 56 seen before/.test(after));
check("its summary is headed 'Mock 1 complete' with Retake Mock 1", (N.S.sets.custom = un, N.S.setId = "custom", /Mock 1 complete/.test(N.mockSummaryHtml(un)) && /Retake Mock 1/.test(N.mockSummaryHtml(un))));
N.buildQuiz("mock", "6");
check("Retake starts a fresh attempt at the same 56 questions", N.S.sets.custom.created !== un.created && J(N.S.sets.custom.list) === J(NL) && !N.S.sets.custom.marked);
R.S = R.fresh(); R.buildQuiz("mock", "6");
check("today a request for mockNo 6 falls back to the next fixed mock (no brand-new questions yet)", R.S.sets.custom.mockNo === 1 && R.S.sets.custom.list.length === 56);

// ---------- practice never uses a mock-only question until it has been answered ----------
const noMk = l => l.every(i => !N.Q[i].mk);
N.S = N.fresh(); let ok = true;
for (let k = 0; k < 60; k++) { N.buildQuiz("quick"); if (!noMk(N.S.sets.custom.list) || N.S.sets.custom.list.length !== 10) ok = false; }
check("Quick 10 (60 tries) never picks a mock-only question", ok);
ok = true; for (const g of Object.keys(N.THEMES)) {
  N.buildQuiz("theme", g); const l = N.S.sets.custom.list; R.S = R.fresh(); R.buildQuiz("theme", g); if (!noMk(l) || l.length !== R.S.sets.custom.list.length) ok = false; }
check("theme quizzes have no mock-only questions and the same size as today", ok);
ok = true; for (const d of "IPET") for (let k = 0; k < 10; k++) { N.buildQuiz("area", d); if (!noMk(N.S.sets.custom.list)) ok = false; }
check("area quizzes never pick a mock-only question", ok);
N.S = N.fresh(); N.S.flags = {[mk[0]]: 1, [mk[1]]: 1, 5: 1};
check("Flagged questions leaves out a flagged mock-only question not yet answered", J(N.flagList()) === J([5]));
const themeCount = h => [...h.matchAll(/data-kind="theme" data-arg="(\w)">[^<]*<small>(\d+)<\/small>/g)].map(m => m[1] + m[2]).join();
check("the builder's theme counts are today's (practice bank only)", (R.S = R.fresh(), themeCount(N.builderHtml()) === themeCount(R.builderHtml())) && themeCount(R.builderHtml()).length > 0);
// Results with the same practice answers in both banks: identical, apart from nothing
const sAns = () => { const s = {}; for (let i = 0; i < 288; i += 7) s[i] = [{g: 12, m: 20, t: T0 + i}]; return s; };
N.S = N.fresh(); N.S.att = sAns(); N.S.days = {"2026-10-20": {g: 100, m: 200, n: 10}}; R.S = R.fresh(); R.S.att = sAns(); R.S.days = N.S.days;
N.renderResults(); R.renderResults();
check("Results page is identical to today's when no mock-only question has been answered", N.els["view-results"].innerHTML === R.els["view-results"].innerHTML && /42<small> \/ 288<\/small>/.test(R.els["view-results"].innerHTML));
check("...its By paper rows are Papers 1-9 only", (N.els["view-results"].innerHTML.match(/Paper \d[^<]*<small class="muted">\d+\/32/g) || []).length === 9);
// once answered in the mock
N.addAttemptFor(mk[0], 4, 20, Date.now() - 3 * 86400000); N.addAttemptFor(mk[40], 0, 12, Date.now() - 86400000); N.renderResults(); const rh2 = N.els["view-results"].innerHTML;
check("once answered: Results keeps the practice denominator (42 / 288) and shows +2 brand-new beside it", /42<small> \/ 288 · \+2 brand-new<\/small>/.test(rh2));
const area = h => [...h.matchAll(/<div class="dom"><span>([^<]+) <small class="muted">(\d+)\/(\d+)<\/small>/g)].slice(0, 4).map(m => [m[1], +m[2], +m[3]]);
const a1 = area(R.els["view-results"].innerHTML), a2 = area(rh2), d0 = N.Q[mk[0]].d, d40 = N.Q[mk[40]].d;
const addFor = name => ["I", "P", "E", "T"].filter(d => N.DOMAINS[d] === name).map(d => (d === d0) + (d === d40))[0] || 0;
check("...and By area counts each answered mock-only question in its area (answered and total both +1)", a1.length === 4 && a2.length === 4 && a2.every((x, k) => x[1] === a1[k][1] + addFor(x[0]) && x[2] === a1[k][2] + addFor(x[0])) && a1.reduce((t, x) => t + x[2], 0) === 288);
check("...Weak spots and My mistakes include them (they work from your attempts)", N.weakList().includes(mk[0]) && N.weakList().includes(mk[40]) && N.mistakesList().includes(mk[0]) && N.mistakesList().includes(mk[40]));
N.buildQuiz("weak");
check("...a Weak spots quiz can hold an answered mock-only question", N.S.sets.custom.list.includes(mk[0]));
N.S.flags = {[mk[0]]: 1, [mk[1]]: 1};
check("...and Flagged questions includes a flagged one you have answered, not one you haven't", J(N.flagList()) === J([mk[0]]));

// ---------- tools/build.js: the mock-only count is enforced ----------
const checkMockOnly = new Function(cutOf(buildSrc)("function checkMockOnly(Q){", "// mockOnly:end") + "\nreturn checkMockOnly;")();
const practice = R.Q.map(q => ({t: q.t})), M1 = synthetic(), M2 = synthetic(56, 37, {mk: 2});
check("build: no mock-only questions is fine", checkMockOnly(practice).length === 0);
check("build: Mock 1 + Mock 2 (56 + 56, each 37 ranking-type + 19 best-three) at the end is fine", checkMockOnly(practice.concat(M1, M2)).length === 0);
check("build: ...and with a practice paper between them and after (Paper 10 sits between Mock 1 and Mock 2)", checkMockOnly(practice.concat(M1, practice.slice(0, 32), M2, practice.slice(0, 32))).length === 0);
check("build: Mock 1 alone (56) is now refused: 112 are needed", /found 56; expected 112/.test(checkMockOnly(practice.concat(M1)).join()));
check("build: 55 in Mock 1 is refused with a clear message", /Mock 1's mock-only questions \(mk: 1\): found 55 \(37 ranking-type, 18 best-three\).*exactly 56: 37 ranking-type/.test(checkMockOnly(practice.concat(synthetic(55), M2)).join()));
check("build: 57 in Mock 2 is refused", /Mock 2's mock-only questions \(mk: 2\): found 57/.test(checkMockOnly(practice.concat(M1, synthetic(57, 38, {mk: 2}))).join()));
check("build: Mock 2 with the wrong split (38 + 18) is refused", /Mock 2's .*found 56 \(38 ranking-type, 18 best-three\)/.test(checkMockOnly(practice.concat(M1, synthetic(56, 38, {mk: 2}))).join()));
check("build: a mock-only block broken by practice questions is refused", /Mock 1's questions must be one unbroken block/.test(checkMockOnly(practice.concat(M1.slice(0, 30), practice.slice(0, 32), M1.slice(30), M2)).join()));
check("build: Mock 2's block broken by Mock 1 questions is refused", /Mock 2's questions must be one unbroken block/.test(checkMockOnly(practice.concat(M1.slice(0, 50), M2.slice(0, 20), M1.slice(50), M2.slice(20))).join()));
check("build: a block starting part-way through a paper is refused", /Mock 2's questions must start after a whole practice paper/.test(checkMockOnly(practice.concat(M1, practice.slice(0, 8), M2)).join()));
check("build: Mock 2 before Mock 1 is refused", /must come after Mock 1's/.test(checkMockOnly(practice.concat(M2, M1)).join()));
check("build: Mock 2 without Mock 1 is refused", /need Mock 1's/.test(checkMockOnly(practice.concat(M2, M2)).join()));
check("build: mk must be 1 or 2", /mk must be 1 or 2/.test(checkMockOnly(practice.concat(M1, synthetic(56, 37, {mk: 3}))).join()));
check("build: the real file passes", checkMockOnly(app(realBankSrc).Q).length === 0);

// ---------- docs/admin.js labels ----------
const adm = new Function("Q", cutOf(adminSrc)("const MK0 =", "const rate =") + "\nreturn {qLabel, groupName, groupOf};")(N2.Q);
check("admin: a practice question is 'Paper N, Qn'; mock-only ones 'Mock 1, Qn' and 'Mock 2, Qn' (1-56 each)", adm.qLabel(N2.Q[33]) === "Paper 2, Q2" && adm.qLabel(N2.Q[288]) === "Mock 1, Q1" && adm.qLabel(N2.Q[343]) === "Mock 1, Q56" && adm.qLabel(N2.Q[344]) === "Mock 2, Q1" && adm.qLabel(N2.Q[399]) === "Mock 2, Q56");
check("admin: by-paper tables group each mock on its own", adm.groupOf(N2.Q[300]) === "m1" && adm.groupOf(N2.Q[350]) === "m2" && adm.groupName("m1") === "Mock 1" && adm.groupName("m2") === "Mock 2" && adm.groupName("3") === "Paper 3");

// ---------- the REAL bank (the published brand-new questions) ----------
const RL = app(realBankSrc), rmk = RL.Q.map((q, i) => i).filter(i => RL.Q[i].mk === 1);
check("real bank: 376 questions; Q289-Q344 are the 56 mock-only ones with paper 0 (numbers unchanged by Paper 10)", RL.Q.length === 376 && rmk.length === 56 && rmk[0] === 288 && rmk[55] === 343 && rmk.every(i => RL.Q[i].p === 0));
check("real bank: 37 ranking-type then 19 best-three in the new mock, all with a theme", RL.NEW_LIST.length === 56 && RL.NEW_LIST.slice(0, 37).every(i => RL.Q[i].t !== "best3") && RL.NEW_LIST.slice(37).every(i => RL.Q[i].t === "best3") && rmk.every(i => RL.Q[i].g));
const fixedReal = RL.mockPapers(RL.Q);
check("real bank: the new mock shares no question with the five fixed mocks (which are unchanged)", RL.NEW_LIST.every(i => !fixedReal.flat().includes(i)) && J(fixedReal) === J(R.mockPapers(R.Q)));
check("real bank: Mock 1 is the brand-new paper and the old five are Mock 2-6", J(RL.MOCK_ORDER) === J([6, 1, 2, 3, 4, 5]) && RL.mockLabel(6) === "Mock 1" && RL.mockLabel(1) === "Mock 2");
check("real bank: the practice pool is the 320 practice questions (Papers 1-10)", RL.PRACTICE.length === 320 && RL.PRACTICE.every(i => !RL.Q[i].mk));
// ---------- Paper 10 (Q345-Q376), appended after the mock-only block ----------
const p10 = range0(344, 376);
function range0(a, b){ return Array.from({length: b - a}, (_, i) => a + i); }
check("Paper 10: Q345-Q376 are paper 10, keep their site-wide numbers, 16 rank + 6 consider + 10 best-three", p10.every(i => RL.Q[i].p === 10 && RL.Q[i].n === i + 1 && !RL.Q[i].mk) && p10.filter(i => RL.Q[i].t === "rank").length === 16 && p10.filter(i => RL.Q[i].t === "consider").length === 6 && p10.filter(i => RL.Q[i].t === "best3").length === 10);
check("Paper 10: Papers 1-9 keep exactly their questions and keys", R.Q.every((q, i) => RL.Q[i].p === q.p && RL.Q[i].n === q.n && RL.Q[i].k === q.k));
check("Paper 10: a tenth paper tab, p10, holding Q345-Q376", RL.PAPER_IDS.length === 10 && RL.PAPER_IDS[9] === "p10" && RL.PAPERS.p10.from === 344 && RL.PAPERS.p10.to === 376 && J(RL.Q.slice(344, 376).map(q => q.p)) === J(Array(32).fill(10)));
check("Paper 10: the five fixed mocks and the brand-new mock are unchanged and use none of it", J(fixedReal) === J(R.mockPapers(R.Q)) && fixedReal.flat().concat(RL.NEW_LIST).every(i => i < 344));
check("Paper 10: its questions are practice questions (Quick 10 / theme quizzes may use them)", p10.every(i => RL.PRACTICE.includes(i) && RL.forPractice(i)));
RL.S = RL.fresh();
check("Paper 10: a fresh progress copy has a p10 set, and a copy saved before Paper 10 loads with an empty one", !!RL.S.sets.p10 && (() => { const n = RL.normalise(JSON.parse(savedJson)); return n.sets.p10 && Object.keys(n.sets.p10.ans).length === 0; })());
RL.S.att = {}; for (const i of p10) RL.S.att[i] = [{g: 15, m: 20, t: T0 + i}]; RL.renderResults(); const r10 = RL.els["view-results"].innerHTML;
check("Paper 10: Results lists ten papers By paper, Paper 10 with 32/32 answered and 32 / 320 practice questions", (r10.match(/Paper \d+[^<]*<small class="muted">\d+\/32/g) || []).length === 10 && /Paper 10[^<]*<small class="muted">32\/32/.test(r10) && /32<small> \/ 320<\/small>/.test(r10));
const admR = new Function("Q", cutOf(adminSrc)("const MK0 =", "const rate =") + "\nreturn {qLabel};")(RL.Q);
check("Paper 10: admin labels Q345 'Paper 10, Q1' and Q376 'Paper 10, Q32'; Q289 is still 'New mock, Q1'", admR.qLabel(RL.Q[344]) === "Paper 10, Q1" && admR.qLabel(RL.Q[375]) === "Paper 10, Q32" && admR.qLabel(RL.Q[288]) === "New mock, Q1" && admR.qLabel(RL.Q[287]) === "Paper 9, Q32");
check("real bank: every new question has 5 options (ranking-type) or 8 (best-three), a key in range, and no pre-shuffled order problems", rmk.every(i => { const q = RL.Q[i]; return q.o.length === (q.t === "best3" ? 8 : 5) && (q.t === "best3" ? q.k.length === 3 : q.k.length === 5); }));

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
