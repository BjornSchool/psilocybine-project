(function(){
  function openFor(){
    var h = location.hash;
    if(!h || h.length < 2) return;
    var el = document.getElementById(decodeURIComponent(h.slice(1)));
    if(!el) return;
    var d = el.closest('details');
    while(d){ d.open = true; d = d.parentElement ? d.parentElement.closest('details') : null; }
    el.scrollIntoView();
  }
  window.addEventListener('hashchange', openFor);
  openFor();
})();
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- tijdlijn ---------- */
  var root = document.getElementById('timeline');
  if(root){
    var items = Array.prototype.slice.call(root.querySelectorAll('.tl-list li'));
    var rail = document.createElement('div'); rail.className = 'tl-rail'; rail.setAttribute('role','tablist'); rail.setAttribute('aria-label','Jaartallen');
    var panel = document.createElement('div'); panel.className = 'tl-panel'; panel.setAttribute('role','tabpanel'); panel.setAttribute('aria-live','polite');
    var nav = document.createElement('div'); nav.className = 'tl-nav';
    var prev = document.createElement('button'); prev.type='button'; prev.className='btn'; prev.textContent = '← Vorige';
    var next = document.createElement('button'); next.type='button'; next.className='btn'; next.textContent = 'Volgende →';
    nav.appendChild(prev); nav.appendChild(next);
    var nodes = [], cur = 0;
    items.forEach(function(li, i){
      var b = document.createElement('button'); b.type='button'; b.setAttribute('role','tab'); b.className = 'tl-node' + (li.dataset.future === '1' ? ' future' : '');
      b.id = 'tl-tab-' + i;
      b.innerHTML = '<span class="tl-year"></span><span class="tl-label"></span>';
      b.querySelector('.tl-year').textContent = li.dataset.year;
      b.querySelector('.tl-label').textContent = li.dataset.label;
      b.addEventListener('click', function(){ show(i, true); });
      b.addEventListener('keydown', function(e){
        if(e.key === 'ArrowRight'){ e.preventDefault(); show(Math.min(i+1, items.length-1), true); nodes[cur].focus(); }
        if(e.key === 'ArrowLeft'){ e.preventDefault(); show(Math.max(i-1, 0), true); nodes[cur].focus(); }
      });
      rail.appendChild(b); nodes.push(b);
    });
    function show(i, center){
      cur = i;
      nodes.forEach(function(n, k){ n.setAttribute('aria-selected', k === i ? 'true' : 'false'); n.tabIndex = (k === i) ? 0 : -1; });
      var li = items[i];
      panel.setAttribute('aria-labelledby', 'tl-tab-' + i);
      panel.innerHTML = '<h5><small></small><span></span></h5>' + li.querySelector('.tl-body').outerHTML + li.querySelector('.tl-src').outerHTML;
      panel.querySelector('small').textContent = li.dataset.year;
      panel.querySelector('h5 span').textContent = li.dataset.label;
      prev.disabled = (i === 0); next.disabled = (i === items.length - 1);
      if(center){
        var n = nodes[i];
        rail.scrollTo({ left: n.offsetLeft - (rail.clientWidth - n.offsetWidth)/2, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    prev.addEventListener('click', function(){ show(Math.max(cur-1, 0), true); });
    next.addEventListener('click', function(){ show(Math.min(cur+1, items.length-1), true); });
    root.appendChild(rail); root.appendChild(panel); root.appendChild(nav);
    root.classList.add('tl', 'js');
    show(0, false);
  }

  /* ---------- rekenmachine ---------- */
  var calc = document.getElementById('calc');
  if(calc){
    var dose = document.getElementById('c-dose'), prevI = document.getElementById('c-prev'), nI = document.getElementById('c-n'), std = document.getElementById('c-std');
    var oDose = document.getElementById('o-dose'), oPrev = document.getElementById('o-prev'), oN = document.getElementById('o-n');
    var rPec = document.getElementById('r-pec'), rVerdict = document.getElementById('r-verdict'), rDetail = document.getElementById('r-detail');
    var gFill = document.getElementById('g-fill'), gLimit = document.getElementById('g-limit'), gauge = document.getElementById('gauge');
    var chips = Array.prototype.slice.call(calc.querySelectorAll('[data-preset]'));
    var LIM = 0.01, MIN = 0.0005, MAX = 1.0, WATER = 200, DIL = 10;
    var PRESETS = { A:{std:true, prev:2.8, n:2}, B:{std:false, prev:2.8, n:2}, C:{std:false, prev:2.8, n:4}, D:{std:false, prev:8.5, n:2}, E:{std:false, prev:8.5, n:4} };
    function pos(v){ var p = (Math.log(v) - Math.log(MIN)) / (Math.log(MAX) - Math.log(MIN)); return Math.max(0, Math.min(1, p)); }
    function fmt(v, d){ return v.toLocaleString('nl-NL', { maximumSignificantDigits: d || 3 }); }
    function place(id, v){ var el = document.getElementById(id); el.style.left = (pos(v)*100) + '%'; }
    place('t1', 0.001); place('t2', 0.01); place('t3', 0.1); place('t4', 1);
    gLimit.style.left = (pos(LIM)*100) + '%';
    function update(){
      var d = +dose.value, pv = +prevI.value, n = +nI.value;
      oDose.textContent = d + ' mg'; oPrev.textContent = fmt(pv, 3) + '%'; oN.textContent = n;
      prevI.disabled = std.checked; nI.disabled = std.checked;
      var fpen = std.checked ? 0.01 : (pv/100) * 1 * n / 365;
      var pec = (d * 1000 * fpen) / (WATER * DIL);
      rPec.textContent = fmt(pec, 3);
      gFill.style.width = (pos(pec)*100) + '%';
      var over = pec >= LIM;
      gFill.classList.toggle('over', over);
      rVerdict.textContent = over ? 'Boven de actiegrens van 0,01 µg/L: een uitgebreidere fase II is nodig.' : 'Onder de actiegrens van 0,01 µg/L: fase I volstaat.';
      rDetail.textContent = 'FPEN = ' + fpen.toLocaleString('nl-NL', { maximumSignificantDigits: 3 }) + (std.checked ? ' (EMA-standaardaanname)' : '') + '. Factor ' + fmt(pec/LIM, 2) + ' ten opzichte van de grens.';
      gauge.setAttribute('aria-label', 'Verwachte concentratie ' + fmt(pec,3) + ' microgram per liter, ' + (over ? 'boven' : 'onder') + ' de grens van 0,01');
      var key = null;
      Object.keys(PRESETS).forEach(function(k){
        var p = PRESETS[k];
        if(d === 25 && p.std === std.checked && (p.std || (Math.abs(p.prev - pv) < 0.001 && p.n === n))) key = k;
      });
      chips.forEach(function(c){ c.setAttribute('aria-pressed', c.dataset.preset === key ? 'true' : 'false'); });
    }
    [dose, prevI, nI, std].forEach(function(el){ el.addEventListener('input', update); el.addEventListener('change', update); });
    chips.forEach(function(c){
      c.addEventListener('click', function(){
        var p = PRESETS[c.dataset.preset];
        dose.value = 25; std.checked = p.std; prevI.value = p.prev; nI.value = p.n; update();
      });
    });
    update();
  }
})();
(function(){
  var g = document.getElementById('gates');
  if(!g) return;
  var btns = Array.prototype.slice.call(g.querySelectorAll('.seg-btn'));
  btns.forEach(function(b){
    b.addEventListener('click', function(){
      g.setAttribute('data-region', b.getAttribute('data-region'));
      btns.forEach(function(o){ o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
    });
  });
})();
