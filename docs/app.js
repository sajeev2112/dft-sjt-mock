"use strict";
// DFT SJT Mock Paper: practice sets, results, the guide, settings and anonymous community stats.

const PAPERS = {
  p1:{name:"Paper 1", sub:"Standard", from:0, to:32},
  p2:{name:"Paper 2", sub:"Harder", from:32, to:64},
  p3:{name:"Paper 3", sub:"Harder", from:64, to:96}
};
const PAPER_IDS = Object.keys(PAPERS).filter(id => Q.length >= PAPERS[id].to);
const PACE = 112.5; // seconds per item at live-test pace (105 min / 56)
const WORKER = "https://dft-sjt-mock.sajeev-r13.workers.dev";
const API = (location.protocol === "file:" || location.hostname.endsWith("github.io")) ? WORKER : "";
const GRIP = '<svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true"><g fill="currentColor"><circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/><circle cx="2" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="2" cy="14" r="1.5"/><circle cx="8" cy="14" r="1.5"/></g></svg>';
const isRank = q => q.t !== "best3";
const range = (a, b) => Array.from({length: b - a}, (_, i) => a + i);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = s => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const pct = (g, m) => m ? Math.round(g / m * 100) : 0;
function uid(){ try { return crypto.randomUUID(); } catch(e) { return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12); } }
function shuffle(a){ a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- state ----------
const STORE = "dft-sjt-mock-v4", V3 = "dft-sjt-mock-v3";
function newSet(extra){ return Object.assign({ans:{}, chk:{}, marked:false, el:0, cur:0, mode:"practice", logged:false}, extra || {}); }
function fresh(){ return {v:4, cid:uid(), share:true, view:"practice", setId:"p1", sets:{p1:newSet(), p2:newSet(), p3:newSet(), custom:null}, att:{}, days:{}, hist:[], sent:{}, outbox:[], fb:{}}; }
let S = fresh();
function normalise(o){
  const s = Object.assign(fresh(), o);
  s.sets = Object.assign({p1:newSet(), p2:newSet(), p3:newSet(), custom:null}, s.sets || {});
  ["att","days","sent","fb"].forEach(k => { if (!s[k] || typeof s[k] !== "object") s[k] = {}; });
  ["hist","outbox"].forEach(k => { if (!Array.isArray(s[k])) s[k] = []; });
  if (!s.sets[s.setId] || (s.setId !== "custom" && !PAPER_IDS.includes(s.setId))) s.setId = "p1";
  return s;
}
function migrateV3(o){
  const s = fresh();
  [1, 2].forEach(p => {
    const set = s.sets["p" + p], P = PAPERS["p" + p];
    set.mode = o.mode === "exam" ? "exam" : "practice";
    set.marked = !!(o.marked && o.marked[p]);
    set.el = (o.el && +o.el[p]) || 0;
    const last = o.last && Number.isInteger(o.last[p]) ? o.last[p] : P.from;
    set.cur = Math.max(0, Math.min(31, last - P.from));
  });
  Object.keys(o.ans || {}).forEach(k => { const i = +k; if (i >= 0 && i < 64) s.sets[i < 32 ? "p1" : "p2"].ans[i] = o.ans[k]; });
  Object.keys(o.chk || {}).forEach(k => { const i = +k; if (i >= 0 && i < 64) s.sets[i < 32 ? "p1" : "p2"].chk[i] = true; });
  s.setId = (+o.cur || 0) < 32 ? "p1" : "p2";
  ["p1", "p2"].forEach(id => { const set = s.sets[id]; listOf(id, s).forEach(qi => { if (revealed(set, qi) && complete(set, qi)) addAttempt(s, set, qi, false); }); });
  return s;
}
let timerOn = false;
// Progress lives in localStorage, with a debounced backup copy in IndexedDB in case one store is cleared.
let storageOk = true, savedAt = 0, idbTimer = null;
function save(){
  const json = JSON.stringify(S);
  try { localStorage.setItem(STORE, json); storageOk = true; } catch(e) { storageOk = false; }
  savedAt = Date.now();
  clearTimeout(idbTimer); idbTimer = setTimeout(() => idbPut(json), 800);
}
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

const revealed = (set, qi) => set.mode === "practice" ? !!set.chk[qi] : !!set.marked;
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
try {
  const raw = localStorage.getItem(STORE);
  if (raw) S = normalise(JSON.parse(raw));
  else { const old = localStorage.getItem(V3); if (old) S = normalise(migrateV3(JSON.parse(old))); }
} catch(e) {}

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
        S.outbox = S.outbox.slice(items.length); save();
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
    return `<button type="button" class="ptab" role="tab" data-act="set" data-id="${id}" aria-selected="${S.setId === id}">${P.name} · ${P.sub}<small>${done}/${list.length}</small></button>`;
  }).join("");
  const c = S.sets.custom;
  if (c) { const done = c.list.filter(qi => complete(c, qi)).length; h += `<button type="button" class="ptab quiz" role="tab" data-act="set" data-id="custom" aria-selected="${S.setId === "custom"}">${esc(c.name)}<small>${done}/${c.list.length}</small></button>`; }
  h += `<button type="button" class="ptab new" data-act="new" aria-pressed="${ui.building}">+ New quiz</button>`;
  document.getElementById("ptabs").innerHTML = h;
}

