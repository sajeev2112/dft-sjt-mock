// The site's design layer (Oct 2026): progress tiles, the timed-mock card, score rings and gauges, the sliding nav,
// theme toggle, ripples, scroll reveal and the Sync tip. Enhances what app.js renders without changing its logic.
(function(){
  const KEY = "dft-design";
  const root = document.documentElement;
  const reduce = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const on = true;
  root.classList.add("nd");

  const prog = document.createElement("div"); prog.className = "nd-progress nd-only"; document.body.appendChild(prog);
  let spQueued = false;   // at most one update per frame
  const onScroll = () => { if (spQueued) return; spQueued = true; requestAnimationFrame(() => { spQueued = false; const h = document.documentElement; const max = h.scrollHeight - h.clientHeight; prog.style.transform = `scaleX(${max > 0 ? (h.scrollTop / max).toFixed(4) : 0})`; }); };
  window.addEventListener("scroll", onScroll, {passive: true});

  // shared gradient for gauges
  document.body.insertAdjacentHTML("beforeend", `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="nd-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:#6C8BFF"/></linearGradient></defs></svg>`);

  const views = document.querySelector(".views");
  const ind = document.createElement("span"); ind.className = "nav-ind nd-only"; ind.setAttribute("aria-hidden", "true"); views.prepend(ind);
  const theme = document.createElement("button");
  theme.type = "button"; theme.className = "themebtn nd-only"; theme.title = "Theme: auto"; theme.setAttribute("aria-label", "Change colour theme");
  const ICON = {auto: "◐", light: "☀", dark: "☾"};
  let mode = "auto"; try { mode = localStorage.getItem(KEY + "-theme") || "auto"; } catch(e) {}
  const applyTheme = () => { if (mode === "auto") delete root.dataset.theme; else root.dataset.theme = mode; theme.textContent = ICON[mode]; theme.title = "Theme: " + mode; theme.setAttribute("aria-label", `Colour theme: ${mode}. Change theme`); };
  theme.addEventListener("click", () => { mode = mode === "auto" ? "light" : mode === "light" ? "dark" : "auto"; try { localStorage.setItem(KEY + "-theme", mode); } catch(e) {} applyTheme(); });
  applyTheme(); views.appendChild(theme);

  const stats = document.createElement("div"); stats.className = "nd-stats nd-only"; stats.setAttribute("aria-label", "Your progress");
  document.querySelector("#view-practice .sub").after(stats);
  const cta = document.createElement("div"); cta.className = "nd-mockcta nd-only"; stats.after(cta);
  const revFlag = document.createElement("button"); revFlag.type = "button"; revFlag.className = "ptab nd-revflag nd-only"; revFlag.dataset.act = "build"; revFlag.dataset.kind = "flagged";
  document.querySelector(".setbar").appendChild(revFlag);

  // ripple on press
  document.addEventListener("pointerdown", e => {
    if (!on || reduce()) return;
    const b = e.target.closest(".btn, .ptab, .bcard, .pick, .chipbtn, .cell");
    if (!b || b.disabled) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2, d = document.createElement("span");
    d.className = "ripple"; d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    if (getComputedStyle(b).position === "static") b.style.position = "relative";
    b.style.overflow = "hidden"; b.appendChild(d); setTimeout(() => d.remove(), 600);
  });

  // ---------- helpers ----------
  const ring = (cls, size, stroke, frac, color) => {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    return `<svg class="${cls} nd-only" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="bg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/><circle class="fg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${c * (1 - frac)}"${color ? ` style="stroke:${color}"` : ""}/></svg>`;
  };
  const fill = el => setTimeout(() => el.querySelectorAll(".fg[data-off]").forEach(f => f.style.strokeDashoffset = f.dataset.off), 40);
  const countTo = (el, to, fmt) => {
    const from = +(el.dataset.v || 0); el.dataset.v = to;
    if (reduce() || from === to || document.hidden) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 700;
    const step = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(Math.round(from + (to - from) * e)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  function confetti(){
    if (reduce()) return;
    const cv = document.createElement("canvas"); cv.className = "nd-confetti"; document.body.appendChild(cv);
    const dpr = window.devicePixelRatio || 1; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; const ctx = cv.getContext("2d"); ctx.scale(dpr, dpr);
    const css = getComputedStyle(root), cols = [css.getPropertyValue("--accent"), "#6C8BFF", css.getPropertyValue("--near"), css.getPropertyValue("--good")].map(s => s.trim() || "#0E6A62");
    const src = document.querySelector("#card .scoreline")?.getBoundingClientRect() || {left: innerWidth / 2, top: innerHeight / 2, width: 0};
    const ps = Array.from({length: 90}, () => ({x: src.left + 40, y: src.top + 10, vx: (Math.random() - .3) * 9, vy: -Math.random() * 9 - 3, r: Math.random() * 5 + 3, c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6, va: (Math.random() - .5) * .3}));
    const t0 = performance.now();
    (function frame(t){
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(p => { p.vy += .28; p.x += p.vx; p.y += p.vy; p.a += p.va; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); });
      if (t - t0 < 1600) requestAnimationFrame(frame); else cv.remove();
    })(t0);
  }

  // ---------- per-render enhancements ----------
  let celebrated = "", lastGauge = -1;
  function enhance(){
    // nav indicator
    const cur = views.querySelector('[aria-current="page"]');
    if (cur) { ind.style.left = cur.offsetLeft + "px"; ind.style.width = cur.offsetWidth + "px"; ind.style.top = cur.offsetTop + "px"; ind.style.height = cur.offsetHeight + "px"; }

    // hero stats
    if (typeof S !== "undefined" && typeof Q !== "undefined") {
      const ids = Object.keys(S.att || {}); let g = 0, m = 0;
      ids.forEach(i => { const a = S.att[i]; const l = a && a[a.length - 1]; if (l) { g += l.g; m += l.m; } });
      const dayKey = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      const days = S.days || {}; let streak = 0; const d = new Date();
      if (!(days[dayKey(d)] && days[dayKey(d)].n)) d.setDate(d.getDate() - 1); // a streak can still be alive if you practised yesterday
      while (days[dayKey(d)] && days[dayKey(d)].n) { streak++; d.setDate(d.getDate() - 1); }
      if (!stats.firstChild) stats.innerHTML = `<div class="nd-stat acc"><b data-k="ans">0</b><span>Questions done</span></div><div class="nd-stat"><b data-k="avg">0%</b><span>Average score</span></div><div class="nd-stat"><b data-k="streak">0</b><span>Day streak</span></div><button type="button" class="nd-stat nd-statbtn" data-act="build" data-kind="flagged" title="Practise your flagged questions"><b data-k="flag">0</b><span>Flagged</span></button>`;
      countTo(stats.querySelector('[data-k="ans"]'), ids.length, v => `${v}/${Q.length}`);
      countTo(stats.querySelector('[data-k="avg"]'), m ? Math.round(g / m * 100) : 0, v => `${v}%`);
      countTo(stats.querySelector('[data-k="streak"]'), streak, v => `${v}`);
      countTo(stats.querySelector('[data-k="flag"]'), Object.keys(S.flags || {}).length, v => `${v}`);
      const nfl = Object.keys(S.flags || {}).length, fb = stats.querySelector(".nd-statbtn");
      fb.disabled = !nfl; fb.querySelector("span").textContent = nfl ? "Flagged →" : "Flagged";
      fb.title = nfl ? "Practise your flagged questions" : "Flag questions to collect them here";
    }

    // timed mock call-to-action
    if (typeof S !== "undefined") {
      const c = S.sets.custom, live = c && c.kind === "mock" && c.limit && !c.marked;
      const lastMock = (S.hist || []).filter(h => /mock/i.test(h.name)).slice(-1)[0];
      const left = live ? Math.max(0, c.limit - c.el) : 0, mm = String(Math.floor(left / 60)).padStart(2, "0") + ":" + String(Math.floor(left % 60)).padStart(2, "0");
      const sig = [live, live && c.started, Math.floor(left / 60), lastMock && lastMock.t].join("|");
      if (cta.dataset.sig !== sig) {
        cta.dataset.sig = sig;
        cta.innerHTML = `<div class="nd-cta-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 9v4l2.6 1.6M9.5 2.8h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div>` +
          `<div class="nd-cta-txt"><b>${live ? (c.started ? "Mock in progress" : "Your mock is ready") : "Timed mock exam"}</b><span>${live && c.started ? `${mm} left · ${c.list.filter(i => complete(c, i)).length}/${c.list.length} answered` : "56 random questions · 105 minutes · marked like the real test"}${!live && lastMock ? ` · last time ${Math.round(lastMock.g / lastMock.m * 100)}%` : ""}</span></div>` +
          `<button type="button" class="btn primary nd-cta-btn" data-act="mock-quick">${live ? (c.started ? "Resume mock" : "Start the clock") : "Start timed mock"}</button>`;
      }
      const nf = Object.keys(S.flags || {}).length;
      revFlag.hidden = !nf; const rf = `⚑ Review flagged <small>${nf}</small>`; if (revFlag.innerHTML !== rf) revFlag.innerHTML = rf;
    }

    // paper tabs: progress underline
    document.querySelectorAll("#ptabs .ptab small").forEach(sm => { const [a, b] = sm.textContent.split("/").map(Number); if (b) sm.parentElement.style.setProperty("--p", (a / b).toFixed(3)); });

    // panel: score gauge
    const big = document.querySelector("#panel .big");
    if (big && !big.closest(".nd-gauge")) {
      const m2 = big.textContent.match(/(\d+)\s*\/\s*(\d+)/);
      const wrap = document.createElement("div"); wrap.className = "nd-gauge";
      const frac = m2 ? +m2[1] / +m2[2] : 0, changed = frac !== lastGauge; lastGauge = frac;
      big.before(wrap); wrap.innerHTML = ring("", 74, 8, frac, "url(#nd-grad)"); wrap.appendChild(big);
      if (changed) fill(wrap); else wrap.querySelectorAll(".fg[data-off]").forEach(f => { f.style.transition = "none"; f.style.strokeDashoffset = f.dataset.off; });
    }

    // answer reveal: ring beside the score, confetti on full marks
    const sl = document.querySelector("#card .scoreline");
    if (sl && !sl.querySelector(".nd-ring") && typeof qScore === "function") {
      const sc = qScore(curSet(), curQi()), frac = sc.got / sc.max;
      const col = frac >= .8 ? "var(--good)" : frac >= .55 ? "var(--near)" : "var(--bad)";
      sl.insertAdjacentHTML("afterbegin", ring("nd-ring", 46, 6, frac, col)); fill(sl);
      const sig = S.setId + ":" + curQi();
      if (on && frac === 1 && document.getElementById("card").classList.contains("in-reveal") && celebrated !== sig) { celebrated = sig; confetti(); }
    }

    // guide sections reveal on scroll
    // (sections already on screen, or at/above a #guide-… link target, are shown straight away)
    if (on && "IntersectionObserver" in window && !reduce()) {
      const target = location.hash.startsWith("#guide-") ? document.getElementById(location.hash.slice(1)) : null;
      let passedTarget = !target;
      document.querySelectorAll("#view-guide .gsec:not([data-nd])").forEach(s => {
        s.dataset.nd = "1";
        if (s === target) { passedTarget = true; return; }
        const r = s.getBoundingClientRect();
        if (!passedTarget || r.top < innerHeight * 0.92) return;
        s.classList.add("nd-hide"); io.observe(s);
      });
    }
  }
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove("nd-hide"); io.unobserve(e.target); } }), {rootMargin: "0px 0px -8% 0px"}) : null;

  let queued = false;
  let busy = false;
  const now = () => { if (busy) return; busy = true; try { enhance(); } finally { busy = false; } };
  const schedule = () => { if (queued) return; queued = true; setTimeout(() => { queued = false; now(); }, 16); };
  // clock ticks and the score count-up only change text inside these; they don't need the page re-enhanced
  const quiet = n => { const el = n.nodeType === 1 ? n : n.parentElement; return !!(el && el.closest && el.closest("#clock, #mclock, #pace, .sv")); };
  const mo = new MutationObserver(recs => { if (recs.every(r => quiet(r.target))) return; now(); });
  ["card", "panel", "ptabs", "grid", "view-results", "view-guide", "view-settings"].forEach(id => { const el = document.getElementById(id); if (el) mo.observe(el, {childList: true, subtree: true}); });
  document.querySelectorAll(".views [data-v]").forEach(b => new MutationObserver(now).observe(b, {attributes: true, attributeFilter: ["aria-current"]}));
  window.addEventListener("resize", schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule); // the nav pill is measured again once web fonts arrive
  schedule();
})();


