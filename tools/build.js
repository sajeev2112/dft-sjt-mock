// Run after editing docs/questions.js:  node tools/build.js
// Validates every question and key, syncs the question-type list into the Worker,
// and stamps the service worker with a content hash so offline caches refresh.
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const root = path.join(__dirname, "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");

const ctx = {};
vm.runInNewContext(read("docs/questions.js") + ";this.Q=Q;this.THEMES=THEMES;this.DOMAINS=DOMAINS;", ctx);
const {Q, THEMES, DOMAINS} = ctx;
const errors = [];
Q.forEach((q, i) => {
  const id = `Q${i + 1}`;
  if (!["rank", "consider", "best3"].includes(q.t)) errors.push(`${id}: bad type`);
  if (!DOMAINS[q.d]) errors.push(`${id}: bad domain`);
  if (!THEMES[q.g]) errors.push(`${id}: bad theme`);
  const n = q.t === "best3" ? 8 : 5;
  if (!Array.isArray(q.o) || q.o.length !== n) errors.push(`${id}: needs ${n} options`);
  else q.o.forEach((o, j) => { if (!o[0] || !o[1]) errors.push(`${id}: option ${j + 1} missing text or justification`); });
  if (q.t === "best3") { if (!/^[A-H]{3}$/.test(q.k) || new Set(q.k).size !== 3) errors.push(`${id}: bad best-three key ${q.k}`); }
  else if (q.k.split("").sort().join("") !== "ABCDE") errors.push(`${id}: bad ranking key ${q.k}`);
  if (!q.s || !q.tk || !q.a) errors.push(`${id}: missing scenario, takeaway or archetype`);
});
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }

// Difficulty audit (warnings only): the answer shouldn’t be guessable from length or giveaway wording.
const GIVEAWAY = /\b(lie|lying|pretend|ignore|shout|tell (?:her|him|them) off|refuse to discuss|in front of (?:the )?(?:patient|patients|everyone)|threaten|humiliat|make fun|say nothing)\b/i;
const warnings = [];
Q.forEach((q, i) => {
  const len = j => q.o[j][0].length, keyed = q.t === "best3" ? q.k.split("").map(c => "ABCDEFGH".indexOf(c)) : [q.k[0], q.k[1]].map(c => "ABCDE".indexOf(c));
  const rest = q.o.map((_, j) => j).filter(j => !keyed.includes(j));
  const avg = a => a.reduce((s, j) => s + len(j), 0) / a.length;
  const ratio = avg(keyed) / avg(rest);
  if (ratio > 1.3) warnings.push(`Q${i + 1}: keyed options are ${Math.round((ratio - 1) * 100)}% longer than the rest`);
  q.o.forEach(([t], j) => { if (GIVEAWAY.test(t)) warnings.push(`Q${i + 1} option ${"ABCDEFGH"[j]}: giveaway wording “${t.match(GIVEAWAY)[0]}”`); });
});
if (warnings.length) console.warn(`${warnings.length} difficulty warning(s):\n  ` + warnings.join("\n  "));

const types = Q.map(q => q.t === "best3" ? "b" : "r").join("");
const worker = read("src/worker.js").replace(/\/\/ TYPES:start[\s\S]*?\/\/ TYPES:end/, `// TYPES:start\nconst QTYPES = "${types}";\n// TYPES:end`);
fs.writeFileSync(path.join(root, "src/worker.js"), worker);

const files = ["index.html", "styles.css", "design.css", "questions.js", "guide.js", "app.js", "design.js", "phrases.js", "standards.js", "manifest.webmanifest"];
const hash = crypto.createHash("sha256"); files.forEach(f => hash.update(read("docs/" + f)));
hash.update(read("docs/sw.js").replace(/const VERSION = "[^"]*";/, "")); // changes to the service worker itself also rotate the cache
const version = hash.digest("hex").slice(0, 10);
fs.writeFileSync(path.join(root, "docs/sw.js"), read("docs/sw.js").replace(/const VERSION = "[^"]*";/, `const VERSION = "${version}";`));

const count = k => Q.filter(q => q.t === k).length;
console.log(`OK: ${Q.length} questions (${count("rank")} rank, ${count("consider")} consider, ${count("best3")} best-three). SW version ${version}.`);
