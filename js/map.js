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

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	featureLayer = L.esri.featureLayer({
	  url: 'https://services3.arcgis.com/ivmBBrHfQfDnDf8Q/arcgis/rest/services/Indices_of_Multiple_Deprivation_(IMD)_2019/FeatureServer/0',
	  simplifyFactor: 0.35,
	  minZoom:10,
	  precision: 5,
	  renderer:L.canvas(),
	}).addTo(map);

	let postcodeLayer = getPostcodeLayer(postcodes);
	postcodeLayer.addTo(map);
	let bounds = postcodeLayer.getBounds();
	map.fitBounds(bounds);
}

function getPostcodeLayer(postcodes,index){
	let markers = [];
	postcodes.forEach(function(postcode){
		let popUp = "<p>Postcode: "+postcode[0]+"</p>";
		popUp += "<p>IMD rank: "+postcode[5]+"</p>";
		popUp += "<p>IMD Decile: "+getDecile(postcode[5])+"</p>";
		popUp += "<p>Income rank: "+postcode[6]+"</p>";
		popUp += "<p>Income Decile: "+getDecile(postcode[6])+"</p>";
		let marker = L.marker([postcode[1], postcode[2]]).bindPopup(popUp);
		markers.push(marker);
	});

	let postcodeLayer = L.featureGroup(markers);
	return postcodeLayer;
}