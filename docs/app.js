"use strict";
// DFT SJT Mock Paper: practice sets, results, the guide, settings and anonymous community stats.

const PAPERS = {
  p1:{name:"Paper 1", from:0, to:32},
  p2:{name:"Paper 2", from:32, to:64},
  p3:{name:"Paper 3", from:64, to:96}
};
const PAPER_IDS = Object.keys(PAPERS).filter(id => Q.length >= PAPERS[id].to);
const PACE = 112.5; // seconds per item at live-test pace (105 min / 56)
const WORKER = "https://dft-sjt-mock.sajeev-r13.workers.dev";
const API = (location.protocol === "file:" || location.hostname.endsWith("github.io")) ? WORKER : "";
const GRIP = '<svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true"><g fill="currentColor"><circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/><circle cx="2" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="2" cy="14" r="1.5"/><circle cx="8" cy="14" r="1.5"/></g></svg>';
const isRank = q => q.t !== "best3";
const localNum = q => q.n - (q.p - 1) * 32; // 1–32 within its paper; q.n stays the site-wide ID used by the stats API
const range = (a, b) => Array.from({length: b - a}, (_, i) => a + i);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = s => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const pct = (g, m) => m ? Math.round(g / m * 100) : 0;
function uid(){ try { return crypto.randomUUID(); } catch(e) { return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12); } }
function shuffle(a){ a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- state ----------
const STORE = "dft-sjt-mock-v5", V4 = "dft-sjt-mock-v4";
function newSet(extra){ return Object.assign({ans:{}, chk:{}, marked:false, el:0, cur:0, mode:"practice", logged:false}, extra || {}); }
function fresh(){ return {v:5, ts:0, cid:uid(), share:true, view:"practice", setId:"p1", sets:{p1:newSet(), p2:newSet(), p3:newSet(), custom:null}, att:{}, days:{}, hist:[], sent:{}, outbox:[], fb:{}}; }
let S = fresh();
// Rebuilds state from untrusted JSON (localStorage, IndexedDB or a pasted progress code),
// keeping only well-formed values so nothing odd can reach the page or crash rendering.
const num = (v, max = 1e9) => { v = Number(v); return Number.isFinite(v) && v >= 0 && v <= max ? v : 0; };
const isQi = i => Number.isInteger(i) && i >= 0 && i < Q.length;
function cleanAns(qi, a){
  if (!a || typeof a !== "object") return null;
  if (isRank(Q[qi])) {
    const ord = Array.isArray(a.ord) ? a.ord.map(Number) : [];
    return ord.length === 5 && new Set(ord).size === 5 && ord.every(x => Number.isInteger(x) && x >= 0 && x < 5) ? {ord, set: !!a.set} : null;
  }
  const p = Array.isArray(a.p) ? [...new Set(a.p.map(Number))].filter(x => Number.isInteger(x) && x >= 0 && x < 8).slice(0, 3) : [];
  return {p};
}
function cleanSet(x, list){
  const set = newSet();
  if (!x || typeof x !== "object") return set;
  set.mode = x.mode === "exam" ? "exam" : "practice";
  set.marked = !!x.marked; set.logged = !!x.logged;
  set.el = Math.floor(num(x.el, 1e6)); set.cur = Math.floor(num(x.cur, list.length - 1));
  for (const k of Object.keys(x.ans || {})) { const i = +k; if (isQi(i) && list.includes(i)) { const a = cleanAns(i, x.ans[k]); if (a) set.ans[i] = a; } }
  for (const k of Object.keys(x.chk || {})) { const i = +k; if (isQi(i) && list.includes(i) && x.chk[k]) set.chk[i] = true; }
  return set;
}
function normalise(o){
  const s = fresh();
  if (!o || typeof o !== "object") return s;
  if (typeof o.cid === "string" && /^[A-Za-z0-9-]{8,64}$/.test(o.cid)) s.cid = o.cid;
  s.share = o.share !== false;
  s.ts = num(o.ts, 1e14);
  s.view = ["practice", "results", "guide", "settings"].includes(o.view) ? o.view : "practice";
  const sets = o.sets || {};
  for (const id of Object.keys(PAPERS)) s.sets[id] = cleanSet(sets[id], range(PAPERS[id].from, PAPERS[id].to));
  const c = sets.custom;
  if (c && Array.isArray(c.list)) {
    const list = [...new Set(c.list.map(Number))].filter(isQi);
    if (list.length) {
      s.sets.custom = Object.assign(cleanSet(c, list), {list, name: typeof c.name === "string" ? c.name.slice(0, 60) : "Quiz",
        kind: typeof c.kind === "string" ? c.kind.slice(0, 10) : "quick", created: num(c.created, 1e14)});
    }
  }
  s.setId = s.sets[o.setId] && (o.setId === "custom" || PAPER_IDS.includes(o.setId)) ? o.setId : "p1";
  for (const k of Object.keys(o.att || {})) { const i = +k; if (isQi(i) && Array.isArray(o.att[k])) s.att[i] = o.att[k].slice(-50).map(a => ({g: num(a && a.g, 20), m: num(a && a.m, 20) || 20, t: num(a && a.t, 1e14)})); }
  for (const d of Object.keys(o.days || {})) { const x = o.days[d]; if (/^\d{4}-\d{2}-\d{2}$/.test(d) && x) s.days[d] = {g: num(x.g), m: num(x.m), n: num(x.n)}; }
  s.hist = (Array.isArray(o.hist) ? o.hist : []).slice(-200).filter(h => h && typeof h === "object").map(h => ({t: num(h.t, 1e14), name: String(h.name || "Set").slice(0, 80), g: num(h.g), m: num(h.m) || 1, n: num(h.n), total: num(h.total), mode: h.mode === "exam" ? "exam" : "practice"}));
  for (const k of Object.keys(o.sent || {})) { const i = +k; if (isQi(i)) s.sent[i] = 1; }
  for (const k of Object.keys(o.fb || {})) { const i = +k; if (isQi(i)) s.fb[i] = 1; }
  s.outbox = (Array.isArray(o.outbox) ? o.outbox : []).filter(x => x && Number.isInteger(x.q) && x.q >= 1 && x.q <= Q.length && typeof x.a === "string" && /^[0-7]{3,5}$/.test(x.a)).slice(-300);
  return s;
}
// The question bank was rewritten in September 2026, so saved answers from v4 no longer match the options.
// Keep the browser code, sharing choice and progress history; start the papers fresh.
function carryOver(o){
  const s = fresh();
  if (o && typeof o === "object") {
    if (typeof o.cid === "string") s.cid = o.cid;
    if (typeof o.share === "boolean") s.share = o.share;
    if (o.days && typeof o.days === "object") s.days = o.days;
    if (Array.isArray(o.hist)) s.hist = o.hist.map(h => Object.assign({}, h, {name: h.name + " (old version)"}));
  }
  return normalise(s);
}
const ui0 = {rewritten:false};
let timerOn = false;
// Progress lives in localStorage, with a debounced backup copy in IndexedDB in case one store is cleared.
let storageOk = true, savedAt = 0, idbTimer = null;
function save(now){
  S.ts = Date.now();
  const json = JSON.stringify(S);
  try { localStorage.setItem(STORE, json); storageOk = true; } catch(e) { storageOk = false; }
  savedAt = Date.now();
  clearTimeout(idbTimer);
  if (now) idbPut(json); else idbTimer = setTimeout(() => idbPut(json), 800);
  if (typeof scheduleSync === "function") scheduleSync();
}
// Writes the current state without changing its timestamp (used when adopting a synced copy).
function persistAsIs(){
  const json = JSON.stringify(S);
  try { localStorage.setItem(STORE, json); } catch(e) {}
  idbPut(json);
}
window.addEventListener("storage", e => {
  if (e.key !== STORE || !e.newValue || document.querySelector(".dragging")) return;
  try {
    const n = normalise(JSON.parse(e.newValue));
    if (n.ts < (S.ts || 0)) return;
    // Take the other tab’s answers, but keep this tab’s view, set and question.
    const view = S.view, setId = S.setId, cur = S.sets[S.setId] && S.sets[S.setId].cur;
    S = n; S.view = view;
    if (S.sets[setId]) { S.setId = setId; S.sets[setId].cur = cur; }
    render();
  } catch(err) {}
});
window.addEventListener("pagehide", () => { clearTimeout(idbTimer); idbPut(JSON.stringify(S)); });
function idb(){
  return new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error("no idb"));
    const r = indexedDB.open("dft-sjt-mock", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("kv");
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
async function idbPut(json){ try { const db = await idb(); db.transaction("kv", "readwrite").objectStore("kv").put(json, STORE); } catch(e) {} }
async function idbGet(){ try { const db = await idb(); return await new Promise(res => { const r = db.transaction("kv").objectStore("kv").get(STORE); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); }); } catch(e) { return null; } }
function answeredCount(s){ return Object.values(s.att || {}).length; }

// ---------- set helpers ----------
function listOf(id, s = S){ const P = PAPERS[id]; if (P) return range(P.from, Math.min(P.to, Q.length)); return (s.sets.custom && s.sets.custom.list) || []; }
function setName(id){ return PAPERS[id] ? PAPERS[id].name : (S.sets.custom ? S.sets.custom.name : "Quiz"); }
const curSet = () => S.sets[S.setId];
const curList = () => listOf(S.setId);
function curQi(){ const l = curList(), set = curSet(); set.cur = Math.max(0, Math.min(l.length - 1, set.cur || 0)); return l[set.cur]; }

const revealed = (set, qi) => !!set.chk[qi] || (set.mode === "exam" && !!set.marked);
function ansOf(set, qi){ if (!set.ans[qi]) set.ans[qi] = isRank(Q[qi]) ? {ord:[0,1,2,3,4], set:false} : {p:[]}; return set.ans[qi]; }
function complete(set, qi){ const a = set.ans[qi]; if (!a) return false; return isRank(Q[qi]) ? !!a.set : a.p.length === 3; }
function started(set, qi){ const a = set.ans[qi]; if (!a) return false; return isRank(Q[qi]) ? !!a.set : a.p.length > 0; }
const keyRank = (q, idx) => q.k.indexOf(L[idx]) + 1;
function userRank(set, qi, idx){ const a = set.ans[qi]; return a && a.set ? a.ord.indexOf(idx) + 1 : 0; }
function optPts(set, qi, idx){
  const q = Q[qi];
  if (isRank(q)) { const r = userRank(set, qi, idx); return r ? Math.max(0, 4 - Math.abs(r - keyRank(q, idx))) : 0; }
  const a = set.ans[qi]; return (a && a.p.includes(idx) && q.k.includes(L[idx])) ? 4 : 0;
}
function qScore(set, qi){ let got = 0; Q[qi].o.forEach((_, idx) => got += optPts(set, qi, idx)); return {got, max: isRank(Q[qi]) ? 20 : 12}; }
function band(got, max){ const p = got / max; return p >= 0.8 ? "good" : p >= 0.55 ? "near" : "bad"; }
function lastAtt(qi){ const a = S.att[qi]; return a && a.length ? a[a.length - 1] : null; }

// ---------- recording attempts and community submissions ----------
function addAttempt(s, set, qi, submit = true){
  const sc = qScore(set, qi);
  (s.att[qi] = s.att[qi] || []).push({g:sc.got, m:sc.max, t:Date.now()});
  const d = s.days[today()] = s.days[today()] || {g:0, m:0, n:0};
  d.g += sc.got; d.m += sc.max; d.n++;
  if (submit && s.share && !s.sent[qi] && complete(set, qi)) {
    const a = set.ans[qi];
    s.outbox.push({q:qi + 1, a: isRank(Q[qi]) ? a.ord.join("") : a.p.slice().sort((x, y) => x - y).join("")});
    s.sent[qi] = 1;
    if (s.outbox.length > 300) s.outbox = s.outbox.slice(-300);
  }
}
// Load saved progress (after the helpers above exist).
let hadLocal = false;
try {
  const raw = localStorage.getItem(STORE);
  if (raw) { S = normalise(JSON.parse(raw)); hadLocal = true; }
  else { const old = localStorage.getItem(V4); if (old) { S = carryOver(JSON.parse(old)); ui0.rewritten = true; } }
} catch(e) {}
const loadedTs = S.ts || 0; // captured before anything saves, for the backup comparison at startup

// Sends queued first attempts. Returns the in-flight promise so callers can wait for it.
let flushP = null;
function flush(){
  if (flushP) return flushP;
  if (!S.outbox.length || !S.share) return Promise.resolve();
  flushP = (async () => {
    while (S.outbox.length && S.share) {
      const items = S.outbox.slice(0, 100);
      try {
        const r = await fetch(API + "/api/answers", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({client:S.cid, items})});
        if (!(r.ok || r.status === 400)) break;
        const done = new Set(items.map(x => x.q + ":" + x.a));
        S.outbox = S.outbox.filter(x => !done.has(x.q + ":" + x.a)); save();
      } catch(e) { break; }
    }
  })().finally(() => { flushP = null; });
  return flushP;
}
function logSetIfDone(id){
  const set = S.sets[id], list = listOf(id);
  if (set.logged || !list.length) return;
  if (!list.every(qi => revealed(set, qi))) return;
  let g = 0, m = 0, n = 0;
  list.forEach(qi => { if (started(set, qi)) { const s = qScore(set, qi); g += s.got; n++; } m += isRank(Q[qi]) ? 20 : 12; });
  S.hist.push({t:Date.now(), name:setName(id), g, m, n, total:list.length, mode:set.mode});
  set.logged = true;
}

