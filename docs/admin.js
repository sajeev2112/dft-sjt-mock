"use strict";
// Private dashboard. The page holds no data; everything comes from /api/admin, which needs the ADMIN_KEY password.

const WORKER = "https://dft-sjt-mock.sajeev-r13.workers.dev";
const API = (location.protocol === "file:" || location.hostname.endsWith("github.io")) ? WORKER : "";
const KEY_STORE = "dft-sjt-admin-key";
const MIN_N = 5; // answers needed before a key is judged
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtN = n => Number(n || 0).toLocaleString("en-GB");
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const dayLabel = d => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", {day: "numeric", month: "short"});
const el = document.getElementById("dash");

let data = null, range = 30, openQ = null, lastError = "", allOpen = false, qFilter = "", autoTimer = null, lastAlertKey = "";
const getKey = () => { try { return sessionStorage.getItem(KEY_STORE) || localStorage.getItem(KEY_STORE) || ""; } catch (e) { return ""; } };
function setKey(k, remember){ try { sessionStorage.setItem(KEY_STORE, k); if (remember) localStorage.setItem(KEY_STORE, k); else localStorage.removeItem(KEY_STORE); } catch (e) {} }
function clearKey(){ try { sessionStorage.removeItem(KEY_STORE); localStorage.removeItem(KEY_STORE); } catch (e) {} }

async function load(silent){
  const key = getKey();
  if (!key) return renderLogin();
  if (!silent) el.innerHTML = `<p class="dmeta">Loading…</p>`;
  try {
    const r = await fetch(API + "/api/admin", {headers: {Authorization: "Bearer " + key}, cache: "no-store"});
    if (r.status === 401) { clearKey(); lastError = "That password wasn’t right."; return renderLogin(); }
    if (r.status === 503) { lastError = "The dashboard password hasn’t been set up in Cloudflare yet (the ADMIN_KEY secret)."; clearKey(); return renderLogin(); }
    if (r.status === 429) { if (silent && data) return; lastError = "Too many attempts from this network. Try again in an hour."; return renderLogin(); }
    if (!r.ok) throw new Error("HTTP " + r.status);
    data = await r.json(); lastError = ""; render();
  } catch (e) { if (silent && data) return; lastError = "Couldn’t reach the server. Check your connection and try again."; renderLogin(true); }
}

function renderLogin(keepKey){
  el.innerHTML = `<section class="card login"><h2 class="bh">Sign in</h2>
    <p class="muted">Enter the dashboard password you set as the <b>ADMIN_KEY</b> secret in Cloudflare.</p>
    <form id="loginform" class="login"><label class="lbl" for="pw">Password</label>
      <input type="password" id="pw" autocomplete="current-password" required>
      <label class="toggle"><input type="checkbox" id="remember"> <span>Remember on this device</span></label>
      ${lastError ? `<p class="err" role="alert">${esc(lastError)}</p>` : ""}
      <div class="row"><button class="btn primary" type="submit">Open dashboard</button>${keepKey && getKey() ? `<button class="btn" type="button" id="retry">Retry</button>` : ""}</div></form></section>`;
  document.getElementById("loginform").addEventListener("submit", e => { e.preventDefault(); const v = document.getElementById("pw").value.trim(); if (!v) return; setKey(v, document.getElementById("remember").checked); load(); });
  document.getElementById("retry")?.addEventListener("click", load);
  document.getElementById("pw").focus();
}

// ---------- question analysis ----------
function analyse(){
  const byQ = {};
  for (const row of data.distributions) (byQ[row.q] = byQ[row.q] || []).push(row);
  return Q.map((q, i) => {
    const rows = byQ[i + 1] || [], rank = q.t !== "best3", max = rank ? 20 : 12, keyIdx = q.k.split("").map(c => L.indexOf(c));
    let n = 0, sum = 0, topAgree = 0;
    const pos = q.o.map(() => [0, 0, 0, 0, 0]), picks = q.o.map(() => 0);
    for (const {a, c} of rows) {
      const ans = a.split("").map(Number);
      if (rank ? ans.length !== 5 : ans.length !== 3) continue;
      n += c;
      if (rank) {
        let s = 0; keyIdx.forEach((o, kp) => { s += Math.max(0, 4 - Math.abs(ans.indexOf(o) - kp)); });
        sum += s * c; if (ans[0] === keyIdx[0]) topAgree += c;
        ans.forEach((o, p) => pos[o][p] += c);
      } else {
        const hit = ans.filter(o => keyIdx.includes(o)).length;
        sum += hit * 4 * c; if (hit === 3) topAgree += c;
        ans.forEach(o => picks[o] += c);
      }
    }
    const avg = n ? sum / (n * max) : null, agree = n ? topAgree / n : null;
    const flag = n < MIN_N ? "few" : (avg < 0.6 || agree < 0.4) ? "recheck" : avg < 0.75 ? "watch" : "ok";
    return {i, q, n, avg, agree, flag, pos, picks, rank, keyIdx};
  });
}

