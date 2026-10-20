// Tests "Explain my mistake" with a fake AI model and an in-memory database (run: node tools/test-explain.mjs)
import { DatabaseSync } from "node:sqlite";
const RealDate = Date; globalThis.Date = class extends RealDate { constructor(...a) { super(...(a.length ? a : [RealDate.now() + 2 * 86400000])); } static now() { return RealDate.now() + 2 * 86400000; } };
import worker from "../src/worker.js";
import BANK from "../src/explain-bank.js";
import { headline, analyse } from "../src/explain.js";
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
  return {response: JSON.stringify({summary: "You put reporting Tom too high and a quiet word with him too low. Talk to the person first, and keep things proportionate.",
    reasons: p.focus.map(c => ({letter: c, why: `${c} belongs where the key puts it because it handles Tom's request proportionately and keeps the matter local first.`}))}), usage: {input_tokens: 1500, output_tokens: 300}};
} };
const waits = []; const ctx = {waitUntil: p => waits.push(p)};
const env = { DB: { prepare: s => new Stmt(s), batch: async st => { await tick(); return st.map(x => x.exec()); } }, AI };
const call = async (body, ip = "1.1.1.1", e = env) => { const r = await worker.fetch(new Request("https://x.dev/api/explain", {method: "POST", body: JSON.stringify(body), headers: {"CF-Connecting-IP": ip}}), e, ctx); await Promise.all(waits.splice(0)); return [r.status, await r.json()]; };
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL:", m); } };
const b3 = BANK.find(q => q.t === "best3"), wrong = [..."ABCDEFGH"].filter(c => !b3.k.includes(c));
const h1 = headline(b3, analyse(b3, wrong.slice(0, 1).concat([...b3.k].slice(0, 2)).join("")));
const q1 = BANK[0], rev = [...q1.k].reverse().join("");

let [s, j] = await call({q: 1, answer: q1.k}); ok(s === 200 && j.perfect, "perfect answer needs no explanation");
[s, j] = await call({q: 1, answer: "AAB"}); ok(s === 400, "bad answer rejected");
[s, j] = await call({q: 1, answer: rev}); const first = aiCalls;
ok(s === 200 && j.items.length === 2 && j.items.every(i => i.source === "ai") && j.summary.source === "written" && first === 2, "reasons explained by the AI (writer + checker); headline is written by code");
ok(/^You scored \d+ out of 20\. Most marks went on [A-E]( and [A-E])?\.$/.test(j.summary.text), "ranking headline: score and where the marks went");
ok(j.principle === q1.tk, "principle comes from the written bank");
ok(!("model_why" in j.items[0]) && !("fails" in j.items[0]), "internal check details aren't sent to the browser");
const used = db.prepare("SELECT n FROM ai_usage").get().n;
ok(used > 0 && used < 140, `real cost settled after the call (${used.toFixed(1)} neurons)`);
[s, j] = await call({q: 1, answer: rev}, "2.2.2.2"); ok(j.cached && aiCalls === first, "same answer from someone else: served from the cache, no AI call");
ok(/^You scored 8 out of 12\. You chose [A-H], which isn’t in the best three, and you missed [A-H], which is\.$/.test(h1), "best-three headline: " + h1);
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
// thumbs up/down on an explanation (POST /api/explain-feedback)
const fb = async (body, ip = "6.6.6.6") => { const r = await worker.fetch(new Request("https://x.dev/api/explain-feedback", {method: "POST", body: JSON.stringify(body), headers: {"CF-Connecting-IP": ip}}), env, ctx); return [r.status, await r.json()]; };
const rows = () => db.prepare("SELECT client, q, a, rating FROM explain_feedback ORDER BY client").all();
[s, j] = await fb({client: "client-aaaa1", q: 1, answer: rev.toLowerCase(), rating: 1}); ok(s === 200 && j.ok, "thumbs up stored");
ok(rows().length === 1 && rows()[0].q === 1 && rows()[0].a === rev && rows()[0].rating === 1, "stored row: question, canonical answer letters, rating");
[s, j] = await fb({client: "client-aaaa1", q: 1, answer: rev, rating: -1}); ok(s === 200 && rows().length === 1 && rows()[0].rating === -1, "later click replaces the earlier one (one row per client, question and answer)");
[s, j] = await fb({q: 1, answer: rev, rating: 1}); ok(s === 200 && rows().length === 2 && rows().some(r => r.client === "anonymous"), "no client id: stored under a shared anonymous id");
[s, j] = await fb({client: "client-aaaa1", q: 1, answer: rev, rating: 0}); ok(s === 400 && j.error === "bad_rating", "rating 0 rejected");
[s, j] = await fb({client: "client-aaaa1", q: 1, answer: rev, rating: "1"}); ok(s === 400, "rating as text rejected");
[s, j] = await fb({client: "client-aaaa1", q: 1, answer: rev, rating: 5}); ok(s === 400, "rating 5 rejected");
[s, j] = await fb({client: "client-aaaa1", q: 9999, answer: rev, rating: 1}); ok(s === 400 && j.error === "bad_question", "unknown question rejected");
[s, j] = await fb({client: "client-aaaa1", q: 1, answer: "AAB", rating: 1}); ok(s === 400 && j.error === "bad_answer", "bad answer letters rejected");
[s, j] = await fb({client: "client-aaaa1", q: 1, answer: q1.k, rating: 1}); ok(s === 400, "a perfect answer has no explanation to rate");
ok(rows().length === 2, "rejected requests store nothing");
let fbLimited = 0; for (let n = 0; n < 70; n++) { const [st] = await fb({client: "client-bbbb2", q: 1, answer: rev, rating: 1}, "7.7.7.7"); if (st === 429) fbLimited++; }
ok(fbLimited === 10, `feedback hourly limit per network applies (${fbLimited} of 70 refused, expect 10)`);
console.log(`${pass} passed, ${fail} failed`);
