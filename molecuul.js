var MOLECULES = {"psilocybine":{"formula":"C12H17N2O4P","mass":284.25,"atoms":[["C",2.962,5.084,0.773],["N",1.968,4.308,1.528],["C",2.008,4.732,2.941],["C",2.259,2.852,1.458],["C",2.241,2.264,0.031],["C",1.749,0.848,0.008],["C",2.511,-0.303,0.0],["N",1.663,-1.38,-0.009],["C",0.353,-0.958,-0.0],["C",-0.838,-1.694,0.004],["C",-2.044,-0.981,0.0],["C",-2.06,0.412,-0.002],["C",-0.859,1.125,0.007],["O",-0.849,2.493,-0.008],["P",-1.574,3.357,1.128],["O",-3.063,3.433,1.068],["O",-1.068,2.766,2.528],["O",-0.817,4.764,1.09],["C",0.374,0.436,-0.001],["H",2.909,4.857,-0.297],["H",3.984,4.896,1.119],["H",2.758,6.157,0.866],["H",1.757,5.795,3.026],["H",1.261,4.186,3.527],["H",2.992,4.57,3.395],["H",1.511,2.334,2.07],["H",3.233,2.63,1.916],["H",1.6,2.863,-0.627],["H",3.248,2.319,-0.4],["H",3.583,-0.449,0.0],["H",1.952,-2.348,-0.019],["H",-0.835,-2.779,-0.001],["H",-2.986,-1.527,-0.012],["H",-3.012,0.937,-0.031],["H",-1.68,2.073,2.836],["H",0.154,4.637,1.214]],"bonds":[[0,1,1],[1,2,1],[1,3,1],[3,4,1],[4,5,1],[5,6,2],[6,7,1],[7,8,1],[8,9,2],[9,10,1],[10,11,2],[11,12,1],[12,13,1],[13,14,1],[14,15,2],[14,16,1],[14,17,1],[12,18,2],[18,5,1],[18,8,1],[0,19,1],[0,20,1],[0,21,1],[2,22,1],[2,23,1],[2,24,1],[3,25,1],[3,26,1],[4,27,1],[4,28,1],[6,29,1],[7,30,1],[9,31,1],[10,32,1],[11,33,1],[16,34,1],[17,35,1]],"labels":[[1,"N(CH₃)₂"],[14,"fosfaatgroep"]]},"psilocine":{"formula":"C12H16N2O","mass":204.27,"atoms":[["C",2.574,4.832,2.765],["N",2.84,4.246,1.448],["C",4.274,4.305,1.163],["C",2.325,2.859,1.406],["C",2.299,2.244,-0.004],["C",1.76,0.842,-0.001],["C",2.513,-0.317,0.001],["N",1.66,-1.385,-0.0],["C",0.354,-0.953,0.0],["C",-0.836,-1.691,0.001],["C",-2.041,-0.982,-0.0],["C",-2.056,0.411,-0.001],["C",-0.855,1.129,-0.001],["O",-0.88,2.501,0.002],["C",0.381,0.444,-0.001],["H",3.07,4.28,3.571],["H",2.914,5.873,2.799],["H",1.497,4.851,2.969],["H",4.86,3.687,1.853],["H",4.49,3.983,0.139],["H",4.638,5.336,1.236],["H",1.296,2.855,1.788],["H",2.905,2.217,2.084],["H",1.698,2.869,-0.676],["H",3.309,2.219,-0.429],["H",3.585,-0.467,-0.001],["H",1.941,-2.355,-0.002],["H",-0.831,-2.776,0.001],["H",-2.982,-1.529,-0.0],["H",-3.011,0.927,-0.0],["H",-1.803,2.797,-0.02]],"bonds":[[0,1,1],[1,2,1],[1,3,1],[3,4,1],[4,5,1],[5,6,2],[6,7,1],[7,8,1],[8,9,2],[9,10,1],[10,11,2],[11,12,1],[12,13,1],[12,14,2],[14,5,1],[14,8,1],[0,15,1],[0,16,1],[0,17,1],[2,18,1],[2,19,1],[2,20,1],[3,21,1],[3,22,1],[4,23,1],[4,24,1],[6,25,1],[7,26,1],[9,27,1],[10,28,1],[11,29,1],[13,30,1]],"labels":[[1,"N(CH₃)₂"],[13,"OH-groep"]]}};

