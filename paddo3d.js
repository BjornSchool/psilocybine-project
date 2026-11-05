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
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 2.9, 8.8);
  camera.lookAt(0, 1.15, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8f8a84, 0.55));
  var key = new THREE.DirectionalLight(0xfff1dc, 1.5);
  key.position.set(4, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -5; key.shadow.camera.right = 5;
  key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
  key.shadow.camera.near = 1; key.shadow.camera.far = 30;
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xdfe6ff, 0.4); fill.position.set(-7, 2, 5); scene.add(fill);
  var rim = new THREE.DirectionalLight(0xffffff, 0.55); rim.position.set(-2, 5, -8); scene.add(rim);

  /* zachte schaduw op de ondergrond, de rest is de lichtgrijze achtergrond */
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.ShadowMaterial({ opacity:0.28 }));
  floor.rotation.x = -Math.PI/2; floor.position.y = -0.02; floor.receiveShadow = true;
  scene.add(floor);

  var world = new THREE.Group();
  scene.add(world);

  /* ---- hulpfuncties ---- */
  function hash(n){ var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  function wob(x, y, z, s){
    return Math.sin(x*3.1 + s) * Math.cos(y*2.7 + s*1.3) * 0.6
         + Math.sin(z*4.3 + s*0.7 + x*1.9) * 0.4;
  }
  function mix(a, b, t){ return new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, t))); }
  function pushColor(arr, c){ arr.push(c.r, c.g, c.b); }

  /* fijne korrel als bumpmap: leerachtig, gedroogd oppervlak */
  function grainTexture(size, seed, repX, repY){
    var c = document.createElement('canvas'); c.width = c.height = size;
    var x = c.getContext('2d'), img = x.createImageData(size, size), d = img.data, i, j, o, v;
    function vn(px, py, f){
      var fx = px * f, fy = py * f, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
      tx = tx*tx*(3 - 2*tx); ty = ty*ty*(3 - 2*ty);
      var a = hash(ix*57 + iy*131 + seed), b = hash((ix+1)*57 + iy*131 + seed),
          cc = hash(ix*57 + (iy+1)*131 + seed), dd = hash((ix+1)*57 + (iy+1)*131 + seed);
      return (a*(1-tx) + b*tx)*(1-ty) + (cc*(1-tx) + dd*tx)*ty;
    }
    for(j=0;j<size;j++) for(i=0;i<size;i++){
      v = 0.5*vn(i, j, 0.04) + 0.3*vn(i, j, 0.1) + 0.2*vn(i, j, 0.3) + 0.18*hash(i*13.1 + j*7.7 + seed);
      o = (j*size + i) * 4; v = Math.max(0, Math.min(1, v * 0.9)) * 255;
      d[o] = d[o+1] = d[o+2] = v; d[o+3] = 255;
    }
    x.putImageData(img, 0, 0);
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repX || 1, repY || 1);
    return t;
  }

  /* ---- hoed: gedroogd, gerimpeld, rand naar binnen gekruld ---- */
  function capMesh(R, H, seed, tint){
    var pts = [], n = 56, i, a;
    for(i=0;i<=n;i++){
      a = i/n * 1.42;
      var umbo = Math.max(0, 1 - i/9) * 0.09 * H;             /* kleine verhoging in het midden */
      pts.push(new THREE.Vector2(Math.max(R*Math.sin(a), 0.0004), H*Math.pow(Math.cos(a), 0.85) + umbo));
    }
    /* de rand krult naar binnen en omlaag, zoals bij gedroogde exemplaren */
    pts.push(new THREE.Vector2(R*1.0,  H*0.04));
    pts.push(new THREE.Vector2(R*0.985, -H*0.10));
    pts.push(new THREE.Vector2(R*0.93, -H*0.24));
    pts.push(new THREE.Vector2(R*0.84, -H*0.30));
    var geo = new THREE.LatheGeometry(pts, 150);
    var p = geo.attributes.position, v = new THREE.Vector3(), cols = [], k;
    for(k=0;k<p.count;k++){
      v.fromBufferAttribute(p, k);
      var u = Math.min(1, Math.sqrt(v.x*v.x + v.z*v.z) / R);
      var ang = Math.atan2(v.z, v.x);
      var w = wob(v.x*1.6, v.y*1.6, v.z*1.6, seed);
      var ridge = Math.abs(Math.sin(ang*6.5 + w*2.2 + u*3.2 + seed));     /* radiale plooien */
      var fine = Math.sin(v.x*26 + seed) * Math.sin(v.z*23 + seed*1.7) * Math.sin(v.y*29 + seed*0.5);
      var f2 = Math.sin(v.x*15 + seed*1.1) * Math.sin(v.z*13 + seed*0.7) * Math.sin(v.y*17 + seed);
      var f3 = Math.sin(v.x*38 + seed*2.1) * Math.sin(v.z*34 + seed*1.3);
      var d = 1 + 0.06*w*u + 0.02*(ridge - 0.5)*u + 0.006*fine + 0.016*f2*(0.4 + u) + 0.006*f3;
      v.x *= d * (1 + 0.1*Math.sin(ang*2 + seed));                     /* niet helemaal rond */
      v.z *= d * (1 - 0.1*Math.sin(ang*2 + seed));
      v.y = v.y*(1 + 0.10*w) + 0.03*H*(ridge - 0.5)*u + 0.012*H*fine + 0.03*H*f2 + 0.012*H*f3;
      p.setXYZ(k, v.x, v.y, v.z);
      var c = mix(tint.mid, tint.edge, Math.pow(u, 1.5));
      c.lerp(new THREE.Color(tint.center), Math.max(0, 1 - u*3.2) * 0.9);       /* donkerder midden */
      c.lerp(new THREE.Color(0x5a3a1c), (1 - ridge) * u * 0.06 + Math.max(0, -w) * 0.16);  /* plooien iets donkerder */
      c.lerp(new THREE.Color(0x5a3a1c), Math.max(0, -f2) * 0.28 * (0.3 + u));      /* donkere rimpeldalen */
      c.lerp(new THREE.Color(0xe6c88e), Math.max(0, f2) * 0.14 * (0.3 + u));       /* lichte toppen */
      c.offsetHSL(0, 0.02, 0.02*fine + 0.03*w);
      var bl = Math.max(0, wob(v.x*3 + 2, v.y*3, v.z*3, seed*2.2) - 0.5);      /* subtiele blauwgrijze vlekken */
      c.lerp(new THREE.Color(0x46566b), Math.min(0.35, bl * 0.8));
      pushColor(cols, c);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      vertexColors:true, roughness:0.92, metalness:0, side:THREE.DoubleSide }));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  /* ---- lamellen onder de hoed ---- */
  function gillsMesh(R, H, seed){
    var gp = [], m, n = 14;
    for(m=0;m<=n;m++){
      var t = m/n;
      gp.push(new THREE.Vector2(R*0.88*(1 - t) + 0.03, -H*0.26*(1 - t) + H*0.08*t - H*0.05));
    }
    var geo = new THREE.LatheGeometry(gp, 220);
    var p = geo.attributes.position, v = new THREE.Vector3(), cols = [], k;
    for(k=0;k<p.count;k++){
      v.fromBufferAttribute(p, k);
      var u = Math.sqrt(v.x*v.x + v.z*v.z) / R, ang = Math.atan2(v.z, v.x);
      var gill = Math.sin(ang * 62 + seed);                                    /* lamellen */
      var crest = Math.max(0, gill);
      v.y += 0.03 * crest * Math.min(1, u*2);
      p.setXYZ(k, v.x, v.y, v.z);
      var c = mix(0x3b2a26, 0x7a6254, 0.15 + 0.6*u*(0.4 + 0.6*crest));
      c.lerp(new THREE.Color(0xb9a688), Math.pow(crest, 6) * 0.4 * u);         /* lichte lamelranden */
      pushColor(cols, c);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    var g = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:0.95, side:THREE.DoubleSide }));
    g.castShadow = true;
    return g;
  }

  /* ---- steel: dun, gedraaid, met lengteplooien en blauwgrijze plekken ---- */
  function stemMesh(curve, radius, seed){
    var ts = 90, rs = 16;
    var geo = new THREE.TubeGeometry(curve, ts, radius, rs, false);
    var p = geo.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3(), cols = [], k;
    for(k=0;k<p.count;k++){
      var ring = Math.floor(k / (rs + 1)), tt = ring / ts;
      var ang = 6.2832 * (k % (rs + 1)) / rs;
      curve.getPointAt(Math.min(1, tt), c);
      v.fromBufferAttribute(p, k).sub(c);
      var twist = Math.sin(ang*3 + tt*8 + seed);
      var fib = Math.abs(Math.sin(ang*4 + tt*5 + seed*2));
      var w = wob(c.x*2, c.y*3, c.z*2, seed) + 0.3*Math.sin(tt*20 + seed);
      var taper = 1.0 - 0.28*tt + 0.9*Math.pow(Math.max(0, 0.18 - tt)/0.18, 2) * 0.5;   /* bovenaan dun, onderaan dikker */
      v.multiplyScalar(taper * (1 + 0.035*twist + 0.02*(fib - 0.5) + 0.07*w)).add(c);
      p.setXYZ(k, v.x, v.y, v.z);
      var col = mix(0xdccfb2, 0xa99877, 0.3 + 0.35*tt + 0.15*fib);
      col.lerp(new THREE.Color(0x7a6a4c), Math.max(0, -w) * 0.18);
      var bl = Math.max(0, wob(c.x*2.5 + ang*0.3, c.y*3, c.z*2.5, seed*1.9) - 0.2) * (0.3 + 0.7*(1 - tt));
      col.lerp(new THREE.Color(0x4f6179), Math.min(0.6, bl * 1.25));          /* blauwgrijze verkleuring */
      pushColor(cols, col);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      vertexColors:true, roughness:0.95 }));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  var BASE = new THREE.Vector3(0.05, 0.28, 0);

  function dried(o){
    var s = o.seed;
    var end = new THREE.Vector3(o.x, o.y, o.z);
    var d = end.clone().sub(BASE);
    var p1 = BASE.clone().add(new THREE.Vector3(d.x*0.12 + (o.w1 || 0.2), d.y*0.35, d.z*0.12 + (o.w2 || 0.1)));
    var p2 = BASE.clone().add(new THREE.Vector3(d.x*0.62 - (o.w1 || 0.2)*0.8, d.y*0.7, d.z*0.62 - (o.w2 || 0.1)));
    var curve = new THREE.CatmullRomCurve3([BASE.clone().add(new THREE.Vector3(o.bx || 0, 0, o.bz || 0)), p1, p2, end]);
    world.add(stemMesh(curve, o.sr || 0.05, s + 3));

    var cap = new THREE.Group();
    cap.add(capMesh(o.R, o.H, s, o.tint));
    cap.add(gillsMesh(o.R, o.H, s));
    var tan = curve.getTangentAt(1).normalize();
    cap.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), tan);
    cap.rotateX(o.rx || 0); cap.rotateZ(o.rz || 0);
    cap.position.copy(end).add(tan.clone().multiplyScalar(0.04));
    world.add(cap);
  }

  var T1 = { center:0x6a4220, mid:0xb0773a, edge:0xd9b070 };
  var T2 = { center:0x5f3b1c, mid:0xa06d34, edge:0xcfa566 };
  var T3 = { center:0x73491f, mid:0xba8445, edge:0xdcb97a };
  dried({ R:0.82, H:0.66, x: 0.15, y:2.35, z:-0.05, rx: 0.45, rz:-0.15, seed:1.0, w1: 0.22, w2: 0.12, bx: 0.05, sr:0.085, tint:T1 });
  dried({ R:0.58, H:0.46, x:-1.50, y:1.50, z: 0.30, rx: 0.30, rz: 0.40, seed:2.4, w1:-0.26, w2: 0.05, bx:-0.10, sr:0.07, tint:T2 });
  dried({ R:0.48, H:0.38, x:-1.20, y:0.72, z:-0.40, rx:-0.05, rz: 0.65, seed:3.8, w1:-0.18, w2:-0.15, bx:-0.05, bz:-0.06, sr:0.065, tint:T3 });
  dried({ R:0.58, H:0.46, x: 1.50, y:1.55, z: 0.10, rx: 0.20, rz:-0.50, seed:5.1, w1: 0.26, w2: 0.00, bx: 0.12, sr:0.07, tint:T1 });
  dried({ R:0.42, H:0.34, x:-0.55, y:1.30, z: 0.75, rx: 0.55, rz: 0.10, seed:6.3, w1: 0.10, w2: 0.20, bz: 0.08, sr:0.06, tint:T3 });
  dried({ R:0.44, H:0.35, x: 0.95, y:0.90, z: 0.85, rx: 0.50, rz:-0.30, seed:7.7, w1: 0.15, w2: 0.20, bx: 0.1, sr:0.062, tint:T2 });

  /* steelbasis: een samengedrukt knoopje waar de steeltjes samenkomen */
  (function(){
    var geo = new THREE.SphereGeometry(0.34, 64, 44);
    var p = geo.attributes.position, v = new THREE.Vector3(), cols = [], k;
    for(k=0;k<p.count;k++){
      v.fromBufferAttribute(p, k);
      var ang = Math.atan2(v.z, v.x);
      var w = wob(v.x*3, v.y*3, v.z*3, 2.2), f = 0.5 + 0.5*Math.sin(ang*3 + v.y*4);
      v.multiplyScalar(1 + 0.14*w + 0.03*(f - 0.5));
      v.y *= 1.1;
      p.setXYZ(k, v.x, v.y, v.z);
      var c = mix(0xcfc0a2, 0xa99877, f*0.4 + 0.25*(0.5 + 0.5*w));
      c.lerp(new THREE.Color(0x56677e), Math.max(0, wob(v.x*3, v.y*3, v.z*3, 5) - 0.4) * 0.6);
      pushColor(cols, c);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:1 }));
    m.position.set(BASE.x, 0.2, BASE.z); m.castShadow = true; m.receiveShadow = true;
    world.add(m);
  })();

  world.position.y = 0;
  world.rotation.set(0.04, -0.5, 0);

  /* ---- formaat en bediening ---- */
  function draw(){ renderer.render(scene, camera); }
  function resize(){
    var w = host.clientWidth, h = host.clientHeight;
    if(!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w/h;
    camera.position.z = w/h < 1.1 ? 12.8 : 8.8;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 1.15, 0);
    draw();
  }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dragging = false, lx = 0, vx = 0;
  host.addEventListener('pointerdown', function(e){
    dragging = true; lx = e.clientX;
    try{ host.setPointerCapture(e.pointerId); }catch(_){}
  });
  host.addEventListener('pointermove', function(e){
    if(!dragging) return;
    vx = (e.clientX - lx) * 0.01;
    world.rotation.y += vx;
    lx = e.clientX;
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
