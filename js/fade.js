const animated=document.querySelectorAll(".zoom-in,.drop-in,.slide-left,.fade-in,.blur-in,.light-in,.skew-in,.elastic-in")
const observer=new IntersectionObserver(e=>{
  e.forEach(i=>{
    if(i.isIntersecting){
      i.target.classList.add("show")
      observer.unobserve(i.target)
    }
  })
},{threshold:.2})

animated.forEach(i=>observer.observe(i))
