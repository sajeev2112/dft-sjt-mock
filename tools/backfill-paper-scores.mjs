// One-off backfill for the Progress page's "better than X% of people" on the practice papers (run once at release).
// Reads an export of answers_v2 (each person's first answer to each question) and writes an SQL file of
//   INSERT OR IGNORE INTO mock_scores (client, no, p, t)
// with no = 100 + paper (101-109), one row per person who has answered all 32 questions of that paper, scored exactly as the
// page scores a paper (marks gained / marks possible, rounded to a whole %; analyse() from src/explain.js on the displayed
// options, as Explain my mistake uses). OR IGNORE: a score the browser already sent is never overwritten.
// Usage:
//   npx wrangler d1 execute dft-sjt-stats --remote --json --command "SELECT client,q,a FROM answers_v2 WHERE q<=288" > export.json
//   node tools/backfill-paper-scores.mjs export.json backfill.sql      (prints counts and score spreads per paper, no ids)
//   npx wrangler d1 execute dft-sjt-stats --remote --file backfill.sql
// The mock_scores table must exist first (the Worker creates it on its first request after deploying).
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { analyse } from "../src/explain.js";
import BANK from "../src/explain-bank.js";

const PAPER_BASE = 100, PAPERS = 9, PER = 32, L = "ABCDEFGH";

// rows: [{client, q, a}] as stored (a = displayed option numbers: a ranking in your order, a best-three's picks).
// Returns [{client, no, p}] for every complete paper. Pure; tested by tools/test-progress.mjs.
export function scorePapers(rows, bank = BANK){
  const by = new Map(); // client -> Map(q -> marks/max)
  for (const r of rows || []) {
    const q = Number(r && r.q), c = r && r.client;
    if (typeof c !== "string" || !/^[A-Za-z0-9-]{8,64}$/.test(c) || !Number.isInteger(q) || q < 1 || q > PAPERS * PER || !bank[q - 1] || typeof r.a !== "string" || !/^[0-7]+$/.test(r.a)) continue;
    const x = analyse(bank[q - 1], [...r.a].map(d => L[+d]).join(""));
    if (!x) continue;
    if (!by.has(c)) by.set(c, new Map());
    if (!by.get(c).has(q)) by.get(c).set(q, x); // first answer only, as stored
  }
  const out = [];
  for (const [client, qs] of by) for (let n = 1; n <= PAPERS; n++) {
    let g = 0, m = 0, k = 0;
    for (let q = (n - 1) * PER + 1; q <= n * PER; q++) { const x = qs.get(q); if (x) { g += x.marks; m += x.max; k++; } }
    if (k === PER) out.push({client, no: PAPER_BASE + n, p: Math.round(g / m * 100)});
  }
  return out;
}
export function toSql(scores, t){
  return scores.map(s => `INSERT OR IGNORE INTO mock_scores (client, no, p, t) VALUES ('${s.client}', ${s.no}, ${s.p}, ${t});`).join("\n") + "\n";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [inp, outp] = process.argv.slice(2);
  if (!inp || !outp) { console.error("usage: node tools/backfill-paper-scores.mjs export.json backfill.sql"); process.exit(1); }
  const j = JSON.parse(fs.readFileSync(inp, "utf8")), rows = Array.isArray(j) && j[0] && Array.isArray(j[0].results) ? j.flatMap(x => x.results) : j; // wrangler's --json wrapper, or plain rows
  const scores = scorePapers(rows);
  fs.writeFileSync(outp, toSql(scores, Date.now()));
  console.log(`${rows.length} answers read; ${scores.length} complete papers written to ${outp}`);
  for (let n = 1; n <= PAPERS; n++) {
    const ps = scores.filter(s => s.no === PAPER_BASE + n).map(s => s.p).sort((a, b) => a - b);
    console.log(`Paper ${n}: ${ps.length} people` + (ps.length ? ` · scores ${ps[0]}% / median ${ps[Math.floor((ps.length - 1) / 2)]}% / ${ps[ps.length - 1]}% (min / median / max)` : ""));
  }
}
