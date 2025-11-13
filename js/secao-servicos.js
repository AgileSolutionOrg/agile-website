// js/secao-servicos.js
const carrosselServicos=document.querySelector('[data-carrossel-servicos]')
let arrastando=false
let inicioX=0
let scrollInicial=0

if(carrosselServicos){
  carrosselServicos.addEventListener('mousedown',e=>{
    arrastando=true
    carrosselServicos.classList.add('arrastando')
    inicioX=e.pageX-carrosselServicos.offsetLeft
    scrollInicial=carrosselServicos.scrollLeft
  })

  window.addEventListener('mouseup',()=>{
    arrastando=false
    carrosselServicos.classList.remove('arrastando')
  })

  window.addEventListener('mousemove',e=>{
    if(!arrastando)return
    e.preventDefault()
    const x=e.pageX-carrosselServicos.offsetLeft
    const deslocamento=x-inicioX
    carrosselServicos.scrollLeft=scrollInicial-deslocamento
  })

  carrosselServicos.addEventListener('touchstart',e=>{
    const toque=e.touches[0]
    arrastando=true
    inicioX=toque.pageX-carrosselServicos.offsetLeft
    scrollInicial=carrosselServicos.scrollLeft
  })

  carrosselServicos.addEventListener('touchend',()=>{
    arrastando=false
    carrosselServicos.classList.remove('arrastando')
  })

  carrosselServicos.addEventListener('touchmove',e=>{
    if(!arrastando)return
    const toque=e.touches[0]
    const x=toque.pageX-carrosselServicos.offsetLeft
    const deslocamento=x-inicioX
    carrosselServicos.scrollLeft=scrollInicial-deslocamento
  })
}
