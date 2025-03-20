const checkIfNavigationSupported = () => {
  return Boolean(document.startViewTransition)
}

const fetchPage = async (url) => {
  // acá podemos hacer lo que queramos antes de que se cargue la página
  // cargamos la próxima página, le hacemos un fetch para recuperarla (es como hacer un curl)
  const response = await fetch(url) // fetch('clean-code') pero dinámico
  const text = await response.text()
  // quedarnos solo con el contenido del HTML dentro de la etiqueta body, esto lo hacemos así porque Astro no tiene soporte nativo para view-transitions
  // usamos regex para extraerlo
  const [, data] = text.match(/<body[^>]*>([\s\S]*)<\/body>/i)

  return data
}

export const startViewTransition = () => {
  if(!checkIfNavigationSupported()) return // si el navegador soporta la API de view transitions, la usamos
  
  window.navigation.addEventListener('navigate', (event)=>{ // se ejecuta cuando cambiamos de pagina
    console.log(event.destination.url) // muestra la URL de la página a la que vamos a ir

    const toUrl = new URL(event.destination.url)

    // es una página externa? si es así lo ignoramos
    if(window.location.origin !== toUrl.origin) return

    // es una navegación en el mismo dominio?
    event.intercept({
      async handler(){
        const data = await fetchPage(toUrl.pathname) 
        // utilizamos la api de view transition API
        document.startViewTransition(() => { // le informamos como cambiar de página, hace una foto del contenido anterior y otra del nuevo, luego cambia el contenido
          // cambiamos el contenido de la página
          document.body.innerHTML = data // CON ESTO YA TENEMOS NUESTRA PRIMERA VIEW TRANSITION que es un pequeño fade out y fade in
          // el scroll hacia arriba del todo
          document.documentElement.scrollTop = 0
          
        })
      }
    })
  })
  // los errores son de TypeScript, pero no afectan al funcionamiento
}