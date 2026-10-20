// "Explain my mistake" (Beta): after a wrong answer, asks the Worker (/api/explain) for a short summary plus reasons for the biggest mistakes only.
// The Worker checks the AI's wording against the key; anything that fails is replaced by the written justification,
// and this panel says which version you're reading.
(function(){
  const card = document.getElementById("card");
  if (!card) return;
  const ORD = ["1st", "2nd", "3rd", "4th", "5th"];
  const answerOf = (set, qi) => {
    const a = set.ans[qi]; if (!a) return "";
    return isRank(Q[qi]) ? (a.set ? a.ord.map(o => L[o]).join("") : "") : a.p.slice().sort((x, y) => x - y).map(o => L[o]).join("");
  };
  const done = {}; // explanations already fetched, so re-renders and later visits don't lose them
  // Explanations the AI helped write are also kept on this device (newest 80), so coming back to a question shows the same explanation
  // again without asking the server. Anyone else who gives the same answer is served the same stored explanation by the server.
  const MEM = "dft-sjt-xm", MEM_MAX = 80;
  const memLoad = () => { try { return JSON.parse(localStorage.getItem(MEM) || "{}") || {}; } catch (e) { return {}; } };
  try { const m = memLoad(); for (const k of Object.keys(m)) if (m[k] && m[k].j && Array.isArray(m[k].j.items)) done[k] = m[k].j; } catch (e) {}
  function remember(k, j){
    if (!j || !Array.isArray(j.items) || !(j.insight || j.items.some(it => it.source === "ai"))) return;
    try { const m = memLoad(); m[k] = {t: Date.now(), j}; const keys = Object.keys(m).sort((a, b) => m[b].t - m[a].t); keys.slice(MEM_MAX).forEach(x => delete m[x]); localStorage.setItem(MEM, JSON.stringify(m)); } catch (e) {}
  }
  const rated = {}; // thumbs already given this visit (key -> 1 or -1)
  function add(){
    const res = card.querySelector(".result");
    if (!res || card.querySelector(".xmistake") || typeof curSet !== "function") return;
    const set = curSet(), qi = curQi(), sc = qScore(set, qi), ans = answerOf(set, qi);
    if (!ans || sc.got === sc.max) return;
    const box = document.createElement("div"); box.className = "xmistake";
    res.querySelector(".scoreline").after(box);
    const k = qi + "|" + ans;
    if (done[k]) { show(box, qi, done[k], ans, k); return; }
    bar(box, qi, ans, k);
  }
  function bar(box, qi, ans, k){
    box.innerHTML = `<div class="xm-bar"><button type="button" class="btn small primary xm-go">Explain my mistake</button><span class="xm-tag">Beta</span><span class="xm-note">AI explanation of where your answer went wrong. It can contain mistakes.</span></div>`;
    box.querySelector(".xm-go").addEventListener("click", () => done[k] ? show(box, qi, done[k], ans, k) : run(box, qi, ans, k));
  }
  async function run(box, qi, ans, k){
    box.innerHTML = `<p class="muted" role="status">Working out where your answer went wrong…</p>`;
    try {
      const r = await fetch(API + "/api/explain", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({q: qi + 1, answer: ans})});
      const j = await r.json().catch(() => ({}));
      if (r.status === 429) throw new Error("Too many explanations from this network in the last hour. Please try again later.");
      if (!r.ok) throw new Error("Explanations aren’t available right now. Please try again later.");
      done[k] = j; remember(k, j); show(box, qi, j, ans, k);
      const h = box.querySelector(".xhead"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({preventScroll: true}); }
    } catch (e) {
      box.innerHTML = `<p class="muted">${esc(e.message || "Couldn’t load the explanation.")}</p>`;
    }
  }
  // links to the playbook sections to read for this option (chosen by the site, not the AI), plus the AI's note on what to look for
  const readHtml = it => it.read && it.read.length ? `<p class="xm-read"><b>Read next:</b> ${it.read.map(x => `<a href="#guide-${esc(x.id)}">${esc(x.title)}</a>`).join(" · ")}${it.read_note ? ` <span class="xm-rn">${esc(it.read_note)}</span>` : ""}</p>` : "";
  function show(box, qi, j, ans, k){
    const q = Q[qi], best3 = q.t === "best3", opt = c => q.o[L.indexOf(c)][0];
    if (j.perfect) { box.innerHTML = `<p class="muted">Nothing to explain: your answer matches the key.</p>`; return; }
    const where = it => best3 ? (it.move === "out" ? "You chose it, but it isn’t one of the best three." : "You didn’t choose it, but it’s one of the best three.")
      : `You put it <b>${it.you}</b>; it belongs <b>${it.key}</b>.`;
    const anyAi = !!j.insight || j.items.some(it => it.source === "ai");
    const allWritten = !anyAi;
    const note = j.budget ? `<p class="xm-notice">Today’s AI explanations have run out, so you’re seeing the written explanations. They’ll be back tomorrow.</p>`
      : allWritten && j.items.some(it => it.reason === "unavailable") ? `<p class="xm-notice">AI explanations aren’t available right now, so you’re seeing the written explanations.</p>` : "";
    const src = anyAi ? (j.insight && j.items.every(it => it.source === "ai") ? "Written by AI · checked against the key" : "Reasons partly AI, partly written · anything the AI got wrong was replaced by the written version") : "Written explanation";
    box.innerHTML = `<div class="xm-head"><p class="xhead">Where your answer went wrong <span class="xm-tag">Beta</span></p><button type="button" class="xm-hide">Hide</button></div>` + note +
      (j.summary && j.summary.text ? `<p class="xm-sum">${esc(j.summary.text)}</p>` : "") +
      (j.principle ? `<p class="xm-principle"><b>The idea behind it:</b> ${esc(j.principle)}</p>` : "") +
      (j.insight ? `<p class="xm-insight">${esc(j.insight)}</p>` : "") +
      j.items.map(it => `<div class="xm-row"><p class="xm-what"><span class="letter">${it.letter}</span> ${opt(it.letter)}</p><p class="xm-pos ${it.move}">${where(it)}</p><p>${it.source === "ai" ? "" : `<span class="xm-wr">Written justification: </span>`}${esc(it.why)}</p>${readHtml(it)}</div>`).join("") +
      (j.right && j.right.length ? `<p class="xm-right">✓ ${best3 ? "Right picks" : "In the right place"}: ${j.right.map(c => `<b>${c}</b>${best3 ? "" : " (" + ORD[q.k.indexOf(c)] + ")"}`).join(", ")}</p>` : "") +
      `<p class="xm-src${anyAi ? "" : " written"}">${src}</p>` +
      (anyAi ? `<p class="xm-caveat">AI explanations can contain mistakes. Check them against the written justifications above.</p>` +
        `<div class="xm-fb"><button type="button" class="xm-up" data-r="1" aria-label="This explanation helped">👍</button><button type="button" class="xm-down" data-r="-1" aria-label="This explanation didn’t help">👎</button><p class="xm-thanks" role="status" aria-live="polite"></p></div>` : "");
    box.querySelector(".xm-hide").addEventListener("click", () => { bar(box, qi, ans, k); const g = box.querySelector(".xm-go"); if (g) g.focus(); });
    if (anyAi) feedback(box, qi, ans, k);
  }
  function feedback(box, qi, ans, k){
    const btns = [...box.querySelectorAll(".xm-fb button")], msg = box.querySelector(".xm-thanks");
    const thank = r => { btns.forEach(b => { b.disabled = true; b.classList.toggle("chosen", +b.dataset.r === r); }); msg.textContent = "Thanks for the feedback."; };
    if (rated[k]) { thank(rated[k]); return; }
    btns.forEach(b => b.addEventListener("click", async () => {
      const r = +b.dataset.r; btns.forEach(x => x.disabled = true);
      try {
        const res = await fetch(API + "/api/explain-feedback", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({client: typeof S !== "undefined" ? S.cid : undefined, q: qi + 1, answer: ans, rating: r})});
        if (!res.ok) throw new Error(res.status);
        rated[k] = r; thank(r);
      } catch (e) { btns.forEach(x => x.disabled = false); msg.textContent = "Couldn’t send that just now."; }
    }));
  }
  new MutationObserver(add).observe(card, {childList: true});
  add();
})();
