(function(){
  var host = document.getElementById('stage3d');
  var hero = document.getElementById('top');
  if(!host || typeof THREE === 'undefined') return;

  var renderer;
  try{
    renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  }catch(e){ return; }
  hero.classList.add('has-3d');
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 120);
  camera.position.set(0, 5.0, 17.2);
  camera.lookAt(0, 3.3, 0);

  /* ---- licht ---- */
  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x5a4a3c, 0.55));
  var key = new THREE.DirectionalLight(0xfff0d8, 1.35);
  key.position.set(6, 12, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -7; key.shadow.camera.right = 7;
  key.shadow.camera.top = 7; key.shadow.camera.bottom = -7;
  key.shadow.camera.near = 1; key.shadow.camera.far = 40;
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  key.shadow.radius = 5;
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xdce6ff, 0.35); fill.position.set(-9, 3, 6); scene.add(fill);
  var rim = new THREE.DirectionalLight(0xffe2b8, 0.6); rim.position.set(-3, 6, -10); scene.add(rim);
  var glow = new THREE.PointLight(0xffb86b, 0.9, 16, 2); glow.position.set(0, 6.6, 1.5); scene.add(glow);

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
  function radial(size, stops){
    var c = document.createElement('canvas'); c.width = c.height = size;
    var x = c.getContext('2d'), g = x.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    stops.forEach(function(s){ g.addColorStop(s[0], s[1]); });
    x.fillStyle = g; x.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  /* ---- bosbodem: aarde en mos ---- */
  (function(){
    var prof = [], i, n = 56;
    for(i=0;i<=n;i++) prof.push(new THREE.Vector2(i/n * 5.0, 0));
    prof.push(new THREE.Vector2(5.18, -0.08));
    prof.push(new THREE.Vector2(5.3, -0.55));
    prof.push(new THREE.Vector2(0.001, -0.6));
    prof.reverse();                       /* van onder naar boven, zodat de vlakken naar buiten wijzen */
    var geo = new THREE.LatheGeometry(prof, 128);
    var p = geo.attributes.position, v = new THREE.Vector3(), cols = [], k;
    for(k=0;k<p.count;k++){
      v.fromBufferAttribute(p, k);
      var r = Math.sqrt(v.x*v.x + v.z*v.z);
      var top = v.y > -0.02;
      if(top){
        v.y = 0.10 * wob(v.x*0.9, 0, v.z*0.9, 1.7) + 0.035 * Math.sin(v.x*6.1) * Math.cos(v.z*5.3);
        if(r > 4.4) v.y -= (r-4.4)*(r-4.4)*0.5;
      }
      p.setXYZ(k, v.x, v.y, v.z);
      var m = 0.5 + 0.5*wob(v.x*1.6, 1, v.z*1.6, 4.2);
      var c = top ? mix(0x384a24, 0x6f8a3c, m*0.9 + 0.1*hash(k)) : mix(0x2f2418, 0x4a3828, hash(k));
      if(top && r > 4.5) c.lerp(new THREE.Color(0x3a2c1e), Math.min(1, (r-4.5)*1.3));
      pushColor(cols, c);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    var ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:1 }));
    ground.receiveShadow = true;
    world.add(ground);

    /* grassprietjes en mosspruiten */
    var cnt = 700, blade = new THREE.ConeGeometry(0.035, 0.34, 4, 1);
    blade.translate(0, 0.17, 0);
    var inst = new THREE.InstancedMesh(blade, new THREE.MeshStandardMaterial({ roughness:0.9 }), cnt);
    var d = new THREE.Object3D(), col = new THREE.Color();
    for(i=0;i<cnt;i++){
      var ang = hash(i*3+1) * 6.2832, rr = Math.sqrt(hash(i*3+2)) * 4.7;
      var x = Math.cos(ang)*rr, z = Math.sin(ang)*rr;
      var y = 0.10 * wob(x*0.9, 0, z*0.9, 1.7) + 0.035 * Math.sin(x*6.1) * Math.cos(z*5.3);
      if(rr > 4.4) y -= (rr-4.4)*(rr-4.4)*0.5;
      d.position.set(x, y - 0.02, z);
      d.rotation.set((hash(i*7)-0.5)*0.7, hash(i*5)*6.28, (hash(i*11)-0.5)*0.7);
      var s = 0.6 + hash(i*13) * 1.1;
      d.scale.set(s, s * (0.6 + hash(i*17)*0.9), s);
      d.updateMatrix();
      inst.setMatrixAt(i, d.matrix);
      col.copy(mix(0x3d5a22, 0x93b04a, hash(i*19)));
      inst.setColorAt(i, col);
    }
    inst.castShadow = false; inst.receiveShadow = true;
    world.add(inst);

    /* een paar keitjes */
    for(i=0;i<9;i++){
      var pr = 0.07 + hash(i*29) * 0.1, pa = hash(i*31) * 6.28, pd = 2.2 + hash(i*37) * 2.4;
      var pb = new THREE.Mesh(new THREE.SphereGeometry(pr, 12, 10),
        new THREE.MeshStandardMaterial({ color: mix(0x7d7468, 0xa59b8b, hash(i*41)), roughness:0.95 }));
      pb.scale.set(1.2, 0.7, 1); pb.position.set(Math.cos(pa)*pd, pr*0.3, Math.sin(pa)*pd);
      pb.castShadow = true; pb.receiveShadow = true; world.add(pb);
    }
  })();

  /* ---- verse paddenstoel ---- */
  function freshMushroom(o){
    var g = new THREE.Group();
    var seed = o.seed;
    /* steel: gebogen, taps, met een lichte knol onderaan */
    var lean = o.lean || 0.2, lz = o.lz || 0.1;
    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.05, 0),
      new THREE.Vector3(lean*0.25, o.stemH*0.35, lz*0.2),
      new THREE.Vector3(lean*0.75, o.stemH*0.7, lz*0.8),
      new THREE.Vector3(lean, o.stemH, lz)
    ]);
    var rs = 14, ts = 48;
    var sg = new THREE.TubeGeometry(curve, ts, o.stemR, rs, false);
    var sp = sg.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3(), cols = [], k;
    for(k=0;k<sp.count;k++){
      var ring = Math.floor(k / (rs + 1)), tt = ring / ts;
      var ang = 6.2832 * (k % (rs + 1)) / rs;
      curve.getPointAt(Math.min(1, tt), c);
      v.fromBufferAttribute(sp, k).sub(c);
      var taper = 1.0 - 0.22*tt + 0.9*Math.pow(Math.max(0, 0.16 - tt)/0.16, 2) * 0.55;
      var fib = 1 + 0.035*Math.sin(ang*5 + tt*14 + seed) + 0.03*wob(c.x*2, c.y*2, c.z*2, seed);
      v.multiplyScalar(taper * fib).add(c);
      sp.setXYZ(k, v.x, v.y, v.z);
      /* lichte steel, blauwe verkleuring ("bruising") bij beschadiging, vooral onderaan */
      var col = mix(0xf1e9d6, 0xd9cdb0, 0.25 + 0.35*Math.sin(ang*7 + tt*20 + seed)*0.5 + 0.3*tt);
      var blue = Math.max(0, wob(c.x*3 + ang*0.4, c.y*4, c.z*3, seed*1.7)) * (0.25 + 0.75*(1 - tt)) * (o.blue === undefined ? 0.8 : o.blue);
      col.lerp(new THREE.Color(0x6b8bb6), Math.min(0.85, blue*1.1));
      pushColor(cols, col);
    }
    sg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    sg.computeVertexNormals();
    var stem = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:0.78 }));
    stem.castShadow = true; stem.receiveShadow = true;
    g.add(stem);

    /* hoed */
    var pts = [], n = 40, i, a, pw = o.pointed || 1.0;
    for(i=0;i<=n;i++){
      a = i/n * 1.50;
      var rr = o.capR * Math.sin(a);
      var yy = o.capH * Math.pow(Math.cos(a), pw);
      if(o.umbo && i < 6) yy += o.capH * 0.12 * (1 - i/6);
      pts.push(new THREE.Vector2(Math.max(rr, 0.0006), yy));
    }
    pts.push(new THREE.Vector2(o.capR * 1.005, o.capH * 0.02));
    pts.push(new THREE.Vector2(o.capR * 0.985, -o.capH * 0.06));
    pts.push(new THREE.Vector2(o.capR * 0.93, -o.capH * 0.10));
    var cg = new THREE.LatheGeometry(pts, 96);
    var cp = cg.attributes.position, ccols = [];
    for(k=0;k<cp.count;k++){
      v.fromBufferAttribute(cp, k);
      var r = Math.sqrt(v.x*v.x + v.z*v.z) / o.capR;
      var an = Math.atan2(v.z, v.x);
      var d = 1 + 0.035*wob(v.x*2, v.y*2, v.z*2, seed) + 0.012*Math.sin(an*9 + seed)*r;
      v.x *= d; v.z *= d;
      v.y += 0.02*o.capH*Math.sin(an*5 + seed*2)*r*r;
      cp.setXYZ(k, v.x, v.y, v.z);
      var stri = 0.5 + 0.5*Math.sin(an*46 + seed);                  /* radiale strepen aan de rand */
      var cc = mix(o.cc || 0x8a5a2c, o.ce || 0xdcc08c, Math.pow(r, 1.6));
      cc.lerp(new THREE.Color(0xf0e0b8), Math.max(0, r - 0.82) * 1.6 * stri * 0.6);
      cc.offsetHSL(0, 0, 0.03*(wob(v.x*4, v.y*4, v.z*4, seed*3)));
      var bl = Math.max(0, wob(v.x*5 + 1, v.y*5, v.z*5, seed*2.3) - 0.35) * (o.blue === undefined ? 0.8 : o.blue);
      cc.lerp(new THREE.Color(0x5f7fa8), Math.min(0.55, bl*0.9));
      pushColor(ccols, cc);
    }
    cg.setAttribute('color', new THREE.Float32BufferAttribute(ccols, 3));
    cg.computeVertexNormals();
    var capMat = new THREE.MeshPhysicalMaterial({ vertexColors:true, roughness:0.5, metalness:0, clearcoat:0.35, clearcoatRoughness:0.45, side:THREE.DoubleSide });
    var cap = new THREE.Mesh(cg, capMat);
    cap.castShadow = true; cap.receiveShadow = true;

    /* lamellen */
    var gp = [], m;
    for(m=0;m<=10;m++){
      var t = m/10;
      gp.push(new THREE.Vector2(o.capR*0.97*(1 - t) + 0.03, -o.capH*0.08*(1 - t) + o.capH*0.10*t - o.capH*0.02));
    }
    var gg = new THREE.LatheGeometry(gp, 140);
    var gpos = gg.attributes.position, gcols = [];
    for(k=0;k<gpos.count;k++){
      v.fromBufferAttribute(gpos, k);
      var gr = Math.sqrt(v.x*v.x + v.z*v.z) / o.capR, ga = Math.atan2(v.z, v.x);
      var ridge = Math.sin(ga * 44 + seed);
      v.y += 0.018 * ridge * gr;
      gpos.setXYZ(k, v.x, v.y, v.z);
      pushColor(gcols, mix(0x6a4a52, 0x2f1f2c, 0.35 + 0.4*(0.5 + 0.5*ridge) + 0.2*(1 - gr)));
    }
    gg.setAttribute('color', new THREE.Float32BufferAttribute(gcols, 3));
    gg.computeVertexNormals();
    var gills = new THREE.Mesh(gg, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:0.9, side:THREE.DoubleSide }));
    gills.castShadow = true;

    var tip = new THREE.Group();
    tip.add(cap); tip.add(gills);
    tip.position.copy(curve.getPointAt(1));
    tip.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), curve.getTangentAt(1).normalize());
    tip.rotateY(seed);
    g.add(tip);

    g.position.set(o.x, 0.04, o.z);
    g.rotation.y = o.ry || 0;
    world.add(g);
    return g;
  }

  /* vormen van enkele Psilocybe-soorten */
  freshMushroom({ x:-2.7, z: 0.4, stemH:3.1, stemR:0.075, capR:0.52, capH:1.15, pointed:1.9, umbo:true, lean:-0.25, lz:0.1, seed:1.0, cc:0x7c5a30, ce:0xcdb27e, blue:0.9 });  /* spitskegelkaal */
  freshMushroom({ x:-0.9, z:-0.7, stemH:2.5, stemR:0.15, capR:1.05, capH:0.62, pointed:0.85, lean:0.22, lz:-0.12, seed:2.3, cc:0x8f5d2a, ce:0xe0c48e, blue:0.85, ry:0.4 }); /* cubensis */
  freshMushroom({ x: 1.6, z:-0.2, stemH:2.1, stemR:0.12, capR:0.78, capH:0.5, pointed:0.9, umbo:true, lean:0.32, lz:0.14, seed:3.7, cc:0xa8622a, ce:0xe6c690, blue:0.8, ry:-0.6 });   /* cyanescens */
  freshMushroom({ x: 2.9, z: 1.3, stemH:1.5, stemR:0.095, capR:0.55, capH:0.36, pointed:0.9, lean:-0.2, lz:0.1, seed:5.1, cc:0x92602e, ce:0xdcc18a, blue:0.9, ry:1.1 });
  freshMushroom({ x: 0.5, z: 1.9, stemH:1.7, stemR:0.1, capR:0.6, capH:0.4, pointed:0.9, lean:0.18, lz:0.2, seed:6.4, cc:0x8f5f30, ce:0xdfc590, blue:0.8, ry:2.0 });
  freshMushroom({ x:-1.9, z: 2.1, stemH:1.0, stemR:0.07, capR:0.4, capH:0.27, pointed:0.9, lean:0.12, lz:-0.1, seed:7.7, cc:0x8a5a2c, ce:0xd8bd88, blue:0.9, ry:0.9 });
  freshMushroom({ x: 1.1, z:-2.1, stemH:1.3, stemR:0.08, capR:0.42, capH:0.3, pointed:1.0, lean:-0.15, lz:0.12, seed:8.9, cc:0x946230, ce:0xdec48e, blue:0.85, ry:-1.4 });

  /* ---- truffels (sclerotia): knobbelig, gemarmerd ---- */
  function truffle(r, x, z, seed, c1, c2){
    var geo = new THREE.SphereGeometry(r, 56, 40);
    var p = geo.attributes.position, v = new THREE.Vector3(), cols = [], k;
    for(k=0;k<p.count;k++){
      v.fromBufferAttribute(p, k);
      var n1 = wob(v.x*2.2, v.y*2.2, v.z*2.2, seed), n2 = wob(v.x*7, v.y*7, v.z*7, seed*1.9);
      v.multiplyScalar(1 + 0.22*n1 + 0.06*n2);
      v.y *= 0.78;
      p.setXYZ(k, v.x, v.y, v.z);
      var veins = Math.abs(Math.sin(v.x*9 + wob(v.y*5, v.z*5, v.x*5, seed)*3));
      var cc = mix(c1, c2, 0.5 + 0.5*n1);
      cc.lerp(new THREE.Color(0x3a2616), (1 - veins) * 0.28 + Math.max(0, n2) * 0.18);
      pushColor(cols, cc);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:0.88 }));
    m.position.set(x, r*0.55, z); m.rotation.y = seed;
    m.castShadow = true; m.receiveShadow = true;
    world.add(m);
  }
  truffle(0.58, -3.4, 1.9, 1.1, 0xbf9a62, 0x8b6638);
  truffle(0.44,  2.2, 2.4, 2.4, 0xc7a46b, 0x94693a);
  truffle(0.36,  0.7, 3.0, 3.7, 0xb78f58, 0x7d5a33);
  truffle(0.32, -2.2,-2.0, 4.9, 0xc2a066, 0x8a6236);
  truffle(0.28,  3.4,-0.9, 6.1, 0xbb965e, 0x876034);

  /* ---- psilocybine-molecuul: nauwkeurig 3D-model, zonder waterstof ---- */
  var mol = new THREE.Group();
  (function(){
    if(typeof MOLECULES === 'undefined') return;
    var d = MOLECULES.psilocybine;
    var COLOR = { C:0x4a4a52, N:0x3a63d6, O:0xd9382c, P:0xf08a24 }, RADIUS = { C:0.36, N:0.38, O:0.38, P:0.50 };
    var idx = [], pos = [], nb = [];
    d.atoms.forEach(function(a, i){ if(a[0] === 'H'){ pos.push(null); nb.push([]); return; }
      pos.push(new THREE.Vector3(a[1], a[2], a[3])); nb.push([]); });
    var mn = new THREE.Vector3(1e9,1e9,1e9), mx = new THREE.Vector3(-1e9,-1e9,-1e9);
    pos.forEach(function(p){ if(p){ mn.min(p); mx.max(p); } });
    var ctr = mn.clone().add(mx).multiplyScalar(0.5);
    pos.forEach(function(p){ if(p) p.sub(ctr); });
    d.bonds.forEach(function(b){ if(pos[b[0]] && pos[b[1]]){ nb[b[0]].push(b[1]); nb[b[1]].push(b[0]); } });
    var sph = new THREE.SphereGeometry(1, 36, 26), cyl = new THREE.CylinderGeometry(1, 1, 1, 12, 1, true), mats = {};
    function mat(el){ return mats[el] || (mats[el] = new THREE.MeshStandardMaterial({ color:COLOR[el], roughness:0.28, metalness:0.12 })); }
    d.atoms.forEach(function(a, i){
      if(!pos[i]) return;
      var s = new THREE.Mesh(sph, mat(a[0])); s.scale.setScalar(RADIUS[a[0]]); s.position.copy(pos[i]); mol.add(s);
    });
    function bondPart(p1, p2, r, el){
      var len = p1.distanceTo(p2), m = new THREE.Mesh(cyl, mat(el));
      m.scale.set(r, len, r); m.position.copy(p1).add(p2).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), p2.clone().sub(p1).normalize()); mol.add(m);
    }
    d.bonds.forEach(function(b){
      var i = b[0], j = b[1];
      if(!pos[i] || !pos[j]) return;
      var a = pos[i], c = pos[j], mid = a.clone().add(c).multiplyScalar(0.5), dir = c.clone().sub(a).normalize();
      var offs = [new THREE.Vector3()], r = 0.11;
      if(b[2] === 2){
        var ref = null, k;
        for(k=0;k<nb[i].length;k++){ if(nb[i][k] !== j){ ref = pos[nb[i][k]]; break; } }
        if(!ref){ for(k=0;k<nb[j].length;k++){ if(nb[j][k] !== i){ ref = pos[nb[j][k]]; break; } } }
        var nrm = ref ? dir.clone().cross(ref.clone().sub(a)) : new THREE.Vector3(0,0,1);
        if(nrm.lengthSq() < 1e-6) nrm.set(0,0,1);
        var side = nrm.clone().cross(dir).normalize().multiplyScalar(0.13);
        offs = [side.clone(), side.clone().negate()]; r = 0.075;
      }
      offs.forEach(function(o){
        bondPart(a.clone().add(o), mid.clone().add(o), r, d.atoms[i][0]);
        bondPart(mid.clone().add(o), c.clone().add(o), r, d.atoms[j][0]);
      });
    });
    mol.children.forEach(function(m){ m.castShadow = false; });
  })();
  mol.scale.setScalar(0.6);
  mol.position.set(0, 6.3, 0);
  scene.add(mol);

  /* zachte gloed achter het molecuul */
  var halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radial(128, [[0, 'rgba(255,200,120,0.55)'], [0.45, 'rgba(255,200,120,0.18)'], [1, 'rgba(255,200,120,0)']]),
    transparent:true, depthWrite:false }));
  halo.scale.set(7.5, 7.5, 1); halo.position.set(0, 6.3, -1.2);
  scene.add(halo);

  /* ---- zwevende sporen ---- */
  var N = 140, sp = new Float32Array(N * 3), spd = new Float32Array(N), i;
  for(i=0;i<N;i++){
    var aa = hash(i*3.3) * 6.2832, rr = 1 + Math.sqrt(hash(i*5.1)) * 5.2;
    sp[i*3] = Math.cos(aa) * rr; sp[i*3+1] = hash(i*7.7) * 9; sp[i*3+2] = Math.sin(aa) * rr;
    spd[i] = 0.12 + hash(i*9.9) * 0.25;
  }
  var pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  var spores = new THREE.Points(pg, new THREE.PointsMaterial({
    map: radial(32, [[0, 'rgba(255,236,200,0.95)'], [0.5, 'rgba(255,236,200,0.35)'], [1, 'rgba(255,236,200,0)']]),
    size: 0.2, transparent:true, opacity:0.7, depthWrite:false, sizeAttenuation:true }));
  world.add(spores);

  /* ---- formaat ---- */
  function resize(){
    var w = host.clientWidth, h = host.clientHeight;
    if(!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w/h;
    camera.position.z = w/h < 1.1 ? 21 : 17.2;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 3.3, 0);
    draw();
  }
  function draw(){ renderer.render(scene, camera); }

  /* ---- slepen om te draaien ---- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dragging = false, lastX = 0, vel = 0;
  world.rotation.y = -0.5;
  host.addEventListener('pointerdown', function(e){
    dragging = true; lastX = e.clientX;
    try{ host.setPointerCapture(e.pointerId); }catch(_){}
  });
  host.addEventListener('pointermove', function(e){
    if(!dragging) return;
    vel = (e.clientX - lastX) * 0.01;
    world.rotation.y += vel;
    lastX = e.clientX;
    if(reduce) draw();
  });
  function stop(){ dragging = false; }
  host.addEventListener('pointerup', stop);
  host.addEventListener('pointercancel', stop);

  /* ---- animatie ---- */
  var visible = true, t0 = performance.now(), last = t0;
  function loop(now){
    requestAnimationFrame(loop);
    if(!visible || reduce) return;
    var s = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
    if(!dragging){ vel *= 0.95; world.rotation.y += 0.0035 + vel; }
    mol.rotation.y = s * 0.5;
    mol.rotation.x = Math.sin(s * 0.4) * 0.22;
    mol.position.y = 6.3 + Math.sin(s * 1.1) * 0.15;
    var arr = pg.attributes.position.array, k;
    for(k=0;k<N;k++){
      arr[k*3+1] += spd[k] * dt;
      arr[k*3] += Math.sin(s*0.6 + k) * 0.002;
      if(arr[k*3+1] > 9) arr[k*3+1] = 0.2;
    }
    pg.attributes.position.needsUpdate = true;
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
