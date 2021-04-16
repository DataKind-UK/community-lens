function generateText(postcodes,index,topic){
	let deciles = processDataForBarChart(postcodes,index);
	let cumulDeciles = getCumulativeDeciles(deciles);
	let texts = findText(cumulDeciles,topic);
	insertTexts(texts);
}

function getCumulativeDeciles(deciles){
	cumulativeDeciles = [0,0,0,0,0,0,0,0,0,0]
	let total = 0
	deciles.forEach(function(decile,i){
		for(j=i;j<10;j++){
			cumulativeDeciles[j]+=decile;
		}
		total+=decile;
	});
	cumulativeDeciles.forEach(function(d,i){
		cumulativeDeciles[i]=d/total;
	});
	return cumulativeDeciles
}

function findText(deciles,topic){
	console.log(deciles);
	let texts = [];
	if(deciles[0]>=0.25){
		let text = '{{d0}}% of the locations are located in the bottom 10% of areas in England for {{topic}}'.replace('{{topic}}',topic).replace('{{d0}}',Math.floor(deciles[0]*100));
		texts.push({'text':text,'priority':10});
	}
	if(deciles[2]>=0.50){
		let text = '{{d2}}% of the locations are located in the bottom 30% of areas in England for {{topic}}'.replace('{{topic}}',topic).replace('{{d2}}',Math.floor(deciles[2]*100));
		texts.push({'text':text,'priority':8});
	}
	if(deciles[4]>=0.75){
		let text = '{{d4}}% of the locations are located in the bottom 50% of areas in England for {{topic}}'.replace('{{topic}}',topic).replace('{{d4}}',Math.floor(deciles[4]*100));
		texts.push({'text':text,'priority':8});
	}
	if(deciles[4]>=0.5 && deciles[4]<0.75){
		let text = 'The majority of the locations ({{d4}}%) are located in the bottom half of areas in England for {{topic}}'.replace('{{topic}}',topic).replace('{{d4}}',Math.floor(deciles[4]*100));
		texts.push({'text':text,'priority':5});
	}


	if(deciles[8]<=0.75){
		let text = '{{d8}}% of the locations are located in the top 10% of areas in England for {{topic}}'.replace('{{topic}}',topic).replace('{{d8}}',100-Math.floor(deciles[8]*100));
		texts.push({'text':text,'priority':10});
	}
	if(deciles[7]<=0.50){
		let text = '{{d7}}% of the locations are located in the top 30% of areas in England for {{topic}}'.replace('{{topic}}',topic).replace('{{d7}}',100-Math.floor(deciles[7]*100));
		texts.push({'text':text,'priority':8});
	}
	if(deciles[4]<=0.25){
		let text = '{{d5}}% of the locations are located in the top 50% of areas in England for {{topic}}'.replace('{{topic}}',topic).replace('{{d5}}',100-Math.floor(deciles[4]*100));
		texts.push({'text':text,'priority':8});
	}
	if(deciles[4]<=0.5 && deciles[4]>0.25){
		let text = 'The majority of the locations ({{d5}}%) are located in the top half of areas in England for {{topic}}'.replace('{{topic}}',topic).replace('{{d5}}',100-Math.floor(deciles[4]*100));
		texts.push({'text':text,'priority':5});
	}
	return texts;
}

function insertTexts(texts){
	$('#gen-text').html('<ul id="gen-text-list"></ul>')
	texts.forEach(function(text){
		$('#gen-text-list').append('<li>'+text.text+'</li>');
	});
}