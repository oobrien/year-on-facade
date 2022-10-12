function updateHeader(city, year) {
  const title = [year, city.replaceAll('_', ' '), data.config.country].filter(n => n).join(', ')
  document.querySelector('h1').innerHTML = title
}

var photosBaseUrl = data.config.photosBaseUrl;
if (data.config.photosBaseUrlLocal)
{
	photosBaseUrl = data.config.photosBaseUrlLocal;
}		


function updateLinks(city, year) {
  const currentLocation = window.location

  const coordinates = `${data.points[year].latlng.lat},${data.points[year].latlng.lng}`
  const map = document.querySelector('#map a')
  map.href = data.config.useInternalMap
    ? currentLocation.href.replace('/item', '/map')
    : `https://www.google.com/maps/search/${coordinates}`

  const streetview = document.querySelector('#streetview a')
  streetview.href = `https://www.google.com/maps?q=&layer=c&cbll=${coordinates}&cbp=12,0,0,0,-15`

  const more = document.querySelector('#more a')
  const statsUrl = `${currentLocation.origin}${currentLocation.pathname.replace('/item', '/stats')}`
  more.href = `${statsUrl}?city=${city}`

  const yearitems = Object.keys(data.points).filter(p => p.substring(0, 4) == year.substring(0, 4) && p.indexOf("_") == -1);
  for (var i in yearitems)
  {
    var thisyear = yearitems[i];
    if (thisyear == year) { continue; }

    const yearitem = document.createElement('a');
    yearitem.href = `${currentLocation.origin}${currentLocation.pathname}?city=${city}&year=${thisyear}`
	addPhoto(yearitem, `${photosBaseUrl}/${city}/${thisyear}_close.jpg`)
    document.querySelector('#yearitems').append(yearitem);
  }
  
  const lastnext = Object.keys(data.points).filter(p => p.length == 4);
  lastnext.sort();
  for (var i in lastnext)
  {
    var thisyear = lastnext[i];
    if (thisyear == year.substring(0, 4))
    {
		if (i > 0) 
		{
			var lastyear = lastnext[i-1];
			const yearitem = document.createElement('a');
			yearitem.href = `${currentLocation.origin}${currentLocation.pathname}?city=${city}&year=${lastyear}`
			addPhoto(yearitem, `${photosBaseUrl}/${city}/${lastyear}_close.jpg`)
			const caption = document.createElement('div');
			caption.innerHTML = lastyear.substring(0, 4);
			yearitem.appendChild(caption);
			document.querySelector('#lastnextitems').append(yearitem);
		}
		if (i < lastnext.length-1)
		{
			var nextyear = lastnext[parseInt(i)+1];
			const yearitem = document.createElement('a');
			yearitem.href = `${currentLocation.origin}${currentLocation.pathname}?city=${city}&year=${nextyear}`
			addPhoto(yearitem, `${photosBaseUrl}/${city}/${nextyear}_close.jpg`)
			const caption = document.createElement('div');
			caption.innerHTML = nextyear.substring(0, 4);
			yearitem.appendChild(caption);
			document.querySelector('#lastnextitems').append(yearitem);
		}
		break;
    }
  }
  
  var nearbyitems = Object.keys(data.points).filter(p => p.indexOf("_") == -1);
  nearbyitems.sort(
  	function(a, b) 
  	{ 
  		return ol.sphere.getDistance(
  			[data.points[a].latlng.lng, data.points[a].latlng.lat], 
  			[data.points[year].latlng.lng, data.points[year].latlng.lat]) -  
  			ol.sphere.getDistance([data.points[b].latlng.lng, data.points[b].latlng.lat], 
  			[data.points[year].latlng.lng, data.points[year].latlng.lat]) 
  	}
  );
  
  for (var i = 1; i < 5; i++)
  {
    var thisyear = nearbyitems[i];
    
    const nearbyitem = document.createElement('a');
    nearbyitem.href = `${currentLocation.origin}${currentLocation.pathname}?city=${city}&year=${thisyear}`
	addPhoto(nearbyitem, `${photosBaseUrl}/${city}/${thisyear}_close.jpg`)

	var distanceAway = ol.sphere.getDistance(
  			[data.points[thisyear].latlng.lng, data.points[thisyear].latlng.lat], 
  			[data.points[year].latlng.lng, data.points[year].latlng.lat]);
	const caption = document.createElement('div');
	caption.innerHTML = thisyear.substring(0, 4) + ": " + Math.round(distanceAway, 0) + "m";
	nearbyitem.appendChild(caption);
    document.querySelector('#nearbyitems').append(nearbyitem);
  }

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