// ---------- community stats ----------
const stats = {};
async function loadStats(qi, force){
  const st = stats[qi];
  if (st && !force && (st.state !== "error" || Date.now() - st.at < 60000)) return;
  stats[qi] = {state:"loading"};
  try {
    const r = await fetch(API + "/api/stats?q=" + (qi + 1), {cache:"no-store"});
    stats[qi] = r.ok ? {state:"ok", data: await r.json()} : {state: r.status === 503 ? "off" : "error", at:Date.now()};
  } catch(e) { stats[qi] = {state:"error", at:Date.now()}; }
  const box = document.getElementById("stats-" + qi);
  if (box) box.outerHTML = statsHtml(qi);
}
function statsHtml(qi){
  const st = stats[qi], q = Q[qi];
  if (!st || st.state === "loading") return `<div class="stats" id="stats-${qi}"><p class="muted">Loading how others answered…</p></div>`;
  if (st.state !== "ok") return `<div class="stats" id="stats-${qi}" hidden></div>`;
  const d = st.data;
  let h = `<div class="stats" id="stats-${qi}"><p class="xhead">How others answered · ${d.n} ${d.n === 1 ? "person" : "people"}</p>`;
  if (d.n < d.min) {
    h += `<p class="muted">Community stats appear once ${d.min} people have answered this question. ${S.share ? "Your answer has been counted." : "Turn on anonymous sharing in Settings to add yours."}</p>`;
  } else if (isRank(q)) {
    h += `<p class="muted">Each row shows where people ranked that option, from 1 (left) to 5 (right). Darker = more people. The outlined cell is the key’s position.</p><div class="heat" role="table" aria-label="How others ranked each option">`;
    h += `<div class="hrow hhead" role="row"><span></span>${[1,2,3,4,5].map(n => `<span role="columnheader">${n}</span>`).join("")}<span>Agree with key</span></div>`;
    q.k.split("").forEach(ch => {
      const o = L.indexOf(ch), row = d.pos[o], kp = keyRank(q, o) - 1, tot = row.reduce((a, b) => a + b, 0) || 1;
      h += `<div class="hrow" role="row"><span class="letter">${ch}</span>` + row.map((c, p) => {
        const share = c / tot;
        return `<span role="cell" class="hcell${p === kp ? " key" : ""}${share >= 0.5 ? " hi" : ""}" style="--a:${(0.08 + share * 0.92).toFixed(2)}" title="${Math.round(share * 100)}% ranked ${ch} at ${p + 1}">${share >= 0.1 ? Math.round(share * 100) : ""}</span>`;
      }).join("") + `<span class="hagree">${Math.round(row[kp] / tot * 100)}%</span></div>`;
    });
    h += `</div>`;
  } else {
    h += `<div class="picks">`;
    q.o.forEach((_, o) => {
      const share = d.pick[o] / d.n, key = q.k.includes(L[o]);
      h += `<div class="prow"><span class="letter">${L[o]}</span><div class="pbar"><i style="width:${Math.round(share * 100)}%"></i></div><span class="pval">${Math.round(share * 100)}%${key ? ' <b class="kbadge">key</b>' : ""}</span></div>`;
    });
    h += `</div>`;
  }
  if (S.fb[qi]) h += `<p class="muted fbdone">Thanks. Your feedback on this key was sent.</p>`;
  else if (ui.fbOpen === qi) h += `<div class="fbform"><label for="fb-${qi}">What would you change, and why? (optional)</label><textarea id="fb-${qi}" maxlength="500" rows="3"></textarea><div class="row"><button type="button" class="btn small primary" data-act="send-fb">Send</button><button type="button" class="btn small" data-act="cancel-fb">Cancel</button></div></div>`;
  else h += `<div class="fbline"><button type="button" class="btn small" data-act="disagree">I disagree with this key</button>${d.disagree ? `<span class="muted">${d.disagree} ${d.disagree === 1 ? "person has" : "people have"} disagreed</span>` : ""}</div>`;
  return h + `</div>`;
}

// ---------- UI state ----------
let ui = {warn:false, confirmReset:false, confirmMark:false, building:false, fbOpen:null, code:"", codeMsg:"", confirmLoad:false, confirmWipe:false};
let installPrompt = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installPrompt = e; if (S.view === "settings") render(); });

// ---------- rendering: shell ----------
function render(){
  document.querySelectorAll("[data-view-panel]").forEach(el => el.hidden = el.dataset.viewPanel !== S.view);
  document.querySelectorAll(".views [data-v]").forEach(b => b.setAttribute("aria-current", b.dataset.v === S.view ? "page" : "false"));
  if (S.view === "practice") { renderTabs(); renderGrid(); renderCard(); renderPanel(); }
  else if (S.view === "results") renderResults();
  else if (S.view === "guide") renderGuide();
  else if (S.view === "settings") renderSettings();
}

