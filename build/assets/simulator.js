(function () {
  var DATA = JSON.parse(document.getElementById('sim-data').textContent);
  var $ = function (id) { return document.getElementById(id); };
  var out = $('sim-out'), title = $('sim-title'), bar = $('sim-bar');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.sim-steps li'));
  var NAMES = ['Intake', 'Gates', 'Pick', 'Sequence', 'Apply', 'Check', 'Synthesise', 'Answer basis and review'];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var job, done, current, running, token, cache;

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
    $('sim-note').innerHTML = job.real ? NOTES.real : NOTES.rec;
    steps.forEach(function (_, i) { mark(i, 'wait'); });
    title.textContent = 'Ready'; bar.style.width = '0';
    out.innerHTML = '<p class="small">Selected: <strong>' + esc(job.name) + '</strong>. Select Run, or step through with Next step.</p>';
    resetTally(); setTally('t-cat', job.total);
    $('sim-run').disabled = false; $('sim-step').disabled = false;
  }

  // Each step builds an array of "blocks": {html, pause}. Blocks appear one at a time inside a wrapper.
  var NOTES = {
    real: '<strong>This is an actual run.</strong> The scripts ran intake, the gates and sequencing on the material. Claude picked the techniques, and each technique ran as a separate agent on the brief and the material (stage 3 techniques ran on the findings). The quotation check and the matrix recount ran as code. <strong>Limits.</strong> The request wording, stakes, strongest claim needed, insight wanted and privacy answer were set by Claude from the recommended defaults and were not given by the user. The human review sample was not done because it needs a person. Selecting Run replays the stored output with a loading delay. Nothing is computed in your browser.',
    rec: '<strong>What is real here.</strong> Gate counts, stages, checks and the answer basis are the output of the process scripts on this recorded test job. The picks and their reasons are the model\'s picks from the recorded test run. <strong>What is not.</strong> No technique has run on the test material, so the simulator shows the form of each result and not findings, and it produces no confidence labels.'
  };

  function builders(i) {
    if (job.real) return realBuilders(i);
    var j = job, b = [];
    if (i === 0) {
      b.push({ html: '<h3>Brief</h3><table class="kv"><tbody>' +
        '<tr><th scope="row">Request</th><td>' + esc(j.name) + '</td></tr>' +
        '<tr><th scope="row">Claim level needed</th><td>' + esc(j.claim) + '</td></tr>' +
        '<tr><th scope="row">Stakes tier</th><td>' + esc(j.stakes) + '</td></tr>' +
        '<tr><th scope="row">Insight wanted</th><td>' + esc(j.insight.join(', ') || 'Not set') + '</td></tr></tbody></table>' });
      var keys = Object.keys(j.profile), rows = '';
      b.push({ html: '<h3>Material profile</h3><p class="small">In this recorded job the profile was written by hand. In a live run <code>intake.py</code> builds it from the user\'s input and asks up to four questions about gaps.</p>' });
      keys.forEach(function (k) { b.push({ html: '<div class="row2"><span>' + esc(sentence(k)) + '</span><span>' + esc(list(j.profile[k])) + '</span></div>', fast: true }); });
    } else if (i === 1) {
      b.push({ html: '<p>The gates remove techniques that cannot run on this material. Security classification and licence are not used.</p>' });
      var left = j.total;
      Object.keys(j.removed).forEach(function (g) {
        left -= j.removed[g];
        b.push({ html: '<div class="gate"><span class="g">' + esc(sentence(g)) + '</span><span class="meter"><i style="width:' + Math.round(j.removed[g] / j.total * 100) + '%"></i></span><span class="r">removes ' + j.removed[g] + '</span><span class="l">' + left + ' left</span></div>', tally: ['t-pass', left] });
      });
      b.push({ html: '<p class="result"><strong>' + j.passed + ' of ' + j.total + '</strong> techniques passed all gates. <strong>' + j.reach_claim + '</strong> of them reach the claim level needed (' + esc(j.claim) + '). The claim level only raises a warning when none does. It never removes a technique.</p>', tally: ['t-pass', j.passed] });
    } else if (i === 2) {
      b.push({ html: '<p>The model reads a one-line index of the ' + j.passed + ' techniques that passed and picks at most 10, in priority order. These picks are from the recorded test run, not made live.</p>' });
      j.picks.slice(0, 10).forEach(function (p, n) {
        b.push({ html: '<div class="pick"><span class="no">' + (n + 1) + '</span><div><strong>' + link(p) + '</strong><p>' + esc(p.reason) + '</p></div></div>', tally: ['t-pick', n + 1] });
      });
      if (j.held.length) b.push({ html: '<p class="small"><strong>Held for review:</strong> ' + j.held.map(link).join(', ') + '. Offered first if the user asks for another round.</p>' });
      if (j.gaps) b.push({ html: '<details><summary>Gaps the model reported for this job</summary><p>' + esc(j.gaps) + '</p></details>' });
    } else if (i === 3) {
      var S = j.stages, n = 0;
      var cols = [['0 Frame', S.frame], ['1 Prepare', S.prepare], ['2 Analyse', S.analyse], ['3 Check', S.check]];
      b.push({ html: '<p>Stage rules decide the order. Techniques inside the analyse stage are independent, so their order does not matter. Preparation steps are added when a pick needs prepared material or the material holds personal information.</p>' });
      cols.forEach(function (c) {
        n += c[1].length;
        b.push({ html: '<div class="stage"><h3>' + esc(c[0]) + '</h3>' + (c[1].length ? '<ul>' + c[1].map(function (x) { return '<li>' + link(x) + (x.note ? ' <span class="pill">added: ' + esc(x.note) + '</span>' : '') + '</li>'; }).join('') + '</ul>' : '<p class="small">No technique in this stage.</p>') + '</div>', tally: ['t-run', n] });
      });
      if (j.external.length) b.push({ html: '<div class="stage"><h3>External material to gather in stage 1</h3><ul>' + j.external.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' });
    } else if (i === 4) {
      var S2 = j.stages, all = S2.frame.concat(S2.prepare, S2.analyse);
      b.push({ html: '<p>Each technique runs on the brief and the material, never on another technique\'s output. The simulator shows the form each result must take. It does not produce findings.</p>' });
      all.forEach(function (x) {
        b.push({ html: '<div class="run"><div class="rh"><strong>' + link(x) + '</strong><span class="pill">runs on: ' + esc(j.uses[x.id] || 'the brief and the material') + '</span></div><details><summary>Output specification</summary><p>' + esc(j.specs[x.id] || '') + '</p></details></div>' });
      });
    } else if (i === 5) {
      b.push({ html: '<p>Check techniques examine the findings, never the brief. Each analysis result also gets the minimum checks for the stakes tier (' + esc(j.stakes) + ') and the claim level.</p>' });
      j.stages.check.forEach(function (x) {
        b.push({ html: '<div class="run"><div class="rh"><strong>' + link(x) + '</strong><span class="pill">runs on: ' + esc(j.uses[x.id] || 'the findings of the analysis') + '</span></div><details><summary>Output specification</summary><p>' + esc(j.specs[x.id] || '') + '</p></details></div>' });
      });
      var needed = {};
      j.checks.forEach(function (c) {
        var lis = c.list.map(function (k) {
          if (k.person === 'needed') needed[k.code] = 1;
          return '<li>' + esc(k.code) + (k.person === 'needed' ? ' <span class="pill warn">person needed</span>' : k.person === 'conditional' ? ' <span class="pill">person conditional</span>' : k.person === 'optional' ? ' <span class="pill">person optional</span>' : '') + '</li>';
        }).join('');
        b.push({ html: '<div class="stage"><h3>' + link(c) + '</h3><ul>' + lis + '</ul></div>', tally: ['t-person', Object.keys(needed).length] });
      });
      b.push({ html: '<p class="result">Checks that need a person are not done by the process. They are listed in the answer basis as not done.</p>' });
    } else if (i === 6) {
      b.push({ html: '<p>Findings are <strong>' + esc(j.findings_form) + '</strong>. The user chooses a method. The process runs the recommended one if the user does not reply.</p>' });
      j.methods.forEach(function (m) {
        b.push({ html: '<div class="run"><div class="rh"><strong>' + esc(sentence(m.name)) + '</strong>' + (m.recommended ? '<span class="pill">recommended: ' + esc(m.recommended) + '</span>' : '') + (m.condition ? '<span class="pill">' + esc(m.condition) + '</span>' : '') + '</div></div>' });
      });
      b.push({ html: '<h3>Confidence label for each conclusion</h3><div class="table-wrap"><table><thead><tr><th>Label</th><th>Rule</th></tr></thead><tbody><tr><td>High</td><td>Two or more techniques that count as corroboration support the conclusion, and the checks for the stakes tier passed.</td></tr><tr><td>Medium</td><td>One technique supports it and its checks passed, or several support it and a check failed.</td></tr><tr><td>Low</td><td>One technique supports it and it was not checked, or its checks failed.</td></tr></tbody></table></div>' });
      b.push({ html: '<p class="result">Not produced here: no technique has run, so there are no conclusions to label. A challenge finding adds a finding next to the conclusion it examines and does not change the label.</p>' });
    } else if (i === 7) {
      b.push({ html: '<p>The answer states its basis as facts. It does not judge whether the material is representative or sufficient.</p>' });
      j.basis.forEach(function (x) { b.push({ html: '<div class="row1">' + esc(x) + '</div>', fast: true }); });
      b.push({ html: '<h3>Review</h3><p>After the synthesis the process offers to reassess. The user decides. If they accept, the process selects again for the gaps, silences and conflicts the synthesis found, leaves out techniques already run, and adds at most 5 more.' + (j.held.length ? ' Held back by the limit: ' + j.held.map(link).join(', ') + '.' : '') + '</p>' });
      b.push({ html: '<p class="result">End of the simulated run for <strong>' + esc(j.name) + '</strong>.</p>' });
    }
    return b;
  }


  var STAKES = [
    ['exploratory', 'The result decides what to look at next. A wrong result costs little and is corrected before anyone relies on it.'],
    ['decision-informing', 'The result is one input to a decision that can be reversed or revisited at moderate cost.'],
    ['high-stakes', 'The decision is costly or hard to reverse, affects rights, safety or finances, or the result will be published as authoritative.']
  ];
  var CLAIMS = [
    ['describe', 'Summarise what is in the material.'],
    ['associate', 'Show that things go together, without saying why.'],
    ['predict without implying cause', 'Forecast or classify new cases from patterns.'],
    ['estimate an intervention effect', 'Estimate how an outcome changes when something is done.'],
    ['explain mechanism or counterfactual', 'Say how or why, or what would have happened otherwise.']
  ];
  function scale(levels, sel) {
    return '<ol class="scale">' + levels.map(function (l, n) {
      var on = l[0] === sel;
      return '<li' + (on ? ' class="on" aria-current="true"' : '') + '><span class="sn">' + (n + 1) + '</span><span class="sl">' + esc(sentence(l[0])) + (on ? ' <span class="pill">selected</span>' : '') + '</span><span class="sd">' + esc(l[1]) + '</span></li>';
    }).join('') + '</ol>';
  }
  function assumed(basis) { return basis === 'stated' ? '' : ' <span class="pill warn">assumed, not confirmed by the user</span>'; }
  function res(j, id) { return '<details class="resbox" open><summary>Result</summary><div class="result-md">' + (j.results_html[id] || '') + '</div></details>'; }
  function runRow(j, x, uses) { return '<div class="run"><div class="rh"><strong>' + link(x) + '</strong><span class="pill">runs on: ' + esc(uses) + '</span></div>' + res(j, x.id) + '</div>'; }

  function realBuilders(i) {
    var j = job, b = [], S = j.stages, bm = j.basis_map;
    if (i === 0) {
      b.push({ html: '<h3>Request</h3><p>' + esc(j.request) + '</p>' });
      b.push({ html: '<h3>Submitted content</h3><p><a href="/simulator/material/">Voice AI interview study</a> (1 document, ' + j.source.words + ' words). <a href="/simulator/material/">Open the submitted content</a>.</p>' });
      b.push({ html: '<h3>Stakes</h3><p class="small">What the result will be used for. Higher stakes add more checks.</p>' + scale(STAKES, j.stakes) });
      b.push({ html: '<h3>Strongest claim needed</h3><p class="small">The strongest statement the answer has to be able to make. It adds checks and shows how many techniques can reach it.</p>' + scale(CLAIMS, j.claim) });
      b.push({ html: '<h3>Insight wanted</h3><p>' + esc(j.insight.join(' and ')) + '</p><p class="small">Pattern: what repeats across the material. Contradiction: where statements conflict.</p>' });
      b.push({ html: '<h3>Material profile</h3><p class="small">Facts about the content that decide which techniques can run.</p>' });
      Object.keys(j.profile).forEach(function (k) { b.push({ html: '<div class="row2"><span>' + esc(sentence(k)) + '</span><span>' + esc(list(j.profile[k])) + '</span></div>', fast: true }); });
    } else if (i === 1) {
      return builders_gates(j);
    } else if (i === 2) {
      return builders_pick(j);
    } else if (i === 3) {
      var n = 0;
      b.push({ html: '<p>Stage rules decide the order. Techniques in the analyse stage are independent of each other. No personal information was found, so no de-identification step was added.</p>' });
      [['0 Frame', S.frame], ['1 Prepare', S.prepare], ['2 Analyse', S.analyse], ['3 Check', S.check]].forEach(function (c) {
        n += c[1].length;
        b.push({ html: '<div class="stage"><h3>' + esc(c[0]) + '</h3><ul>' + c[1].map(function (x) { return '<li>' + link(x) + '</li>'; }).join('') + '</ul></div>', tally: ['t-run', n] });
      });
      b.push({ html: '<div class="stage"><h3>External material to gather in stage 1</h3><ul><li>CM1-14 needs a reference structure. <strong>Resolved from the material:</strong> the material states four scenarios, eight participants and three hypotheses, and that was used. Nothing was gathered from outside.</li></ul></div>' });
    } else if (i === 4) {
      b.push({ html: '<p>Each technique ran as a separate agent that saw only the brief, the material and its own technique record. Results are shown as written. Each result is shown in full below its technique.</p>' });
      S.frame.concat(S.prepare, S.analyse).forEach(function (x) { b.push({ html: runRow(j, x, 'the brief and the material') }); });
    } else if (i === 5) {
      var ck = j.ck17;
      b.push({ html: '<p>Check techniques ran on the findings of the seven analyses. The source-span check ran as code.</p>' });
      b.push({ html: '<div class="run"><div class="rh"><strong><a href="/catalogue/check-extracted-results/ck-17/">CK-17 Source-span and quotation check by code</a></strong><span class="pill">runs on: the findings of the analysis</span></div><p class="small">' + ck.checked + ' double-quoted spans found in the nine results. ' + (ck.checked - ck.failed.length) + ' matched the source text. ' + ck.failed.length + ' did not match and were read by hand: ' + ck.failed.map(function (f) { return esc(f.file) + ' "' + esc(f.span) + '"'; }).join(', ') + '. These are the analysts\' own phrases in quotation marks and were not attributed to a participant, so no quotation failed.</p></div>', tally: ['t-run', S.frame.length + S.prepare.length + S.analyse.length + S.check.length] });
      S.check.filter(function (x) { return x.id !== 'CK-17'; }).forEach(function (x) { b.push({ html: runRow(j, x, 'the findings of the analysis') }); });
      b.push({ html: '<div class="run"><div class="rh"><strong>Matrix recount by code</strong></div><p class="small">The competing hypotheses result states that H1 has three inconsistent ratings and H1r four, H2 and H2r one each, H3 three and H3r none. Counting the cells in its table by code gave the same figures.</p></div>' });
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
        b.push({ html: '<div class="stage"><h3>Checks on ' + link(c) + '</h3><ul>' + lis + '</ul></div>', tally: ['t-person', Object.keys(needed).length] });
      });
      b.push({ html: '<p class="result">Checks that need a person were not done. They are listed in the answer basis.</p>' });
    } else if (i === 6) {
      var sy = j.synthesis, T = sy.techniques;
      b.push({ html: '<p>' + esc(sy.method) + '</p>' });
      var head = '<tr><th>Conclusion</th>' + T.map(function (t) { return '<th>' + esc(t) + '</th>'; }).join('') + '</tr>';
      var body = sy.conclusions.map(function (c) { return '<tr><th scope="row">' + esc(c.id) + '</th>' + T.map(function (t) { var v = c.cells[t] || 'S'; return '<td class="cell-' + v + '" title="' + esc(sy.legend[v]) + '">' + v + '</td>'; }).join('') + '</tr>'; }).join('');
      b.push({ html: '<h3>Convergence matrix</h3><div class="table-wrap"><table class="matrix"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div><p class="small">A agrees. P partly agrees. D dissonant. S silent.</p>' });
      sy.conclusions.forEach(function (c) {
        b.push({ html: '<div class="concl"><div class="rh"><strong>' + esc(c.id) + '</strong><span class="pill conf-' + c.label + '">' + esc(sentence(c.label)) + ' confidence</span></div><p>' + esc(c.text) + '</p><p class="small"><strong>Reason.</strong> ' + esc(c.reason) + '</p></div>' });
      });
    } else if (i === 7) {
      var a = j.synthesis.answer;
      b.push({ html: '<h3>Answer</h3><p class="lead-answer">' + esc(a.lead) + '</p>' });
      a.paragraphs.forEach(function (p) { b.push({ html: '<p>' + esc(p) + '</p>' }); });
      b.push({ html: '<h3>Basis (facts only)</h3>' });
      var basis = [
        'Material given: one document (Voice AI interview study), ' + j.source.words + ' words. It contains three hypotheses and ten quotes (Q1 to Q10) from eight participants (P1, P2, P3, P4, P5, P8, P9, P10). The material does not say how the quotes were chosen.',
        'External material gathered: none. The reference structure for CM1-14 was taken from the material.',
        'Techniques run, and what each used: FQ-03, DM-02, HE1-02, CM1-05, CM1-14, HE1-14 and TC1-13 (the brief and the material); CK-17 by code, TC1-16 and TC1-17 (the findings of the analysis).',
        'Checks done: source-span check by code (' + j.ck17.checked + ' quoted spans, ' + (j.ck17.checked - j.ck17.failed.length) + ' matched, ' + j.ck17.failed.length + ' phrases read by hand); recount of the competing hypotheses matrix by code; assumption and limitation sections and alternative explanations sections present in all nine results.',
        'Checks not done because they need a person: human review sample (framework analysis).',
        'Run notes: five results ran over the 450 word limit given to the agents (CM1-14, HE1-14, TC1-13, TC1-16, TC1-17). Techniques dropped: none. Files that could not be read: none.'
      ];
      basis.forEach(function (x) { b.push({ html: '<div class="row1">' + esc(x) + '</div>', fast: true }); });
      b.push({ html: '<h3>Review</h3><p>The user can ask for another round. The process would then select again for the silences and conflicts above (the H2 and H3 verdicts depend on definitions, and nothing is known about P8 and P9). Held back by the limit of 10: ' + j.held.map(link).join(', ') + '. At most 5 more techniques per round.</p>' });
      b.push({ html: '<p class="result">End of the run.</p>' });
    }
    return b;
  }

  function builders_gates(j) {
    var b = [], left = j.total;
    b.push({ html: '<p>The gates remove techniques that cannot run on this material. Security classification and licence are not used.</p>' });
    Object.keys(j.removed).forEach(function (g) {
      left -= j.removed[g];
      b.push({ html: '<div class="gate"><span class="g">' + esc(sentence(g)) + '</span><span class="meter"><i style="width:' + Math.round(j.removed[g] / j.total * 100) + '%"></i></span><span class="r">removes ' + j.removed[g] + '</span><span class="l">' + left + ' left</span></div>', tally: ['t-pass', left] });
    });
    b.push({ html: '<p class="result"><strong>' + j.passed + ' of ' + j.total + '</strong> techniques passed all gates. <strong>' + j.reach_claim + '</strong> of them reach the claim level needed (' + esc(j.claim) + '). The claim level only raises a warning when none does.</p>', tally: ['t-pass', j.passed] });
    return b;
  }
  function builders_pick(j) {
    var b = [];
    b.push({ html: '<p>Claude read a one-line index of the ' + j.passed + ' techniques that passed and picked at most 10, in priority order.</p>' });
    j.picks.slice(0, 10).forEach(function (p, n) {
      b.push({ html: '<div class="pick"><span class="no">' + (n + 1) + '</span><div><strong>' + link(p) + '</strong><p>' + esc(p.reason) + '</p></div></div>', tally: ['t-pick', n + 1] });
    });
    if (j.held.length) b.push({ html: '<p class="small"><strong>Held for review:</strong> ' + j.held.map(link).join(', ') + '.</p>' });
    if (j.gaps) b.push({ html: '<details><summary>Gaps reported for this job</summary><p>' + esc(j.gaps) + '</p></details>' });
    return b;
  }

  function runStep(i) {
    var t = token;
    current = i; mark(i, 'run');
    title.textContent = (i + 1) + '. ' + NAMES[i];
    bar.style.width = '0';
    if (i === 0) out.innerHTML = '';
    var sec = document.createElement('section'); sec.className = 'stepblock'; sec.id = 'sim-step-' + i;
    var hd = document.createElement('h3'); hd.className = 'stephead'; hd.textContent = (i + 1) + '. ' + NAMES[i]; sec.appendChild(hd);
    var wrap = document.createElement('div'); sec.appendChild(wrap); out.insertBefore(sec, out.firstChild);
    var blocks = builders(i), k = 0;
    return (function next() {
      if (k >= blocks.length) { bar.style.width = '100%'; return Promise.resolve(true); }
      var blk = blocks[k++], d = document.createElement('div');
      d.className = 'rv'; d.innerHTML = blk.html; wrap.appendChild(d);
      if (blk.tally) setTally(blk.tally[0], blk.tally[1]);
      bar.style.width = Math.round(k / blocks.length * 100) + '%';
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
  function setBusy(b) { $('sim-run').disabled = b || done >= NAMES.length - 1; $('sim-step').disabled = b || done >= NAMES.length - 1; }

  $('sim-job').addEventListener('change', reset);
  $('sim-reset').addEventListener('click', function () { reset(); });
  $('sim-step').addEventListener('click', function () { stepOnce().then(function () { setBusy(false); }); });
  $('sim-run').addEventListener('click', runAll);
  steps.forEach(function (li, i) { li.querySelector('button').addEventListener('click', function () { show(i); }); });
  reset();
})();
