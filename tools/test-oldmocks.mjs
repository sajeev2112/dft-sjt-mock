// Tests that an old Completed-sets row (made before rows were linked to their saved mock) still finds its mock (run: node tools/test-oldmocks.mjs)
import fs from "node:fs";
const app = fs.readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");
const start = app.indexOf("function histMockId(x, claimed){"), end = app.indexOf("const mockKept = c =>");
if (start < 0 || end < start) throw new Error("histMockId not found");
const isMock = set => !!set && set.kind === "mock" && set.limit > 0;
const mk = (S) => new Function("S", "isMock", app.slice(start, end) + "\nreturn histMockId;")(S, isMock);
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL:", m); } };
const H = 3600000, T0 = Date.UTC(2026, 9, 21, 16, 13);
const mock = (created, over = {}) => ({kind: "mock", limit: 6300, marked: true, created, list: Array(56).fill(0), ...over});
// the owner's friend: a mock from 21 Oct kept in S.mocks, its row (old, no c) logged when it was marked
let S = {sets: {custom: null}, mocks: [mock(T0)]};
let f = mk(S), row = {t: T0 + 110 * 60000, name: "Timed mock", total: 56};
ok(f(row, new Set()) === T0, "an old row finds the saved mock finished just before it");
ok(f({...row, c: 123}, new Set()) === 123, "a row that already has a mock id keeps it");
ok(f({t: T0 + 6 * H, name: "Timed mock", total: 56}, new Set()) === 0, "a row more than 4 hours after the mock does not match it");
ok(f({t: T0 - H, name: "Timed mock", total: 56}, new Set()) === 0, "a row from before the mock was created does not match it");
ok(f({t: T0 + H, name: "Paper 3", total: 32}, new Set()) === 0, "an ordinary set row never matches a mock");
ok(f({t: T0 + H, name: "Timed mock", total: 40}, new Set()) === 0, "a different number of questions does not match");
const claimed = new Set([T0]); ok(f(row, claimed) === 0, "a mock already claimed by another row is not given twice");
// two mocks, two rows: each row gets its own
const T1 = T0 + 24 * H; S = {sets: {custom: mock(T1)}, mocks: [mock(T0)]}; f = mk(S);
const c2 = new Set(); const r1 = f({t: T0 + 2 * H, name: "Timed mock", total: 56}, c2), r2 = f({t: T1 + 2 * H, name: "Timed mock", total: 56}, c2);
ok(r1 === T0 && r2 === T1, "two mocks and two rows pair up correctly (the quiz slot counts too)");
// unmarked mocks are never matched (they are not finished)
S = {sets: {custom: mock(T0, {marked: false})}, mocks: []}; f = mk(S); ok(f(row, new Set()) === 0, "an unfinished mock is not matched");
// robustness
S = {sets: {custom: null}, mocks: undefined}; f = mk(S); ok(f(row, new Set()) === 0, "no saved mocks: nothing matches, nothing crashes");
S = {sets: {custom: {}}, mocks: [null, {}, mock(T0)]}; f = mk(S); ok(f(row, new Set()) === T0, "junk entries in the saved list are ignored");
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
