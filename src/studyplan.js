// "Study plan" (Beta): turns a trainee's own practice statistics into a short revision plan, using Cloudflare Workers AI.
//
// How it stays correct:
//   1. The browser works out the statistics (docs/studyplan.js) and sends ONLY numbers and codes, never answers or free text.
//   2. This code validates every field against the question bank's themes, areas and action types, then writes the facts
//      itself. The model never sees anything the trainee typed.
//   3. The model writes the wording as JSON. Rules check it (only the given focus areas, only numbers from the facts, no
//      outside sources, sensible lengths) and a second model checks the claims against the facts.
//   4. Anything that fails is reported as "written", and the page keeps showing the plain study plan the browser built.
// Cost: shares the daily free-allowance counter with "Explain my mistake" (reserveNeurons), plus a per-network hourly limit.
import { runModel, parseJson, british, SOURCES, reserveNeurons, settleNeurons } from "./explain.js";
import { THEMES, DOMAINS, TAGS, QA, QG, SECTIONS, TAG_READ } from "./study-data.js";

const MODEL = "gpt-oss-120b", VERIFIER = "llama-3.3-70b";
const RESERVE = 420;
const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
const num = (v, lo, hi) => typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;
const list = (v, max) => Array.isArray(v) && v.length <= max ? v : null;

// Returns clean facts, or null if anything is malformed. Only values from the question bank's own vocabulary get through.
export function cleanProfile(b) {
  if (!b || typeof b !== "object") return null;
  if (!int(b.answered, 20, QA.length) || !int(b.pct, 0, 100)) return null;
  const themes = list(b.themes, 12), areas = list(b.areas, 4), h = b.habits || {};
  if (!themes || !areas) return null;
  const out = {answered: b.answered, pct: b.pct, themes: [], areas: [], habits: [], repeats: [], weakQs: {}, pace: null, trend: null};
  const seen = new Set();
  for (const t of themes) {
    if (!t || !THEMES[t.g] || seen.has(t.g) || !int(t.n, 1, QA.length) || !int(t.pct, 0, 100)) return null;
    seen.add(t.g); out.themes.push({g: t.g, name: THEMES[t.g], pct: t.pct, n: t.n});
  }
  const seenD = new Set();
  for (const a of areas) {
    if (!a || !DOMAINS[a.d] || seenD.has(a.d) || !int(a.n, 1, QA.length) || !int(a.pct, 0, 100)) return null;
    seenD.add(a.d); out.areas.push({name: DOMAINS[a.d], pct: a.pct, n: a.n});
  }
  out.themes.sort((x, y) => x.pct - y.pct); out.areas.sort((x, y) => x.pct - y.pct);
  const habit = (arr, kind) => {
    const l = list(arr, 3); if (!l) return false;
    const seenT = new Set();
    for (const x of l) {
      if (!x || !TAGS[x.tag] || seenT.has(x.tag) || !int(x.n, 1, 500)) return false;
      seenT.add(x.tag);
      if (kind === "rate") { if (!num(x.avg, -4, 4)) return false; out.habits.push({tag: x.tag, label: TAGS[x.tag], kind: x.avg > 0 ? "over" : "under", n: x.n, avg: Math.round(Math.abs(x.avg) * 10) / 10}); }
      else out.habits.push({tag: x.tag, label: TAGS[x.tag], kind, n: x.n});
    }
    return true;
  };
  if (!habit(h.rank, "rate") || !habit(h.picked, "picked") || !habit(h.missed, "missed")) return null;
  const rp = list(b.repeats, 8); if (!rp) return null;
  for (const q of rp) { if (!int(q, 1, QA.length) || out.repeats.includes(q)) return null; out.repeats.push(q); }
  // the questions that cost the most marks in each of the weakest themes (each must really belong to that theme)
  if (b.weakQs != null) {
    if (typeof b.weakQs !== "object" || Array.isArray(b.weakQs)) return null;
    const keys = Object.keys(b.weakQs); if (keys.length > 4) return null;
    for (const g of keys) {
      const l = list(b.weakQs[g], 3); if (!THEMES[g] || !l) return null;
      for (const q of l) if (!int(q, 1, QA.length) || QG[q - 1] !== g) return null;
      out.weakQs[g] = l.slice();
    }
  }
  if (b.pace != null) {
    const p = b.pace; if (!p || !int(p.avg, 1, 900) || !int(p.slow, 0, QA.length) || !int(p.n, 1, QA.length)) return null;
    out.pace = {avg: p.avg, slow: p.slow, n: p.n};
  }
  if (b.trend != null) {
    const t = b.trend; if (!t || !int(t.recent, 0, 100) || !int(t.earlier, 0, 100)) return null;
    out.trend = {recent: t.recent, earlier: t.earlier};
  }
  return out;
}

