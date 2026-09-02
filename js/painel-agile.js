/*
 * O PAINEL "O QUE O AGILE FAZ".
 *
 * O card da plataforma virava uma parede de texto no meio de uma grade de cards curtos: quem
 * batia o olho via muito e não lia nada. Agora o card convida em três linhas e o conteúdo mora
 * do outro lado do clique, com espaço para respirar.
 *
 * Um diálogo tem três obrigações que ninguém vê quando estão certas, e todo mundo sente quando
 * faltam:
 *
 *   1. ESC fecha. É o primeiro reflexo de quem abriu sem querer.
 *   2. O foco entra e volta. Quem navega por teclado não pode ser abandonado atrás do painel,
 *      nem perder o lugar da página quando fecha.
 *   3. A página de trás não rola. Sem isso, rolar dentro do painel arrasta o site inteiro por
 *      baixo — e ao fechar a pessoa está noutro lugar, sem entender por quê.
 */
(function () {
  const painel = document.getElementById('painel-agile')
  const cartao = document.querySelector('[data-abre-agile]')
  if (!painel || !cartao) return

  // De onde o clique veio, para devolver o foco no fechamento.
  let devolverPara = null

  function abrir() {
    devolverPara = document.activeElement
    painel.hidden = false
    document.body.classList.add('com-painel')

    // O primeiro elemento focável é o "fechar": quem chegou por teclado precisa da saída
    // antes de qualquer outra coisa.
    const fechar = painel.querySelector('.painel-agile-fechar')
    if (fechar) fechar.focus()
  }

  function fechar() {
    painel.hidden = true
    document.body.classList.remove('com-painel')
    if (devolverPara && devolverPara.focus) devolverPara.focus()
    devolverPara = null
  }

  cartao.addEventListener('click', abrir)

  // O card é uma <article>, e não um <button>: sem isto o Enter e o Espaço não o acionam, e
  // ele fica sendo um botão que só o mouse alcança.
  cartao.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault()
      abrir()
    }
  })

  painel.querySelectorAll('[data-fecha-agile]').forEach((alvo) => {
    alvo.addEventListener('click', fechar)
  })

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && !painel.hidden) fechar()
  })

  // O FOCO NÃO SAI DO PAINEL enquanto ele está aberto. Sem a volta, o Tab passeia pelo site
  // atrás do painel: a pessoa continua tabulando e o foco simplesmente some da tela.
  painel.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Tab') return

    const focaveis = painel.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])')
    if (!focaveis.length) return

    const primeiro = focaveis[0]
    const ultimo = focaveis[focaveis.length - 1]

    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault()
      ultimo.focus()
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault()
      primeiro.focus()
    }
  })
})()
