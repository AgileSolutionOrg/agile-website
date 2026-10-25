/**
 * Cartao de produto inteiro clicavel, sem onclick no HTML.
 *
 * O destino e o <a class="link-produto"> de dentro do cartao: ele e o link de
 * verdade (teclado, leitor de tela, "abrir em nova aba"); aqui so estendemos o
 * clique ao resto do cartao. Era onclick="window.open(...)" inline, que a CSP
 * do site bloqueia e que nao funcionava pelo teclado.
 */
(function () {
  "use strict";

  document.querySelectorAll(".cartao-produto.clicavel").forEach(function (cartao) {
    var link = cartao.querySelector("a.link-produto");
    if (!link) return;
    cartao.addEventListener("click", function (ev) {
      if (ev.target.closest("a")) return; // o proprio link ja abre sozinho
      window.open(link.href, "_blank", "noopener");
    });
  });
})();
