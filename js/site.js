function getPostCodeData(postcode){
	let shortcode = postcode.substr(0,4);
	if(postcode.length == 6){
		shortcode = postcode.substr(0,3);
	}

	let file = 'processed_data/'+shortcode+'.json';
	console.log(file);
	$.ajax(
		{
			url: file,
			success: function(result){
				if(result[postcode]==undefined){
					error.push(postcode);
				} else {
		    		postcodeData.push(result[postcode]);
		    		asyncCalls--;					
				}

	    		if(asyncCalls==0){
	    			processingComplete();
	    		}
	  		},
	  		error: function(result){
	  			errors.push(postcode);
	  			asyncCalls--;
	  			if(asyncCalls==0){
	  				processingComplete();
	    		}
	  		}
  		}
  	);
}

function cleanPostcode(postcode){
	postcode = postcode.replace(/ /g, '');
	postcode = postcode.toUpperCase();
	return postcode
}

function processingComplete(){
	$('#step1').hide();
	$('#step2').show();
	console.log(postcodeData);
	createMap(postcodeData);
	averageRank = getAverageRank(postcodeData);
	rankBar('#averageRank',averageRank,[]);
	barChart('#barchart',postcodeData);
}

function createMap(postcodes){
	let map = L.map('map').setView([52,0], 6);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	L.esri.featureLayer({
	  url: 'https://services3.arcgis.com/ivmBBrHfQfDnDf8Q/arcgis/rest/services/Indices_of_Multiple_Deprivation_(IMD)_2019/FeatureServer/0',
	  simplifyFactor: 0.35,
	  minZoom:10,
	  precision: 5,
	  renderer:L.canvas(),
	  style: function (feature) {
	  		let colour = colours[feature.properties['IMDDec0']-1];
	      	return { color: colour, weight: 0.5, fillOpacity: 0.5 }
		}
	}).addTo(map);

	let postcodeLayer = getPostcodeLayer(postcodes);
	postcodeLayer.addTo(map);
	let bounds = postcodeLayer.getBounds();
	map.fitBounds(bounds);
}

function getPostcodeLayer(postcodes){
	let markers = [];
	postcodes.forEach(function(postcode){
		let marker = L.marker([postcode[0], postcode[1]])
		markers.push(marker);
	});
	let postcodeLayer = L.featureGroup(markers);
	return postcodeLayer;
}

function getAverageRank(postcodes){
	let reducer = function(total,postcode){
		//we should remove this in preprocessing
		let value = parseInt(postcode[4].replace(',',''));
		return total+value;
	}

	console.log('calc average');
	let max = 32844;
	console.log(postcodes);
	let total = postcodes.reduce(reducer,0);
	let count = postcodes.length;
	let average = (total/count);
	let averagePercent = average/max;
	return averagePercent;
}

function rankBar(id,rank,comparisons){

	var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 220 - margin.left - margin.right,
    height = 60 - margin.top - margin.bottom;

	var svg = d3.select(id)
	  .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	let deciles = [0,1,2,3,4,5,6,7,8,9];

	svg.selectAll('rect')
		.data(deciles)
		.enter()
		.append('rect')
		.attr('x', function(d){
			return d*20
		})
		.attr('y', 10)
		.attr('width', 20)
		.attr('height', 20)
		.attr('fill', function(d){
			return colours[d];
		});

	let markerPositionX = rank*200

	svg.append('path')
    .attr("d", d3.svg.symbol().type("triangle-down").size(100))
    .attr("transform", function(d) { return "translate(" + markerPositionX + "," + 2 + ")"; })
    .style("fill", "black");
}

function barChart(id,postcodes){

	let data = processDataForBarChart(postcodes);

	let maxCount = d3.max(data);

	let total = data.reduce(function(acc, val) { return acc + val; }, 0);
	let averageLine = total/10;

	y = d3.scale.linear()
		.domain([0, maxCount])
    	.range([100, 0]);

	var margin = {top: 30, right: 10, bottom: 20, left: 10},
    width = 220 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

	var svg = d3.select(id)
	  .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.selectAll('rect')
		.data(data)
		.enter()
		.append('rect')
		.attr('x', function(d,i){
			return i*20
		})
		.attr('y', function(d){
			return y(d);
		})
		.attr('width', 20)
		.attr('height', function(d){
			return height-y(d);
		})
		.attr('fill', function(d,i){
			return colours[i];
		});

	svg.append('line')
		.attr('x1',0)
		.attr('x2',200)
		.attr('y1',y(averageLine))
		.attr('y2',y(averageLine))
		.attr('stroke','grey')
		.attr('stroke-width',1);

	svg.selectAll('text')
		.data(data)
		.enter()
		.append('text')
		.attr("x", function(d,i) { return i*20+6; })
    	.attr("y",function(d){
			return y(d)-10;
		})
    	.attr("dy", ".35em")
    	.text(function(d) { if(d>0){
	    		return d
	    	} else {
	    		return ''
	    	}
    	});

    svg.selectAll('textaxis')
		.data(data)
		.enter()
		.append('text')
		.attr("x", function(d,i) { return i*20+6; })
    	.attr("y",function(d){
			return 100;
		})
    	.attr("dy", "1em")
    	.text(function(d,i) {
	    	return (i+1)
    	});
}

function processDataForBarChart(postcodes){
	let deciles = [0,0,0,0,0,0,0,0,0,0];
	postcodes.forEach(function(postcode){
		let decile = postcode[5]-1;
		deciles[decile]++;
	});
	return deciles;
}

function init(){
	$('#process_postcodes').on('click',function(){
		let postcodesList = $('#postcode_entry_text').val();
		let postcodes = postcodesList.split(/\n/);
		asyncCalls = postcodes.length;
		postcodes.forEach(function(postcode){
			postcode = cleanPostcode(postcode);
			getPostCodeData(postcode);
		});
	});
}

var postcodeData = [];
var errors = []
var asyncCalls;
let colours = ['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'];
init();
