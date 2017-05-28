// Part of a brief D3 tutorial.
// Upon completion, will display an interactive scatterplot showing relationship between
//   different values associated with the top 100 words in Shakespeare"s First Folio
// CS 314, Spring 2017
// Eric Alexander

// First, we will create some constants to define non-data-related parts of the visualization
w = 1050;           // Width of our visualization
h = 1000;           // Height of our visualization
margin = 120;        // Margin around visualization
vals = ["x","y"]
xVal = vals[0]
yVal = vals[1]
teamStadiums = {"Red Sox":"Fenway Park",
				"Angels":"Angel Stadium",
				"Tigers":"Comerica Park",
				"Rangers":"Globe Life Park",
				"White Sox":"Guaranteed Rate Field",
				"Royals":"Kauffman Stadium",
				"Astros":"Minute Maid Park",
				"Athletics":"Oakland Alameda Coliseum",
				"Orioles":"Oriole Park",
				"Indians":"Progressive Field",
				"Blue Jays":"Rogers Centre",
				"Mariners":"Safeco Field",
				"Twins":"Target Field",
				"Rays":"Tropicana Field",
				"Yankees":"Yankee Stadium",
				"Giants":"AT&T Park",
				"Cardinals":"Busch Stadium",
				"Diamondbacks":"Chase Field",
				"Mets":"Citi Field",
				"Phillies":"Citizens Bank Park",
				"Rockies":"Coors Field",
				"Dodgers":"Dodger Stadium",
				"Reds":"Great American Ball Park",
				"Marlins":"Marlins Park",
				"Brewers":"Miller Park",
				"Nationals":"Nationals Park",
				"Padres":"Petco Park",
				"Pirates":"PNC Park",
				"Braves":"Turner Field",
				"Cubs":"Wrigley Field"}
d3.json("bbs-2016.json", function(jsonData) {

	function updatePoints(stadium, batter, pitcher) {

		data = jsonData[stadium];
		// This will define scales that convert values
		// from our data domain into screen coordinates.
		xScale = d3.scale.linear()
					.domain([d3.min(data, function(d) { return parseFloat(d[xVal]); })-1,
							 d3.max(data, function(d) { return parseFloat(d[xVal]); })+1])
					.range([margin, w - margin]);
		yScale = d3.scale.linear()
					.domain([d3.min(data, function(d) { return parseFloat(d[yVal]); })-1,
							 d3.max(data, function(d) { return parseFloat(d[yVal]); })+1])
					.range([h - margin, margin]); // Notice this is backwards!

		// Next, we will create an SVG element to contain our visualization.
		var pointPlot = d3.select("#pointsSVG").append("svg:svg")
			.attr("width", w+600)
			.attr("height", h-200)

		var x_hp = 125;
		var y_hp = 43;
		var f_len = 150;
		var b_len = 45;
		var y_max = 250;
		var f_angl = Math.sqrt(2)/2;

		var leftFoul = pointPlot.append("line")
			.attr("x1", function(d) { return xScale(x_hp); })
			.attr("y1", function(d) { return yScale(y_hp); })
			.attr("x2", function(d) { return xScale(x_hp - f_angl * f_len); })
			.attr("y2", function(d) { return yScale(y_hp + f_angl * f_len); })
			.attr("stroke-width", 2)
			.attr("stroke", "black");

		var rightFoul = pointPlot.append("line")
			.attr("x1", function(d) { return xScale(x_hp); })
			.attr("y1", function(d) { return yScale(y_hp); })
			.attr("x2", function(d) { return xScale(x_hp + f_angl * f_len); })
			.attr("y2", function(d) { return yScale(y_hp + f_angl * f_len); })
			.attr("stroke-width", 2)
			.attr("stroke", "black");

		var firstToSecond = pointPlot.append("line")
			.attr("x1", function(d) { return xScale(x_hp); })
			.attr("y1", function(d) { return yScale(y_hp + Math.sqrt(2) * b_len); })
			.attr("x2", function(d) { return xScale(x_hp - f_angl * b_len); })
			.attr("y2", function(d) { return yScale(y_hp + f_angl * b_len); })
			.attr("stroke-width", 2)
			.attr("stroke", "black");

		var secondToThird = pointPlot.append("line")
			.attr("x1", function(d) { return xScale(x_hp + f_angl * b_len); })
			.attr("y1", function(d) { return yScale(y_hp + f_angl * b_len); })
			.attr("x2", function(d) { return xScale(x_hp); })
			.attr("y2", function(d) { return yScale(y_hp + Math.sqrt(2) * b_len); })
			.attr("stroke-width", 2)
			.attr("stroke", "black");

		var circle = pointPlot.selectAll("circle")
				.data(data);
			circle.enter()
				.append("svg:circle")
				.filter(function(d) {
					var p = (pitcher == "*") ? true : d["pitcher_name"] == pitcher;
					var b = (batter == "*") ? true : d["batter_name"] == batter;
					return p && b;
				})
				.attr("cx", function(d) { return xScale(d["x"]); })
				.attr("cy", function(d) { return yScale(250-d["y"]); })
				.style("fill", function(d) {
					if (d["type"] == "O") {
						return "red";
					}
					else if (d["type"] == "H") {
						return "blue";
					}
					else {
						return "black";
					}
				})
				.attr("r", 3)
				.on("mouseover", function(d) { console.log(d); })
	}
	
	$(function() {
		var batters = new Set();
		var pitchers = new Set();
		for (park in jsonData) {
			for (var i = 0; i < jsonData[park].length; i++) {
				var hit = jsonData[park][i];
				batters.add(hit["batter_name"]);
				pitchers.add(hit["pitcher_name"]);
			}
		}
		let batterList = Array.from(batters);
		let pitcherList = Array.from(pitchers);
		$("#batters").autocomplete({ source: batterList });
		$("#pitchers").autocomplete({ source: pitcherList });
	});

	updatePoints("Twins","Brian Dozier", "*");
});

var park = d3.select("#ballparks");
console.log(park.data);

park.on("input", function() {
	var newData = d3.select(this);
	console.log(newData);
	// updatePoints(newData);
});

$(function() {
	var bps = [];
	for (team in teamStadiums) {
		bps.push(team + " (" + teamStadiums[team] + ")");
	}
	$("#ballparks").autocomplete({ source: bps });
});