function renderTabs(){
  let h = PAPER_IDS.map(id => {
    const P = PAPERS[id], set = S.sets[id], list = listOf(id);
    const done = list.filter(qi => complete(set, qi)).length;
    return `<button type="button" class="ptab" role="tab" data-act="set" data-id="${id}" aria-selected="${S.setId === id}">${P.name}<small>${done}/${list.length}</small></button>`;
  }).join("");
  const c = S.sets.custom;
  if (c) { const done = c.list.filter(qi => complete(c, qi)).length; h += `<button type="button" class="ptab quiz" role="tab" data-act="set" data-id="custom" aria-selected="${S.setId === "custom"}">${esc(c.name)}<small>${done}/${c.list.length}</small></button>`; }
  document.getElementById("ptabs").innerHTML = h;
  document.getElementById("newquiz").setAttribute("aria-pressed", String(ui.building));
}

function cellHtml(set, qi, k, lower){
  let cls = "cell" + (lower ? " lo" : ""), status = "not started";
  if (revealed(set, qi)) { const s = qScore(set, qi); cls += " " + band(s.got, s.max); status = s.got + " of " + s.max + " marks"; }
  else if (started(set, qi)) { cls += " done"; status = complete(set, qi) ? "answered" : "in progress"; }
  if (k === set.cur && !ui.building) cls += " cur";
  const label = k + 1;
  return `<button type="button" class="${cls}" data-act="go" data-k="${k}" aria-label="Question ${label}, ${status}"${k === set.cur ? ' aria-current="step"' : ""}>${label}</button>`;
}
function renderGrid(){
  const set = curSet(), list = curList(), title = document.getElementById("chart-title");
  let h = "";
  if (PAPERS[S.setId] && list.length === 32) {
    const P = PAPERS[S.setId];
    title.textContent = `${P.name} · questions 1–32`;
    const arch = (from, lower) => { let a = ""; for (let k = from; k < from + 16; k++) { if (k === from + 8) a += '<span class="mid" aria-hidden="true"></span>'; a += cellHtml(set, list[k], k, lower); } return a; };
    h = `<div class="arch">${arch(0, false)}</div><div class="occl" aria-hidden="true"></div><div class="arch">${arch(16, true)}</div>`;
  } else {
    title.textContent = `${setName(S.setId)} · ${list.length} questions`;
    h = `<div class="flat">${list.map((qi, k) => cellHtml(set, qi, k, false)).join("")}</div>`;
  }
  document.getElementById("grid").innerHTML = h;
}

function crow(pos, o, text, cls, pts){
  return `<div class="crow ${cls}"><span class="pos">${pos}</span><span class="letter">${L[o]}</span><span class="ctext">${text}</span><span class="pts">${pts}</span></div>`;
}

function renderCard(){
  const card = document.getElementById("card");
  if (ui.building) { card.innerHTML = builderHtml(); destroyDrag(); return; }
  const set = curSet(), list = curList(), k = set.cur, qi = curQi(), q = Q[qi], a = set.ans[qi], rev = revealed(set, qi), rank = isRank(q);
  const word = q.t === "consider" ? "important" : "appropriate";
  const where = S.setId === "custom" ? ` <span class="qfrom">· Paper ${q.p}, question ${localNum(q)}</span>` : "";
  let h = ui0.rewritten ? `<div class="notice"><b>The questions have been rewritten to be harder.</b> Every option is now plausible, so your earlier answers have been cleared. Your progress chart and visit history are kept. <button type="button" class="btn small" data-act="dismiss-notice">OK</button></div>` : "";
  h += `<div class="qhead"><span class="qnum" tabindex="-1">Question ${k + 1} of ${list.length}${where}</span><div class="chips"><span class="chip type">${TYPES[q.t]}</span><span class="chip">${DOMAINS[q.d]}</span></div></div>`;
  h += `<p class="scenario">${q.s}</p><p class="instr">${PROMPTS[q.t]}</p>`;
  if (!rev) {
    if (rank) {
      const ord = a ? a.ord : [0,1,2,3,4], isSet = !!(a && a.set);
      h += `<p class="rend">Most ${word}</p><ol class="rlist${isSet ? "" : " unset"}" id="rlist" aria-label="Your ranking, most ${word} first">`;
      ord.forEach((o, pos) => {
        h += `<li class="ritem" data-o="${o}"><span class="grip">${GRIP}</span><span class="letter">${L[o]}</span><span class="otext">${q.o[o][0]}</span><span class="mv">` +
          `<button type="button" class="mvb" id="mv-${qi}-${o}-up" data-act="mv" data-o="${o}" data-d="-1" aria-label="Move option ${L[o]} up"${pos === 0 ? " disabled" : ""}>↑</button>` +
          `<button type="button" class="mvb" id="mv-${qi}-${o}-down" data-act="mv" data-o="${o}" data-d="1" aria-label="Move option ${L[o]} down"${pos === 4 ? " disabled" : ""}>↓</button></span></li>`;
      });
      h += `</ol><p class="rend bottom">Least ${word}</p>`;
      if (!isSet) h += `<div class="setrow"><span>Drag the options into order, or use the arrows. If the order shown is already your answer, press Keep this order${set.mode === "exam" ? " (unconfirmed rankings score 0)" : ""}.</span><button type="button" class="btn small" data-act="keep">Keep this order</button></div>`;
    } else {
      const n = a ? a.p.length : 0;
      h += `<p class="scale${ui.warn ? " warn" : ""}"><span>${n} of 3 chosen</span><span>${ui.warn ? "Untick one first: only three can be chosen" : ""}</span></p><div class="opts">`;
      q.o.forEach(([text], idx) => {
        const picked = !!(a && a.p.includes(idx));
        h += `<button type="button" class="opt pick" id="pk-${qi}-${idx}" data-act="pick" data-o="${idx}" aria-pressed="${picked}"><span class="letter">${L[idx]}</span><span class="otext">${text}</span></button>`;
      });
      h += "</div>";
    }
  } else {
    h += `<p class="xhead">${rank ? "Why each option sits where it does" : "Why each option is or isn’t one of the best three"}</p><div class="xlist">`;
    q.o.forEach(([text, why], idx) => { h += `<div class="xitem"><span class="letter">${L[idx]}</span><div><span class="otext">${text}</span><span class="xwhy"><b>Justification:</b> ${why}</span></div></div>`; });
    h += "</div>";
    const sc = qScore(set, qi);
    h += `<div class="result"><div class="scoreline">${sc.got} / ${sc.max} marks</div><div class="compare"><div class="ccol"><h4>Your answer</h4><div class="crows">`;
    if (rank) {
      if (a && a.set) a.ord.forEach((o, pos) => { const pts = optPts(set, qi, o); h += crow(pos + 1, o, q.o[o][0], "b" + pts, pts + "/4"); });
      else h += `<div class="cempty">Not answered</div>`;
    } else {
      const picks = a ? a.p.slice().sort((x, y) => x - y) : [];
      picks.forEach(o => { const ok = q.k.includes(L[o]); h += crow(ok ? "✓" : "✗", o, q.o[o][0], ok ? "b4" : "b0", ok ? "4/4" : "0/4"); });
      if (!picks.length) h += `<div class="cempty">Not answered</div>`;
      else if (picks.length < 3) h += `<div class="cempty">${3 - picks.length} pick${picks.length === 2 ? "" : "s"} left blank</div>`;
    }
    h += `</div></div><div class="ccol key"><h4>Correct answer</h4><div class="crows">`;
    q.k.split("").forEach((ch, pos) => { const o = L.indexOf(ch); h += crow(rank ? pos + 1 : "", o, q.o[o][0], "neutral", ""); });
    h += `</div></div></div>`;
    h += `<div class="takeaway"><span class="tlabel">Pattern · ${q.a}</span>${q.tk}<a class="tlink" href="#guide-${q.g}">${THEMES[q.g]} playbook →</a></div>`;
    h += statsHtml(qi) + `</div>`;
  }
  h += `<div class="actions"><button type="button" class="btn" data-act="prev"${k === 0 ? " disabled" : ""}>Previous</button><div class="act-r">`;
  if (set.mode === "practice" && rev) h += `<button type="button" class="btn" data-act="retry">Try again</button>`;
  if (set.mode === "practice" && !rev) h += `<button type="button" class="btn primary" data-act="check"${complete(set, qi) ? "" : " disabled"}>Check answer</button>`;
  h += `<button type="button" class="btn${rev || set.mode === "exam" ? " primary" : ""}" data-act="next"${k === list.length - 1 ? " disabled" : ""}>Next</button></div></div>`;
  if (set.mode === "practice" && !rev && !complete(set, qi) && !rank) h += `<p class="hint">Choose three options, then check your answer.</p>`;
  if (set.mode === "exam" && !rev) h += `<p class="hint">Exam mode: your answers are saved and the whole set is marked when you press Mark.</p>`;
  card.innerHTML = h;
  if (rev) { if (stats[qi]) loadStats(qi); else { stats[qi] = {state:"loading"}; flush().then(() => loadStats(qi, true)); } }
  initDrag();
}

