/**
 * Consentimento de cookies e carregamento condicional do Google Analytics.
 *
 * Ate 25/10/2026 o GA4 vinha direto no <head>: abrir o site ja gravava
 * `_ga`/`_ga_5XQV3RKLJ1`, sem perguntar, e a pagina ainda chamava o
 * doubleclick (Google Signals, recurso de publicidade) — uso que a Politica
 * de Privacidade nao declara. Agora:
 *
 * - nada de medicao e baixado nem gravado antes do "Aceitar";
 * - Signals e personalizacao de anuncio ficam DESLIGADOS na configuracao,
 *   independente do que estiver marcado no painel do GA;
 * - qualquer elemento com `data-preferencias-cookies` reabre o aviso, para a
 *   pessoa poder revogar tao facil quanto aceitou (LGPD, art. 8, par. 5).
 *   Revogar apaga os cookies do GA e desliga o envio na pagina aberta.
 *
 * A escolha fica no localStorage do visitante. Toda leitura e escrita esta em
 * try/catch: em aba privada, ou com dados do site bloqueados, o acesso LANCA
 * excecao, e um erro ai deixaria o aviso na tela para sempre.
 */
(function () {
  "use strict";

  var CHAVE = "ag_consentimento_analytics";
  var ID_GA = "G-5XQV3RKLJ1";

  function ler() {
    try {
      return window.localStorage.getItem(CHAVE);
    } catch (e) {
      return null;
    }
  }

  function gravar(valor) {
    try {
      window.localStorage.setItem(CHAVE, valor);
    } catch (e) {
      // Sem onde guardar: o aviso volta na proxima visita. Preferivel a quebrar.
    }
  }

  function carregarAnalytics() {
    window["ga-disable-" + ID_GA] = false;
    if (window.__agAnalyticsCarregado) return;
    window.__agAnalyticsCarregado = true;

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID_GA;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", ID_GA, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  }

  function desligarAnalytics() {
    window["ga-disable-" + ID_GA] = true;
    var dominios = ["", location.hostname, "." + location.hostname.replace(/^www\./, "")];
    document.cookie.split(";").forEach(function (par) {
      var nome = par.split("=")[0].trim();
      if (nome !== "_ga" && nome.indexOf("_ga_") !== 0) return;
      dominios.forEach(function (d) {
        document.cookie =
          nome + "=; Max-Age=0; path=/" + (d ? "; domain=" + d : "");
      });
    });
  }

  var caixa = null;

  function fechar() {
    if (caixa && caixa.parentNode) caixa.parentNode.removeChild(caixa);
    caixa = null;
  }

  function montarAviso() {
    if (caixa) return;
    caixa = document.createElement("div");
    caixa.className = "aviso-cookies";
    caixa.setAttribute("role", "dialog");
    caixa.setAttribute("aria-live", "polite");
    caixa.setAttribute("aria-label", "Aviso sobre cookies");

    var texto = document.createElement("p");
    texto.className = "aviso-cookies-texto";
    texto.innerHTML =
      "Usamos o Google Analytics para entender como as pessoas chegam até aqui. " +
      "Ele só é carregado se você aceitar, e você pode mudar de ideia a qualquer momento pelo rodapé. " +
      'Detalhes na <a href="/privacidade">Política de Privacidade</a>.';

    var botoes = document.createElement("div");
    botoes.className = "aviso-cookies-botoes";

    function botao(rotulo, classe, acao) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = classe;
      b.textContent = rotulo;
      b.addEventListener("click", acao);
      botoes.appendChild(b);
      return b;
    }

    botao("Recusar", "aviso-cookies-recusar", function () {
      gravar("nao");
      desligarAnalytics();
      fechar();
    });
    var aceitar = botao("Aceitar", "aviso-cookies-aceitar", function () {
      gravar("sim");
      fechar();
      carregarAnalytics();
    });

    caixa.appendChild(texto);
    caixa.appendChild(botoes);
    document.body.appendChild(caixa);
    return aceitar;
  }

  function ligarPreferencias() {
    var gatilhos = document.querySelectorAll("[data-preferencias-cookies]");
    Array.prototype.forEach.call(gatilhos, function (el) {
      el.addEventListener("click", function (ev) {
        ev.preventDefault();
        var aceitar = montarAviso();
        if (aceitar) aceitar.focus();
      });
    });
  }

  function iniciar() {
    ligarPreferencias();
    var escolha = ler();
    if (escolha === "sim") {
      carregarAnalytics();
      return;
    }
    if (escolha === "nao") return;
    montarAviso();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
