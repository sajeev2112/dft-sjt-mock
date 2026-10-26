// "Study plan" on the Results page: patterns in your own mistakes, worked out here in the browser from your saved answers,
// plus an optional AI write-up (Beta). Loaded BEFORE app.js; it reads the app's globals (S, Q, L, lastAtt, ...) only inside functions.
// The statistics never leave this device unless you press the AI button, and then only numbers and codes are sent (no answers, no name).
(function(){
  const MIN_ANSWERED = 20;
  // The AI plan is personal, so it lives in your saved progress (S.plan) and travels with your Sync account.
  const st = {busy: false, note: ""};
  const hash = t => { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const cap = t => String(t).charAt(0).toUpperCase() + String(t).slice(1);
  const tagOf = (qi, o) => (typeof OPT_TAGS !== "undefined" && OPT_TAGS[qi] && OPT_TAGS[qi][o]) || null;

  // The answer you last gave to a question: from the quiz you did most recently if it covered it, else from its paper.
  function answerOf(qi){
    const sets = [S.sets.custom, S.sets["p" + (Math.floor(qi / 32) + 1)]];
    for (const set of sets) if (set && (set.list || []).includes(qi) || (set && set === S.sets["p" + (Math.floor(qi / 32) + 1)])) { if (set && revealed(set, qi) && set.ans[qi] && complete(set, qi)) return set.ans[qi]; }
    return null;
  }

  function profile(){
    const answered = Q.map((_, i) => i).filter(i => lastAtt(i));
    let g = 0, m = 0; answered.forEach(i => { const a = lastAtt(i); g += a.g; m += a.m; });
    const byG = {}, byD = {};
    Q.forEach((q, i) => { const a = lastAtt(i); if (!a) return; (byG[q.g] = byG[q.g] || {g: 0, m: 0, n: 0}); (byD[q.d] = byD[q.d] || {g: 0, m: 0, n: 0}); byG[q.g].g += a.g; byG[q.g].m += a.m; byG[q.g].n++; byD[q.d].g += a.g; byD[q.d].m += a.m; byD[q.d].n++; });
    const p = {answered: answered.length, pct: pct(g, m), themes: Object.keys(byG).map(k => ({g: k, n: byG[k].n, pct: pct(byG[k].g, byG[k].m), lost: byG[k].m - byG[k].g})),
      areas: Object.keys(byD).map(k => ({d: k, n: byD[k].n, pct: pct(byD[k].g, byD[k].m)})), habits: {rank: [], picked: [], missed: []}, repeats: [], weakQs: {}, pace: null, trend: null};

    // habits: do you rate a kind of action higher or lower than the key does?
    const disp = {}, wrongPick = {}, missedKey = {}, nonKeyOpps = {}, keyOpps = {};
    for (let qi = 0; qi < Q.length; qi++) {
      const q = Q[qi], a = answerOf(qi); if (!a) continue;
      const keyIdx = q.k.split("").map(c => L.indexOf(c));
      if (isRank(q)) {
        if (!a.ord || a.ord.length !== 5) continue;
        for (let o = 0; o < 5; o++) { const t = tagOf(qi, o); if (!t) continue; const d = keyIdx.indexOf(o) - a.ord.indexOf(o); (disp[t] = disp[t] || {s: 0, n: 0}); disp[t].s += d; disp[t].n++; }
      } else {
        for (let o = 0; o < q.o.length; o++) { const t = tagOf(qi, o); if (!t) continue; const key = keyIdx.includes(o), chose = a.p.includes(o);
          if (key) { keyOpps[t] = (keyOpps[t] || 0) + 1; if (!chose) missedKey[t] = (missedKey[t] || 0) + 1; } else { nonKeyOpps[t] = (nonKeyOpps[t] || 0) + 1; if (chose) wrongPick[t] = (wrongPick[t] || 0) + 1; } }
      }
    }
    p.habits.rank = Object.keys(disp).filter(t => disp[t].n >= 8 && Math.abs(disp[t].s / disp[t].n) >= 0.5).map(t => ({tag: t, n: disp[t].n, avg: Math.round(disp[t].s / disp[t].n * 10) / 10}))
      .sort((x, y) => Math.abs(y.avg) - Math.abs(x.avg)).slice(0, 3);
    p.habits.picked = Object.keys(wrongPick).filter(t => wrongPick[t] >= 3 && wrongPick[t] / nonKeyOpps[t] >= 0.3).map(t => ({tag: t, n: wrongPick[t]})).sort((x, y) => y.n - x.n).slice(0, 2);
    p.habits.missed = Object.keys(missedKey).filter(t => missedKey[t] >= 3 && missedKey[t] / keyOpps[t] >= 0.4).map(t => ({tag: t, n: missedKey[t]})).sort((x, y) => y.n - x.n).slice(0, 2);

    // questions that lost marks on each of the last two attempts
    p.repeats = Q.map((_, i) => i).filter(i => { const at = S.att[i] || []; return at.length >= 2 && at[at.length - 1].g < at[at.length - 1].m && at[at.length - 2].g < at[at.length - 2].m; })
      .sort((x, y) => lastAtt(y).t - lastAtt(x).t).slice(0, 8).map(i => i + 1);

    // the questions that cost the most marks in each of the four weakest themes
    p.themes.filter(t => t.n >= 2).sort((x, y) => x.pct - y.pct).slice(0, 4).forEach(t => {
      const qs = Q.map((q, i) => ({i, q})).filter(x => x.q.g === t.g && lastAtt(x.i) && lastAtt(x.i).g < lastAtt(x.i).m).sort((x, y) => (lastAtt(y.i).m - lastAtt(y.i).g) - (lastAtt(x.i).m - lastAtt(x.i).g)).slice(0, 3).map(x => x.i + 1);
      if (qs.length) p.weakQs[t.g] = qs;
    });
    const timed = Q.map((_, i) => { const at = S.att[i] || []; for (let k = at.length - 1; k >= 0; k--) if (at[k].s > 0) return at[k].s; return 0; }).filter(Boolean);
    if (timed.length >= 5) p.pace = {avg: Math.round(timed.reduce((t, x) => t + x, 0) / timed.length), n: timed.length, slow: timed.filter(x => x > 180).length};

    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7); const ck = cutoff.toISOString().slice(0, 10);
    const rec = {g: 0, m: 0, n: 0}, old = {g: 0, m: 0, n: 0};
    for (const d of Object.keys(S.days)) { const x = S.days[d], t = d > ck ? rec : old; t.g += x.g; t.m += x.m; t.n += x.n; }
    if (rec.n >= 10 && old.n >= 10) p.trend = {recent: pct(rec.g, rec.m), earlier: pct(old.g, old.m)};
    return p;
  }

  const mm = s => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  const sec = (title, body) => `<div class="sp-sec"><h3 class="bsub">${title}</h3>${body}</div>`;
  function habitLine(h){ const lab = TAG_LABELS[h.tag];
    return `<li>${h.kind === "over" ? `You rank options about <b>${lab}</b> ${Math.abs(h.avg)} places <b>higher</b> than the key does, on average (${h.n} options).`
      : h.kind === "under" ? `You rank options about <b>${lab}</b> ${Math.abs(h.avg)} places <b>lower</b> than the key does, on average (${h.n} options).`
      : h.kind === "picked" ? `In best-three questions you chose options about <b>${lab}</b> ${h.n} times when they weren’t among the best three.`
      : `In best-three questions you left out options about <b>${lab}</b> ${h.n} times when they were among the best three.`}</li>`; }

  const row = (text, buttons) => `<div class="sp-row"><div class="sp-row-t">${text}</div><div class="sp-row-b">${buttons}</div></div>`;
  function html(){
    const answered = Q.map((_, i) => i).filter(i => lastAtt(i)).length;
    if (!answered) return "";
    if (answered < MIN_ANSWERED) return `<div class="callout studyplan" id="studyplan"><p class="xhead">Study plan <span class="xm-tag">Beta</span></p><p class="muted">Answer ${MIN_ANSWERED - answered} more question${MIN_ANSWERED - answered === 1 ? "" : "s"} to unlock a study plan built from your mistakes (${answered} of ${MIN_ANSWERED} so far).</p></div>`;
    const p = profile(), ranked = p.themes.filter(t => t.n >= 2 && t.lost > 0).sort((x, y) => y.lost - x.lost).slice(0, 3);
    const sig = hash(JSON.stringify(p)), sv = S.plan, fresh = !!sv && sv.sig === sig;
    // header: what this is, with the AI button beside it
    let h = `<div class="callout studyplan" id="studyplan"><div class="sp-head"><div><p class="xhead">Study plan <span class="xm-tag">Beta</span></p><p class="muted">Worked out on this device from your own answers.</p></div>` +
      `<button type="button" class="btn primary sp-go" data-sp="ai"${st.busy ? " disabled" : ""}>${st.busy ? "Writing…" : sv ? (fresh ? "Write a new AI plan" : "Update the AI plan") : "Write my plan with AI"}</button></div>`;
    if (st.note) h += `<p class="xm-notice" role="status">${esc(st.note)}</p>`;
    if (sv) h += aiResult(sv, fresh);
    h += sec("Where your marks are going", ranked.length ? ranked.map(t => row(`<b>${THEMES[t.g]}</b><span class="muted">${t.lost} mark${t.lost === 1 ? "" : "s"} lost over ${t.n} questions (${t.pct}%)</span>`,
      `<a class="btn small" href="#guide-${t.g}">Read playbook</a><button type="button" class="btn small primary" data-act="build" data-kind="theme" data-arg="${t.g}">Practise</button>`)).join("") : `<p class="muted">No theme stands out yet.</p>`);
    const hab = [...p.habits.rank.map(x => ({...x, kind: x.avg > 0 ? "over" : "under"})), ...p.habits.picked.map(x => ({...x, kind: "picked"})), ...p.habits.missed.map(x => ({...x, kind: "missed"}))];
    if (hab.length) h += sec("Your habits", `<ul class="sp-list">${hab.map(habitLine).join("")}</ul><p class="muted">These come from the kind of action each option describes, compared with how the key ranks it.</p>`);
    const nm = mistakesList().length;
    if (nm) h += sec("Redo your mistakes", row(`<b>${nm} question${nm === 1 ? "" : "s"}</b><span class="muted">where your latest attempt lost marks${p.repeats.length ? `; ${p.repeats.length} lost marks on both of your last two attempts` : ""}</span>`, `<button type="button" class="btn small primary" data-act="build" data-kind="mistakes">Practise my mistakes</button>`));
    if (p.pace || p.trend) h += sec("Pace and trend", (p.pace ? `<p>${mm(p.pace.avg)} per question on average over ${p.pace.n} timed questions; the live test allows about ${mm(Math.round(PACE))}.${p.pace.slow ? ` ${p.pace.slow} took over 3 minutes.` : ""}</p>` : "") + (p.trend ? `<p>${p.trend.recent}% over the last week against ${p.trend.earlier}% before that.</p>` : ""));
    h += `<p class="muted sp-priv">The AI button sends your theme scores, habit statistics and the topic numbers of your repeated mistakes to the site’s server to write the plan. No answers or names are sent and the server doesn’t keep it; the finished plan is saved with your progress.</p></div>`;
    return h;
  }

  function aiResult(sv, fresh){
    const pl = sv.plan;
    return `<div class="sp-ai"><h3 class="bsub">Your AI study plan</h3><p class="sp-over">${esc(pl.overview)}</p><ol class="sp-prio">${pl.priorities.map(x => `<li><b>${esc(x.focus)}</b><p>${esc(cap(x.why))}</p>${x.read ? `<p class="sp-read"><b>Read:</b> ${(x.sections || []).map(y => `<a href="#guide-${esc(y.id)}">${esc(y.title)}</a>`).join(" · ")}<span class="sp-rn">${esc(x.read)}</span></p>` : ""}<p class="sp-do"><b>Do:</b> ${esc(x.do)}</p></li>`).join("")}</ol>` +
      `<p><b>This week:</b> ${esc(pl.this_week)}</p><p class="xm-src">Written by AI from your statistics · checked against them${fresh ? "" : " · your results have changed since, so this may be out of date"}${sv.at ? " · " + new Date(sv.at).toLocaleDateString("en-GB", {day: "numeric", month: "short"}) : ""} · saved with your progress</p><p class="xm-caveat">AI plans can contain mistakes. Treat it as a suggestion.</p></div>`;
  }

  function redraw(){ const box = document.getElementById("studyplan"); if (box) box.outerHTML = html(); }
  async function ask(){
    if (st.busy) return;
    const p = profile(); st.busy = true; st.note = ""; redraw();
    try {
      const r = await fetch(API + "/api/study-plan", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(p)});
      const j = await r.json().catch(() => ({}));
      if (r.status === 429) st.note = "Too many plans from this network in the last hour. Please try again later.";
      else if (!r.ok) st.note = "The AI plan isn’t available right now. The plan above is built directly from your results.";
      else if (j.source === "ai" && j.plan) { S.plan = {plan: j.plan, at: Date.now(), sig: hash(JSON.stringify(p))}; S.plan = cleanPlan(S.plan); save(); }
      else st.note = j.reason === "budget" ? "Today’s free AI allowance has run out. The plan above is built directly from your results; AI plans return tomorrow."
        : j.reason === "unavailable" ? "The AI plan isn’t available right now. The plan above is built directly from your results."
        : "The AI’s plan didn’t pass the accuracy checks this time, so it isn’t shown. The plan above is built directly from your results. You can try again.";
    } catch (e) { st.note = "Couldn’t reach the server. The plan above is built directly from your results."; }
    st.busy = false; redraw();
    const b = document.querySelector('[data-sp="ai"]'); if (b) b.focus({preventScroll: true});
  }
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-sp]"); if (b && b.dataset.sp === "ai") ask(); });
  window.StudyPlan = {html, profile, enough: () => Q.filter((_, i) => lastAtt(i)).length >= MIN_ANSWERED};
})();
