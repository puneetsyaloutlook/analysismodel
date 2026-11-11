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
    steps.forEach(function (_, i) { mark(i, 'wait'); });
    title.textContent = 'Ready'; bar.style.width = '0';
    out.innerHTML = '<p class="small">Selected: <strong>' + esc(job.name) + '</strong>. Select Run, or step through with Next step.</p>';
    resetTally(); setTally('t-cat', job.total);
    $('sim-run').disabled = false; $('sim-step').disabled = false;
  }

  // Each step builds an array of "blocks": {html, pause}. Blocks appear one at a time inside a wrapper.
  function builders(i) {
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

  function runStep(i) {
    var t = token;
    current = i; mark(i, 'run');
    title.textContent = (i + 1) + '. ' + NAMES[i];
    bar.style.width = '0';
    var wrap = document.createElement('div'); out.innerHTML = ''; out.appendChild(wrap);
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
      mark(i, 'done'); done = i; cache[i] = wrap.innerHTML; return true;
    });
  }

  function show(i) {
    if (running || !cache[i]) return;
    title.textContent = (i + 1) + '. ' + NAMES[i]; out.innerHTML = '<div class="static">' + cache[i] + '</div>'; bar.style.width = '100%';
    steps.forEach(function (li, n) { li.querySelector('button').toggleAttribute('data-view', n === i); });
  }

  function stepOnce() {
    if (running || done >= NAMES.length - 1) return Promise.resolve();
    running = true; setBusy(true);
    return runStep(done + 1).then(function () { running = false; setBusy(false); });
  }
  function runAll() {
    if (running) return;
    var t = token; running = true; setBusy(true);
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