// ---------- Sync tip: a bubble under the Sync button that explains cross-device saving ----------
(function(){
  const KEY = "dft-sync-tip", btn = document.getElementById("syncbtn");
  if (!btn || !document.documentElement.classList.contains("nd")) return;
  let seen = { n: 0, done: false }; try { seen = Object.assign(seen, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch(e) {}
  const linked = () => { try { return !!JSON.parse(localStorage.getItem("dft-sjt-sync") || "null"); } catch(e) { return false; } };
  const store = () => { try { localStorage.setItem(KEY, JSON.stringify(seen)); } catch(e) {} };
  if (seen.done || seen.n >= 3 || linked()) return;
  seen.n++; store();

  const tip = document.createElement("div");
  tip.className = "nd-tip nd-only"; tip.setAttribute("role", "status");
  tip.innerHTML = `<div class="nd-tip-body"><b>Save your progress across devices</b><span>Tap <strong>Sync</strong>, pick a username and a 4–8 digit PIN, then enter the same on your other phone or laptop to load your progress. No account or email needed.</span></div>` +
    `<button type="button" class="nd-tip-x" aria-label="Dismiss tip">×</button><i class="nd-tip-bar" aria-hidden="true"></i>`;
  document.body.appendChild(tip);

  const place = () => {
    const r = btn.getBoundingClientRect(), w = tip.offsetWidth, vw = document.documentElement.clientWidth;
    const centre = Math.min(Math.max(r.left + r.width / 2, 12 + 24), vw - 12 - 24);         // arrow stays over the button
    const left = Math.min(Math.max(centre - w / 2, 12), vw - w - 12);
    tip.style.left = left + "px"; tip.style.top = (r.bottom + 12) + "px";
    tip.style.setProperty("--arrow", (centre - left) + "px");
  };
  let timer = null, left = 7000, startedAt = 0, ro = null;
  const close = (forever) => {
    if (!tip.isConnected) return;
    clearTimeout(timer); tip.classList.remove("show"); tip.classList.add("hide");
    if (forever) { seen.done = true; store(); }
    window.removeEventListener("scroll", onScroll); document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown, true); window.removeEventListener("resize", place);
    setTimeout(() => tip.remove(), 320);
    if (ro) ro.disconnect();
  };
  const run = () => { startedAt = Date.now(); tip.style.setProperty("--life", left + "ms"); tip.classList.add("counting"); timer = setTimeout(() => close(false), left); };
  const pause = () => { clearTimeout(timer); left = Math.max(1200, left - (Date.now() - startedAt)); tip.classList.remove("counting"); };
  const onScroll = () => { if (window.scrollY > 60) close(false); };
  const onKey = e => { if (e.key === "Escape") close(false); };
  const onDown = e => { if (e.target.closest("#syncbtn")) close(true); else if (!tip.contains(e.target)) close(false); };
  tip.querySelector(".nd-tip-x").addEventListener("click", () => close(true));
  tip.addEventListener("pointerenter", pause); tip.addEventListener("pointerleave", run);
  tip.addEventListener("focusin", pause);

  setTimeout(() => {   // let the page settle first, then pop down
    if (window.scrollY > 60 || linked()) { tip.remove(); return; }
    place(); tip.classList.add("show"); run();
    // keep the arrow on the button if the header shifts (web fonts loading, nav pill moving, resizing)
    if ("ResizeObserver" in window) { ro = new ResizeObserver(place); ro.observe(document.querySelector(".views")); ro.observe(document.querySelector("header.top")); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    window.addEventListener("scroll", onScroll, {passive: true}); document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true); window.addEventListener("resize", place);
  }, 1200);
})();


// ---------- polish pack (trial): page transitions, focus mode, mobile tab bar, tooltips, accent colours,
// install card ----------
(function(){
  const root = document.documentElement;
  const reduce = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const get = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch(e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch(e) {} };

  // accent colours
  const ACCENTS = {teal:"Teal", indigo:"Indigo", plum:"Plum", ocean:"Ocean", slate:"Slate"};
  const META = {teal:["#0E6A62","#0E1413"], indigo:["#4338CA","#11121C"], plum:["#8A2C6C","#171017"], ocean:["#1D5FA8","#0D1420"], slate:["#3E4C63","#11151B"]};
  const applyAccent = a => {
    if (!ACCENTS[a]) a = "teal";
    if (a === "teal") delete root.dataset.accent; else root.dataset.accent = a;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m, i) => m.content = META[a][i] || META[a][0]);
  };
  applyAccent(get("dft-accent", "teal"));

  // hover/tap tooltips for anything with data-tip (chart bars, calendar days)
  const tip = document.createElement("div"); tip.className = "nd-hovertip"; tip.setAttribute("role", "tooltip"); document.body.appendChild(tip);
  let tipFor = null;
  const showTip = (el, x, y) => {
    tipFor = el; tip.textContent = el.dataset.tip; tip.classList.add("show");
    const w = tip.offsetWidth, h = tip.offsetHeight, vw = document.documentElement.clientWidth;
    tip.style.left = Math.min(Math.max(8, x - w / 2), vw - w - 8) + "px";
    tip.style.top = (y - h - 12 < 8 ? y + 18 : y - h - 12) + "px";
  };
  const hideTip = () => { tipFor = null; tip.classList.remove("show"); };
  let tipFrame = 0, tipEv = null;
  document.addEventListener("pointermove", e => {
    tipEv = e; if (tipFrame) return;
    tipFrame = requestAnimationFrame(() => {
      tipFrame = 0; const ev = tipEv, el = ev.target.closest && ev.target.closest("[data-tip]");
      if (!el) { if (tipFor) hideTip(); return; }
      if (el !== tipFor) { tip.textContent = el.dataset.tip; tipFor = el; }
      showTip(el, ev.clientX, ev.clientY);
    });
  }, {passive: true});
  document.addEventListener("focusin", e => { const el = e.target.closest && e.target.closest("[data-tip]"); if (el) { const r = el.getBoundingClientRect(); showTip(el, r.left + r.width / 2, r.top); } else if (tipFor) hideTip(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && tipFor) hideTip(); });
  document.addEventListener("pointerdown", e => { const el = e.target.closest && e.target.closest("[data-tip]"); if (el && e.pointerType !== "mouse") { const r = el.getBoundingClientRect(); showTip(el, r.left + r.width / 2, r.top); } else if (!el) hideTip(); });
  window.addEventListener("scroll", () => { if (tipFor) hideTip(); }, {passive: true});

  // mobile tab bar
  const ICONS = {
    practice: '<path d="M4 5.5h16M4 12h16M4 18.5h10" />',
    results: '<path d="M5 19V11M12 19V5M19 19v-6" />',
    guide: '<path d="M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z M17 7.5h2V20" />',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />'
  };
  const tabbar = document.createElement("nav"); tabbar.className = "nd-tabbar nd-only"; tabbar.setAttribute("aria-label", "Sections");
  tabbar.innerHTML = ["practice", "results", "guide", "settings"].map(v => `<button type="button" data-act="view" data-v="${v}"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[v]}</svg><span>${v[0].toUpperCase() + v.slice(1)}</span></button>`).join("");
  document.body.appendChild(tabbar);

  // focus-mode bar (shown while a timed mock is running)
  const fbar = document.createElement("div"); fbar.className = "nd-focusbar nd-only";
  fbar.innerHTML = `<span><b>Focus mode</b> · everything but the question is hidden</span><button type="button" class="btn small" data-nd="unfocus">Show everything</button>`;
  document.querySelector("#view-practice").prepend(fbar);
  const focusOff = () => { try { return sessionStorage.getItem("dft-focus-off") === "1"; } catch(e) { return false; } };
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-nd]"); if (!b) return;
    if (b.dataset.nd === "unfocus") { try { sessionStorage.setItem("dft-focus-off", "1"); } catch(err) {} sync(); }
    if (b.dataset.nd === "focus") { try { sessionStorage.removeItem("dft-focus-off"); } catch(err) {} sync(); }
    if (b.dataset.nd === "accent") { put("dft-accent", b.dataset.a); applyAccent(b.dataset.a); sync(); }
    if (b.dataset.nd === "install-x") { put("dft-install-x", "1"); install.remove(); }
  });

  // install card
  const install = document.createElement("div"); install.className = "nd-install nd-only"; install.hidden = true;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  const standalone = () => (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone;
  document.querySelector(".layout")?.after(install);

  let lastView = null, lastFocus = null;
  function sync(){
    if (typeof S === "undefined") return;
    // page transition when the section changes
    if (lastView !== null && lastView !== S.view && !reduce()) {
      const el = document.querySelector(`[data-view-panel="${S.view}"]`);
      if (el) { el.classList.remove("nd-enter"); void el.offsetWidth; el.classList.add("nd-enter"); }
    }
    lastView = S.view;
    tabbar.querySelectorAll("[data-v]").forEach(b => b.setAttribute("aria-current", b.dataset.v === S.view ? "page" : "false"));

    // focus mode
    const set = S.sets[S.setId], live = typeof mockLive === "function" && set && mockLive(set) && S.view === "practice" && !ui.building;
    const on = live && !focusOff();
    if (on !== lastFocus) { root.classList.toggle("nd-focus", on); lastFocus = on; }
    fbar.hidden = !live;
    if (fbar.dataset.on !== String(on)) {
      const had = fbar.contains(document.activeElement);
      fbar.dataset.on = String(on);
      fbar.innerHTML = on ? `<span><b>Focus mode</b> · only the question, the clock and the grid</span><button type="button" class="btn small" data-nd="unfocus">Show everything</button>`
                          : `<span>Timed mock in progress</span><button type="button" class="btn small" data-nd="focus">Focus mode</button>`;
      if (had) fbar.querySelector("button").focus({preventScroll: true});
    }

    // install card: after a few questions, if the app isn't installed and wasn't dismissed
    const answered = Object.keys(S.att || {}).length;
    const canPrompt = typeof installPrompt !== "undefined" && installPrompt;
    const show = S.view === "practice" && !standalone() && get("dft-install-x") !== "1" && answered >= 3 && (canPrompt || ios) && !live;
    install.hidden = !show;
    if (show && install.dataset.mode !== (canPrompt ? "p" : "i")) {
      install.dataset.mode = canPrompt ? "p" : "i";
      install.innerHTML = `<img src="icon-192.png" alt="" width="44" height="44"><div><b>Install DFT SJT as an app</b><span>${canPrompt ? "Full-screen, works offline, one tap from your home screen." : "Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>: full-screen and works offline."}</span></div>` +
        (canPrompt ? `<button type="button" class="btn primary small" data-act="install">Install</button>` : "") + `<button type="button" class="nd-tip-x" data-nd="install-x" aria-label="Dismiss">×</button>`;
    }

    // accent picker in Settings
    const st = document.getElementById("view-settings");
    if (S.view === "settings" && st.firstElementChild && !st.querySelector(".nd-accents")) {
      const cur = root.dataset.accent || "teal", sec = document.createElement("section"); sec.className = "sset nd-accents";
      sec.innerHTML = `<h3>Appearance</h3><p class="muted">Pick an accent colour. The light, dark or auto theme is the ◐ button in the top bar.</p><div class="swatches" role="group" aria-label="Accent colour">` +
        Object.keys(ACCENTS).map(a => `<button type="button" class="swatch" data-nd="accent" data-a="${a}" aria-pressed="${a === cur}"><i data-a="${a}"></i>${ACCENTS[a]}</button>`).join("") + `</div>`;
      st.querySelector(".sset")?.before(sec);
    } else st.querySelectorAll(".swatch").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.a === (root.dataset.accent || "teal"))));
  }
  let q = false;
  const later = () => { if (q) return; q = true; setTimeout(() => { q = false; sync(); }, 0); };
  const mo = new MutationObserver(later);
  ["card", "panel", "view-results", "view-settings", "view-guide"].forEach(id => { const el = document.getElementById(id); if (el) mo.observe(el, {childList: true}); });
  document.querySelectorAll("[data-view-panel]").forEach(el => mo.observe(el, {attributes: true, attributeFilter: ["hidden"]}));
  window.addEventListener("beforeinstallprompt", () => setTimeout(later, 0));
  sync();
})();

