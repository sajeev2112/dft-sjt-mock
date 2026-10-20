// "Explain my mistake" (Beta): explains where an answer went wrong, using Cloudflare Workers AI.
// Tested in a local trial (Oct 2026) on gpt-oss-120b, with Llama 3.3 70B as an independent checker.
//
// How it stays correct:
//   1. This code, not the model, works out what was wrong: every misplaced option, and what was over- and under-valued.
//      The debrief covers only the biggest mistakes (see focusOf). The headline and the principle are written by code from the key;
//      the model only writes one short reason for each of those mistakes.
//   2. The model only writes the wording of each reason, as JSON, from the question's own scenario and justifications.
//   3. Every sentence is checked: comparisons must agree with the key, standards cited must appear in the justifications,
//      no outside sources, no hedging or overclaiming, sensible length; then a second model reviews it all against the key.
//   4. Anything that fails is replaced by the written justification, and the page says so.
// Cost control: a daily neuron cap (kept in D1, reserved before each call), a shared cache so a given answer is only
// explained once, and a per-network hourly limit. Past the cap, people get the written explanations until the next day.
import BANK from "./explain-bank.js";

const L = "ABCDEFGH";
const MODELS = {"gpt-oss-120b": "@cf/openai/gpt-oss-120b", "llama-3.3-70b": "@cf/meta/llama-3.3-70b-instruct-fp8-fast", "qwen3.8-27b": "@cf/qwen/qwen3.8-27b", "gpt-oss-20b": "@cf/openai/gpt-oss-20b"};
// Neurons per million tokens [input, output], from Cloudflare's published prices (approximate, on the high side).
const NEURONS = {"gpt-oss-120b": [31818, 68182], "llama-3.3-70b": [26668, 204805]};
const UNKNOWN_RATE = [40000, 210000];
function neuronsFor(modelKey, inTok, outTok) { const [a, b] = NEURONS[modelKey] || UNKNOWN_RATE; return (inTok * a + outTok * b) / 1e6; }
const MODEL = "gpt-oss-120b", VERIFIER = "llama-3.3-70b";
export const DAILY_NEURON_CAP = 9500; // the free plan allows 10,000 a day (resets at 00:00 UTC)
const RESERVE = 140;                   // set aside before each explanation; the real cost is settled afterwards
const CACHE_VERSION = "v3";
// Testing on 4 Oct 2026 used most of that day's free allowance on the same Cloudflare account, so live AI calls start
// the next day (UTC); until then the button shows the written explanations.
const AI_START_DAY = "2026-10-05";

// POST /api/explain {q, answer}: q is the site-wide question number, answer the displayed letters.
export async function explainHandler(request, env, ctx, cors, {allow, readJson, json}) {
  const body = await readJson(request, 1024);
  const qn = Number(body && body.q), q = BANK[qn - 1];
  if (!q) return json({error: "bad_question"}, 400, cors);
  const facts = analyse(q, String(body.answer || "").toUpperCase());
  if (!facts) return json({error: "bad_answer"}, 400, cors);
  const base = {ok: true, q: qn, answer: facts.answer, marks: facts.marks, max: facts.max, right: facts.right, principle: q.tk};
  if (!facts.items.length) return json({...base, perfect: true}, 200, cors);
  const written = reason => json({...base, budget: reason === "budget", summary: {text: headline(q, facts), source: "written"},
    items: facts.items.filter(it => facts.focus.includes(it.letter)).map(it => ({...it, why: fallback(q, it), source: "fallback", reason}))}, 200, cors);

  const key = `${qn}|${facts.answer}|${CACHE_VERSION}`;
  const hit = await env.DB.prepare("SELECT v FROM explain_cache WHERE k = ?").bind(key).first();
  if (hit) { try { return json({...JSON.parse(hit.v), cached: true}, 200, cors); } catch (e) {} }
  if (!env.AI) return written("unavailable");
  if (!(await allow(request, env, ctx, 1, "explain"))) return json({error: "rate_limited"}, 429, cors);

  // reserve part of today's allowance atomically, so simultaneous requests can't push past the cap
  const day = new Date().toISOString().slice(0, 10);
  if (day < AI_START_DAY) return written("budget");
  await env.DB.prepare("INSERT OR IGNORE INTO ai_usage (day, n) VALUES (?, 0)").bind(day).run();
  const held = await env.DB.prepare("UPDATE ai_usage SET n = n + ?1 WHERE day = ?2 AND n + ?1 <= ?3 RETURNING n").bind(RESERVE, day, DAILY_NEURON_CAP).first();
  if (!held) return written("budget");
  let out;
  try { out = await explain(env, q, facts, MODEL, VERIFIER); }
  finally { await env.DB.prepare("UPDATE ai_usage SET n = n - ?1 + ?2 WHERE day = ?3").bind(RESERVE, out ? out.neurons : RESERVE, day).run(); }
  for (const it of out.items) if (it.source === "fallback") it.reason = "check";
  const result = {...base, summary: {text: out.summary.text, source: out.summary.source}, items: out.items.map(({model_why, fails, ...it}) => it)};
  if (!out.error) ctx.waitUntil(env.DB.prepare("INSERT OR REPLACE INTO explain_cache (k, v, t) VALUES (?, ?, ?)").bind(key, JSON.stringify(result), Date.now()).run().catch(() => {}));
  return json(result, 200, cors);
}

