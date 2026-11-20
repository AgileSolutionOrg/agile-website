"use strict";
// Romanzza Montagem (antes "QR de Montagem") — lê o pedido gerado a partir do XML do Builder (pedidos/<n>.json) e mostra a peça no móvel.
// Endereços: #<pedido> = folha do pedido; #<pedido>-p<idPeca> = modo montador (aberto pela etiqueta).
const BASE_URL = "https://agilesolution.com.br/qr-montagem/";
const PEDIDOS = ["120949", "121570", "121694", "121709"];

const $ = s => document.querySelector(s);
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const cache = {};
let ped = null, movel = null, sel = null, grupoSel = [], aviso = "", portasOcultas = false;

// ---------- 3D ----------
const cv = $("#cv");
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(35, 1, 10, 50000);
scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.85));
const sun = new THREE.DirectionalLight(0xffffff, 0.6); sun.position.set(600, 1200, 1400); scene.add(sun);
const grp = new THREE.Group(); scene.add(grp);
let meshes = [], centro = new THREE.Vector3(), raio = 1000;
const ehFrente = p => p && (p.tipo === "porta" || p.tipo === "frente");
const corBase = p => (p && (ehFrente(p) || p.solo)) ? css("--orion") : css("--mdf");

function montarCena() {
  grp.clear(); meshes = [];
  const bb = new THREE.Box3();
  for (const p of movel.pecas.filter(q => q.box)) {
    const [x0, x1, y0, y1, z0, z1] = p.box;
    const g = new THREE.BoxGeometry(Math.max(x1 - x0, 1), Math.max(y1 - y0, 1), Math.max(z1 - z0, 1));
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: new THREE.Color(corBase(p)), transparent: true }));
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: 0x4a5552, transparent: true, opacity: .55 }));
    m.add(e); m.userData = { p, e }; grp.add(m); meshes.push(m); p.mesh = m;
    bb.expandByPoint(new THREE.Vector3(x0, y0, z0)); bb.expandByPoint(new THREE.Vector3(x1, y1, z1));
  }
  if (bb.isEmpty()) bb.set(new THREE.Vector3(0, 0, 0), new THREE.Vector3(500, 500, 500));
  bb.getCenter(centro); raio = Math.max(bb.getSize(new THREE.Vector3()).length() / 2, 200);
  grp.position.copy(centro).multiplyScalar(-1);
}
function paint() {
  const mont = document.body.classList.contains("montador");
  const selEhFrente = ehFrente(sel);
  for (const m of meshes) {
    const p = m.userData.p, isSel = !!(sel && (p.id === sel.id || grupoSel.includes(p.id)));
    m.material.color.set(isSel ? css("--red") : corBase(p));
    let op = 1;
    if (sel && !isSel) op = mont ? .45 : .55;
    if (ehFrente(p) && !isSel && (portasOcultas || (sel && !selEhFrente))) op = .12;
    m.material.opacity = op; m.material.depthWrite = op > .5; m.userData.e.material.opacity = op < .5 ? .15 : .55;
  }
}

