// Stem-support check (warnings only, run by tools/build.js; tested by tools/test-stemsupport.mjs).
// Catches options that rely on something the scenario never mentions, e.g. options about "the discharge letters" and
// "the theatre door" when the stem only says patients are "waiting to go home" (Q270, Nov 2026).
// Crude and deterministic: a content word that turns up in two or more options but nowhere in the stem is suspicious,
// more so when it is rare across the bank, appears in three or more options, or the justifications lean on it too.
// Words are compared by their first 5 letters (so "discharge"/"discharges" match). Accepted findings go in
// tools/stem-support-allow.json as {"<question number>": {"words": ["<5-letter prefix>", ...], "why": "..."}}.
const PRE = 5;
const pre = w => w.replace(/'s$/, "").slice(0, PRE);
const clean = t => String(t).replace(/<[^>]+>/g, " ").replace(/&[a-z]+;|&#\d+;/g, " ").toLowerCase().replace(/[’‘]/g, "'");
const words = t => clean(t).match(/[a-z][a-z'-]*[a-z]/g) || [];
// Adverbs, -ing forms, past participles and abstract nouns/adjectives: they describe the action, not a thing the stem must supply.
const ABSTRACT = /(ly|ing|ed|al|ive|ous|ful|ible|able|ance|ence|ment|tion|sion|ity|ness|ism|ise|ize|ure|ary|ent|ant|ic)$/;
// Function words and generic connectives that slip past the length filter.
const STOP = new Set(("about above after again against already although always among another anyone anything around asked before being " +
  "below between could doesn't during either every exact first further having haven't instead later least maybe might never other " +
  "others perhaps point quite rather really since still their there these thing things those though three through today tomorrow " +
  "under until whether which while within without would words yourself earlier keeps taken turns").split(" ").map(pre));
const THRESHOLD = 3.5;

function stemSupport(Q, allow = {}) {
  const N = Q.length, dfOpt = {}, dfStem = {};
  Q.forEach(q => {
    new Set(q.o.flatMap(o => words(o[0]).map(pre))).forEach(p => { dfOpt[p] = (dfOpt[p] || 0) + 1; });
    new Set(words(q.s).map(pre)).forEach(p => { dfStem[p] = (dfStem[p] || 0) + 1; });
  });
  const out = [];
  Q.forEach((q, i) => {
    const stem = new Set(words(q.s).map(pre)), hits = {};
    q.o.forEach(([text], j) => {
      const ws = words(text);
      // skip the option's first word (usually its verb: "Tell", "Ask", "Write")
      new Set(ws.slice(1).filter(w => w.length >= 5 && !ABSTRACT.test(w.replace(/s$/, ""))).map(pre)).forEach(p => {
        const h = hits[p] = hits[p] || {opts: new Set(), just: 0, word: ws.find(w => pre(w) === p)};
        h.opts.add(j);
      });
    });
    q.o.forEach(([, just]) => new Set(words(just).map(pre)).forEach(p => { if (hits[p]) hits[p].just++; }));
    const found = Object.entries(hits)
      .filter(([p, h]) => h.opts.size >= 2 && !stem.has(p) && !STOP.has(p) && dfOpt[p] <= N * 0.05 && (dfStem[p] || 0) <= N * 0.08)
      .map(([p, h]) => ({p, word: h.word, opts: h.opts.size, just: h.just,
        score: (h.opts.size - 1) + Math.min(h.just, 3) * 0.5 + (dfOpt[p] <= N * 0.02 ? 0.5 : 0)}));
    const score = found.reduce((s, f) => s + f.score, 0);
    if (score < THRESHOLD) return;
    const ok = allow[String(i + 1)];
    if (ok && found.every(f => (ok.words || []).includes(f.p))) return;
    out.push({q: i + 1, score, found});
  });
  return out;
}
const describe = r => `Q${r.q}: options rely on ${r.found.map(f => `“${f.word}” (${f.opts} options${f.just ? `, ${f.just} justifications` : ""})`).join(", ")}, not in the stem`;
module.exports = {stemSupport, describe, pre, THRESHOLD};
