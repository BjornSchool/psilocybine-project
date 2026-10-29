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
  host.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 4.6, 18.5);
  camera.lookAt(0, 3.0, 0);

  scene.add(new THREE.HemisphereLight(0xfff3dc, 0x4b3050, 0.55));
  var sun = new THREE.DirectionalLight(0xffffff, 0.6);
  sun.position.set(5, 9, 6);
  scene.add(sun);
  var glow = new THREE.PointLight(0xffb347, 1.2, 14);
  glow.position.set(0, 6.0, 1);
  scene.add(glow);

  var world = new THREE.Group();
  scene.add(world);

  /* ---- bodem ---- */
  var ground = new THREE.Mesh(
    new THREE.CylinderGeometry(5.2, 5.6, 0.5, 48),
    new THREE.MeshStandardMaterial({ color:0x4a3a2a, roughness:1 })
  );
  ground.position.y = -0.25;
  world.add(ground);
  var moss = new THREE.Mesh(
    new THREE.CylinderGeometry(5.0, 5.0, 0.06, 48),
    new THREE.MeshStandardMaterial({ color:0x4a5a30, roughness:1 })
  );
  moss.position.y = 0.02;
  world.add(moss);

  /* ---- paddenstoelen ---- */
  function mushroom(o){
    var g = new THREE.Group();
    var pts = [];
    var n = 22, i, t, a, x, y;
    for(i=0;i<=n;i++){
      t = i/n; a = t*1.45;
      x = o.capR*Math.sin(a);
      y = o.capH*Math.pow(Math.cos(a), o.pointed || 1);
      pts.push(new THREE.Vector2(Math.max(x,0.001), y));
    }
    pts.push(new THREE.Vector2(o.capR*0.96, -o.capH*0.12));
    pts.push(new THREE.Vector2(o.stemR*1.4, -o.capH*0.1));
    var cap = new THREE.Mesh(
      new THREE.LatheGeometry(pts, 40),
      new THREE.MeshStandardMaterial({ color:o.cap, roughness:0.55, side:THREE.DoubleSide })
    );
    cap.position.y = o.stemH;
    g.add(cap);
    if(o.knob){
      var k = new THREE.Mesh(new THREE.SphereGeometry(o.capR*0.28, 16, 12),
        new THREE.MeshStandardMaterial({ color:o.cap, roughness:0.6 }));
      k.position.y = o.stemH + o.capH*0.95;
      g.add(k);
    }
    var gills = new THREE.Mesh(
      new THREE.CircleGeometry(o.capR*0.95, 40),
      new THREE.MeshStandardMaterial({ color:0x4b2f45, roughness:0.9, side:THREE.DoubleSide })
    );
    gills.rotation.x = Math.PI/2;
    gills.position.y = o.stemH - o.capH*0.1;
    g.add(gills);
    var stem = new THREE.Mesh(
      new THREE.CylinderGeometry(o.stemR*0.75, o.stemR, o.stemH, 16),
      new THREE.MeshStandardMaterial({ color:0xeadfc4, roughness:0.8, emissive:0x1a2b55, emissiveIntensity:0.12 })
    );
    stem.position.y = o.stemH/2;
    g.add(stem);
    g.position.set(o.x, 0, o.z);
    g.rotation.z = o.tilt || 0;
    g.rotation.y = o.spin || 0;
    world.add(g);
    return g;
  }

  mushroom({ x:-2.6, z: 0.6, capR:0.55, capH:1.15, pointed:1.7, stemH:2.6, stemR:0.09, cap:0xb89a5a, tilt:0.05 });
  mushroom({ x: 0.3,  z:-0.4, capR:1.15, capH:0.75, stemH:2.0, stemR:0.23, cap:0xc99a55 });
  mushroom({ x: 2.7,  z: 0.4, capR:0.9,  capH:0.5,  stemH:1.6, stemR:0.17, cap:0xc2742f, knob:true, tilt:-0.06 });
  mushroom({ x:-1.0,  z: 2.2, capR:0.6,  capH:0.4,  stemH:1.0, stemR:0.12, cap:0xd0a560, tilt:0.1 });
  mushroom({ x: 1.6,  z:-2.2, capR:0.5,  capH:0.4,  stemH:1.2, stemR:0.1,  cap:0xc99a55, tilt:-0.08 });

  /* ---- truffels (sclerotia) ---- */
  function truffle(r, x, z, color, seed){
    var geo = new THREE.IcosahedronGeometry(r, 3);
    var p = geo.attributes.position, v = new THREE.Vector3(), k;
    for(k=0;k<p.count;k++){
      v.fromBufferAttribute(p, k);
      var d = 1 + 0.10*Math.sin(v.x*4+seed) * Math.cos(v.y*5+seed*1.7)
                + 0.07*Math.sin(v.z*7+seed*0.6);
      v.multiplyScalar(d);
      v.y *= 0.82;
      p.setXYZ(k, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color:color, roughness:0.95 }));
    m.position.set(x, r*0.7, z);
    m.rotation.y = seed;
    world.add(m);
  }
  truffle(0.55, -3.2, 2.3, 0xb5834a, 1.1);
  truffle(0.42,  0.9,  1.7, 0x9c6a38, 2.4);
  truffle(0.34,  1.6,  2.5, 0xc19a62, 3.7);
  truffle(0.30, -2.0, -1.8, 0xa8763f, 4.9);

  /* ---- psilocybine-molecuul (schematisch, zonder H) ---- */
  var A = {
    C7a:[1.212,0.7,0,'C'], C7:[0,1.4,0,'C'], C6:[-1.212,0.7,0,'C'], C5:[-1.212,-0.7,0,'C'],
    C4:[0,-1.4,0,'C'], C3a:[1.212,-0.7,0,'C'],
    N1:[2.5,0.7,0,'N'], C2:[3.15,-0.45,0,'C'], C3:[2.45,-1.45,0,'C'],
    Ca:[2.85,-2.75,0.3,'C'], Cb:[3.0,-4.1,-0.2,'C'], N:[4.4,-4.6,0,'N'],
    Me1:[5.2,-3.5,0.7,'C'], Me2:[4.7,-6.0,-0.4,'C'],
    O:[-0.4,-2.75,0,'O'], P:[-0.4,-4.15,0,'P'],
    O1:[-1.8,-4.8,0.7,'O'], O2:[0.9,-4.8,0.7,'O'], O3:[-0.4,-5.4,-1.0,'O']
  };
  var B = [['C7a','C7'],['C7','C6'],['C6','C5'],['C5','C4'],['C4','C3a'],['C3a','C7a'],
    ['C7a','N1'],['N1','C2'],['C2','C3'],['C3','C3a'],['C3','Ca'],['Ca','Cb'],['Cb','N'],
    ['N','Me1'],['N','Me2'],['C4','O'],['O','P'],['P','O1'],['P','O2'],['P','O3']];
  var COL = { C:0x3a3a3a, N:0x3b6fd4, O:0xd0392f, P:0xe8902a };
  var RAD = { C:0.42, N:0.44, O:0.42, P:0.55 };

  var mol = new THREE.Group();
  var key, c = new THREE.Vector3(), cnt = 0;
  for(key in A){ c.x+=A[key][0]; c.y+=A[key][1]; c.z+=A[key][2]; cnt++; }
  c.divideScalar(cnt);
  function pos(k){ return new THREE.Vector3(A[k][0]-c.x, A[k][1]-c.y, A[k][2]-c.z); }
  for(key in A){
    var at = new THREE.Mesh(new THREE.SphereGeometry(RAD[A[key][3]], 24, 18),
      new THREE.MeshStandardMaterial({ color:COL[A[key][3]], roughness:0.35, metalness:0.1 }));
    at.position.copy(pos(key));
    mol.add(at);
  }
  B.forEach(function(b){
    var p1 = pos(b[0]), p2 = pos(b[1]);
    var len = p1.distanceTo(p2);
    var bond = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, len, 10),
      new THREE.MeshStandardMaterial({ color:0xd8d0c0, roughness:0.5 }));
    bond.position.copy(p1).add(p2).multiplyScalar(0.5);
    bond.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), p2.clone().sub(p1).normalize());
    mol.add(bond);
  });
  mol.scale.setScalar(0.5);
  mol.position.set(0, 6.3, 0);
  scene.add(mol);

  /* ---- formaat ---- */
  function resize(){
    var w = host.clientWidth, h = host.clientHeight;
    if(!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    draw();
  }
  function draw(){ renderer.render(scene, camera); }

  /* ---- slepen om te draaien ---- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dragging = false, lastX = 0, vel = 0;
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
  var visible = true, t0 = performance.now();
  function loop(now){
    requestAnimationFrame(loop);
    if(!visible || reduce) return;
    var s = (now - t0)/1000;
    if(!dragging){
      vel *= 0.95;
      world.rotation.y += 0.0035 + vel;
    }
    mol.rotation.y = s*0.6;
    mol.rotation.x = Math.sin(s*0.4)*0.25;
    mol.position.y = 6.3 + Math.sin(s*1.1)*0.15;
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