// ---------- 1. what went wrong (deterministic) ----------
const ORD = ["1st", "2nd", "3rd", "4th", "5th"];
export function analyse(q, answer) {
  if (q.t === "best3") {
    const picks = [...new Set(answer.replace(/[^A-H]/g, ""))].sort();
    if (picks.length !== 3) return null;
    const items = [
      ...picks.filter(c => !q.k.includes(c)).map(c => ({letter: c, you: "you chose it", key: "not one of the best three", move: "out"})),
      ...[...q.k].filter(c => !picks.includes(c)).map(c => ({letter: c, you: "you didn’t choose it", key: "one of the best three", move: "in"}))];
    const right = picks.filter(c => q.k.includes(c));
    return {type: "best3", answer: picks.join(""), items, right, marks: right.length * 4, max: 12,
      over: items.filter(i => i.move === "out").map(i => i.letter), under: items.filter(i => i.move === "in").map(i => i.letter), focus: focusOf(items, "best3")};
  }
  const ans = answer.replace(/[^A-E]/g, "");
  if (ans.length !== 5 || new Set(ans).size !== 5) return null;
  const kp = c => q.k.indexOf(c), up = c => ans.indexOf(c);
  let marks = 0; for (const c of q.k) marks += Math.max(0, 4 - Math.abs(kp(c) - up(c)));
  // every option you placed wrongly, biggest error first
  const items = [...q.k].filter(c => kp(c) !== up(c))
    .map(c => ({letter: c, you: ORD[up(c)], key: ORD[kp(c)], off: up(c) - kp(c), move: up(c) > kp(c) ? "higher" : "lower"}))
    .sort((a, b) => Math.abs(b.off) - Math.abs(a.off) || q.k.indexOf(a.letter) - q.k.indexOf(b.letter));
  const right = [...q.k].filter(c => kp(c) === up(c));
  // over-valued = put higher than it belongs; under-valued = put lower. Biggest misplacements first.
  const over = items.filter(i => i.off < 0).sort((a, b) => a.off - b.off).map(i => i.letter);
  const under = items.filter(i => i.off > 0).sort((a, b) => b.off - a.off).map(i => i.letter);
  return {type: q.t, answer: ans, items, right, marks, max: 20, over, under, focus: focusOf(items, q.t)};
}
// The debrief covers only the biggest mistakes: the two furthest-misplaced options in a ranking; in a best-three, a wrong pick,
// a missed pick, then (if any) a second wrong pick.
function focusOf(items, type) {
  if (type !== "best3") {
    const hi = items.filter(i => i.off < 0).sort((x, y) => x.off - y.off)[0], lo = items.filter(i => i.off > 0).sort((x, y) => y.off - x.off)[0];
    return [hi, lo].filter(Boolean).sort((x, y) => Math.abs(y.off) - Math.abs(x.off)).map(i => i.letter);
  }
  const outs = items.filter(i => i.move === "out"), ins = items.filter(i => i.move === "in");
  const rest = outs.length >= ins.length ? outs.slice(1) : ins.slice(1);
  return [outs[0], ins[0], rest[1] || rest[0]].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).map(i => i.letter).slice(0, 3);
}