// The order of priorities is decided here, not by the model: a theme counts as weak if it is under 60% or 5+ points below the average;
// the strongest habit and any repeated mistakes or slow pace come next; the model only explains each one.
function prioritise(p, weak) {
  const out = [], theme = weak.filter(t => t.pct < 60 || t.pct <= p.pct - 5);
  if (theme[0]) out.push(theme[0].name);
  if (p.habits[0]) out.push("Habit: " + p.habits[0].label);
  if (p.repeats.length >= 2 && out.length < 3) out.push("Repeated mistakes");
  if (p.pace && (p.pace.slow > 0 || p.pace.avg > 113) && out.length < 3) out.push("Pace");
  for (const t of theme.slice(1)) if (out.length < 3) out.push(t.name);
  for (const t of weak) if (out.length < 2 && !out.includes(t.name)) out.push(t.name);
  if (out.length < 2 && p.repeats.length) out.push("Repeated mistakes");
  return out.slice(0, 3);
}
const mmss = s => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
// The facts the model is given, as plain sentences, plus the exact focus names it may use.
export function factsOf(p) {
  const lines = [], focus = [];
  lines.push(`The trainee has answered ${p.answered} of ${QA.length} practice questions and scores ${p.pct}% on average (the live test's marking).`);
  const weak = p.themes.filter(t => t.n >= 2).slice(0, 4);
  weak.forEach(t => {
    const qs = (p.weakQs[t.g] || []).map(q => QA[q - 1]);
    lines.push(`Theme "${t.name}": ${t.pct}% over ${t.n} questions${t.n < 8 ? " (a small sample)" : ""}.${qs.length ? ` Questions that cost the most marks here: ${qs.join("; ")}.` : ""}`); focus.push(t.name);
  });
  const strong = p.themes.filter(t => t.n >= 2).slice(-2).reverse();
  if (p.themes.length > 4) lines.push("Strongest themes: " + strong.map(t => `"${t.name}" ${t.pct}%`).join(", ") + ".");
  lines.push("Areas: " + p.areas.map(a => `${a.name} ${a.pct}%`).join(", ") + ".");
  for (const h of p.habits) {
    const name = "Habit: " + h.label; focus.push(name);
    lines.push(h.kind === "over" ? `${name} — the trainee ranks options like this about ${h.avg} places higher than the key does, on average over ${h.n} options.`
      : h.kind === "under" ? `${name} — the trainee ranks options like this about ${h.avg} places lower than the key does, on average over ${h.n} options.`
      : h.kind === "picked" ? `${name} — the trainee chose such options ${h.n} times in best-three questions where they were not among the best three.`
      : `${name} — the trainee left out such options ${h.n} times in best-three questions where they were among the best three.`);
  }
  if (p.repeats.length) { focus.push("Repeated mistakes"); lines.push(`Repeated mistakes: ${p.repeats.length} questions lost marks on the last two attempts. Topics: ${p.repeats.map(q => QA[q - 1]).join("; ")}.`); }
  if (p.pace) { focus.push("Pace"); lines.push(`Pace: ${mmss(p.pace.avg)} per timed question on average over ${p.pace.n} timed questions (the live test allows about 1:53). ${p.pace.slow} of them took over 3 minutes.`); }
  if (p.trend) lines.push(`Trend: ${p.trend.recent}% over the last week against ${p.trend.earlier}% before that.`);
  const priorities = prioritise(p, weak);
  // the playbook sections to read for each priority, chosen here (never by the model)
  const sections = {};
  for (const f of priorities) {
    const ids = [];
    const th = p.themes.find(t => t.name === f), hb = p.habits.find(h => "Habit: " + h.label === f);
    if (th) ids.push(th.g, "traps", "technique");
    else if (hb) ids.push(TAG_READ[hb.tag], hb.kind === "picked" || hb.kind === "missed" ? "technique" : "traps");
    else if (f === "Repeated mistakes") ids.push("technique", "checklist");
    else if (f === "Pace") ids.push("technique", "checklist");
    sections[f] = [...new Set(ids)].filter(id => SECTIONS[id]).slice(0, 3).map(id => ({id, title: SECTIONS[id].title}));
  }
  const playbook = {}; for (const f of priorities) for (const x of sections[f]) playbook[x.title] = SECTIONS[x.id].text;
  return {text: lines.join("\n"), focus, priorities, sections, playbook};
}

