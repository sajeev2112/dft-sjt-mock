// Tests which unhandled rejections the site reports as its own (run: node tools/test-errors.mjs)
import fs from "node:fs";
const app = fs.readFileSync(new URL("../docs/app.js", import.meta.url), "utf8");
const a = app.indexOf("function foreignRejection(r){"), b = app.indexOf('window.addEventListener("unhandledrejection"');
if (a < 0 || b < a) throw new Error("foreignRejection not found");
const foreign = new Function(app.slice(a, b) + "\nreturn foreignRejection;")();
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log("FAIL:", m); } };
const err = (message, stack) => ({message, stack});
ok(foreign(err("Invalid call to runtime.sendNativeMessage(). The operation couldn’t be completed. (SFErrorDomain error 3.).")), "the Safari extension error from the dashboard is ignored");
ok(foreign(err("x", "at https://dft-sjt-mock.sajeev-r13.workers.dev/app.js:10:5\nat safari-web-extension://abc/content.js:1:1")), "a stack that mentions a browser extension is ignored");
ok(foreign(err("boom", "Error: boom\n    at https://cdn.example.com/other.js:1:1")), "a stack with none of our scripts is ignored (someone else's code)");
ok(foreign("SFErrorDomain error 3") === true, "a plain string reason with the extension marker is ignored");
ok(!foreign(err("Cannot read properties of undefined", "TypeError: Cannot read\n    at render (https://dft-sjt-mock.sajeev-r13.workers.dev/app.js:812:9)")), "a real error in app.js is still reported");
ok(!foreign(err("bad", "at https://sajeev2112.github.io/dft-sjt-mock/exam.js:55:3")), "a real error in exam.js is still reported");
ok(!foreign(err("no stack available")), "an error with no stack and no extension marker is still reported");
ok(!foreign(null) && !foreign(undefined) && !foreign(""), "empty reasons do not crash and are still reported");
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
