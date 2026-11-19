// Link publicado desta página (os QR apontam para ele + #p<ID_PROMOB>)
const BASE_URL = "https://agilesolution.com.br/qr-montagem/";

// Peças do pedido 121709 (XML Builder PDV_1_121709). Medidas em mm. Posição = aproximação pela descrição.
// box: [x0,x1, y0,y1, z0,z1]  (x = largura, y = altura, z = profundidade, frente = z maior)
const PECAS = [
  {id:"406596", nome:"Lateral esquerda", desc:"Lateral linear cozinha Esquerda c/ ranhura e furação - Neve", dim:"552 × 370 × 18", mat:"MDF 18mm 2F Neve", des:"STA00100180A", mod:"406594", acab:"mdf",
   onde:"Lado ESQUERDO do gabinete (olhando de frente). Ranhura para dentro, furação de cima para as travessas.", box:[0,18, 0,552, 0,370]},
  {id:"406595", nome:"Lateral direita", desc:"Lateral linear cozinha Direita c/ ranhura e furação - Neve", dim:"552 × 370 × 18", mat:"MDF 18mm 2F Neve", des:"STA00100179A", mod:"406594", acab:"mdf",
   onde:"Lado DIREITO do gabinete (olhando de frente). Ranhura para dentro.", box:[662,680, 0,552, 0,370]},
  {id:"406611", nome:"Base inferior", desc:"Base Inferior linear c/ ranhura e furação - Neve", dim:"644 × 370 × 18", mat:"MDF 18mm 2F Neve", des:"RET00065597A", mod:"406594", acab:"mdf",
   onde:"Fundo do gabinete, entre as duas laterais, rente ao chão do móvel.", box:[18,662, 0,18, 0,370]},
  {id:"406617", nome:"Prateleira", desc:"Prateleira linear c/ furação - Neve", dim:"644 × 360 × 18", mat:"MDF 18mm 2F Neve", des:"PRA00035911A", mod:"406594", acab:"mdf",
   onde:"No meio do gabinete, sobre 4 suportes (kit de suportes de prateleira). 10 mm recuada da frente.", box:[18,662, 267,285, 0,360]},
  {id:"406694", nome:"Travessa superior traseira", desc:"Travessa linear c/ furação - Neve", dim:"644 × 80 × 18", mat:"MDF 18mm 2F Neve", des:"TRA00020961A", mod:"406692", acab:"mdf",
   onde:"Em cima, ATRÁS, entre as laterais. É a travessa por onde o gabinete é fixado na parede (cantoneiras).", box:[18,662, 534,552, 0,80]},
  {id:"406693", nome:"Travessa superior frontal", desc:"Travessa linear c/ furação - Neve", dim:"644 × 80 × 18", mat:"MDF 18mm 2F Neve", des:"TRA00020961A", mod:"406692", acab:"mdf",
   onde:"Em cima, na FRENTE, entre as laterais. Igual à traseira (mesmo desenho), troque se precisar.", box:[18,662, 534,552, 290,370]},
  {id:"406651", nome:"Porta esquerda", desc:"Porta inferior Dob. Reta Veio vert. Orion", dim:"548 × 336,5 × 18,5", mat:"Órion (veio vertical)", des:"VEI00031144A", mod:"406633", acab:"orion",
   onde:"Porta da ESQUERDA, dobradiça do lado esquerdo. Veio na vertical. Puxador Thin no topo.", box:[3,339.5, 3,549, 370,388.5]},
  {id:"406674", nome:"Porta direita", desc:"Porta inferior Dob. Reta Veio vert. Orion", dim:"548 × 336,5 × 18,5", mat:"Órion (veio vertical)", des:"VEI00031145A", mod:"406656", acab:"orion",
   onde:"Porta da DIREITA, dobradiça do lado direito. Veio na vertical. Puxador Thin no topo.", box:[340.5,677, 3,549, 370,388.5]},
  {id:"406592", nome:"Vista de fechamento", desc:"Vista fechamento Órion", dim:"552 × 80 × 18", mat:"Órion", des:"—", mod:"406592", acab:"orion",
   onde:"Fechamento à DIREITA do gabinete, na frente, até a parede lateral.", box:[680,760, 0,552, 370,388]},
  {id:"406591", nome:"Painel lateral", desc:"Painel Linear 18mm Órion", dim:"552 × 393 × 18", mat:"Órion", des:"—", mod:"406590", acab:"orion",
   onde:"Painel de acabamento por FORA da lateral esquerda, alinhado com a frente das portas.", box:[-18,0, 0,552, 0,393]},
];
const EXTRAS = [ // puxadores: não recebem etiqueta, só aparecem no 3D
  {box:[3,339.5, 549,560.5, 349.5,388.5], acab:"metal"}, {box:[340.5,677, 549,560.5, 349.5,388.5], acab:"metal"}
];

