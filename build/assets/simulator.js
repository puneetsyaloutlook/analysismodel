(function () {
  var DATA = JSON.parse(document.getElementById('sim-data').textContent);
  var $ = function (id) { return document.getElementById(id); };
  var out = $('sim-out'), title = $('sim-title'), bar = $('sim-bar');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.sim-steps li'));
  var NAMES = ['Intake', 'Rule out techniques', 'Choose techniques', 'Plan the order', 'Run the techniques', 'Check the findings', 'Combine the findings', 'Answer'];
  var PROP = { content_type: 'Content type', unit_of_analysis: 'Unit of analysis', access_depth: 'Level of detail available', source_count: 'Number of sources', linkage: 'Whether sources can be joined', volume_class: 'Amount of material', representation: 'Structure', language: 'Language', privacy: 'Personal information', security_classification: 'Security classification', licence: 'Licence', data_condition_flags: 'Known data problems' };
  function prop(k) { return PROP[k] || sentence(k); }
  var CLAIM_PLAIN = { 'describe': 'describe', 'associate': 'show a link between things', 'predict without implying cause': 'predict, without claiming a cause', 'estimate an intervention effect': 'estimate the effect of an action', 'explain mechanism or counterfactual': 'explain how or why' };
  var CLAIM_ORDER = ['describe', 'associate', 'predict without implying cause', 'estimate an intervention effect', 'explain mechanism or counterfactual'];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var job, done, current, running, token, cache, submitted = false;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sentence(s) { s = String(s).replace(/_/g, ' '); return s.charAt(0).toUpperCase() + s.slice(1); }
  function speed() { return reduce ? 0 : parseFloat($('sim-speed').value); }
  function wait(ms) { var t = token; return new Promise(function (res) { setTimeout(function () { res(t === token); }, ms * speed()); }); }
  function link(o) { return '<a href="' + o.url + '">' + esc(o.id) + ' ' + esc(o.name) + '</a>'; }
  function list(a) { return Array.isArray(a) ? a.join(', ') : a; }

  function setTally(k, v) { $(k).textContent = v; }
  function resetTally() { ['t-pass', 't-pick', 't-run', 't-person'].forEach(function (k) { setTally(k, '-'); }); }

  function mark(i, state) {
    var li = steps[i];
    li.className = state;
    li.querySelector('.st').textContent = state === 'done' ? 'done' : state === 'run' ? 'running' : 'waiting';
    if (state === 'run') li.querySelector('button').setAttribute('aria-current', 'step'); else li.querySelector('button').removeAttribute('aria-current');
  }

  function reset() {
    token = (token || 0) + 1; running = false; done = -1; current = -1; cache = {};
    job = DATA.filter(function (d) { return d.id === $('sim-job').value; })[0];
    $('sim-note').innerHTML = NOTES.real;
    steps.forEach(function (_, i) { mark(i, 'wait'); });
    bar.style.width = '0';
    submitted = false; title.textContent = '1. Intake';
    out.innerHTML = ''; out.appendChild(intakeForm(job));
    resetTally(); setTally('t-cat', job.total);
    $('sim-run').disabled = true; $('sim-step').disabled = true;
  }

  // Each step builds an array of "blocks": {html, pause}. Blocks appear one at a time inside a wrapper.
  var NOTES = {
    real: '<strong>This is an actual run.</strong> Code ran steps 1, 2 and 4 on the material. The model chose the techniques, and each technique ran as a separate agent on the brief. The verification techniques ran on the findings. The quotation check and the recount of the hypotheses table ran as code. <strong>Limits.</strong> The request wording, stakes, strength of statement, kind of finding and personal information answer were set by the model from the recommended defaults and were not given by the user. The human review sample was not done because it needs a person. The run followed version 1.1 of the design. The request confirmation after 5.1 and the strength of statement line in the answer were added in version 1.2 and are shown here as the process now works. Submit replays the stored output of the run with a loading delay. Nothing is computed in your browser.'
  };

  function builders(i) { return realBuilders(i); }

  var STAKES = [
    ['exploratory', 'The result decides what to look at next. A wrong result costs little and is corrected before anyone relies on it.'],
    ['decision-informing', 'The result is one input to a decision that can be reversed or revisited at moderate cost.'],
    ['high-stakes', 'The decision is costly or hard to reverse, affects rights, safety or finances, or the result will be published as authoritative.']
  ];
  var CLAIMS = [
    ['describe', 'Summarise what is in the material.'],
    ['associate', 'Show that things go together, without saying why.', 'Show a link between things'],
    ['predict without implying cause', 'Forecast or classify new cases from patterns.', 'Predict, without claiming a cause'],
    ['estimate an intervention effect', 'Estimate how an outcome changes when something is done.', 'Estimate the effect of an action'],
    ['explain mechanism or counterfactual', 'Say how or why, or what would have happened otherwise.', 'Explain how or why']
  ];
  function scale(levels, sel) {
    return '<ol class="scale">' + levels.map(function (l, n) {
      var on = l[0] === sel;
      return '<li' + (on ? ' class="on" aria-current="true"' : '') + '><span class="sn">' + (n + 1) + '</span><span class="sl">' + esc(sentence(l[0])) + (on ? ' <span class="pill">selected</span>' : '') + '</span><span class="sd">' + esc(l[1]) + '</span></li>';
    }).join('') + '</ol>';
  }
  function radios(levels, sel, name) {
    return '<ol class="scale">' + levels.map(function (l, n) {
      var on = l[0] === sel;
      return '<li' + (on ? ' class="on"' : '') + '><label><input type="radio" name="' + name + '" value="' + esc(l[0]) + '"' + (on ? ' checked' : '') + '><span class="sl">' + esc(l[2] || sentence(l[0])) + '</span><span class="sd">' + esc(l[1]) + '</span></label></li>';
    }).join('') + '</ol>';
  }
  var INSIGHTS = [['pattern', 'what repeats across the material'], ['difference', 'what differs between groups or cases'], ['contradiction', 'where statements conflict'], ['gap', 'what is missing']];
  function intakeForm(j) {
    var sec = document.createElement('section'); sec.className = 'stepblock'; sec.id = 'sim-step-0';
    var hd = document.createElement('h3'); hd.className = 'stephead'; hd.textContent = '1. Intake'; sec.appendChild(hd);
    var f = document.createElement('form'); f.className = 'intake-form';
    f.innerHTML =
      '<label class="fl" for="in-request">What question should the analysis answer?</label><textarea id="in-request" rows="2" readonly>' + esc(j.request) + '</textarea>' +
      '<span class="fl">What material should the analysis use?</span><div class="doc"><span class="doc-name">Voice AI interview study</span><span class="small">1 document, ' + j.source.words + ' words</span> <a href="/simulator/material/">Open the submitted content</a></div>' +
      '<fieldset><legend>What will the result be used for?</legend><p class="small">Higher stakes add more checks before a conclusion is labelled.</p>' + radios(STAKES, j.stakes, 'stakes') + '</fieldset>' +
      '<fieldset><legend>What is the strongest statement you need to make?</legend><p class="small">Choose the strongest one the answer must support. Stronger statements need more checks, and fewer techniques can reach them.</p>' + radios(CLAIMS, j.claim, 'claim') + '</fieldset>' +
      '<fieldset><legend>What kind of finding are you after?</legend><p class="small">Tick all that apply.</p><div class="checks">' + INSIGHTS.map(function (x) { return '<label><input type="checkbox" name="insight" value="' + x[0] + '"' + (j.insight.indexOf(x[0]) > -1 ? ' checked' : '') + '> <strong>' + esc(sentence(x[0])) + '</strong> <span class="small">' + esc(x[1]) + '</span></label>'; }).join('') + '</div></fieldset>' +
      '<div class="form-actions"><button type="submit" class="btn primary" id="sim-submit">Submit</button><label class="small"><input type="checkbox" id="sim-stepwise"> Step through one step at a time</label></div>';
    f.addEventListener('submit', function (e) { e.preventDefault(); submitIntake(f, j); });
    f.addEventListener('change', function () { markOn(f); });
    f.querySelector('.doc a').addEventListener('click', function (e) { e.preventDefault(); openMaterial(j, e.currentTarget); });
    sec.appendChild(f);
    return sec;
  }
  function openMaterial(j, opener) {
    var d = document.getElementById('mat-modal');
    if (!d) {
      d = document.createElement('dialog'); d.id = 'mat-modal'; d.className = 'modal'; d.setAttribute('aria-labelledby', 'mat-title');
      d.innerHTML = '<div class="modal-head"><h2 id="mat-title">Submitted content: voice AI interview study</h2><button type="button" class="btn" id="mat-close">Close</button></div><div class="modal-body result-md"></div>';
      document.body.appendChild(d);
      d.addEventListener('click', function (e) { if (e.target === d || e.target.id === 'mat-close') d.close(); });
      d.addEventListener('close', function () { if (d._opener) d._opener.focus(); });
    }
    d.querySelector('.modal-body').innerHTML = j.material_html || '';
    d._opener = opener;
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  }
  function markOn(f) {
    Array.prototype.forEach.call(f.querySelectorAll('ol.scale li'), function (li) { li.classList.toggle('on', li.querySelector('input').checked); });
  }
  function submitIntake(f, j) {
    if (submitted) return;
    submitted = true;
    var stepwise = $('sim-stepwise').checked;
    // The stored run used one set of answers, so any change reverts to them on submit.
    Array.prototype.forEach.call(f.querySelectorAll('input[name=stakes], input[name=claim]'), function (i) { i.checked = (i.value === (i.name === 'stakes' ? j.stakes : j.claim)); });
    Array.prototype.forEach.call(f.querySelectorAll('input[name=insight]'), function (i) { i.checked = j.insight.indexOf(i.value) > -1; });
    markOn(f);
    Array.prototype.forEach.call(f.querySelectorAll('input:not(#sim-stepwise), textarea'), function (i) { i.disabled = true; });
    f.classList.add('locked'); $('sim-submit').disabled = true; $('sim-submit').textContent = 'Submitted'; $('sim-stepwise').disabled = true;
    focusApp();
    if (stepwise) { stepOnce().then(function () { setBusy(false); }); } else { runAll(); }
  }

  function assumed(basis) { return basis === 'stated' ? '' : ' <span class="pill warn">assumed, not confirmed by the user</span>'; }
  function res(j, id) { return '<details class="resbox" open><summary>Result</summary><div class="result-md">' + (j.results_html[id] || '') + '</div></details>'; }
  function runRow(j, x, uses) { return '<div class="run"><div class="rh"><strong>' + link(x) + '</strong><span class="pill">runs on: ' + esc(uses) + '</span></div>' + res(j, x.id) + '</div>'; }

  function realBuilders(i) {
    var j = job, b = [], S = j.stages, bm = j.basis_map;
    if (i === 0) {
      b.push({ html: '<h3>Material read by code</h3><p class="small">The description of the material. These properties decide which techniques can run.</p>' });
      Object.keys(j.profile).forEach(function (k) { b.push({ html: '<div class="row2"><span>' + esc(prop(k)) + '</span><span>' + esc(list(j.profile[k])) + '</span></div>', fast: true }); });
    } else if (i === 1) {
      return builders_gates(j);
    } else if (i === 2) {
      return builders_pick(j);
    } else if (i === 3) {
      var n = 0;
      b.push({ html: '<p>Code places the chosen techniques in run order by kind. Analysis techniques are independent of each other. No personal information was found, so de-identification was not added.</p>' });
      [['5.1 Examine the question', S.frame], ['5.2 Prepare the material', S.prepare], ['5.3 Analyse the material', S.analyse], ['6 Check the findings', S.check]].forEach(function (c) {
        n += c[1].length;
        b.push({ html: '<div class="stage"><h3>' + esc(c[0]) + '</h3><ul>' + c[1].map(function (x) { return '<li>' + link(x) + '</li>'; }).join('') + '</ul></div>', tally: ['t-run', n] });
      });
      b.push({ html: '<div class="stage"><h3>Outside material to gather in 5.2</h3><ul><li>CM1-14 needs a reference structure. <strong>Resolved from the material:</strong> the material states four scenarios, eight participants and three hypotheses, and that was used. Nothing was gathered from outside.</li></ul></div>' });
    } else if (i === 4) {
      b.push({ html: '<p>Each technique ran as a separate agent that saw only the brief and its own technique record. Each result is shown in full below its technique.</p>' });
      b.push({ html: '<h3 class="substep">5.1 Examine the question</h3>' });
      S.frame.forEach(function (x) { b.push({ html: runRow(j, x, 'the request') }); });
      b.push({ confirm: true, html: '<div class="confirm"><h3>Do you want to change your request?</h3><p>The techniques in 5.1 examined the wording of the request. Their results are above.</p><p class="req">' + esc(j.request) + '</p><div class="form-actions"><button type="button" class="btn primary" data-keep>Keep the request</button><button type="button" class="btn" disabled title="Not available in this replay">Edit the request</button></div></div>' });
      b.push({ html: '<h3 class="substep">5.2 Prepare the material</h3>' });
      S.prepare.forEach(function (x) { b.push({ html: runRow(j, x, 'the material') }); });
      b.push({ html: '<h3 class="substep">5.3 Analyse the material</h3>' });
      S.analyse.forEach(function (x) { b.push({ html: runRow(j, x, 'the material') }); });
    } else if (i === 5) {
      var ck = j.ck17;
      b.push({ html: '<p>Verification techniques ran on the findings from step 5. The quotation check ran as code. The library checks follow.</p>' });
      b.push({ html: '<div class="run"><div class="rh"><strong><a href="/catalogue/check-extracted-results/ck-17/">CK-17 Source-span and quotation check by code</a></strong><span class="pill">runs on: the findings of the analysis</span></div><p class="small">' + ck.checked + ' double-quoted spans found in the nine results. ' + (ck.checked - ck.failed.length) + ' matched the source text. ' + ck.failed.length + ' did not match and were read by hand: ' + ck.failed.map(function (f) { return esc(f.file) + ' "' + esc(f.span) + '"'; }).join(', ') + '. These are the analysts\' own phrases in quotation marks and were not attributed to a participant, so no quotation failed.</p></div>', tally: ['t-run', S.frame.length + S.prepare.length + S.analyse.length + S.check.length] });
      S.check.filter(function (x) { return x.id !== 'CK-17'; }).forEach(function (x) { b.push({ html: runRow(j, x, 'the findings of the analysis') }); });
      b.push({ html: '<div class="run"><div class="rh"><strong>Recount of the hypotheses table by code</strong></div><p class="small">The competing hypotheses result states that H1 has three inconsistent ratings and H1r four, H2 and H2r one each, H3 three and H3r none. Counting the cells in its table by code gave the same figures.</p></div>' });
      var needed = {};
      j.checks.forEach(function (c) {
        var lis = c.list.map(function (k) {
          var st;
          if (k.code === 'assumption and limitation statement') st = '<span class="pill">present in the result</span>';
          else if (k.code === 'alternative explanations check') st = '<span class="pill">section present, quality not rated</span>';
          else if (k.code === 'source-span citation') st = '<span class="pill">done by code (CK-17)</span>';
          else if (k.code === 'spot check') st = '<span class="pill warn">not done</span>';
          else if (k.code === 'human review sample') { st = '<span class="pill warn">not done: person needed</span>'; needed[k.code] = 1; }
          else st = '';
          return '<li>' + esc(k.code) + ' ' + st + '</li>';
        }).join('');
        b.push({ html: '<div class="stage"><h3>Library checks on ' + link(c) + '</h3><ul>' + lis + '</ul></div>', tally: ['t-person', Object.keys(needed).length] });
      });
      b.push({ html: '<p class="result">Checks that need a person were not done. They are listed with the answer.</p>' });
    } else if (i === 6) {
      var sy = j.synthesis, T = sy.techniques;
      b.push({ html: '<p>' + esc(sy.method) + '</p>' });
      var head = '<tr><th>Conclusion</th>' + T.map(function (t) { return '<th>' + esc(t) + '</th>'; }).join('') + '</tr>';
      var body = sy.conclusions.map(function (c) { return '<tr><th scope="row">' + esc(c.id) + '</th>' + T.map(function (t) { var v = c.cells[t] || 'S'; return '<td class="cell-' + v + '" title="' + esc(sy.legend[v]) + '">' + ({ D: 'C', S: 'N' }[v] || v) + '</td>'; }).join('') + '</tr>'; }).join('');
      b.push({ html: '<h3>Agreement table</h3><div class="table-wrap"><table class="matrix"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div><p class="small">A agrees. P partly agrees. C conflict. N not covered.</p>' });
      sy.conclusions.forEach(function (c) {
        b.push({ html: '<div class="concl"><div class="rh"><strong>' + esc(c.id) + '</strong><span class="pill conf-' + c.label + '">' + esc(sentence(c.label)) + ' confidence</span></div><p>' + esc(c.text) + '</p><p class="small"><strong>Reason.</strong> ' + esc(c.reason) + '</p></div>' });
      });
    } else if (i === 7) {
      var a = j.synthesis.answer;
      b.push({ html: '<h3>Answer</h3><p class="lead-answer">' + esc(a.lead) + '</p>' });
      a.paragraphs.forEach(function (p) { b.push({ html: '<p>' + esc(p) + '</p>' }); });
      var need = CLAIM_ORDER.indexOf(j.claim), reach = j.picks.slice(0, 10).filter(function (p) { return CLAIM_ORDER.indexOf(p.ceiling) >= need; });
      var supported = j.synthesis.conclusions.filter(function (c) { return reach.some(function (p) { return c.cells[p.id] === 'A' || c.cells[p.id] === 'P'; }); }).map(function (c) { return c.id; });
      b.push({ html: '<h3>Strength of statement reached</h3><p>Needed: ' + esc(CLAIM_PLAIN[j.claim]) + '. ' + (reach.length ? reach.length + ' of the chosen techniques reach it: ' + reach.map(link).join(', ') + '. They support ' + esc(supported.join(', ')) + '.' : 'No chosen technique reaches it.') + '</p>' });
      b.push({ html: '<h3>What the answer is based on</h3>' });
      var basis = [
        'Material given: one document (Voice AI interview study), ' + j.source.words + ' words. It contains three hypotheses and ten quotes (Q1 to Q10) from eight participants (P1, P2, P3, P4, P5, P8, P9, P10). The material does not say how the quotes were chosen.',
        'Outside material gathered: none. The reference structure for CM1-14 was taken from the material.',
        'Techniques run, and what each worked on: FQ-03 and DM-02 (the request); HE1-02, CM1-05, CM1-14, HE1-14 and TC1-13 (the material); CK-17 by code, TC1-16 and TC1-17 (the findings of the analysis).',
        'Checks done: quotation check by code (' + j.ck17.checked + ' quoted spans, ' + (j.ck17.checked - j.ck17.failed.length) + ' matched, ' + j.ck17.failed.length + ' phrases read by hand); recount of the competing hypotheses table by code; assumption and limitation sections and alternative explanations sections present in all nine results.',
        'Checks not done because they need a person: human review sample (framework analysis).',
        'Request after 5.1: kept as submitted.',
        'Run notes: five results ran over the 450 word limit given to the agents (CM1-14, HE1-14, TC1-13, TC1-16, TC1-17). Techniques dropped: none. Files that could not be read: none.'
      ];
      basis.forEach(function (x) { b.push({ html: '<div class="row1">' + esc(x) + '</div>', fast: true }); });
      b.push({ html: '<h3>Follow-up round</h3><p>You can ask for a follow-up round. The process would then choose again for the gaps and unresolved conflicts above (the H2 and H3 verdicts depend on definitions, and nothing is known about P8 and P9). On the reserve list: ' + j.held.map(link).join(', ') + '. A follow-up round adds at most 5 techniques.</p>' });
      b.push({ html: '<p class="result">End of the run.</p>' });
    }
    return b;
  }

  function builders_gates(j) {
    var b = [], left = j.total;
    b.push({ html: '<p>Each requirement removes techniques that cannot run on this material. The techniques that remain are eligible.</p>' });
    Object.keys(j.removed).forEach(function (g) {
      left -= j.removed[g];
      b.push({ html: '<div class="gate"><span class="g">' + esc(prop(g)) + '</span><span class="meter"><i style="width:' + Math.round(j.removed[g] / j.total * 100) + '%"></i></span><span class="r">removes ' + j.removed[g] + '</span><span class="l">' + left + ' left</span></div>', tally: ['t-pass', left] });
    });
    b.push({ html: '<p class="result"><strong>' + j.passed + ' of ' + j.total + '</strong> techniques are eligible. <strong>' + j.reach_claim + '</strong> of them reach the strength of statement needed (' + esc(CLAIM_PLAIN[j.claim]) + ').</p>', tally: ['t-pass', j.passed] });
    return b;
  }
  function builders_pick(j) {
    var b = [];
    b.push({ html: '<p>The model read a one-line entry for each of the ' + j.passed + ' eligible techniques and chose at most 10, in priority order.</p>' });
    j.picks.slice(0, 10).forEach(function (p, n) {
      b.push({ html: '<div class="pick"><span class="no">' + (n + 1) + '</span><div><strong>' + link(p) + '</strong><p>' + esc(p.reason) + '</p></div></div>', tally: ['t-pick', n + 1] });
    });
    if (j.held.length) b.push({ html: '<p class="small"><strong>Reserve list:</strong> ' + j.held.map(link).join(', ') + '.</p>' });
    if (j.gaps) b.push({ html: '<details><summary>Gaps reported for this brief</summary><p>' + esc(j.gaps) + '</p></details>' });
    return b;
  }

  function runStep(i) {
    var t = token;
    current = i; mark(i, 'run');
    title.textContent = (i + 1) + '. ' + NAMES[i];
    bar.style.width = '0';
    var sec = document.getElementById('sim-step-' + i);
    if (!sec) {
      sec = document.createElement('section'); sec.className = 'stepblock'; sec.id = 'sim-step-' + i;
      var hd = document.createElement('h3'); hd.className = 'stephead'; hd.textContent = (i + 1) + '. ' + NAMES[i]; sec.appendChild(hd);
      out.insertBefore(sec, out.firstChild);
    }
    var wrap = document.createElement('div'); sec.appendChild(wrap);
    var blocks = builders(i), k = 0;
    return (function next() {
      if (k >= blocks.length) { bar.style.width = '100%'; return Promise.resolve(true); }
      var blk = blocks[k++], d = document.createElement('div');
      d.className = 'rv'; d.innerHTML = blk.html; wrap.appendChild(d);
      if (blk.tally) setTally(blk.tally[0], blk.tally[1]);
      bar.style.width = Math.round(k / blocks.length * 100) + '%';
      if (blk.confirm) {
        return new Promise(function (resolve) {
          var keep = d.querySelector('[data-keep]');
          d.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
          keep.addEventListener('click', function () { keep.disabled = true; keep.textContent = 'Request kept'; resolve(t === token); });
        }).then(function (ok) { return ok ? next() : false; });
      }
      return wait(blk.fast ? 120 : 420).then(function (ok) { return ok && t === token ? next() : false; });
    })().then(function (ok) {
      if (!ok || t !== token) return false;
      mark(i, 'done'); done = i; cache[i] = true; return true;
    });
  }

  function show(i) {
    var el = document.getElementById('sim-step-' + i);
    if (!el) return;
    el.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    steps.forEach(function (li, n) { li.querySelector('button').toggleAttribute('data-view', n === i); });
  }

  function focusApp() { var a = document.querySelector('.sim-app'); if (a && a.scrollIntoView) a.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); }

  function stepOnce() {
    if (running || done >= NAMES.length - 1) return Promise.resolve();
    if (done < 0) focusApp();
    running = true; setBusy(true);
    return runStep(done + 1).then(function () { running = false; setBusy(false); });
  }
  function runAll() {
    if (running) return;
    var t = token; if (done < 0) focusApp(); running = true; setBusy(true);
    (function loop() {
      if (done >= NAMES.length - 1) { running = false; setBusy(false); return; }
      runStep(done + 1).then(function (ok) {
        if (!ok || t !== token) { return; }
        if (done >= NAMES.length - 1) { running = false; setBusy(false); return; }
        return wait(500).then(function (ok2) { if (ok2) loop(); });
      });
    })();
  }
  function setBusy(b) { var off = b || !submitted || done >= NAMES.length - 1; $('sim-run').disabled = off; $('sim-step').disabled = off; }

  $('sim-job').addEventListener('change', reset);
  $('sim-reset').addEventListener('click', function () { reset(); });
  $('sim-step').addEventListener('click', function () { stepOnce().then(function () { setBusy(false); }); });
  $('sim-run').addEventListener('click', runAll);
  steps.forEach(function (li, i) { li.querySelector('button').addEventListener('click', function () { show(i); }); });
  reset();
})();