function cellHtml(set, qi, k, lower){
  let cls = "cell" + (lower ? " lo" : ""), status = "not started";
  if (revealed(set, qi)) { const s = qScore(set, qi); cls += " " + band(s.got, s.max); status = s.got + " of " + s.max + " marks"; }
  else if (started(set, qi)) { cls += " done"; status = complete(set, qi) ? "answered" : "in progress"; }
  if (k === set.cur && !ui.building) cls += " cur";
  const label = S.setId === "custom" ? k + 1 : qi + 1;
  return `<button type="button" class="${cls}" data-act="go" data-k="${k}" aria-label="Question ${label}, ${status}"${k === set.cur ? ' aria-current="step"' : ""}>${label}</button>`;
}
function renderGrid(){
  const set = curSet(), list = curList(), title = document.getElementById("chart-title");
  let h = "";
  if (PAPERS[S.setId] && list.length === 32) {
    const P = PAPERS[S.setId];
    title.textContent = `${P.name} map · upper arch Q${P.from + 1}–${P.from + 16} · lower arch Q${P.from + 17}–${P.to}`;
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
  const where = S.setId === "custom" ? ` <span class="qfrom">· Paper ${q.p}, Q${q.n}</span>` : "";
  let h = `<div class="qhead"><span class="qnum">Question ${k + 1} of ${list.length}${where}</span><div class="chips">${q.p > 1 ? `<span class="chip hard">Paper ${q.p} · Harder</span>` : ""}<span class="chip type">${TYPES[q.t]}</span><span class="chip">${DOMAINS[q.d]}</span></div></div>`;
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
      if (!isSet) h += `<div class="setrow"><span>Drag the options into order, or use the arrows. If you agree with the order shown, keep it as it is.</span><button type="button" class="btn small" data-act="keep">Keep this order</button></div>`;
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
  S.setId = "custom"; S.view = "practice"; ui.building = false;
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
  h += `<h3 class="bsub">By paper</h3><div class="doms wide">` + PAPER_IDS.map(id => { const P = PAPERS[id]; let pg = 0, pm = 0, n = 0; range(P.from, P.to).forEach(i => { const a = lastAtt(i); if (a) { pg += a.g; pm += a.m; n++; } }); return `<div class="dom"><span>${P.name} · ${P.sub} <small class="muted">${n}/32</small></span><span>${n ? pct(pg, pm) + "%" : "–"}</span><div class="bar"><i style="width:${pct(pg, pm)}%"></i></div></div>`; }).join("") + `</div>`;
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
  h += `<section class="sset"><h3>Community stats</h3><label class="toggle"><input type="checkbox" id="share" ${S.share ? "checked" : ""}> <span>Share my answers anonymously</span></label><p class="muted">When on, your first attempt at each question is sent without your name, email or IP address. It’s identified only by a random code stored in this browser, and it’s used to show everyone how others answered. Turning it off stops sending; answers already sent stay in the totals.</p></section>`;
  h += `<section class="sset"><h3>How your progress is saved</h3><p class="muted">Your answers, scores and settings are saved automatically in this browser, with a backup copy, so they’re still here when you come back. There’s no account, and nothing leaves your device apart from anonymous answers for the community stats. Progress can be lost if you clear your browsing data, use a private window, or (in Safari) don’t visit for 7 days. Adding the site to your home screen avoids the Safari limit. For extra safety, keep a progress code.</p></section>`;
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
  const data = Object.assign({}, S, {outbox:[]});
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
  if (!o || o.v !== 4 || !o.sets) throw new Error("shape");
  return normalise(o);
}

// ---------- navigation ----------
function scrollToCard(){ const c = document.getElementById("card"); if (c) c.scrollIntoView({block:"nearest"}); }
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
  if (["practice", "results", "settings"].includes(h)) { S.view = h; save(); render(); window.scrollTo(0, 0); }
}
window.addEventListener("hashchange", fromHash);

