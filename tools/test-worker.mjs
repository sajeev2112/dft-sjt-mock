import { DatabaseSync } from "node:sqlite";
import fs from "node:fs"; const QT = fs.readFileSync(new URL("../src/worker.js", import.meta.url), "utf8").match(/QTYPES = "([rb]*)"/)[1];
import worker from "../src/worker.js";
const db = new DatabaseSync(":memory:");
class Stmt {
  constructor(sql){ this.sql = sql; this.args = []; }
  bind(...a){ this.args = a; return this; }
  async run(){ db.prepare(this.sql).run(...this.args); return {success:true}; }
  async first(){ return db.prepare(this.sql).get(...this.args) ?? null; }
  async all(){ return {results: db.prepare(this.sql).all(...this.args)}; }
  exec(){ const s = db.prepare(this.sql); return /^\s*(SELECT|INSERT.*RETURNING)/i.test(this.sql) ? {results: s.all(...this.args)} : (s.run(...this.args), {results: []}); }
}
const DB = { prepare: sql => new Stmt(sql), batch: async stmts => stmts.map(s => s.exec()) };
const env = { DB, ASSETS: { fetch: async () => new Response("asset") } };
const ctx = { waitUntil(){} };
const call = async (method, path, body, headers = {}) => {
  const r = await worker.fetch(new Request("https://x.dev" + path, {method, body: body && JSON.stringify(body), headers: {"CF-Connecting-IP": "1.2.3.4", ...headers}}), env, ctx);
  return [r.status, await r.json().catch(() => null), r.headers];
};
const results = [];
// Q1 is ranking, Q2 is best-three (run: node tools/test-worker.mjs)
results.push(["asset passthrough", (await worker.fetch(new Request("https://x.dev/"), env, ctx).then(r => r.text()))]);
results.push(["no DB", (await worker.fetch(new Request("https://x.dev/api/stats?q=1"), {ASSETS: env.ASSETS}, ctx)).status]);
for (const [c, a1, a2] of [["client-aaaa1", "01234", "017"], ["client-bbbb2", "01243", "017"], ["client-cccc3", "10234", "025"]])
  results.push(["post " + c, (await call("POST", "/api/answers", {client: c, items: [{q:1, a:a1}, {q:2, a:a2}, {q:1, a:"44444"}, {q:999, a:"01234"}]}))[1]]);
results.push(["dup ignored", (await call("POST", "/api/answers", {client: "client-aaaa1", items: [{q:1, a:"43210"}]}))[1]]);
results.push(["stats q1", (await call("GET", "/api/stats?q=1"))[1]]);
results.push(["stats q2", (await call("GET", "/api/stats?q=2"))[1]]);
results.push(["feedback", (await call("POST", "/api/feedback", {client: "client-aaaa1", q: 1, comment: "I think B should be top\u0000"}))[1]]);
results.push(["feedback again", (await call("POST", "/api/feedback", {client: "client-aaaa1", q: 1, comment: "changed"}))[1]]);
results.push(["disagree count", (await call("GET", "/api/stats?q=1"))[1].disagree]);
results.push(["bad client", (await call("POST", "/api/answers", {client: "x", items: []}))[0]]);
const [s, , h] = await call("OPTIONS", "/api/answers", null, {Origin: "https://sajeev2112.github.io"});
results.push(["cors preflight", s, h.get("access-control-allow-origin")]);
results.push(["cors other origin", (await call("GET", "/api/stats?q=1", null, {Origin: "https://evil.example"}))[2].get("access-control-allow-origin")]);
let limited = 0; for (let i = 0; i < 14; i++) { const [st] = await call("POST", "/api/answers", {client: "spam-" + i + "-xxxxxx", items: [...QT].map((t, j) => t === "r" ? {q: j + 1, a: "01234"} : null).filter(Boolean)}); if (st === 429) limited++; }
results.push(["rate limited posts", limited]);
results.push(["stored comment", db.prepare("SELECT comment FROM feedback_v2").all()]);
for (const r of results) console.log(JSON.stringify(r));

