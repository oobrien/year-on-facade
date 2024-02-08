let map
var layerData;

function pointStyle(feature, resolution)
{
	return [ 
		new ol.style.Style({
			image: new ol.style.Circle({			
				radius: resolution > 100 ? (resolution > 200 ? 3 : 5) : 12,
				fill: new ol.style.Fill({ color: feature.get('fillColor') }),
				stroke: new ol.style.Stroke({ 
					color: 'rgba(0,0,0,0.7)', 
					width: 0.4})
			}),
			text: resolution > 100 ? null : new ol.style.Text({
				text: feature.get('label'),
				font: '9px/0.7 Ubuntu, Gill Sans, Helvetica, Arial, sans-serif',
				fill: new ol.style.Fill({ color: 'rgba(255,255,255,1)' }),
				stroke: new ol.style.Stroke({ color: 'rgba(0,0,0,1)', width: 2 })
			})
		})
	]
}

const keyItems = [
	["1899", "Visited", "visited"], 
	["1900_", "TODO", "todo"], 
	["1899a", "Supplementary", "additional"], 
	["1900a_", "Supp. TODO", "additionaltodo"], 
	["1899R_", "Replacement", "replacement"]
];

function createMarker(year, pointGeom)
{
		var marker = new ol.Feature({ geometry: pointGeom });
		marker.setId(year);
		var cat = "visited";
		marker.set('fillColor', 'rgba(0,255,255,1)');	

		if (year.indexOf("_") > -1)
		{
			if (year.length > 5)
			{
				if (year.indexOf("R") > -1) 
				{
					cat = "replacement"
					marker.set('fillColor', 'rgba(255,128,0,1)');	
				}
				else
				{
					cat = "additionaltodo"
					marker.set('fillColor', 'rgba(255,255,0,0.5)');				
				}
			}
			else
			{
				cat = "todo"
				marker.set('fillColor', 'rgba(255,0,0,1)'); 
			}
		}
		else
		{
			if (year.length > 4)
			{
				cat = "additional"	
				marker.set('fillColor', 'rgba(64,128,255,0.5)'); 	
			}
		}
		marker.set('category', cat);
		let yearText = year.replaceAll("_", "");
		marker.set('label', yearText);
		if (yearText.length > 4)
		{
			marker.set('label', '\n' + yearText.substring(0, 4) + '\n' + yearText.substring(4))
		}
		return marker;
}

var keyMaps = [];
function handleZoom()
{
	for (var i in keyMaps)
	{
	    keyMaps[i].getView().setZoom(map.getView().getZoom());	
	}
}

function filterData(category)
{
	layerData.getSource().forEachFeature((feature) => {
		// your filter logic
		if (feature.get('category') == category)
		{
		 if (feature.getStyle() == null)
		 {
			 feature.setStyle(new ol.style.Style({})); // hide feature             
		 }
		 else
		 {
			feature.setStyle(null); // show feature             
		 }
		}
	});
}


