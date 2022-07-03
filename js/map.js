function StatsControl(controlDiv) {
  controlDiv.classList.add('control')

  const controlUI = document.createElement('div')
  controlUI.classList.add('control-ui')
  controlUI.title = 'Click to open the statistics'
  controlDiv.appendChild(controlUI)

  const controlText = document.createElement('div')
  controlText.classList.add('control-text')
  controlText.innerHTML = 'Statistics'
  controlUI.appendChild(controlText)

  controlUI.addEventListener('click', () => {
    const currentUrl = window.location.href
    window.location.href = currentUrl.replace('/map/', '/stats/').replace(/&year=\d+/g, '')
  })
}

function TodoFilterControl(controlDiv) {
  controlDiv.classList.add('control')
  controlDiv.classList.add('filter-checkbox')

  const controlUI = document.createElement('input')
  controlUI.id = 'todo-filter-checkbox'
  controlUI.type = 'checkbox'
  controlUI.title = 'Check to show only points with the comment starting with TODO'
  controlDiv.appendChild(controlUI)

  const controlText = document.createElement('label')
  controlText.htmlFor = 'todo-filter-checkbox'
  controlText.classList.add('control-text')
  controlText.innerText = 'TODO only'
  controlDiv.appendChild(controlText)

  controlUI.addEventListener('change', event => {
    toggleTODOMarkers(event.target.checked)
  })
}

var start, end, longpress
let map
let markers = []

function toggleTODOMarkers(showOnlyTODO) {
  for (const marker of markers) {
    marker.setMap(!showOnlyTODO || marker.todo ? map : null)
  }
}

function pointStyle(feature, resolution)
{
	return [ 
	new ol.style.Style({
  		text: new ol.style.Text({
				text: feature.get('label'),
				font: '10px Ubuntu, Gill Sans, Helvetica, Arial, sans-serif',
				//fill: new ol.style.Fill({ color: feature.get('fontColor') }),
				//stroke: new ol.style.Stroke({ color: feature.get('haloColor'), width: 3 })
			}),
		image: new ol.style.RegularShape({
				radius: 20,	
				fill: new ol.style.Fill({ color: 'rgba(255,0,0,1)' }),
				stroke: new ol.style.Stroke({color: 'rgba(0, 0, 0, 0.5)', width: 1}),
			})
		})
	]
}

var dataSource;

function initMap() {
  console.log('initMap called');
  const url = new URL(window.location.href)
  const year = url.searchParams.get('year')
  const points = data.points

  const zoom = year && points[year] ? 18 : data.config.zoom
  const center = year && points[year] ? points[year].latlng : data.config.center


  var layerOSM = new ol.layer.Tile({
            source: new ol.source.OSM()
          });

  dataSource = new ol.source.Vector({
			//url: 'data/areas_topo.json',
			//format: new ol.format.TopoJSON(),
			//attributions: [ 'Area Boundary Data: Crown Copyright ONS' ]
		});
  
  for (const year in points) {

	var pointGeom =  new ol.geom.Point(ol.proj.transform([points[year].latlng.lng, points[year].latlng.lat], "EPSG:4326", "EPSG:3857"));
	var marker = new ol.Feature({ geometry: pointGeom });
	marker.set('label', year);
	dataSource.addFeature(marker);
	}

/*    const marker = new ol.Feature(({
      position: points[year].latlng,
      map,
      title: year,
      label: {
        text: year,
        color: 'white',
        fontSize: '9px',
      },
      todo: points[year].notes.startsWith('TODO'),
    }) */

  
  var layerData = new ol.layer.Vector({
		source: dataSource,
		//extent: ol.proj.transformExtent([-8, 49.8, 1.9, 60.9], 'EPSG:4326', 'EPSG:3857'),
		style: pointStyle
	});


  map = new ol.Map({
		target: "map",
		layers: [ layerOSM, layerData ],
		view: new ol.View({
			projection: "EPSG:3857",
			//maxZoom: 11,
			//minZoom: 1, 
			zoom: zoom,
			center: ol.proj.transform([center.lng, center.lat], "EPSG:4326", "EPSG:3857"),
			extent: ol.proj.transformExtent([data.config.borders.west, data.config.borders.south, data.config.borders.east, data.config.borders.north], "EPSG:4326", "EPSG:3857")
		}),
	});

/*
  map = new google.maps.Map(document.getElementById('map'), {
    zoom,
    center,
    clickableIcons: false,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
    },
    restriction: {
      latLngBounds: data.config.borders,
    },
  })
*/
/*
  const statsControlDiv = document.createElement('div')
  StatsControl(statsControlDiv)
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(statsControlDiv)

  if (Object.values(points).some(p => p.notes.startsWith('TODO'))) {
    const todoFilterControlDiv = document.createElement('div')
    TodoFilterControl(todoFilterControlDiv)
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(todoFilterControlDiv)
  }
 */ 
  
/*
  for (const year in points) {
    const marker = new google.maps.Marker({
      position: points[year].latlng,
      map,
      title: year,
      label: {
        text: year,
        color: 'white',
        fontSize: '9px',
      },
      todo: points[year].notes.startsWith('TODO'),
    })
  */  
    /*
    
    marker.addListener('click', () => {
      if (longpress) {
        const currentUrl = window.location.href
        window.location.href = `${currentUrl
          .replace('/map', '/item')
          .replace(/[\?&]year=\d+/, '')}&year=${marker.getTitle()}`
      } else {
        map.setZoom(15)
        map.setCenter(marker.getPosition())
      }
    })
    marker.addListener('mousedown', () => {
      start = new Date().getTime()
    })
    marker.addListener('mouseup', () => {
      end = new Date().getTime()
      longpress = end - start < 500 ? false : true
    })
    markers.push(marker) */
}

