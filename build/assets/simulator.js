(function () {
  var DATA = JSON.parse(document.getElementById('sim-data').textContent);
  var $ = function (id) { return document.getElementById(id); };
  var out = $('sim-out'), title = $('sim-title'), bar = $('sim-bar');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.sim-steps li'));
  var NAMES = ['Intake', 'Rule out techniques', 'Choose analysis techniques', 'Plan analysis sequence', 'Run the techniques', 'Check the findings', 'Combine the findings', 'Answer'];
  var PROP = { content_type: 'Content type', unit_of_analysis: 'Unit of analysis', access_depth: 'Level of detail available', source_count: 'Number of sources', linkage: 'Whether sources can be joined', volume_class: 'Amount of material', representation: 'Structure', language: 'Language', privacy: 'Personal information', security_classification: 'Security classification', licence: 'Licence', data_condition_flags: 'Known data problems' };
  function prop(k) { return PROP[k] || sentence(k); }
  var WHY = { unit_of_analysis: 'Need a kind of item your content does not have', access_depth: 'Need more detailed data than you gave', source_count: 'Need more than one source', privacy: 'Do not fit the privacy setting of your content', content_type: 'Need a different type of content', linkage: 'Need sources that can be joined' };
  function plainReason(t) { return String(t).replace('It reaches the associate level.', 'It can show a link between things.'); }
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
    var SS = (job && job.status) || {}; li.querySelector('.st').textContent = state === 'done' ? SS['done'] : state === 'run' ? SS['running'] : SS['waiting to start'];
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
    real: '<strong>This replays a real run of MANIFST</strong> from 11 November 2026 on ten interview quotes. Nothing is calculated in your browser, so changing the form does not change the result. <strong>Limits.</strong> In the real run the wording of the question, the stakes, the strength of statement and the kind of finding were set by default and not chosen by a person. One check that needs a person was not done. The question after step 5.1 and the line on how strong a statement the answer supports were added to the design after the run.'
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
    var ip = makePanel('input'); ip.appendChild(f); sec.appendChild(ip);
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
  function runRow(j, x, uses) { return '<div class="run"><div class="rh"><strong>' + link(x) + '</strong><span class="pill">looked at: ' + esc(uses) + '</span></div>' + res(j, x.id) + '</div>'; }

  function realBuilders(i) {
    var j = job, b = [], S = j.stages, bm = j.basis_map;
    if (i === 0) {
      b.push({ role: 'work', html: '<p>MANIFST read your content and noted the facts that decide which techniques can be used on it.</p>' });
      b.push({ role: 'work', html: '<h3>About your content</h3>' });
      Object.keys(j.profile).filter(function (k) { return k !== 'security_classification' && k !== 'licence'; }).forEach(function (k) { b.push({ role: 'work', html: '<div class="row2"><span>' + esc(prop(k)) + '</span><span>' + esc(list(j.profile[k])) + '</span></div>', fast: true }); });
    } else if (i === 1) {
      return builders_gates(j);
    } else if (i === 2) {
      return builders_pick(j);
    } else if (i === 3) {
      var stg = [S.frame, S.prepare, S.analyse, S.check];
      var EXT = { 'none': 'No', 'reference structure': 'Yes: a list of what should be present', 'comparator': 'Yes: something to compare with', 'earlier period': 'Yes: the same data from an earlier period' };
      var total = 0, need = [], rows = '';
      j.plan_reasons.forEach(function (g, gi) {
        if (!stg[gi].length) return;
        rows += '<tr class="grp"><th colspan="3">' + esc(g.group_name) + '</th></tr>';
        stg[gi].forEach(function (x) {
          total += 1;
          if (x.external && x.external !== 'none') need.push(x);
          rows += '<tr><td>' + link(x) + '</td><td>' + esc(x.does) + '</td><td>' + esc(EXT[x.external] || 'No') + '</td></tr>';
        });
      });
      b.push({ role: 'work', html: '<p>MANIFST put the ' + Math.min(10, j.picks.length) + ' chosen techniques in four groups, in the order they will run.</p>' });
      b.push({ role: 'work', html: '<div class="table-wrap"><table class="plan"><thead><tr><th>Technique</th><th>What it does</th><th>Needs outside material</th></tr></thead><tbody>' + rows + '</tbody></table></div>', tally: ['t-run', total] });
      b.push({ role: 'work', html: '<p>Your content has no personal information, so nothing had to be removed from it first.</p>' });
      b.push({ role: 'work', html: need.length ? '<p>' + need.map(function (x) { return esc(x.name); }).join(' and ') + ' needs extra material to run. In step 5 MANIFST looks for it in your content first. Only if it is missing does MANIFST look elsewhere, and it asks you before using anything it finds.</p>' : '<p>No technique needs material from outside your content.</p>' });
    } else if (i === 4) {
      b.push({ role: 'work', html: '<p>MANIFST ran each technique separately on your question and content. Each result is shown in full below its technique.</p>' });
      b.push({ html: '<h3 class="substep">5.1 Examine the question</h3>' });
      S.frame.forEach(function (x) { b.push({ role: 'work', html: runRow(j, x, 'your question') }); });
      b.push({ role: 'input', confirm: true, html: '<div class="confirm"><h3>Do you want to change your question?</h3><p>The techniques above found terms in your question that need a fixed meaning. Read what they found, then choose. MANIFST continues when you answer.</p><p class="req">' + esc(j.request) + '</p><div class="form-actions"><button type="button" class="btn primary" data-keep>Keep my question</button><button type="button" class="btn" disabled title="Not available in this replay">Edit my question</button></div></div>' });
      b.push({ html: '<h3 class="substep">5.2 Prepare the material</h3>' });
      b.push({ role: 'work', html: '<div class="seq"><p class="seq-h"><strong>Outside material</strong></p><p>Absence analysis needs a list of what should be present. MANIFST looked in your content first and found it: four scenarios, eight participants and three hypotheses. Nothing was gathered from outside, so there was nothing for you to approve.</p></div>' });
      S.prepare.forEach(function (x) { b.push({ role: 'work', html: runRow(j, x, 'your content') }); });
      b.push({ html: '<h3 class="substep">5.3 Analyse the material</h3>' });
      S.analyse.forEach(function (x) { b.push({ role: 'work', html: runRow(j, x, 'your content') }); });
    } else if (i === 5) {
      var ck = j.ck17;
      b.push({ role: 'work', html: '<p>MANIFST checked the findings from step 5. It confirmed the quotes, looked for evidence against the findings, and tested how easily they change.</p>' });
      b.push({ role: 'work', html: '<div class="run"><div class="rh"><strong><a href="/catalogue/check-extracted-results/ck-17/">Quote check</a></strong><span class="pill">looked at: the findings from step 5</span></div><p>MANIFST found ' + ck.checked + ' quoted phrases in the nine results. ' + (ck.checked - ck.failed.length) + ' match your content word for word. The other ' + ck.failed.length + ' are the techniques\' own wording and not quotes from a participant, so no quote was wrong.</p><p class="small">The ' + ck.failed.length + ' phrases: ' + ck.failed.map(function (f) { return '"' + esc(f.span) + '"'; }).join(', ') + '.</p></div>', tally: ['t-run', S.frame.length + S.prepare.length + S.analyse.length + S.check.length] });
      S.check.filter(function (x) { return x.id !== 'CK-17'; }).forEach(function (x) { b.push({ role: 'work', html: runRow(j, x, 'the findings from step 5') }); });
      b.push({ role: 'work', html: '<div class="run"><div class="rh"><strong>Count check</strong></div><p>One result reported how many ratings went against each hypothesis. MANIFST counted the table again and got the same numbers.</p></div>' });
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
        b.push({ role: 'work', html: '<div class="stage"><h3>Checks on ' + link(c) + '</h3><ul>' + lis + '</ul></div>', tally: ['t-person', Object.keys(needed).length] });
      });
      b.push({ role: 'work', html: '<p class="result">One check needs a person and was not done. It is listed in your report.</p>' });
    } else if (i === 6) {
      var sy = j.synthesis, T = sy.techniques;
      b.push({ role: 'work', html: '<p>MANIFST compared what the techniques found and wrote the conclusions. It used an agreement table and then a written summary.</p>' });
      var head = '<tr><th>Conclusion</th>' + T.map(function (t) { return '<th>' + esc(t) + '</th>'; }).join('') + '</tr>';
      var body = sy.conclusions.map(function (c) { return '<tr><th scope="row">' + esc(c.id) + '</th>' + T.map(function (t) { var v = c.cells[t] || 'S'; return '<td class="cell-' + v + '" title="' + esc(sy.legend[v]) + '">' + ({ D: 'C', S: 'N' }[v] || v) + '</td>'; }).join('') + '</tr>'; }).join('');
      b.push({ role: 'work', html: '<h3>Agreement table</h3><div class="table-wrap"><table class="matrix"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div><p class="small">Each column is a technique. A: it agrees with the conclusion. P: it partly agrees. C: it conflicts. N: it does not cover it.</p>' });
      sy.conclusions.forEach(function (c) {
        b.push({ role: 'work', html: '<div class="concl"><div class="rh"><strong>' + esc(c.id) + '</strong><span class="pill conf-' + c.label + '">' + esc(sentence(c.label)) + ' confidence</span></div><p>' + esc(c.text) + '</p><p class="small"><strong>Reason.</strong> ' + esc(c.reason) + '</p></div>' });
      });
    } else if (i === 7) {
      var a = j.synthesis.answer;
      b.push({ role: 'output', html: '<h3>Answer</h3><p class="lead-answer">' + esc(a.lead) + '</p>' });
      a.paragraphs.forEach(function (p) { b.push({ role: 'output', html: '<p>' + esc(p) + '</p>' }); });
      var need = CLAIM_ORDER.indexOf(j.claim), reach = j.picks.slice(0, 10).filter(function (p) { return CLAIM_ORDER.indexOf(p.ceiling) >= need; });
      var supported = j.synthesis.conclusions.filter(function (c) { return reach.some(function (p) { return c.cells[p.id] === 'A' || c.cells[p.id] === 'P'; }); }).map(function (c) { return c.id; });
      b.push({ role: 'output', html: '<h3>How strong a statement this supports</h3><p>You needed to ' + esc(CLAIM_PLAIN[j.claim]) + '. ' + (reach.length ? reach.length + ' of the chosen techniques can support that: ' + reach.map(link).join(', ') + '. They support conclusions ' + esc(supported.join(', ')) + '.' : 'None of the chosen techniques can support that.') + '</p>' });
      b.push({ role: 'output', html: '<h3>What the answer is based on</h3>' });
      var basis = [
        'Material given: one document (Voice AI interview study), ' + j.source.words + ' words. It contains three hypotheses and ten quotes (Q1 to Q10) from eight participants (P1, P2, P3, P4, P5, P8, P9, P10). The material does not say how the quotes were chosen.',
        'Outside material used: none. The list of what should be present, which CM1-14 needs, came from your content.',
        'Techniques run, and what each worked on: FQ-03 and DM-02 (the request); HE1-02, CM1-05, CM1-14, HE1-14 and TC1-13 (the material); CK-17 by code, TC1-16 and TC1-17 (the findings of the analysis).',
        'Checks done: quotation check by code (' + j.ck17.checked + ' quoted spans, ' + (j.ck17.checked - j.ck17.failed.length) + ' matched, ' + j.ck17.failed.length + ' phrases read by hand); recount of the competing hypotheses table by code; assumption and limitation sections and alternative explanations sections present in all nine results.',
        'Checks not done because they need a person: human review sample (framework analysis).',
        'Your question after step 5.1: kept as submitted.',
        'Run notes: five results ran over the 450 word limit given to the agents (CM1-14, HE1-14, TC1-13, TC1-16, TC1-17). Techniques dropped: none. Files that could not be read: none.'
      ];
      basis.forEach(function (x) { b.push({ role: 'output', html: '<div class="row1">' + esc(x) + '</div>', fast: true }); });
      b.push({ role: 'input', html: '<div class="confirm"><h3>Do you want a follow-up round?</h3><p>MANIFST would then choose more techniques for the gaps and unresolved conflicts above (the H2 and H3 verdicts depend on definitions, and nothing is known about P8 and P9). Kept for a follow-up round: ' + j.held.map(link).join(', ') + '. A follow-up round adds up to 5 techniques.</p><div class="form-actions"><button type="button" class="btn" disabled title="Not available in this replay">Ask for a follow-up round</button></div></div>' });
      b.push({ html: '<p class="result">End of the run.</p>' });
    }
    return b;
  }

  function builders_gates(j) {
    var b = [], left = j.total;
    b.push({ role: 'work', html: '<p>MANIFST has ' + j.total + ' analysis techniques. It ruled out the ones that cannot work on your content. Each technique is counted once, under the first reason that rules it out.</p>' });
    Object.keys(j.removed).forEach(function (g) {
      left -= j.removed[g];
      b.push({ role: 'work', html: '<div class="gate"><span class="g">' + esc(WHY[g] || prop(g)) + '</span><span class="meter"><i style="width:' + Math.round(j.removed[g] / j.total * 100) + '%"></i></span><span class="r">' + j.removed[g] + ' set aside</span><span class="l">' + left + ' left</span></div>', tally: ['t-pass', left] });
    });
    b.push({ role: 'work', html: '<p class="result">MANIFST ruled out <strong>' + (j.total - j.passed) + '</strong> techniques that cannot work on your content, which leaves <strong>' + j.passed + '</strong>.' + (j.claim === 'describe' ? '' : ' Of those, <strong>' + j.reach_claim + '</strong> can support a conclusion at the strength you asked for, which is to ' + esc(CLAIM_PLAIN[j.claim]) + ', or stronger. The other ' + (j.passed - j.reach_claim) + ' can only describe.') + '</p>', tally: ['t-pass', j.passed] });
    return b;
  }
  function builders_pick(j) {
    var b = [];
    b.push({ role: 'work', html: '<p>MANIFST went through the ' + j.passed + ' techniques that can work on your content and chose ' + Math.min(10, j.picks.length) + ' for your question. Each one is listed with the reason it was chosen.</p>' });
    j.picks.slice(0, 10).forEach(function (p, n) {
      b.push({ role: 'work', html: '<div class="pick"><span class="no">' + (n + 1) + '</span><div><strong>' + link(p) + '</strong><p>' + esc(plainReason(p.reason)) + '</p></div></div>', tally: ['t-pick', n + 1] });
    });
    if (j.held.length) b.push({ role: 'work', html: '<p class="small"><strong>Also suitable, kept for a follow-up round:</strong> ' + j.held.map(link).join(', ') + '.</p>' });
    if (j.gaps) b.push({ role: 'work', html: '<details><summary>What these techniques may not cover</summary><p>' + esc(j.gaps) + '</p></details>' });
    return b;
  }

  function makePanel(role, by) {
    var p = document.createElement('div'); p.className = 'panel panel-' + role;
    var l = document.createElement('div'); l.className = 'panel-label';
    l.textContent = role === 'input' ? 'Your input' : role === 'output' ? 'Output: your report' : 'What MANIFST did';
    p.appendChild(l); return p;
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
      out.appendChild(sec);
    }
    if (i > 0) sec.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    var wrap = document.createElement('div'); sec.appendChild(wrap);
    var blocks = builders(i), k = 0, panel = null, prevKey = null;
    return (function next() {
      if (k >= blocks.length) { bar.style.width = '100%'; return Promise.resolve(true); }
      var blk = blocks[k++], d = document.createElement('div');
      d.className = 'rv'; d.innerHTML = blk.html;
      var key = blk.role ? blk.role + '|' + (blk.by || '') : null;
      if (!key) panel = null;
      else if (key !== prevKey || !panel) { panel = makePanel(blk.role, blk.by); wrap.appendChild(panel); }
      prevKey = key; (panel || wrap).appendChild(d);
      if (blk.tally) setTally(blk.tally[0], blk.tally[1]);
      bar.style.width = Math.round(k / blocks.length * 100) + '%';
      if (blk.confirm) {
        return new Promise(function (resolve) {
          var keep = d.querySelector('[data-keep]');
          var ban = document.createElement('p'); ban.className = 'ask-banner'; ban.setAttribute('role', 'status');
          ban.innerHTML = '<strong>MANIFST is waiting for your answer.</strong> <button type="button" class="btn">Go to the question</button>';
          function go() { d.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); keep.focus({ preventScroll: true }); }
          ban.querySelector('button').addEventListener('click', go);
          out.insertBefore(ban, out.firstChild);
          steps[i].classList.add('ask'); steps[i].querySelector('.st').textContent = (job.status || {})['waiting for you']; title.textContent = (i + 1) + '. ' + NAMES[i] + ': ' + ((job.status || {})['waiting for you'] || 'waiting for you');
          setTimeout(go, 150);
          keep.addEventListener('click', function () {
            keep.disabled = true; keep.textContent = 'Question kept';
            if (ban.parentNode) ban.parentNode.removeChild(ban);
            steps[i].classList.remove('ask'); steps[i].querySelector('.st').textContent = (job.status || {})['running']; title.textContent = (i + 1) + '. ' + NAMES[i];
            resolve(t === token);
          });
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