const IP2 = {"CF-Connecting-IP": "5.6.7.8"};
// Visitor stats, error reports and health
const v = [];
v.push(["visit", (await call("POST", "/api/visit", {client: "client-aaaa1", app: false}, IP2))[1]]);
v.push(["visit again (app)", (await call("POST", "/api/visit", {client: "client-aaaa1", app: true}, IP2))[1]]);
v.push(["visit other", (await call("POST", "/api/visit", {client: "client-bbbb2"}, IP2))[1]]);
v.push(["visits table", db.prepare("SELECT client, views, app FROM visits ORDER BY client").all()]);
v.push(["client error", (await call("POST", "/api/error", {msg: "TypeError: x is undefined @ app.js:12\u0007"}, IP2))[1]]);
v.push(["bad error body", (await call("POST", "/api/error", {nope: 1}, IP2))[0]]);
v.push(["health", (await call("GET", "/api/health"))[1]]);
v.push(["errors table", db.prepare("SELECT kind, msg FROM errors").all()]);
for (const r of v) console.log(JSON.stringify(r));

// Rate limit: many answer posts from rotating IPv6 addresses in one /64 share a single limit
const ranks = [...QT].map((t, j) => t === "r" ? {q: j + 1, a: "01234"} : null).filter(Boolean);
let first429 = 0;
for (let i = 0; i < 120 && !first429; i++) {
  const ip = `2001:db8:1:2:${(i * 7919).toString(16)}::${i.toString(16)}`;
  const [st] = await call("POST", "/api/answers", {client: "v6-" + i + "-abcdefgh", items: ranks}, {"CF-Connecting-IP": ip});
  if (st === 429) first429 = i + 1;
}
console.log(JSON.stringify(["ipv6 /64 rate limited at post", first429, "(expect ~" + Math.ceil(3000 / Math.min(100, ranks.length)) + ", as the Worker reads at most 100 answers per post)"]));
const [otherNet] = await call("POST", "/api/answers", {client: "v6-other-abcdefgh", items: ranks}, {"CF-Connecting-IP": "2001:db8:9:9::1"});
console.log(JSON.stringify(["different /64 still allowed", otherNet]));
const [fbOk] = await call("POST", "/api/feedback", {client: "v6-0-abcdefgh", q: 1, comment: "x"}, {"CF-Connecting-IP": "2001:db8:1:2::5"});
console.log(JSON.stringify(["feedback has its own limit", fbOk]));

// Private dashboard endpoint
const envAdmin = { ...env, ADMIN_KEY: "correct horse battery staple" };
const adminCall = async (auth, ip = "9.9.9.9") => { const r = await worker.fetch(new Request("https://x.dev/api/admin", {headers: {"CF-Connecting-IP": ip, ...(auth ? {Authorization: auth} : {})}}), envAdmin, ctx); return [r.status, await r.json()]; };
console.log(JSON.stringify(["admin not configured", (await worker.fetch(new Request("https://x.dev/api/admin"), env, ctx)).status]));
console.log(JSON.stringify(["admin no password", (await adminCall(null))[0]]));
console.log(JSON.stringify(["admin wrong password", (await adminCall("Bearer nope"))[0]]));
const [ok, data] = await adminCall("Bearer correct horse battery staple");
console.log(JSON.stringify(["admin ok", ok, Object.keys(data), data.totals]));
// Time per question and timed-mock completion (feed the dashboard)
await call("POST", "/api/answers", {client: "timer-aaaa1", items: [{q: 3, a: "01234", s: 42}, {q: 4, a: "01234", s: 5000}]});
await call("POST", "/api/answers", {client: "timer-bbbb2", items: [{q: 3, a: "01234", s: 60}]});
await call("POST", "/api/answers", {client: "timer-bbbb2", items: [{q: 3, a: "01234", s: 600}]}); // repeat is ignored
const run = Date.now() - 1000;
const mk = (client, r, event, mode) => call("POST", "/api/mock", {client, run: r, event, mode});
console.log(JSON.stringify(["mock start ok", (await mk("mock-aaaa11", run, "start", "exam"))[0], "bad run rejected", (await mk("mock-aaaa11", 5, "start"))[0], "bad event rejected", (await mk("mock-aaaa11", run, "nope"))[0], "bad client rejected", (await mk("x", run, "start"))[0]]));
await mk("mock-aaaa11", run, "finish", "exam"); await mk("mock-bbbb22", run, "start", "plain"); await mk("mock-cccc33", run, "start", "plain"); await mk("mock-cccc33", run, "expired", "plain");
const mkAt = (client, r, event, at) => call("POST", "/api/mock", {client, run: r, event, mode: "plain", at});
await mkAt("mock-dddd44", run, "start", Date.now() - 4 * 3600000); // sent late, dated when it happened: abandoned, not live
await mkAt("mock-eeee55", run, "start", Date.now() + 3 * 86400000); // a time in the future is ignored: live now
const [, d2] = await adminCall("Bearer correct horse battery staple", "9.9.8.8");
console.log(JSON.stringify(["times", d2.times.filter(t => t.q === 3 || t.q === 4), "(expect q3 n=2 avg 51 from two people, the repeat ignored; q4 none because 5000 is over 900)"]));
console.log(JSON.stringify(["mocks", d2.mocks.map(m => [m.mode, m.st, m.n]).sort(), "(expect exam finish 1, plain expired 1, plain live 2, plain abandoned 1)"]));
let lim = 0; for (let i = 0; i < 70; i++) { const [s] = await adminCall("Bearer guess" + i, "8.8.8.8"); if (s === 429) { lim = i + 1; break; } }
console.log(JSON.stringify(["admin guesses rate limited at attempt", lim]));

