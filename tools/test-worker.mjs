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
console.log(JSON.stringify(["ipv6 /64 rate limited at post", first429, "(expect ~" + Math.ceil(3000 / ranks.length) + ")"]));
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
