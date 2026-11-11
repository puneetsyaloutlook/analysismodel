(function () {
  var btn = document.querySelector('.menu-btn');
  var side = document.getElementById('sidebar');
  if (btn) btn.addEventListener('click', function () {
    var open = side.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Keep the current page visible in the sidebar
  var cur = document.querySelector('.side [aria-current=page]');
  if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });

  // Site search
  var q = document.getElementById('q'), box = document.getElementById('results'), index = null, sel = -1;
  function load(cb) {
    if (index) return cb();
    fetch('/assets/search.json').then(function (r) { return r.json(); }).then(function (j) { index = j; cb(); });
  }
  function run() {
    var terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) { box.hidden = true; return; }
    var hits = [];
    index.forEach(function (e) {
      var t = e.t.toLowerCase(), d = (e.d || '').toLowerCase(), g = e.g.toLowerCase(), s = 0;
      for (var i = 0; i < terms.length; i++) {
        var w = terms[i];
        if (t.indexOf(w) > -1) s += 3; else if (g.indexOf(w) > -1) s += 1; else if (d.indexOf(w) > -1) s += 1; else { s = -1; break; }
      }
      if (s > 0) hits.push([s, e]);
    });
    hits.sort(function (a, b) { return b[0] - a[0]; });
    hits = hits.slice(0, 8);
    box.innerHTML = '';
    if (!hits.length) { box.innerHTML = '<li><a href="#" tabindex="-1">No results</a></li>'; box.hidden = false; return; }
    hits.forEach(function (h) {
      var li = document.createElement('li'), a = document.createElement('a');
      a.href = h[1].u;
      a.textContent = h[1].t;
      var sm = document.createElement('small'); sm.textContent = h[1].g;
      a.appendChild(sm); li.appendChild(a); box.appendChild(li);
    });
    sel = -1; box.hidden = false;
  }
  if (q) {
    q.addEventListener('input', function () { load(run); });
    q.addEventListener('keydown', function (e) {
      var links = box.querySelectorAll('a');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!links.length) return;
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        links.forEach(function (l, i) { l.classList.toggle('on', i === sel); });
      } else if (e.key === 'Enter' && sel > -1) { links[sel].click(); }
      else if (e.key === 'Escape') { box.hidden = true; }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.search')) box.hidden = true; });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); }
    });
  }

  // Catalogue filter
  var tf = document.getElementById('tech-filter'), ff = document.getElementById('fam-filter'), tb = document.getElementById('tech-table');
  if (tf && tb) {
    var rows = tb.querySelectorAll('tbody tr'), cnt = document.getElementById('filter-count');
    var apply = function () {
      var terms = tf.value.toLowerCase().split(/\s+/).filter(Boolean), fam = ff.value, n = 0;
      rows.forEach(function (r) {
        var txt = r.textContent.toLowerCase();
        var ok = terms.every(function (t) { return txt.indexOf(t) > -1; }) && (!fam || r.dataset.family === fam);
        r.hidden = !ok; if (ok) n++;
      });
      cnt.textContent = n + ' of ' + rows.length + ' techniques';
    };
    tf.addEventListener('input', apply); ff.addEventListener('change', apply); apply();
  }

  // On this page highlight
  var toc = document.querySelector('.toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = {};
    toc.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('on'); });
          if (links[e.target.id]) links[e.target.id].classList.add('on');
        }
      });
    }, { rootMargin: '-10% 0px -80% 0px' });
    Object.keys(links).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }
})();