const $ = s => document.querySelector(s);
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
let sel = null, portasOcultas = false;

// ---------- 3D ----------
const cv = $("#cv");
const renderer = new THREE.WebGLRenderer({canvas:cv, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(35, 1, 10, 20000);
scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.85));
const sun = new THREE.DirectionalLight(0xffffff, 0.6); sun.position.set(600, 1200, 1400); scene.add(sun);
const grp = new THREE.Group(); scene.add(grp);
const CENTER = new THREE.Vector3(371, 276, 196);
const baseColor = acab => acab === "orion" ? css("--orion") : acab === "metal" ? "#8d9496" : css("--mdf");

function addBox(b, acab, peca){
  const [x0,x1,y0,y1,z0,z1] = b;
  const g = new THREE.BoxGeometry(x1-x0, y1-y0, z1-z0);
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({color:new THREE.Color(baseColor(acab)), transparent:true}));
  m.position.set((x0+x1)/2-CENTER.x, (y0+y1)/2-CENTER.y, (z0+z1)/2-CENTER.z);
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({color:0x4a5552, transparent:true, opacity:.55}));
  m.add(e); m.userData = {peca, acab, edge:e}; grp.add(m); return m;
}
const meshes = PECAS.map(p => (p.mesh = addBox(p.box, p.acab, p)));
EXTRAS.forEach(x => addBox(x.box, x.acab, null));

function paint(){
  grp.children.forEach(m => {
    const p = m.userData.peca, isSel = !!(p && sel && p.id === sel.id);
    const frente = p ? /Porta/.test(p.nome) : true;   // portas e puxadores
    m.material.color.set(isSel ? css("--red") : baseColor(m.userData.acab));
    let op = 1;
    if (sel && !isSel) op = document.body.classList.contains("montador") ? (m.userData.acab === "mdf" ? .45 : .16) : .55;
    if (frente && !isSel && (portasOcultas || (sel && !/Porta/.test(sel.nome)))) op = .12;
    m.material.opacity = op; m.material.depthWrite = op > .5; m.userData.edge.material.opacity = op < .5 ? .15 : .55;
  });
}

// órbita simples (arrastar, pinça, roda)
let yaw = -0.55, pitch = 0.32, dist = 2300;
function placeCam(){ const d = dist * Math.max(1, 0.95 / (cam.aspect || 1)); cam.position.set(Math.sin(yaw)*Math.cos(pitch)*d, Math.sin(pitch)*d, Math.cos(yaw)*Math.cos(pitch)*d); cam.lookAt(0,0,0); }
function resize(){ const r = cv.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); cam.aspect = r.width/Math.max(r.height,1); cam.updateProjectionMatrix(); placeCam(); }
new ResizeObserver(resize).observe(cv);
const pts = new Map();
cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, {x:e.clientX, y:e.clientY, x0:e.clientX, y0:e.clientY}); });
cv.addEventListener("pointermove", e => {
  const p = pts.get(e.pointerId); if (!p) return;
  if (pts.size === 2){
    const [a,b] = [...pts.values()]; const d0 = Math.hypot(a.x-b.x, a.y-b.y);
    p.x = e.clientX; p.y = e.clientY; const d1 = Math.hypot(a.x-b.x, a.y-b.y);
    if (d1 > 0) dist = Math.min(6000, Math.max(700, dist * d0 / d1));
  } else {
    yaw -= (e.clientX-p.x)*0.008; pitch = Math.min(1.35, Math.max(-0.2, pitch + (e.clientY-p.y)*0.006));
    p.x = e.clientX; p.y = e.clientY;
  }
  placeCam();
});
const ray = new THREE.Raycaster();
cv.addEventListener("pointerup", e => {
  const p = pts.get(e.pointerId); pts.delete(e.pointerId);
  if (p && Math.hypot(e.clientX-p.x0, e.clientY-p.y0) < 6 && pts.size === 0){
    const r = cv.getBoundingClientRect();
    ray.setFromCamera({x:((e.clientX-r.left)/r.width)*2-1, y:-((e.clientY-r.top)/r.height)*2+1}, cam);
    const hits = ray.intersectObjects(meshes, false);
    const hit = hits.find(h => h.object.material.opacity > .3) || hits[0];
    if (hit) go(hit.object.userData.peca.id);
  }
});
cv.addEventListener("pointercancel", e => pts.delete(e.pointerId));
cv.addEventListener("wheel", e => { e.preventDefault(); dist = Math.min(6000, Math.max(700, dist * (1 + e.deltaY*0.001))); placeCam(); }, {passive:false});

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
function loop(t){
  if (sel && !reduce){ const k = 1 + .18*Math.sin(t/260); sel.mesh.material.color.set(css("--red")).multiplyScalar(k); }
  renderer.render(scene, cam); requestAnimationFrame(loop);
}

