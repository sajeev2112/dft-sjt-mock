// Tests the "is there a newer version?" check (run: node tools/test-version.mjs). It runs the real checkForUpdate code from docs/app.js against stand-ins.
import fs from "node:fs";
const app = fs.readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");
const sw = fs.readFileSync(new URL("../docs/sw.js", import.meta.url), "utf8");
const ver = JSON.parse(fs.readFileSync(new URL("../docs/version.json", import.meta.url), "utf8")).v;
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL:", m); } };

// The three places that must agree
const build = app.match(/const BUILD = "([^"]*)";/)[1], swv = sw.match(/const VERSION = "([^"]*)";/)[1];
ok(/^[a-f0-9]{10}$/.test(ver), "version.json holds a 10-character build number");
ok(build === ver && swv === ver, `page build (${build}), service worker (${swv}) and version.json (${ver}) are the same`);
ok(/version\.json/.test(sw) && /return; \/\/ never cached/.test(sw), "the service worker never caches or intercepts version.json");
ok(/version\.json[\s\S]{0,60}no-store/.test(fs.readFileSync(new URL("../docs/_headers", import.meta.url), "utf8")), "version.json is served with no-cache, no-store");

// The real check, taken out of app.js
const start = app.indexOf("const checkForUpdate = async force => {"), end = app.indexOf("setTimeout(() => checkForUpdate(true)");
ok(start > 0 && end > start, "found checkForUpdate in app.js");
const body = app.slice(start, end);
async function run({build: b = "aaaaaaaaaa", online = true, res, force = false, quiet = false, dismissed = "", reloading = false, throwFetch = false, lastCheck = 0}) {
  const log = {fetched: 0, bar: 0, reload: 0, swUpdate: 0};
  const fn = new Function("navigator", "fetch", "BUILD", "reloadIfQuiet", "showUpdateBar", "swReg", "Date", `
    let reloading = ${reloading}, lastCheck = ${lastCheck}, updateWaiting = false, newest = "", dismissed = ${JSON.stringify(dismissed)};
    ${body}
    return async f => { await checkForUpdate(f); return {updateWaiting, newest}; };`);
  const nav = {onLine: online};
  const f = async () => { log.fetched++; if (throwFetch) throw new TypeError("offline"); return res; };
  const state = await fn(nav, f, b, () => { if (quiet) { log.reload++; return true; } return false; }, () => { log.bar++; }, {update: () => { log.swUpdate++; return Promise.resolve(); }}, Date)(force);
  return {...log, ...state};
}
const json = v => ({ok: true, json: async () => ({v})});
let r = await run({res: json("aaaaaaaaaa")});
ok(r.fetched === 1 && r.bar === 0 && r.reload === 0 && !r.updateWaiting, "same version: nothing is said and nothing reloads");
r = await run({res: json("bbbbbbbbbb")});
ok(r.bar === 1 && r.reload === 0 && r.updateWaiting && r.newest === "bbbbbbbbbb" && r.swUpdate === 1, "new version while busy: the banner is shown once and the offline copy is refreshed");
r = await run({res: json("bbbbbbbbbb"), quiet: true});
ok(r.reload === 1 && r.bar === 0, "new version on a quiet screen: reloads, no banner");
r = await run({res: json("bbbbbbbbbb"), dismissed: "bbbbbbbbbb"});
ok(r.bar === 0 && r.updateWaiting, "dismissed with Later: the banner is not shown again for the same version");
r = await run({res: json("cccccccccc"), dismissed: "bbbbbbbbbb"});
ok(r.bar === 1, "an even newer version brings the banner back");
for (const [name, res] of [["not found", {ok: false, json: async () => ({})}], ["nonsense number", json("nope")], ["empty", json("")], ["missing field", {ok: true, json: async () => ({})}], ["uppercase hex", json("BBBBBBBBBB")], ["broken JSON", {ok: true, json: async () => { throw new SyntaxError("x"); }}]]) {
  r = await run({res}); ok(r.bar === 0 && r.reload === 0 && !r.updateWaiting, `unusable answer (${name}): stays silent`);
}
r = await run({res: json("bbbbbbbbbb"), throwFetch: true}); ok(r.bar === 0 && r.reload === 0, "network error: stays silent");
r = await run({res: json("bbbbbbbbbb"), online: false}); ok(r.fetched === 0, "offline: no request is made");
r = await run({res: json("bbbbbbbbbb"), reloading: true}); ok(r.fetched === 0, "already reloading: no request is made");
r = await run({res: json("bbbbbbbbbb"), lastCheck: Date.now()}); ok(r.fetched === 0, "checked a moment ago: no request is made");
r = await run({res: json("bbbbbbbbbb"), lastCheck: Date.now(), force: true}); ok(r.fetched === 1 && r.bar === 1, "a forced check ignores the 2-minute spacing");
r = await run({build: "dev", res: json("bbbbbbbbbb")}); ok(r.bar === 0 && r.reload === 0, "an unbuilt page (no real build number) never prompts");
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