// The sticky header's real height (it wraps on some tablets), so the mock timer, panel and jump targets sit below it.
(function(){
  const top = document.querySelector("header.top"), root = document.documentElement;
  if (!top) return;
  const measure = () => { const sticky = getComputedStyle(top).position === "sticky"; root.style.setProperty("--hdr", (sticky ? Math.ceil(top.getBoundingClientRect().height) : 0) + "px"); };
  measure(); window.addEventListener("resize", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(top);
})();

// Pattern guide: highlight the section you're reading in the contents list.
(function(){
  if (!("IntersectionObserver" in window)) return;
  const seen = new Map();
  const mark = id => document.querySelectorAll(".gside a").forEach(a => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + id)));
  const io = new IntersectionObserver(es => {
    es.forEach(e => seen.set(e.target.id, e.isIntersecting ? e.boundingClientRect.top : null));
    const cur = [...seen].filter(([, t]) => t !== null).sort((a, b) => a[1] - b[1])[0];
    if (cur && document.querySelector(`.gside a[href="#${cur[0]}"]`)) mark(cur[0]);
  }, {rootMargin: "-120px 0px -55% 0px"});
  const hook = () => document.querySelectorAll("#view-guide .gbody > .gsec:not([data-toc])").forEach(s => { s.dataset.toc = "1"; io.observe(s); });
  new MutationObserver(hook).observe(document.getElementById("view-guide"), {childList: true});
  hook();
})();