// ---------- 2. the model explains the whole answer ----------
const SYSTEM_BASE = `You write the reasons in a short debrief for a UK Dental Foundation Training trainee who has just got a situational judgement question wrong.
You get the scenario, every option with its CORRECT position and the trainee's position, the official justification for each option, and "focus": the options the trainee got most wrong. The correct positions are settled: never question them.

Write JSON with:
"reasons": for EACH option in the focus list, one entry {"letter","why"}: 18 to 30 words giving the reason it belongs where the key puts it, taken from its justification. Start with the reason, not with the position (the trainee can already see it). State a specific fact from that option's justification: what it does or fails to do. Do not reverse or stretch what the justification says; stay close to its own wording. No filler such as "it completes the best three". COMPARE_LINE

For "Choose the THREE" questions there is no order: never say an option "ranks", "sits above" or "below" another. Say why it is, or is not, one of the best three, and compare it only with options on the other side.

Rules:
- Use ONLY facts from the scenario and the justifications. Do not add new facts, laws, guidance or standards.
- If you cite a standard, copy it exactly as written in a justification, e.g. "(Std 4.2.1)", only where it supports the point. Citing none is fine.
- Whenever you compare with another option, name it by its letter (for example "it ranks below D" or "unlike B"), and the comparison must agree with the correct positions.
- No hedging ("arguably", "might"), no overclaiming ("guarantees", "always") unless a justification says so.
- British English spelling, speaking to the trainee as "you".
Reply with JSON only: {"reasons":[{"letter":"X","why":"..."}]}`;

// The comparison instruction depends on the question type: ranking questions compare positions, best-three questions never do.
const COMPARE_RANK = 'Finish by saying how it compares with its "compare_with" option, naming it by letter (for example "so it ranks below D"); the comparison must agree with the correct positions. The reason must support the direction of the comparison: a drawback explains why it ranks BELOW the other option, an advantage why it ranks ABOVE. Never give a drawback and then say it ranks above, or an advantage and then say it ranks below. Describe the compare_with option by what it actually does (see its text), not by another option\'s action.';
const COMPARE_B3 = 'This is a choose-three question, so there are no positions. NEVER use the words "rank", "ranks", "above", "below", "higher", "lower" or "too high/low" about any option. Finish by contrasting it with its "compare_with" option by letter, for example "unlike D, which ..." or "whereas D ...", saying what the other option does instead.';
const systemFor = q => SYSTEM_BASE.replace("COMPARE_LINE", q.t === "best3" ? COMPARE_B3 : COMPARE_RANK);
const sumOver = f => f.type === "best3" ? f.over : (f.over || []).filter(c => f.focus.includes(c));
const sumUnder = f => f.type === "best3" ? f.under : (f.under || []).filter(c => f.focus.includes(c));
// the option each focus option should be set against: the other side of the mistake (what you put too high vs what you put too low)
function compareWith(q, facts, c) {
  const high = sumOver(facts), low = sumUnder(facts), mine = high.includes(c) ? low : high;
  return mine.find(x => facts.focus.includes(x)) || mine[0];
}
function promptFor(q, facts) {
  const typeLine = q.t === "best3" ? "Choose the THREE most appropriate actions." : q.t === "consider" ? "Rank the considerations from most to least important." : "Rank the actions from most to least appropriate.";
  const n = q.o.length;
  const correct = q.t === "best3" ? null : [...q.k].map((c, i) => `${ORD[i]}: ${c}`).join(", ");
  const options = q.o.map((o, i) => {
    const c = L[i];
    const correctPos = q.t === "best3" ? (q.k.includes(c) ? "one of the best three" : "not one of the best three") : ORD[q.k.indexOf(c)];
    const yourPos = q.t === "best3" ? (facts.answer.includes(c) ? "chosen" : "not chosen") : ORD[facts.answer.indexOf(c)];
    const out = {letter: c, text: o[0], correct_position: correctPos, your_position: yourPos, justification: o[1]};
    if (facts.focus.includes(c)) out.compare_with = compareWith(q, facts, c);
    return out;
  }).slice(0, n);
  const brief = c => `${c}: ${q.o[L.indexOf(c)][0]}`;
  return JSON.stringify({question_type: typeLine, scenario: q.s, principle: q.tk, correct_order: correct, options, focus: facts.focus,
    over_valued: sumOver(facts).map(brief), under_valued: sumUnder(facts).map(brief)}, null, 1);
}

