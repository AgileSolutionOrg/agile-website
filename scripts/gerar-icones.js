// Gera js/icones.js com SO os icones que o index.html usa, a partir dos mesmos
// dados (lucide.icons) que o lucide.createIcons usaria. Rodar da raiz do repo:
//   npm i --no-save lucide@1.61.0 && node scripts/gerar-icones.js .
const fs = require('fs');
const path = require('path');
const lucide = require('lucide');

const site = process.argv[2];
const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
const nomes = [...new Set([...html.matchAll(/data-lucide="([^"]+)"/g)].map((m) => m[1]))].sort();

const pascal = (s) => s.split(/[-_]/).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const mapa = {};
for (const n of nomes) {
  const no = lucide.icons[pascal(n)];
  if (!no) throw new Error(`icone nao encontrado no lucide: ${n}`);
  mapa[n] = no;
}

const versao = require('lucide/package.json').version;
const saida = `/**
 * Icones do site, sem CDN.
 *
 * Antes vinha https://unpkg.com/lucide@latest: a biblioteca inteira, de um
 * terceiro, sem versao fixa e sem SRI — se o pacote fosse comprometido no npm,
 * o codigo novo rodaria no site da Agile no mesmo instante. Aqui ficam SO os
 * ${nomes.length} icones usados, com os mesmos dados do lucide ${versao} (licenca ISC), e
 * a troca imita o lucide.createIcons: o elemento com data-lucide vira um <svg>
 * que herda os atributos e as classes dele.
 *
 * Icone novo no HTML? Este arquivo e GERADO: rode de novo o gerador
 * (scripts/gerar-icones.js, que le os data-lucide do index.html) em vez de editar a mao.
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var ICONES = ${JSON.stringify(mapa)};
  var PADRAO = {
    xmlns: NS, width: 24, height: 24, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round"
  };

  function elemento(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, String(attrs[k])); });
    return el;
  }

  function trocar(el) {
    var nome = el.getAttribute("data-lucide");
    var no = ICONES[nome];
    if (!no) return;
    var attrs = {};
    Object.keys(PADRAO).forEach(function (k) { attrs[k] = PADRAO[k]; });
    var temA11y = false;
    Array.prototype.forEach.call(el.attributes, function (a) {
      attrs[a.name] = a.value;
      if (a.name === "aria-label" || a.name === "aria-labelledby" || a.name === "title" || a.name === "role") temA11y = true;
    });
    if (!temA11y) attrs["aria-hidden"] = "true";
    var classes = ["lucide", "lucide-" + nome].concat((el.getAttribute("class") || "").split(" "));
    attrs["class"] = classes.filter(function (c, i) { return c && classes.indexOf(c) === i; }).join(" ");
    var svg = elemento("svg", attrs);
    no.forEach(function (filho) { svg.appendChild(elemento(filho[0], filho[1])); });
    el.parentNode.replaceChild(svg, el);
  }

  function iniciar() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-lucide]"), trocar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
`;
fs.writeFileSync(path.join(site, 'js', 'icones.js'), saida);
console.log(`js/icones.js: ${nomes.length} icones (${nomes.join(', ')}), ${saida.length} bytes`);