// ---------- charts ----------
function series(rows, field, days){
  const map = Object.fromEntries(rows.map(r => [r.day, r]));
  const out = [], end = new Date(); end.setUTCHours(12, 0, 0, 0);
  for (let k = days - 1; k >= 0; k--) { const d = new Date(end - k * 864e5).toISOString().slice(0, 10); out.push({day: d, v: Number((map[d] || {})[field] || 0), row: map[d] || {}}); }
  return out;
}
function niceMax(v){ if (v <= 4) return 4; const p = Math.pow(10, Math.floor(Math.log10(v))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p; return 10 * p; }
function chart(id, pts, kind){
  const W = 560, H = 200, pl = 36, pr = 10, pt = 10, pb = 26, iw = W - pl - pr, ih = H - pt - pb;
  const max = niceMax(Math.max(...pts.map(p => p.v), 1)), n = pts.length, step = iw / n;
  const x = i => pl + step * i + step / 2, y = v => pt + ih - v / max * ih;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}-t">`;
  for (const f of [0, .5, 1]) { const v = max * f; s += `<line class="gl" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${fmtN(v)}</text>`; }
  if (kind === "line") {
    const line = pts.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
    s += `<polygon class="area" points="${x(0)},${y(0)} ${line} ${x(n - 1)},${y(0)}"/><polyline class="ln" points="${line}"/>`;
    s += `<circle class="pt" cx="${x(n - 1)}" cy="${y(pts[n - 1].v)}" r="4"/>`;
    s += `<line class="xh" id="${id}-xh" x1="0" x2="0" y1="${pt}" y2="${pt + ih}" visibility="hidden"/>`;
  } else {
    const bw = Math.max(2, Math.min(18, step - 2));
    pts.forEach((p, i) => { if (p.v) { const h = Math.max(1, ih - (y(p.v) - pt)), top = y(p.v); s += `<path class="bar" data-i="${i}" d="M${x(i) - bw / 2},${pt + ih} V${top + Math.min(4, h)} Q${x(i) - bw / 2},${top} ${x(i) - bw / 2 + Math.min(4, bw / 2)},${top} H${x(i) + bw / 2 - Math.min(4, bw / 2)} Q${x(i) + bw / 2},${top} ${x(i) + bw / 2},${top + Math.min(4, h)} V${pt + ih} Z"/>`; } });
  }
  const labelEvery = Math.ceil(n / 6);
  pts.forEach((p, i) => { if (i % labelEvery === 0 || i === n - 1) s += `<text class="ax" x="${x(i)}" y="${H - 8}" text-anchor="middle">${dayLabel(p.day)}</text>`; });
  pts.forEach((p, i) => { s += `<rect class="hit" data-i="${i}" x="${pl + step * i}" y="${pt}" width="${step}" height="${ih}"/>`; });
  return s + `</svg>`;
}
function wireTips(cardId, pts, fmt, kind){
  const card = document.getElementById(cardId), svg = card.querySelector("svg"), tip = card.querySelector(".tip"), xh = card.querySelector(".xh");
  const show = e => {
    const r = e.target.closest(".hit"); if (!r) return;
    const i = +r.dataset.i, box = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, sx = box.width / vb.width;
    const cx = (+r.getAttribute("x") + +r.getAttribute("width") / 2);
    tip.innerHTML = fmt(pts[i]); tip.hidden = false;
    // Position relative to the card (SVG elements have no offsetLeft), and keep the tooltip inside it.
    const cb = card.getBoundingClientRect(), half = tip.offsetWidth / 2;
    const left = Math.min(cb.width - half - 8, Math.max(half + 8, box.left - cb.left + cx * sx));
    tip.style.left = left + "px"; tip.style.top = (box.top - cb.top + 10 * sx) + "px";
    if (xh) { xh.setAttribute("x1", cx); xh.setAttribute("x2", cx); xh.setAttribute("visibility", "visible"); }
    card.querySelectorAll(".bar").forEach(b => b.classList.toggle("hot", +b.dataset.i === i));
  };
  const hide = () => { tip.hidden = true; if (xh) xh.setAttribute("visibility", "hidden"); card.querySelectorAll(".bar.hot").forEach(b => b.classList.remove("hot")); };
  svg.addEventListener("mousemove", show); svg.addEventListener("mouseleave", hide);
  svg.addEventListener("touchstart", e => show({target: document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)}), {passive: true});
}