// ---------- ficha ----------
function go(id){ if (location.hash !== "#p"+id) location.hash = "p"+id; else show(); }
function show(){
  const id = (location.hash.match(/^#p(\d+)$/) || [])[1];
  sel = PECAS.find(p => p.id === id) || null;
  const montador = !!sel;
  document.body.classList.toggle("montador", montador);
  $("#dFicha").open = !montador;
  $("#dLista").open = !montador;
  dist = montador ? 1550 : 2300;
  requestAnimationFrame(resize);
  if (sel){
    const i = PECAS.indexOf(sel) + 1;
    $("#cnt").textContent = `Pedido 121709 · WC Social · peça ${i} de ${PECAS.length}`;
    $("#nome").textContent = sel.nome;
    $("#ttl").textContent = sel.nome;
    $("#onde").textContent = sel.onde;
    $("#ficha").innerHTML = [["Descrição", sel.desc], ["Medida", sel.dim + " mm"], ["Material", sel.mat], ["Desenho", sel.des], ["Módulo Promob", sel.mod], ["Peça Promob", sel.id], ["Pedido", "121709 · WC Social"]]
      .map(([k,v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
    if (/Porta/.test(sel.nome)) { yaw = -0.35; pitch = 0.2; }
    else if (/esquerda|Painel/i.test(sel.nome)) { yaw = -1.0; pitch = 0.35; }
    else if (/direita|Vista/i.test(sel.nome)) { yaw = 0.8; pitch = 0.35; }
    else { yaw = -0.45; pitch = 0.55; }
    placeCam();
    document.title = sel.nome + " | Onde vai esta peça";
  } else {
    $("#cnt").textContent = "Gabinete WC Social · 10 peças";
    $("#nome").textContent = "Toque numa peça ou leia uma etiqueta";
    $("#ttl").textContent = "Onde vai esta peça?";
    $("#onde").textContent = "Leia o QR de uma etiqueta abaixo com a câmera do celular.";
    $("#ficha").innerHTML = "";
    document.title = "QR de Montagem | Agile Solution";
    placeCam();
  }
  $("#lista").innerHTML = PECAS.map((p,i) => `<div class="row${sel===p?" on":""}" tabindex="0" role="button" data-id="${p.id}"><span class="n">${String(i+1).padStart(2,"0")}</span><span class="sw" style="background:${sel===p?"var(--red)":p.acab==="orion"?"var(--orion)":"var(--mdf)"}"></span>${p.nome}</div>`).join("");
  paint();
}
const toTop = () => scrollTo({top:0, behavior: reduce ? "auto" : "smooth"});
$("#lista").addEventListener("click", e => { const r = e.target.closest(".row"); if (r) { go(r.dataset.id); toTop(); } });
$("#lista").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.dataset.id) go(e.target.dataset.id); });
$("#bReset").onclick = () => { yaw = -0.55; pitch = 0.32; dist = 2300; placeCam(); };
$("#bPortas").onclick = () => { portasOcultas = !portasOcultas; $("#bPortas").textContent = portasOcultas ? "Mostrar portas" : "Esconder portas"; paint(); };
addEventListener("hashchange", show);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paint);
new MutationObserver(paint).observe(document.documentElement, {attributes:true, attributeFilter:["data-theme"]});

// ---------- etiquetas ----------
$("#sheet").innerHTML = PECAS.map((p,i) => `
  <div class="lbl" tabindex="0" role="button" data-id="${p.id}" aria-label="Etiqueta ${p.nome}">
    <div class="t">${p.desc}</div>
    <div>PED 121709 · WC SOCIAL<br>${p.dim} mm<br>${p.mat}<br>DES ${p.des}<br>MOD ${p.mod}</div>
    <div class="qr" id="qr${p.id}"></div>
    <div class="ft"><span>ROMANZZA</span><span>${String(i+1).padStart(2,"0")}/${PECAS.length} · P${p.id}</span></div>
  </div>`).join("");
PECAS.forEach(p => { try { new QRCode(document.getElementById("qr"+p.id), {text: BASE_URL + "#p" + p.id, width:172, height:172, correctLevel: QRCode.CorrectLevel.M}); } catch(e){} });
$("#sheet").addEventListener("click", e => { const l = e.target.closest(".lbl"); if (l) { go(l.dataset.id); toTop(); } });
$("#sheet").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.dataset.id) go(e.target.dataset.id); });

placeCam(); resize(); show(); requestAnimationFrame(loop);
