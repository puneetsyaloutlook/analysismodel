(function () {
  var DATA = JSON.parse(document.getElementById('sim-data').textContent);
  var $ = function (id) { return document.getElementById(id); };
  var out = $('sim-out'), title = $('sim-title'), bar = $('sim-bar');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.sim-steps li'));
  var NAMES = ['Intake', 'Rule out techniques', 'Choose analysis techniques', 'Plan analysis sequence', 'Run the techniques', 'Check the findings', 'Combine the findings', 'Answer'];
  var PROP = { content_type: 'Content type', unit_of_analysis: 'Unit of analysis', access_depth: 'Level of detail available', source_count: 'Number of sources', linkage: 'Whether sources can be joined', volume_class: 'Amount of material', representation: 'Structure', language: 'Language', privacy: 'Personal information', security_classification: 'Security classification', licence: 'Licence', data_condition_flags: 'Known data problems' };
  function prop(k) { return PROP[k] || sentence(k); }
  var WHY = { unit_of_analysis: 'Need a kind of item your content does not have', access_depth: 'Need more detailed data than you gave', source_count: 'Need more than one source', privacy: 'Do not fit the privacy setting of your content', content_type: 'Need a different type of content', linkage: 'Need sources that can be joined', not_for_rules: 'Fail when the content has a feature yours has' };
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
  function resetTally() { ['t-mat', 't-run', 't-add', 't-chk', 't-concl', 't-ins'].forEach(function (k) { setTally(k, '-'); }); setTally('t-run-k', 'techniques run'); setTally('t-chk-k', 'checks done'); }
  function setTallies(list) { list.forEach(function (p) { setTally(p[0], p[1]); }); }

  function mark(i, state) {
    var li = steps[i];
    li.className = state;
    var SS = (job && job.status) || {}; li.querySelector('.st').textContent = state === 'done' ? SS['done'] : state === 'run' ? SS['running'] : SS['waiting to start'];
    if (state === 'run') li.querySelector('button').setAttribute('aria-current', 'step'); else li.querySelector('button').removeAttribute('aria-current');
  }

  function reset() {
    token = (token || 0) + 1; running = false; done = -1; current = -1; cache = {};
    job = DATA.filter(function (d) { return d.id === $('sim-job').value; })[0];
    $('sim-note').innerHTML = '<details><summary>About this run and how to use the simulator</summary>' + NOTES.real + '</details>';
    steps.forEach(function (_, i) { mark(i, 'wait'); });
    bar.style.width = '0';
    submitted = false; title.textContent = '1. Intake';
    out.innerHTML = ''; out.appendChild(intakeForm(job));
    resetTally();
    $('sim-run').disabled = true; $('sim-step').disabled = true;
    $('sim-controls').hidden = true; $('sim-reset-li').hidden = true; $('sim-step').hidden = false; $('sim-run').hidden = false;
  }

  // Each step builds an array of "blocks": {html, pause}. Blocks appear one at a time inside a wrapper.
  var NOTES = {
    real: '<p><strong>What this is.</strong> A replay of one recorded run of startthat.work. The run was made earlier and every result, conclusion and answer was stored, so nothing is calculated in your browser. Changing the form or answering a question below does not change what you see.</p>'
      + '<p><strong>What the run was about.</strong> The question was whether an article on measuring AI transformation by adoption diagnoses its subject accurately, and whether its point of view is valid. The question has two parts. The first, whether the diagnosis is accurate, needs evidence from outside the article. The second, whether the article\'s claims and reasoning hold up, can be answered from the article. The material was the article, about 2,050 words. The result was exploratory, and the strongest statement needed was a description.</p>'
      + '<p><strong>How to use it.</strong> Select Submit on the form to start, or tick the box beside it to move one step at a time. Each step opens below the last. Open any technique to see its result. Where the process would stop and ask you something, such as whether to change your question, it pauses and waits.</p>'
      + '<p><strong>What was decided in place of a person.</strong> This run was made to test the skill, and its author did not answer the questions the process asks. The run kept the two parts of the request and the scope given to each, allowed outside evidence for the first part, kept the question after step 5.1 and chose the agreement table and written summary in step 7. The answer says the request was not confirmed. No person reviewed the results, because checks that need a person apply at high stakes only.</p>'
      + '<p class="small">The run followed version 1.5.1 of the design. It is the first run of the parts of the request, outside evidence in step 5.2 and the conclusion and report techniques in steps 7 and 8.</p>'
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
      '<label class="fl" for="in-request">What question should the analysis answer?</label><textarea id="in-request" rows="4" readonly>' + esc(j.request) + '</textarea>' +
      '<span class="fl">The parts of your request</span><p class="small">startthat.work splits the request into parts and asks, for each, whether your content can answer it or whether it needs evidence from outside. Both answers were accepted for this run.</p><ol class="parts">' + j.parts.map(function (x) { return '<li>' + esc(sentence(x.text)) + ' <span class="pill">' + (x.scope === 'topic' ? 'needs outside evidence' : 'your content can answer it') + '</span></li>'; }).join('') + '</ol>' +
      '<span class="fl">What material should the analysis use?</span><div class="doc"><span class="doc-name">Article on measuring AI adoption</span><span class="small">1 document, ' + j.source.words + ' words</span> <a href="/simulator/material/">Open the submitted content</a></div>' +
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
      d.innerHTML = '<div class="modal-head"><h2 id="mat-title">Submitted content: article on measuring AI adoption</h2><button type="button" class="btn" id="mat-close">Close</button></div><div class="modal-body result-md"></div>';
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
    focusApp(); setTally('t-mat', j.source.words);
    $('sim-controls').hidden = false; $('sim-reset-li').hidden = false;
    if (!stepwise) { $('sim-step').hidden = true; $('sim-run').hidden = true; }
    if (stepwise) { stepOnce().then(function () { setBusy(false); }); } else { runAll(); }
  }

  function assumed(basis) { return basis === 'stated' ? '' : ' <span class="pill warn">assumed, not confirmed by the user</span>'; }
  function sub(title, n) { return '<h3 class="substep"><span class="ret" aria-hidden="true">\u21b3</span> ' + esc(title) + ' <span class="small">' + n + (n === 1 ? ' technique' : ' techniques') + '</span></h3>'; }
  function runRow(j, x, uses) { return '<details class="acc tech"><summary><span class="ret" aria-hidden="true">\u21b3</span> <span class="tname">' + esc(x.id + ' ' + x.name) + '</span> <span class="pill">looked at: ' + esc(uses) + '</span></summary><div class="acc-body"><p class="small"><a href="' + x.url + '">' + esc(x.id) + ' in the catalogue</a></p><div class="result-md">' + (j.results_html[x.id] || '') + '</div></div></details>'; }

  function realBuilders(i) {
    var j = job, b = [], S = j.stages, bm = j.basis_map;
    if (i === 0) {
      b.push({ role: 'work', html: '<p>startthat.work read your content and noted the facts that decide which techniques can be used on it.</p>' });
      b.push({ role: 'work', html: '<h3>About your content</h3>' });
      Object.keys(j.profile).filter(function (k) { return k !== 'security_classification' && k !== 'licence'; }).forEach(function (k) { b.push({ role: 'work', html: '<div class="row2"><span>' + esc(prop(k)) + '</span><span>' + esc(list(j.profile[k])) + '</span></div>', fast: true }); });
      b.push({ role: 'work', html: '<h3>About your request</h3><p>The request has ' + j.parts.length + ' parts. ' + j.topic_parts + (j.topic_parts === 1 ? ' part is' : ' parts are') + ' about the topic and need evidence from outside your content. Outside evidence was allowed: ' + esc(j.outside_evidence) + '. The scope given to each part was assumed from the wording and was not confirmed by a person.</p>' });
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
      b.push({ role: 'work', html: '<p>startthat.work put the ' + Math.min(10, j.picks.length) + ' chosen techniques in four groups, in the order they will run.</p>' });
      b.push({ role: 'work', html: '<div class="table-wrap"><table class="plan"><thead><tr><th>Technique</th><th>What it does</th><th>Needs an additional source</th></tr></thead><tbody>' + rows + '</tbody></table></div>' });
      b.push({ role: 'work', html: need.length ? '<p>' + need.map(function (x) { return esc(x.name); }).join(' and ') + (need.length > 1 ? ' need an additional source each' : ' needs an additional source') + ' to run. In step 5 startthat.work looks in your material first. Only if the item is missing does startthat.work look elsewhere, and the answer lists every source it used.</p>' : '<p>No technique needs an additional source.</p>' });
    } else if (i === 4) {
      b.push({ role: 'work', html: '<p>startthat.work ran each technique separately on your question and content. Open a technique below to read its result.</p>' });
      b.push({ role: 'work', html: sub('5.1 Examine the question', S.frame.length) });
      S.frame.forEach(function (x) { b.push({ role: 'work', html: runRow(j, x, 'your question') }); });
      b.push({ role: 'input', confirm: true, html: '<div class="confirm"><h3>Do you want to change your question?</h3><p>The technique above examined your question. Open 5.1 above to read what it found, then choose. startthat.work continues when you answer.</p><p class="req">' + esc(j.request) + '</p><div class="form-actions"><button type="button" class="btn primary" data-keep>Keep my question</button><button type="button" class="btn" disabled title="Not available in this replay">Edit my question</button></div></div>' });
      b.push({ role: 'work', html: sub('5.2 Prepare the material', S.prepare.length) });
      b.push({ role: 'work', html: '<div class="seq"><p class="seq-h"><strong>Additional sources</strong></p><p>' + (j.additional.length ? 'Three techniques need something from outside the article, and the first part of the request needs evidence about the world. startthat.work found four sources and recorded what each is used to show. A source that gains from the claim, such as a vendor survey, is used to show what it says. It shows what is true of the world only where a source that does not gain from the claim agrees.' : 'None of the techniques in this plan needs an additional source, so nothing was gathered.') + '</p></div>' });
      j.additional.forEach(function (a, n) { b.push({ role: 'work', html: '<details class="acc tech"><summary><span class="ret" aria-hidden="true">\u21b3</span> <span class="tname">' + esc('Source ' + (n + 1) + ': ' + a.item) + '</span> <span class="pill">' + esc(a.type) + '</span> <span class="pill">' + (a.shows === 'what is true of the world' ? 'shows what is true of the world' : 'shows only what it says') + '</span></summary><div class="acc-body"><p class="small">Used by ' + esc(a.technique) + '. Read as ' + esc(a.read) + (a.code_checkable ? '' : ', so code could not check its wording') + '. <a href="' + esc(a.source) + '">Open the source</a></p><div class="result-md">' + (a.html || '') + '</div></div></details>' }); });
      S.prepare.forEach(function (x) { b.push({ role: 'work', html: runRow(j, x, 'your content') }); });
      b.push({ role: 'work', html: sub('5.3 Analyse the material', S.analyse.length) });
      S.analyse.forEach(function (x) { b.push({ role: 'work', html: runRow(j, x, 'your content') }); });
      var ids = {}; [S.frame, S.prepare, S.analyse, S.check].forEach(function (g) { g.forEach(function (x) { ids[x.id] = 1; }); });
      var dropped = j.picks.filter(function (p) { return !ids[p.id]; }).length;
      b.push({ role: 'work', html: '<p class="result">' + (S.frame.length + S.prepare.length + S.analyse.length) + ' techniques ran in step 5. ' + dropped + ' were dropped.</p>', tally: [['t-run', S.frame.length + S.prepare.length + S.analyse.length], ['t-run-k', 'techniques run, ' + dropped + ' dropped'], ['t-add', j.additional.length]] });
    } else if (i === 5) {
      var ck = j.ck17;
      b.push({ role: 'work', html: '<p>startthat.work checked the findings from step 5. It confirmed the quotes, looked for evidence against the findings, and tested how easily they change.</p>' });
      b.push({ role: 'work', html: '<div class="run"><div class="rh"><strong><a href="/catalogue/check-extracted-results/ck-17/">Quote check</a></strong><span class="pill">looked at: the findings from step 5</span></div><p>startthat.work found ' + ck.checked + ' quoted phrases in the seven results from steps 5.1 to 5.3. ' + (ck.checked - ck.failed.length) + ' match your content word for word. The other ' + ck.failed.length + ' are labels, search terms, shortened phrases or wording from the outside sources that a technique put in quotation marks, and not quotes from the article.</p><p class="small">The ' + ck.failed.length + ' phrases: ' + ck.failed.map(function (f) { return '"' + esc(f.span) + '"'; }).join(', ') + '.</p></div>' });
      S.check.filter(function (x) { return x.id !== 'CK-17'; }).forEach(function (x) { b.push({ role: 'work', html: runRow(j, x, 'the findings from step 5') }); });
      var needed = {}, nChk = 0, nNot = 0;
      j.checks.forEach(function (c) {
        var lis = c.list.map(function (k) {
          var st; if (k.code === 'assumption and limitation statement' || k.code === 'alternative explanations check' || k.code === 'source-span citation' || k.code === 'spot check' || k.code === 'repeat runs') nChk++; else nNot++;
          if (k.code === 'assumption and limitation statement') st = '<span class="pill">present in the result</span>';
          else if (k.code === 'alternative explanations check') st = '<span class="pill">section present, quality not rated</span>';
          else if (k.code === 'source-span citation') st = '<span class="pill">done by code (CK-17)</span>';
          else if (k.code === 'spot check') { var sp = j.spot[c.id]; st = sp ? '<span class="pill">done by code: ' + sp.quotes_checked + ' quotations checked against the article, ' + sp.mismatches.length + ' wrong</span>' : '<span class="pill warn">not done</span>'; }
          else if (k.code === 'repeat runs') { var rp = j.repeat[c.id]; st = rp ? '<span class="pill">done: ' + rp.same + ' of ' + rp.compared + ' labels or categories the same on a second run</span>' : '<span class="pill warn">not done</span>'; }
          else if (k.person === 'needed' || k.person === 'conditional') { st = '<span class="pill warn">not done: person needed</span>'; needed[k.code] = 1; }
          else st = '<span class="pill warn">not done</span>';
          return '<li>' + esc(k.code) + ' ' + st + '</li>';
        }).join('');
        b.push({ role: 'work', html: '<div class="stage"><h3>Checks on ' + link(c) + '</h3><ul>' + lis + '</ul></div>', tally: [['t-chk', nChk], ['t-chk-k', 'checks done' + (nNot ? ', ' + nNot + ' not done' : '')], ['t-run', S.frame.length + S.prepare.length + S.analyse.length + S.check.length]] });
      });
      var rk = Object.keys(j.repeat || {});
      if (rk.length) b.push({ role: 'work', html: '<div class="stage"><h3>Repeat runs</h3><p class="small">The process allows a second run of a technique to see whether it gives the same labels. Two techniques were run a second time, each as a separate agent.</p><ul>' + rk.map(function (id) { var r = j.repeat[id], d = r.different.map(function (x) { return x.join(': '); }).join('; '); return '<li>' + esc(id) + ' <span class="pill' + (r.different.length ? ' warn' : '') + '">' + r.same + ' of ' + r.compared + ' the same on a second run</span><br><span class="small">' + esc(r.note) + (d ? ' Different: ' + esc(d) + '.' : '') + '</span></li>'; }).join('') + '</ul></div>' });
      b.push({ role: 'work', html: '<p class="result">Checks that need a person (human review sample, gold standard agreement) are not in this plan, because the stakes are below high-stakes. No person reviewed the results. At high stakes startthat.work would stop here and ask you to review a sample.</p>' });
    } else if (i === 6) {
      var sy = j.synthesis, T = sy.techniques;
      b.push({ role: 'work', html: '<p>startthat.work compared what the techniques found and wrote the conclusions. It used an agreement table and then a written summary.</p>' });
      if (j.conclude_picks && j.conclude_picks.length) b.push({ role: 'work', html: '<div class="seq"><p class="seq-h"><strong>Techniques for stating the conclusions</strong></p><ul>' + j.conclude_picks.map(function (p) { return '<li>' + link(p) + ': ' + esc(p.reason) + '</li>'; }).join('') + '</ul></div>' });
      var head = '<tr><th>Conclusion</th>' + T.map(function (t) { return '<th>' + esc(t) + '</th>'; }).join('') + '</tr>';
      var body = sy.conclusions.map(function (c) { return '<tr><th scope="row">' + esc(c.title) + '</th>' + T.map(function (t) { var v = c.cells[t] || 'S'; return '<td class="cell-' + v + '" title="' + esc(sy.legend[v]) + '">' + ({ D: 'C', S: 'N' }[v] || v) + '</td>'; }).join('') + '</tr>'; }).join('');
      b.push({ role: 'work', html: '<h3>Agreement table</h3><div class="table-wrap"><table class="matrix"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div><p class="small">Each column is a technique. A: it agrees with the conclusion. P: it partly agrees. C: it conflicts. N: it does not cover it.</p>' });
      sy.conclusions.forEach(function (c) { b.push({ role: 'work', html: conclHtml(c) }); });
      var nWell = sy.conclusions.filter(function (c) { return c.label === 'high'; }).length, nFact = sy.conclusions.filter(function (c) { return c.label === 'none'; }).length;
      b.push({ role: 'work', html: '<p class="result">' + sy.conclusions.length + ' conclusions: ' + nFact + ' facts about the text, ' + nWell + ' well supported and ' + (sy.conclusions.length - nWell - nFact) + ' with weaker support, and ' + (sy.insights ? sy.insights.length : 0) + ' insights.</p>', tally: [['t-concl', sy.conclusions.length - nWell - nFact], ['t-ins', sy.insights ? sy.insights.length : 0]] });
      if (sy.insights && sy.insights.length) {
        b.push({ role: 'work', html: '<h3>Insights</h3>' });
        sy.insights.forEach(function (x) { b.push({ role: 'work', html: insightHtml(x) }); });
      }
    } else if (i === 7) {
      var a = j.answer;
      b.push({ role: 'output', html: '<h3>Summary</h3>' + a.summary.map(function (p, k) { return '<p' + (k === 0 ? ' class="lead-answer"' : '') + '>' + esc(p) + '</p>'; }).join('') });
      var sg = j.fixed.support_groups, lim = ' ' + sg.limit_text;
      var facts = a.conclusions.filter(function (c) { return c.label === 'none'; });
      var well = a.conclusions.filter(function (c) { return c.label === 'high'; });
      var weak = a.conclusions.filter(function (c) { return c.label !== 'high' && c.label !== 'none'; });
      if (facts.length) {
        b.push({ role: 'output', html: '<h3>What the text contains</h3><p class="small">' + esc(j.fixed.text_facts_text + lim) + '</p>' });
        facts.forEach(function (c) { b.push({ role: 'output', html: outConclHtml(c) }); });
        lim = '';
      }
      if (well.length) {
        b.push({ role: 'output', html: '<h3>Well supported conclusions</h3><p class="small">' + esc(sg.well_supported_text + lim) + '</p>' });
        well.forEach(function (c) { b.push({ role: 'output', html: outConclHtml(c) }); });
        lim = '';
      }
      if (weak.length) {
        b.push({ role: 'output', html: '<h3>Conclusions with weaker support</h3><p class="small">' + esc(sg.weaker_text + lim) + '</p>' });
        weak.forEach(function (c) { b.push({ role: 'output', html: outConclHtml(c) }); });
      }
      if (a.insights && a.insights.length) {
        b.push({ role: 'output', html: '<h3>Insights</h3><p class="small">' + esc(j.fixed.insights_text) + '</p>' });
        a.insights.forEach(function (x) { b.push({ role: 'output', html: outInsightHtml(x) }); });
      }
      if (a.not_covered && a.not_covered.length) {
        b.push({ role: 'output', html: '<h3>What was not covered</h3><ul>' + a.not_covered.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' });
      }
      var need = CLAIM_ORDER.indexOf(j.claim), reach = j.picks.slice(0, 10).filter(function (p) { return CLAIM_ORDER.indexOf(p.ceiling) >= need; });
      var supported = j.synthesis.conclusions.filter(function (c) { return reach.some(function (p) { return c.cells[p.id] === 'A' || c.cells[p.id] === 'P'; }); }).map(function (c) { return c.title; });
      var supText = !supported.length ? 'none of the conclusions' : (supported.length === j.synthesis.conclusions.length ? 'all ' + supported.length + ' conclusions' : 'these conclusions: ' + supported.join('; '));
      b.push({ role: 'output', html: '<h3>How strong a statement this supports</h3><p>You needed to ' + esc(CLAIM_PLAIN[j.claim]) + '. ' + (reach.length ? reach.length + ' of the chosen techniques can support that: ' + reach.map(link).join(', ') + '. They support ' + esc(supText) + '.' : 'None of the chosen techniques can support that.') + '</p>' });
      b.push({ role: 'output', html: '<h3>What the answer is based on</h3>' });
      a.basis.forEach(function (x) { b.push({ role: 'output', html: '<div class="row1">' + esc(x) + '</div>', fast: true }); });
      b.push({ role: 'input', html: '<div class="confirm"><h3>Do you want a follow-up round?</h3><p>startthat.work would then choose more techniques for the gaps and unresolved conflicts found in step 7. It would leave out the techniques that already ran. A follow-up round adds up to 5 techniques.</p><div class="form-actions"><button type="button" class="btn" disabled title="Not available in this replay">Ask for a follow-up round</button></div></div>' });
      b.push({ html: '<p class="result">End of the run.</p>' });
    }
    return b;
  }

  function conclHtml(c) {
    return '<div class="concl"><h4 class="ct">' + esc(c.title) + '</h4><p>' + esc(c.text) + '</p><p class="small"><span class="pill conf-' + c.label + '">' + (c.label === 'none' ? 'Fact about the text, no label' : esc(sentence(c.label)) + ' confidence') + '</span></p><p class="small">' + esc(c.reason) + '</p></div>';
  }
  function outConclHtml(c) {
    return '<div class="concl"><h4 class="ct">' + esc(c.title) + '</h4><p>' + esc(c.text) + '</p>' + (c.caveat ? '<p><strong>Why the support is weaker.</strong> ' + esc(c.caveat) + '</p>' : '') + '</div>';
  }
  function outInsightHtml(x) {
    return '<div class="concl"><h4 class="ct">' + esc(x.title) + '</h4><p><strong>You might expect.</strong> ' + esc(x.expected) + '</p><p><strong>The analysis found.</strong> ' + esc(x.found) + '</p><p><strong>Why it matters.</strong> ' + esc(x.why_it_matters) + '</p>' + (x.caveat ? '<p><strong>Why the support is weaker.</strong> ' + esc(x.caveat) + '</p>' : '') + '</div>';
  }
  function insightHtml(x) {
    return '<div class="concl"><h4 class="ct">' + esc(x.title) + '</h4><p><strong>You might expect.</strong> ' + esc(x.expected) + '</p><p><strong>The analysis found.</strong> ' + esc(x.found) + '</p><p><strong>Why it matters.</strong> ' + esc(x.why_it_matters) + '</p><p class="small"><span class="pill conf-' + x.label + '">' + esc(sentence(x.label)) + ' confidence</span></p><p class="small">' + esc(x.reason) + '</p></div>';
  }

  function builders_gates(j) {
    var b = [], left = j.total;
    b.push({ role: 'work', html: '<p>startthat.work has ' + j.total + ' analysis techniques. It ruled out the ones that cannot work on your content. Each technique is counted once, under the first reason that rules it out.</p>' });
    Object.keys(j.removed).forEach(function (g) {
      left -= j.removed[g];
      b.push({ role: 'work', html: '<div class="gate"><span class="g">' + esc(WHY[g] || prop(g)) + '</span><span class="meter"><i style="width:' + Math.round(j.removed[g] / j.total * 100) + '%"></i></span><span class="r">' + j.removed[g] + ' set aside</span><span class="l">' + left + ' left</span></div>' });
    });
    b.push({ role: 'work', html: '<p class="result">startthat.work ruled out <strong>' + (j.total - j.passed) + '</strong> techniques that cannot work on your content, which leaves <strong>' + j.passed + '</strong>.' + (j.claim === 'describe' ? '' : ' Of those, <strong>' + j.reach_claim + '</strong> can support a conclusion at the strength you asked for, which is to ' + esc(CLAIM_PLAIN[j.claim]) + ', or stronger. The other ' + (j.passed - j.reach_claim) + ' can only describe.') + '</p>' });
    return b;
  }
  function builders_pick(j) {
    var b = [];
    b.push({ role: 'work', html: '<p>startthat.work went through the ' + j.passed + ' techniques that can work on your content and chose ' + Math.min(10, j.picks.length) + ' for your question. Each one is listed with the reason it was chosen.</p>' });
    j.picks.slice(0, 10).forEach(function (p, n) {
      b.push({ role: 'work', html: '<div class="pick"><span class="no">' + (n + 1) + '</span><div><strong>' + link(p) + '</strong><p>' + esc(plainReason(p.reason)) + '</p></div></div>', });
    });
    if (j.held.length) b.push({ role: 'work', html: '<p class="small"><strong>Also suitable, kept for a follow-up round:</strong> ' + j.held.map(link).join(', ') + '.</p>' });
    b.push({ role: 'work', html: j.unanswerable.length ? '<p><strong>Parts the techniques cannot answer:</strong> ' + j.unanswerable.map(esc).join('; ') + '</p>' : '<p>Every part of the request can be answered, the second from the article and the first with outside evidence gathered in step 5.2.</p>' });
    if (j.gaps) b.push({ role: 'work', html: '<details><summary>What these techniques may not cover</summary><p>' + esc(j.gaps) + '</p></details>' });
    return b;
  }

  function makePanel(role, by) {
    var p = document.createElement('div'); p.className = 'panel panel-' + role;
    var l = document.createElement('div'); l.className = 'panel-label';
    l.textContent = role === 'input' ? 'Your input' : role === 'output' ? 'Output: your report' : 'What startthat.work did';
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
    var blocks = builders(i), k = 0, panel = null, prevKey = null, cont = wrap;
    return (function next() {
      if (k >= blocks.length) { bar.style.width = '100%'; return Promise.resolve(true); }
      var blk = blocks[k++], d = document.createElement('div');
      if (blk.acc === 'end') { cont = wrap; panel = null; prevKey = null; return next(); }
      d.className = 'rv'; d.innerHTML = blk.html;
      if (blk.acc === 'start') { wrap.appendChild(d); cont = d.querySelector('.acc-body'); panel = null; prevKey = null; return wait(120).then(function (ok) { return ok && t === token ? next() : false; }); }
      var key = blk.role ? blk.role + '|' + (blk.by || '') : null;
      if (!key) panel = null;
      else if (key !== prevKey || !panel) { panel = makePanel(blk.role, blk.by); cont.appendChild(panel); }
      prevKey = key; (panel || cont).appendChild(d);
      if (blk.tally) setTallies(blk.tally);
      bar.style.width = Math.round(k / blocks.length * 100) + '%';
      if (blk.confirm) {
        return new Promise(function (resolve) {
          var keep = d.querySelector('[data-keep]');
          var ban = document.createElement('p'); ban.className = 'ask-banner'; ban.setAttribute('role', 'status');
          ban.innerHTML = '<strong>startthat.work is waiting for your answer.</strong> <button type="button" class="btn">Go to the question</button>';
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