// ---------- drag to rank ----------
let sortable = null;
function destroyDrag(){ if (sortable) { try { sortable.destroy(); } catch(e) {} sortable = null; } }
function initDrag(){
  destroyDrag();
  const el = document.getElementById("rlist");
  if (!el || !window.Sortable) return;
  const set = curSet(), qi = curQi();
  sortable = Sortable.create(el, {
    animation:160, forceFallback:true, fallbackTolerance:4, delayOnTouchOnly:true, delay:120,
    filter:".mvb", preventOnFilter:false, ghostClass:"ghost", chosenClass:"chosen", dragClass:"dragging",
    onEnd: () => { const a = ansOf(set, qi); a.ord = [...el.children].map(li => +li.dataset.o); a.set = true; save(); setTimeout(render, 0); }
  });
}

// ---------- quiz builder ----------
function weakList(){ return Q.map((_, i) => i).filter(i => { const a = lastAtt(i); return a && a.g / a.m < 0.7; }).sort((x, y) => { const a = lastAtt(x), b = lastAtt(y); return a.g / a.m - b.g / b.m; }); }
function pickFresh(pool, n){
  const unseen = shuffle(pool.filter(i => !S.att[i])), seen = shuffle(pool.filter(i => S.att[i]));
  return unseen.concat(seen).slice(0, n);
}
function builderHtml(){
  const weak = weakList().length, c = S.sets.custom;
  const themeCounts = {}; Q.forEach(q => themeCounts[q.g] = (themeCounts[q.g] || 0) + 1);
  let h = `<h2 class="bh">Build a quiz</h2><p class="muted">${c ? `Starting a new quiz replaces “${esc(c.name)}”. Your scores so far are kept in Results.` : "Pick a format. Your scores are saved in Results."}</p><div class="bgrid">`;
  h += `<button type="button" class="bcard" data-act="build" data-kind="quick"><b>Quick 10</b><span>10 random questions from all papers, unseen ones first. Practice mode.</span></button>`;
  h += `<button type="button" class="bcard" data-act="build" data-kind="mock"><b>Full mock · 56</b><span>The live test’s length and mix (about two-thirds ranking). Exam mode with a 105-minute target.</span></button>`;
  h += `<button type="button" class="bcard" data-act="build" data-kind="weak"${weak ? "" : " disabled"}><b>Weak spots</b><span>${weak ? `Up to 20 of the ${weak} questions you last scored under 70% on, lowest first.` : "Nothing yet: questions you score under 70% on will appear here."}</span></button>`;
  h += `</div><h3 class="bsub">Focus on an area</h3><div class="chips wrap">` + Object.keys(DOMAINS).map(d => `<button type="button" class="chipbtn" data-act="build" data-kind="area" data-arg="${d}">${DOMAINS[d]}</button>`).join("") + `</div>`;
  h += `<h3 class="bsub">Focus on a theme</h3><div class="chips wrap">` + Object.keys(THEMES).map(g => `<button type="button" class="chipbtn" data-act="build" data-kind="theme" data-arg="${g}">${THEMES[g]} <small>${themeCounts[g] || 0}</small></button>`).join("") + `</div>`;
  h += `<div class="actions"><button type="button" class="btn" data-act="cancel-build">Cancel</button></div>`;
  return h;
}
function buildQuiz(kind, arg){
  const all = Q.map((_, i) => i);
  let list = [], name = "", mode = "practice";
  if (kind === "quick") { list = pickFresh(all, 10); name = "Quick 10"; }
  else if (kind === "mock") {
    const r = shuffle(all.filter(i => isRank(Q[i]))).slice(0, 37), b = shuffle(all.filter(i => !isRank(Q[i]))).slice(0, 19);
    list = shuffle(r.concat(b)); name = "Full mock"; mode = "exam";
  }
  else if (kind === "weak") { list = weakList().slice(0, 20); name = "Weak spots"; }
  else if (kind === "area") { list = shuffle(pickFresh(all.filter(i => Q[i].d === arg), 12)); name = DOMAINS[arg]; }
  else if (kind === "theme") { list = shuffle(all.filter(i => Q[i].g === arg)); name = THEMES[arg]; }
  if (!list.length) return;
  S.sets.custom = newSet({name, kind, list, mode, created:Date.now()});
  S.setId = "custom"; S.view = "practice"; ui.building = false; ui.warn = false; timerOn = false;
  save(); location.hash = "practice"; render(); scrollToCard();
}

// ---------- side panel ----------
function renderPanel(){
  const set = curSet(), list = curList(), name = setName(S.setId);
  let got = 0, max = 0, nrev = 0, nans = 0;
  const dom = {I:[0,0], P:[0,0], E:[0,0], T:[0,0]};
  list.forEach(qi => {
    if (complete(set, qi)) nans++;
    if (revealed(set, qi)) { const s = qScore(set, qi); got += s.got; max += s.max; dom[Q[qi].d][0] += s.got; dom[Q[qi].d][1] += s.max; nrev++; }
  });
  let h = `<div><p class="plabel">Mode · ${esc(name)}</p><div class="seg" role="group" aria-label="Mode">
    <button type="button" data-act="mode" data-mode="practice" aria-pressed="${set.mode === "practice"}">Practice</button>
    <button type="button" data-act="mode" data-mode="exam" aria-pressed="${set.mode === "exam"}">Exam</button></div>
    <p class="muted">${set.mode === "practice" ? "See the key and reasoning after each question." : "No feedback until you mark the whole set."}</p></div>`;
  h += `<div><p class="plabel">Score</p>`;
  if (nrev) h += `<div class="big">${got}<small> / ${max} · ${pct(got, max)}%</small></div><p class="muted">${nrev} of ${list.length} marked · ${nans} answered</p>`;
  else h += `<div class="big">—</div><p class="muted">${nans} of ${list.length} answered. ${set.mode === "practice" ? "Check an answer to see your score." : "Mark the set to see your score."}</p>`;
  h += `</div>`;
  if (nrev) {
    h += '<div class="doms">' + Object.keys(DOMAINS).map(d => { const [g, m] = dom[d]; return `<div class="dom"><span>${DOMAINS[d]}</span><span>${m ? pct(g, m) + "%" : "–"}</span><div class="bar"><i style="width:${pct(g, m)}%"></i></div></div>`; }).join("") + '</div>';
  }
  if (set.mode === "exam" && !set.marked) {
    const blanks = list.length - nans;
    if (ui.confirmMark) h += `<div class="confirm"><span>${blanks} question${blanks === 1 ? " is" : "s are"} not fully answered and will score only what’s filled in. Mark anyway?</span><div class="row"><button type="button" class="btn small primary" data-act="mark-yes">Mark ${esc(name)}</button><button type="button" class="btn small" data-act="mark-no">Keep going</button></div></div>`;
    else h += `<button type="button" class="btn primary" data-act="mark">Mark ${esc(name)}</button>`;
  }
  const target = Math.round(list.length * PACE), paceK = Math.min(list.length, Math.floor(set.el / PACE) + 1);
  h += `<div class="divider"></div><div><p class="plabel">Timer · target ${fmt(target)}</p><div class="clock"><span class="t" id="clock">${fmt(set.el)}</span><button type="button" class="btn small" data-act="timer">${timerOn ? "Pause" : (set.el ? "Resume" : "Start")}</button></div><p class="muted" id="pace">At live-test pace you’d be on question ${paceK} of this set.</p></div>`;
  if (ui.confirmReset) h += `<div class="confirm"><span>Clear the answers and timer for ${esc(name)}? Your Results history is kept.</span><div class="row"><button type="button" class="btn small danger" data-act="reset-yes">Clear ${esc(name)}</button><button type="button" class="btn small" data-act="reset-no">Cancel</button></div></div>`;
  else h += `<button type="button" class="btn small danger" data-act="reset">Reset ${esc(name)}</button>`;
  h += storageOk
    ? `<p class="saved">✓ Progress saved on this device. It stays when you come back in this browser.</p>`
    : `<p class="saved warn">This browser isn’t saving progress (it may be a private window). Use a normal window, or copy a progress code in Settings.</p>`;
  h += `<p class="note">These are original, unofficial questions modelled on the official DFT practice papers and on GDC guidance. The keys are reasoned judgements, not official answers. Where yours differ in the middle ranks, compare the reasoning, and use “I disagree” to flag keys you think are wrong.</p>`;
  document.getElementById("panel").innerHTML = h;
}

