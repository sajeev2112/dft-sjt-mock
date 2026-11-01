// Tests the error reports: the pure helpers in docs/app.js (browser family, stack trimming, scrubbing, caps, breadcrumbs,
// the payload), the reporter itself in a stand-in browser (never throws, never recurses, sharing off sends nothing), and the
// Worker side (old and new reports, size and rate limits, the new column on an existing table, grouping).
// Run: node tools/test-telemetry.mjs
import fs from "node:fs";
import vm from "node:vm";
import { DatabaseSync } from "node:sqlite";
import worker, { cleanErrorReport, groupErrors } from "../src/worker.js";

let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL:", m); } };
const app = fs.readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");
const cut = (a, b) => { const i = app.indexOf(a), j = app.indexOf(b, i); if (i < 0 || j < 0) throw new Error("not found: " + a); return app.slice(i, j); };
const T = new Function(cut("// TELEMETRY:start", "// TELEMETRY:end") + "\nreturn {uaFamily, scrub, trimStack, makeGate, makeCrumbs, telemetryPayload};")();

// ---------- browser family: never the full string ----------
const UA = {
  "Chrome 130 / Android": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  "Safari 18 / iOS": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  "Chrome 131 / iOS": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1",
  "Edge 130 / Windows": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.2849.68",
  "Firefox 132 / macOS": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
  "Safari 17 / macOS": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
  "Samsung 26 / Android": "Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36",
  "Other / iOS": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0",
  "Other / Other": ""
};
for (const [want, ua] of Object.entries(UA)) ok(T.uaFamily(ua) === want, `browser family: ${want} (got ${T.uaFamily(ua)})`);

// ---------- stack: our files and lines only ----------
const chrome = "TypeError: Cannot read properties of undefined (reading 'x')\n    at renderResults (https://dft-sjt-mock.sajeev-r13.workers.dev/app.js?v=3:1279:12)\n    at render (https://dft-sjt-mock.sajeev-r13.workers.dev/app.js:520:5)\n    at chrome-extension://abcdef/inject.js:1:1\n    at https://cdn.example.com/lib.js:9:9\n    at HTMLDocument.<anonymous> (https://x.dev/app.js:1600:3)\n    at a (https://x.dev/app.js:1:1)\n    at b (https://x.dev/app.js:2:2)\n    at c (https://x.dev/app.js:3:3)";
const st = T.trimStack(chrome);
ok(st[0] === "renderResults app.js:1279:12" && st[1] === "render app.js:520:5", "Chrome stack: function and file:line:col of our script, no address or query");
ok(st[2] === "(other)" && st.length === 6, "someone else's frames collapse to one (other); at most 6 frames");
ok(!st.join(" ").includes("http") && !st.join(" ").includes("Cannot read"), "the stack keeps no web address and no message text");
ok(T.trimStack("renderCard@https://sajeev2112.github.io/dft-sjt-mock/exam.js:55:3\n@https://x.dev/app.js:7:1")[0] === "renderCard exam.js:55:3", "Firefox/Safari stack format");
ok(T.trimStack(undefined).length === 0 && T.trimStack("no frames here").length === 0, "no stack, no frames");

// ---------- scrubbing: no personal data ----------
const bank = " " + JSON.stringify([{s: "The evening before a mandatory study day, Tom, a fellow FD on your scheme, messages you."}]).toLowerCase().replace(/[^a-z]+/g, " ") + " ";
const nasty = 'Failed for jane.doe@nhs.net with PIN 4821 and code 12345678: The evening before a mandatory study day, Tom, a fellow FD — Unexpected token, "my private feedback about the key is here" @ app.js:1279';
const clean = T.scrub(nasty, 300, bank);
ok(!/jane|nhs\.net/.test(clean) && clean.includes("[email]"), "e-mail address removed");
ok(!/4821|12345678/.test(clean), "PIN-like and long numbers removed");
ok(!/mandatory study day|evening before/.test(clean), "question text removed (6+ words that match the question bank)");
ok(!/private feedback/.test(clean), "long double-quoted text (something typed) removed");
ok(clean.includes("app.js:1279"), "our script's line number kept: " + clean);
ok(T.scrub("NotFoundError: Failed to set the 'innerHTML' property on 'Element': The node to be removed is no longer a child of this node. Perhaps it was moved in a 'blur' event handler?", 300, bank).includes("no longer a child of this node"), "a browser's own message is kept in full");
ok(T.scrub("GET https://x.dev/api/stats?q=12&name=jane failed").includes("stats failed") && !T.scrub("GET https://x.dev/api/stats?q=12&name=jane").includes("jane"), "web address cut to its file name, query dropped");
ok(T.scrub("a\u0000b\nc") === "a b c" && T.scrub("x".repeat(500)).length === 200, "control characters and length capped");

