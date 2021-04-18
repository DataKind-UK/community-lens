function getPostCodeData(postcode){
	let shortcode = postcode.substr(0,postcode.length-3);
	let postcodeEnd = postcode.substr(postcode.length-3,postcode.length-2);
	let fileEnding = '_5'
	if(parseInt(postcodeEnd)<5){
		fileEnding = '_0'
	}

	let file = '../processed_data/'+shortcode+fileEnding+'.json';
	console.log(file);
	$.ajax(
		{
			url: file,
			success: function(result){
				if(result[postcode]==undefined){
					errors.push(postcode);
				} else {
					let data = result[postcode];
					data.unshift(postcode);
		    		postcodeData.push(result[postcode]);
		    							
				}
				asyncCalls--;
	    		if(asyncCalls==0){
	    			processingComplete();
	    		}
	    		updateProgress()
	  		},
	  		error: function(result){
	  			errors.push(postcode);
	  			asyncCalls--;
	  			if(asyncCalls==0){
	  				processingComplete();
	    		}
	    		updateProgress()
	  		}
  		}
  	);
}

function updateProgress(){
	let progress = total - asyncCalls;
	$('#progress').html(progress+'/'+total);
}

function cleanPostcode(postcode){
	postcode = postcode.replace(/ /g, '');
	postcode = postcode.toUpperCase();
	return postcode
}

function processingComplete(){
	console.log(postcodeData);
	if(errors.length>0){
		$('#analysis-progress').hide();
		$('#analysis-finished').show();
		$('#error-count').html(errors.length);
		$('#errors').html('');
		errors.forEach(function(error){
			$('#errors').append('<p class="errorpostcode">'+error+'</p>')
		});
	} else {
		$('#step1').hide();
		$('#step2').show();
	}

}

function loadAnalysisStep(topic){
	$('#step2').hide();
	$('#step3').show();
	createMap(postcodeData);
	setForData(topic);
}

function setForData(topic){
	console.log('setting for topic: '+topic);

	console.log(dataIndex[topic].definition);

	$('#title').html(dataIndex[topic].title);
	$('#definition').html(dataIndex[topic].definition);

	let index = dataIndex[topic].index;
	let featureAtt = dataIndex[topic].featureAtt;
	setLayerStyle(topic,featureAtt);
	averageRank = getAverageRank(postcodeData,index,topic);
	rankBar('#averageRank',averageRank,[],topic);
	barChart('#barchart',postcodeData,index,topic);
	generateText(postcodeData,index,topic);
	$('.btn-data').removeClass('btn-active');
	$('.btn[data-id="'+topic+'"]').addClass('btn-active');
}

function getDecile(rank){
	let decile = Math.floor(parseInt(rank)/32844*10)+1
	if(decile>10){
		decile = 10;
	}
	return decile
}

function generateDownload(){
	let downloadData = [["Postcode", "Latitude", "Longitude", "LSOA Code", "Local Authority", "IMD Decile", "Income Decile", "Employment Decile", "Education Decile", "Health and Disability Decile", "Crime Decile", "Housing and Services Decile", "Living Environment Decile"]];
	postcodeData.forEach(function(row){
		downloadData.push([row[0],row[1],row[2],row[3],row[4],getDecile(row[5]),getDecile(row[6]),getDecile(row[7]),getDecile(row[8]),getDecile(row[9]),getDecile(row[10]),getDecile(row[11]),getDecile(row[12])]);
	});

	let csvContent = "data:text/csv;charset=utf-8,";

	downloadData.forEach(function(rowArray) {
	    let row = rowArray.join(",");
	    csvContent += row + "\r\n";
	});

	var encodedUri = encodeURI(csvContent);
	window.open(encodedUri);

}

function init(){
	$('.process-postcodes').on('click',function(){
		$('#process-postcodes').hide();
		$('#analysis-finished').hide();
		$('#analysis-progress').show();
		postcodeData = [];
		errors = [];
		let postcodesList = $('#postcode_entry_text').val();
		let postcodes = postcodesList.split(/\n/);
		total = postcodes.length;
		asyncCalls = postcodes.length;
		postcodes.forEach(function(postcode){
			postcode = cleanPostcode(postcode);
			getPostCodeData(postcode);
		});
	});

	$('#continue').on('click',function(){
		$('#step1').hide();
		$('#step2').show();
	});

	$('.btn-data').on('click',function(){
		setForData($(this).attr('data-id'));
	})

	$('#download-data').on('click',function(){
		generateDownload();
	});

	$('#step2').hide();
	$('#step3').hide();

	$('#analysis-progress').hide();
	$('#analysis-finished').hide();

	$('.btn-datatopic').on('mouseover',function(){
		console.log($(this));
		let topic = $(this).attr('data-id');
		console.log(dataIndex);
		console.log(topic);
		let title = dataIndex[topic].title;
		let definition = dataIndex[topic].definition;
		$('#dataset-title').html(title);
		$('#dataset-definition').html(definition);
	});

	$('.btn-datatopic').on('click',function(){
		let topic = $(this).attr('data-id');
		loadAnalysisStep(topic);
	});
}

var postcodeData = [];
var errors = []
var asyncCalls;
var featureLayer;
var total;
let colours = {
	'IMD':['#E65100','#EF6C00','#F57C00','#FB8C00','#FF9800','#FFA726','#FFB74D','#FFCC80','#FFE0B2','#FFF3E0'],
	'Extra':['#40004b','#762a83','#9970ab','#c2a5cf','#e7d4e8','#d9f0d3','#a6dba0','#5aae61','#1b7837','#00441b'],
	'Income':['#01579B','#0277BD','#0288D1','#039BE5','#03A9F4','#29B6F6','#4FC3F7','#81D4FA','#B3E5FC','#E1F5FE'],
	'Employment':['#311B92','#4527A0','#512DA8','#5E35B1','#673AB7','#7E57C2','#9575CD','#B39DDB','#D1C4E9','#EDE7F6'],
	'Education':['#004D40','#00695C','#00796B','#00897B','#009688','#26A69A','#4DB6AC','#80CBC4','#B2DFDB','#E0F2F1'],
	'Health':['#880E4F','#AD1457','#C2185B','#D81B60','#E91E63','#EC407A','#F06292','#F48FB1','#F8BBD0','#FCE4EC'],
	'Crime':['#F57F17','#F9A825','#FBC02D','#FDD835','#FFEB3B','#FFEE58','#FFF176','#FFF59D','#FFF9C4','#FFFDE7'],
	'Housing':['#3E2723','#4E342E','#5D4037','#6D4C41','#795548','#8D6E63','#A1887F','#BCAAA4','#D7CCC8','#EFEBE9'],
	'Environment':['#1B5E20','#2E7D32','#388E3C','#43A047','#4CAF50','#66BB6A','#81C784','#A5D6A7','#C8E6C9','#E8F5E9']
	};
init();











