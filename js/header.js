const cabecalho=document.querySelector('[data-cabecalho]')
const botaoMenu=document.querySelector('[data-abrir-menu]')
const itensMenu=document.querySelectorAll('.item-menu')
const botaoRobots = document.getElementById('botao-robots')

if (botaoRobots) {
  botaoRobots.addEventListener('click', (e) => {
    e.stopPropagation()
    window.location.href = "https://agilerobots.com.br/"
  })
}
function ehMobile(){
  return window.innerWidth<=750
}

function alternarMenu(){
  if(!ehMobile())return
  const aberto=cabecalho.classList.toggle('cabecalho-aberto')
  botaoMenu.setAttribute('aria-expanded',aberto)
}

function rolarPara(id){
  const alvo=document.getElementById(id)
  if(alvo)alvo.scrollIntoView({behavior:'smooth',block:'start'})
  if(ehMobile()){
    cabecalho.classList.remove('cabecalho-aberto')
    botaoMenu.setAttribute('aria-expanded','false')
  }
}

if(botaoMenu){
  botaoMenu.addEventListener('click',alternarMenu)
}

itensMenu.forEach(i=>i.addEventListener('click',e=>rolarPara(e.currentTarget.dataset.ir)))

window.addEventListener('resize',()=>{
  if(!ehMobile()){
    cabecalho.classList.remove('cabecalho-aberto')
    botaoMenu.setAttribute('aria-expanded','false')
  }
})
document.querySelectorAll("[data-ir]").forEach(btn => {
  btn.addEventListener("click", () => {
    const destino = btn.getAttribute("data-ir");
    const secao = document.getElementById(destino);
    if (secao) {
      secao.scrollIntoView({ behavior: "smooth" });
    }
  });
});
