(function () {
  var data = JSON.parse(document.getElementById('mp-data').textContent);
  var svg = document.querySelector('.mp-svg');
  var info = document.getElementById('mp-info');
  var nodes = svg.querySelectorAll('.mp-node');
  var edges = svg.querySelectorAll('.mp-edge');
  var sel = null;
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function names(ids) {
    return ids.length ? ids.map(function (i) { return '<a href="#' + i.toLowerCase() + '">' + i + ' ' + esc(data[i].name) + '</a>'; }).join(', ') : 'none';
  }
  function clear() {
    sel = null;
    svg.classList.remove('has-sel');
    nodes.forEach(function (n) { n.classList.remove('sel', 'rel'); n.setAttribute('aria-pressed', 'false'); });
    edges.forEach(function (e) { e.classList.remove('out', 'in'); });
    info.innerHTML = '<p>Select a mechanism to see what it does.</p>';
  }
  function select(id) {
    if (sel === id) { clear(); return; }
    clear();
    sel = id;
    svg.classList.add('has-sel');
    var rel = {};
    rel[id] = true;
    edges.forEach(function (e) {
      if (e.getAttribute('data-from') === id) { e.classList.add('out'); rel[e.getAttribute('data-to')] = true; }
      if (e.getAttribute('data-to') === id) { e.classList.add('in'); rel[e.getAttribute('data-from')] = true; }
    });
    nodes.forEach(function (n) {
      var nid = n.getAttribute('data-id');
      if (nid === id) { n.classList.add('sel'); n.setAttribute('aria-pressed', 'true'); }
      else if (rel[nid]) { n.classList.add('rel'); }
    });
    var d = data[id];
    var uses = Object.keys(data).filter(function (k) { return data[k].used.indexOf(id) >= 0; });
    info.innerHTML = '<h3>' + id + ' ' + esc(d.name) + ' <span class="small">(step ' + d.step + ')</span></h3>' +
      '<p>' + esc(d.what) + '</p><p><strong>Example.</strong> ' + esc(d.example) + '</p>' +
      '<p><strong>Delivered by.</strong> ' + esc(d.by) + '</p>' +
      '<p><strong>Uses the output of.</strong> ' + names(uses) + '</p>' +
      '<p><strong>Used by.</strong> ' + names(d.used) + '</p>';
  }
  nodes.forEach(function (n) {
    n.addEventListener('click', function () { select(n.getAttribute('data-id')); });
    n.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); select(n.getAttribute('data-id')); }
      if (ev.key === 'Escape') { clear(); }
    });
  });
})();
