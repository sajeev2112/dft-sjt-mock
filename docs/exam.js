"use strict";
// Exam-style timed mock (Oct 2026). While a timed mock is open, a full-screen overlay copies how the live
// DFT SJT delivery screen looks and behaves (spec: exam-mock/SPEC.md): title bar with timer and item counter,
// toolbar, white content pane, blue navigation bar, modal dialogs, the question review screen and the end flow.
// Loaded BEFORE app.js: it reads the app's globals (S, Q, save, markSet, timerOn, ...) only inside functions, and
// its keydown listener is registered first so it can keep the app's own shortcuts quiet while the overlay is up.
// Answers go into the same set.ans structures the app scores, so marking, results and sync are unchanged.
(function(){
  const KEY = "dft-exam-ui", SURVEY_KEY = "dft-exam-survey";
  const TITLE = "Dental Foundation Training Situational Judgement Test Mock Paper";
  const PRE = ["welcome", "nda", "tutorial", "instr"], RUN = ["part1", "q", "part2", "review", "rq"], POST = ["complete", "survey", "thanks"];
  const SCHEMES = {"default":"Default", "k-ly":"Black on Light Yellow", "k-w":"Black on White", "k-y":"Black on Yellow", "b-w":"Blue on White", "b-y":"Blue on Yellow",
    "ly-k":"Light Yellow on Black", "w-k":"White on Black", "w-b":"White on Blue", "y-k":"Yellow on Black", "y-b":"Yellow on Blue"};
  const SURVEY_Q = ["The screens and controls felt like a real computer-based test.", "The questions felt as hard as I expect the real test to be.",
    "The time allowed felt about right.", "I would use this mock again before my test."];
  const AGREE = ["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"];
  // Only terms that appear in the question bank. [term, definition, patterns]: all-capitals patterns match case-sensitively.
  const GLOSSARY = [
    ["Capacity", "A person’s ability to make a particular decision at the time it needs to be made: to understand, remember and weigh up the information, and to communicate their choice.", ["capacity"]],
    ["Care Quality Commission (CQC)", "The independent regulator of health and social care services in England, including dental practices.", ["Care Quality Commission", "CQC"]],
    ["Clinical governance", "The systems a practice uses to keep care safe and improve its quality, such as audits, policies and learning from incidents.", ["clinical governance"]],
    ["Consent", "A patient’s permission for an examination or treatment. To be valid it must be given freely by a person with capacity who has been properly informed.", ["consent"]],
    ["Defence organisation", "An organisation that gives dental professionals advice and legal support, and covers claims made against them.", ["defence organisation"]],
    ["Dental nurse", "A registered dental care professional who supports the dentist with patient care and treatment.", ["dental nurse"]],
    ["Educational supervisor (ES)", "The experienced dentist in your training practice who supervises, supports and assesses you during foundation training.", ["educational supervisor", "ES"]],
    ["Foundation dentist (FD)", "A newly qualified dentist in the first year of supervised NHS practice (dental foundation training).", ["foundation dentist", "FD"]],
    ["General Dental Council (GDC)", "The UK regulator of dental professionals. It sets the standards they must meet.", ["General Dental Council", "GDC"]],
    ["General Practitioner (GP)", "A family doctor who works in primary care.", ["General Practitioner", "GP"]],
    ["Indemnity provider", "The organisation that provides a dental professional’s cover for claims and gives advice when something goes wrong.", ["indemnity provider"]],
    ["Lasting Power of Attorney (LPA)", "A legal document in which a person names someone they trust to make decisions for them if they lose capacity. A health and welfare LPA covers care and treatment.", ["Lasting Power of Attorney", "LPA"]],
    ["NHS", "The National Health Service: the publicly funded health service in the UK.", ["NHS"]],
    ["Practice manager", "The person who runs the practice’s business and administration, including staff matters and policies.", ["practice manager"]],
    ["Safeguarding", "Protecting children and adults at risk from abuse, harm or neglect, and acting on concerns. Each practice names a safeguarding lead.", ["safeguarding"]],
    ["Scope of Practice", "GDC guidance on which tasks each type of dental professional is trained and competent to carry out.", ["Scope of Practice"]],
    ["Training programme director (TPD)", "The dentist who runs your foundation training scheme, including the study days, and supports trainees and educational supervisors.", ["training programme director", "TPD"]],
    ["Unit of dental activity (UDA)", "The measure used to count the NHS dental treatment a practice or dentist provides against their contract.", ["UDA"]]
  ];
  const GLOSS_RX = GLOSSARY.map(g => g[2].map(p => /^[A-Z]{2,4}$/.test(p) ? new RegExp(`\\b${p}s?\\b`) : new RegExp(`\\b${p.replace(/ /g, "\\s+")}s?\\b`, "i")));
  const svg = (w, body) => `<svg viewBox="0 0 16 16" width="${w}" height="${w}" aria-hidden="true" focusable="false">${body}</svg>`;
  const I = {
    clock: svg(18, '<circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.2V8l2.6 1.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'),
    list: svg(16, '<path d="M5.5 4h8M5.5 8h8M5.5 12h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="2.4" cy="4" r="1.1" fill="currentColor"/><circle cx="2.4" cy="8" r="1.1" fill="currentColor"/><circle cx="2.4" cy="12" r="1.1" fill="currentColor"/>'),
    flag: (on, col) => svg(16, `<path d="M3.5 1.5v13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M3.5 2.5h9l-2 3 2 3h-9z" fill="${on ? col : "none"}" stroke="${on ? col : "currentColor"}" stroke-width="1.4" stroke-linejoin="round"/>`),
    help: svg(18, '<circle cx="8" cy="8" r="6.8" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="8" y="11.6" text-anchor="middle" font-size="10" font-weight="bold" font-family="Arial" fill="currentColor">?</text>'),
    prev: svg(16, '<path d="M14 8H3M7 3.5 2.5 8 7 12.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
    next: svg(16, '<path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
    review: svg(16, '<path d="M1.5 8h9M7 4l4 4-4 4M14 2.5v11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
    end: svg(16, '<path d="M6.5 2.5h-4v11h4M10 4.5 13.5 8 10 11.5M13.5 8H6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'),
    doc: svg(16, '<path d="M3.5 1.5h6l3 3v10h-9z M9.5 1.5v3h3M5.5 8h5M5.5 11h5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>')
  };

  let st = null;      // exam UI state for the open mock (persisted under KEY)
  let root = null;    // the #exam overlay element
  let lay = null;     // open dialog or window: {kind: "dialog"|"win", o, prev}
  let dg = null;      // pointer drag in progress
  let sel = null;     // selected (blue-outlined) option on the current ranking question; not persisted
  let timer = 0;
  const marks = new Map(); // qi -> scenario and options with glossary asterisks

  // ---------- small helpers ----------
  const $ = id => document.getElementById(id);
  const escH = s => typeof esc === "function" ? esc(s) : String(s).replace(/[&<>"']/g, c => "&#" + c.charCodeAt(0) + ";");
  const attr = s => String(s).replace(/<[^>]*>/g, "").replace(/"/g, "&quot;"); // trusted bank text (may hold &amp;) as an attribute value
  const plain = s => String(s).replace(/<[^>]*>/g, " ").replace(/&nbsp;|\s+/g, " ").replace(/&amp;/g, "&").trim();
  const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const rankT = qi => !!Q[qi] && Q[qi].t !== "best3";
  const rem = set => Math.max(0, Math.floor((set.limit || 0) - (set.el || 0)));
  const hms = t => `${Math.floor(t / 3600)}:${String(Math.floor(t / 60) % 60).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  const spoken = t => { const h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60; return `Time remaining: ${h ? `${h} hour${h > 1 ? "s" : ""} ` : ""}${m} minute${m === 1 ? "" : "s"}`; };
  const appReady = () => typeof S !== "undefined" && typeof Q !== "undefined" && typeof isMock === "function";
  function mock(){ if (!appReady()) return null; const c = S.sets && S.sets.custom; return c && isMock(c) && Array.isArray(c.list) && c.list.length ? c : null; }
  function setClock(on){ try { timerOn = on; } catch(e) {} }
  function appRender(){ try { if (typeof window.render === "function") window.render(); } catch(e) {} }
  // Underline the accelerator letter (first exact-case match, else any case).
  function ul(label, key){
    let i = label.indexOf(key); if (i < 0) i = label.toLowerCase().indexOf(key.toLowerCase());
    return i < 0 ? escH(label) : escH(label.slice(0, i)) + "<u>" + escH(label[i]) + "</u>" + escH(label.slice(i + 1));
  }
  function say(msg){ const el = $("ex-live"); if (!el) return; el.textContent = ""; setTimeout(() => { if (el.isConnected) el.textContent = msg; }, 40); }
  // Part One = ranking items (actions and considerations), Part Two = choose three; stable order within each part.
  function partOrder(list){ const ok = list.filter(qi => Q[qi]); return ok.filter(rankT).concat(ok.filter(qi => !rankT(qi))); }
  function parts(set){ const one = [], two = []; set.list.forEach((qi, k) => (rankT(qi) ? one : two).push(k)); return {one, two}; }
  function done(set, qi){ const a = set.ans[qi]; return !!a && (rankT(qi) ? !!a.set : Array.isArray(a.p) && a.p.length === 3); }
  const curQi = set => st && (st.stage === "q" || st.stage === "rq") ? set.list[st.k] : null;

  // ---------- exam UI state ----------
  function blank(set){ return {c:set.created, stage:"welcome", k:0, rl:[], rp:0, tab:"all", draft:{}, flags:{}, scheme:"default", hideT:false, hideN:false, agree:false, tut:0, survey:{}}; }
  function load(set){
    const s = blank(set); let x = null;
    try { x = JSON.parse(localStorage.getItem(KEY) || "null"); } catch(e) {}
    if (!x || typeof x !== "object" || x.c !== set.created) return s;
    const n = set.list.length, inList = qi => set.list.includes(qi);
    if (PRE.concat(RUN, POST).includes(x.stage)) s.stage = x.stage;
    if (int(x.k, 0, n - 1)) s.k = x.k;
    if (Array.isArray(x.rl)) s.rl = x.rl.filter(k => int(k, 0, n - 1));
    if (int(x.rp, 0, Math.max(0, s.rl.length - 1))) s.rp = x.rp;
    if (x.tab === "flagged") s.tab = "flagged";
    for (const k of Object.keys(x.draft || {})) {
      const qi = +k, d = x.draft[k];
      if (!inList(qi) || !rankT(qi) || !Array.isArray(d) || d.length !== 5) continue;
      const v = d.map(o => int(o, 0, 4) ? o : null), f = v.filter(o => o != null);
      if (new Set(f).size === f.length) s.draft[qi] = v;
    }
    for (const k of Object.keys(x.flags || {})) if (inList(+k) && x.flags[k]) s.flags[+k] = 1;
    if (typeof x.scheme === "string" && own(SCHEMES, x.scheme)) s.scheme = x.scheme;
    s.hideT = !!x.hideT; s.hideN = !!x.hideN; s.agree = !!x.agree;
    if (int(x.tut, 0, TUT.length - 1)) s.tut = x.tut;
    for (const k of Object.keys(x.survey || {})) if (int(+k, 0, SURVEY_Q.length - 1) && int(x.survey[k], 1, 5)) s.survey[+k] = x.survey[k];
    if (s.stage === "rq") { if (s.rl.length) s.k = s.rl[s.rp]; else s.stage = "review"; }
    return s;
  }
  function persist(){ if (st) try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(e) {} }
  function clearState(){ try { localStorage.removeItem(KEY); } catch(e) {} }
  function savedFor(set){ try { const x = JSON.parse(localStorage.getItem(KEY) || "null"); return !!x && x.c === set.created; } catch(e) { return false; } }
  function keepSurvey(){
    if (!st || !Object.keys(st.survey).length) return;
    try { const a = JSON.parse(localStorage.getItem(SURVEY_KEY) || "[]"), list = Array.isArray(a) ? a : [];
      list.push({t:Date.now(), c:st.c, a:st.survey}); localStorage.setItem(SURVEY_KEY, JSON.stringify(list.slice(-20))); } catch(e) {}
  }

  // ---------- answers (the app's own structures) ----------
  // Ranking: set.ans[qi] = {ord, set:true} only when all five slots are filled; partial placements live in st.draft.
  function slotsOf(set, qi){
    const a = set.ans[qi];
    if (a && a.set && Array.isArray(a.ord) && a.ord.length === 5) return a.ord.slice();
    const d = st.draft[qi];
    return Array.isArray(d) && d.length === 5 ? d.slice() : [null, null, null, null, null];
  }
  function commitRank(set, qi, s){
    if (s.every(o => o != null)) { set.ans[qi] = {ord:s.slice(), set:true}; delete st.draft[qi]; }
    else { delete set.ans[qi]; if (s.some(o => o != null)) st.draft[qi] = s.slice(); else delete st.draft[qi]; }
    persist(); save();
  }
  const picksOf = (set, qi) => { const a = set.ans[qi]; return a && Array.isArray(a.p) ? a.p.slice(0, 3) : []; };
  function commitPicks(set, qi, p){ if (p.length) set.ans[qi] = {p}; else delete set.ans[qi]; save(); }

  // ---------- glossary asterisks ----------
  // Marks each glossary term with a trailing * the first time it appears in the scenario or options (in reading order).
  // Only plain-text runs are searched, never tags or entities, and \b keeps matches to whole words.
  function glossMark(segs){
    const runs = segs.map(s => String(s).split(/(<[^>]*>|&[#a-zA-Z0-9]+;)/)), ins = segs.map(() => ({}));
    GLOSS_RX.forEach(alts => {
      for (let i = 0; i < runs.length; i++) {
        let best = null;
        runs[i].forEach((p, j) => {
          if (j % 2) return; // odd indices are the tags and entities the split kept
          alts.forEach(re => { const m = re.exec(p); if (m && (!best || j < best.j || (j === best.j && m.index < best.at))) best = {j, at:m.index, end:m.index + m[0].length}; });
        });
        if (best) { (ins[i][best.j] = ins[i][best.j] || []).push(best.end); return; }
      }
    });
    return runs.map((ps, i) => ps.map((p, j) => {
      const ends = ins[i][j]; if (!ends) return p;
      [...new Set(ends)].sort((a, b) => b - a).forEach(e => { p = p.slice(0, e) + "*" + p.slice(e); });
      return p;
    }).join(""));
  }
  function marked(qi){
    if (!marks.has(qi)) { const q = Q[qi], out = glossMark([q.s].concat(q.o.map(o => o[0]))); marks.set(qi, {s:out[0], o:out.slice(1)}); }
    return marks.get(qi);
  }

  // ---------- screens ----------
  function facts(set){ const P = parts(set); return {n:set.list.length, n1:P.one.length, n2:P.two.length, mins:Math.round((set.limit || 6300) / 60)}; }
  const TUT = [
    () => `<h2 class="ex-h">Tutorial: the screen</h2><p>This optional tutorial shows how the test screen works. It takes a couple of minutes and the clock has not started yet. <button type="button" class="ex-sbtn" id="ex-b-skip" data-x="skiptut">Skip the tutorial</button></p>
      <ul class="ex-ul"><li>The blue bar at the top shows the name of the test. At its right are the <b>time remaining</b> and the <b>item counter</b> (for example “3 of 37”). Select the clock icon to hide or show the time, and the list icon to hide or show the counter.</li>
      <li>Under it, <b>Flag for Review</b> marks a question you want to come back to, and <b>Colour Scheme</b> changes the colours of the question area for the rest of the mock.</li>
      <li>The blue bar at the bottom holds the navigation buttons: <b>Previous</b>, <b>Next</b>, <b>Glossary</b> and, later, <b>Review Screen</b> and <b>End Exam</b>.</li>
      <li>Each button has an underlined letter. Hold <b>Alt</b> (<b>Option</b> on a Mac) and press that letter to use the button from the keyboard.</li></ul><p>Select <b>Next</b> to continue.</p>`,
    () => `<h2 class="ex-h">Tutorial: ranking questions</h2><p>Part One questions show five empty boxes numbered 1 to 5 on the left and five responses on the right.</p>
      <ul class="ex-ul"><li>Drag each response into a numbered box. Box 1 is the most appropriate (or most important) and box 5 the least.</li>
      <li>On a touch screen you can also tap a response to select it, then tap a numbered box to place it.</li>
      <li>With a keyboard, move to a response and press Enter to select it, then move to a numbered box and press Enter. Pressing 1 to 5 on a response places it straight into that box.</li>
      <li>Dropping a response onto a box that is already filled sends the earlier response back to its own place on the right.</li>
      <li>To take a response out, drag it back to the right-hand column, or select its box and press Delete.</li>
      <li>You must fill all five boxes before you can move on with <b>Next</b>.</li></ul><p>Select <b>Next</b> to continue.</p>`,
    () => `<h2 class="ex-h">Tutorial: choose-three questions and the review</h2><p>Part Two questions list eight responses, each with a tick box.</p>
      <ul class="ex-ul"><li>Tick the <b>three</b> most appropriate responses. Untick one to change your mind. A fourth tick is not allowed.</li>
      <li>After the last question you reach the <b>review screen</b>. It lists every question, shows whether it is complete and whether you flagged it, and lets you open any question again.</li>
      <li>When you select <b>End Review</b> and confirm twice, the review closes and you cannot go back to the questions.</li>
      <li>You then select <b>End Exam</b> to finish, followed by a short optional feedback survey and your results.</li></ul><p>This is the end of the tutorial. Select <b>Next</b> to read the instructions.</p>`
  ];
  function instrBody(set){
    const f = facts(set);
    return `<p>This mock has <b>${f.n} questions</b> and you have <b>${f.mins} minutes</b>. The time remaining is shown in the top right-hand corner; select the clock icon to hide or show it.</p>
      <p>The questions are in two parts with different response formats:</p>
      <ul class="ex-ul"><li><b>Part One</b> (${f.n1} questions): rank five responses in order, from 1 (most appropriate or most important) to 5 (least).</li>
      <li><b>Part Two</b> (${f.n2} questions): choose the three most appropriate of eight responses. These questions need more than one response selected.</li></ul>
      <ul class="ex-ul"><li>There is no negative marking, so attempt every question.</li>
      <li>You cannot leave a question unanswered: <b>Next</b> only moves on once you have answered. <b>Previous</b> always takes you back, with your answers kept.</li>
      <li>Select <b>Flag for Review</b> on any question you want to return to. After the last question, the review screen lists every question and lets you go back to any of them.</li>
      <li>Terms marked with an asterisk (*) are explained in the <b>Glossary</b> (bottom left). The clock keeps running while it is open.</li>
      <li>No answers, marks or explanations are shown during the mock. Your results appear after the feedback survey.</li>
      <li>As in the real test, there is no pause button. If you close this page, the clock stops and you can carry on where you left off.</li></ul>`;
  }
  function mainHtml(set){
    const f = facts(set);
    switch (st.stage) {
      case "welcome": return `<h2 class="ex-h">${escH(TITLE)}</h2>
        <div class="ex-note" role="note"><p><b>Unofficial practice mock.</b> This mock was written for this practice website. It is not affiliated with or endorsed by NHS England, COPDEND, HEIW, NIMDTA or Pearson VUE, and none of its questions come from the real test.</p><p>It copies how the test screen looks and works so the real thing feels familiar.</p></div>
        <p>It follows the order of the real test day: a confidentiality agreement, an optional tutorial and the instructions, then ${f.n} questions in ${f.mins} minutes, a review screen and a short feedback survey. Your results are shown at the very end.</p>
        <p>The clock does not start until you say you are ready to begin.</p><p>Select <b>Next</b> to continue.</p>`;
      case "nda": return `<h2 class="ex-h">Confidentiality agreement</h2><p>On the day of the real test you must accept a confidentiality agreement before the test begins. This screen lets you practise that step.</p>
        <div class="ex-panel"><p>By continuing, I agree that:</p><ul class="ex-ul"><li>I will work through this mock on my own, without help from other people or notes;</li><li>I will treat the scenarios as confidential, as I will have to in the real test;</li><li>I understand this is an unofficial practice mock and my score does not predict my result in the real test.</li></ul></div>
        <label class="ex-agree"><input type="checkbox" id="ex-agree"${st.agree ? " checked" : ""}> I agree to these terms</label><p>Select <b>Next</b> to continue.</p>`;
      case "tutorial": return TUT[st.tut]();
      case "instr": return `<h2 class="ex-h">Instructions</h2>${instrBody(set)}<p>Select <b>Next</b> when you are ready to begin.</p>`;
      case "part1": return `<h2 class="ex-h">Part One:</h2><p>In this part you will be presented with scenarios followed by five possible responses. Rank the responses in order, from 1 (the most appropriate, or the most important) to 5 (the least).</p><p>Answer the scenarios with what you should do as a Foundation Dentist.</p><p>There are ${f.n1} questions in this part. Select <b>Next</b> to begin.</p>`;
      case "part2": return `<h2 class="ex-h">Part Two:</h2><p>In this part you will be presented with scenarios followed by a number of possible options. Choose the three most appropriate actions to take in each situation.</p><p>Answer the scenarios with what you should do as a Foundation Dentist.</p><p>There are ${f.n2} questions in this part. Select <b>Next</b> to begin.</p>`;
      case "q": case "rq": return qHtml(set, st.k);
      case "review": return reviewHtml(set);
      case "complete": return `<h2 class="ex-h">${escH(TITLE)}</h2><p>You have now completed the exam.</p><p>Please select the <b><u>E</u>nd Exam</b> button below.</p>`;
      case "survey": return `<h2 class="ex-h">Feedback survey</h2><p>Optional: answer as many as you like, then select <b>Next</b>. Your answers stay on this device and are not sent anywhere.</p>` +
        SURVEY_Q.map((q, i) => `<fieldset class="ex-sv"><legend>${i + 1}. ${escH(q)}</legend><div class="ex-svo">${AGREE.map((a, v) => `<label><input type="radio" name="ex-sv-${i}" id="ex-sv-${i}-${v + 1}" value="${v + 1}"${st.survey[i] === v + 1 ? " checked" : ""}> ${a}</label>`).join("")}</div></fieldset>`).join("");
      case "thanks": return `<h2 class="ex-h">Thank you</h2><p>The mock is finished.</p><p>Select <b>Next</b> to see your results and go through every question with its answer and explanation.</p>`;
    }
    return "";
  }
  function qHtml(set, k){
    const qi = set.list[k], q = Q[qi]; if (!q) return "";
    const m = marked(qi);
    let h = `<div class="ex-q"><p class="ex-scen">${m.s}</p>`;
    if (rankT(qi)) {
      const cons = q.t === "consider", word = cons ? "important" : "appropriate";
      h += `<p class="ex-instr"><b>Rank</b> in order ${cons ? "the importance of " : ""}the following <b>${cons ? "considerations" : "actions"}</b> in response to this situation<br>(1= Most ${word}; 5= Least ${word}).</p>`;
      const s = slotsOf(set, qi), placed = new Set(s.filter(o => o != null));
      h += `<p class="ex-sr" id="ex-rhelp">To answer with the keyboard, move to a response and press Enter to select it, then move to a rank box and press Enter to place it. Pressing a number from 1 to 5 on a response places it at that rank. Press Delete on a rank box to send its response back.</p>`;
      h += `<div class="ex-rank" role="group" aria-label="Your ranking" aria-describedby="ex-rhelp">`;
      for (let r = 0; r < 5; r++) {
        const o = s[r], full = o != null;
        h += `<span class="ex-num ex-r${r + 1}" aria-hidden="true">${r + 1}</span><div class="ex-slot ex-r${r + 1}${full ? " ex-full" : ""}${full && o === sel ? " ex-sel" : ""}" id="ex-slot-${r}" data-slot="${r}"${full ? ` data-o="${o}"` : ""} role="button" tabindex="0" aria-label="Rank ${r + 1}: ${full ? attr(q.o[o][0]) + (o === sel ? " (selected)" : "") : "empty"}">${full ? m.o[o] : ""}</div>`;
      }
      // Each option keeps a fixed home cell in the right column; a placed option leaves its cell empty (no re-flow).
      for (let o = 0; o < 5; o++) h += `<div class="ex-home ex-r${o + 1}" data-home="${o}">${placed.has(o) ? "" : `<div class="ex-opt${o === sel ? " ex-sel" : ""}" id="ex-opt-${o}" data-o="${o}" role="button" tabindex="0" aria-pressed="${o === sel}">${m.o[o]}</div>`}</div>`;
      h += `</div>`;
    } else {
      const p = picksOf(set, qi);
      h += `<p class="ex-instr"><b>Choose</b> the <b>THREE</b> most appropriate <b>actions</b> to take in this situation.</p><div class="ex-b3" role="group" aria-label="Choose three responses">`;
      q.o.forEach((_, o) => { h += `<label class="ex-ck"><input type="checkbox" id="ex-ck-${o}" data-o="${o}"${p.includes(o) ? " checked" : ""}><span>${m.o[o]}</span></label>`; });
      h += `</div>`;
    }
    return h + `</div>`;
  }
  function reviewHtml(set){
    const P = parts(set), all = set.list.map((_, k) => k), fl = all.filter(k => st.flags[set.list[k]]);
    const tab = st.tab === "flagged" ? "flagged" : "all", rows = tab === "flagged" ? fl : all;
    let h = `<div class="ex-rvcard"><div class="ex-rvhead"><h2 class="ex-rvh">Mock Paper Question Review</h2>` +
      (tab === "all" ? `<button type="button" class="ex-pbtn" id="ex-b-revall" data-x="revall" data-key="a">${ul("Review All", "A")}</button>`
        : `<button type="button" class="ex-pbtn" id="ex-b-revflag" data-x="revflag" data-key="e"${fl.length ? "" : " disabled"}>${ul("Review Flagged", "e")}</button>`) + `</div>`;
    h += `<div class="ex-tabs" role="tablist" aria-label="Questions to show"><button type="button" role="tab" class="ex-tab" id="ex-tab-all" data-x="tab" data-t="all" aria-selected="${tab === "all"}" aria-controls="ex-tp" tabindex="${tab === "all" ? 0 : -1}">All (${all.length})</button>` +
      `<button type="button" role="tab" class="ex-tab" id="ex-tab-flagged" data-x="tab" data-t="flagged" aria-selected="${tab === "flagged"}" aria-controls="ex-tp" tabindex="${tab === "flagged" ? 0 : -1}" title="Review questions that are flagged for review">Flagged (${fl.length}) <span class="ex-info" aria-hidden="true">i</span></button></div>`;
    h += `<div class="ex-tblw" role="tabpanel" id="ex-tp" aria-labelledby="ex-tab-${tab}">`;
    if (!rows.length) h += `<p class="ex-empty">No questions are flagged for review.</p>`;
    else {
      h += `<table class="ex-tbl"><thead><tr><th scope="col">QUESTION</th><th scope="col">TITLE</th><th scope="col">STATUS</th><th scope="col">FLAGGED</th><th scope="col"><span class="ex-sr">Review</span></th></tr></thead><tbody>`;
      let part = "";
      rows.forEach(k => {
        const one = P.one.includes(k), pname = one ? "Part One" : "Part Two", n = (one ? P.one : P.two).indexOf(k) + 1, qi = set.list[k], ok = done(set, qi), f = !!st.flags[qi];
        // numbers restart at 1 in Part Two, so a group row says which part each run of rows belongs to
        if (pname !== part && P.one.length && P.two.length) { part = pname; h += `<tr class="ex-grp"><th colspan="5" scope="colgroup">${pname}</th></tr>`; }
        h += `<tr><td>${n}</td><td>Question</td><td><span class="ex-pill ${ok ? "ok" : "no"}">${ok ? "Complete" : "Incomplete"}</span></td><td>${f ? `Yes <span class="ex-fl">${I.flag(true, "currentColor")}</span>` : "No"}</td>` +
          `<td><button type="button" class="ex-link" id="ex-row-${k}" data-x="row" data-k="${k}" aria-label="Review ${pname} question ${n}">Review</button></td></tr>`;
      });
      h += `</tbody></table>`;
    }
    return h + `</div></div>`;
  }
  function counterOf(set){ const P = parts(set), one = P.one.includes(st.k), seq = one ? P.one : P.two; return {n:seq.indexOf(st.k) + 1, m:seq.length, part:one ? "Part One" : "Part Two"}; }
  function tcHtml(set){
    let h = "";
    if (set.started) {
      const t = rem(set);
      h += `<div class="ex-tline"><button type="button" class="ex-ib" id="ex-b-timer" data-x="timer" aria-label="${st.hideT ? "Show" : "Hide"} the time remaining" title="${st.hideT ? "Show" : "Hide"} time">${I.clock}</button>` +
        `<span class="ex-time" id="ex-time" role="timer" aria-live="off" aria-label="${spoken(t)}"${st.hideT ? " hidden" : ""}>${hms(t)}</span></div>`;
    }
    if (st.stage === "q" || st.stage === "rq") {
      const c = counterOf(set);
      h += `<div class="ex-cline"><button type="button" class="ex-ib" id="ex-b-count" data-x="count" aria-label="${st.hideN ? "Show" : "Hide"} the item counter" title="${st.hideN ? "Show" : "Hide"} item counter">${I.list}</button>` +
        `<span class="ex-count"${st.hideN ? " hidden" : ""}>${c.n} of ${c.m}</span></div>`;
    }
    return h;
  }
  function toolHtml(set){
    const qs = st.stage === "q" || st.stage === "rq", f = qs && !!st.flags[set.list[st.k]];
    let l = st.stage === "review" ? `<button type="button" class="ex-tb" id="ex-b-instr" data-x="instr" data-key="t" aria-keyshortcuts="Alt+T">${I.doc}<span>${ul("Instructions", "t")}</span></button>` : "";
    // Not part of the real test, but this is a practice mock: you can always leave it (see exitMock).
    if (RUN.includes(st.stage)) l += `<button type="button" class="ex-tb ex-exit" id="ex-b-exit" data-x="exit" data-key="x" aria-keyshortcuts="Alt+X"><span>${ul("Exit mock", "x")}</span></button>`;
    let r = qs ? `<button type="button" class="ex-tb${f ? " on" : ""}" id="ex-b-flag" data-x="flag" data-key="f" aria-pressed="${f}" aria-keyshortcuts="Alt+F">${I.flag(f, "#ffd400")}<span>${ul("Flag for Review", "F")}</span></button>` : "";
    r += `<select class="ex-scheme" id="ex-scheme" aria-label="Colour Scheme (now ${SCHEMES[st.scheme]})"><option value="" hidden selected>Colour Scheme</option>${Object.keys(SCHEMES).map(k => `<option value="${k}">${SCHEMES[k]}${k === st.scheme ? " ✓" : ""}</option>`).join("")}</select>`;
    return `<div class="ex-tl">${l}</div><div class="ex-tr">${r}</div>`;
  }
  function nb(x, label, key, icon, after){
    return `<button type="button" class="ex-nb" id="ex-b-${x}" data-x="${x}" data-key="${key.toLowerCase()}" aria-keyshortcuts="Alt+${key.toUpperCase()}">${after ? "" : icon}<span>${ul(label, key)}</span>${after ? icon : ""}</button>`;
  }
  function navHtml(set){
    const s = st.stage, P = parts(set);
    const N = nb("next", "Next", "N", I.next, true), Pv = nb("prev", "Previous", "P", I.prev), G = nb("gloss", "Glossary", "G", I.help), E = nb("end", "End Exam", "E", I.end);
    let l = "", r = "";
    if (PRE.includes(s)) { l = E; r = (s === "welcome" ? "" : Pv) + N; }
    else if (s === "part1") r = N;
    else if (s === "part2") r = (P.one.length ? Pv : "") + N;
    else if (s === "q") { l = G; r = Pv + N; }
    else if (s === "rq") { l = G + nb("review", "Review Screen", "R", I.review); r = N; }
    else if (s === "review") l = nb("endrev", "End Review", "E", I.end);
    else if (s === "complete") l = E;
    else r = N;
    return `<div class="ex-ng ex-nl">${l}</div><div class="ex-ng ex-nr">${r}</div>`;
  }
  function screenLabel(set){
    if (st.stage === "q" || st.stage === "rq") { const c = counterOf(set); return `${st.stage === "rq" ? "Reviewing " : ""}${c.part}, question ${c.n} of ${c.m}`; }
    const el = root && root.querySelector(".ex-main h2"); return el ? el.textContent : "";
  }

  // ---------- drawing ----------
  // Rebuilds the four bands. Focus returns to the element with the same id; on a new screen it goes to the content pane.
  function draw(screen){
    const set = mock(); if (!set || !root || !st) return;
    const main = $("ex-main"), y = main.scrollTop, a = document.activeElement, fid = a && a !== main && root.contains(a) && a.id ? a.id : "";
    root.className = "ex-s-" + st.scheme + (st.stage === "review" ? " ex-rvw" : "");
    $("ex-tc").innerHTML = tcHtml(set); $("ex-tool").innerHTML = toolHtml(set); main.innerHTML = mainHtml(set); $("ex-nav").innerHTML = navHtml(set);
    main.scrollTop = screen ? 0 : y;
    if (lay) return;
    const f = fid && $(fid);
    if (f && f.offsetParent !== null && !f.disabled) f.focus({preventScroll:true});
    else if (fid || screen) main.focus({preventScroll:true});
  }
  function go(stage, o){
    Object.assign(st, {stage}, o || {}); sel = null;
    const set = mock();
    if (set && (stage === "q" || stage === "rq")) { set.cur = st.k; try { persistAsIs(); } catch(e) {} } // the app's per-question timing follows set.cur
    persist(); draw(true); if (set) say(screenLabel(set));
  }

  // ---------- dialogs and windows ----------
  function dialog(o){
    closeLayer();
    const prev = document.activeElement, box = $("ex-layer"), warn = o.icon === "warn";
    box.hidden = false;
    box.innerHTML = `<div class="ex-dlg" role="${warn ? "alertdialog" : "dialog"}" aria-modal="true" aria-labelledby="ex-dt" aria-describedby="ex-dm"><div class="ex-dt" id="ex-dt">${escH(o.title)}</div>` +
      `<div class="ex-dbody"><span class="ex-ic ${warn ? "warn" : "info"}" aria-hidden="true">${warn ? "!" : "i"}</span><div class="ex-dm" id="ex-dm">${o.msg}</div></div>` +
      `<div class="ex-dbtns">${o.btns.map((b, i) => `<button type="button" class="ex-db" data-d="${i}" data-key="${b[1].toLowerCase()}" aria-keyshortcuts="Alt+${b[1]}">${ul(b[0], b[1])}</button>`).join("")}</div></div>`;
    lay = {kind:"dialog", o, prev}; shield(true);
    const btns = box.querySelectorAll(".ex-db"); (btns[o.def || 0] || btns[0]).focus();
    say(o.title + ". " + plain(o.msg));
  }
  function win(title, icon, html){
    closeLayer();
    const prev = document.activeElement, box = $("ex-layer");
    box.hidden = false;
    box.innerHTML = `<div class="ex-win" role="dialog" aria-modal="true" aria-labelledby="ex-wt"><div class="ex-wbar"><span class="ex-wt" id="ex-wt">${icon}<span>${escH(title)}</span></span><button type="button" class="ex-wx" id="ex-wx" data-x="closewin" aria-label="Close ${escH(title)}">×</button></div><div class="ex-wbody" tabindex="0">${html}</div></div>`;
    lay = {kind:"win", prev}; shield(true);
    $("ex-wx").focus(); say(title + " window opened.");
  }
  function shield(on){ const f = $("ex-frame"); if (!f) return; f.inert = on; if (on) f.setAttribute("aria-hidden", "true"); else f.removeAttribute("aria-hidden"); }
  function closeLayer(){ const box = $("ex-layer"); if (box) { box.innerHTML = ""; box.hidden = true; } lay = null; shield(false); }
  function refocus(el){ if (el && el.isConnected && root && root.contains(el)) el.focus({preventScroll:true}); else if (root) $("ex-main").focus({preventScroll:true}); }
  function closeWin(){ const prev = lay && lay.prev; closeLayer(); refocus(prev); }
  const ok = (title, msg, fn) => dialog({title, msg, icon:"info", btns:[["OK", "O", fn || null]], esc:true});
  const need = msg => ok("Response Required", msg);

  // ---------- flow ----------
  function next(){
    const set = mock(); if (!set) return;
    const P = parts(set), s = st.stage;
    if (s === "welcome") return go("nda");
    if (s === "nda") return st.agree ? go("tutorial", {tut:0}) : need("You must agree to the confidentiality agreement before you continue.");
    if (s === "tutorial") return st.tut < TUT.length - 1 ? go("tutorial", {tut:st.tut + 1}) : go("instr");
    if (s === "instr") return dialog({title:"Ready To Begin", msg:"If you are ready to begin the exam, select the Yes button. Otherwise, select the No button to return to the previous screen.", icon:"info", btns:[["Yes", "Y", startClock], ["No", "N", null]]});
    if (s === "part1") return P.one.length ? go("q", {k:P.one[0]}) : go(P.two.length ? "part2" : "review");
    if (s === "part2") return P.two.length ? go("q", {k:P.two[0]}) : go("review", {tab:"all"});
    if (s === "q" || s === "rq") {
      const qi = set.list[st.k];
      if (!done(set, qi)) return need(rankT(qi) ? "You cannot continue with this question unanswered." : "You must select 3 responses.");
      if (s === "rq") return st.rp + 1 < st.rl.length ? go("rq", {rp:st.rp + 1, k:st.rl[st.rp + 1]}) : go("review");
      const one = P.one.includes(st.k), seq = one ? P.one : P.two, i = seq.indexOf(st.k);
      if (i < seq.length - 1) return go("q", {k:seq[i + 1]});
      return one && P.two.length ? go("part2") : go("review", {tab:"all"});
    }
    if (s === "survey") return go("thanks");
    if (s === "thanks") return finish();
  }
  function prev(){
    const set = mock(); if (!set) return;
    const P = parts(set), s = st.stage;
    if (s === "nda") return go("welcome");
    if (s === "tutorial") return st.tut > 0 ? go("tutorial", {tut:st.tut - 1}) : go("nda");
    if (s === "instr") return go("tutorial", {tut:TUT.length - 1});
    if (s === "part2" && P.one.length) return go("q", {k:P.one[P.one.length - 1]});
    if (s === "q") {
      const one = P.one.includes(st.k), seq = one ? P.one : P.two, i = seq.indexOf(st.k);
      return i > 0 ? go("q", {k:seq[i - 1]}) : go(one ? "part1" : "part2");
    }
  }
  // "Yes" on Ready To Begin starts the clock exactly as the app's own "mock-start" does.
  function startClock(){
    const set = mock(); if (!set) return;
    set.started = true; set.el = 0; delete set.qt; setClock(true); if (typeof mockEvent === "function") mockEvent("start", set, "exam");
    try { ui.warned = {}; } catch(e) {}
    save(); go(parts(set).one.length ? "part1" : "part2");
  }
  function endReview(){
    const msg = first => `${first ? "You have chosen to end the current review." : "Please confirm that you want to end this review."}&nbsp; If you click Yes, you will NOT be able to return to this review.<br><br>Are you sure you want to end this review?`;
    dialog({title:"End Review", msg:msg(true), icon:"warn", def:1, btns:[["Yes", "Y", () => setTimeout(() =>
      dialog({title:"End Review Confirmation", msg:msg(false), icon:"warn", def:1, btns:[["Yes", "Y", () => { const set = mock(); setClock(false); if (set) save(); go("complete"); }], ["No", "N", null]]}), 0)], ["No", "N", null]]});
  }
  function endExam(){
    const pre = PRE.includes(st.stage);
    dialog({title:"End Exam", msg:"You have chosen to end this exam.<br><br>Are you sure you want to end this exam?", icon:"info", def:1, btns:[["Yes", "Y", () => pre ? leave() : go("survey")], ["No", "N", null]]});
  }
  // Leaving a running mock: pause and come back later, mark what has been answered, or throw the mock away.
  function exitMock(){
    dialog({title:"Exit mock", msg:"What would you like to do with this mock?<br><br><b>Leave for now</b> pauses the clock and keeps your answers, and you can resume from the Practice page.<br><b>Mark it now</b> ends the mock and marks what you have answered.<br><b>Discard</b> deletes it without marking.", icon:"info", def:3,
      btns:[["Leave for now", "L", leaveForNow], ["Mark it now", "M", markNow], ["Discard", "D", () => setTimeout(confirmDiscard, 0)], ["Keep going", "K", null]]});
  }
  function leaveForNow(){
    const set = mock(); if (!set) return;
    set.left = true; setClock(false); persist(); try { S.setId = "p1"; S.view = "practice"; ui.building = false; } catch(e) {} save();
    closeDom(); appRender();
  }
  function markNow(){ const set = mock(); if (set) { setClock(false); set.left = false; } finish(); }
  function confirmDiscard(){
    dialog({title:"Discard mock", msg:"This deletes the mock and your answers in it. Nothing is marked or saved to your results.<br><br>Are you sure?", icon:"warn", def:1,
      btns:[["Yes", "Y", discard], ["No", "N", null]]});
  }
  function discard(){
    setClock(false); clearState(); closeDom();
    try { S.sets.custom = null; S.setId = "p1"; S.view = "practice"; ui.building = false; ui.summary = false; } catch(e) {}
    save(); appRender();
  }
  // Before the clock starts, End Exam simply leaves; the mock stays unstarted in the app.
  function leave(){ clearState(); closeDom(); appRender(); try { focusCard(); } catch(e) {} }
  // After the survey: close the overlay and hand over to the app's own mock marking and summary.
  function finish(){
    const set = mock(); keepSurvey(); clearState(); closeDom(); setClock(false);
    if (!set) return appRender();
    try { S.setId = "custom"; S.view = "practice"; ui.building = false; ui.summary = false; } catch(e) {}
    try { if (location.hash && location.hash !== "#practice") history.replaceState(history.state, "", "#practice"); } catch(e) {}
    if (typeof markSet === "function") markSet(); else appRender();
  }
  function expire(){
    const set = mock(); if (!set || !st) return;
    setClock(false); if (set.limit) set.el = Math.max(set.el || 0, set.limit); save();
    endDrag(); closeLayer();
    st.stage = "complete"; sel = null; persist(); draw(true);
    ok("Time Expired", "The time allowed for this exam has expired.");
  }
  function toggleFlag(){
    const set = mock(), qi = set && curQi(set); if (qi == null) return;
    if (st.flags[qi]) delete st.flags[qi]; else st.flags[qi] = 1;
    persist(); draw(); say(st.flags[qi] ? "Flagged for review." : "Flag removed.");
  }

  // ---------- ranking: placing and returning options ----------
  function place(o, r, fid){
    const set = mock(), qi = set && curQi(set); if (qi == null || !rankT(qi)) return;
    const s = slotsOf(set, qi), from = s.indexOf(o), was = s[r];
    // dropping on an occupied slot sends the earlier option back to its own home cell (no swap)
    if (from !== r) { if (from >= 0) s[from] = null; s[r] = o; commitRank(set, qi, s); }
    sel = o; draw(); if (fid && $(fid)) $(fid).focus({preventScroll:true});
    say(`Placed at rank ${r + 1}.${was != null && was !== o ? " The response that was there has gone back to the list." : ""}${s.every(x => x != null) ? " All five ranks are filled." : ""}`);
  }
  function home(o, fid){
    const set = mock(), qi = set && curQi(set); if (qi == null || !rankT(qi)) return;
    const s = slotsOf(set, qi), at = s.indexOf(o);
    if (at >= 0) { s[at] = null; commitRank(set, qi, s); say("Response sent back to the list."); }
    sel = o; draw(); if (fid && $(fid)) $(fid).focus({preventScroll:true});
  }
  function select(o){ sel = o; draw(); say("Response selected. Now choose a rank box."); }
  function isPlaced(o){ const set = mock(), qi = set && curQi(set); return qi != null && slotsOf(set, qi).includes(o); }

  // Pointer Events drag (mouse, pen and touch): a short move starts a drag with a floating ghost; a press without
  // moving is a tap, which selects an option or places the selected one into the tapped slot.
  function onDown(e){
    if (lay || !e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
    const el = e.target.closest && e.target.closest(".ex-opt, .ex-slot, .ex-home"); if (!el || !root.contains(el)) return;
    const o = el.dataset.o != null ? +el.dataset.o : null;
    dg = {el, o, id:e.pointerId, x:e.clientX, y:e.clientY, moved:false, ghost:null, over:null};
    if (o != null) { try { el.setPointerCapture(e.pointerId); } catch(err) {} e.preventDefault(); el.focus({preventScroll:true}); }
  }
  function onMove(e){
    if (!dg || e.pointerId !== dg.id || dg.o == null) return;
    if (!dg.moved) {
      if (Math.abs(e.clientX - dg.x) + Math.abs(e.clientY - dg.y) < 6) return;
      const r = dg.el.getBoundingClientRect(), g = document.createElement("div"), set = mock(), qi = set && curQi(set);
      if (qi == null) return endDrag();
      g.className = "ex-ghost"; g.setAttribute("aria-hidden", "true"); g.innerHTML = marked(qi).o[dg.o];
      g.style.width = r.width + "px"; g.style.minHeight = r.height + "px";
      dg.dx = dg.x - r.left; dg.dy = dg.y - r.top; dg.ghost = g; dg.moved = true;
      root.appendChild(g); dg.el.classList.add("ex-src");
    }
    e.preventDefault();
    dg.ghost.style.transform = `translate(${e.clientX - dg.dx}px, ${e.clientY - dg.dy}px)`;
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    let t = hit && hit.closest ? hit.closest(".ex-slot") : null;
    if (!t && hit && hit.closest && hit.closest(".ex-home")) t = isPlaced(dg.o) ? root.querySelector(`.ex-home[data-home="${dg.o}"]`) : null; // highlight where it would return
    if (t !== dg.over) { if (dg.over) dg.over.classList.remove("ex-over"); dg.over = t; if (t) t.classList.add("ex-over"); }
    // keep the slots reachable on small screens by scrolling the content pane near its edges
    const main = $("ex-main"), mr = main.getBoundingClientRect();
    if (e.clientY < mr.top + 48) main.scrollTop -= 14; else if (e.clientY > mr.bottom - 48) main.scrollTop += 14;
  }
  function onUp(e){
    if (!dg || e.pointerId !== dg.id) return;
    const d = dg; endDrag();
    if (d.moved) {
      const t = d.over;
      if (t && t.classList.contains("ex-slot")) place(d.o, +t.dataset.slot);
      else if (t && t.classList.contains("ex-home")) home(d.o);
      else draw();
      return;
    }
    if (d.el.classList.contains("ex-slot")) { if (sel != null && sel !== d.o) place(sel, +d.el.dataset.slot); else if (d.o != null) select(d.o); return; }
    if (d.el.classList.contains("ex-opt")) return select(d.o);
    if (d.el.classList.contains("ex-home") && sel != null && isPlaced(sel)) home(sel);
  }
  function endDrag(){
    if (!dg) return;
    if (dg.ghost) dg.ghost.remove();
    if (dg.over) dg.over.classList.remove("ex-over");
    if (dg.el) dg.el.classList.remove("ex-src");
    dg = null;
  }

  // ---------- events ----------
  function onClick(e){
    const d = e.target.closest("[data-d]");
    if (d && lay && lay.kind === "dialog") {
      const b = lay.o.btns[+d.dataset.d], prevEl = lay.prev; closeLayer(); refocus(prevEl);
      if (b && b[2]) b[2]();
      return;
    }
    const b = e.target.closest("[data-x]"); if (!b || b.disabled || !st) return;
    const set = mock(); if (!set) return;
    switch (b.dataset.x) {
      case "next": next(); break;
      case "prev": prev(); break;
      case "gloss": win("Glossary", I.help, `<h2 class="ex-gh">Dental Foundation Training SJT Mock Paper Glossary</h2><table class="ex-gt"><thead><tr><th scope="col">Term</th><th scope="col">Definition</th></tr></thead><tbody>${GLOSSARY.map(g => `<tr><td>${escH(g[0])}</td><td>${escH(g[1])}</td></tr>`).join("")}</tbody></table>`); break;
      case "instr": win("Instructions", I.doc, `<h2 class="ex-gh">Instructions</h2>${instrBody(set)}`); break;
      case "closewin": closeWin(); break;
      case "flag": toggleFlag(); break;
      case "timer": st.hideT = !st.hideT; persist(); draw(); say(st.hideT ? "Time hidden." : "Time shown."); break;
      case "count": st.hideN = !st.hideN; persist(); draw(); say(st.hideN ? "Item counter hidden." : "Item counter shown."); break;
      case "review": go("review"); break;
      case "end": endExam(); break;
      case "exit": exitMock(); break;
      case "endrev": endReview(); break;
      case "skiptut": go("instr"); break;
      case "tab": st.tab = b.dataset.t === "flagged" ? "flagged" : "all"; persist(); draw(); break;
      case "revall": { const all = set.list.map((_, k) => k); go("rq", {rl:all, rp:0, k:all[0]}); break; }
      case "revflag": { const fl = set.list.map((_, k) => k).filter(k => st.flags[set.list[k]]); if (fl.length) go("rq", {rl:fl, rp:0, k:fl[0]}); break; }
      case "row": {
        const k = +b.dataset.k, all = set.list.map((_, i) => i), rows = st.tab === "flagged" ? all.filter(i => st.flags[set.list[i]]) : all, at = rows.indexOf(k);
        if (at >= 0) go("rq", {rl:rows, rp:at, k}); break;
      }
    }
  }
  function onChange(e){
    const t = e.target, set = mock(); if (!set || !st) return;
    if (t.id === "ex-scheme") { if (own(SCHEMES, t.value)) { st.scheme = t.value; persist(); draw(); say(`Colour scheme: ${SCHEMES[st.scheme]}.`); } return; }
    if (t.id === "ex-agree") { st.agree = t.checked; persist(); return; }
    if (t.name && t.name.startsWith("ex-sv-")) { const i = +t.name.slice(6); if (int(i, 0, SURVEY_Q.length - 1)) { st.survey[i] = +t.value; persist(); } return; }
    if (t.closest(".ex-ck")) {
      const qi = curQi(set); if (qi == null || rankT(qi)) return;
      const o = +t.dataset.o; let p = picksOf(set, qi);
      if (t.checked && !p.includes(o)) {
        if (p.length >= 3) { t.checked = false; return ok("Maximum Selections", "You have reached the maximum number of selections for this item."); }
        p.push(o);
      } else if (!t.checked) p = p.filter(x => x !== o);
      commitPicks(set, qi, p);
    }
  }
  function trap(e, box){
    const f = [...box.querySelectorAll("button, input, select, [tabindex]:not([tabindex='-1'])")].filter(x => !x.disabled && x.offsetParent !== null);
    if (!f.length) return;
    const i = f.indexOf(document.activeElement); e.preventDefault();
    f[e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i < 0 || i === f.length - 1 ? 0 : i + 1)].focus();
  }
  // Registered before app.js's listeners: while the overlay is open it owns the keyboard, so the app's own
  // shortcuts (F flags a question in the app) never act on the page underneath.
  document.addEventListener("keydown", e => {
    if (!root) return;
    e.stopImmediatePropagation();
    const k = e.key, letter = /^Key[A-Z]$/.test(e.code || "") ? e.code.slice(3).toLowerCase() : (k && k.length === 1 ? k.toLowerCase() : "");
    const alt = e.altKey && !e.ctrlKey && !e.metaKey;
    if (lay) {
      const box = $("ex-layer");
      if (k === "Escape") { e.preventDefault(); if (lay.kind === "win") closeWin(); else if (lay.o.esc) box.querySelector(".ex-db")?.click(); return; } // destructive dialogs ignore Escape
      if (k === "Tab") return trap(e, box);
      if (lay.kind === "dialog" && letter && (alt || !(e.ctrlKey || e.metaKey || e.altKey))) { const b = box.querySelector(`.ex-db[data-key="${letter}"]`); if (b) { e.preventDefault(); b.click(); } }
      return;
    }
    if (alt && letter) {
      // first visible match in document order, so Review Flagged (e) wins over End Review (E) on the Flagged tab
      const b = [...root.querySelectorAll("#ex-frame [data-key]")].find(x => x.dataset.key === letter && !x.disabled && x.offsetParent !== null);
      if (b) { e.preventDefault(); b.click(); }
      return;
    }
    const t = e.target;
    if (t.classList && t.classList.contains("ex-tab") && (k === "ArrowLeft" || k === "ArrowRight")) { e.preventDefault(); const other = t.id === "ex-tab-all" ? "ex-tab-flagged" : "ex-tab-all"; $(other)?.click(); $(other)?.focus(); return; }
    const box = t.closest && t.closest(".ex-opt, .ex-slot"); if (!box || !root.contains(box) || e.ctrlKey || e.metaKey || e.altKey) return;
    const slot = box.classList.contains("ex-slot"), o = box.dataset.o != null ? +box.dataset.o : null, r = slot ? +box.dataset.slot : -1;
    if (k === "Enter" || k === " ") {
      e.preventDefault();
      if (!slot) return select(o);
      if (sel != null && sel !== o) return place(sel, r, "ex-slot-" + r);
      if (o != null) { select(o); $("ex-slot-" + r)?.focus({preventScroll:true}); } else say("Select a response first.");
    } else if ((k === "Delete" || k === "Backspace") && slot && o != null) { e.preventDefault(); home(o, "ex-opt-" + o); }
    else if (/^[1-5]$/.test(k) && o != null) { e.preventDefault(); place(o, +k - 1, "ex-slot-" + (+k - 1)); }
    else if (k === "Escape" && sel != null) { sel = null; draw(); }
  });

  // ---------- open / close ----------
  function build(){
    root = document.createElement("div"); root.id = "exam"; root.setAttribute("lang", "en-GB");
    root.innerHTML = `<div class="ex-frame" id="ex-frame"><header class="ex-title"><div class="ex-ttl">${escH(TITLE)} - Unofficial Practice</div><div class="ex-tc" id="ex-tc"></div></header>` +
      `<div class="ex-tool" id="ex-tool"></div><main class="ex-main" id="ex-main" tabindex="-1" aria-label="Exam content"></main><nav class="ex-nav" id="ex-nav" aria-label="Exam navigation"></nav></div>` +
      `<div class="ex-sr" id="ex-live" aria-live="polite" aria-atomic="true"></div><div id="ex-layer" class="ex-layer" hidden></div>`;
    root.addEventListener("click", onClick); root.addEventListener("change", onChange);
    root.addEventListener("pointerdown", onDown); root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp); root.addEventListener("pointercancel", e => { if (dg && e.pointerId === dg.id) { endDrag(); draw(); } });
    document.body.appendChild(root); document.documentElement.classList.add("ex-open");
    clearInterval(timer); timer = setInterval(tickUi, 500);
  }
  function closeDom(){
    endDrag(); lay = null; sel = null; clearInterval(timer); timer = 0;
    if (root) root.remove(); root = null; st = null;
    document.documentElement.classList.remove("ex-open");
  }
  // Opens the overlay for the current timed mock (resuming its saved stage). Returns false, changing nothing, if there is none.
  function open(){
    if (root) return true;
    try {
      const set = mock(); if (!set || set.marked) return false;
      set.left = false;
      const ord = partOrder(set.list); if (!ord.length) return false;
      if (ord.join() !== set.list.join()) { const cur = set.list[set.cur]; set.list = ord; set.cur = Math.max(0, ord.indexOf(cur)); save(); }
      st = load(set);
      if (!set.started && !PRE.includes(st.stage)) st = blank(set);                                   // e.g. the mock was reset
      if (set.started && PRE.includes(st.stage)) { st.stage = "q"; st.k = Math.min(set.cur || 0, set.list.length - 1); } // started elsewhere
      S.setId = "custom"; S.view = "practice"; ui.building = false; ui.summary = false;
      try { if (location.hash && location.hash !== "#practice") history.replaceState(history.state, "", "#practice"); } catch(e) {}
      build();
      if (RUN.includes(st.stage) && set.started) { if (rem(set) <= 0) { expire(); return true; } setClock(true); } // no pause: a reload carries straight on
      if (st.stage === "q" || st.stage === "rq") set.cur = st.k;
      persist(); draw(true); say(screenLabel(set));
      return true;
    } catch(e) { closeDom(); return false; }
  }
  function tickUi(){
    if (!root || !st) return;
    const set = mock();
    if (!set || set.marked || set.created !== st.c) { closeDom(); appRender(); return; } // marked or replaced on another tab or device
    if (RUN.includes(st.stage) && set.started) {
      if (rem(set) <= 0) return expire();
      if (typeof timerOn !== "undefined" && !timerOn) setClock(true); // there is no pause in the exam
    }
    const t = $("ex-time");
    if (t) { const v = hms(rem(set)), lab = spoken(rem(set)); if (t.textContent !== v) t.textContent = v; if (t.getAttribute("aria-label") !== lab) t.setAttribute("aria-label", lab); }
  }
  // Called from the app's timeUp(): the overlay shows Time Expired and its own completion screen instead of marking at once.
  function onTimeUp(){
    try {
      const set = mock(); if (!set || set.marked || !set.started) return false;
      if (!root && !open()) return false;
      if (st && !POST.includes(st.stage)) expire();
      return !!root;
    } catch(e) { return false; }
  }
  // On page load: reopen a started mock, or one whose pre-start screens were open.
  function resume(){ const set = mock(); if (!set || set.marked || set.left || root) return false; return set.started || savedFor(set) ? open() : false; }

  window.Exam = {open, resume, isOpen: () => !!root, onTimeUp};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", resume); else setTimeout(resume, 0);
})();
