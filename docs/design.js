// The site's design layer (Oct 2026): progress tiles, the timed-mock card, score rings and gauges, the sliding nav,
// theme toggle, ripples, scroll reveal and the Sync tip. Enhances what app.js renders without changing its logic.
(function(){
  const KEY = "dft-design";
  const root = document.documentElement;
  const reduce = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const on = true;
  root.classList.add("nd");

  const prog = document.createElement("div"); prog.className = "nd-progress nd-only"; document.body.appendChild(prog);
  const onScroll = () => { const h = document.documentElement; const max = h.scrollHeight - h.clientHeight; prog.style.setProperty("--sp", max > 0 ? (h.scrollTop / max).toFixed(4) : 0); };
  window.addEventListener("scroll", onScroll, {passive: true});

  // shared gradient for gauges
  document.body.insertAdjacentHTML("beforeend", `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="nd-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="#6C8BFF"/></linearGradient></defs></svg>`);

  const views = document.querySelector(".views");
  const ind = document.createElement("span"); ind.className = "nav-ind nd-only"; ind.setAttribute("aria-hidden", "true"); views.prepend(ind);
  const theme = document.createElement("button");
  theme.type = "button"; theme.className = "themebtn nd-only"; theme.title = "Theme: auto"; theme.setAttribute("aria-label", "Change colour theme");
  const ICON = {auto: "◐", light: "☀", dark: "☾"};
  let mode = "auto"; try { mode = localStorage.getItem(KEY + "-theme") || "auto"; } catch(e) {}
  const applyTheme = () => { if (mode === "auto") delete root.dataset.theme; else root.dataset.theme = mode; theme.textContent = ICON[mode]; theme.title = "Theme: " + mode; };
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
      revFlag.hidden = !nf; revFlag.innerHTML = `⚑ Review flagged <small>${nf}</small>`;
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
  const mo = new MutationObserver(now);
  ["card", "panel", "ptabs", "grid", "view-results", "view-guide", "view-settings"].forEach(id => { const el = document.getElementById(id); if (el) mo.observe(el, {childList: true, subtree: true}); });
  document.querySelectorAll(".views [data-v]").forEach(b => new MutationObserver(now).observe(b, {attributes: true, attributeFilter: ["aria-current"]}));
  window.addEventListener("resize", schedule);
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
  let timer = null, left = 7000, startedAt = 0;
  const close = (forever) => {
    if (!tip.isConnected) return;
    clearTimeout(timer); tip.classList.remove("show"); tip.classList.add("hide");
    if (forever) { seen.done = true; store(); }
    window.removeEventListener("scroll", onScroll); document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown, true); window.removeEventListener("resize", place);
    setTimeout(() => tip.remove(), 320);
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
    if ("ResizeObserver" in window) { const ro = new ResizeObserver(place); ro.observe(document.querySelector(".views")); ro.observe(document.querySelector("header.top")); tip.addEventListener("transitionend", () => { if (!tip.isConnected) ro.disconnect(); }); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    window.addEventListener("scroll", onScroll, {passive: true}); document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown, true); window.addEventListener("resize", place);
  }, 1200);
})();