// ---------- results ----------
function renderResults(){
  const el = document.getElementById("view-results");
  const answered = Q.map((_, i) => i).filter(i => lastAtt(i));
  let g = 0, m = 0; answered.forEach(i => { const a = lastAtt(i); g += a.g; m += a.m; });
  if (!answered.length) {
    el.innerHTML = `<div class="card"><h2 class="bh">Results</h2><p>You haven’t marked any questions yet. Check an answer in practice mode, or mark a set in exam mode, and your results will build up here.</p><div class="actions"><button type="button" class="btn primary" data-act="view" data-v="practice">Start practising</button></div></div>`;
    return;
  }
  const byD = {}, byG = {};
  Object.keys(DOMAINS).forEach(d => byD[d] = {g:0, m:0, n:0, total:0});
  Object.keys(THEMES).forEach(t => byG[t] = {g:0, m:0, n:0, total:0});
  Q.forEach((q, i) => { byD[q.d].total++; byG[q.g].total++; const a = lastAtt(i); if (a) { byD[q.d].g += a.g; byD[q.d].m += a.m; byD[q.d].n++; byG[q.g].g += a.g; byG[q.g].m += a.m; byG[q.g].n++; } });
  const themesSorted = Object.keys(THEMES).filter(t => byG[t].n).sort((x, y) => byG[x].g / byG[x].m - byG[y].g / byG[y].m);
  const weakest = themesSorted.filter(t => byG[t].n >= 2).slice(0, 3);
  const bestD = Object.keys(DOMAINS).filter(d => byD[d].n).sort((x, y) => byD[y].g / byD[y].m - byD[x].g / byD[x].m)[0];

  let h = `<div class="card"><h2 class="bh">Results</h2><p class="muted">Based on your latest attempt at each question.</p><div class="tiles">
    <div class="tile"><span class="tl">Questions answered</span><span class="tv">${answered.length}<small> / ${Q.length}</small></span></div>
    <div class="tile"><span class="tl">Average score</span><span class="tv">${pct(g, m)}%</span></div>
    <div class="tile"><span class="tl">Strongest area</span><span class="tv sm">${bestD ? DOMAINS[bestD] : "–"}</span></div>
    <div class="tile"><span class="tl">Completed sets</span><span class="tv">${S.hist.length}</span></div></div>`;
  if (weakest.length) {
    h += `<div class="callout"><p class="xhead">Your weakest themes</p>` + weakest.map(t => `<div class="wrow"><span><b>${THEMES[t]}</b> · ${pct(byG[t].g, byG[t].m)}% over ${byG[t].n} question${byG[t].n === 1 ? "" : "s"}</span><span class="row"><a class="btn small" href="#guide-${t}">Read playbook</a><button type="button" class="btn small primary" data-act="build" data-kind="theme" data-arg="${t}">Practise</button></span></div>`).join("") + `</div>`;
  }
  h += `<h3 class="bsub">Progress over time</h3>` + progressChart();
  h += `<h3 class="bsub">By area</h3><div class="doms wide">` + Object.keys(DOMAINS).map(d => { const x = byD[d]; return `<div class="dom"><span>${DOMAINS[d]} <small class="muted">${x.n}/${x.total}</small></span><span>${x.n ? pct(x.g, x.m) + "%" : "–"}</span><div class="bar"><i style="width:${pct(x.g, x.m)}%"></i></div></div>`; }).join("") + `</div>`;
  h += `<h3 class="bsub">By theme</h3><div class="tscroll"><table class="rtable"><thead><tr><th>Theme</th><th>Answered</th><th>Average</th><th></th></tr></thead><tbody>`;
  const themeOrder = themesSorted.concat(Object.keys(THEMES).filter(t => !byG[t].n));
  themeOrder.forEach(t => { const x = byG[t]; h += `<tr><td><a href="#guide-${t}">${THEMES[t]}</a></td><td>${x.n}/${x.total}</td><td>${x.n ? `<span class="pill ${band(x.g, x.m)}">${pct(x.g, x.m)}%</span>` : "–"}</td><td><button type="button" class="btn small" data-act="build" data-kind="theme" data-arg="${t}">Practise</button></td></tr>`; });
  h += `</tbody></table></div>`;
  h += `<h3 class="bsub">By paper</h3><div class="doms wide">` + PAPER_IDS.map(id => { const P = PAPERS[id]; let pg = 0, pm = 0, n = 0; range(P.from, P.to).forEach(i => { const a = lastAtt(i); if (a) { pg += a.g; pm += a.m; n++; } }); return `<div class="dom"><span>${P.name} <small class="muted">${n}/32</small></span><span>${n ? pct(pg, pm) + "%" : "–"}</span><div class="bar"><i style="width:${pct(pg, pm)}%"></i></div></div>`; }).join("") + `</div>`;
  if (S.hist.length) {
    h += `<h3 class="bsub">Completed sets</h3><div class="tscroll"><table class="rtable"><thead><tr><th>Date</th><th>Set</th><th>Mode</th><th>Score</th></tr></thead><tbody>`;
    S.hist.slice().reverse().forEach(x => { h += `<tr><td>${new Date(x.t).toLocaleDateString("en-GB", {day:"numeric", month:"short"})}</td><td>${esc(x.name)}</td><td>${x.mode === "exam" ? "Exam" : "Practice"}</td><td>${x.g} / ${x.m} · ${pct(x.g, x.m)}%</td></tr>`; });
    h += `</tbody></table></div>`;
  }
  el.innerHTML = h + `</div>`;
}
function progressChart(){
  const days = Object.keys(S.days).sort().slice(-30);
  if (days.length < 2) {
    const d = days[0] && S.days[days[0]];
    return `<p class="muted">${d ? `Today: ${pct(d.g, d.m)}% across ${d.n} question${d.n === 1 ? "" : "s"}. ` : ""}Practise on another day to see a trend line.</p>`;
  }
  const W = 640, H = 200, pl = 36, pr = 12, pt = 12, pb = 28, iw = W - pl - pr, ih = H - pt - pb;
  const x = i => pl + (days.length === 1 ? iw / 2 : i * iw / (days.length - 1)), y = v => pt + ih - v / 100 * ih;
  const pts = days.map((d, i) => [x(i), y(pct(S.days[d].g, S.days[d].m)), d]);
  let s = `<div class="chartbox"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Daily average score over time">`;
  [0, 25, 50, 75, 100].forEach(v => { s += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" class="gl"/><text x="${pl - 6}" y="${y(v) + 4}" class="ax" text-anchor="end">${v}%</text>`; });
  s += `<polygon class="area" points="${pl},${y(0)} ${pts.map(p => p[0] + "," + p[1]).join(" ")} ${pts[pts.length - 1][0]},${y(0)}"/>`;
  s += `<polyline class="ln" points="${pts.map(p => p[0] + "," + p[1]).join(" ")}"/>`;
  pts.forEach((p, i) => { const d = S.days[p[2]]; s += `<circle cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 5 : 3.5}" class="${i === pts.length - 1 ? "pt last" : "pt"}"><title>${p[2]}: ${pct(d.g, d.m)}% over ${d.n} questions</title></circle>`; });
  const lab = i => { const [yy, mm, dd] = days[i].split("-"); return `${+dd} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+mm - 1]}`; };
  s += `<text x="${x(0)}" y="${H - 8}" class="ax" text-anchor="start">${lab(0)}</text><text x="${x(days.length - 1)}" y="${H - 8}" class="ax" text-anchor="end">${lab(days.length - 1)}</text>`;
  return s + `</svg></div><p class="muted">Daily average score across the questions you marked each day.</p>`;
}

// ---------- guide ----------
function renderGuide(){
  const el = document.getElementById("view-guide");
  if (el.dataset.ready) return;
  let toc = GUIDE.map(g => `<a href="#guide-${g.id}">${g.title}</a>`).join("") + `<a href="#guide-themes">Theme playbooks</a>`;
  let h = `<div class="card guide"><h2 class="bh">Pattern guide</h2><p class="muted">The logic behind the keys, drawn from the official DFT practice papers, GDC guidance and hundreds of practice items.</p><nav class="toc" aria-label="Guide contents">${toc}</nav>`;
  GUIDE.forEach(g => { h += `<section class="gsec" id="guide-${g.id}"><h3>${g.title}</h3>${g.html}</section>`; });
  h += `<section class="gsec" id="guide-themes"><h3>Theme playbooks</h3><p>Every question belongs to one of these themes. The “Pattern” box after each question links to its playbook.</p><nav class="toc">${Object.keys(THEMES).map(t => `<a href="#guide-${t}">${THEMES[t]}</a>`).join("")}</nav></section>`;
  Object.keys(THEMES).forEach(t => {
    const p = PLAYBOOKS[t], n = Q.filter(q => q.g === t).length;
    h += `<section class="gsec play" id="guide-${t}"><h3>${THEMES[t]}</h3><div class="gcols"><div><h4 class="hi">Usually ranks high</h4><ul>${p.high.map(x => `<li>${x}</li>`).join("")}</ul></div><div><h4 class="lo">Usually ranks low</h4><ul>${p.low.map(x => `<li>${x}</li>`).join("")}</ul></div></div><p class="gnote"><b>Nuance:</b> ${p.note}</p><button type="button" class="btn small primary" data-act="build" data-kind="theme" data-arg="${t}">Practise ${n} ${THEMES[t].toLowerCase()} questions</button></section>`;
  });
  el.innerHTML = h + `</div>`;
  el.dataset.ready = "1";
}

// ---------- settings ----------
function renderSettings(){
  const el = document.getElementById("view-settings");
  const standalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
  let h = `<div class="card"><h2 class="bh">Settings</h2>`;
  h += `<section class="sset"><h3>Community stats</h3><label class="toggle"><input type="checkbox" id="share" ${S.share ? "checked" : ""}> <span>Share anonymous answers and usage</span></label><p class="muted">When on, the site sends your first attempt at each question, a count of your visits, and any error reports. None of it includes your name, email or IP address; it’s linked only to a random code stored in this browser. Answers power the community stats. Visit counts and error reports are only seen by the site owner, to keep the site running. Turning this off stops all sending; data already sent stays in the totals.</p></section>`;
  h += `<section class="sset"><h3>How your progress is saved</h3><p class="muted">Your answers, scores and settings are saved automatically in this browser, with a backup copy, so they’re still here when you come back. There’s no account, and nothing leaves your device apart from anonymous answers for the community stats. Progress can be lost if you clear your browsing data, use a private window, or (in Safari) don’t visit for 7 days. Adding the site to your home screen avoids the Safari limit. To carry on across devices automatically, use <b>Sync</b> in the top bar: pick a username and PIN, and your progress saves to the site’s server and loads on any device with the same pair.</p></section>`;
  h += `<section class="sset"><h3>Move your progress to another device</h3><p class="muted">Copy a progress code here, then paste it into Settings on your other device. It replaces the progress there.</p><div class="row"><button type="button" class="btn small primary" data-act="copy-code">Create progress code</button></div>`;
  if (ui.code) h += `<textarea class="code" id="code-out" rows="3" readonly>${ui.code}</textarea>`;
  h += `<label class="lbl" for="code-in">Paste a progress code</label><textarea class="code" id="code-in" rows="3" placeholder="SJT1.…"></textarea>`;
  if (ui.confirmLoad) h += `<div class="confirm"><span>Replace all progress on this device with the pasted code?</span><div class="row"><button type="button" class="btn small danger" data-act="load-yes">Replace progress</button><button type="button" class="btn small" data-act="load-no">Cancel</button></div></div>`;
  else h += `<div class="row"><button type="button" class="btn small" data-act="load-code">Load code</button></div>`;
  if (ui.codeMsg) h += `<p class="muted" role="status">${esc(ui.codeMsg)}</p>`;
  h += `</section>`;
  h += `<section class="sset"><h3>Install on your phone</h3>`;
  if (standalone) h += `<p class="muted">You’re using the installed app. It works offline once it has loaded.</p>`;
  else {
    h += `<p class="muted">Add the site to your home screen for full-screen practice that works offline.</p><ul class="muted"><li><b>iPhone (Safari):</b> tap Share, then “Add to Home Screen”.</li><li><b>Android (Chrome):</b> open the menu, then “Install app” or “Add to Home screen”.</li></ul>`;
    if (installPrompt) h += `<div class="row"><button type="button" class="btn small primary" data-act="install">Install now</button></div>`;
  }
  h += `</section>`;
  h += `<section class="sset"><h3>Clear everything</h3><p class="muted">Removes all answers, results and history from this browser.</p>`;
  if (ui.confirmWipe) h += `<div class="confirm"><span>This can’t be undone. Clear everything?</span><div class="row"><button type="button" class="btn small danger" data-act="wipe-yes">Clear everything</button><button type="button" class="btn small" data-act="wipe-no">Cancel</button></div></div>`;
  else h += `<button type="button" class="btn small danger" data-act="wipe">Clear everything</button>`;
  h += `</section><section class="sset"><h3>About</h3><p class="muted">${Q.length} original practice questions written for this site, modelled on the official 2016 and 2021 DFT practice papers and on GDC and defence organisation guidance. Unofficial, and not affiliated with NHS England, COPDEND, HEIW or NIMDTA. <a href="https://github.com/sajeev2112/dft-sjt-mock" target="_blank" rel="noopener">Source on GitHub</a>.</p></section></div>`;
  el.innerHTML = h;
}

// ---------- progress codes ----------
const b64u = bytes => { let s = ""; bytes.forEach(b => s += String.fromCharCode(b)); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const unb64u = str => { const s = atob(str.replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(s, c => c.charCodeAt(0)); };
async function pipe(bytes, stream){ return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
async function makeCode(){
  const data = S;
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  if (window.CompressionStream) { try { return "SJT1." + b64u(await pipe(bytes, new CompressionStream("deflate-raw"))); } catch(e) {} }
  return "SJT0." + b64u(bytes);
}
async function readCode(code){
  code = code.trim();
  const [tag, body] = [code.slice(0, 5), code.slice(5)];
  let bytes = unb64u(body);
  if (tag === "SJT1.") bytes = await pipe(bytes, new DecompressionStream("deflate-raw"));
  else if (tag !== "SJT0.") throw new Error("tag");
  const o = JSON.parse(new TextDecoder().decode(bytes));
  if (!o || !o.sets || !o.cid) throw new Error("shape");
  if (o.v === 4) return carryOver(o); // a code made before the question rewrite: keep history, not answers
  if (o.v !== 5) throw new Error("version");
  return normalise(o);
}

// ---------- navigation ----------
function scrollToCard(){ const c = document.getElementById("card"); if (c) c.scrollIntoView({block:"nearest"}); }
function focusCard(){ const el = document.querySelector("#card .qnum, #card .bh"); if (el) el.focus({preventScroll: true}); }
function announce(msg){ const el = document.getElementById("status"); if (el) el.textContent = msg; }
function go(k){
  const set = curSet(), list = curList();
  set.cur = Math.max(0, Math.min(list.length - 1, k));
  ui.warn = false; ui.confirmMark = false; ui.confirmReset = false; ui.fbOpen = null; ui.building = false;
  save(); render(); scrollToCard();
}
function fromHash(){
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith("guide")) {
    S.view = "guide"; render();
    const target = document.getElementById(h === "guide" ? "view-guide" : h);
    if (target) setTimeout(() => target.scrollIntoView({block:"start"}), 0);
    return;
  }
  if (!h || ["practice", "results", "settings"].includes(h)) { S.view = h || "practice"; save(); render(); window.scrollTo(0, 0); }
}
window.addEventListener("hashchange", fromHash);

// ---------- events ----------
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act]"); if (!b || b.disabled) return;
  const act = b.dataset.act, set = curSet();
  if (act.startsWith("sync-")) { syncAction(act); return; }
  const qi = S.view === "practice" && !ui.building ? curQi() : null;
  switch (act) {
    case "dismiss-notice": ui0.rewritten = false; render(); break;
    case "view": if (location.hash === "#" + b.dataset.v) fromHash(); else location.hash = b.dataset.v; break;
    case "set": S.setId = b.dataset.id; ui.building = false; ui.warn = false; ui.confirmMark = ui.confirmReset = false; timerOn = false; save(); render(); break;
    case "new": ui.building = !ui.building; render(); scrollToCard(); break;
    case "cancel-build": ui.building = false; render(); break;
    case "build": buildQuiz(b.dataset.kind, b.dataset.arg); break;
    case "go": go(+b.dataset.k); focusCard(); break;
    case "prev": go(set.cur - 1); break;
    case "next": go(set.cur + 1); break;
    case "mv": {
      const a = ansOf(set, qi), o = +b.dataset.o, d = +b.dataset.d, pos = a.ord.indexOf(o), np = pos + d;
      if (np < 0 || np > 4) return;
      [a.ord[pos], a.ord[np]] = [a.ord[np], a.ord[pos]]; a.set = true; save(); render(); announce(`Option ${L[o]} moved to position ${np + 1}.`);
      const f = document.getElementById(`mv-${qi}-${o}-${d < 0 ? "up" : "down"}`), alt = document.getElementById(`mv-${qi}-${o}-${d < 0 ? "down" : "up"}`);
      (f && !f.disabled ? f : alt)?.focus();
      break;
    }
    case "keep": ansOf(set, qi).set = true; save(); render(); break;
    case "pick": {
      const a = ansOf(set, qi), o = +b.dataset.o, at = a.p.indexOf(o);
      if (at !== -1) { a.p.splice(at, 1); ui.warn = false; } else if (a.p.length < 3) { a.p.push(o); ui.warn = false; } else ui.warn = true;
      save(); render(); document.getElementById(`pk-${qi}-${o}`)?.focus();
      break;
    }
    case "check":
      if (!complete(set, qi)) return;
      set.chk[qi] = true; addAttempt(S, set, qi); logSetIfDone(S.setId); save(); render(); flush();
      { const sc = qScore(set, qi); announce(`${sc.got} out of ${sc.max} marks. The correct answer is shown below the explanations.`); }
      document.querySelector("#card .scoreline")?.setAttribute("tabindex", "-1"); document.querySelector("#card .scoreline")?.focus({preventScroll: true});
      break;
    case "retry": delete set.ans[qi]; delete set.chk[qi]; ui.fbOpen = null; ui.warn = false; save(); render(); focusCard(); break;
    case "mode": if (b.dataset.mode !== set.mode) { set.mode = b.dataset.mode; ui.confirmMark = false; save(); render(); } break;
    case "mark": { const n = curList().filter(i => complete(set, i)).length; if (n < curList().length) { ui.confirmMark = true; renderPanel(); } else markSet(); break; }
    case "mark-yes": markSet(); break;
    case "mark-no": ui.confirmMark = false; renderPanel(); break;
    case "timer": timerOn = !timerOn; renderPanel(); break;
    case "reset": ui.confirmReset = true; renderPanel(); break;
    case "reset-no": ui.confirmReset = false; renderPanel(); break;
    case "reset-yes":
      curList().forEach(i => { delete set.ans[i]; delete set.chk[i]; });
      set.marked = false; set.el = 0; set.cur = 0; set.logged = false; timerOn = false; ui.confirmReset = false; save(); render();
      break;
    case "disagree": ui.fbOpen = qi; refreshStats(qi); document.getElementById("fb-" + qi)?.focus(); break;
    case "cancel-fb": ui.fbOpen = null; refreshStats(qi); break;
    case "send-fb": {
      const comment = (document.getElementById("fb-" + qi) || {}).value || "";
      b.disabled = true;
      try {
        const r = await fetch(API + "/api/feedback", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({client:S.cid, q:qi + 1, comment})});
        if (!r.ok) throw new Error(r.status);
        S.fb[qi] = 1; ui.fbOpen = null; save(); loadStats(qi, true);
      } catch(err) { b.disabled = false; b.textContent = "Couldn’t send. Try again"; }
      break;
    }
    case "copy-code": {
      ui.code = await makeCode(); ui.codeMsg = ""; renderSettings();
      const out = document.getElementById("code-out");
      try { await navigator.clipboard.writeText(ui.code); ui.codeMsg = "Code copied. Paste it into Settings on your other device."; }
      catch(err) { out?.select(); ui.codeMsg = "Select the code above and copy it."; }
      renderSettings(); break;
    }
    case "load-code": { const v = (document.getElementById("code-in") || {}).value || ""; if (!v.trim()) { ui.codeMsg = "Paste a code first."; renderSettings(); break; } ui.pending = v; ui.confirmLoad = true; ui.codeMsg = ""; renderSettings(); document.getElementById("code-in").value = v; break; }
    case "load-no": ui.confirmLoad = false; renderSettings(); break;
    case "load-yes":
      try { S = await readCode(ui.pending || ""); S.view = "settings"; timerOn = false; save(true); ui.codeMsg = "Progress loaded."; flush(); }
      catch(err) { ui.codeMsg = "That code couldn’t be read. Check you copied all of it."; }
      ui.confirmLoad = false; ui.pending = ""; render(); break;
    case "install": if (installPrompt) { installPrompt.prompt(); installPrompt = null; renderSettings(); } break;
    case "wipe": ui.confirmWipe = true; renderSettings(); break;
    case "wipe-no": ui.confirmWipe = false; renderSettings(); break;
    case "wipe-yes": { const cid = S.cid; S = fresh(); S.cid = cid; S.view = "settings"; ui.confirmWipe = false; timerOn = false; save(true); render(); break; }
  }
});
document.addEventListener("change", e => {
  if (e.target.id === "share") { S.share = e.target.checked; save(); if (S.share) flush(); }
});
function refreshStats(qi){ const box = document.getElementById("stats-" + qi); if (box) box.outerHTML = statsHtml(qi); }
function markSet(){
  const set = curSet(), list = curList();
  set.marked = true; timerOn = false; ui.confirmMark = false;
  list.forEach(qi => { if (started(set, qi) && !set.chk[qi]) { set.chk[qi] = true; addAttempt(S, set, qi); } });
  logSetIfDone(S.setId); save(); render(); flush();
}