// ---------- caps and dedupe ----------
{ const g = T.makeGate(5, {api: 2, slow: 1});
  const r = [g("error", "a"), g("error", "a"), g("api", "x"), g("api", "y"), g("api", "z"), g("slow", "s"), g("slow", "t"), g("error", "b"), g("error", "c"), g("error", "d")];
  ok(JSON.stringify(r) === JSON.stringify([true, false, true, true, false, true, false, true, false, false]), "identical once, per-kind caps, 5 per page load in all: " + JSON.stringify(r)); }

// ---------- breadcrumbs ----------
{ const c = T.makeCrumbs(10), t0 = 1e12;
  for (let i = 0; i < 14; i++) c.add("go", t0 + i * 1000), c.add("check" + i, t0 + i * 1000 + 500);
  const l = c.list(t0 + 20000);
  ok(l.length === 10 && l[9][0] === "check13" && l[9][1] === 7, "ring buffer keeps the last 10, newest last, with seconds ago");
  const d = T.makeCrumbs(10); d.add("pick", t0); d.add("pick", t0 + 1000); d.add("pick", t0 + 2000); d.add("Hello World! jane@x.com", t0 + 3000); d.add("", t0);
  const dl = d.list(t0 + 3000);
  ok(dl[0][0] === "pick" && dl[0][2] === 3 && dl.length === 2, "repeats are counted, not repeated");
  ok(/^[a-z0-9:-]{1,24}$/.test(dl[1][0]) && !dl[1][0].includes("@"), "crumbs are short codes only: " + dl[1][0]); }

// ---------- the payload ----------
{ const ctx = {v: "163c9c36e7", view: "results", set: "mock", mode: "exam", hash: "#results", app: true, online: true, store: true, calm: false, vw: 390, vh: 844, ptr: "coarse", lang: "en-GB", br: "Chrome 130 / Android", up: 93.4, open: ["update"], name: "jane", pin: "4821", email: "a@b.com", answers: "01234"};
  const p = T.telemetryPayload("error", {via: "error", name: "NotFoundError", message: "Uncaught " + nasty, stack: chrome, file: "https://x.dev/app.js?v=2", line: 1279, col: 12}, ctx, [["view:results", 4], ["check", 2, 3]], bank);
  const s = JSON.stringify(p);
  ok(p.kind === "error" && p.msg.startsWith("NotFoundError: Failed for [email]") && p.msg.endsWith("@ app.js:1279"), "message: name, scrubbed text, file:line: " + p.msg);
  ok(p.detail.loc === "app.js:1279:12" && p.detail.stack[0] === "renderResults app.js:1279:12" && p.detail.via === "error", "location, stack and handler");
  ok(p.detail.v === "163c9c36e7" && p.detail.view === "results" && p.detail.set === "mock" && p.detail.br === "Chrome 130 / Android" && p.detail.up === 93 && p.detail.vw === 390 && p.detail.app === true, "context carried");
  ok(!/jane|4821|12345678|a@b\.com|01234|nhs|mandatory|private feedback|Mozilla|https?:/.test(s), "no personal data, answers, question text or full browser string anywhere in the payload");
  ok(!("pin" in p.detail) && !("email" in p.detail) && !("answers" in p.detail) && !("name" in ctx && p.detail.name === "jane"), "unknown context keys are never copied");
  ok(T.telemetryPayload("error", {}, {hash: "#guide-std-1.2"}).detail.hash === "#guide-std-1.2" && T.telemetryPayload("error", {}, {hash: "#a=jane@x.com&pin=1234"}).detail.hash === "#other", "only a plain #view hash is kept");
  ok(T.telemetryPayload("api", {ep: "stats", st: 503}, {}).msg === "API stats 503" && T.telemetryPayload("api", {ep: "stats", st: 0}, {}).msg === "API stats network", "failed API call: endpoint and status only");
  ok(T.telemetryPayload("slow", {ms: 2400}, {}).msg === "Page busy for over 2 s" && T.telemetryPayload("slow", {ms: 2449}, {}).detail.ms === 2400, "slow page: coarse bucket");
  ok(T.telemetryPayload("sync", {reason: "rate_limited", st: 429}, {}).msg === "Sync failed: rate_limited", "Sync failure by reason code");
  ok(T.telemetryPayload("storage", {reason: "QuotaExceededError"}, {}).msg === "Saving in this browser failed: QuotaExceededError", "storage failure by error name");
  ok(T.telemetryPayload("rejection", {name: "TypeError", message: "x is not a function"}, {}).msg === "Unhandled: TypeError: x is not a function", "unhandled rejection keeps the old prefix");
  ok(s.length < 2500, "a full report is small (" + s.length + " chars)"); }

