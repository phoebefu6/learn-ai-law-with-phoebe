/* law-live.js - the grounded legal-research simulator (learn-ai-law-with-phoebe).
   Reusable "watch the number climb" pattern (finance/marketing/brand/leadership/content-live family).
   Deterministic, offline, no dependencies. Renders into #law-live.

   Teaching idea: a lawyer runs an AI legal-research query. With grounding + verification OFF,
   the AI confidently cites a FABRICATED case - the exact failure that got a lawyer sanctioned in
   2023. Turning on "verify against primary law" CATCHES it; providing the source authority makes
   the answer real. The "model" is a scripted teaching simulation; the lesson (you verify every
   citation, the licensed lawyer owns the answer) is real and is a professional duty. */
(function () {
  var host = document.getElementById("law-live");
  if (!host) return;

  var LEVERS = [
    { id: "sources",     label: "Provide the source law",   hint: "the actual cases + statutes", pts: 28 },
    { id: "verify",      label: "Verify against primary law", hint: "check every citation exists", pts: 22 },
    { id: "citations",   label: "Require pinpoint cites",     hint: "paragraph / section level",   pts: 18 },
    { id: "jurisdiction",label: "Set the jurisdiction",       hint: "the governing law",           pts: 15 },
    { id: "scope",       label: "Limit the question",         hint: "one precise issue",           pts: 7 }
  ];

  var state = { sources: false, verify: false, citations: false, jurisdiction: false, scope: false, mode: "live" };

  function score() {
    var s = 10;
    LEVERS.forEach(function (l) { if (state[l.id]) s += l.pts; });
    return Math.min(100, s);
  }

  /* four research question types; each is "reliable" only with the levers it needs.
     Verification is required for all - it is a professional duty, not an option. */
  var QUESTIONS = [
    { name: "A case citation",   need: ["sources", "verify"],                          why: "real authority + verified" },
    { name: "A statutory rule",  need: ["sources", "jurisdiction", "verify"],          why: "+ governing jurisdiction" },
    { name: "A legal standard",  need: ["sources", "citations", "verify"],             why: "+ pinpoint cites" },
    { name: "A memo synthesis",  need: ["sources", "citations", "jurisdiction", "verify"], why: "the full chain" }
  ];
  function qOk(q) { return q.need.every(function (k) { return state[k]; }); }
  function reliable() { return QUESTIONS.filter(qOk).length; }

  function draft() {
    var parts = [];
    if (!state.sources && !state.verify) {
      parts.push({ warn: true, label: "AI answer", t: "The controlling authority is Harrington v. Vale Industries, 512 F.3d 447 (9th Cir. 2019), which held that the duty applies once the parties commence performance. See also Okafor v. Meridian Corp., 88 Cal. App. 5th 210 (2021)." });
      parts.push({ warn: true, t: "⚠ Neither of those cases exists. With no source law provided and no verification, the AI invented confident, real-looking citations - the exact failure that got a lawyer sanctioned in 2023. Never file this." });
      return parts;
    }
    if (!state.sources && state.verify) {
      parts.push({ warn: true, label: "Verification result", t: "Verification against primary law: the authorities the AI proposed could not be located in any reporter or database - they do not exist. All removed. You have no supported answer yet." });
      parts.push({ warn: false, t: "The verify step caught the fabrication. Now provide the actual source law so the AI reasons over real authority instead of inventing it." });
      return parts;
    }
    // sources provided
    var head = "Reasoning only over the authorities you supplied: the duty attaches on commencement of performance, subject to the good-faith exception.";
    if (state.jurisdiction) head += " Under the jurisdiction you set, the controlling line of authority governs (persuasive-only cases flagged).";
    parts.push({ warn: false, label: "AI draft answer", t: head });

    var body = "";
    if (state.citations) body += "Every proposition is tied to a pinpoint cite in your supplied materials. ";
    else body += "(No pinpoint cites required, so support is at the case level - tighten before relying on it.) ";
    if (state.scope) body += "Scoped to your one precise issue, so the answer stays on point. ";
    parts.push({ warn: false, label: "Support", t: body.trim() });

    if (state.verify) parts.push({ warn: false, label: "Verified", t: "Every citation checked against primary law and confirmed to exist and to say what it is cited for. This is the draft a lawyer can build on - and still must review and own." });
    else parts.push({ warn: true, label: "Not verified", t: "Citations not independently checked. Even grounded in your sources, do not rely on or file this until you verify each cite yourself." });
    return parts;
  }

  host.innerHTML =
    '<div class="lw-shell">' +
      '<div class="lw-controls">' +
        '<div class="lw-ctitle">Ground the research</div>' +
        '<div class="lw-q">Query: <b>When does the duty to perform attach under the contract?</b></div>' +
        '<div class="lw-levers"></div>' +
        '<div class="lw-modes">' +
          '<button type="button" class="lw-mode lw-on" data-mode="live">Live answer</button>' +
          '<button type="button" class="lw-mode" data-mode="score">Reliability scorecard</button>' +
        '</div>' +
      '</div>' +
      '<div class="lw-stage">' +
        '<div class="lw-meters">' +
          '<div class="lw-meter"><span class="lw-mlabel">Answer reliability</span><span class="lw-mval" id="lw-score">10</span><div class="lw-bar"><i id="lw-bar"></i></div></div>' +
          '<div class="lw-meter"><span class="lw-mlabel">Question types reliable</span><span class="lw-mval" id="lw-rel">0 / 4</span></div>' +
        '</div>' +
        '<div id="lw-body"></div>' +
        '<p class="lw-rail">This model is a scripted teaching simulation - a real tool words things differently. What is real is the duty: AI legal output is a draft, never authority. You verify every citation against primary law, you protect privilege, and the licensed lawyer owns the answer. This is not legal advice.</p>' +
      '</div>' +
    '</div>';

  var leverWrap = host.querySelector(".lw-levers");
  LEVERS.forEach(function (l) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "lw-lever";
    b.setAttribute("data-lever", l.id);
    b.innerHTML = '<span class="lw-sw"></span><span class="lw-ltext"><b>' + l.label + '</b><span>' + l.hint + '</span></span>';
    b.addEventListener("click", function () { state[l.id] = !state[l.id]; render(); });
    leverWrap.appendChild(b);
  });
  host.querySelectorAll(".lw-mode").forEach(function (m) {
    m.addEventListener("click", function () { state.mode = m.getAttribute("data-mode"); render(); });
  });

  function render() {
    host.querySelectorAll(".lw-lever").forEach(function (b) {
      b.classList.toggle("lw-active", !!state[b.getAttribute("data-lever")]);
    });
    host.querySelectorAll(".lw-mode").forEach(function (m) {
      m.classList.toggle("lw-on", m.getAttribute("data-mode") === state.mode);
    });
    var s = score();
    host.querySelector("#lw-score").textContent = s;
    host.querySelector("#lw-bar").style.width = s + "%";
    var r = reliable();
    var rEl = host.querySelector("#lw-rel");
    rEl.textContent = r + " / 4";
    rEl.className = "lw-mval" + (r === 4 ? " lw-good" : "");

    var body = host.querySelector("#lw-body");
    if (state.mode === "score") {
      var rows = QUESTIONS.map(function (q) {
        var ok = qOk(q);
        return '<tr class="' + (ok ? "lw-r-ok" : "lw-r-no") + '"><td>' + q.name + '</td><td>' + q.why +
          '</td><td class="lw-rmark">' + (ok ? "✓" : "✗") + '</td></tr>';
      }).join("");
      body.innerHTML =
        '<div class="lw-scorehead">' + r + ' of 4 question types come out reliable <b>(' + Math.round((r / 4) * 100) + '%)</b></div>' +
        '<table class="lw-table"><thead><tr><th>Research question</th><th>Reliable when</th><th>OK?</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '<p class="lw-note">Every type needs the source law and verification - the two non-negotiables. Turn the levers on and watch reliability climb from a sanctionable 0% to a defensible draft.</p>';
    } else {
      var d = draft();
      body.innerHTML =
        '<div class="lw-draftlabel">AI legal-research output</div>' +
        '<div class="lw-draft">' + d.map(function (p) {
          var lab = p.label ? '<span class="lw-tag">' + p.label + '</span> ' : '';
          return '<p class="lw-line' + (p.warn ? " lw-warn" : "") + '">' + lab + p.t + '</p>';
        }).join("") + '</div>';
    }
  }

  render();
})();