let yaw = -0.55, pitch = 0.32, zoom = 1;
function placeCam() {
  const fit = raio / Math.sin((cam.fov * Math.PI / 180) / 2) * Math.max(1, 0.9 / (cam.aspect || 1));
  const d = fit * zoom * 0.95;
  cam.position.set(Math.sin(yaw) * Math.cos(pitch) * d, Math.sin(pitch) * d, Math.cos(yaw) * Math.cos(pitch) * d);
  cam.lookAt(0, 0, 0);
}
function resize() { const r = cv.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); cam.aspect = r.width / Math.max(r.height, 1); cam.updateProjectionMatrix(); placeCam(); }
new ResizeObserver(resize).observe(cv);
const pts = new Map();
cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY }); });
cv.addEventListener("pointermove", e => {
  const p = pts.get(e.pointerId); if (!p) return;
  if (pts.size === 2) {
    const [a, b] = [...pts.values()]; const d0 = Math.hypot(a.x - b.x, a.y - b.y);
    p.x = e.clientX; p.y = e.clientY; const d1 = Math.hypot(a.x - b.x, a.y - b.y);
    if (d1 > 0) zoom = Math.min(3, Math.max(.35, zoom * d0 / d1));
  } else {
    yaw -= (e.clientX - p.x) * 0.008; pitch = Math.min(1.35, Math.max(-0.2, pitch + (e.clientY - p.y) * 0.006));
    p.x = e.clientX; p.y = e.clientY;
  }
  placeCam();
});
const ray = new THREE.Raycaster();
cv.addEventListener("pointerup", e => {
  const p = pts.get(e.pointerId); pts.delete(e.pointerId);
  if (p && Math.hypot(e.clientX - p.x0, e.clientY - p.y0) < 6 && pts.size === 0) {
    const r = cv.getBoundingClientRect();
    ray.setFromCamera({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }, cam);
    const hits = ray.intersectObjects(meshes, false); const hit = hits.find(h => h.object.material.opacity > .3) || hits[0];
    if (hit) irPeca(hit.object.userData.p.id);
  }
});
cv.addEventListener("pointercancel", e => pts.delete(e.pointerId));
cv.addEventListener("wheel", e => { e.preventDefault(); zoom = Math.min(3, Math.max(.35, zoom * (1 + e.deltaY * 0.001))); placeCam(); }, { passive: false });
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
(function loop(t) {
  if (sel && !reduce) { const k = 1 + .18 * Math.sin(t / 260); meshes.forEach(m => { const p = m.userData.p; if (p.id === sel.id || grupoSel.includes(p.id)) m.material.color.set(css("--red")).multiplyScalar(k); }); }
  renderer.render(scene, cam); requestAnimationFrame(loop);
})(0);