// ---------- timer ----------
let tick = 0;
setInterval(() => {
  if (!timerOn || S.view !== "practice" || document.visibilityState !== "visible") return;
  const set = curSet(), list = curList();
  set.el++; tick++;
  const c = document.getElementById("clock"), p = document.getElementById("pace");
  if (c) c.textContent = fmt(set.el);
  if (p) p.textContent = `At live-test pace you’d be on question ${Math.min(list.length, Math.floor(set.el / PACE) + 1)} of this set.`;
  if (tick % 5 === 0) save();
}, 1000);

// ---------- cross-device sync (username + PIN, optional) ----------
// Progress is saved under a username and PIN so it can be continued on another device. There's no account.
// The link lives in its own localStorage key, so it's never uploaded with the progress itself.
const SYNC_STORE = "dft-sjt-sync";
let SY = (() => { try { return JSON.parse(localStorage.getItem(SYNC_STORE) || "null"); } catch(e) { return null; } })();
const syncUi = {open: false, status: "", error: "", busy: false, conflict: null, confirmDelete: false, pendingLink: null};
let syncTimer = null;
function saveLink(){ try { if (SY) localStorage.setItem(SYNC_STORE, JSON.stringify(SY)); else localStorage.removeItem(SYNC_STORE); } catch(e) {} }
async function syncCall(action, extra){
  const r = await fetch(API + "/api/sync", {method: "POST", headers: {"Content-Type": "application/json"}, cache: "no-store",
    body: JSON.stringify(Object.assign({action}, extra))});
  let body = {}; try { body = await r.json(); } catch(e) {}
  return {status: r.status, body};
}
const SYNC_ERRORS = {
  bad_name: "Usernames are 3–30 characters: letters, numbers, dots, dashes or underscores.",
  bad_pin: "The PIN must be 4 to 8 digits.",
  wrong_pin: "That username is taken, or the PIN is wrong.",
  not_found: "No saved progress with that username. Use “Save and link” to create it.",
  rate_limited: "Too many tries from this network. Please wait a while and try again.",
  bad_data: "This progress is too large to sync.",
};
function syncErr(res){ if (res.body.error === "locked") return `Too many wrong PINs for that username. Try again in ${res.body.retry_after} minute${res.body.retry_after === 1 ? "" : "s"}.`; return SYNC_ERRORS[res.body.error] || "Couldn’t reach the server. Check your connection and try again."; }
function adopt(data, ts){
  const view = S.view, n = normalise(JSON.parse(data));
  S = n; S.view = view; S.ts = ts; persistAsIs();
  SY.lastTs = ts; SY.at = Date.now(); saveLink(); render();
}
function scheduleSync(){
  if (!SY || syncUi.conflict) return;
  clearTimeout(syncTimer); syncTimer = setTimeout(pushSync, 4000);
}
async function pushSync(force){
  if (!SY || (!force && S.ts <= (SY.lastTs || 0))) return;
  clearTimeout(syncTimer);
  syncUi.status = "saving"; renderSyncButton();
  try {
    const res = await syncCall("save", {name: SY.name, pin: SY.pin, data: JSON.stringify(S), ts: S.ts, base: SY.lastTs || 0, force: !!force});
    if (res.status === 200) { SY.lastTs = res.body.ts; SY.at = Date.now(); saveLink(); syncUi.status = "saved"; syncUi.error = ""; syncUi.conflict = null; }
    else if (res.status === 409) await resolveRemoteNewer();
    else if (res.status === 401 || res.status === 404) { syncUi.error = res.status === 404 ? "Your saved progress was deleted on another device, so this device has stopped syncing." : "The PIN for this username has changed, so this device has stopped syncing."; SY = null; saveLink(); syncUi.status = ""; }
    else { syncUi.status = "offline"; syncUi.error = syncErr(res); }
  } catch(e) { syncUi.status = "offline"; }
  renderSyncButton(); if (syncUi.open) renderSyncPanel();
}
// The server copy is newer than our last sync: take it if this device hasn't changed since, otherwise ask.
async function resolveRemoteNewer(){
  const res = await syncCall("load", {name: SY.name, pin: SY.pin});
  if (res.status !== 200) { syncUi.status = "offline"; syncUi.error = syncErr(res); return; }
  if (S.ts <= (SY.lastTs || 0)) { adopt(res.body.data, res.body.ts); syncUi.status = "saved"; announce("Loaded your latest progress from another device."); }
  else { syncUi.conflict = {data: res.body.data, ts: res.body.ts, updated: res.body.updated}; syncUi.status = "conflict"; syncUi.open = true; }
}
async function syncOnStart(){
  if (!SY) return;
  try {
    const res = await syncCall("load", {name: SY.name, pin: SY.pin});
    if (res.status === 200) {
      if (res.body.ts > (SY.lastTs || 0)) { if (S.ts <= (SY.lastTs || 0)) { adopt(res.body.data, res.body.ts); syncUi.status = "saved"; } else { syncUi.conflict = {data: res.body.data, ts: res.body.ts, updated: res.body.updated}; syncUi.status = "conflict"; } }
      else if (S.ts > (SY.lastTs || 0)) await pushSync();
      else syncUi.status = "saved";
    } else if (res.status === 401 || res.status === 404) { syncUi.error = res.status === 404 ? "Your saved progress was deleted, so this device has stopped syncing." : "The PIN for this username has changed, so this device has stopped syncing."; SY = null; saveLink(); }
    else syncUi.status = "offline";
  } catch(e) { syncUi.status = "offline"; }
  renderSyncButton(); if (syncUi.open || syncUi.conflict) renderSyncPanel();
}
window.addEventListener("pagehide", () => {
  if (!SY || syncUi.conflict || S.ts <= (SY.lastTs || 0)) return;
  const body = JSON.stringify({action: "save", name: SY.name, pin: SY.pin, data: JSON.stringify(S), ts: S.ts, base: SY.lastTs || 0});
  try { navigator.sendBeacon(API + "/api/sync", new Blob([body], {type: "text/plain"})); } catch(e) {}
});
window.addEventListener("online", () => { if (SY) pushSync(); });
const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : new Date(t).toLocaleDateString("en-GB", {day: "numeric", month: "short"}); };
function renderSyncButton(){
  const b = document.getElementById("syncbtn"); if (!b) return;
  const state = !SY ? "off" : syncUi.conflict ? "conflict" : syncUi.status === "offline" ? "offline" : "on";
  b.dataset.state = state; b.setAttribute("aria-expanded", String(syncUi.open));
  b.querySelector(".slabel").textContent = SY ? SY.name : "Sync";
  b.title = {off: "Save and continue on another device", on: "Syncing as " + (SY && SY.name), conflict: "Sync needs your attention", offline: "Offline: will sync when you’re back online"}[state];
}
function renderSyncPanel(){
  const p = document.getElementById("syncpanel"); if (!p) return;
  p.hidden = !syncUi.open;
  if (!syncUi.open) return;
  let h = `<div class="sphead"><h2>Continue on another device</h2><button type="button" class="btn small" data-act="sync-close" aria-label="Close">Close</button></div>`;
  if (syncUi.error) h += `<p class="err" role="alert">${esc(syncUi.error)}</p>`;
  if (SY && syncUi.conflict) {
    h += `<p>Your progress changed on this device <b>and</b> on another device (saved ${ago(syncUi.conflict.updated)}) since they last synced. Which copy do you want to keep?</p>
      <div class="row"><button type="button" class="btn primary" data-act="sync-use-remote">Use the other device’s progress</button><button type="button" class="btn" data-act="sync-keep-local">Keep this device’s progress</button></div>
      <p class="muted">The copy you don’t choose is replaced.</p>`;
  } else if (SY) {
    const st = syncUi.status === "saving" ? "Saving…" : syncUi.status === "offline" ? "Offline. Changes will sync when you’re back online." : SY.at ? `Last synced ${ago(SY.at)}.` : "";
    h += `<p>Syncing as <b>${esc(SY.name)}</b>. ${st} Your progress saves automatically a few seconds after each change, and the newest copy loads when you open the site on any device.</p>
      <div class="row"><button type="button" class="btn small primary" data-act="sync-now"${syncUi.busy ? " disabled" : ""}>Sync now</button><button type="button" class="btn small" data-act="sync-unlink">Stop syncing on this device</button><button type="button" class="btn small danger" data-act="sync-delete">Delete saved progress</button></div>`;
    if (syncUi.confirmDelete) h += `<div class="confirm"><span>Delete the progress saved under “${esc(SY.name)}” from the server? This device keeps its own copy.</span><div class="row"><button type="button" class="btn small danger" data-act="sync-delete-yes">Delete it</button><button type="button" class="btn small" data-act="sync-delete-no">Cancel</button></div></div>`;
  } else if (syncUi.pendingLink) {
    h += `<p>“${esc(syncUi.pendingLink.name)}” already has saved progress. Load it onto this device, or replace it with this device’s progress?</p>
      <div class="row"><button type="button" class="btn primary" data-act="sync-link-load">Load the saved progress</button><button type="button" class="btn" data-act="sync-link-replace">Replace it with this device’s</button><button type="button" class="btn" data-act="sync-link-cancel">Cancel</button></div>`;
  } else {
    h += `<p>Pick a username and a 4–8 digit PIN, then use the same pair on any device to carry on where you left off. There’s no email or account.</p>
      <form class="syncform" id="syncform"><div class="sf"><label for="sync-name">Username</label><input id="sync-name" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="30" required></div>
      <div class="sf"><label for="sync-pin">PIN</label><input id="sync-pin" type="password" inputmode="numeric" pattern="[0-9]{4,8}" maxlength="8" autocomplete="current-password" required></div>
      <div class="row"><button type="submit" class="btn primary" data-mode="save"${syncUi.busy ? " disabled" : ""}>Save and link this device</button><button type="submit" class="btn" data-mode="load"${syncUi.busy ? " disabled" : ""}>Load my progress</button></div></form>
      <p class="muted">Your username and progress are stored on the site’s server. Choose a name that doesn’t identify you if you prefer. You can delete it at any time.</p>`;
  }
  p.innerHTML = h;
}
async function linkDevice(mode, name, pin){
  syncUi.busy = true; syncUi.error = ""; renderSyncPanel();
  try {
    if (mode === "load") {
      const res = await syncCall("load", {name, pin});
      if (res.status === 200) { SY = {name: name.trim().toLowerCase(), pin, lastTs: 0}; adopt(res.body.data, res.body.ts); syncUi.status = "saved"; announce("Progress loaded."); }
      else syncUi.error = syncErr(res);
    } else {
      const res = await syncCall("save", {name, pin, data: JSON.stringify(S), ts: S.ts, base: 0});
      if (res.status === 200) { SY = {name: name.trim().toLowerCase(), pin, lastTs: res.body.ts, at: Date.now()}; saveLink(); syncUi.status = "saved"; announce("This device is now syncing."); }
      else if (res.status === 409) syncUi.pendingLink = {name, pin};
      else syncUi.error = syncErr(res);
    }
  } catch(e) { syncUi.error = "Couldn’t reach the server. Check your connection and try again."; }
  syncUi.busy = false; renderSyncButton(); renderSyncPanel();
}
document.addEventListener("submit", e => {
  if (e.target.id !== "syncform") return;
  e.preventDefault();
  const mode = (e.submitter && e.submitter.dataset.mode) || "save";
  linkDevice(mode, document.getElementById("sync-name").value, document.getElementById("sync-pin").value);
});
async function syncAction(act){
  switch (act) {
    case "sync-open": syncUi.open = !syncUi.open; syncUi.confirmDelete = false; syncUi.error = ""; renderSyncButton(); renderSyncPanel(); if (syncUi.open) document.getElementById(SY ? "syncpanel" : "sync-name")?.focus(); break;
    case "sync-close": syncUi.open = false; syncUi.error = ""; renderSyncButton(); renderSyncPanel(); document.getElementById("syncbtn")?.focus(); break;
    case "sync-now": // send this device’s changes if it has any, otherwise fetch the latest copy
      syncUi.busy = true; renderSyncPanel();
      if (S.ts > (SY.lastTs || 0)) await pushSync(); else await syncOnStart();
      syncUi.busy = false; renderSyncPanel(); break;
    case "sync-unlink": SY = null; saveLink(); syncUi.status = ""; syncUi.conflict = null; renderSyncButton(); renderSyncPanel(); announce("This device has stopped syncing. Its progress is kept."); break;
    case "sync-delete": syncUi.confirmDelete = true; renderSyncPanel(); break;
    case "sync-delete-no": syncUi.confirmDelete = false; renderSyncPanel(); break;
    case "sync-delete-yes": {
      const res = await syncCall("delete", {name: SY.name, pin: SY.pin}).catch(() => ({status: 0, body: {}}));
      if (res.status === 200 || res.status === 404) { SY = null; saveLink(); syncUi.confirmDelete = false; syncUi.status = ""; announce("Saved progress deleted from the server."); }
      else syncUi.error = syncErr(res);
      renderSyncButton(); renderSyncPanel(); break;
    }
    case "sync-use-remote": { const c = syncUi.conflict; syncUi.conflict = null; adopt(c.data, c.ts); syncUi.status = "saved"; renderSyncButton(); renderSyncPanel(); break; }
    case "sync-keep-local": syncUi.conflict = null; await pushSync(true); break;
    case "sync-link-load": { const {name, pin} = syncUi.pendingLink; syncUi.pendingLink = null; await linkDevice("load", name, pin); break; }
    case "sync-link-replace": {
      const {name, pin} = syncUi.pendingLink; syncUi.pendingLink = null;
      SY = {name: name.trim().toLowerCase(), pin, lastTs: 0}; saveLink(); await pushSync(true); break;
    }
    case "sync-link-cancel": syncUi.pendingLink = null; renderSyncPanel(); break;
  }
}