// ---------- page ----------
function render(){
  const t = data.totals || {}, qs = analyse();
  const vis = series(data.visits, "visitors", range), ans = series(data.answersByDay, "answers", range);
  const sumV = vis.reduce((s, p) => s + p.v, 0), sumA = ans.reduce((s, p) => s + p.v, 0);
  const todayV = vis[vis.length - 1].v;
  const flagged = qs.filter(x => x.flag === "recheck" || x.flag === "watch").sort((a, b) => a.avg - b.avg);
  const judged = qs.filter(x => x.flag !== "few").length;
  let h = alertBanner() + `<div class="dhead"><p class="dmeta">Updated ${new Date(data.generated).toLocaleString("en-GB", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"})} · counts come from people who have anonymous sharing turned on</p>
    <div class="row"><label class="toggle auto"><input type="checkbox" id="auto"${autoOn() ? " checked" : ""}> <span>Check every 2 min</span></label><button class="btn small" id="refresh">Refresh</button><button class="btn small" id="signout">Sign out</button></div></div>`;
  h += `<div class="tiles6">
    <div class="tile"><span class="tl">Visitors, all time</span><span class="tv">${fmtN(t.visitors)}</span><span class="sub2">${fmtN(todayV)} today</span></div>
    <div class="tile"><span class="tl">Returning visitors</span><span class="tv">${fmtN(t.returning_visitors)}</span><span class="sub2">${pct(t.returning_visitors, t.visitors)}% came back on another day</span></div>
    <div class="tile"><span class="tl">Home-screen app users</span><span class="tv">${fmtN(t.app_users)}</span><span class="sub2">${pct(t.app_users, t.visitors)}% of visitors</span></div>
    <div class="tile"><span class="tl">People answering</span><span class="tv">${fmtN(t.answering)}</span><span class="sub2">${fmtN(t.answers)} answers in total</span></div>
    <div class="tile"><span class="tl">Keys to recheck</span><span class="tv">${qs.filter(x => x.flag === "recheck").length}</span><span class="sub2">${judged} of ${Q.length} questions have ${MIN_N}+ answers</span></div>
    <div class="tile"><span class="tl">“I disagree” comments</span><span class="tv">${fmtN(t.feedback)}</span><span class="sub2">${data.errors.length ? data.errors.length + " recent errors logged" : "no recent errors"}</span></div></div>`;
  h += `<div class="filters"><span class="plabel" style="margin:0">Charts show</span><div class="seg" role="group" aria-label="Date range">${[7, 30, 90].map(d => `<button type="button" data-range="${d}" aria-pressed="${range === d}">${d} days</button>`).join("")}</div></div>`;
  h += `<div class="charts">
    <div class="chartcard" id="c-vis"><h3 id="cv-t">Visitors per day</h3><p class="cap">${fmtN(sumV)} visits in the last ${range} days</p>${chart("cv", vis, "line")}<div class="tip" hidden></div>
      <details class="datatoggle"><summary>Show as a table</summary>${dataTable(vis, ["Visitors", r => r.v], ["Page views", r => r.row.views || 0], ["App users", r => r.row.app || 0])}</details></div>
    <div class="chartcard" id="c-ans"><h3 id="ca-t">Answers per day</h3><p class="cap">${fmtN(sumA)} first-attempt answers in the last ${range} days</p>${chart("ca", ans, "bar")}<div class="tip" hidden></div>
      <details class="datatoggle"><summary>Show as a table</summary>${dataTable(ans, ["Answers", r => r.v], ["People", r => r.row.people || 0])}</details></div></div>`;
  h += growthCard(vis) + mockCard() + aiCard() + syncCard() + timeCard(qs) + rankCard(qs);
  h += `<section class="card"><h2 class="bh">Keys to recheck</h2><p class="muted">Questions where answers disagree with the key, worst first. “Average score” is how people score against the key, using the live test’s marking. “Agree on the top” is the share who put the keyed best option first (for best-three questions, who chose all three keyed options). Only questions with ${MIN_N}+ answers are judged. Click a row to see the question.</p>`;
  if (!flagged.length) h += `<p class="empty">${judged ? "No keys flagged. The community broadly agrees with every judged key." : `Not enough answers yet. Keys are judged once a question has ${MIN_N} answers.`}</p>`;
  else {
    h += `<div class="tscroll"><table class="rtable"><thead><tr><th>Question</th><th>Scenario</th><th>Answers</th><th>Average score</th><th>Agree on the top</th><th>Status</th></tr></thead><tbody>`;
    for (const x of flagged) h += qRow(x);
    h += `</tbody></table></div>`;
  }
  h += `<details class="datatoggle" id="allq"${allOpen ? " open" : ""}><summary>Show every question (${Q.length})</summary><div class="qtools"><input type="search" id="qsearch" placeholder="Search by paper, question number, topic or status" aria-label="Search questions" value="${esc(qFilter)}"><button class="btn small" type="button" id="csv-q">Download question stats (CSV)</button><button class="btn small" type="button" id="csv-c">Download comments (CSV)</button><span class="dmeta" id="qcount" aria-live="polite"></span></div><div class="tscroll"><table class="rtable"><thead><tr><th>Question</th><th>Scenario</th><th>Answers</th><th>Average score</th><th>Agree on the top</th><th>Status</th></tr></thead><tbody>${qs.map(qRow).join("")}</tbody></table></div></details></section>`;
  h += `<section class="card"><h2 class="bh">“I disagree” comments</h2>`;
  const comments = data.feedback.filter(f => f.comment);
  h += comments.length ? `<div class="comments">${comments.map(f => { const q = Q[f.q - 1]; return `<div class="cmt"><div class="cm">${new Date(f.t).toLocaleDateString("en-GB", {day: "numeric", month: "short"})} · ${q ? `Paper ${q.p}, question ${q.n - (q.p - 1) * 32} · ${esc(q.a)}` : "Question " + esc(f.q)}</div>${esc(f.comment)}</div>`; }).join("")}</div>`
    : `<p class="empty">No written comments yet${data.feedback.length ? ` (${data.feedback.length} disagreement${data.feedback.length === 1 ? "" : "s"} without a comment)` : ""}.</p>`;
  h += `</section><section class="card" id="errs"><h2 class="bh">Recent errors</h2>`;
  const groups = errorGroups();
  h += groups.length ? `<div class="tscroll"><table class="rtable"><thead><tr><th>Latest</th><th>Where</th><th>Message</th><th>Times</th></tr></thead><tbody>${groups.map(e => `<tr><td>${new Date(e.t).toLocaleString("en-GB", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"})}</td><td>${e.kind === "server" ? "Server" : "Browser"}</td><td>${esc(e.msg)}</td><td>${fmtN(e.n)}</td></tr>`).join("")}</tbody></table></div>`
    : `<p class="empty">No errors logged.</p>`;
  h += `</section>`;
  el.innerHTML = h;
  wireTips("c-vis", vis, p => `${dayLabel(p.day)}<br><b>${fmtN(p.v)}</b> visitors · ${fmtN(p.row.views || 0)} page views · ${fmtN(p.row.app || 0)} app`, "line");
  wireTips("c-ans", ans, p => `${dayLabel(p.day)}<br><b>${fmtN(p.v)}</b> answers from ${fmtN(p.row.people || 0)} people`, "bar");
  const nv = series(data.newVisitors || [], "n", range), vmap = Object.fromEntries(vis.map(p => [p.day, p.v]));
  wireTips("c-new", nv, p => `${dayLabel(p.day)}<br><b>${fmtN(p.v)}</b> new · ${fmtN(Math.max(0, (vmap[p.day] || 0) - p.v))} returning`, "bar");
  const aiS = series((data.ai || {}).days || [], "n", range);
  wireTips("c-ai", aiS, p => `${dayLabel(p.day)}<br><b>${fmtN(Math.round(p.v))}</b> of ${fmtN((data.ai || {}).cap)} AI units`, "bar");
  const sy = series((data.sync || {}).days || [], "n", range);
  wireTips("c-sync", sy, p => `${dayLabel(p.day)}<br><b>${fmtN(p.v)}</b> accounts last synced`, "bar");
  applyFilter(); watchAlerts();
}

// ---------- error alerts ----------
const HOUR = 36e5;
const autoOn = () => { try { return localStorage.getItem("dft-sjt-admin-auto") === "1"; } catch (e) { return false; } };
function errorGroups(){
  const m = new Map();
  for (const e of data.errors) { const k = e.kind + "|" + e.msg; const g = m.get(k); if (g) { g.n++; g.t = Math.max(g.t, e.t); } else m.set(k, {...e, n: 1}); }
  return [...m.values()].sort((a, b) => b.t - a.t);
}
// red: any server error in the last hour; amber: 3+ browser errors in the last hour, or the free AI allowance used up
function alerts(){
  const now = Date.now(), recent = data.errors.filter(e => now - e.t < HOUR), out = [];
  const server = recent.filter(e => e.kind === "server"), client = recent.filter(e => e.kind !== "server");
  if (server.length) out.push({lv: "red", text: `${server.length} server error${server.length === 1 ? "" : "s"} in the last hour. Latest: ${server[0].msg}`});
  if (client.length >= 3) out.push({lv: "amber", text: `${client.length} browser errors in the last hour. Latest: ${client[0].msg}`});
  const ai = data.ai, used = ai && ((ai.days.find(d => d.day === new Date().toISOString().slice(0, 10)) || {}).n || 0);
  if (ai && used >= ai.cap) out.push({lv: "amber", text: "Today’s free AI allowance is used up, so “Explain my mistake” is showing the written explanations."});
  return out;
}
function alertBanner(){
  const a = alerts();
  document.title = (a.length ? "(" + a.length + ") " : "") + "DFT SJT Site Dashboard";
  if (!a.length) return `<p class="alertok" role="status">All clear: no errors in the last hour.</p>`;
  return `<div class="alerts" role="alert">${a.map(x => `<p class="alert ${x.lv}"><b>${x.lv === "red" ? "Needs attention" : "Worth a look"}:</b> ${esc(x.text)} <a href="#errs">See errors</a></p>`).join("")}</div>`;
}
// With "check every 2 min" on, the page refreshes itself and sends a desktop notification when a new alert appears.
function watchAlerts(){
  clearInterval(autoTimer); autoTimer = autoOn() ? setInterval(() => load(true), 12e4) : null;
  const key = alerts().map(a => a.text).join("|");
  if (key && key !== lastAlertKey && lastAlertKey !== "" && autoOn()) { try { if (window.Notification && Notification.permission === "granted") new Notification("DFT SJT site alert", {body: alerts()[0].text}); } catch (e) {} }
  lastAlertKey = key;
}

// ---------- extra sections ----------
const qLabel = q => `Paper ${q.p}, Q${q.n - (q.p - 1) * 32}`;
const rate = o => o && o.n ? pct(o.back, o.n) + "%" : "–";
const rateSub = (o, d) => o && o.n ? `${fmtN(o.back)} of ${fmtN(o.n)} people first seen ${d}+ days ago came back within ${d} days` : `Not enough history yet (needs people first seen ${d}+ days ago)`;
function weekStart(day){ const d = new Date(day + "T12:00:00Z"), dow = (d.getUTCDay() + 6) % 7; return new Date(d - dow * 864e5).toISOString().slice(0, 10); }
function growthCard(vis){
  const nv = series(data.newVisitors || [], "n", range), vmap = Object.fromEntries(vis.map(p => [p.day, p.v]));
  const sumNew = nv.reduce((s, p) => s + p.v, 0), sumVis = vis.reduce((s, p) => s + p.v, 0), r = data.retention || {};
  const weeks = {};
  for (const v of data.visits) { const w = weeks[weekStart(v.day)] = weeks[weekStart(v.day)] || {visits: 0, views: 0, app: 0, fresh: 0}; w.visits += v.visitors; w.views += v.views || 0; w.app += v.app || 0; }
  for (const n of data.newVisitors || []) { const w = weeks[weekStart(n.day)]; if (w) w.fresh += n.n; }
  const wk = Object.keys(weeks).sort().slice(-8).reverse();
  return `<section class="card"><h2 class="bh">Growth and retention</h2>
    <div class="tiles6"><div class="tile"><span class="tl">Came back within 7 days</span><span class="tv">${rate(r.d7)}</span><span class="sub2">${rateSub(r.d7, 7)}</span></div>
      <div class="tile"><span class="tl">Came back within 30 days</span><span class="tv">${rate(r.d30)}</span><span class="sub2">${rateSub(r.d30, 30)}</span></div>
      <div class="tile"><span class="tl">New in the last ${range} days</span><span class="tv">${fmtN(sumNew)}</span><span class="sub2">${pct(sumNew, sumVis)}% of ${fmtN(sumVis)} visits</span></div></div>
    <div class="gcols"><div class="chartcard" id="c-new"><h3 id="cn-t">New visitors per day</h3><p class="cap">People seen for the first time on each day</p>${chart("cn", nv, "bar")}<div class="tip" hidden></div>
      <details class="datatoggle"><summary>Show as a table</summary>${dataTable(nv, ["New", r => r.v], ["Returning", r => Math.max(0, (vmap[r.day] || 0) - r.v)])}</details></div>
    <div><p class="plabel" style="margin-top:0">Week by week</p><div class="tscroll"><table class="rtable"><thead><tr><th>Week starting</th><th>Visits</th><th>New people</th><th>Page views</th><th>App users</th></tr></thead><tbody>${wk.map(k => `<tr><td>${dayLabel(k)}</td><td>${fmtN(weeks[k].visits)}</td><td>${fmtN(weeks[k].fresh)}</td><td>${fmtN(weeks[k].views)}</td><td>${fmtN(weeks[k].app)}</td></tr>`).join("")}</tbody></table></div>
    <p class="muted">“Visits” adds up each day’s visitors, so someone who came on three days counts three times.</p></div></div></section>`;
}
const fmtSec = v => { v = Math.round(v); return Math.floor(v / 60) + ":" + String(v % 60).padStart(2, "0"); };
function mockCard(){
  const rows = data.mocks || [], by = (mode, st) => (rows.find(r => r.mode === mode && r.st === st) || {n: 0, ms: 0}), modes = [["exam", "Exam-style"], ["plain", "Plain"]];
  const sum = (mode, f) => ["finish", "expired", "abandoned", "live"].reduce((t, st) => t + f(by(mode, st), st), 0);
  const line = (mode, label) => { const done = by(mode, "finish").n + by(mode, "expired").n, ended = done + by(mode, "abandoned").n, avg = done ? (by(mode, "finish").ms * by(mode, "finish").n + by(mode, "expired").ms * by(mode, "expired").n) / done : 0;
    return `<tr><td>${label}</td><td>${fmtN(sum(mode, r => r.n))}</td><td>${fmtN(by(mode, "finish").n)}</td><td>${fmtN(by(mode, "expired").n)}</td><td>${fmtN(by(mode, "abandoned").n)}</td><td>${fmtN(by(mode, "live").n)}</td><td>${ended ? pct(done, ended) + "%" : "–"}</td><td>${done ? fmtSec(avg / 1000) : "–"}</td></tr>`; };
  const all = rows.reduce((t, r) => t + r.n, 0);
  const done = rows.filter(r => r.st === "finish" || r.st === "expired").reduce((t, r) => t + r.n, 0), ended = done + rows.filter(r => r.st === "abandoned").reduce((t, r) => t + r.n, 0);
  return `<section class="card half"><h2 class="bh">Timed mock completion</h2>
    <div class="tiles6"><div class="tile"><span class="tl">Mocks started</span><span class="tv">${fmtN(all)}</span><span class="sub2">${fmtN(rows.filter(r => r.st === "live").reduce((t, r) => t + r.n, 0))} still going</span></div>
      <div class="tile"><span class="tl">Completion rate</span><span class="tv">${ended ? pct(done, ended) + "%" : "–"}</span><span class="sub2">${ended ? `${fmtN(done)} of ${fmtN(ended)} that ended were handed in or ran to the end` : "No finished or abandoned mocks yet"}</span></div></div>
    ${all ? `<div class="tscroll"><table class="rtable"><thead><tr><th>Type</th><th>Started</th><th>Handed in</th><th>Ran out of time</th><th>Not finished</th><th>Still going</th><th>Completion</th><th>Average time used</th></tr></thead><tbody>${modes.map(m => line(m[0], m[1])).join("")}</tbody></table></div>` : `<p class="empty">No timed mocks recorded yet.</p>`}
    <p class="muted">Only mocks started after this feature went live are counted, and only for people with anonymous sharing on. “Not finished” means the clock started, nothing was handed in, and over 3 hours passed. Completion counts “handed in” and “ran out of time” as completed.</p></section>`;
}
function timeCard(qs){
  const tm = Object.fromEntries((data.times || []).map(t => [t.q, t])), rows = qs.map(x => ({x, t: tm[x.i + 1]})).filter(r => r.t);
  const mean = rs => { const n = rs.reduce((t, r) => t + r.t.n, 0); return n ? rs.reduce((t, r) => t + r.t.avg * r.t.n, 0) / n : 0; };
  const cnt = rs => rs.reduce((t, r) => t + r.t.n, 0);
  const rank = rows.filter(r => r.x.rank), best = rows.filter(r => !r.x.rank), papers = {};
  for (const r of rows) (papers[r.x.q.p] = papers[r.x.q.p] || []).push(r);
  const slow = rows.filter(r => r.t.n >= MIN_N).sort((a, b) => b.t.avg - a.t.avg).slice(0, 10);
  const tbl = (head, body) => `<div class="tscroll"><table class="rtable"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
  return `<section class="card half"><h2 class="bh">Time per question</h2>
    <div class="tiles6"><div class="tile"><span class="tl">Average, all questions</span><span class="tv">${rows.length ? fmtSec(mean(rows)) : "–"}</span><span class="sub2">${fmtN(cnt(rows))} timed answers</span></div>
      <div class="tile"><span class="tl">Ranking questions</span><span class="tv">${rank.length ? fmtSec(mean(rank)) : "–"}</span><span class="sub2">${fmtN(cnt(rank))} timed answers</span></div>
      <div class="tile"><span class="tl">Choose-three questions</span><span class="tv">${best.length ? fmtSec(mean(best)) : "–"}</span><span class="sub2">${fmtN(cnt(best))} timed answers</span></div></div>
    ${rows.length ? `<p class="plabel">Slowest questions</p>${slow.length ? tbl(["Question", "Scenario", "Timed answers", "Average time"], slow.map(r => `<tr><td>${qLabel(r.x.q)}</td><td>${esc(r.x.q.a)}</td><td>${fmtN(r.t.n)}</td><td>${fmtSec(r.t.avg)}</td></tr>`).join("")) : `<p class="empty">Questions need ${MIN_N}+ timed answers to be listed.</p>`}
    <p class="plabel">By paper</p>${tbl(["Paper", "Timed answers", "Average time"], Object.keys(papers).map(k => `<tr><td>Paper ${k}</td><td>${fmtN(cnt(papers[k]))}</td><td>${fmtSec(mean(papers[k]))}</td></tr>`).join(""))}` : `<p class="empty">No timings yet. They arrive when people use the practice timer and have anonymous sharing on.</p>`}
    <p class="muted">The live test allows about ${fmtSec(105 * 60 / 56)} per question. Times come from the practice timer (it pauses on Check answer), first attempts only; anything over 15 minutes is ignored.</p></section>`;
}
function aiCard(){
  const ai = data.ai; if (!ai) return "";
  const today = new Date().toISOString().slice(0, 10), used = Math.round(((ai.days.find(d => d.day === today) || {}).n) || 0);
  const up = ai.votes.reduce((s, v) => s + v.up, 0), down = ai.votes.reduce((s, v) => s + v.down, 0);
  const pctUsed = Math.min(100, pct(used, ai.cap)), aiS = series(ai.days, "n", range);
  const worst = ai.votes.filter(v => v.down > 0).sort((a, b) => b.down - a.down || a.up - b.up).slice(0, 8);
  return `<section class="card half"><h2 class="bh">“Explain my mistake” (AI)</h2>
    <div class="tiles6"><div class="tile"><span class="tl">Used today</span><span class="tv">${fmtN(used)}</span><span class="sub2">of ${fmtN(ai.cap)} free units · resets at 00:00 UTC</span><div class="meter" role="img" aria-label="${pctUsed}% of today’s allowance used"><span style="width:${pctUsed}%"></span></div></div>
      <div class="tile"><span class="tl">Found it helpful</span><span class="tv">${up + down ? pct(up, up + down) + "%" : "–"}</span><span class="sub2">${fmtN(up)} 👍 · ${fmtN(down)} 👎</span></div>
      <div class="tile"><span class="tl">Explanations saved</span><span class="tv">${fmtN(ai.cached)}</span><span class="sub2">reused for free, no AI cost</span></div></div>
    <div class="chartcard" id="c-ai"><h3 id="cai-t">AI units used per day</h3><p class="cap">The site stops using AI at ${fmtN(ai.cap)} a day, then shows the written explanation</p>${chart("cai", aiS, "bar")}<div class="tip" hidden></div></div>
    <p class="plabel">Most 👎 by question</p>${worst.length ? `<div class="tscroll"><table class="rtable"><thead><tr><th>Question</th><th>Scenario</th><th>👍</th><th>👎</th></tr></thead><tbody>${worst.map(v => { const q = Q[v.q - 1]; return `<tr><td>${q ? qLabel(q) : "Question " + v.q}</td><td>${q ? esc(q.a) : ""}</td><td>${fmtN(v.up)}</td><td>${fmtN(v.down)}</td></tr>`; }).join("")}</tbody></table></div>` : `<p class="empty">No 👎 votes yet.</p>`}</section>`;
}
function syncCard(){
  const sy = data.sync; if (!sy) return "";
  const pts = series(sy.days, "n", range);
  return `<section class="card half"><h2 class="bh">Sync accounts</h2>
    <div class="tiles6"><div class="tile"><span class="tl">Accounts</span><span class="tv">${fmtN(sy.total)}</span><span class="sub2">${pct(sy.total, (data.totals || {}).visitors)}% of visitors</span></div>
      <div class="tile"><span class="tl">Synced in the last 7 days</span><span class="tv">${fmtN(sy.active7)}</span><span class="sub2">${pct(sy.active7, sy.total)}% of accounts</span></div>
      <div class="tile"><span class="tl">Synced in the last 30 days</span><span class="tv">${fmtN(sy.active30)}</span><span class="sub2">${pct(sy.active30, sy.total)}% of accounts</span></div>
      <div class="tile"><span class="tl">Locked right now</span><span class="tv">${fmtN(sy.locked)}</span><span class="sub2">after repeated wrong PINs</span></div></div>
    <div class="chartcard" id="c-sync"><h3 id="cs-t">Accounts by last sync day</h3><p class="cap">Each account is counted once, on the day it last saved. The site doesn’t record when an account was created.</p>${chart("cs", pts, "bar")}<div class="tip" hidden></div></div>
    <p class="muted">Counts only. Account names, PINs and saved progress never reach this page.</p></section>`;
}
function rankCard(qs){
  const judged = qs.filter(x => x.n >= MIN_N), row = (x, c) => `<tr><td>${qLabel(x.q)}</td><td>${esc(x.q.a)}</td>${c}</tr>`;
  const hardest = judged.slice().sort((a, b) => a.avg - b.avg).slice(0, 10), popular = qs.filter(x => x.n).sort((a, b) => b.n - a.n).slice(0, 10);
  const papers = {};
  for (const x of qs) { const p = papers[x.q.p] = papers[x.q.p] || {n: 0, sum: 0, recheck: 0}; p.n += x.n; p.sum += (x.avg || 0) * x.n; if (x.flag === "recheck") p.recheck++; }
  const tbl = (head, rows) => `<div class="tscroll"><table class="rtable"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
  return `<section class="card"><h2 class="bh">Question rankings</h2>
    <div class="rcols"><div><p class="plabel" style="margin-top:0">Hardest questions</p><p class="muted">Lowest average score against the key. Only questions with ${MIN_N}+ answers.</p>${hardest.length ? tbl(["Question", "Scenario", "Answers", "Average score"], hardest.map(x => row(x, `<td>${fmtN(x.n)}</td><td>${Math.round(x.avg * 100)}%</td>`)).join("")) : `<p class="empty">Not enough answers yet.</p>`}
    </div><div><p class="plabel" style="margin-top:0">Most answered</p>${popular.length ? tbl(["Question", "Scenario", "Answers", "Average score"], popular.map(x => row(x, `<td>${fmtN(x.n)}</td><td>${x.n >= MIN_N ? Math.round(x.avg * 100) + "%" : "–"}</td>`)).join("")) : `<p class="empty">No answers yet.</p>`}
    </div><div><p class="plabel" style="margin-top:0">By paper</p>${tbl(["Paper", "Answers", "Average score", "Keys to recheck"], Object.keys(papers).map(k => { const p = papers[k]; return `<tr><td>Paper ${k}</td><td>${fmtN(p.n)}</td><td>${p.n ? Math.round(p.sum / p.n * 100) + "%" : "–"}</td><td>${p.recheck}</td></tr>`; }).join(""))}</div></div></section>`;
}

// ---------- search and downloads ----------
function applyFilter(){
  const f = qFilter.trim().toLowerCase(), rows = document.querySelectorAll("#allq .qrow");
  rows.forEach(r => { const hide = !!f && !r.dataset.text.includes(f); r.hidden = hide; const d = r.nextElementSibling; if (d && d.classList.contains("qdetail")) d.hidden = hide; });
  const note = document.getElementById("qcount"); if (note) note.textContent = f ? `${[...rows].filter(r => !r.hidden).length} of ${rows.length} questions match` : "";
}
const csvCell = v => { let t = String(v ?? ""); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return /[",\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
function download(name, rows){
  const blob = new Blob(["\ufeff" + rows.map(r => r.map(csvCell).join(",")).join("\r\n")], {type: "text/csv;charset=utf-8"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function exportQuestions(){
  const votes = Object.fromEntries(((data.ai || {}).votes || []).map(v => [v.q, v])), tms = Object.fromEntries((data.times || []).map(t => [t.q, t]));
  download("dft-sjt-question-stats.csv", [["Question", "Paper", "Question in paper", "Scenario", "Answers", "Average score %", "Agree on the top %", "Status", "AI thumbs up", "AI thumbs down", "Timed answers", "Average seconds"]].concat(
    analyse().map(x => [x.i + 1, x.q.p, x.q.n - (x.q.p - 1) * 32, x.q.a, x.n, x.n ? Math.round(x.avg * 100) : "", x.n ? Math.round(x.agree * 100) : "", FLAG_TEXT[x.flag], (votes[x.i + 1] || {}).up || 0, (votes[x.i + 1] || {}).down || 0, (tms[x.i + 1] || {}).n || 0, tms[x.i + 1] ? Math.round(tms[x.i + 1].avg) : ""])));
}
function exportComments(){
  download("dft-sjt-disagree-comments.csv", [["Date", "Question", "Paper", "Question in paper", "Scenario", "Comment"]].concat(
    data.feedback.map(f => { const q = Q[f.q - 1]; return [new Date(f.t).toISOString().slice(0, 10), f.q, q ? q.p : "", q ? q.n - (q.p - 1) * 32 : "", q ? q.a : "", f.comment || ""]; })));
}
function dataTable(pts, ...cols){
  return `<div class="tscroll"><table class="rtable"><thead><tr><th>Day</th>${cols.map(c => `<th>${c[0]}</th>`).join("")}</tr></thead><tbody>${pts.slice().reverse().map(p => `<tr><td>${dayLabel(p.day)}</td>${cols.map(c => `<td>${fmtN(c[1](p))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
const FLAG_TEXT = {recheck: "Recheck", watch: "Watch", ok: "OK", few: "Too few answers"};
function qRow(x){
  const q = x.q, local = q.n - (q.p - 1) * 32;
  const text = `${qLabel(q)} ${q.a} ${FLAG_TEXT[x.flag]} q${x.i + 1}`.toLowerCase();
  let h = `<tr class="qrow" data-q="${x.i}" data-text="${esc(text)}" tabindex="0" aria-expanded="${openQ === x.i}"><td>Paper ${q.p}, Q${local}</td><td>${esc(q.a)}</td><td>${fmtN(x.n)}</td><td>${x.n ? Math.round(x.avg * 100) + "%" : "–"}</td><td>${x.n ? Math.round(x.agree * 100) + "%" : "–"}</td><td><span class="flag ${x.flag}">${FLAG_TEXT[x.flag]}</span></td></tr>`;
  if (openQ === x.i) h += `<tr class="qdetail"><td colspan="6">${detail(x)}</td></tr>`;
  return h;
}
function detail(x){
  const q = x.q, comments = data.feedback.filter(f => f.q === x.i + 1);
  let h = `<p class="scn">${q.s}</p><table class="optt"><thead><tr><th></th><th>Option</th><th>${x.rank ? "Key position" : "In key"}</th><th>${x.rank ? "Most common position (share)" : "Picked by"}</th></tr></thead><tbody>`;
  q.o.forEach(([text], o) => {
    let key, comm;
    if (x.rank) {
      const kp = x.keyIdx.indexOf(o) + 1, row = x.pos[o], tot = row.reduce((a, b) => a + b, 0), best = row.indexOf(Math.max(...row));
      key = kp; comm = tot ? `${best + 1} (${pct(row[best], tot)}%)` : "–";
    } else {
      key = x.keyIdx.includes(o) ? "Yes" : ""; const share = x.n ? x.picks[o] / x.n : 0;
      comm = x.n ? `<span class="minibar" style="width:${Math.round(share * 80)}px"></span>${Math.round(share * 100)}%` : "–";
    }
    h += `<tr><td><span class="letter">${L[o]}</span></td><td>${text}</td><td>${key}</td><td>${comm}</td></tr>`;
  });
  h += `</tbody></table>`;
  if (comments.length) h += `<p class="plabel" style="margin-top:12px">Comments on this question</p><div class="comments">${comments.map(f => `<div class="cmt">${f.comment ? esc(f.comment) : "<i>Disagreed without a comment</i>"}</div>`).join("")}</div>`;
  return h;
}

el.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (b && b.dataset.range) { range = +b.dataset.range; render(); return; }
  if (b && b.id === "refresh") { load(); return; }
  if (b && b.id === "csv-q") { exportQuestions(); return; }
  if (b && b.id === "csv-c") { exportComments(); return; }
  if (b && b.id === "signout") { clearKey(); data = null; lastError = ""; renderLogin(); return; }
  const row = e.target.closest(".qrow"); if (row) { const i = +row.dataset.q; openQ = openQ === i ? null : i; render(); }
});
el.addEventListener("change", e => {
  if (e.target.id !== "auto") return;
  try { localStorage.setItem("dft-sjt-admin-auto", e.target.checked ? "1" : "0"); } catch (x) {}
  if (e.target.checked && window.Notification && Notification.permission === "default") Notification.requestPermission();
  watchAlerts();
});
el.addEventListener("input", e => { if (e.target.id === "qsearch") { qFilter = e.target.value; applyFilter(); } });
el.addEventListener("toggle", e => { if (e.target.id === "allq") allOpen = e.target.open; }, true);
el.addEventListener("keydown", e => { const row = e.target.closest(".qrow"); if (row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); row.click(); } });
load();
