// Part of a brief D3 tutorial.
// Upon completion, will display an interactive scatterplot showing relationship between
//   different values associated with the top 100 words in Shakespeare"s First Folio
// CS 314, Spring 2017
// Eric Alexander

// First, we will create some constants to define non-data-related parts of the visualization
var w = 1050;           // Width of our visualization
var h = 1000;           // Height of our visualization
var margin = 120;        // Margin around visualization
var xVal = "x";
var yVal = "y";
var teamParks = {"Red Sox": "Fenway Park",
				"Angels": "Angel Stadium",
				"Tigers": "Comerica Park",
				"Rangers": "Globe Life Park",
				"White Sox": "Guaranteed Rate Field",
				"Royals": "Kauffman Stadium",
				"Astros": "Minute Maid Park",
				"Athletics": "Oakland Alameda Coliseum",
				"Orioles": "Oriole Park",
				"Indians": "Progressive Field",
				"Blue Jays": "Rogers Centre",
				"Mariners": "Safeco Field",
				"Twins": "Target Field",
				"Rays": "Tropicana Field",
				"Yankees": "Yankee Stadium",
				"Giants": "AT&T Park",
				"Cardinals": "Busch Stadium",
				"Diamondbacks": "Chase Field",
				"Mets": "Citi Field",
				"Phillies": "Citizens Bank Park",
				"Rockies": "Coors Field",
				"Dodgers": "Dodger Stadium",
				"Reds": "Great American Ball Park",
				"Marlins": "Marlins Park",
				"Brewers": "Miller Park",
				"Nationals": "Nationals Park",
				"Padres": "Petco Park",
				"Pirates": "PNC Park",
				"Braves": "Turner Field",
				"Cubs": "Wrigley Field"};

var curTeam = "Twins";
var curBatter = "Brian Dozier";
var curPitcher = "";

d3.json("bbs-2016.json", function(jsonData) {
    
    pointPlot = d3.select("#pointsSVG");
    
	function updatePoints(ballpark, batter, pitcher) {
        var data = [];
        if (ballpark == "") {
            for (park in jsonData) {
                data = data.concat(jsonData[park]);
            }
        }
        else {
            data = jsonData[ballpark];
        }
        console.log(data.length);
		// This will define scales that convert values
		// from our data domain into screen coordinates.
//		xScale = d3.scale.linear()
//					.domain([d3.min(data, function(d) { return parseFloat(d[xVal]); })-1,
//							 d3.max(data, function(d) { return parseFloat(d[xVal]); })+1])
//					.range([margin, w - margin]);
//		yScale = d3.scale.linear()
//					.domain([d3.min(data, function(d) { return parseFloat(d[yVal]); })-1,
//							 d3.max(data, function(d) { return parseFloat(d[yVal]); })+1])
//					.range([h - margin, margin]);
        
        var xMin = d3.min(data, function(d) { return parseFloat(d[xVal]); })-1;
        var yMin = d3.min(data, function(d) { return parseFloat(d[yVal]); })-1;
        var xMax = d3.max(data, function(d) { return parseFloat(d[xVal]); })+1;
        var yMax = d3.max(data, function(d) { return parseFloat(d[yVal]); })+1;
        console.log("x min: " + xMin);
        console.log("x max: " + xMax);
        console.log("y min: " + yMin);
        console.log("y max: " + yMax);
        
        xScale = d3.scale.linear()
					.domain([0,250])
					.range([margin, w - margin]);
		yScale = d3.scale.linear()
					.domain([0,235])
					.range([h - margin, margin]);
        
        pointPlot.selectAll("*").remove();

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
					var p = (pitcher == "") ? true : d["pitcher_name"] == pitcher;
					var b = (batter == "") ? true : d["batter_name"] == batter;
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
				.attr("r", 2)
				.on("mouseover", function(d) { console.log(d); })
	}
	
	$(function() {
        // use Sets for batters and pitchers to prevent duplicates
		var batters = new Set();
		var pitchers = new Set();
		for (park in jsonData) {
			for (var i = 0; i < jsonData[park].length; i++) {
				var hit = jsonData[park][i];
				batters.add(hit["batter_name"]);
				pitchers.add(hit["pitcher_name"]);
			}
		}
        // jquery autocomplete only works with arrays for some reason
		let batterList = Array.from(batters);
		let pitcherList = Array.from(pitchers);
        // get list of stadiums and their home teams
        var bps = [];
        for (team in teamParks) {
            bps.push(team);
    //		bps.push(team + " (" + teamParks[team] + ")");
        }
        $("#ballparks").autocomplete({ source: bps })
					.on("autocompletechange", function() {
						curTeam = this.value;
						console.log(curTeam);
					});
		$("#batters").autocomplete({ source: batterList })
					.on("autocompletechange", function() {
						curBatter = this.value;
						console.log(curBatter);
					});
		$("#pitchers").autocomplete({ source: pitcherList })
					.on("autocompletechange", function() {
						curPitcher = this.value;
						console.log(curPitcher);
					});
		d3.select("#plotUpdate").on("click", function() {
			console.log("updating...");
			updatePoints(curTeam, curBatter, curPitcher);
		});
	});

    $("#ballparks").val("Twins");
    $("#batters").val("Brian Dozier");
    $("#pitchers").val("");
    updatePoints(curTeam, curBatter, curPitcher);

});

// var park = d3.select("#ballparks");
// console.log(park.data);

// park.on("input", function() {
// 	var newData = d3.select(this);
// 	console.log(newData);
// 	// updatePoints(newData);
// });

