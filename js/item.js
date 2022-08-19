function updateHeader(city, year) {
  const title = [year, city, data.config.country].filter(n => n).join(', ')
  document.querySelector('h1').innerHTML = title
}

function updateLinks(city, year) {
  const currentLocation = window.location

  const map = document.querySelector('#map a')
  map.href = data.config.useInternalMap
    ? currentLocation.href.replace('/item', '/map')
    : `https://www.google.com/maps/search/${data.points[year].latlng.lat},${data.points[year].latlng.lng}`

  const streetview = document.querySelector('#streetview a')
  streetview.href = `https://www.google.com/maps?q=&layer=c&cbll=${data.points[year].latlng.lat},${data.points[year].latlng.lng}&cbp=11,0,0,0,0`

  const more = document.querySelector('#more a')
  const statsUrl = `${currentLocation.origin}${currentLocation.pathname.replace('/item', '/stats')}`
  more.href = `${statsUrl}?city=${city}`

  // handle Back to World view link
  const url = new URL(currentLocation.href)
  if (url.searchParams.get('city') == 'World') {
    document.querySelector('#back a').href = `${statsUrl}?city=World`
  } else {
    document.querySelector('#back').remove()
  }
}

function updateExternalLink(city, year) {
  const externalId = data.points[year].external
  const externalConfig = data.config.external || (data.citiesConfig && data.citiesConfig[city].config.external)
  if (externalConfig && externalId) {
    const link = document.querySelector('#external a')
    link.innerHTML = "See details on " + externalConfig.label
    const template = externalConfig.template
    link.href = template.replace('EXTERNAL_ID', externalId)
  }
}

function updateNotes(year) {
  const notes = data.points[year].notes
  const notesContainer = document.querySelector('#notes')
  if (notes) {
    notesContainer.innerHTML = data.points[year].notes + "<br />" + year.substring(0, 4)  
  }
  else
  {
    notesContainer.innerHTML = year.substring(0, 4)  
  }
}

function addPhoto(container, url) {
  const photo = document.createElement('object')
  photo.data = url
  photo.type = 'image/jpeg'
  container.appendChild(photo)
}

function addPhotos(city, year) {
  if (data.config.photosBaseUrl && city != 'Replacements') {
    var photosBaseUrl = data.config.photosBaseUrl;
  	if (data.config.photosBaseUrlLocal)
  	{
  		photosBaseUrl = data.config.photosBaseUrlLocal;
  	}
    const photoContainer = document.querySelector('#photoContainer')
    addPhoto(photoContainer, `${photosBaseUrl}/${city}/${year}_close.jpg`)
    addPhoto(photoContainer, `${photosBaseUrl}/${city}/${year}.jpg`)
  }
}

function generateNotFoundPage(year) {
  const body = document.querySelector('body')
  body.innerHTML = ''

  const header = document.createElement('h1')
  header.innerText = `No year ${year} in the ${city} collection`

  const wrapper = document.createElement('div')
  wrapper.classList.add('stat')

  const link = document.createElement('a')
  const currentLocation = window.location
  link.href = `${currentLocation.origin}${currentLocation.pathname.replace('/item', '/stats')}?city=${city}`
  link.innerText = `All the items in the ${city} collection`

  body.appendChild(header)

  wrapper.appendChild(link)
  body.appendChild(wrapper)
}

function updateItem() {
  const url = new URL(window.location.href)
  const year = url.searchParams.get('year')

  if (typeof data == 'undefined' || !data.points[year]) {
    generateNotFoundPage(year)
    return
  }

  const city = data.points[year].city || url.searchParams.get('city')

  updateHeader(city, year)
  updateLinks(city, year)
  updateExternalLink(city, year)
  updateNotes(year)
  if (year.indexOf("_") == -1) {
    addPhotos(city, year)
  }
}

window.onload = updateItem