// Cross-device sync (username + PIN)
const sy = async (body, ip = "7.7.7.7") => { const r = await worker.fetch(new Request("https://x.dev/api/sync", {method: "POST", body: JSON.stringify(body), headers: {"CF-Connecting-IP": ip}}), env, ctx); return [r.status, await r.json()]; };
console.log(JSON.stringify(["sync bad name", (await sy({action: "save", name: "a", pin: "1234", data: "{}"}))[0]]));
console.log(JSON.stringify(["sync load unknown", (await sy({action: "load", name: "sajeev", pin: "1234"}))[0]]));
console.log(JSON.stringify(["sync create", await sy({action: "save", name: "Sajeev", pin: "1234", data: "{\"v\":5}", ts: 100})]));
console.log(JSON.stringify(["sync load (case-insensitive)", await sy({action: "load", name: "sajeev", pin: "1234"})]));
console.log(JSON.stringify(["sync wrong pin", await sy({action: "load", name: "sajeev", pin: "0000"})]));
console.log(JSON.stringify(["sync save up to date", await sy({action: "save", name: "sajeev", pin: "1234", data: "{\"v\":5,\"x\":1}", ts: 200, base: 100})]));
console.log(JSON.stringify(["sync stale device gets conflict", await sy({action: "save", name: "sajeev", pin: "1234", data: "{}", ts: 150, base: 100})]));
console.log(JSON.stringify(["sync forced save", (await sy({action: "save", name: "sajeev", pin: "1234", data: "{\"v\":5}", ts: 300, base: 100, force: true}))[1]]));
let lockedAt = 0; for (let i = 0; i < 6; i++) { const [s, b] = await sy({action: "load", name: "sajeev", pin: String(1000 + i)}); if (s === 423 || b.locked) { lockedAt = i + 1; break; } }
console.log(JSON.stringify(["sync locks after wrong PINs", lockedAt, (await sy({action: "load", name: "sajeev", pin: "1234"}))[0]]));
console.log(JSON.stringify(["pin stored hashed", !db.prepare("SELECT pin FROM sync").get().pin.includes("1234")]));
console.log(JSON.stringify(["sync delete (other name)", (await sy({action: "save", name: "friend1", pin: "4321", data: "{}"}))[0], (await sy({action: "delete", name: "friend1", pin: "4321"}))[1], (await sy({action: "load", name: "friend1", pin: "4321"}))[0]]));
{ // a large progress copy (many finished mocks) is accepted up to SYNC_MAX (524288 characters); a bigger one is refused, and the client says so and keeps it locally
  const big = n => JSON.stringify({v: 5, pad: "x".repeat(n - 16)}), [s1] = await sy({action: "save", name: "bigcopy", pin: "2468", data: big(524288), ts: 100}, "6.6.6.1"), [s2, b2] = await sy({action: "save", name: "bigcopy2", pin: "2468", data: big(524289), ts: 100}, "6.6.6.2");
  const [s3, b3] = await sy({action: "load", name: "bigcopy", pin: "2468"}, "6.6.6.3");
  console.log(JSON.stringify(["sync large copy", s1, "too large", s2, b2.error, "loads back whole", s3, b3.data && b3.data.length, "(expect 200, 400 bad_data, 200 524288)"]));
  if (!(s1 === 200 && s2 === 400 && b2.error === "bad_data" && s3 === 200 && b3.data.length === 524288)) { console.log("FAIL sync size limit"); process.exitCode = 1; } }

