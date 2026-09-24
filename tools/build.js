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

const types = Q.map(q => q.t === "best3" ? "b" : "r").join("");
const worker = read("src/worker.js").replace(/\/\/ TYPES:start[\s\S]*?\/\/ TYPES:end/, `// TYPES:start\nconst QTYPES = "${types}";\n// TYPES:end`);
fs.writeFileSync(path.join(root, "src/worker.js"), worker);

const files = ["index.html", "styles.css", "questions.js", "guide.js", "app.js", "manifest.webmanifest"];
const hash = crypto.createHash("sha256"); files.forEach(f => hash.update(read("docs/" + f)));
const version = hash.digest("hex").slice(0, 10);
fs.writeFileSync(path.join(root, "docs/sw.js"), read("docs/sw.js").replace(/const VERSION = "[^"]*";/, `const VERSION = "${version}";`));

const count = k => Q.filter(q => q.t === k).length;
console.log(`OK: ${Q.length} questions (${count("rank")} rank, ${count("consider")} consider, ${count("best3")} best-three). SW version ${version}.`);