function initMap() 
{
	const url = new URL(window.location.href);
	const year = url.searchParams.get('year');
	const points = data.points;

	var layerOSM = new ol.layer.Tile({
		source: new ol.source.OSM()
    });

  	var dataSource = new ol.source.Vector({});
  
	var markers = [];
	for (const year in points){
		var pointGeom =  new ol.geom.Point(ol.proj.transform([points[year].latlng.lng, points[year].latlng.lat], "EPSG:4326", "EPSG:3857"));
		var marker = createMarker(year, pointGeom)
		markers.push(marker);
	}

	markers.sort((a, b) => a.get('cat') > b.get('cat'));

	for (const i in markers)
	{
		dataSource.addFeature(markers[i]);	
	}
	
	layerData = new ol.layer.Vector({
		source: dataSource,
		style: pointStyle
	});

	var layerBoundary = new ol.layer.Vector({
		style: new ol.style.Style({ 
		fill: new ol.style.Fill({color: 'rgba(255,255,255,0.3' }),
			stroke: new ol.style.Stroke({color: 'rgba(0,255,255,0.7)', width: 3}),
		})
	});
	
	if (data.config.boundary)
	{	
		var boundarySource = new ol.source.Vector({
				url: "../areas/" + data.config.city +  ".json",
				defaultProjection: "EPSG:4326",
				format: new ol.format.GeoJSON(),
				attributions: [ "Boundary: Crown Copyright ONS" ]
		});
		layerBoundary.setSource(boundarySource);
	}

	var zoomToExtentControl = new ol.control.ZoomToExtent({
        extent: dataSource.getExtent(),
        label: "🌎"
      });
      
	const sourceLocation = new ol.source.Vector();
	const layerLocation = new ol.layer.Vector({
	  source: sourceLocation,
	  style: new ol.style.Style({
			image: new ol.style.Circle({			
				radius: 7,
				fill: new ol.style.Fill({ color: 'rgba(255,255,255,0.5)' }),
				stroke: new ol.style.Stroke({ 
					color: 'rgba(0,128,255,0.7)', 
					width: 5})
			})
		})
	});      
      
	map = new ol.Map({
		target: "map",
		layers: [ layerOSM, layerBoundary, layerData, layerLocation ],
		controls: ol.control.defaults({}).extend([
			//new ol.control.ZoomSlider({}),
			new ol.control.ScaleLine({geodesic: true, units: 'metric' }),
			zoomToExtentControl
		]),
		view: new ol.View({
			projection: "EPSG:3857",
			maxZoom: 19,
			minZoom: 1, 
		}),
	});
	
	if (year && points[year])
	{
		var center = ol.proj.transform([points[year].latlng.lng, points[year].latlng.lat], "EPSG:4326", "EPSG:3857");
		map.getView().setCenter(center);
		map.getView().setZoom(18);
	}
	else
	{
		map.getView().fit(dataSource.getExtent());
		map.getView().setZoom(map.getView().getZoom()-0.3);
		if (map.getView().getZoom() > 18)
		{
			map.getView().setZoom(18);
		}
	}

	if (data.config.boundary)
	{
		layerOSM.setOpacity(0.5);
	}
	
	map.on('click', function(e) 
	{	
		var noFeature = true;
		map.forEachFeatureAtPixel(e.pixel, function (f, layer) 
		{
			if (layer != layerData)
			{
				return;
			}

			noFeature = false;
			window.location.href = '../item/?city=' + data.config.city + '&year=' + f.getId();
		});
		if (noFeature)
		{
			var coord = ol.proj.transform(map.getCoordinateFromPixel(e.pixel), "EPSG:3857", "EPSG:4326");
			var coordstr = ol.coordinate.toStringXY(coord, 5).replace(' ', '');
			var lat = coordstr.split(',')[1];
			var lon = coordstr.split(',')[0];
			console.log('YYYYx_,' + lat + ',' + lon + ',Name,OSMID');
			console.log('https://www.openstreetmap.org/query?lat=' + lat + '&lon=' +lon + '&zoom=18&xhr=1#map=18/' + lat + '/' + lon);
			console.log('https://misc.oomap.co.uk/year-on-facade/csv/UK/' + data.config.city + '.csv');
		}
	});
	
	map.getView().on("change:resolution", handleZoom);    
	
	var keyCount = 0;
	const parent = document.querySelector('#key')
	for (const i in keyItems)
	{
        const keyRow = document.createElement('tr')
		keyRow.classList.add('keyRow')
		
		const keyMapContainer = document.createElement('td')
		keyMapContainer.classList.add('keyMap')
		keyMapContainer.id = "keyMap" + keyCount;
		keyRow.appendChild(keyMapContainer)

		const keyLabel = document.createElement('td')
		keyLabel.classList.add('keyLabel')
		keyLabel.innerHTML = keyItems[i][1];
		keyRow.appendChild(keyLabel)
		keyRow.addEventListener('click', function() { filterData(keyItems[i][2]) });

		parent.appendChild(keyRow);

		var pointGeom = new ol.geom.Point([0, 0]);
		var marker = createMarker(keyItems[i][0], pointGeom);
		var keySource = new ol.source.Vector({});
		keySource.addFeature(marker);		

		var layerKey = new ol.layer.Vector({
			source: keySource,
			style: pointStyle
		});

		var keyMap = new ol.Map({ target: "keyMap" + keyCount,
			layers: [ layerKey ],
			controls: [], view: new ol.View({ center: [0, 0], zoom: map.getView().getZoom() }) 
		});		
		keyMaps.push(keyMap);
		keyCount++;	
	}	
	
	//0 = off
	//1 = starting
	//2 = operating and zoomed
	
	let geolocation = 0;
	let geolocationHandlerId = 0
	function switchOnGeolocation()
	{
	   geolocation = 1;
		geolocationHandlerId = navigator.geolocation.watchPosition(function(pos) {
		  sourceLocation.clear(true);
		  sourceLocation.addFeature(
			new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat([pos.coords.longitude, pos.coords.latitude]))));
		  if (geolocation == 1)
		  {
		  	geolocation = 2;
			map.getView().fit(sourceLocation.getExtent(), {
			  maxZoom: 18,
			  duration: 500
			});
		  }
		}, function(error) {
		  alert(`ERROR: ${error.message}`);
		}, {
		  enableHighAccuracy: true
		});	
	}


	const locate = document.createElement('div');
	locate.className = 'ol-control ol-unselectable locate';
	locate.innerHTML = '<button title="Locate me">◎</button>';
	locate.addEventListener('click', function() {
	  if (geolocation == 0)
	  {
	  	switchOnGeolocation();
	  }
	  if (geolocation == 2)
	  {
	  	navigator.geolocation.clearWatch(geolocationHandlerId);
		sourceLocation.clear(true);
	  	geolocation = 0;
	  }
	});
	map.addControl(new ol.control.Control({
	  element: locate
	}));	
	
	
}