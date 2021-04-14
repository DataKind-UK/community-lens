function getAverageRank(postcodes,index){
	let reducer = function(total,postcode){
		let value = parseInt(postcode[index]);
		return total+value;
	}

	console.log('calc average');
	let max = 32844;
	let total = postcodes.reduce(reducer,0);
	let count = postcodes.length;
	let average = (total/count);
	let averagePercent = average/max;
	return averagePercent;
}

function rankBar(id,rank,comparisons,topic){

	let barColours = colours[topic];

	$(id).html('');
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
			return barColours[d];
		});

	let markerPositionX = rank*200

	svg.append('path')
    .attr("d", d3.svg.symbol().type("triangle-down").size(100))
    .attr("transform", function(d) { return "translate(" + markerPositionX + "," + 2 + ")"; })
    .style("fill", "black");
}

function barChart(id,postcodes,index,topic){

	let barColours = colours[topic];

	$(id).html('');
	let data = processDataForBarChart(postcodes,index);

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
			return barColours[i];
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

function processDataForBarChart(postcodes,index){
	let deciles = [0,0,0,0,0,0,0,0,0,0];
	postcodes.forEach(function(postcode){
		let decile = getDecile(postcode[index])-1;
		deciles[decile]++;
	});
	return deciles;
}