// ---------- the reporter in a stand-in browser ----------
function browser({share = true, fetchThrows = false, sRef = true} = {}){
  const sent = [], listeners = {};
  const fetchImpl = async (url, init) => { if (fetchThrows) throw new TypeError("Failed to fetch"); sent.push({url, body: init && init.body}); return {ok: String(url).includes("/api/stats") ? false : true, status: String(url).includes("/api/stats") ? 503 : 200}; };
  const win = {addEventListener: (t, f) => (listeners[t] = listeners[t] || []).push(f), fetch: fetchImpl, innerWidth: 390, innerHeight: 844, matchMedia: q => ({matches: q.includes("coarse")})};
  const ctx = {window: win, location: {protocol: "https:", hash: "#results"}, navigator: {onLine: true, language: "en-GB", userAgent: UA["Chrome 130 / Android"]},
    performance: {now: () => 5000}, document: {getElementById: () => null, querySelector: () => null}, API: "", BUILD: "163c9c36e7",
    calm: () => false, storageOk: true, syncUi: {open: false}, ui: {building: false}, isMock: () => false, Q: [{s: "A patient asks you about their results today."}],
    console, Date, JSON, Math, Set, String, Number, Array, Object, Promise, TypeError};
  if (sRef) ctx.S = {share, view: "results", setId: "p1", sets: {p1: {mode: "practice"}}};
  vm.createContext(ctx);
  vm.runInContext(cut("// ---------- error reports ----------", "// ---------- private usage stats") + ";globalThis.R = {report, crumb};", ctx);
  return {ctx, sent, listeners, fire: (t, e) => (listeners[t] || []).forEach(f => f(e))};
}
const tick = () => new Promise(r => setTimeout(r, 10));
{ const b = browser();
  b.ctx.R.crumb("view:results"); b.ctx.R.crumb("check");
  b.fire("error", {filename: "https://x.dev/app.js", lineno: 1279, colno: 12, message: "Uncaught NotFoundError: boom", error: {name: "NotFoundError", stack: chrome}});
  b.fire("error", {filename: "https://x.dev/app.js", lineno: 1279, colno: 12, message: "Uncaught NotFoundError: boom", error: {name: "NotFoundError", stack: chrome}});
  b.fire("error", {filename: "chrome-extension://x/inject.js", lineno: 1, message: "ext"});
  await tick();
  ok(b.sent.length === 1 && b.sent[0].url === "/api/error", "a script error is sent once; repeats and extension errors are not");
  const p = JSON.parse(b.sent[0].body);
  ok(p.detail.crumbs.length === 2 && p.detail.crumbs[1][0] === "check" && p.detail.br === "Chrome 130 / Android" && p.detail.v === "163c9c36e7", "the report carries breadcrumbs and context");
  await b.ctx.window.fetch("/api/stats?q=5"); await tick();
  ok(b.sent.length === 3 && JSON.parse(b.sent[2].body).msg === "API stats 503", "a failed API call is reported by endpoint and status (no query)");
  for (let i = 0; i < 20; i++) b.fire("error", {filename: "https://x.dev/exam.js", lineno: i, message: "e" + i, error: null});
  await tick();
  ok(b.sent.filter(x => x.url === "/api/error").length === 5, "never more than 5 reports per page load"); }
{ const b = browser();
  b.fire("error", {filename: "https://x.dev/#results", lineno: 1, message: "Uncaught SyntaxError: bad", error: {name: "SyntaxError", stack: "SyntaxError: bad\n    at JSON.parse (<anonymous>)\n    at adopt (https://x.dev/app.js:1771:60)"}});
  b.fire("error", {filename: "https://x.dev/#results", lineno: 1, message: "other", error: {name: "Error", stack: "Error\n    at https://cdn.example.com/lib.js:1:1"}});
  await tick();
  ok(b.sent.length === 1 && JSON.parse(b.sent[0].body).msg === "SyntaxError: bad @ app.js:1771", "an error filed under the page counts when its stack runs through our code; others don't"); }
{ const b = browser({share: false}); b.fire("error", {filename: "https://x.dev/app.js", lineno: 1, message: "x"}); await b.ctx.window.fetch("/api/stats"); await tick();
  ok(b.sent.filter(x => x.url === "/api/error").length === 0, "anonymous sharing off: nothing is reported"); }
{ const b = browser({fetchThrows: true}); let threw = false;
  try { b.fire("error", {filename: "https://x.dev/app.js", lineno: 1, message: "x", error: {get stack(){ throw new Error("evil"); }, name: "E"}}); b.ctx.R.report("api", null); b.ctx.R.report(undefined, undefined); await tick(); } catch (e) { threw = true; }
  ok(!threw, "the reporter never throws, even when sending fails or the error object is hostile"); }
{ const b = browser({sRef: false}); let threw = false; try { b.ctx.R.report("error", {message: "early"}); b.ctx.R.crumb("x"); } catch (e) { threw = true; }
  ok(!threw && b.sent.length === 0, "an error before progress has loaded is dropped quietly"); }
{ const b = browser(); let calls = 0; const f0 = b.ctx.window.fetch;
  // a report whose own send fails must not report itself
  b.fire("unhandledrejection", {reason: {name: "TypeError", message: "x is not a function", stack: "at f (https://x.dev/app.js:5:1)"}}); await tick();
  ok(b.sent.length === 1 && JSON.parse(b.sent[0].body).msg === "Unhandled: TypeError: x is not a function @ app.js:5", "unhandled rejection reported with its location");
  calls = b.sent.length; await f0("/api/error"); await tick();
  ok(b.sent.length === calls + 1, "a call to /api/error itself is never reported as a failed API call"); }

