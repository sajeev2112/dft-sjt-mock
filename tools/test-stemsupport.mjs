// Tests the stem-support check (tools/stem-support.js, run by tools/build.js): run with node tools/test-stemsupport.mjs.
// Checks on the real bank (loaded as tools/build.js loads it, nothing written to disk):
// - the original Q270 wording (options about "discharges" and "theatre", stem only "waiting to go home") is flagged,
//   and the fixed wording is not;
// - the live bank is clean once tools/stem-support-allow.json is applied, and a normal question is not flagged;
// - the allowlist only covers the words it names (a new unsupported word still warns);
// - markup in stems and options (<br>, &amp;, tags) is ignored.
import fs from "node:fs";
import vm from "node:vm";
import {createRequire} from "node:module";
const require = createRequire(import.meta.url);
const {stemSupport, describe} = require("./stem-support.js");
const read = f => fs.readFileSync(new URL("../" + f, import.meta.url), "utf8");
let pass = 0, fail = 0;
const check = (name, ok) => { if (ok) pass++; else { fail++; console.log("FAIL", name); } };
const ctx = {}; vm.runInNewContext(read("docs/questions.js") + ";this.Q=Q;", ctx);
const Q = JSON.parse(JSON.stringify(ctx.Q)), allow = JSON.parse(read("tools/stem-support-allow.json"));
const flagged = (bank, al = {}) => stemSupport(bank, al).map(r => r.q);

// Q270: fixed wording passes, original wording is caught
const i270 = 269, fixed = Q[i270].s;
check("Q270 is the op-notes question", /op notes/.test(fixed));
check("fixed Q270 not flagged", !flagged(Q).includes(270));
const orig = fixed.replace("; their discharge letters need the op notes.", ".").replace("scrubbed in theatre for", "scrubbed for");
check("original Q270 wording rebuilt", orig !== fixed && !/discharge|theatre/.test(orig));
const Qorig = Q.map((q, i) => i === i270 ? {...q, s: orig} : q);
const r270 = stemSupport(Qorig, allow).find(r => r.q === 270);
check("original Q270 flagged even with the allowlist", !!r270);
check("original Q270 names discharge and theatre", r270 && ["disch", "theat"].every(p => r270.found.some(f => f.p === p)));
check("describe() is readable", r270 && /Q270: options rely on “discharge/.test(describe(r270)));

// The live bank: a small number of findings, all reviewed in the allowlist
const raw = flagged(Q);
check("raw findings stay small (under 10% of questions)", raw.length > 0 && raw.length < Q.length * 0.1);
check("live bank clean with the allowlist", flagged(Q, allow).length === 0);
check("every allowlisted question is a real finding (no stale entries)", Object.keys(allow).filter(k => k[0] !== "_").every(k => raw.includes(+k)));
check("a normal question (Q1) is not flagged", !raw.includes(1));

// The allowlist covers only the words it names
const some = stemSupport(Q).find(r => r.found.length === 1);
const partial = {[some.q]: {words: ["zzzzz"]}};
check("allowlist with other words does not silence a finding", flagged(Q, partial).includes(some.q));
check("allowlist with the right word silences it", !flagged(Q, {[some.q]: {words: [some.found[0].p]}}).includes(some.q));

// Markup is ignored: words inside tags or entities neither support nor trigger
const syn = (s, opts, just = "Because the gazebo matters.") => ({t: "rank", s, o: opts.map(t => [t, just])});
const pad = Array.from({length: 60}, (_, k) => syn(`Filler scenario ${k} about a routine check-up.`, ["Ask the nurse.", "Tell your ES.", "Write the notes.", "Phone the patient.", "Wait a day."], "Because."));
const opts = ["Tell the gazebo keeper now.", "Ask about the gazebo rota first.", "Email the gazebo team.", "Check the notes.", "Wait until tomorrow."];
const bare = [syn("A patient is upset in the waiting room.", opts), ...pad];
check("synthetic unsupported word is flagged", flagged(bare).includes(1));
check("word only inside a tag does not count as support", flagged([syn('A patient is upset.<span class="gazebo"></span>', opts), ...pad]).includes(1));
check("word in stem with <br> and &amp; around it counts", !flagged([syn("A patient is upset.<br>The gazebo&amp;garden is closed.", opts), ...pad]).includes(1));
check("markup in options is not read as words", !flagged([syn("A patient is upset.", ["Tell the <b class=\"gazebo\">nurse</b>.", "Ask <i data-x=\"gazebo\">her</i>.", "Email the team.", "Check the notes.", "Wait."]), ...pad]).includes(1));

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
