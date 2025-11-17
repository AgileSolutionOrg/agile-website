const heroTypingElement=document.getElementById('hero-typing')
const heroPhrases=[
  "Agile Solution",
  "Agilidade & soluções",
  "Desafiando o futuro."
]

let heroPhraseIndex=0
let heroCharIndex=0
let heroDeleting=false

function heroTypeLoop(){
  const currentPhrase=heroPhrases[heroPhraseIndex]
  if(!heroDeleting){
    heroCharIndex++
    if(heroCharIndex===currentPhrase.length+1){
      heroDeleting=true
      setTimeout(heroTypeLoop,800)
      heroTypingElement.textContent=currentPhrase.substring(0,heroCharIndex)
      return
    }
  }else{
    heroCharIndex--
    if(heroCharIndex===0){
      heroDeleting=false
      heroPhraseIndex=(heroPhraseIndex+1)%heroPhrases.length
    }
  }
  heroTypingElement.textContent=currentPhrase.substring(0,heroCharIndex)
  const baseDelay=40
  const extraDelay=heroDeleting?0:10
  setTimeout(heroTypeLoop,baseDelay+extraDelay)
}

document.addEventListener('DOMContentLoaded',()=>{
  if(!heroTypingElement)return
  heroTypingElement.textContent=""
  heroTypeLoop()
})
