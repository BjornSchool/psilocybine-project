var MOLECULES = {"psilocybine":{"formula":"C12H17N2O4P","atoms":[["C",-3.341,0.288,1.282],["N",-2.615,-0.081,0.05],["C",-3.536,-0.797,-0.845],["C",-1.46,-0.942,0.422],["C",-0.588,-1.385,-0.772],["C",0.846,-1.568,-0.382],["C",1.468,-2.747,-0.019],["N",2.774,-2.465,0.289],["C",3.023,-1.121,0.138],["C",4.197,-0.386,0.347],["C",4.158,0.992,0.102],["C",2.99,1.613,-0.335],["C",1.829,0.862,-0.526],["O",0.692,1.464,-0.994],["P",-0.147,2.459,-0.059],["O",-0.152,2.251,1.417],["O",-1.606,2.418,-0.715],["O",0.335,3.923,-0.496],["C",1.835,-0.531,-0.294],["H",-2.686,0.843,1.962],["H",-3.73,-0.589,1.812],["H",-4.18,0.951,1.044],["H",-4.405,-0.17,-1.078],["H",-3.895,-1.735,-0.407],["H",-3.057,-1.021,-1.804],["H",-0.839,-0.377,1.128],["H",-1.799,-1.836,0.962],["H",-0.638,-0.646,-1.581],["H",-0.985,-2.318,-1.191],["H",1.093,-3.759,0.052],["H",3.46,-3.143,0.591],["H",5.112,-0.863,0.684],["H",5.056,1.586,0.25],["H",2.987,2.681,-0.536],["H",-2.039,1.554,-0.504],["H",-0.155,4.596,0.007]],"bonds":[[0,1,1],[1,2,1],[1,3,1],[3,4,1],[4,5,1],[5,6,2],[6,7,1],[7,8,1],[8,9,2],[9,10,1],[10,11,2],[11,12,1],[12,13,1],[13,14,1],[14,15,2],[14,16,1],[14,17,1],[12,18,2],[18,5,1],[18,8,1],[0,19,1],[0,20,1],[0,21,1],[2,22,1],[2,23,1],[2,24,1],[3,25,1],[3,26,1],[4,27,1],[4,28,1],[6,29,1],[7,30,1],[9,31,1],[10,32,1],[11,33,1],[16,34,1],[17,35,1]]},"psilocine":{"formula":"C12H16N2O","atoms":[["C",-3.152,-0.642,0.838],["N",-2.145,-0.374,-0.202],["C",-2.671,-0.808,-1.503],["C",-1.807,1.067,-0.25],["C",-0.772,1.466,0.817],["C",0.65,1.322,0.357],["C",1.464,2.373,-0.026],["N",2.701,1.878,-0.324],["C",2.726,0.517,-0.14],["C",3.789,-0.384,-0.296],["C",3.547,-1.735,-0.033],["C",2.284,-2.168,0.356],["C",1.234,-1.255,0.488],["O",0.01,-1.786,0.826],["C",1.443,0.125,0.26],["H",-2.784,-0.356,1.828],["H",-4.092,-0.11,0.652],["H",-3.368,-1.716,0.887],["H",-3.57,-0.252,-1.792],["H",-1.914,-0.677,-2.284],["H",-2.914,-1.876,-1.481],["H",-2.717,1.668,-0.121],["H",-1.404,1.33,-1.237],["H",-0.944,2.521,1.073],["H",-0.912,0.914,1.753],["H",1.267,3.435,-0.092],["H",3.495,2.43,-0.617],["H",4.774,-0.05,-0.604],["H",4.352,-2.456,-0.138],["H",2.102,-3.222,0.545],["H",-0.673,-1.18,0.462]],"bonds":[[0,1,1],[1,2,1],[1,3,1],[3,4,1],[4,5,1],[5,6,2],[6,7,1],[7,8,1],[8,9,2],[9,10,1],[10,11,2],[11,12,1],[12,13,1],[12,14,2],[14,5,1],[14,8,1],[0,15,1],[0,16,1],[0,17,1],[2,18,1],[2,19,1],[2,20,1],[3,21,1],[3,22,1],[4,23,1],[4,24,1],[6,25,1],[7,26,1],[9,27,1],[10,28,1],[11,29,1],[13,30,1]]}};

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
  host.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7f9a, 0.75));
  var key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(6, 8, 10); scene.add(key);
  var fill = new THREE.DirectionalLight(0xdfe6ff, 0.35); fill.position.set(-8, -2, 6); scene.add(fill);
  var rim = new THREE.DirectionalLight(0xffe2b8, 0.4); rim.position.set(0, 6, -9); scene.add(rim);

  var COLOR  = { C:0x4a4a52, H:0xeeeef2, N:0x3a63d6, O:0xd9382c, P:0xf08a24 };
  var RADIUS = { C:0.38, H:0.22, N:0.40, O:0.40, P:0.52 };
  var NAME   = { psilocybine:'Psilocybine', psilocine:'Psilocine' };
  var INFO   = { psilocybine:'284,25 g/mol', psilocine:'204,27 g/mol' };

  var sphereGeo = new THREE.SphereGeometry(1, 40, 28);
  var bondGeo = new THREE.CylinderGeometry(1, 1, 1, 14, 1, true);
  var matCache = {};
  function mat(el, dim){
    var k = el + (dim ? 'd' : '');
    if(!matCache[k]){
      matCache[k] = new THREE.MeshStandardMaterial({
        color: COLOR[el], roughness: 0.28, metalness: 0.12,
        transparent: !!dim, opacity: dim ? 0.22 : 1
      });
    }
    return matCache[k];
  }
  var hiMat = {};
  function hi(el){
    if(!hiMat[el]){
      hiMat[el] = new THREE.MeshStandardMaterial({
        color: COLOR[el], roughness: 0.25, metalness: 0.1,
        emissive: COLOR[el], emissiveIntensity: 0.5
      });
    }
    return hiMat[el];
  }

  var current = null, group = null, radius = 5;
  var state = { name:'psilocybine', showH:true, mark:false, spin:true };

  function highlightSet(d){
    var set = {}, i, j, nb = [];
    d.atoms.forEach(function(){ nb.push([]); });
    d.bonds.forEach(function(b){ nb[b[0]].push(b[1]); nb[b[1]].push(b[0]); });
    function addH(i){ nb[i].forEach(function(j){ if(d.atoms[j][0]==='H') set[j]=true; }); }
    for(i=0;i<d.atoms.length;i++){
      if(d.atoms[i][0]==='P'){
        set[i]=true;
        nb[i].forEach(function(j){
          var bridge = nb[j].some(function(k){ return d.atoms[k][0]==='C'; });
          if(!bridge){ set[j]=true; addH(j); }
        });
      }
    }
    if(!Object.keys(set).length){
      /* psilocine: markeer de OH-groep waar de fosfaatgroep zat */
      for(i=0;i<d.atoms.length;i++){
        if(d.atoms[i][0]==='O'){ set[i]=true; addH(i); }
      }
    }
    return set;
  }

  function build(name){
    var d = MOLECULES[name];
    if(group){ scene.remove(group); }
    group = new THREE.Group();
    var inner = new THREE.Group();
    group.add(inner);
    var hl = state.mark ? highlightSet(d) : null;
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

    radius = 0;
    pos.forEach(function(p, i){ if(vis[i]) radius = Math.max(radius, p.length() + 0.5); });
    group.rotation.set(0.25, -0.5, 0);
    scene.add(group);
    current = d;
    fit();
    draw();
  }

  function fit(){
    var w = host.clientWidth, h = host.clientHeight;
    if(!w || !h) return;
    var vfov = camera.fov * Math.PI/180;
    var dist = radius / Math.sin(Math.min(vfov/2, Math.atan(Math.tan(vfov/2)*w/h)));
    camera.position.set(0, 0, dist * 1.0);
    camera.lookAt(0, 0, 0);
  }
  function resize(){
    var w = host.clientWidth, h = host.clientHeight;
    if(!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    fit(); draw();
  }
  function draw(){ renderer.render(scene, camera); }

  /* ---- bediening ---- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) state.spin = false;
  var dragging = false, lx = 0, ly = 0, vx = 0, vy = 0;
  host.addEventListener('pointerdown', function(e){
    dragging = true; lx = e.clientX; ly = e.clientY;
    try{ host.setPointerCapture(e.pointerId); }catch(_){}
  });
  host.addEventListener('pointermove', function(e){
    if(!dragging || !group) return;
    vx = (e.clientX - lx) * 0.012; vy = (e.clientY - ly) * 0.012;
    group.rotation.y += vx; group.rotation.x += vy;
    lx = e.clientX; ly = e.clientY;
    if(!animating) draw();
  });
  function stop(){ dragging = false; }
  host.addEventListener('pointerup', stop);
  host.addEventListener('pointercancel', stop);

  var tabs = fig.querySelectorAll('[data-mol]');
  function setTab(name){
    state.name = name;
    Array.prototype.forEach.call(tabs, function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-mol') === name ? 'true' : 'false');
    });
    var cap = document.getElementById('molcap');
    if(cap) cap.innerHTML = '<strong>' + NAME[name] + '</strong> ' + MOLECULES[name].formula.replace(/(\d+)/g,'<sub>$1</sub>') + ' · ' + INFO[name];
    build(name);
  }
  Array.prototype.forEach.call(tabs, function(b){
    b.addEventListener('click', function(){ setTab(b.getAttribute('data-mol')); });
  });
  function toggle(id, key){
    var el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('change', function(){ state[key] = el.checked; build(state.name); });
  }
  toggle('molH', 'showH'); toggle('molMark', 'mark');
  var spinEl = document.getElementById('molSpin');
  if(spinEl){
    spinEl.checked = state.spin;
    spinEl.disabled = reduce;
    spinEl.addEventListener('change', function(){ state.spin = spinEl.checked; });
  }

  /* ---- animatie ---- */
  var visible = true, animating = false;
  function loop(){
    requestAnimationFrame(loop);
    if(!visible || reduce || !group) return;
    animating = true;
    if(!dragging){
      vx *= 0.94; vy *= 0.94;
      group.rotation.y += (state.spin ? 0.006 : 0) + vx;
      group.rotation.x += vy;
    }
    draw();
  }
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){ visible = en[0].isIntersecting; }).observe(host);
  }
  if('ResizeObserver' in window){ new ResizeObserver(resize).observe(host); }
  window.addEventListener('resize', resize);
  resize();
  setTab('psilocybine');
  requestAnimationFrame(loop);
})();