const SYSTEM = `You are a thoughtful revision coach for a UK Dental Foundation Training trainee. You get facts from analysis of their practice-question results, the priorities to cover, and extracts from the site's playbook. Write a revision plan with real depth: explain what the pattern in their results suggests and exactly what to read and do about it.

Reply with JSON only:
{"overview":"...","priorities":[{"focus":"...","why":"...","read":"...","do":"..."}],"this_week":"..."}

- "overview": 3 to 4 sentences, 50 to 110 words: where the trainee stands, the story the numbers tell together (strengths as well as weaknesses), and what to tackle first.
- "priorities": exactly the priorities given, in the order given, one item each; "focus" is that priority's exact name.
  - "why": 4 to 6 sentences, 60 to 130 words. Explain what the facts show, what the pattern suggests about how the trainee is approaching these questions (interpretation is welcome when it follows from the facts; use words like "this suggests"), and why fixing it will gain marks.
  - "read": 2 to 3 sentences, 30 to 80 words. Name exact titles from that priority's playbook sections (given in "playbook_sections") and say which parts or ideas in them to read and what to look for, quoting or closely following what the extract says.
  - "do": 2 to 3 sentences, 30 to 80 words: concrete steps. For a theme: the Practise button for that theme, then comparing each answer with the written justification. For a Habit: a check to run inside each question ("when an option is about X, ask yourself ...") and what to compare afterwards. For Repeated mistakes: the My mistakes quiz. For Pace: timing yourself against the live-test pace in the facts. Each priority's steps must differ. Use only these site tools.
- "this_week": 3 to 4 sentences, 50 to 110 words: a day-by-day plan for the next few days built from the priorities.
- Facts only: numbers must come from the facts or the playbook extracts (give no minutes, days or question counts of your own except "a few days" style wording). Never say the key is wrong. No predictions about passing, no medical or legal advice, no outside books, courses or websites.
- Never mention a pass mark, cut-off, ranking or what score is "enough": nothing about that is in the facts. Playbook extracts describe what usually ranks high or low; you may say the playbook lists something as ranking low, but never say the trainee chose it unless the facts say so.
- A "Habit" is a tendency to over- or under-rate a kind of action; describe it exactly as the facts say (higher or lower than the key, or chosen or left out), never the reverse. Mention a small sample when the facts say so.
- Say "you". British English: "practise" is the verb, "practice" the noun; write 62% with no space.`;