async function runModel(env, modelKey, system, user, maxTokens) {
  const id = MODELS[modelKey];
  let r;
  if (/gpt-oss/.test(id)) r = await env.AI.run(id, {instructions: system, input: user, reasoning: {effort: "low"}});
  else if (/qwen3\.8/.test(id)) r = await env.AI.run(id, {messages: [{role: "system", content: system}, {role: "user", content: user + " /no_think"}], max_tokens: maxTokens, temperature: 0.2, chat_template_kwargs: {enable_thinking: false}});
  else r = await env.AI.run(id, {messages: [{role: "system", content: system}, {role: "user", content: user}], max_tokens: maxTokens, temperature: 0.2});
  const text = textOf(r), u = (r && r.usage) || {};
  const inTok = u.prompt_tokens || u.input_tokens || Math.ceil((system.length + user.length) / 3);
  const outTok = u.completion_tokens || u.output_tokens || (u.total_tokens ? u.total_tokens - inTok : Math.max(Math.ceil(text.length / 3), maxTokens));
  return {text, usage: {inTok, outTok, neurons: neuronsFor(modelKey, inTok, outTok)}};
}
function textOf(r) {
  if (!r) return "";
  if (typeof r === "string") return r;
  if (typeof r.response === "string") return r.response;
  if (r.response && typeof r.response === "object") return JSON.stringify(r.response);
  if (typeof r.output_text === "string") return r.output_text;
  if (Array.isArray(r.output)) { const m = r.output.filter(o => o.type === "message").flatMap(o => o.content || []).map(c => c.text || "").join(""); if (m) return m; }
  if (r.choices && r.choices[0]) return r.choices[0].message?.content || r.choices[0].text || "";
  return "";
}
function parseJson(text) {
  const t = String(text).replace(/<think>[\s\S]*?<\/think>/g, "").replace(/^```(?:json)?|```$/gm, "").trim();
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s < 0 || e < s) return null;
  try { return JSON.parse(t.slice(s, e + 1)); } catch { return null; }
}

