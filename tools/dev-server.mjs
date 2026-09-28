// Local development server: runs the real Worker (src/worker.js) with an in-memory SQLite stand-in for D1,
// and serves docs/ as the static assets. Usage: node tools/dev-server.mjs [port]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import worker from "../src/worker.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "docs");
const db = new DatabaseSync(":memory:");
class Stmt {
  constructor(sql){ this.sql = sql; this.args = []; }
  bind(...a){ this.args = a; return this; }
  async run(){ db.prepare(this.sql).run(...this.args); return {success: true}; }
  async first(){ return db.prepare(this.sql).get(...this.args) ?? null; }
  async all(){ return {results: db.prepare(this.sql).all(...this.args)}; }
  exec(){ const s = db.prepare(this.sql); return /^\s*(SELECT|INSERT.*RETURNING)/i.test(this.sql) ? {results: s.all(...this.args)} : (s.run(...this.args), {results: []}); }
}
const TYPES = {".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png"};
const ASSETS = { async fetch(req){
  let p = decodeURIComponent(new URL(req.url).pathname); if (p.endsWith("/")) p += "index.html";
  const f = path.join(root, p); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return new Response("Not found", {status: 404});
  return new Response(fs.readFileSync(f), {headers: {"Content-Type": TYPES[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-cache"}});
} };
const env = { DB: { prepare: sql => new Stmt(sql), batch: async st => st.map(s => s.exec()) }, ASSETS, ADMIN_KEY: "dev" };
const port = +(process.argv[2] || 8788);
http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c);
  const body = ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks);
  const r = await worker.fetch(new Request(`http://localhost:${port}${req.url}`, {method: req.method, headers: {...req.headers, "CF-Connecting-IP": "127.0.0.1"}, body}), env, {waitUntil(){}});
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
}).listen(port, () => console.log(`dev server on http://localhost:${port}`));