// ---------- events ----------
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act]"); if (!b || b.disabled) return;
  const act = b.dataset.act, set = curSet();
  const qi = S.view === "practice" && !ui.building ? curQi() : null;
  switch (act) {
    case "view": if (location.hash === "#" + b.dataset.v) fromHash(); else location.hash = b.dataset.v; break;
    case "set": S.setId = b.dataset.id; ui.building = false; ui.confirmMark = ui.confirmReset = false; timerOn = false; save(); render(); break;
    case "new": ui.building = !ui.building; render(); scrollToCard(); break;
    case "cancel-build": ui.building = false; render(); break;
    case "build": buildQuiz(b.dataset.kind, b.dataset.arg); break;
    case "go": go(+b.dataset.k); break;
    case "prev": go(set.cur - 1); break;
    case "next": go(set.cur + 1); break;
    case "mv": {
      const a = ansOf(set, qi), o = +b.dataset.o, d = +b.dataset.d, pos = a.ord.indexOf(o), np = pos + d;
      if (np < 0 || np > 4) return;
      [a.ord[pos], a.ord[np]] = [a.ord[np], a.ord[pos]]; a.set = true; save(); render();
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
      break;
    case "retry": delete set.ans[qi]; delete set.chk[qi]; set.logged = false; ui.fbOpen = null; save(); render(); break;
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
      try { S = await readCode(ui.pending || ""); S.view = "settings"; save(); ui.codeMsg = "Progress loaded."; flush(); }
      catch(err) { ui.codeMsg = "That code couldn’t be read. Check you copied all of it."; }
      ui.confirmLoad = false; ui.pending = ""; render(); break;
    case "install": if (installPrompt) { installPrompt.prompt(); installPrompt = null; renderSettings(); } break;
    case "wipe": ui.confirmWipe = true; renderSettings(); break;
    case "wipe-no": ui.confirmWipe = false; renderSettings(); break;
    case "wipe-yes": { const cid = S.cid; S = fresh(); S.cid = cid; S.view = "settings"; ui.confirmWipe = false; save(); render(); break; }
  }
});
document.addEventListener("change", e => {
  if (e.target.id === "share") { S.share = e.target.checked; save(); if (S.share) flush(); }
});
function refreshStats(qi){ const box = document.getElementById("stats-" + qi); if (box) box.outerHTML = statsHtml(qi); }
function markSet(){
  const set = curSet(), list = curList();
  set.marked = true; timerOn = false; ui.confirmMark = false;
  list.forEach(qi => { if (started(set, qi)) { set.chk[qi] = true; addAttempt(S, set, qi); } });
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

// ---------- start ----------
window.addEventListener("online", flush);
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
if (location.hash) fromHash(); else render();
flush();
(async () => {
  const backup = await idbGet();
  if (backup) {
    try {
      const b = normalise(JSON.parse(backup));
      if (answeredCount(b) > answeredCount(S)) { S = b; save(); render(); }
    } catch(e) {}
  } else if (answeredCount(S)) idbPut(JSON.stringify(S));
  try { if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) await navigator.storage.persist(); } catch(e) {}
  if (S.view === "practice") renderPanel();
})();
