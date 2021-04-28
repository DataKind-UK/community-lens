function setLayerStyle(topic,featureAtt){

	let mapColours = colours[topic];
	let style = function (feature) {
  		let colour = mapColours[feature.properties[featureAtt]-1];
      	return { color: colour, weight: 0.5, fillOpacity: 0.5 }
	}
	featureLayer.setStyle(style);
}

function createMap(postcodes){
	let map = L.map('map').setView([52,0], 6);
	map.options.minZoom = 7;

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	featureLayer = L.esri.featureLayer({
	  url: 'https://services3.arcgis.com/ivmBBrHfQfDnDf8Q/arcgis/rest/services/Indices_of_Multiple_Deprivation_(IMD)_2019/FeatureServer/0',
	  simplifyFactor: 0.35,
	  minZoom:10,
	  precision: 5,
	  renderer:L.canvas(),
	  fields:['FID','IMDDec0','IncDec','EmpDec','EduDec','CriDec','BHSDec','EnvDec','HDDDec']
	}).addTo(map);

	let postcodeLayer = getPostcodeLayer(postcodes);
	postcodeLayer.addTo(map);
	

    let info = L.control();

    info.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	    this.update();
	    return this._div;
	};

	info.update = function (props) {
    this._div.innerHTML = '<p id="zoomwarning">Please zoom in to see map layers</p>';
	};

	info.addTo(map);
	info.update();

	map.on('zoomend', function() {
    	let zoom = map.getZoom();
    	if(zoom<10){
    		$('.info').show();
    	} else {
    		$('.info').hide();
    	}

	});

	let bounds = postcodeLayer.getBounds();
	map.fitBounds(bounds);
}

function getPostcodeLayer(postcodes,index){
	let markers = [];
	postcodes.forEach(function(postcode){
		console.log(postcode);
		let popUp = "<p>Postcode: "+postcode[0]+" - "+postcode[4]+"</p>";
		popUp += '<p class="popuptext">IMD rank: '+postcode[5]+' out of 32,844</p>';
		popUp += '<p class="popuptext">IMD Decile: '+getDecile(postcode[5])+'</p>';
		popUp += '<p class="popuptext">Income Decile: '+getDecile(postcode[6])+'</p>';
		popUp += '<p class="popuptext">Employment Decile: '+getDecile(postcode[7])+'</p>';
		popUp += '<p class="popuptext">Education Decile: '+getDecile(postcode[8])+'</p>';
		popUp += '<p class="popuptext">Health and Disability Decile: '+getDecile(postcode[9])+'</p>';
		popUp += '<p class="popuptext">Crime Decile: '+getDecile(postcode[10])+'</p>';
		popUp += '<p class="popuptext">Housing and Services Decile: '+getDecile(postcode[11])+'</p>';
		popUp += '<p class="popuptext">Living Environment Decile: '+getDecile(postcode[12])+'</p>';
		let marker = L.marker([postcode[1], postcode[2]]);
		icon = marker.options.icon;
		icon.options.iconSize = [20, 32];
		icon.options.iconAnchor = [10,32];
		icon.options.shadowSize = [0.0];
		marker.setIcon(icon);
		marker.bindPopup(popUp);
		markers.push(marker);
	});

	let postcodeLayer = L.featureGroup(markers);
	return postcodeLayer;
}