// ---------- the Worker ----------
const db = new DatabaseSync(":memory:");
// An errors table as it is on the live database today (no detail column), with an old row in it.
db.exec("CREATE TABLE errors (t INTEGER NOT NULL, kind TEXT NOT NULL, msg TEXT)");
db.prepare("INSERT INTO errors (t, kind, msg) VALUES (?, ?, ?)").run(Date.now() - 60000, "client", "Old message @ app.js:1");
db.prepare("INSERT INTO errors (t, kind, msg) VALUES (?, ?, ?)").run(Date.now() - 40 * 864e5, "client", "Too old");
class Stmt {
  constructor(sql){ this.sql = sql; this.args = []; }
  bind(...a){ this.args = a; return this; }
  async run(){ db.prepare(this.sql).run(...this.args); return {success: true}; }
  async first(){ return db.prepare(this.sql).get(...this.args) ?? null; }
  async all(){ return {results: db.prepare(this.sql).all(...this.args)}; }
  exec(){ const s = db.prepare(this.sql); return /^\s*(SELECT|INSERT.*RETURNING)/i.test(this.sql) ? {results: s.all(...this.args)} : (s.run(...this.args), {results: []}); }
}
const env = {DB: {prepare: sql => new Stmt(sql), batch: async st => st.map(s => s.exec())}, ASSETS: {fetch: async () => new Response("")}, ADMIN_KEY: "k"};
const call = async (method, path, body, ip = "9.9.9.1", headers = {}) => {
  const r = await worker.fetch(new Request("https://x.dev" + path, {method, body: typeof body === "string" ? body : body && JSON.stringify(body), headers: {"CF-Connecting-IP": ip, ...headers}}), env, {waitUntil(){}});
  return [r.status, await r.json().catch(() => null)];
};
const good = {kind: "error", msg: "NotFoundError: Failed to set @ app.js:1279", detail: {v: "163c9c36e7", via: "error", view: "results", set: "paper", br: "Chrome 130 / Android", loc: "app.js:1279:12", stack: ["renderResults app.js:1279:12", "(other)"], crumbs: [["view:results", 4], ["check", 2, 3]], vw: 390, online: true}};
ok((await call("POST", "/api/error", good))[0] === 200, "new-format report accepted");
ok(db.prepare("PRAGMA table_info(errors)").all().some(c => c.name === "detail"), "the detail column was added to the existing table");
ok(db.prepare("SELECT COUNT(*) AS n FROM errors WHERE msg = 'Old message @ app.js:1' AND detail IS NULL").get().n === 1, "existing rows are untouched (detail empty)");
ok((await call("POST", "/api/error", {msg: "TypeError: x @ app.js:12"}))[0] === 200, "old-format report still accepted");
ok((await call("POST", "/api/error", {kind: "api", msg: "API stats 503", detail: {ep: "stats", st: 503, v: "163c9c36e7"}}))[0] === 200, "non-throwing kind accepted");
const evil = {kind: "error", msg: "Boom for jane@x.com PIN 4821 \"a long private comment someone typed in\" https://x.dev/a?pin=4821", detail: {v: "163c9c36e7", name: "Jane Smith <script>", answers: "01234", pin: "4821", email: "a@b.com", ua: UA["Chrome 130 / Android"], br: "x".repeat(500), hash: "#a=jane@x.com", crumbs: [["<b>Hi</b>", "x"], "junk"], stack: Array(20).fill("f app.js:1:1"), extra: {deep: 1}}};
ok((await call("POST", "/api/error", evil))[0] === 200, "a report with junk fields is accepted but cleaned");
const row = db.prepare("SELECT kind, msg, detail FROM errors WHERE msg LIKE 'Boom%'").get(), dj = JSON.parse(row.detail);
ok(!/jane|4821|private comment|https?:/.test(row.msg) && row.msg.includes("[email]"), "server scrubs the message too: " + row.msg);
ok(!("answers" in dj) && !("pin" in dj) && !("email" in dj) && !("ua" in dj) && !("extra" in dj) && dj.br.length === 40 && dj.hash === "#other" && dj.stack.length === 6 && dj.crumbs.length === 1 && dj.crumbs[0][0] === "bhib", "server keeps only listed keys, clipped: " + row.detail);
ok(db.prepare("SELECT kind FROM errors WHERE msg = 'API stats 503'").get().kind === "client-api", "non-throwing kinds are stored as client-<kind>");
ok((await call("POST", "/api/error", JSON.stringify({msg: "x", detail: {pad: "y".repeat(9000)}})))[0] === 400, "an oversized report is refused");
ok((await call("POST", "/api/error", {nope: 1}))[0] === 400 && (await call("POST", "/api/error", {msg: "   "}))[0] === 400, "a report without a message is refused");
ok(cleanErrorReport({msg: "x", kind: "made-up"}).kind === "client" && cleanErrorReport({msg: "x", detail: [1, 2]}).detail === null, "unknown kind falls back; a non-object detail is dropped");
{ let limited = 0; for (let i = 0; i < 25; i++) if ((await call("POST", "/api/error", {msg: "spam " + i}, "7.7.7.7"))[0] === 429) limited++;
  ok(limited === 5, `rate limit: 20 an hour from one network (${limited} of 25 refused)`); }
