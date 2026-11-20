(function () {
  function openAncestors(el) {
    for (var n = el; n; n = n.parentElement) if (n.tagName === 'DETAILS') n.open = true;
  }
  function go(id) {
    var el = document.getElementById(id);
    if (!el) return;
    openAncestors(el);
    el.scrollIntoView({ block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }
  document.querySelectorAll('[data-open]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); go(a.getAttribute('data-open')); });
  });
  document.querySelectorAll('[data-all]').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('data-all') === 'open';
      document.querySelectorAll('.rf-find').forEach(function (d) { d.open = open; });
      if (open) document.querySelectorAll('.rf-group').forEach(function (d) { d.open = true; });
    });
  });
  if (location.hash) go(location.hash.slice(1));

  var q = document.getElementById('rf-q'), st = document.getElementById('rf-st'), shown = document.getElementById('rf-shown');
  function filter() {
    var t = (q.value || '').toLowerCase().trim(), s = st.value, total = 0, active = !!(t || s);
    document.querySelectorAll('.rf-fam').forEach(function (f) {
      var n = 0;
      f.querySelectorAll('tbody tr').forEach(function (r) {
        var ok = (!t || r.getAttribute('data-q').indexOf(t) > -1) && (!s || r.getAttribute('data-st') === s);
        r.hidden = !ok; if (ok) n++;
      });
      f.hidden = n === 0;
      if (active && n) f.open = true;
      total += n;
    });
    shown.textContent = active ? total + ' of 236 techniques shown' : '';
  }
  if (q && st) { q.addEventListener('input', filter); st.addEventListener('change', filter); }
})();
