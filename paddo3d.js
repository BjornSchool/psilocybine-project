(function(){
  var host = document.getElementById('paddostage');
  var fig = document.getElementById('paddofig');
  if(!host || !fig || typeof THREE === 'undefined') return;

  var renderer;
  try{
    renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  }catch(e){ return; }
  fig.classList.add('has-3d');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  host.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 1.2, 8.2);
  camera.lookAt(0, 0.35, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a948c, 0.55));
  var key = new THREE.DirectionalLight(0xfff4e4, 0.8); key.position.set(4, 7, 6); scene.add(key);
  var fill = new THREE.DirectionalLight(0xdfe6ff, 0.35); fill.position.set(-6, 1, 4); scene.add(fill);
  var rim = new THREE.DirectionalLight(0xffffff, 0.35); rim.position.set(-2, 4, -6); scene.add(rim);

  var world = new THREE.Group();
  scene.add(world);

  function wob(x, y, z, s){
    return Math.sin(x*3.1 + s) * Math.cos(y*2.7 + s*1.3) * 0.6
         + Math.sin(z*4.3 + s*0.7 + x*1.9) * 0.4;
  }
  function mixColor(a, b, t){ return new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, t))); }

  /* ---- hoed van een gedroogde paddenstoel: gerimpeld, aan de rand omgekruld ---- */
  function capMesh(R, H, seed){
    var pts = [], n = 44, i, a;
    for(i=0;i<=n;i++){
      a = i/n * 1.5;
      pts.push(new THREE.Vector2(Math.max(R*Math.sin(a), 0.0005), H*Math.pow(Math.cos(a), 0.85)));
    }
    var geo = new THREE.LatheGeometry(pts, 110);
    var p = geo.attributes.position, v = new THREE.Vector3(), cols = [], k;
    for(k=0;k<p.count;k++){
      v.fromBufferAttribute(p, k);
      var r = Math.sqrt(v.x*v.x + v.z*v.z) / R;
      var ang = Math.atan2(v.z, v.x);
      var w = wob(v.x, v.y, v.z, seed);
      var fine = Math.sin(23*v.x + seed) * Math.sin(19*v.z + seed*1.7) * Math.sin(21*v.y + seed*0.4);
      var rib  = Math.sin(15*ang + seed + 3*r);
      var d = 1 + 0.08*w + 0.04*Math.sin(7*ang + seed) * r + 0.014*rib*r + 0.011*fine;
      v.x *= d; v.z *= d;
      v.y = v.y * (1 + 0.12*w) - 0.26*H*r*r*r + 0.016*fine;   /* rand krult naar beneden */
      p.setXYZ(k, v.x, v.y, v.z);
      var dark = 0.5 + 0.5*w;
      var c = mixColor(0xb58d5d, 0x6a4727, 0.2 + 0.5*dark*r + 0.2*(1-dark) + 0.25*Math.abs(fine) + 0.15*Math.abs(rib)*r);
      cols.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:1.0, metalness:0, side:THREE.DoubleSide }));
  }

  /* ---- lamellen onder de hoed ---- */
  function gillsMesh(R, H, seed){
    var pts = [], n = 10, i, t;
    for(i=0;i<=n;i++){
      t = i/n;
      pts.push(new THREE.Vector2(R*0.98*(1 - t) + 0.04, -0.22*H*0.98*(1 - t) + 0.10*H*t));
    }
    var geo = new THREE.LatheGeometry(pts, 96);
    var p = geo.attributes.position, v = new THREE.Vector3(), cols = [], k;
    for(k=0;k<p.count;k++){
      v.fromBufferAttribute(p, k);
      var r = Math.sqrt(v.x*v.x + v.z*v.z) / R;
      var ang = Math.atan2(v.z, v.x);
      var ridge = Math.sin(ang * 34 + seed);
      v.y += 0.022 * ridge * r;
      p.setXYZ(k, v.x, v.y, v.z);
      var c = mixColor(0x9a919f, 0x4d4654, 0.4 + 0.4*(0.5+0.5*ridge) + 0.2*(1-r));
      cols.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:0.9, side:THREE.DoubleSide }));
  }

  /* ---- steel: gekromd, dun en gerimpeld ---- */
  function stemMesh(curve, radius, seed){
    var geo = new THREE.TubeGeometry(curve, 60, radius, 12, false);
    var p = geo.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3(), k;
    var segs = 12 + 1, cols = [];
    for(k=0;k<p.count;k++){
      var ring = Math.floor(k / segs);
      var tt = ring / 60;
      curve.getPoint(Math.min(1, tt), c);
      v.fromBufferAttribute(p, k).sub(c);
      var ang = 6.2832 * (k % segs) / (segs - 1);
      var w = wob(c.x*2, c.y*3, c.z*2, seed) + 0.5*Math.sin(tt*40 + seed);
      var thick = 1 + 0.22*w + 0.18*Math.sin(ang*3 + tt*9 + seed) + 0.6*Math.pow(tt, 3);  /* onderaan dikker */
      v.multiplyScalar(thick).add(c);
      p.setXYZ(k, v.x, v.y, v.z);
      var col = mixColor(0xd8ccb2, 0x9f9070, 0.3 + 0.4*(0.5 + 0.5*w) + 0.2*Math.sin(ang*3 + tt*9));
      cols.push(col.r, col.g, col.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:1.0 }));
  }

  var BASE = new THREE.Vector3(0.05, -0.75, 0);

  function dried(o){
    var g = new THREE.Group();
    var cap = capMesh(o.R, o.H, o.seed);
    var gills = gillsMesh(o.R, o.H, o.seed);
    var capGroup = new THREE.Group();
    capGroup.add(cap); capGroup.add(gills);
    capGroup.position.set(o.x, o.y, o.z);
    capGroup.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0);
    g.add(capGroup);

    var down = new THREE.Vector3(0, -1, 0).applyEuler(capGroup.rotation);
    var s = capGroup.position.clone().add(down.clone().multiplyScalar(0.02));
    var m1 = s.clone().add(down.clone().multiplyScalar(0.45)).add(new THREE.Vector3(o.w1 || 0.1, 0, o.w2 || 0.08));
    var m2 = s.clone().lerp(BASE, 0.62).add(new THREE.Vector3(-(o.w1 || 0.1)*0.8, 0.05, -(o.w2 || 0.08)));
    var curve = new THREE.CatmullRomCurve3([s, m1, m2, BASE.clone().add(new THREE.Vector3(o.bx || 0, 0, o.bz || 0))]);
    g.add(stemMesh(curve, o.sr || 0.05, o.seed + 3));
    world.add(g);
  }

  /* kleine, gerimpelde stengelknoop onderaan, waar de steeltjes samenkomen */
  (function(){
    var geo = new THREE.SphereGeometry(0.3, 48, 32);
    var p = geo.attributes.position, v = new THREE.Vector3(), k;
    for(k=0;k<p.count;k++){
      v.fromBufferAttribute(p, k);
      var w = wob(v.x*3, v.y*3, v.z*3, 2.2);
      v.multiplyScalar(1 + 0.2*w + 0.03*Math.sin(25*v.x)*Math.sin(23*v.z));
      v.y *= 1.25;
      p.setXYZ(k, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color:0xc4b697, roughness:1.0 }));
    m.position.copy(BASE).add(new THREE.Vector3(0, -0.05, 0));
    world.add(m);
  })();

  dried({ R:0.78, H:0.52, x: 0.10, y: 1.10, z: 0.0,  rx: 0.60, rz:-0.25, seed:1.0, w1: 0.12, w2: 0.10, bx: 0.05, sr:0.07 });
  dried({ R:0.52, H:0.36, x:-1.25, y: 0.55, z: 0.25, rx: 0.25, rz: 0.40, seed:2.4, w1:-0.20, w2: 0.05, bx:-0.10, sr:0.06 });
  dried({ R:0.42, H:0.30, x:-1.00, y: 0.05, z:-0.35, rx:-0.15, rz: 0.60, seed:3.8, w1:-0.12, w2:-0.10, bx:-0.05, bz:-0.06, sr:0.055 });
  dried({ R:0.50, H:0.34, x: 1.30, y: 0.60, z: 0.10, rx: 0.15, rz:-0.50, seed:5.1, w1: 0.20, w2: 0.00, bx: 0.12, sr:0.06 });
  dried({ R:0.36, H:0.26, x:-0.40, y: 0.50, z: 0.55, rx: 0.45, rz: 0.10, seed:6.3, w1: 0.05, w2: 0.15, bz: 0.08, sr:0.05 });

  world.position.y = 0.05;
  world.rotation.set(0.12, -0.5, 0);

  /* ---- formaat en bediening ---- */
  function draw(){ renderer.render(scene, camera); }
  function resize(){
    var w = host.clientWidth, h = host.clientHeight;
    if(!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w/h;
    camera.position.z = w/h < 1.1 ? 11.5 : 8.2;
    camera.lookAt(0, 0.35, 0);
    camera.updateProjectionMatrix();
    draw();
  }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dragging = false, lx = 0, ly = 0, vx = 0;
  host.addEventListener('pointerdown', function(e){
    dragging = true; lx = e.clientX; ly = e.clientY;
    try{ host.setPointerCapture(e.pointerId); }catch(_){}
  });
  host.addEventListener('pointermove', function(e){
    if(!dragging) return;
    vx = (e.clientX - lx) * 0.01;
    world.rotation.y += vx;
    world.rotation.x = Math.max(-0.6, Math.min(0.9, world.rotation.x + (e.clientY - ly) * 0.006));
    lx = e.clientX; ly = e.clientY;
    if(reduce) draw();
  });
  function stop(){ dragging = false; }
  host.addEventListener('pointerup', stop);
  host.addEventListener('pointercancel', stop);

  var visible = true;
  function loop(){
    requestAnimationFrame(loop);
    if(!visible || reduce) return;
    if(!dragging){ vx *= 0.95; world.rotation.y += 0.004 + vx; }
    draw();
  }
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){ visible = en[0].isIntersecting; }).observe(host);
  }
  if('ResizeObserver' in window){ new ResizeObserver(resize).observe(host); }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(loop);
})();