// ---------- 3. guardrails ----------
// named laws, bodies and guidance (case-sensitive, so the ordinary words "act" or "nice" don't count)
const SOURCES = /\b(MCA|Mental Capacity Act|[A-Z][a-z]+ Act|NICE|Gillick|Fraser|Caldicott|CQC|GDPR|Data Protection|DH|Department of Health|Resuscitation Council|SDCEP|BDA|NHS England|[Ss]afeguarding toolkit|[Cc]andour guidance|[Rr]aising concerns guidance|[Ss]ocial media guidance|[Ss]cope of practice guidance)\b/g;
const HEDGES = /\b(arguably|equally (good|valid|appropriate)|both (are|options are) (equally|just as)|might be better|could be argued|the key (is|may be) wrong|I think|in my opinion)\b/i;
function stdNumbers(text) { return [...String(text).matchAll(/\b(?:Std|Standards?)\s+([\d.]+(?:\s*(?:,|and|–|-|;)\s*[\d.]+)*)/g)].flatMap(m => m[1].split(/\s*(?:,|and|–|-|;)\s*/)).map(s => s.replace(/\.$/, "")).filter(Boolean); }
// "X ... above/ahead of/over/beats Y" and "X ... below/behind/after Y" must agree with the key
function orderClaims(q, text, subject) {
  const bad = [], rank = c => q.k.indexOf(c), isB3 = q.t === "best3";
  const judge = (x, y, up, what) => {
    if (!x || !y || x === y) return;
    if (isB3) { const xi = q.k.includes(x), yi = q.k.includes(y); if (xi === yi ? /above|below|ahead|behind|higher|lower|outranks|beats|over|beneath/i.test(what) : (up ? !xi : xi)) bad.push(`${x} ${what} ${y}`); return; }
    if (up ? rank(x) > rank(y) : rank(x) < rank(y)) bad.push(`${x} ${what} ${y}`);
  };
  // "it sits below D", "more appropriate than ... (B)": the subject is the option being explained
  if (subject) {
    for (const m of text.matchAll(/\b(above|ahead of|higher than|outranks|beats|below|behind|lower than|beneath)\s+(?:option\s+)?\(?([A-H])\)?(?![A-Za-z’'])/gi)) {
      const before = text.slice(Math.max(0, m.index - 60), m.index);
      if (/(?<![A-Za-z’'])[A-H](?![A-Za-z’'])[^.;]*$/.test(before.replace(/\(([A-H])\)/g, ""))) continue; // another letter is the subject
      judge(subject, m[2].toUpperCase(), /above|ahead|higher|outranks|beats/i.test(m[1]), m[1]);
    }
    for (const m of text.matchAll(/\b(more|less) (?:appropriate|important|suitable|effective|helpful|useful) than\b[^.;]{0,80}?\(([A-H])\)/gi))
      judge(subject, m[2].toUpperCase(), /more/i.test(m[1]), m[1] + " appropriate than");
  }
  const re = /(?<![A-Za-z’'])(?:Option\s+)?([A-H])(?![A-Za-z’'])[^.;]{0,60}?\b(above|ahead of|before|higher than|outranks|beats|over|below|behind|after|lower than|beneath)\s+(?:option\s+)?\(?([A-H])\)?(?![A-Za-z’'])/gi;
  for (const m of text.matchAll(re)) {
    const x = m[1].toUpperCase(), y = m[3].toUpperCase(), up = /above|ahead of|before|higher than|outranks|beats|over/i.test(m[2]);
    if (x === y) continue;
    if (isB3) { const xi = q.k.includes(x), yi = q.k.includes(y); if (xi === yi || (up ? !xi : xi)) bad.push(`${x} ${m[2]} ${y}`); continue; }
    if (up ? rank(x) > rank(y) : rank(x) < rank(y)) bad.push(`${x} ${m[2]} ${y}`);
  }
  return bad;
}
const UK = [[/\b(prioriti|recogni|organi|minimi|emphasi|reali|summari|apologi|criticis|authori|stabili|utili|categori|familiari|speciali|maximi|normali|finali|centrali|standardi)z(e|es|ed|ing|ation|ations)\b/gi, "$1s$2"], [/\bbehavior/gi, "behaviour"], [/\bcolor/gi, "colour"], [/\bcenter\b/gi, "centre"], [/\banesthe/gi, "anaesthe"], [/\bpediatric/gi, "paediatric"]];
export function british(t) { let s = String(t || ""); for (const [re, to] of UK) s = s.replace(re, (m, ...g) => typeof to === "string" && to.includes("$") ? m.replace(/z(?=(e|es|ed|ing|ation|ations)$)/i, c => c === "Z" ? "S" : "s") : to); return s; }
const wordsOf = t => String(t).toLowerCase().replace(/[^a-z0-9’' ]+/g, " ").split(/\s+/).filter(Boolean);
function copiedFrom(q, why, run = 6) {
  const w = wordsOf(why);
  for (const o of q.o) { const ow = wordsOf(o[0]); for (let i = 0; i + run <= ow.length; i++) { const seg = ow.slice(i, i + run).join(" "); for (let j = 0; j + run <= w.length; j++) if (w.slice(j, j + run).join(" ") === seg) return true; } }
  return false;
}
export function check(q, why, minWords = 12, maxWords = 60, subject = null, noCopy = false) {
  const fails = [], src = q.s + " " + q.o.map(o => o.join(" ")).join(" ");
  if (noCopy && copiedFrom(q, why)) fails.push("copies the option wording instead of paraphrasing");
  if (noCopy && /\bOption [A-H]\b|\([A-H]\)|(?<![A-Za-z&’'\/-])[B-H](?![A-Za-z&’'\/])/.test(why)) fails.push("mentions an option letter in the summary");
  why = String(why || "").trim();
  const words = why.split(/\s+/).filter(Boolean).length;
  if (words < minWords) fails.push("too thin"); else if (words > maxWords) fails.push("too long");
  if (HEDGES.test(why)) fails.push("hedging");
  if (/\b(guarantee[sd]?|guaranteeing)\b/i.test(why) && !/guarantee/i.test(src)) fails.push("overclaim");
  const allowed = new Set(stdNumbers(q.o.map(o => o[1]).join(" ")));
  for (const n of stdNumbers(why)) if (!allowed.has(n)) fails.push("standard " + n + " not in source");
  for (const m of why.matchAll(SOURCES)) if (!src.includes(m[0])) fails.push("outside source: " + m[0]);
  for (const c of orderClaims(q, why, subject)) fails.push("wrong order claim: " + c);
  if (/<|>/.test(why)) fails.push("markup");
  if (q.t === "best3" && /\b(rank|ranks|ranked|ranking|too high|too low|sits? (above|below)|higher than|lower than)\b/i.test(why)) fails.push("ranking wording in a best-three question");
  return fails;
}
// one call checks everything against the full correct order; returns the indexes it rejects
async function verifyAll(env, verifierKey, q, entries, facts, meter) {
  const order = q.t === "best3" ? `The best three are ${[...q.k].join(", ")}; the others are not.` : `The correct order, most to least appropriate, is ${[...q.k].join(" > ")}.`;
  const opts = q.o.map((o, i) => `${L[i]}: ${o[0]}\n   Justification: ${o[1]}`).join("\n");
  const sumLabel = facts && facts.over ? `[overall summary; the trainee over-valued ${sumOver(facts).join(", ") || "nothing"} and under-valued ${sumUnder(facts).join(", ") || "nothing"}: the summary is wrong if it says otherwise]` : "[overall summary]";
  const label = e => e.letter ? (q.t === "best3" ? `[about ${e.letter}, which is ${q.k.includes(e.letter) ? "one of" : "not one of"} the best three]` : `[about ${e.letter}, correct position ${["1st","2nd","3rd","4th","5th"][q.k.indexOf(e.letter)]}]`) : sumLabel;
  const list = entries.map((e, i) => `${i + 1}. ${label(e)} ${e.text}`).join("\n");
  const sys = "You check explanations for a dental training quiz. Reply with the numbers of any explanations that are wrong, separated by commas, or the single word NONE.";
  const user = `${order}\nOptions:\n${opts}\n\nExplanations:\n${list}\n\nCheck every comparison in each explanation, including ones that describe another option in words instead of naming its letter (for example "more helpful than suggesting he contact the TPD" refers to whichever option suggests that). Each explanation is labelled with the option it is about. Saying that option belongs in its correct position is right, not an error. Flag an explanation ONLY if it clearly contradicts the correct order (for example saying an option should be above one that is actually higher), or clearly contradicts a justification. Some options start with similar words: read each one fully before judging. If you are not sure something is wrong, do not flag it. Which explanations are wrong? Reply with their numbers, or NONE.`;
  try {
    const {text, usage} = await runModel(env, verifierKey, sys, user, 20); meter.n += usage.neurons;
    const t = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (/^\W*none\b/i.test(t)) return [];
    const nums = [...t.matchAll(/\d+/g)].map(m => +m[0] - 1).filter(i => i >= 0 && i < entries.length);
    return nums.length ? nums : entries.map((_, i) => i); // an unreadable verdict rejects everything (safe side)
  } catch { return entries.map((_, i) => i); }
}
// The headline is always written by code from the key, so it can't be wrong: the score, then where the marks went.
export function headline(q, facts) {
  const score = `You scored ${facts.marks} out of ${facts.max}.`;
  const names = cs => cs.length === 1 ? cs[0] : cs.slice(0, -1).join(", ") + " and " + cs[cs.length - 1];
  if (q.t === "best3") {
    const out = facts.over, inn = facts.under, parts = [];
    if (out.length) parts.push(`you chose ${names(out)}, which ${out.length > 1 ? "aren’t" : "isn’t"} in the best three`);
    if (inn.length) parts.push(`you missed ${names(inn)}, which ${inn.length > 1 ? "are" : "is"}`);
    const t = parts.join(", and ");
    return `${score} ${t[0].toUpperCase() + t.slice(1)}.`;
  }
  return `${score} Most marks went on ${names(facts.focus)}.`;
}
// The written justification stands in for a reason the model couldn't give. The row above it already states the position.
function fallback(q, item) { return q.o[L.indexOf(item.letter)][1]; }

export async function explain(env, q, facts, modelKey, verifierKey) {
  const meter = {n: 0};
  const user = promptFor(q, facts);
  let out = null, raw = "", error = null;
  for (let attempt = 0; attempt < 2 && !out; attempt++) {
    try {
      const r = await runModel(env, modelKey, systemFor(q), attempt ? user + "\n\nYour last reply was not valid JSON in the required shape. Reply with the JSON object only." : user, 900);
      raw = r.text; meter.n += r.usage.neurons;
      const p = parseJson(raw); if (p && Array.isArray(p.reasons)) out = p;
    } catch (e) { error = String(e && e.message || e); }
  }
  const items = facts.items.filter(it => facts.focus.includes(it.letter)).map(it => {
    const r = out && out.reasons.find(x => x && String(x.letter).toUpperCase() === it.letter);
    const why = r && typeof r.why === "string" ? british(r.why.trim()) : "";
    return {...it, model_why: why, fails: r ? check(q, why, 10, 45, it.letter) : ["missing"]};
  });
  // second opinion on everything that passed the rule checks
  const verify = async list => {
    const entries = list.map((e, i) => ({i, text: e.model_why, letter: e.letter, e})).filter(x => !x.e.fails.length);
    if (entries.length) { const bad = await verifyAll(env, verifierKey, q, entries, facts, meter); bad.forEach(k => entries[k].e.fails.push("verifier rejected")); }
  };
  await verify(items);
  // one repair pass: tell the writer exactly what was wrong with each rejected reason and let it try once more
  const failed = items.filter(it => it.fails.length && !it.fails.includes("missing"));
  if (out && failed.length) {
    try {
      const notes = failed.map(it => `${it.letter}: "${it.model_why}" was rejected because ${it.fails.map(f => f === "verifier rejected" ? "a checker found it inconsistent with the correct order or the justifications" : f).join("; ")}.`).join("\n");
      const r = await runModel(env, modelKey, systemFor(q), user + `\n\nThese reasons were rejected:\n${notes}\nRewrite ONLY those reasons so they follow every rule. Reply with JSON only: {"reasons":[{"letter":"X","why":"..."}]}`, 600);
      meter.n += r.usage.neurons;
      const p2 = parseJson(r.text);
      if (p2 && Array.isArray(p2.reasons)) {
        for (const it of failed) {
          const x = p2.reasons.find(y => y && String(y.letter).toUpperCase() === it.letter), why = x && typeof x.why === "string" ? british(x.why.trim()) : "";
          if (why) { it.model_why = why; it.fails = check(q, why, 10, 45, it.letter); }
        }
        await verify(failed);
      }
    } catch (e) {}
  }
  for (const it of items) { it.source = it.fails.length ? "fallback" : "ai"; it.why = it.fails.length ? fallback(q, it) : it.model_why; }
  const summary = {source: "written", text: headline(q, facts), fails: []};
  return {summary, items, right: facts.right, principle: q.tk, neurons: Math.round(meter.n * 10) / 10, error: error ? "model_error" : (out ? null : "bad_reply")};
}