(function(){
  var host = document.getElementById('molstage');
  var fig = document.getElementById('molfig');
  if(!host || !fig || typeof THREE === 'undefined') return;

  var renderer;
  try{
    renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  }catch(e){ return; }
  fig.classList.add('has-3d');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  host.insertBefore(renderer.domElement, host.firstChild);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 300);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7f9a, 0.75));
  var key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(6, 8, 12); scene.add(key);
  var fill = new THREE.DirectionalLight(0xdfe6ff, 0.35); fill.position.set(-8, -3, 7); scene.add(fill);
  var rim = new THREE.DirectionalLight(0xffe2b8, 0.4); rim.position.set(0, 6, -10); scene.add(rim);

  var COLOR  = { C:0x4a4a52, H:0xeeeef2, N:0x3a63d6, O:0xd9382c, P:0xf08a24 };
  var RADIUS = { C:0.36, H:0.21, N:0.38, O:0.38, P:0.50 };
  var NAMES  = ['psilocybine', 'psilocine'];
  var TITLE  = { psilocybine:'Psilocybine', psilocine:'Psilocine' };

  var sphereGeo = new THREE.SphereGeometry(1, 40, 28);
  var bondGeo = new THREE.CylinderGeometry(1, 1, 1, 14, 1, true);
  var matCache = {}, hiCache = {};
  function mat(el, dim){
    var k = el + (dim ? 'd' : '');
    if(!matCache[k]){
      matCache[k] = new THREE.MeshStandardMaterial({
        color: COLOR[el], roughness: 0.28, metalness: 0.12,
        transparent: !!dim, opacity: dim ? 0.2 : 1
      });
    }
    return matCache[k];
  }
  function hi(el){
    if(!hiCache[el]){
      hiCache[el] = new THREE.MeshStandardMaterial({
        color: COLOR[el], roughness: 0.25, metalness: 0.1,
        emissive: COLOR[el], emissiveIntensity: 0.5
      });
    }
    return hiCache[el];
  }

  var state = { showH:false, mark:false, labels:true, spin:true, flat:false };
  var rot = { x:-0.2, y:0.35 };       /* gebruikersdraaiing bovenop de automatische beweging */
  var mols = {};                       /* name -> { pivot, radius } */
  var portrait = false;

  function highlightSet(d, isProdrug){
    var set = {}, i, nb = d.atoms.map(function(){ return []; });
    d.bonds.forEach(function(b){ nb[b[0]].push(b[1]); nb[b[1]].push(b[0]); });
    function addH(i){ nb[i].forEach(function(j){ if(d.atoms[j][0]==='H') set[j]=true; }); }
    for(i=0;i<d.atoms.length;i++){
      if(isProdrug && d.atoms[i][0]==='P'){
        set[i]=true;
        nb[i].forEach(function(j){
          var bridge = nb[j].some(function(k){ return d.atoms[k][0]==='C'; });
          if(!bridge){ set[j]=true; addH(j); }
        });
      }
      if(!isProdrug && d.atoms[i][0]==='O'){ set[i]=true; addH(i); }
    }
    return set;
  }

  function textSprite(text){
    var c = document.createElement('canvas'), x = c.getContext('2d');
    var fs = 56;
    x.font = '600 ' + fs + 'px "IBM Plex Sans", system-ui, sans-serif';
    var w = Math.ceil(x.measureText(text).width) + 24;
    c.width = w; c.height = fs + 24;
    x.font = '600 ' + fs + 'px "IBM Plex Sans", system-ui, sans-serif';
    x.textBaseline = 'middle'; x.textAlign = 'center';
    x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = '#EEE8DA';
    x.strokeText(text, w/2, c.height/2);
    x.fillStyle = '#2A2621';
    x.fillText(text, w/2, c.height/2);
    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, transparent:true, depthTest:false }));
    var h = 0.95;
    sp.scale.set(h * c.width / c.height, h, 1);
    sp.renderOrder = 10;
    return sp;
  }

  function build(name){
    var d = MOLECULES[name];
    if(mols[name]) scene.remove(mols[name].pivot);
    var pivot = new THREE.Group();
    var inner = new THREE.Group();
    pivot.add(inner);
    var hl = state.mark ? highlightSet(d, name === 'psilocybine') : null;
    var vis = d.atoms.map(function(a){ return state.showH || a[0] !== 'H'; });
    var pos = d.atoms.map(function(a){ return new THREE.Vector3(a[1], a[2], a[3]); });
    var nb = d.atoms.map(function(){ return []; });
    d.bonds.forEach(function(b){ nb[b[0]].push(b[1]); nb[b[1]].push(b[0]); });

    d.atoms.forEach(function(a, i){
      if(!vis[i]) return;
      var m = hl ? (hl[i] ? hi(a[0]) : mat(a[0], true)) : mat(a[0]);
      var s = new THREE.Mesh(sphereGeo, m);
      s.scale.setScalar(RADIUS[a[0]]);
      s.position.copy(pos[i]);
      inner.add(s);
    });

    function cyl(p1, p2, r, el, dim, hlit){
      var len = p1.distanceTo(p2);
      var m = new THREE.Mesh(bondGeo, hlit ? hi(el) : mat(el, dim));
      m.scale.set(r, len, r);
      m.position.copy(p1).add(p2).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), p2.clone().sub(p1).normalize());
      inner.add(m);
    }
    d.bonds.forEach(function(b){
      var i = b[0], j = b[1], order = b[2];
      if(!vis[i] || !vis[j]) return;
      var a = pos[i], c = pos[j], mid = a.clone().add(c).multiplyScalar(0.5);
      var dir = c.clone().sub(a).normalize();
      var offs = [new THREE.Vector3()], r = 0.11;
      if(order === 2){
        var ref = null, k;
        for(k=0;k<nb[i].length;k++){ if(nb[i][k] !== j){ ref = pos[nb[i][k]]; break; } }
        if(!ref){ for(k=0;k<nb[j].length;k++){ if(nb[j][k] !== i){ ref = pos[nb[j][k]]; break; } } }
        var normal = ref ? dir.clone().cross(ref.clone().sub(a)) : new THREE.Vector3(0,0,1);
        if(normal.lengthSq() < 1e-6) normal.set(0,0,1);
        var side = normal.clone().cross(dir).normalize().multiplyScalar(0.13);
        offs = [side.clone(), side.clone().negate()]; r = 0.075;
      }
      var hlb = hl && hl[i] && hl[j];
      var dim = hl && !hlb;
      offs.forEach(function(o){
        cyl(a.clone().add(o), mid.clone().add(o), r, d.atoms[i][0], dim, hlb);
        cyl(mid.clone().add(o), c.clone().add(o), r, d.atoms[j][0], dim, hlb);
      });
    });

    if(state.labels){
      d.labels.forEach(function(l){
        var p = pos[l[0]];
        var out = p.clone(); out.z = 0;
        if(out.length() < 1e-3) out.set(0,1,0);
        out.normalize();
        var sp = textSprite(l[1]);
        var w = sp.scale.x;
        sp.position.copy(p).add(new THREE.Vector3(out.x * (0.9 + w*0.42), out.y * 0.9, 1.0));
        inner.add(sp);
      });
    }

    /* draaipunt in het midden van het molecuul, in de stand van de tekening */
    var mn = new THREE.Vector3(1e9,1e9,1e9), mx = new THREE.Vector3(-1e9,-1e9,-1e9);
    pos.forEach(function(p, i){ if(vis[i]){ mn.min(p); mx.max(p); } });
    var ctr = mn.clone().add(mx).multiplyScalar(0.5);
    inner.position.copy(ctr).negate();
    var radius = 0;
    pos.forEach(function(p, i){ if(vis[i]) radius = Math.max(radius, p.distanceTo(ctr) + 0.5); });
    inner.children.forEach(function(ch){
      if(ch.isSprite) radius = Math.max(radius, ch.position.distanceTo(ctr) + ch.scale.x * 0.5 + 0.2);
    });
    scene.add(pivot);
    mols[name] = { pivot:pivot, radius:radius };
  }
  function buildAll(){ NAMES.forEach(build); layout(); draw(); }

  /* ---- plaatsing: naast elkaar (breed scherm) of boven elkaar (smal scherm) ---- */
  var ext = { w:20, h:12, cx:0, cy:0 };
  function layout(){
    var w = host.clientWidth, h = host.clientHeight;
    portrait = (w / Math.max(h,1)) < 1.15;
    var a = mols.psilocybine, b = mols.psilocine;
    var gap = a.radius + b.radius + 0.6, big = Math.max(a.radius, b.radius);
    if(!portrait){
      a.pivot.position.set(-gap/2, 0, 0);
      b.pivot.position.set( gap/2, 0, 0);
      ext.w = gap + a.radius + b.radius; ext.h = 2*big;
    }else{
      a.pivot.position.set(0,  gap/2, 0);
      b.pivot.position.set(0, -gap/2, 0);
      ext.w = 2*big; ext.h = gap + a.radius + b.radius;
    }
    ext.cx = 0; ext.cy = 0;
    fit();
  }
  function fit(){
    var w = host.clientWidth, h = host.clientHeight;
    if(!w || !h) return;
    var tv = Math.tan(camera.fov * Math.PI/360), asp = w/h;
    var dist = Math.max((ext.h/2)/tv, (ext.w/2)/(tv*asp)) * 1.12;
    camera.position.set(ext.cx, ext.cy, dist);
    camera.lookAt(ext.cx, ext.cy, 0);
  }

  /* ---- namen onder / boven de moleculen ---- */
  var labelEl = {
    psilocybine: document.getElementById('mollabel-psilocybine'),
    psilocine:   document.getElementById('mollabel-psilocine')
  };
  function placeLabels(){
    var w = host.clientWidth, h = host.clientHeight, v = new THREE.Vector3();
    NAMES.forEach(function(n){
      var el = labelEl[n]; if(!el || !mols[n]) return;
      var p = mols[n].pivot.position;
      v.set(p.x, p.y, 0).project(camera);
      var sx = (v.x * 0.5 + 0.5) * w, sy = (-v.y * 0.5 + 0.5) * h;
      if(!portrait){ el.style.left = sx + 'px'; el.style.top = ''; el.style.bottom = '10px'; el.style.transform = 'translateX(-50%)'; el.style.textAlign = 'center'; }
      else{
        v.set(p.x, p.y + mols[n].radius, 0).project(camera);
        el.style.left = '12px'; el.style.bottom = ''; el.style.transform = 'none'; el.style.textAlign = 'left';
        el.style.top = Math.max(6, (-v.y * 0.5 + 0.5) * h + 2) + 'px';
      }
    });
  }

  function apply(t){
    var ry = rot.y, rx = rot.x;
    if(state.flat){ rx = 0; ry = 0; }
    else if(state.spin){ ry += 0.5 * Math.sin(t * 0.5); rx += 0.06 * Math.sin(t * 0.37); }
    NAMES.forEach(function(n){ mols[n].pivot.rotation.set(rx, ry, 0); });
  }
  function draw(t){
    if(!mols.psilocybine || !mols.psilocine) return;
    apply(t || 0); renderer.render(scene, camera); placeLabels(); }
  function resize(){
    var w = host.clientWidth, h = host.clientHeight;
    if(!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    if(mols.psilocybine) layout();
    draw(clock());
  }

  /* ---- bediening ---- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) state.spin = false;
  var dragging = false, lx = 0, ly = 0;
  host.addEventListener('pointerdown', function(e){
    dragging = true; lx = e.clientX; ly = e.clientY;
    try{ host.setPointerCapture(e.pointerId); }catch(_){}
  });
  host.addEventListener('pointermove', function(e){
    if(!dragging) return;
    if(state.flat){ state.flat = false; rot.x = 0; rot.y = 0; }
    rot.y += (e.clientX - lx) * 0.012; rot.x += (e.clientY - ly) * 0.012;
    lx = e.clientX; ly = e.clientY;
    if(!running) draw(clock());
  });
  function stop(){ dragging = false; }
  host.addEventListener('pointerup', stop);
  host.addEventListener('pointercancel', stop);

  function bind(id, key, rebuild){
    var el = document.getElementById(id);
    if(!el) return null;
    el.checked = state[key];
    el.addEventListener('change', function(){
      state[key] = el.checked;
      if(rebuild) buildAll(); else draw(clock());
    });
    return el;
  }
  bind('molH', 'showH', true); bind('molMark', 'mark', true); bind('molLabels', 'labels', true);
  var spinEl = bind('molSpin', 'spin', false);
  if(spinEl) spinEl.disabled = reduce;
  var reset = document.getElementById('molReset');
  if(reset) reset.addEventListener('click', function(){
    state.flat = true; state.spin = false;
    if(spinEl) spinEl.checked = false;
    draw(clock());
  });
  if(spinEl) spinEl.addEventListener('change', function(){ if(state.spin) state.flat = false; });

  /* ---- animatie ---- */
  var t0 = performance.now(), visible = true, running = false;
  function clock(){ return (performance.now() - t0) / 1000; }
  function loop(){
    requestAnimationFrame(loop);
    if(!visible || reduce) return;
    running = true;
    draw(clock());
  }
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){ visible = en[0].isIntersecting; }).observe(host);
  }
  if('ResizeObserver' in window){ new ResizeObserver(resize).observe(host); }
  window.addEventListener('resize', resize);
  resize();
  buildAll();
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(buildAll); }
  requestAnimationFrame(loop);
})();
