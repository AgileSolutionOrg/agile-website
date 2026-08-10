/* Mapa de presenca da Agile no Brasil.
   Desenha os estados a partir de MAPA_BRASIL_GEO (js/mapa-brasil-geo.js),
   pinta os que tem cliente e marca as cidades por lat/lon.
   Os dados vem de MAPA_PRESENCA_DADOS (js/mapa-presenca-dados.js). */
(function () {
  const raiz = document.querySelector("[data-mapa-presenca]");
  if (!raiz || typeof MAPA_BRASIL_GEO === "undefined" || typeof MAPA_PRESENCA_DADOS === "undefined") return;

  const NS = "http://www.w3.org/2000/svg";
  const geo = MAPA_BRASIL_GEO;
  const dados = MAPA_PRESENCA_DADOS;

  const cidades = (dados.cidades || []).filter(c => c.uf && geo.estados[c.uf]);
  // A UF de uma cidade conta como presenca mesmo se esquecerem de listar em "ufs".
  const presentes = new Set([...(dados.ufs || []), ...cidades.map(c => c.uf)].filter(uf => geo.estados[uf]));

  /* Mercator, com os mesmos parametros usados para gerar os contornos. */
  function projetar(lat, lon) {
    const p = geo.proj;
    const y = (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    return { x: (lon - p.minx) * p.scale + p.pad, y: (p.maxy - y) * p.scale + p.pad };
  }

  const cria = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  const svg = cria("svg", {
    viewBox: geo.viewBox,
    class: "svg-mapa-presenca",
    role: "img",
    "aria-label": "Mapa do Brasil com os estados onde a Agile Solution atende clientes"
  });

  /* --- estados --- */
  const camadaEstados = cria("g", { class: "camada-estados" });
  const siglas = Object.keys(geo.estados).sort();
  for (const sigla of siglas) {
    const estado = geo.estados[sigla];
    const temPresenca = presentes.has(sigla);
    const forma = cria("path", {
      d: estado.d,
      class: "estado-mapa" + (temPresenca ? " estado-presente" : ""),
      "data-uf": sigla
    });
    const cidadesDaUf = cidades.filter(c => c.uf === sigla).map(c => c.nome);
    forma.appendChild(cria("title", {})).textContent = temPresenca
      ? estado.nome + (cidadesDaUf.length ? " — " + cidadesDaUf.join(", ") : "")
      : estado.nome;
    camadaEstados.appendChild(forma);
  }
  svg.appendChild(camadaEstados);

  /* --- cidades: halo pulsante + ponto --- */
  const camadaCidades = cria("g", { class: "camada-cidades" });
  cidades.forEach((cidade, i) => {
    if (typeof cidade.lat !== "number" || typeof cidade.lon !== "number") return;
    const { x, y } = projetar(cidade.lat, cidade.lon);
    const grupo = cria("g", {
      class: "cidade-mapa" + (cidade.sede ? " cidade-sede" : ""),
      style: "--atraso-pulso:" + (i % 5) * 0.4 + "s"
    });
    grupo.appendChild(cria("circle", { class: "halo-cidade", cx: x, cy: y, r: cidade.sede ? 13 : 10 }));
    grupo.appendChild(cria("circle", { class: "ponto-cidade", cx: x, cy: y, r: cidade.sede ? 6 : 4.5 }));
    grupo.appendChild(cria("title", {})).textContent =
      cidade.nome + " — " + cidade.uf + (cidade.sede ? " (sede Agile)" : "");
    camadaCidades.appendChild(grupo);
  });
  svg.appendChild(camadaCidades);

  raiz.querySelector("[data-mapa-svg]").appendChild(svg);

  /* --- numeros e lista textual (tambem servem de leitura alternativa ao mapa) --- */
  const alvoEstados = raiz.querySelector("[data-mapa-total-estados]");
  if (alvoEstados) alvoEstados.textContent = presentes.size;

  /* A sede nao e cliente: nao entra na conta de cidades atendidas, e o bloco
     some enquanto nao houver nenhuma — melhor sem numero do que com um zero. */
  const cidadesClientes = cidades.filter(c => !c.sede);
  const totalCidades = new Set(cidadesClientes.map(c => c.nome + "/" + c.uf)).size;
  const alvoCidades = raiz.querySelector("[data-mapa-total-cidades]");
  if (alvoCidades) alvoCidades.textContent = totalCidades;

  const blocoCidades = raiz.querySelector("[data-mapa-bloco-cidades]");
  if (blocoCidades && totalCidades === 0) blocoCidades.remove();

  /* Legenda: so explica o que esta desenhado. */
  const legendaCidade = raiz.querySelector("[data-mapa-legenda-cidade]");
  if (legendaCidade && totalCidades === 0) legendaCidade.remove();

  const legendaSede = raiz.querySelector("[data-mapa-legenda-sede]");
  if (legendaSede && !cidades.some(c => c.sede)) legendaSede.remove();

  const lista = raiz.querySelector("[data-mapa-lista]");
  if (lista) {
    [...presentes]
      .map(uf => ({ uf, nome: geo.estados[uf].nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      .forEach(({ uf, nome }) => {
        const chip = document.createElement("li");
        chip.className = "chip-estado";
        chip.innerHTML = '<b>' + uf + '</b> ' + nome;
        lista.appendChild(chip);
      });
  }

  if (dados.revisado === true) {
    const selo = raiz.querySelector("[data-mapa-selo-exemplo]");
    if (selo) selo.remove();
  }
})();