// ---------- dados ----------
async function carregar(n) {
  if (!cache[n]) {
    const r = await fetch("pedidos/" + n + ".json"); if (!r.ok) throw new Error("pedido " + n + " não encontrado");
    const d = await r.json();
    const grupos = {}; // peças iguais (mesma descrição e medida) → "3 de 14 iguais"
    d.moveis.forEach(m => m.pecas.forEach(p => { const k = p.desc + "|" + p.dim; (grupos[k] = grupos[k] || []).push(p); }));
    Object.values(grupos).forEach(l => l.forEach((p, i) => { p.iguais = l.length; p.iguaisN = i + 1; }));
    cache[n] = d;
  }
  return cache[n];
}
const pedidoAtual = () => (location.hash.match(/^#(\d+)/) || [])[1] || PEDIDOS[0];
const pecaAtual = () => (location.hash.match(/^#\d+-p(\d+)$/) || [])[1] || null;
const etiquetaAtual = () => (location.hash.match(/^#\d+-e(\d+)$/) || [])[1] || null;
function irPeca(id) { const h = "#" + ped.pedido + "-p" + id; if (location.hash !== h) location.hash = h; else render(); }

// ---------- tela ----------
function frasePosicao(p) {
  if (!p.onde) return "Peça sem regra de posição ainda: veja os detalhes.";
  return p.onde + (p.solo && p.iguais > 1 ? ` Esta é a ${p.iguaisN}ª de ${p.iguais} peças iguais neste pedido.` : "");
}
function ficha(p) {
  return [["Descrição", p.desc], ["Medida", p.dim + " mm"], ["Desenho", p.des], ["Código", p.cod], ["Peça Promob", p.id], ["Pedido", ped.pedido + (ped.ambiente ? " · " + ped.ambiente : "")]]
    .map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("");
}
async function render() {
  // sem endereço = tela de entrada do montador (marca Romanzza + um botão)
  const entrada = !/^#\d+/.test(location.hash);
  document.body.classList.toggle("entrada", entrada);
  if (entrada) { document.body.classList.remove("montador"); document.title = "Romanzza Montagem"; return; }
  const n = pedidoAtual();
  try { ped = await carregar(n); } catch (e) { $("#nome").textContent = "Pedido não encontrado"; $("#onde").textContent = "Confira o link ou leia a etiqueta de novo."; return; }
  let id = pecaAtual(); const cb = etiquetaAtual();
  sel = null; movel = null; grupoSel = []; aviso = "";
  if (cb) {
    const alvo = (ped.etiquetas || {})[cb];
    const todas = ped.moveis.flatMap(m => m.pecas);
    if (alvo && todas.some(p => p.id === alvo)) id = alvo;
    else if (alvo && todas.some(p => (p.anc || []).includes(alvo))) {
      const f = todas.filter(p => (p.anc || []).includes(alvo)); id = f[0].id; grupoSel = f.map(p => p.id);
      aviso = "Esta etiqueta é do conjunto \u201c" + ((ped.indice || {})[alvo] || "conjunto") + "\u201d: as " + f.length + " peças dele estão marcadas.";
    } else aviso = alvo && (ped.indice || {})[alvo]
      ? "Etiqueta de \u201c" + ped.indice[alvo] + "\u201d. É ferragem, acessório ou gaveta que já vem montada: não tem lugar no móvel."
      : "Etiqueta do pedido " + ped.pedido + " sem peça com desenho.";
  }
  if (id) for (const m of ped.moveis) { const p = m.pecas.find(q => q.id === id); if (p) { sel = p; movel = m; break; } }
  if (!movel) movel = ped.moveis.find(m => m.caixa) || ped.moveis[0];
  const mont = !!sel || !!cb;
  document.body.classList.toggle("montador", mont);
  $("#dFicha").open = !mont; $("#dLista").open = !mont; $("#dFicha").hidden = !sel;
  montarCena(); zoom = 1;
  const t = sel && sel.tipo;
  if (!sel || sel.solo) { yaw = -0.55; pitch = 0.32; }
  else if (ehFrente(sel)) { yaw = -0.35; pitch = 0.2; }
  else if (t === "lateral_e") { yaw = -1.0; pitch = 0.35; }
  else if (t === "lateral_d") { yaw = 0.9; pitch = 0.35; }
  else if (t === "fundo") { yaw = -2.6; pitch = 0.35; }
  else if (t === "base_inf" || t === "rodape") { yaw = -0.45; pitch = 0.75; }
  else { yaw = -0.45; pitch = 0.5; }
  resize();
  const idx = movel.pecas.indexOf(sel) + 1;
  $("#cnt").textContent = `Pedido ${ped.pedido} · ${movel.nome}` + (sel && !movel.solo ? ` · peça ${idx} de ${movel.pecas.length}` : "");
  $("#nome").textContent = sel ? sel.nome : "Leia a etiqueta da peça";
  $("#onde").textContent = aviso && !sel ? aviso : sel ? frasePosicao(sel) + (aviso ? " " + aviso : "") : "Ou toque numa etiqueta abaixo para simular a leitura.";
  if (cb && !sel) $("#nome").textContent = "Etiqueta " + cb;
  $(".view").hidden = !!(cb && !sel);
  $("#ficha").innerHTML = sel ? ficha(sel) : "";
  // desenho técnico da peça (o mesmo .bmp da etiqueta de produção, convertido em PNG)
  const temDes = !!(sel && sel.des && /^[A-Z_]+\d+[A-Z]$/.test(sel.des));
  $("#desenho").hidden = !temDes; $("#desenho").classList.remove("grande");
  if (temDes) { $("#desenhoImg").src = "desenhos/" + sel.des + ".png"; $("#desenhoCap").textContent = "Desenho " + sel.des + " · toque para ampliar"; }
  $("#dLista").hidden = !!movel.solo;
  $("#lista").innerHTML = movel.pecas.map((p, i) => `<div class="row${sel === p ? " on" : ""}" tabindex="0" role="button" data-id="${p.id}"><span class="n">${String(i + 1).padStart(2, "0")}</span><span class="sw" style="background:${sel === p ? "var(--red)" : ehFrente(p) || p.solo ? "var(--orion)" : "var(--mdf)"}"></span>${esc(p.nome)}${p.box ? "" : " <small>(sem 3D)</small>"}</div>`).join("");
  document.title = sel ? `${sel.nome} | Romanzza Montagem` : "Romanzza Montagem";
  $("#bLerTxt").textContent = mont ? "Ler outra etiqueta" : "Ler etiqueta";
  paint();
  if (!mont) folha();
}
$("#lista").addEventListener("click", e => { const r = e.target.closest(".row"); if (r) { irPeca(r.dataset.id); scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); } });
$("#lista").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.dataset.id) irPeca(e.target.dataset.id); });
$("#bReset").onclick = () => { zoom = 1; yaw = -0.55; pitch = 0.32; placeCam(); };
$("#bPortas").onclick = () => { portasOcultas = !portasOcultas; $("#bPortas").textContent = portasOcultas ? "Mostrar portas" : "Esconder portas"; paint(); };
addEventListener("hashchange", render);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paint);
new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

// ---------- folha de etiquetas do pedido ----------
let folhaDe = null;
function folha() {
  $("#pedidos").innerHTML = PEDIDOS.map(n => `<a href="#${n}" class="chip${n === ped.pedido ? " on" : ""}">Pedido ${n}</a>`).join("");
  const pc = v => Math.round(100 * v / Math.max(ped.total, 1));
  $("#resumo").textContent = `${ped.total} peças · ${ped.em3d} montadas no móvel (${pc(ped.em3d)}%) · ${ped.soltas} peças do ambiente (${pc(ped.soltas)}%) · ${ped.moveis.filter(m => m.caixa).length} móveis`;
  if (folhaDe === ped.pedido) return; folhaDe = ped.pedido;
  const caixas = ped.moveis.filter(m => m.caixa), soltos = ped.moveis.filter(m => !m.caixa);
  // etiqueta laranja como a fábrica já imprime: código de barras com o número da etiqueta (sem QR)
  const codigos = {};
  for (const [cb, alvo] of Object.entries(ped.etiquetas || {})) (codigos[alvo] = codigos[alvo] || []).push(cb);
  const codigoDe = p => (codigos[p.id] || []).concat(...(p.anc || []).map(a => codigos[a] || []))[0] || null;
  const etiqueta = (p, m) => {
    const cb = codigoDe(p);
    return `
    <div class="lbl" tabindex="0" role="button" data-id="${p.id}"${cb ? ` data-cb="${cb}"` : ""} aria-label="Etiqueta ${esc(p.nome)}${cb ? " " + cb : ""}">
      <div class="lbl-top"><span>ROMANZZA</span><span>PED ${ped.pedido}</span></div>
      <div class="t">${esc(p.desc)}</div>
      <div class="lbl-info">${esc(m.nome)} · ${esc(p.dim)} mm<br>DES ${esc(p.des)}</div>
      ${cb ? `<div class="lbl-bar">${barras(cb)}</div><div class="lbl-cb">${cb}</div>` : `<div class="lbl-sem">etiqueta real só no pedido 120949</div>`}
    </div>`;
  };
  $("#sheet").innerHTML =
    caixas.map(m => `<h3>${esc(m.nome)} <small>${Math.round(m.dims.W)} × ${Math.round(m.dims.H)} × ${Math.round(m.dims.D)} mm · ${m.pecas.length} peças</small></h3><div class="grade">${m.pecas.map(p => etiqueta(p, m)).join("")}</div>`).join("") +
    (soltos.length ? `<h3>Peças do ambiente <small>painéis, ripas e vistas · ${soltos.length} peças</small></h3><div class="grade">${soltos.map(m => etiqueta(m.pecas[0], m)).join("")}</div>` : "");
}
// Code 128 (conjunto C, só dígitos): desenha o código de barras da etiqueta em SVG
const C128 = "212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112".split(" ");
function barras(dig) {
  const d = dig.length % 2 ? "0" + dig : dig, v = [105];
  for (let k = 0; k < d.length; k += 2) v.push(+d.slice(k, k + 2));
  v.push(v.reduce((a, x, k) => a + x * (k || 1), 0) % 103, 106);
  let x = 10, r = "";
  for (const n of v) [...C128[n]].forEach((w, k) => { if (k % 2 === 0) r += `<rect x="${x}" width="${w}" height="40"/>`; x += +w; });
  return `<svg viewBox="0 0 ${x + 10} 40" preserveAspectRatio="none" aria-hidden="true">${r}</svg>`;
}
const abrirLbl = l => { if (l.dataset.cb) location.hash = ped.pedido + "-e" + l.dataset.cb; else irPeca(l.dataset.id); scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); };
$("#sheet").addEventListener("click", e => { const l = e.target.closest(".lbl"); if (l) abrirLbl(l); });
$("#sheet").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.classList.contains("lbl")) abrirLbl(e.target); });

