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
  const done = {}; // explanations already fetched this visit, so re-renders don't lose them
  function add(){
    const res = card.querySelector(".result");
    if (!res || card.querySelector(".xmistake") || typeof curSet !== "function") return;
    const set = curSet(), qi = curQi(), sc = qScore(set, qi), ans = answerOf(set, qi);
    if (!ans || sc.got === sc.max) return;
    const box = document.createElement("div"); box.className = "xmistake";
    res.querySelector(".scoreline").after(box);
    const k = qi + "|" + ans;
    if (done[k]) { show(box, qi, done[k]); return; }
    box.innerHTML = `<div class="xm-bar"><button type="button" class="btn small primary xm-go">Explain my mistake</button><span class="xm-tag">Beta</span><span class="xm-note">AI explanation of where your answer went wrong</span></div>`;
    box.querySelector(".xm-go").addEventListener("click", () => run(box, qi, ans, k));
  }
  async function run(box, qi, ans, k){
    box.innerHTML = `<p class="muted" role="status">Working out where your answer went wrong…</p>`;
    try {
      const r = await fetch(API + "/api/explain", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({q: qi + 1, answer: ans})});
      const j = await r.json().catch(() => ({}));
      if (r.status === 429) throw new Error("Too many explanations from this network in the last hour. Please try again later.");
      if (!r.ok) throw new Error("Explanations aren’t available right now. Please try again later.");
      done[k] = j; show(box, qi, j);
      const h = box.querySelector(".xhead"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({preventScroll: true}); }
    } catch (e) {
      box.innerHTML = `<p class="muted">${esc(e.message || "Couldn’t load the explanation.")}</p>`;
    }
  }
  function show(box, qi, j){
    const q = Q[qi], best3 = q.t === "best3", opt = c => q.o[L.indexOf(c)][0];
    if (j.perfect) { box.innerHTML = `<p class="muted">Nothing to explain: your answer matches the key.</p>`; return; }
    const where = it => best3 ? (it.move === "out" ? "You chose it, but it isn’t one of the best three." : "You didn’t choose it, but it’s one of the best three.")
      : `You put it <b>${it.you}</b>; it belongs <b>${it.key}</b>.`;
    const aiSum = j.summary && j.summary.source === "ai", anyAi = aiSum || j.items.some(it => it.source === "ai");
    const allWritten = !anyAi;
    const note = j.budget ? `<p class="xm-notice">Today’s AI explanations have run out, so you’re seeing the written explanations. They’ll be back tomorrow.</p>`
      : allWritten && j.items.some(it => it.reason === "unavailable") ? `<p class="xm-notice">AI explanations aren’t available right now, so you’re seeing the written explanations.</p>` : "";
    const src = anyAi ? (aiSum && j.items.every(it => it.source === "ai") ? "AI explanation · checked against the key" : "Partly AI, partly written · anything the AI got wrong was replaced by the written version") : "Written explanation";
    box.innerHTML = `<p class="xhead">Where your answer went wrong <span class="xm-tag">Beta</span></p>` + note +
      (j.summary && j.summary.text ? `<p class="xm-sum">${esc(j.summary.text)}</p>` : "") +
      j.items.map(it => `<div class="xm-row"><p class="xm-what"><span class="letter">${it.letter}</span> ${opt(it.letter)}</p><p class="xm-pos ${it.move}">${where(it)}</p><p>${esc(it.why)}</p></div>`).join("") +
      (j.right && j.right.length ? `<p class="xm-right">✓ ${best3 ? "Right picks" : "In the right place"}: ${j.right.map(c => `<b>${c}</b>${best3 ? "" : " (" + ORD[q.k.indexOf(c)] + ")"}`).join(", ")}</p>` : "") +
      (j.principle && !aiSum ? `<p class="xm-principle"><b>Principle:</b> ${esc(j.principle)}</p>` : "") +
      `<p class="xm-src${anyAi ? "" : " written"}">${src}</p>`;
  }
  new MutationObserver(add).observe(card, {childList: true});
  add();
})();
