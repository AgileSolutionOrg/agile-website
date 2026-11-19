/* Agile Count - prototipo de contagem por foto (roda so no navegador). */
(function(){
"use strict";
var W=600,H=800;
var reduz=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function novoCanvas(w,h){var c=document.createElement("canvas");c.width=w;c.height=h;return c}
function ruido(g,w,h,R,amp){var im=g.getImageData(0,0,w,h),d=im.data;for(var i=0;i<d.length;i+=4){var n=(R()-.5)*amp;d[i]+=n;d[i+1]+=n;d[i+2]+=n}g.putImageData(im,0,0)}
function vinheta(g,w,h){var v=g.createRadialGradient(w*.4,h*.35,w*.2,w*.5,h*.5,w*.85);v.addColorStop(0,"rgba(255,240,220,.06)");v.addColorStop(1,"rgba(0,0,0,.45)");g.fillStyle=v;g.fillRect(0,0,w,h)}

/* ---- cena 1: tubos de aço vistos pela ponta, numa estante ---- */
function cenaTubos(){
  var c=novoCanvas(W,H),g=c.getContext("2d"),R=rng(7);
  var bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#3b3f46");bg.addColorStop(1,"#1d2025");g.fillStyle=bg;g.fillRect(0,0,W,H);
  g.fillStyle="#4a4339";g.fillRect(0,712,W,88);
  // estante
  g.fillStyle="#C9781E";g.fillRect(14,60,26,660);g.fillRect(W-40,60,26,660);
  g.fillStyle="#9a5a14";g.fillRect(14,700,W-28,18);
  g.fillStyle="rgba(0,0,0,.35)";for(var k=0;k<14;k++){g.fillRect(20,80+k*46,14,8);g.fillRect(W-34,80+k*46,14,8)}
  var r=23,dx=50,dy=43.3,pos=[];
  for(var row=0;row<14;row++){
    var y=676-row*dy, odd=row%2, n=odd?10:11, x0=W/2-(n-1)*dx/2;
    for(var i=0;i<n;i++){
      if(row>=12&&R()<.35)continue;
      if(row===11&&R()<.12)continue;
      pos.push([x0+i*dx+(R()-.5)*3,y+(R()-.5)*3]);
    }
  }
  pos.forEach(function(p){
    var x=p[0],y=p[1],rr=r*(.97+R()*.06),L=.82+R()*.3,ferr=R()<.18;
    function cor(v){v=Math.max(0,Math.min(255,Math.round(v*L)));return v}
    var gr=g.createRadialGradient(x-rr*.35,y-rr*.4,rr*.1,x,y,rr);
    if(ferr){gr.addColorStop(0,"rgb("+cor(190)+","+cor(150)+","+cor(120)+")");gr.addColorStop(1,"rgb("+cor(95)+","+cor(64)+","+cor(48)+")")}
    else{gr.addColorStop(0,"rgb("+cor(214)+","+cor(219)+","+cor(225)+")");gr.addColorStop(.7,"rgb("+cor(140)+","+cor(147)+","+cor(156)+")");gr.addColorStop(1,"rgb("+cor(80)+","+cor(86)+","+cor(94)+")")}
    g.beginPath();g.arc(x,y,rr,0,7);g.fillStyle=gr;g.fill();
    g.lineWidth=1.5;g.strokeStyle="rgba(0,0,0,.55)";g.stroke();
    var ih=g.createRadialGradient(x+rr*.12,y+rr*.15,1,x,y,rr*.7);ih.addColorStop(0,"#050506");ih.addColorStop(.75,"#17191c");ih.addColorStop(1,"#34373c");
    g.beginPath();g.arc(x+rr*.03,y+rr*.04,rr*.68,0,7);g.fillStyle=ih;g.fill();
    g.lineWidth=1.2;g.strokeStyle="rgba(255,255,255,.22)";g.stroke();
    g.beginPath();g.arc(x,y,rr*.86,3.6,4.8);g.lineWidth=2;g.strokeStyle="rgba(255,255,255,.35)";g.stroke();
  });
  vinheta(g,W,H);ruido(g,W,H,R,16);
  var ref=pos[Math.floor(pos.length*.35)];
  return {canvas:c,total:pos.length,ref:{x:ref[0]-r-3,y:ref[1]-r-3,w:2*r+6,h:2*r+6}};
}

/* ---- cena 2: caixas num palete, com filme stretch ---- */
function cenaCaixas(){
  var c=novoCanvas(W,H),g=c.getContext("2d"),R=rng(11);
  var bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#4a4e55");bg.addColorStop(1,"#2a2c30");g.fillStyle=bg;g.fillRect(0,0,W,H);
  g.fillStyle="#5a5348";g.fillRect(0,736,W,64);
  // palete
  g.fillStyle="#b48a58";g.fillRect(30,700,W-60,14);g.fillRect(30,726,W-60,12);
  g.fillStyle="#8a6538";[40,W/2-22,W-84].forEach(function(x){g.fillRect(x,712,44,16)});
  var cols=5,rows=6,bw=106,bh=90,x0=W/2-cols*bw/2,y0=700-rows*bh,boxes=[];
  for(var rI=0;rI<rows;rI++)for(var cI=0;cI<cols;cI++){
    var x=x0+cI*bw+(R()-.5)*4,y=y0+rI*bh+(R()-.5)*3,h=28+R()*8,s=42+R()*10,l=50+R()*9;
    g.fillStyle="hsl("+h+","+s+"%,"+l+"%)";g.fillRect(x+2,y+2,bw-4,bh-4);
    g.fillStyle="rgba(255,255,255,.12)";g.fillRect(x+2,y+2,bw-4,5);
    g.fillStyle="rgba(0,0,0,.28)";g.fillRect(x+2,y+bh-8,bw-4,6);g.fillRect(x+bw-7,y+2,5,bh-4);
    g.fillStyle="hsla("+(h+4)+",40%,"+(l+10)+"%,.9)";g.fillRect(x+bw/2-8,y+2,16,bh-4);
    g.fillStyle="#f2f2ee";g.fillRect(x+12,y+14,32,22);
    g.fillStyle="#222";for(var b=0;b<9;b++){var bwid=b%3?1:2;g.fillRect(x+15+b*3,y+22,bwid,11)}
    g.fillStyle="rgba(0,0,0,.6)";g.font="bold 9px Arial";g.fillText("FRÁGIL",x+56,y+bh-16);
    boxes.push([x,y]);
  }
  // filme stretch
  for(var f=0;f<6;f++){var gx=g.createLinearGradient(0,0,W,H);gx.addColorStop(0,"rgba(255,255,255,0)");gx.addColorStop(.5,"rgba(255,255,255,"+(.05+R()*.06)+")");gx.addColorStop(1,"rgba(255,255,255,0)");
    g.save();g.translate(0,y0+f*95);g.rotate(-.08);g.fillStyle=gx;g.fillRect(0,0,W,22);g.restore()}
  vinheta(g,W,H);ruido(g,W,H,R,14);
  var rb=boxes[12];
  return {canvas:c,total:boxes.length,ref:{x:rb[0]+1,y:rb[1]+1,w:bw-2,h:bh-2}};
}

/* ---- cena só para miniatura: chapas MDF de lado ---- */
function cenaChapas(){
  var c=novoCanvas(60,80),g=c.getContext("2d"),R=rng(3);
  g.fillStyle="#3a3d42";g.fillRect(0,0,60,80);
  for(var i=0;i<26;i++){g.fillStyle="hsl(34,"+(30+R()*10)+"%,"+(52+R()*12)+"%)";g.fillRect(6,8+i*2.6,48,2);g.fillStyle="rgba(0,0,0,.4)";g.fillRect(6,10+i*2.6,48,.6)}
  return c;
}
function cenaParafusos(){
  var c=novoCanvas(60,80),g=c.getContext("2d"),R=rng(5);
  g.fillStyle="#5b6068";g.fillRect(0,0,60,80);
  for(var i=0;i<90;i++){var x=R()*60,y=R()*80;g.fillStyle="rgba("+(150+R()*60|0)+","+(155+R()*60|0)+","+(165+R()*60|0)+",1)";g.beginPath();g.arc(x,y,2.2,0,7);g.fill()}
  return c;
}

/* ---- contagem por exemplo: correlação cruzada normalizada ---- */
function preparar(src,box){
  var f=18/Math.max(box.w,box.h);
  var w=Math.max(24,Math.round(W*f)),h=Math.max(24,Math.round(H*f));
  var c=novoCanvas(w,h),g=c.getContext("2d",{willReadFrequently:true});g.drawImage(src,0,0,w,h);
  var d=g.getImageData(0,0,w,h).data,G=new Float32Array(w*h);
  for(var i=0;i<w*h;i++)G[i]=.299*d[4*i]+.587*d[4*i+1]+.114*d[4*i+2];
  var tw=Math.max(5,Math.round(box.w*f)),th=Math.max(5,Math.round(box.h*f));
  var tx=Math.min(Math.max(0,Math.round(box.x*f)),w-tw),ty=Math.min(Math.max(0,Math.round(box.y*f)),h-th);
  var n=tw*th,T=new Float32Array(n),m=0,j,k;
  for(j=0;j<th;j++)for(k=0;k<tw;k++){T[j*tw+k]=G[(ty+j)*w+tx+k];m+=T[j*tw+k]}
  m/=n;var tss=0;for(k=0;k<n;k++){T[k]-=m;tss+=T[k]*T[k]}
  var tn=Math.sqrt(tss);if(tn<1)return {cands:[],size:Math.min(box.w,box.h)};
  var W1=w+1,I=new Float64Array(W1*(h+1)),I2=new Float64Array(W1*(h+1)),x,y;
  for(y=0;y<h;y++){var rs=0,rs2=0;for(x=0;x<w;x++){var v=G[y*w+x];rs+=v;rs2+=v*v;I[(y+1)*W1+x+1]=I[y*W1+x+1]+rs;I2[(y+1)*W1+x+1]=I2[y*W1+x+1]+rs2}}
  var sw=w-tw+1,sh=h-th+1,S=new Float32Array(sw*sh);
  for(y=0;y<sh;y++)for(x=0;x<sw;x++){
    var a=y*W1+x,b=y*W1+x+tw,cc=(y+th)*W1+x,dd=(y+th)*W1+x+tw;
    var s=I[dd]-I[b]-I[cc]+I[a],s2=I2[dd]-I2[b]-I2[cc]+I2[a],varG=s2-s*s/n;
    if(varG<n*6){S[y*sw+x]=0;continue}
    var acc=0;for(j=0;j<th;j++){var row=(y+j)*w+x,tr=j*tw;for(k=0;k<tw;k++)acc+=T[tr+k]*G[row+k]}
    S[y*sw+x]=acc/(tn*Math.sqrt(varG));
  }
  var cands=[];
  for(y=0;y<sh;y++)for(x=0;x<sw;x++){
    var vv=S[y*sw+x];if(vv<.3)continue;var max=true;
    for(var oy=-1;oy<=1&&max;oy++)for(var ox=-1;ox<=1;ox++){if(!ox&&!oy)continue;var yy=y+oy,xx=x+ox;if(yy<0||xx<0||yy>=sh||xx>=sw)continue;if(S[yy*sw+xx]>vv){max=false;break}}
    if(max)cands.push({x:(x+tw/2)/f,y:(y+th/2)/f,s:vv});
  }
  cands.sort(function(p,q){return q.s-p.s});
  return {cands:cands,size:Math.min(box.w,box.h)};
}
function filtrar(res,thr){
  var out=[],md=Math.pow(res.size*.62,2);
  for(var i=0;i<res.cands.length;i++){var c=res.cands[i];if(c.s<thr)break;
    var ok=true;for(var j=0;j<out.length;j++){var dx=out[j].x-c.x,dy=out[j].y-c.y;if(dx*dx+dy*dy<md){ok=false;break}}
    if(ok)out.push({x:c.x,y:c.y,src:"ia"})}
  return out;
}

/* ---- dados ---- */
var cenas={tubos:cenaTubos(),caixas:cenaCaixas()};
var TAREFAS=[
  {id:"tubos",tipo:"Contagem cíclica",item:"Tubo aço SAE 1020 1\" × 6 m",cod:"40211",local:"Almox. 02 · Rua C",esperado:cenas.tubos.total+2,pill:["Agora","c"],dica:"Fique de frente para a ponta dos tubos, com toda a estante no tracejado.",valor:96.40},
  {id:"caixas",tipo:"Expedição · carga 7731",item:"Caixa embalada · palete 3",cod:"PAL-03",local:"Doca 2",esperado:cenas.caixas.total,pill:["10:30","cz"],dica:"Fotografe o palete de frente, do chão até a última camada.",valor:0},
];
var S={tela:"tarefas",t:null,cena:null,res:null,box:null,marcas:[],ops:[],removidos:{},rigor:.5,t0:0,motivo:null,feitos:{}};
var scr=document.getElementById("scr");
function hora(){var d=new Date();return ("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

/* ---- telas ---- */
function topo(t,voltar){return '<div class="status"><span>'+hora()+'</span><span>Agile · 5G ▮▮▮</span></div><div class="top">'+(voltar?'<button class="voltar" data-a="voltar" aria-label="Voltar">‹</button>':'')+'<span class="t">'+t+'</span><span class="ajuda" title="Ajuda">?</span></div>'}
function render(){
  var h="",T=S.t;
  if(S.tela==="tarefas"){
    h=topo("Contagens de hoje")+'<div class="corpo">';
    TAREFAS.forEach(function(t){var f=S.feitos[t.id];
      h+='<button class="tar" data-a="abrir" data-id="'+t.id+'"><small>'+t.tipo+'</small><span class="l"><b>'+esc(t.item)+'</b>'+(f?'<span class="pill '+(f.dif?'c':'ok')+'">'+(f.dif?'Divergiu':'Bateu')+'</span>':'<span class="pill '+t.pill[1]+'">'+t.pill[0]+'</span>')+'</span><span class="s">'+t.cod+' · '+t.local+' · Focco: '+t.esperado+'</span></button>'});
    h+='<div class="tar" style="cursor:default"><small>Recebimento · NF 58.903</small><span class="l"><b>Chapa MDF 18 mm 2750×1850</b><span class="pill cz">14:00</span></span><span class="s">A NF diz 60 chapas</span></div>';
    h+='<div class="tar" style="cursor:default"><small>Feita · 08:12</small><span class="l"><b>Parafuso sextavado M8×30</b><span class="pill ok">Bateu</span></span><span class="s">1.240 contados por Marcos</span></div>';
    h+='<label class="btn g" style="margin-top:auto" for="arq">Contar avulso · usar foto do celular</label><input class="arquivo" type="file" id="arq" accept="image/*" capture="environment"></div>';
  }
  else if(S.tela==="foto"){
    h=topo("Fotografar",1)+'<div class="corpo"><div class="fotobox"><canvas id="cv" width="600" height="800"></canvas><div class="mira"></div><div class="balao">'+esc(T.dica)+'</div></div><div class="dupla"><label class="btn g" for="arq2">Trocar foto</label><button class="btn" data-a="usar">Usar esta foto</button></div><input class="arquivo" type="file" id="arq2" accept="image/*" capture="environment"></div>';
  }
  else if(S.tela==="exemplo"){
    h=topo("Marque uma peça",1)+'<div class="corpo"><div class="fotobox"><canvas id="cv" width="600" height="800"></canvas><div class="balao topo">Arraste em volta de <b>uma</b> peça. A IA procura as iguais.</div></div><p style="font-size:11px;color:#B9C6DA;margin:0">Peça muito pequena? Toque nela e o app usa um quadro padrão.</p></div>';
  }
  else if(S.tela==="procurando"){
    h=topo("Contando…")+'<div class="corpo"><div class="fotobox"><canvas id="cv" width="600" height="800"></canvas><div class="scan" id="scan"></div><div class="balao">Procurando peças parecidas com a marcada…</div></div></div>';
  }
  else if(S.tela==="conferir"){
    var n=S.marcas.length+S.ops.length;
    h=topo("Conferir",1)+'<div class="corpo"><div class="fotobox"><canvas id="cv" width="600" height="800"></canvas></div>'+
      '<div class="cont-l"><span><span class="lbl">Peças</span><br><span class="leg"><span><i style="background:#4FA3FF"></i>IA '+S.marcas.length+'</span><span><i style="background:#E0566B"></i>você '+S.ops.length+'</span></span></span><b id="tot">'+n+'</b></div>'+
      '<div class="rigor"><label for="rig">Rigor</label><input id="rig" type="range" min="40" max="90" value="'+Math.round(S.rigor*100)+'"><span class="num">'+Math.round(S.rigor*100)+'</span></div>'+
      '<button class="btn" data-a="certo" style="margin-top:auto">Está certo · '+n+' peças</button></div>';
  }
  else if(S.tela==="comparar"){
    var nn=S.marcas.length+S.ops.length,esp=T?T.esperado:null,dif=esp==null?0:nn-esp;
    h=topo("Gravar no Focco",1)+'<div class="corpo"><div class="resumo"><img alt="Foto marcada" src="'+S.thumb+'"><div><span class="lbl">'+(T?T.tipo:"Contagem avulsa")+'</span><br><b style="font-size:12.5px">'+esc(T?T.item:"Item a escolher")+'</b><br><span style="color:#B9C6DA;font-size:11px">'+(T?T.cod+" · "+T.local:"Escolha o item no Focco")+'</span></div></div>';
    if(esp!=null){h+='<div class="cmp"><div><b>'+esp+'</b><small>Focco</small></div><div><b>'+nn+'</b><small>Contado</small></div><div class="'+(dif?'neg':'zero')+'"><b>'+(dif>0?"+":"")+(dif?String(dif).replace("-","−"):"0")+'</b><small>Diferença</small></div></div>'}
    else{h+='<div class="cmp"><div style="grid-column:1/-1"><b>'+nn+'</b><small>peças contadas</small></div></div>'}
    if(dif){var ms=["Peça em uso na produção","Perda ou sucata","Contar de novo","Outro motivo"];
      h+='<span class="lbl">Por que a diferença?</span><div class="motivos">'+ms.map(function(m,i){return '<label><input type="radio" name="mot" value="'+i+'"'+(S.motivo===m?" checked":"")+' data-m="'+m+'">'+m+'</label>'}).join("")+'</div>'}
    else h+='<p style="font-size:11.5px;color:#6EE0A6;margin:0">Bate com o Focco. Nada a justificar.</p>';
    var trava=dif&&!S.motivo;
    h+='<button class="btn c" data-a="gravar" aria-disabled="'+(trava?"true":"false")+'" style="margin-top:auto">'+(trava?"Escolha o motivo":"Gravar contagem")+'</button></div>';
  }
  else if(S.tela==="gravado"){
    var g=S.ultimo;
    h=topo("Pronto")+'<div class="corpo"><div class="feito"><div class="check"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><b style="font-size:16px">Contagem gravada no Focco</b><span style="color:#B9C6DA;font-size:11px">'+g.n+' peças · '+esc(g.item)+'</span>'+
      '<div class="tempos"><div><b>'+g.seg+' s</b><small>com o app</small></div><div><b>~'+g.manual+'</b><small>à mão, contando 2×</small></div></div>'+
      '<div class="log">✓ foto marcada guardada no Portal<br>✓ contagem enviada ao agente '+(g.cliente)+'<br>✓ gravada como o Focco grava<br>'+(g.dif?'⚠ divergência '+String(g.dif).replace("-","−")+' · '+esc(g.motivo):'✓ sem divergência')+'</div></div>'+
      '<button class="btn" data-a="inicio" style="margin-top:auto">Voltar às tarefas</button></div>';
  }
  scr.innerHTML=h;
  var cv=document.getElementById("cv");if(cv){desenhar(cv);ligarCanvas(cv)}
  var rig=document.getElementById("rig");if(rig)rig.addEventListener("input",function(){S.rigor=rig.value/100;aplicarRigor();var sp=rig.nextElementSibling;sp.textContent=rig.value;atualizarConferir()});
  ["arq","arq2"].forEach(function(id){var a=document.getElementById(id);if(a)a.addEventListener("change",function(){carregarArquivo(a.files&&a.files[0])})});
  scr.querySelectorAll('input[name="mot"]').forEach(function(r){r.addEventListener("change",function(){S.motivo=r.getAttribute("data-m");render()})});
}
function atualizarConferir(){
  var n=S.marcas.length+S.ops.length,t=document.getElementById("tot");if(!t)return;t.textContent=n;
  var leg=scr.querySelector(".leg");if(leg)leg.innerHTML='<span><i style="background:#4FA3FF"></i>IA '+S.marcas.length+'</span><span><i style="background:#E0566B"></i>você '+S.ops.length+'</span>';
  var b=scr.querySelector('[data-a="certo"]');if(b)b.textContent="Está certo · "+n+" peças";
  var cv=document.getElementById("cv");if(cv)desenhar(cv);
}
function desenhar(cv,ate){
  var g=cv.getContext("2d");g.drawImage(S.cena.canvas,0,0,W,H);
  if(S.box&&(S.tela==="exemplo"||S.tela==="procurando"||S.tela==="conferir")){
    g.save();g.setLineDash([10,7]);g.lineWidth=4;g.strokeStyle="#FFD34D";g.strokeRect(S.box.x,S.box.y,S.box.w,S.box.h);g.restore();
  }
  if(S.tela==="conferir"||S.tela==="procurando"){
    var lista=S.marcas,lim=ate==null?lista.length:ate;
    for(var i=0;i<lim;i++)ponto(g,lista[i].x,lista[i].y,"#4FA3FF");
    if(ate==null)S.ops.forEach(function(p){ponto(g,p.x,p.y,"#E0566B")});
  }
}
function ponto(g,x,y,c){g.beginPath();g.arc(x,y,10,0,7);g.fillStyle=c;g.fill();g.lineWidth=3;g.strokeStyle="#fff";g.stroke()}
function coord(cv,e){var r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
function ligarCanvas(cv){
  if(S.tela==="exemplo"){
    var ini=null;
    cv.addEventListener("pointerdown",function(e){ini=coord(cv,e);cv.setPointerCapture(e.pointerId)});
    cv.addEventListener("pointermove",function(e){if(!ini)return;var p=coord(cv,e);S.box={x:Math.min(ini.x,p.x),y:Math.min(ini.y,p.y),w:Math.abs(p.x-ini.x),h:Math.abs(p.y-ini.y)};desenhar(cv)});
    cv.addEventListener("pointerup",function(e){if(!ini)return;var p=coord(cv,e);
      var bw=Math.abs(p.x-ini.x),bh=Math.abs(p.y-ini.y);
      if(bw<18||bh<18){S.box={x:p.x-34,y:p.y-34,w:68,h:68}}else S.box={x:Math.min(ini.x,p.x),y:Math.min(ini.y,p.y),w:bw,h:bh};
      ini=null;contar();});
  }
  if(S.tela==="conferir"){
    cv.addEventListener("pointerup",function(e){var p=coord(cv,e),raio=Math.max(16,S.res.size*.45),r2=raio*raio;
      for(var i=0;i<S.ops.length;i++){var o=S.ops[i];if((o.x-p.x)*(o.x-p.x)+(o.y-p.y)*(o.y-p.y)<r2){S.ops.splice(i,1);atualizarConferir();return}}
      for(var j=0;j<S.marcas.length;j++){var m=S.marcas[j];if((m.x-p.x)*(m.x-p.x)+(m.y-p.y)*(m.y-p.y)<r2){S.removidos[chave(m)]=1;S.marcas.splice(j,1);atualizarConferir();return}}
      S.ops.push({x:p.x,y:p.y,src:"op"});atualizarConferir();});
  }
}
function chave(m){return Math.round(m.x/6)+":"+Math.round(m.y/6)}
function aplicarRigor(){S.marcas=filtrar(S.res,S.rigor).filter(function(m){return !S.removidos[chave(m)]})}
function contar(){
  S.tela="procurando";render();
  var cv=document.getElementById("cv"),scan=document.getElementById("scan");
  setTimeout(function(){
    S.res=preparar(S.cena.canvas,S.box);S.removidos={};S.ops=[];aplicarRigor();
    S.marcas.sort(function(a,b){return a.y-b.y||a.x-b.x});
    var dur=reduz?0:1100,t0=performance.now(),N=S.marcas.length;
    function passo(t){var k=dur?Math.min(1,(t-t0)/dur):1;
      if(scan)scan.style.top=(k*100)+"%";
      desenhar(cv,Math.round(N*k));
      if(k<1)requestAnimationFrame(passo);else{S.tela="conferir";render()}}
    requestAnimationFrame(passo);
  },reduz?0:350);
}
function carregarArquivo(f){
  if(!f)return;var rd=new FileReader();
  rd.onload=function(){var im=new Image();im.onload=function(){
    var c=novoCanvas(W,H),g=c.getContext("2d"),s=Math.max(W/im.width,H/im.height),w=im.width*s,h=im.height*s;
    g.drawImage(im,(W-w)/2,(H-h)/2,w,h);
    S.cena={canvas:c,total:null,ref:null};S.t=S.tela==="foto"&&S.t?S.t:null;S.box=null;S.t0=performance.now();S.motivo=null;S.tela="foto";
    if(!S.t)S.tdica=true;render();
  };im.src=rd.result};
  rd.readAsDataURL(f);
}
function miniatura(){var c=novoCanvas(120,160),g=c.getContext("2d");g.drawImage(document.getElementById("cv")||S.cena.canvas,0,0,120,160);return c.toDataURL("image/jpeg",.7)}

scr.addEventListener("click",function(e){
  var el=e.target.closest("[data-a]");if(!el)return;var a=el.getAttribute("data-a");
  if(a==="abrir"){var id=el.getAttribute("data-id");S.t=TAREFAS.filter(function(t){return t.id===id})[0];S.cena=cenas[id];S.box=null;S.motivo=null;S.t0=performance.now();S.tela="foto";render()}
  else if(a==="usar"){S.tela="exemplo";render()}
  else if(a==="voltar"){S.tela={foto:"tarefas",exemplo:"foto",conferir:"exemplo",comparar:"conferir"}[S.tela]||"tarefas";if(S.tela==="exemplo")S.box=null;render()}
  else if(a==="certo"){S.thumb=miniatura();S.tela="comparar";render()}
  else if(a==="gravar"){if(el.getAttribute("aria-disabled")==="true")return;gravar()}
  else if(a==="inicio"){S.tela="tarefas";render()}
});
function fmtMin(s){return s<90?Math.round(s)+" s":Math.round(s/60)+" min"}
function gravar(){
  var T=S.t,n=S.marcas.length+S.ops.length,esp=T?T.esperado:null,dif=esp==null?0:n-esp;
  var seg=Math.max(1,Math.round((performance.now()-S.t0)/1000));
  S.ultimo={n:n,item:T?T.item:"Contagem avulsa",seg:seg,manual:fmtMin(n*2.6),dif:dif,motivo:S.motivo,cliente:"no Focco do cliente"};
  if(T)S.feitos[T.id]={dif:dif};
  novaLinha({hora:hora(),thumb:S.thumb,item:T?T.item:"Contagem avulsa",local:T?T.local:"—",esp:esp,cont:n,dif:dif,motivo:dif?S.motivo:"—",quem:"Você",valor:T?T.valor:0,seg:seg},true);
  S.tela="gravado";render();
}

/* ---- painel do gestor ---- */
var tb=document.getElementById("linhas");
var stats={n:0,d:0,tempo:0,valor:0};
function th(c){return c.toDataURL("image/jpeg",.7)}
function mini(c){var m=novoCanvas(60,80);m.getContext("2d").drawImage(c,0,0,60,80);return th(m)}
function novaLinha(l,vivo){
  var tr=document.createElement("tr");if(vivo)tr.className="novo";
  var d=l.dif,dTxt=l.esp==null?"—":(d>0?"+":"")+(d?String(d).replace("-","−"):"0");
  tr.innerHTML='<td class="num">'+l.hora+'</td><td>'+(l.thumb?'<img class="th" alt="" src="'+l.thumb+'">':'')+'</td><td>'+esc(l.item)+'</td><td>'+esc(l.local)+'</td><td class="n">'+(l.esp==null?"—":l.esp.toLocaleString("pt-BR"))+'</td><td class="n">'+l.cont.toLocaleString("pt-BR")+'</td><td class="n '+(d?"d-neg":"d-ok")+'">'+dTxt+'</td><td>'+esc(l.motivo)+'</td><td>'+esc(l.quem)+'</td>';
  tb.insertBefore(tr,tb.firstChild);
  stats.n++;if(d){stats.d++;stats.valor+=Math.abs(d)*(l.valor||0)}stats.tempo+=l.seg;
  document.getElementById("k-n").textContent=stats.n;
  document.getElementById("k-d").textContent=stats.d;
  document.getElementById("k-ds").textContent=stats.valor.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0})+" em diferença";
  document.getElementById("k-t").textContent=Math.round(stats.tempo/stats.n)+" s";
  document.getElementById("k-a").textContent=Math.round((stats.n-stats.d)/stats.n*100)+"%";
  if(vivo)setTimeout(function(){tr.classList.add("fade")},60);
}
var tub=cenas.tubos.canvas,cx=cenas.caixas.canvas;
[
  {hora:"07:41",thumb:mini(cenaParafusos()),item:"Porca sextavada M10",local:"Almox. 01 · Rua A",esp:860,cont:860,dif:0,motivo:"—",quem:"Marcos",seg:31},
  {hora:"08:12",thumb:mini(cenaParafusos()),item:"Parafuso sextavado M8×30",local:"Almox. 01 · Rua A",esp:1240,cont:1240,dif:0,motivo:"—",quem:"Marcos",seg:44},
  {hora:"08:55",thumb:mini(cenaChapas()),item:"Chapa MDF 18 mm 2750×1850",local:"Pátio coberto",esp:64,cont:62,dif:-2,motivo:"Peça em uso na produção",quem:"Juliana",seg:27,valor:412},
  {hora:"09:20",thumb:mini(tub),item:"Tubo aço SAE 1020 ¾\" × 6 m",local:"Almox. 02 · Rua C",esp:96,cont:96,dif:0,motivo:"—",quem:"Rafael",seg:36},
  {hora:"09:48",thumb:mini(cx),item:"Caixa embalada · palete 1",local:"Doca 2",esp:30,cont:29,dif:-1,motivo:"Contar de novo",quem:"Rafael",seg:52,valor:360}
].forEach(function(l){novaLinha(l,false)});

document.getElementById("f-tempo").textContent="~"+fmtMin(cenas.tubos.total*2.6);
document.getElementById("f-n").textContent=cenas.tubos.total;

/* ---- demonstração automática ---- */
var demoBtn=document.getElementById("demo");
function esperar(ms){return new Promise(function(r){setTimeout(r,reduz?0:ms)})}
demoBtn.addEventListener("click",function(){
  demoBtn.disabled=true;
  var T=TAREFAS[0];
  S.t=T;S.cena=cenas.tubos;S.box=null;S.motivo=null;S.t0=performance.now();S.tela="foto";render();
  esperar(1300).then(function(){S.tela="exemplo";render();return esperar(700)})
  .then(function(){var r=cenas.tubos.ref,cv=document.getElementById("cv"),k=0;
    return new Promise(function(res){function anima(){k+=.08;S.box={x:r.x,y:r.y,w:r.w*Math.min(1,k),h:r.h*Math.min(1,k)};desenhar(cv);if(k<1&&!reduz)requestAnimationFrame(anima);else{S.box=r;res()}}anima()})})
  .then(function(){contar();return esperar(2400)})
  .then(function(){S.thumb=miniatura();S.tela="comparar";render();return esperar(1400)})
  .then(function(){var n=S.marcas.length+S.ops.length;if(n!==T.esperado){S.motivo="Peça em uso na produção";render();return esperar(900)}})
  .then(function(){gravar();demoBtn.disabled=false});
});
document.getElementById("reini").addEventListener("click",function(){S.tela="tarefas";S.feitos={};render()});

render();
})();