// ---------- ler a etiqueta que a fábrica já imprime (código de barras do Focco) ----------
async function abrirEtiqueta(txt) {
  const cb = String(txt || "").replace(/\D/g, "");
  if (!cb) return false;
  const n = cb.padStart(10, "0");
  for (const pd of PEDIDOS) { const d = await carregar(pd).catch(() => null); if (d && d.etiquetas && d.etiquetas[n]) { location.hash = pd + "-e" + n; return true; } }
  $("#scanMsg").textContent = "Etiqueta " + n + " não está nos pedidos deste protótipo (" + PEDIDOS.join(", ") + ").";
  return false;
}
let leitor = null;
async function fecharLeitor() { try { if (leitor) leitor.reset(); } catch (e) { /* já fechado */ } leitor = null; $("#scan").hidden = true; }
const abrirLeitor = async () => {
  $("#scan").hidden = false; $("#iCodigo").value = ""; $("#scanMsg").textContent = "Aponte a câmera para o código de barras da etiqueta laranja.";
  try {
    const hints = new Map();
    hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [ZXing.BarcodeFormat.CODE_128, ZXing.BarcodeFormat.CODE_39, ZXing.BarcodeFormat.ITF, ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.QR_CODE]);
    leitor = new ZXing.BrowserMultiFormatReader(hints);
    await leitor.decodeFromConstraints({ video: { facingMode: "environment" } }, $("#scanVideo"), async r => {
      if (!r) return;
      const txt = r.getText(); $("#scanMsg").textContent = "Lido: " + txt;
      if (/agilesolution\.com\.br\/qr-montagem/.test(txt)) { await fecharLeitor(); location.href = txt; return; }
      if (await abrirEtiqueta(txt)) { await fecharLeitor(); scrollTo({ top: 0 }); }
    });
  } catch (e) { $("#scanMsg").textContent = "Não consegui abrir a câmera (" + ((e && e.name) || "erro") + "). Digite o número da etiqueta abaixo."; }
};
$("#bFechar").onclick = fecharLeitor;
$("#desenhoImg").addEventListener("error", () => { $("#desenho").hidden = true; });
$("#desenhoImg").addEventListener("click", () => $("#desenho").classList.toggle("grande"));
$("#fDigitar").addEventListener("submit", async e => { e.preventDefault(); if (await abrirEtiqueta($("#iCodigo").value)) { await fecharLeitor(); scrollTo({ top: 0 }); } });
$("#bLer").onclick = abrirLeitor;
$("#bLerInicio").onclick = abrirLeitor;

// ---------- vira "app" no celular: ícone na tela inicial e funciona com sinal fraco ----------
const instalado = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
let pedidoInstalar = null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); pedidoInstalar = e; $("#bInstalar").hidden = false; $("#dicaInstalar").textContent = ""; });
$("#bInstalar").onclick = async () => { if (!pedidoInstalar) return; pedidoInstalar.prompt(); await pedidoInstalar.userChoice.catch(() => null); pedidoInstalar = null; $("#bInstalar").hidden = true; };
if (!instalado && /iPhone|iPad|iPod/.test(navigator.userAgent)) $("#dicaInstalar").textContent = "Para deixar o ícone no iPhone: toque em Compartilhar e depois em “Adicionar à Tela de Início”.";
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => { /* sem cache offline */ });

render();
// aberto pelo ícone instalado ou pelo QR do cartão (?ler): já abre a câmera
if (new URLSearchParams(location.search).has("ler") && !location.hash) abrirLeitor();
