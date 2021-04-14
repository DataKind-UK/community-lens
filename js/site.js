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
	console.log('setting for topic: '+topic);
	let dataIndex = {'IMD':{'index':5,'featureAtt':'IMDDec0'},'Income':{'index':6,'featureAtt':'IncDec'}}
	let index = dataIndex[topic].index;
	let featureAtt = dataIndex[topic].featureAtt;
	setLayerStyle(topic,featureAtt);
	averageRank = getAverageRank(postcodeData,index,topic);
	rankBar('#averageRank',averageRank,[],topic);
	barChart('#barchart',postcodeData,index,topic);
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

	$('.btn-data').on('click',function(){
		setForData($(this).attr('data-id'));
		$('.btn-data').removeClass('btn-active');
		$(this).addClass('btn-active');
	})
}

var postcodeData = [];
var errors = []
var asyncCalls;
var featureLayer;
let colours = {
	'IMD':['#F57F17','#F9A825','#FBC02D','#FDD835','#FFEB3B','#FFEE58','#FFF176','#FFF59D','#FFF9C4','#FFFDE7'],
	'Extra':['#40004b','#762a83','#9970ab','#c2a5cf','#e7d4e8','#d9f0d3','#a6dba0','#5aae61','#1b7837','#00441b'],
	'Income':['#01579B','#0277BD','#0288D1','#039BE5','#03A9F4','#29B6F6','#4FC3F7','#81D4FA','#B3E5FC','#E1F5FE']
	};
init();
