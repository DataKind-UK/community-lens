function getPostCodeData(postcode){
	let shortcode = postcode.substr(0,postcode.length-3);
	let file = 'processed_data/'+shortcode+'.json';
	console.log(file);
	$.ajax(
		{
			url: file,
			success: function(result){
				if(result[postcode]==undefined){
					error.push(postcode);
				} else {
					let data = result[postcode];
					data.unshift(postcode);
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
	setForData('IMD');
}

function setForData(topic){
	let dataIndex = {'IMD':5,'Income':6}
	let index = dataIndex[topic];
	setLayerStyle();
	averageRank = getAverageRank(postcodeData,index);
	rankBar('#averageRank',averageRank,[]);
	barChart('#barchart',postcodeData,index);
}

function getDecile(rank){
	let decile = Math.floor(parseInt(rank)/32844*10)+1
	if(decile>10){
		decile = 10;
	}
	return decile
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
var featureLayer;
let colours = ['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837'];
init();