const [hs, h] = await call("GET", "/api/health");
ok(hs === 200 && h.errors.client_1h >= 3 && h.errors.client_other_24h === 1 && h.errors.server_1h === 0, "health still counts script errors, plus the other kinds separately: " + JSON.stringify(h.errors));
const [as, a] = await call("GET", "/api/admin", null, "9.9.9.2", {Authorization: "Bearer k"});
ok(as === 200 && Array.isArray(a.errors) && a.errors.length <= 50 && !("detail" in a.errors[0]), "admin keeps the plain recent list");
const g = a.errorReport.groups.find(x => x.msg === good.msg);
ok(g && g.n === 1 && g.browsers[0][0] === "Chrome 130 / Android" && g.versions[0][0] === "163c9c36e7" && g.trails[0][0] === "view:results > check" && g.sample.loc === "app.js:1279:12", "admin groups errors with browsers, versions, last breadcrumbs and a sample");
ok(!a.errorReport.groups.some(x => x.msg === "Too old"), "admin shows the last 30 days only");
ok(a.errorReport.versions.some(v => v.v === "163c9c36e7" && v.n >= 2) && a.errorReport.versions.some(v => v.v === "unknown"), "errors by app version (old reports count as unknown)");
{ const rows = [{t: 3, kind: "client", msg: "A", detail: JSON.stringify({v: "b", br: "X / Y", crumbs: [["go", 1]]})}, {t: 1, kind: "client", msg: "A", detail: JSON.stringify({v: "a", br: "X / Y"})}, {t: 2, kind: "server", msg: "S", detail: null}, {t: 4, kind: "client", msg: "A", detail: "{bad json"}];
  const r = groupErrors(rows), A = r.groups.find(x => x.msg === "A");
  ok(A.n === 3 && A.first === 1 && A.last === 4 && A.sample.t === 3 && A.browsers[0][1] === 2 && r.versions.length === 3 && !r.versions.some(v => v.v === undefined), "grouping: counts, first/last, newest sample, bad detail tolerated; server errors not in the version line"); }
// The table created fresh (a new database) also gets the column, and a second Worker start doesn't trip over it.
ok((await call("POST", "/api/error", {msg: "again"}, "9.9.9.3"))[0] === 200, "reports keep working once the column exists");

console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