export function check(plan, facts) {
  const fails = [], words = t => String(t || "").trim().split(/\s+/).filter(Boolean).length;
  const inRange = (t, lo, hi, what) => { const n = words(t); if (n < lo || n > hi) fails.push(`${what} length ${n}`); };
  if (!plan || typeof plan !== "object") return ["not an object"];
  inRange(plan.overview, 35, 140, "overview"); inRange(plan.this_week, 35, 140, "this_week");
  const pr = Array.isArray(plan.priorities) ? plan.priorities : [];
  if (pr.map(p => String(p && p.focus || "").trim().toLowerCase()).join("|") !== facts.priorities.map(f => f.toLowerCase()).join("|")) fails.push("priorities are not the ones given, in order");
  for (const p of pr) {
    inRange(p && p.why, 40, 170, "why"); inRange(p && p.read, 20, 110, "read"); inRange(p && p.do, 20, 110, "do");
    const titles = (facts.sections[facts.priorities.find(f => f.toLowerCase() === String(p && p.focus || "").trim().toLowerCase())] || []).map(x => x.title);
    if (titles.length && !titles.some(t => String(p && p.read || "").includes(t))) fails.push("read does not name a given playbook section");
  }
  const all = [plan.overview, plan.this_week, ...pr.flatMap(p => [p && p.why, p && p.read, p && p.do])].join(" ");
  const source = facts.text + " " + Object.values(facts.playbook).join(" ") + " " + Object.keys(facts.playbook).join(" ");
  const allowedNums = new Set([...source.matchAll(/\d+/g)].map(m => m[0]));
  const factTimes = [...source.matchAll(/(\d+):(\d\d)/g)].map(m => +m[1] * 60 + +m[2]); // times may be rounded a few seconds ("about 1:50")
  // Percentages, times and larger figures must come from the facts. Small plain counts are allowed in plans of action
  // (up to 30: "Day 2", "10 questions") and in descriptions (up to 12: "three themes"), since the checker model reviews the claims.
  const numbersIn = (text, smallMax) => { for (const m of String(text || "").matchAll(/(\d+(?::\d+)?)(\s?%)?/g)) {
    const n = m[1], plain = !m[2] && !n.includes(":");
    if (plain && +n <= smallMax) continue;
    if (n.includes(":")) { const secs = t => { const [m, x] = t.split(":").map(Number); return m * 60 + x; }; if (factTimes.some(f => Math.abs(f - secs(n)) <= 10)) continue; }
    if (!allowedNums.has(n) && !n.split(":").every(x => allowedNums.has(String(+x)) || allowedNums.has(x))) fails.push("number not in facts: " + n); } };
  numbersIn(plan.overview, 12); numbersIn(plan.this_week, 30);
  for (const p of pr) { numbersIn(p && p.why, 12); numbersIn(p && p.read, 12); numbersIn(p && p.do, 30); }
  if (/\b(Std|Standards?\s+\d)/.test(all)) fails.push("standard cited");
  for (const m of all.matchAll(SOURCES)) if (!source.includes(m[0])) fails.push("outside source: " + m[0]);
  if (/\b(you will|you'll) pass\b|\bguarantee/i.test(all)) fails.push("prediction");
  if (/\b(pass mark|pass rate|cut-?off|passing score|pass the)\b/i.test(all)) fails.push("mentions a pass mark");
  if (/<|>/.test(all)) fails.push("markup");
  return fails;
}
async function verify(env, facts, plan, meter) {
  const claims = [plan.overview, ...plan.priorities.map(p => `${p.focus}: ${p.why} ${p.read} ${p.do}`), plan.this_week];
  const sys = "You check study-plan text against facts. Reply with the numbers of any claims that state something the facts do not support or that contradict the facts, separated by commas, or the single word NONE.";
  const user = `Facts:\n${facts.text}\n\nClaims:\n${claims.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nA claim is wrong if it reverses a habit (higher or lower than the key, chosen or left out), swaps a percentage between themes, names a theme with the wrong strength, or adds a fact not given. Advice on what to do is fine. Which claims are wrong? Reply with numbers or NONE.`;
  try {
    const r = await runModel(env, VERIFIER, sys, user, 20); meter.n += r.usage.neurons;
    return /^\W*none\b/i.test(r.text.replace(/<think>[\s\S]*?<\/think>/g, "").trim());
  } catch { return false; }
}

export async function studyPlanHandler(request, env, ctx, cors, {allow, readJson, json}) {
  const body = await readJson(request, 4096);
  const profile = cleanProfile(body);
  if (!profile) return json({error: "bad_profile"}, 400, cors);
  if (!env.AI) return json({ok: true, source: "written", reason: "unavailable"}, 200, cors);
  if (!(await allow(request, env, ctx, 1, "plan"))) return json({error: "rate_limited"}, 429, cors);
  const day = await reserveNeurons(env, RESERVE);
  if (!day) return json({ok: true, source: "written", reason: "budget"}, 200, cors);
  const facts = factsOf(profile), meter = {n: 0};
  let plan = null, fails = ["no reply"];
  try {
    const user = `Priorities, in this order: ${JSON.stringify(facts.priorities)}\n\nFacts:\n${facts.text}\n\nplaybook_sections (by priority):\n${JSON.stringify(Object.fromEntries(facts.priorities.map(f => [f, Object.fromEntries(facts.sections[f].map(x => [x.title, SECTIONS[x.id].text]))])), null, 1)}`;
    for (let attempt = 0; attempt < 2 && fails.length; attempt++) {
      const r = await runModel(env, MODEL, SYSTEM, attempt ? user + `\n\nYour last reply was rejected because: ${fails.join("; ")}. Reply with corrected JSON only.` : user, 2500);
      meter.n += r.usage.neurons;
      const p = parseJson(r.text);
      if (p) { const tidy = t => t.replace(/(\d) %/g, "$1%"); for (const k of ["overview", "this_week"]) if (typeof p[k] === "string") p[k] = tidy(british(p[k].trim())); if (Array.isArray(p.priorities)) p.priorities = p.priorities.map(x => x && ({focus: String(x.focus || "").trim(), why: tidy(british(String(x.why || "").trim())), read: tidy(british(String(x.read || "").trim())), do: tidy(british(String(x.do || "").trim()))})); }
      fails = check(p, facts);
      if (!fails.length && !(await verify(env, facts, p, meter))) fails = ["a checker found a claim the facts do not support"];
      plan = p;
    }
  } catch (e) { fails = ["model error"]; }
  finally { await settleNeurons(env, day, RESERVE, Math.round(meter.n * 10) / 10 || RESERVE); }
  if (fails.length) return json({ok: true, source: "written", reason: "checks"}, 200, cors);
  const focusName = f => facts.focus.find(x => x.toLowerCase() === f.toLowerCase());
  return json({ok: true, source: "ai", plan: {overview: plan.overview, priorities: plan.priorities.map(p => ({focus: focusName(p.focus), why: p.why, read: p.read, do: p.do, sections: facts.sections[focusName(p.focus)] || []})), this_week: plan.this_week}}, 200, cors);
}
