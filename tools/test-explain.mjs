// Tests "Explain my mistake" with a fake AI model and an in-memory database (run: node tools/test-explain.mjs)
import { DatabaseSync } from "node:sqlite";
const RealDate = Date; globalThis.Date = class extends RealDate { constructor(...a) { super(...(a.length ? a : [RealDate.now() + 2 * 86400000])); } static now() { return RealDate.now() + 2 * 86400000; } };
import worker from "../src/worker.js";
import BANK from "../src/explain-bank.js";
const db = new DatabaseSync(":memory:");
const tick = () => new Promise(r => setTimeout(r, 2));
class Stmt { constructor(s){this.sql=s;this.args=[];} bind(...a){this.args=a;return this;}
  async run(){ await tick(); db.prepare(this.sql).run(...this.args); return {}; } async first(){ await tick(); return db.prepare(this.sql).get(...this.args) ?? null; }
  exec(){ const s=db.prepare(this.sql); return /^\s*(SELECT|INSERT.*RETURNING)/i.test(this.sql)?{results:s.all(...this.args)}:(s.run(...this.args),{results:[]}); } }
let aiCalls = 0;
const AI = { run: async (id, input) => { aiCalls++; await tick();
  const u = input.messages ? input.messages[1].content : input.input;
  if (/Which explanations are wrong/.test(u)) return {response: "NONE", usage: {prompt_tokens: 900, completion_tokens: 2}};
  const p = JSON.parse(u);
  return {response: JSON.stringify({summary: "You put reporting Tom ahead of giving him the chance to put it right himself.",
    options: p.wrong_options.map(c => ({letter: c, why: `${c} belongs where the key puts it because it handles Tom's request proportionately and keeps the matter local first.`}))}), usage: {input_tokens: 1500, output_tokens: 300}};
} };
const waits = []; const ctx = {waitUntil: p => waits.push(p)};
const env = { DB: { prepare: s => new Stmt(s), batch: async st => { await tick(); return st.map(x => x.exec()); } }, AI };
const call = async (body, ip = "1.1.1.1", e = env) => { const r = await worker.fetch(new Request("https://x.dev/api/explain", {method: "POST", body: JSON.stringify(body), headers: {"CF-Connecting-IP": ip}}), e, ctx); await Promise.all(waits.splice(0)); return [r.status, await r.json()]; };
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL:", m); } };
const q1 = BANK[0], rev = [...q1.k].reverse().join("");

let [s, j] = await call({q: 1, answer: q1.k}); ok(s === 200 && j.perfect, "perfect answer needs no explanation");
[s, j] = await call({q: 1, answer: "AAB"}); ok(s === 400, "bad answer rejected");
[s, j] = await call({q: 1, answer: rev}); const first = aiCalls;
ok(s === 200 && j.items.length === 4 && j.items.every(i => i.source === "ai") && j.summary.source === "ai" && first === 2, "explained by the AI (writer + checker)");
ok(!("model_why" in j.items[0]) && !("fails" in j.items[0]), "internal check details aren't sent to the browser");
const used = db.prepare("SELECT n FROM ai_usage").get().n;
ok(used > 0 && used < 140, `real cost settled after the call (${used.toFixed(1)} neurons)`);
[s, j] = await call({q: 1, answer: rev}, "2.2.2.2"); ok(j.cached && aiCalls === first, "same answer from someone else: served from the cache, no AI call");
// cap: near the limit, written explanations, labelled
db.prepare("UPDATE ai_usage SET n = 9450").run();
[s, j] = await call({q: 3, answer: [...BANK[2].k].reverse().join("")}); ok(j.budget && j.items.every(i => i.source === "fallback" && i.reason === "budget"), "past the daily cap: written explanations, marked as such");
// many people at once can't push past the cap
db.prepare("UPDATE ai_usage SET n = 9000").run(); const before = aiCalls;
const qs = BANK.map((q, i) => i).filter(i => BANK[i].t !== "best3").slice(5, 15);
await Promise.all(qs.map((i, n) => call({q: i + 1, answer: [...BANK[i].k].reverse().join("")}, "3.3.3." + n)));
const explained = (aiCalls - before) / 2, total = db.prepare("SELECT n FROM ai_usage").get().n;
ok(explained <= 3 && total <= 9500, `10 at once near the cap: ${explained} explained, total ${total.toFixed(0)} (cap 9,500)`);
// no AI binding (e.g. local tests): written explanations
db.prepare("UPDATE ai_usage SET n = 0").run();
[s, j] = await call({q: 4, answer: BANK[3].t === "best3" ? "ABC" : [...BANK[3].k].reverse().join("")}, "4.4.4.4", {...env, AI: undefined}); ok(j.items.every(i => i.reason === "unavailable"), "no AI available: written explanations");
// per-network limit (D1 fallback counter, 40 an hour)
let limited = 0; for (let n = 0; n < 45; n++) { const i = (n * 7) % 160; const qq = BANK[i]; const a = qq.t === "best3" ? "ABC" : [...qq.k].reverse().join(""); const [st] = await call({q: i + 1, answer: a, n}, "5.5.5.5"); if (st === 429) limited++; }
ok(limited > 0, `hourly limit per network applies (${limited} of 45 refused)`);
console.log(`${pass} passed, ${fail} failed`);
