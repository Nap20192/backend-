async function initialize() {
  async function checkDataState() {
    const button = document.getElementsByClassName("fav-btn")[0]
    const fav_svg = document.getElementById('emptyHeart')
    try {
      const response = await fetch(`/checkfavorite?recipeId=${button.id}`)
      const data = response;
      if (response.ok) {
        const data = await response.json()
        if (data.isFavorite) {
          fav_svg.classList.add('faved')
        } else {
          fav_svg.classList.remove('faved')
        }
        
        return data.isFavorite;
      } else {
        console.error('Failed to fetch favorite state')
        return false
      }
    } catch (error) {
    console.error('Error checking favorite status:', error)
    return false
  }
  }
  
  const button = document.getElementsByClassName("fav-btn")[0]
  let clickCounter = 0
  let isFavorite
  window.onload = async function() {
    console.log("Everything is loaded including images, CSS, etc.");
    isFavorite = await checkDataState()
}
  
  button.addEventListener('click', async () => {
    const fav_svg = document.getElementById('emptyHeart')
    const sourceHolder = document.getElementsByClassName('source-holder')[0]
    console.log("Source Holder ID:", sourceHolder.id)
    isFavorite = await checkDataState()
    console.log(isFavorite)
    let response;
    
    if (isFavorite) {
      clickCounter += 1
      fav_svg.classList.remove('faved')
      response = await fetch('/removefavorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: button.id,
          type: sourceHolder.id
        })
      })
    } else {
        fav_svg.classList.add('faved')
        response = await fetch('/addfavorite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipeId: button.id,
            type: sourceHolder.id
          })
        })
      fav_svg.classList.add('faved')
    }    

  })
}

initialize()