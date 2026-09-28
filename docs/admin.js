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

let data = null, range = 30, openQ = null, lastError = "", allOpen = false;
const getKey = () => { try { return sessionStorage.getItem(KEY_STORE) || localStorage.getItem(KEY_STORE) || ""; } catch (e) { return ""; } };
function setKey(k, remember){ try { sessionStorage.setItem(KEY_STORE, k); if (remember) localStorage.setItem(KEY_STORE, k); else localStorage.removeItem(KEY_STORE); } catch (e) {} }
function clearKey(){ try { sessionStorage.removeItem(KEY_STORE); localStorage.removeItem(KEY_STORE); } catch (e) {} }

async function load(){
  const key = getKey();
  if (!key) return renderLogin();
  el.innerHTML = `<p class="dmeta">Loading…</p>`;
  try {
    const r = await fetch(API + "/api/admin", {headers: {Authorization: "Bearer " + key}, cache: "no-store"});
    if (r.status === 401) { clearKey(); lastError = "That password wasn’t right."; return renderLogin(); }
    if (r.status === 503) { lastError = "The dashboard password hasn’t been set up in Cloudflare yet (the ADMIN_KEY secret)."; clearKey(); return renderLogin(); }
    if (r.status === 429) { lastError = "Too many attempts from this network. Try again in an hour."; return renderLogin(); }
    if (!r.ok) throw new Error("HTTP " + r.status);
    data = await r.json(); lastError = ""; render();
  } catch (e) { lastError = "Couldn’t reach the server. Check your connection and try again."; renderLogin(true); }
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
  let h = `<div class="dhead"><p class="dmeta">Updated ${new Date(data.generated).toLocaleString("en-GB", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"})} · counts come from people who have anonymous sharing turned on</p>
    <div class="row"><button class="btn small" id="refresh">Refresh</button><button class="btn small" id="signout">Sign out</button></div></div>`;
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
  h += `<section class="card"><h2 class="bh">Keys to recheck</h2><p class="muted">Questions where answers disagree with the key, worst first. “Average score” is how people score against the key, using the live test’s marking. “Agree on the top” is the share who put the keyed best option first (for best-three questions, who chose all three keyed options). Only questions with ${MIN_N}+ answers are judged. Click a row to see the question.</p>`;
  if (!flagged.length) h += `<p class="empty">${judged ? "No keys flagged. The community broadly agrees with every judged key." : `Not enough answers yet. Keys are judged once a question has ${MIN_N} answers.`}</p>`;
  else {
    h += `<div class="tscroll"><table class="rtable"><thead><tr><th>Question</th><th>Scenario</th><th>Answers</th><th>Average score</th><th>Agree on the top</th><th>Status</th></tr></thead><tbody>`;
    for (const x of flagged) h += qRow(x);
    h += `</tbody></table></div>`;
  }
  h += `<details class="datatoggle" id="allq"${allOpen ? " open" : ""}><summary>Show every question (${Q.length})</summary><div class="tscroll"><table class="rtable"><thead><tr><th>Question</th><th>Scenario</th><th>Answers</th><th>Average score</th><th>Agree on the top</th><th>Status</th></tr></thead><tbody>${qs.map(qRow).join("")}</tbody></table></div></details></section>`;
  h += `<section class="card"><h2 class="bh">“I disagree” comments</h2>`;
  const comments = data.feedback.filter(f => f.comment);
  h += comments.length ? `<div class="comments">${comments.map(f => { const q = Q[f.q - 1]; return `<div class="cmt"><div class="cm">${new Date(f.t).toLocaleDateString("en-GB", {day: "numeric", month: "short"})} · ${q ? `Paper ${q.p}, question ${q.n - (q.p - 1) * 32} · ${esc(q.a)}` : "Question " + esc(f.q)}</div>${esc(f.comment)}</div>`; }).join("")}</div>`
    : `<p class="empty">No written comments yet${data.feedback.length ? ` (${data.feedback.length} disagreement${data.feedback.length === 1 ? "" : "s"} without a comment)` : ""}.</p>`;
  h += `</section><section class="card"><h2 class="bh">Recent errors</h2>`;
  h += data.errors.length ? `<div class="tscroll"><table class="rtable"><thead><tr><th>When</th><th>Where</th><th>Message</th></tr></thead><tbody>${data.errors.map(e => `<tr><td>${new Date(e.t).toLocaleString("en-GB", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"})}</td><td>${e.kind === "server" ? "Server" : "Browser"}</td><td>${esc(e.msg)}</td></tr>`).join("")}</tbody></table></div>`
    : `<p class="empty">No errors logged.</p>`;
  h += `</section>`;
  el.innerHTML = h;
  wireTips("c-vis", vis, p => `${dayLabel(p.day)}<br><b>${fmtN(p.v)}</b> visitors · ${fmtN(p.row.views || 0)} page views · ${fmtN(p.row.app || 0)} app`, "line");
  wireTips("c-ans", ans, p => `${dayLabel(p.day)}<br><b>${fmtN(p.v)}</b> answers from ${fmtN(p.row.people || 0)} people`, "bar");
}
function dataTable(pts, ...cols){
  return `<div class="tscroll"><table class="rtable"><thead><tr><th>Day</th>${cols.map(c => `<th>${c[0]}</th>`).join("")}</tr></thead><tbody>${pts.slice().reverse().map(p => `<tr><td>${dayLabel(p.day)}</td>${cols.map(c => `<td>${fmtN(c[1](p))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
const FLAG_TEXT = {recheck: "Recheck", watch: "Watch", ok: "OK", few: "Too few answers"};
function qRow(x){
  const q = x.q, local = q.n - (q.p - 1) * 32;
  let h = `<tr class="qrow" data-q="${x.i}" tabindex="0" aria-expanded="${openQ === x.i}"><td>Paper ${q.p}, Q${local}</td><td>${esc(q.a)}</td><td>${fmtN(x.n)}</td><td>${x.n ? Math.round(x.avg * 100) + "%" : "–"}</td><td>${x.n ? Math.round(x.agree * 100) + "%" : "–"}</td><td><span class="flag ${x.flag}">${FLAG_TEXT[x.flag]}</span></td></tr>`;
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
  if (b && b.id === "signout") { clearKey(); data = null; lastError = ""; renderLogin(); return; }
  const row = e.target.closest(".qrow"); if (row) { const i = +row.dataset.q; openQ = openQ === i ? null : i; render(); }
});
el.addEventListener("toggle", e => { if (e.target.id === "allq") allOpen = e.target.open; }, true);
el.addEventListener("keydown", e => { const row = e.target.closest(".qrow"); if (row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); row.click(); } });
load();
