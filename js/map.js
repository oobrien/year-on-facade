let map
var layerData;
var layerTODOOnly;

function todo()
{
	layerTODOOnly.setVisible(!layerTODOOnly.getVisible());
	layerData.setVisible(!layerData.getVisible());
}

function pointStyle(feature, resolution)
{
	return [ 
		new ol.style.Style({
			image: new ol.style.Circle({			
				radius: 12,
				fill: new ol.style.Fill({ color: feature.get('fillColor') }),
				stroke: new ol.style.Stroke({ 
					color: 'rgba(0,0,0,0.7)', 
					width: 1})
			}),
			text: new ol.style.Text({
				text: feature.get('label'),
				font: '9px Ubuntu, Gill Sans, Helvetica, Arial, sans-serif',
				fill: new ol.style.Fill({ color: 'rgba(0,0,0,1)' }),
				stroke: new ol.style.Stroke({ color: 'rgba(255,255,255,1)', width: 2 })
			})
		})
	]
}

function todoStyle(feature, resolution)
{
	if (!feature.get('todo')) return null
	else return pointStyle(feature, resolution);
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
  
	for (const year in points){
		var pointGeom =  new ol.geom.Point(ol.proj.transform([points[year].latlng.lng, points[year].latlng.lat], "EPSG:4326", "EPSG:3857"));
		var marker = new ol.Feature({ geometry: pointGeom });
		marker.setId(year);
		marker.set('label', year);
		marker.set('fillColor', 'rgba(64,192,255,0.7)');
		marker.set('todo', false);	
		if (points[year].notes.length > 3 && points[year].notes.substring(0, 4) == "TODO")
		{
			marker.set('fillColor', 'rgba(255,96,96,0.5)');	
			marker.set('todo', true);	
		}
		dataSource.addFeature(marker);
	}

	layerData = new ol.layer.Vector({
		source: dataSource,
		style: pointStyle
	});

	layerTODOOnly = new ol.layer.Vector({
		source: dataSource,
		style: todoStyle
	});

    layerTODOOnly.setVisible(false);
	
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
      
	map = new ol.Map({
		target: "map",
		layers: [ layerOSM, layerBoundary, layerData, layerTODOOnly ],
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
		map.forEachFeatureAtPixel(e.pixel, function (f, layer) 
		{
			if (layer != layerData && later != layerTODOOnly)
			{
				return;
			}

			selected = f;
			window.location.href = '../item/?city=' + data.config.city + '&year=' + f.getId();
		});
	});
}