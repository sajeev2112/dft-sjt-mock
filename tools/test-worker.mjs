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
results.push(["stored comment", db.prepare("SELECT comment FROM feedback").all()]);
for (const r of results) console.log(JSON.stringify(r));
