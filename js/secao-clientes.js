const faixasClientes = document.querySelectorAll('[data-carrossel-clientes]')

if (faixasClientes.length) {
  faixasClientes.forEach((faixa) => {
    if (faixa.dataset.clientesCarrossel === 'true') {
      return
    }

    function iniciarCarrosselClientes() {
      const larguraOriginal = faixa.scrollWidth

      if (larguraOriginal === 0) {
        requestAnimationFrame(iniciarCarrosselClientes)
        return
      }

      faixa.dataset.clientesCarrossel = 'true'
      faixa.innerHTML += faixa.innerHTML

      let limite = faixa.scrollWidth / 2
      const direcao = faixa.classList.contains('faixa-clientes-inferior') ? -1 : 1
      let pos = direcao === 1 ? 0 : limite
      let pausado = false
      const velocidade = 0.35

      function animar() {
        if (!pausado) {
          pos += velocidade * direcao

          if (direcao === 1 && pos >= limite) {
            pos = 0
          } else if (direcao === -1 && pos <= 0) {
            pos = limite
          }

          faixa.scrollLeft = pos
        }

        requestAnimationFrame(animar)
      }

      faixa.addEventListener('mouseenter', () => {
        pausado = true
      })

      faixa.addEventListener('mouseleave', () => {
        pausado = false
      })

      window.addEventListener('resize', () => {
        limite = faixa.scrollWidth / 2

        if (direcao === -1 && pos > limite) {
          pos = limite
        } else if (direcao === 1 && pos > limite) {
          pos = pos % limite
        }
      })

      animar()
    }

    requestAnimationFrame(iniciarCarrosselClientes)
  })
}