// ---------- private usage stats and error reports ----------
// One anonymous visit per page load (random browser code only), and up to 3 error reports per visit.
// Both respect the anonymous-sharing setting and are never shown on the site.
let errorsSent = 0;
function reportError(msg){
  if (!S.share || errorsSent >= 3 || location.protocol === "file:") return;
  errorsSent++;
  try { fetch(API + "/api/error", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({msg: String(msg).slice(0, 300)}), keepalive:true}).catch(() => {}); } catch(e) {}
}
window.addEventListener("error", e => {
  if (!e.filename || !/\/(app|questions|guide|sw)\.js/.test(e.filename)) return; // ignore extensions and third-party scripts
  reportError(`${e.message} @ ${e.filename.split("/").pop()}:${e.lineno}`);
});
window.addEventListener("unhandledrejection", e => {
  const r = e.reason; if (r && r.name === "TypeError" && /fetch|network|load failed/i.test(r.message)) return; // offline, not a bug
  reportError("Unhandled: " + (r && r.message || r));
});
function countVisit(){
  if (!S.share || location.protocol === "file:" || /^(localhost|127\.)/.test(location.hostname)) return;
  const app = !!(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
  fetch(API + "/api/visit", {method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({client:S.cid, app}), keepalive:true}).catch(() => {});
}

// ---------- start ----------
window.addEventListener("online", flush);
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  // When a new version installs, reload once so visitors see it straight away (progress is already saved).
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloading || ui.building || timerOn || document.querySelector(".dragging, textarea:focus") || (document.getElementById("code-in") || {}).value) return;
    reloading = true; save(); location.reload();
  });
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
if (location.hash) fromHash(); else render();
flush();
countVisit();
renderSyncButton();
syncOnStart();
(async () => {
  const backup = await idbGet();
  if (backup) {
    try {
      const b = normalise(JSON.parse(backup));
      if (!hadLocal || b.ts > loadedTs) { const view = S.view; S = b; S.view = view; save(true); render(); }
    } catch(e) {}
  } else if (answeredCount(S)) idbPut(JSON.stringify(S));
  try { if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) await navigator.storage.persist(); } catch(e) {}
  if (S.view === "practice") renderPanel();
})();