// Explain-my-mistake thumbs feedback (Q1 ranking; CBADE is not the key, which the explain tests cover in depth)
const xf = async body => { const r = await worker.fetch(new Request("https://x.dev/api/explain-feedback", {method: "POST", body: JSON.stringify(body), headers: {"CF-Connecting-IP": "4.4.4.4"}}), env, ctx); return [r.status, await r.json()]; };
console.log(JSON.stringify(["explain feedback stored", (await xf({client: "client-aaaa1", q: 1, answer: "EDCBA", rating: -1}))[1], db.prepare("SELECT q, a, rating FROM explain_feedback").all()]));
console.log(JSON.stringify(["explain feedback bad rating / question", (await xf({client: "client-aaaa1", q: 1, answer: "EDCBA", rating: 2}))[0], (await xf({client: "client-aaaa1", q: 0, answer: "EDCBA", rating: 1}))[0]]));

// Question numbers above today's bank: the Worker works by absolute question number from QTYPES (synced by tools/build.js),
// so the brand-new mock's questions (289-344, 37 ranking-type then 19 best-three) work as soon as they are added. Checked on a
// temporary copy of src/ whose QTYPES has 56 more entries (nothing in the project is changed).
{
  const os = await import("node:os"), path = await import("node:path");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dft-worker-"));
  for (const f of fs.readdirSync(new URL("../src/", import.meta.url))) fs.copyFileSync(new URL("../src/" + f, import.meta.url), path.join(dir, f));
  const more = QT + "r".repeat(37) + "b".repeat(19), first = QT.length + 1, last = more.length;
  fs.writeFileSync(path.join(dir, "worker.js"), fs.readFileSync(path.join(dir, "worker.js"), "utf8").replace(/QTYPES = "[rb]*"/, `QTYPES = "${more}"`));
  const w2 = (await import(path.join(dir, "worker.js"))).default;
  const c2 = async (method, p, body) => { const r = await w2.fetch(new Request("https://x.dev" + p, {method, body: body && JSON.stringify(body), headers: {"CF-Connecting-IP": "3.3.3.3"}}), env, ctx); return [r.status, await r.json().catch(() => null)]; };
  const [ps, pb] = await c2("POST", "/api/answers", {client: "newmock-aaaa1", items: [{q: first, a: "01234"}, {q: last, a: "017"}, {q: last + 1, a: "01234"}]});
  const [s1, b1] = await c2("GET", "/api/stats?q=" + first), [s2, b2] = await c2("GET", "/api/stats?q=" + last), [s3] = await c2("GET", "/api/stats?q=" + (last + 1));
  console.log(JSON.stringify(["questions above " + QT.length, "post", ps, pb, "stats q" + first, s1, b1 && b1.type, b1 && b1.n, "stats q" + last, s2, b2 && b2.type, b2 && b2.n, "q" + (last + 1), s3, "(expect stored 2, r 1, b 1, 400)"]));
  if (!(ps === 200 && pb.stored === 2 && s1 === 200 && b1.type === "r" && b1.n === 1 && s2 === 200 && b2.type === "b" && b2.n === 1 && s3 === 400)) { console.log("FAIL question numbers above the current bank"); process.exitCode = 1; }
  fs.rmSync(dir, {recursive: true, force: true});
}
