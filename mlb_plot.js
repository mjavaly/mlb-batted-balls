var w = 1050;           
var h = 1000;           
var margin = 120;       
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

d3.json("bbs-2016.json", function(jsonData) {

	pointPlot = d3.select("#pointsSVG");

	xScale = d3.scale.linear()
				.domain([0,250])
				.range([margin, w - margin]);
	yScale = d3.scale.linear()
				.domain([0,235])
				.range([h - margin, margin]);

	var x_hp = 125;
	var y_hp = 43;
	var f_len = 150;
	var b_len = 45;
	var y_max = 250;
	var f_angl = Math.sqrt(2)/2;

	// draw the foul lines and basepaths
	var leftFoul = pointPlot.append("line")
		.attr("x1", function(d) { return xScale(x_hp); })
		.attr("y1", function(d) { return yScale(y_hp); })
		.attr("x2", function(d) { return xScale(x_hp - f_angl * f_len); })
		.attr("y2", function(d) { return yScale(y_hp + f_angl * f_len); });

	var rightFoul = pointPlot.append("line")
		.attr("x1", function(d) { return xScale(x_hp); })
		.attr("y1", function(d) { return yScale(y_hp); })
		.attr("x2", function(d) { return xScale(x_hp + f_angl * f_len); })
		.attr("y2", function(d) { return yScale(y_hp + f_angl * f_len); });

	var firstToSecond = pointPlot.append("line")
		.attr("x1", function(d) { return xScale(x_hp); })
		.attr("y1", function(d) { return yScale(y_hp + Math.sqrt(2) * b_len); })
		.attr("x2", function(d) { return xScale(x_hp - f_angl * b_len); })
		.attr("y2", function(d) { return yScale(y_hp + f_angl * b_len); });

	var secondToThird = pointPlot.append("line")
		.attr("x1", function(d) { return xScale(x_hp + f_angl * b_len); })
		.attr("y1", function(d) { return yScale(y_hp + f_angl * b_len); })
		.attr("x2", function(d) { return xScale(x_hp); })
		.attr("y2", function(d) { return yScale(y_hp + Math.sqrt(2) * b_len); });

	var batterSelection = "";
	var pitcherSelection = "ALL_PITCHERS";
	
	function updatePoints() {
		var ballpark = $("#ballparks").val();

		// handle batter filters given button/form input
		var batter = (batterSelection) ? batterSelection : $("#batters").val();
		var batterFilter = function(d) { return; }
		switch (batter) {
			case "RIGHTY_BATTERS":
				batterFilter = function(d) { return d["batter_bats"] == "R"; }
				break;
			case "LEFTY_BATTERS":
				batterFilter = function(d) { return d["batter_bats"] == "L"; }
				break;
			case "ALL_BATTERS":
				batterFilter = function(d) { return true; }
				break;
			default:
				batterFilter = function(d) { return d["batter_name"] == batter; }
		}

		// handle pitcher filters given button/form input
		var pitcher = (pitcherSelection) ? pitcherSelection : $("#pitchers").val();
		var pitcherFilter = function(d) { return; }
		switch (pitcher) {
			case "RIGHTY_PITCHERS":
				pitcherFilter = function(d) { return d["pitcher_throws"] == "R"; }
				break;
			case "SOUTHPAWS":
				pitcherFilter = function(d) { return d["pitcher_throws"] == "L"; }
				break;
			case "ALL_PITCHERS":
				pitcherFilter = function(d) { return true; }
				break;
			default:
				pitcherFilter = function(d) { return d["pitcher_name"] == pitcher; }
		}

		var hitResults = $("#hit-results").val();
		var data = [];
		if (ballpark == "") {
			for (park in jsonData) {
				// this merges two arrays without creating a new one
				Array.prototype.push.apply(data, jsonData[park]);
			}
		}
		else {
			data = jsonData[ballpark];
		}

		pointPlot.selectAll("circle").remove();

		var circle = pointPlot.selectAll("circle")
				.data(data);
			circle.enter()
				.append("svg:circle");
		
		var filteredSelection = circle.filter(function(d) {
			var p = pitcherFilter(d);
			var b = batterFilter(d);
			var j = d["type"] != "E" && !(d["x"] <= 1 && d["y"] <= 1);
			var correctHit = hitResults.includes(d["des"].toLowerCase()) || (hitResults.includes("out") && d["type"] == "O");
			return correctHit && p && b && j;
		});

		console.log(filteredSelection[0].length);

		// helper function for varying opacity given number of points
		function getOpacity(numPoints) {
			if (numPoints > 100000) { return "0.3"; }
			else if (numPoints > 60000) { return "0.4" }
			else if (numPoints > 4000) { return "0.6"; }
			else { return "1"; }
		}

		var pointRadius = (filteredSelection[0].length > 4000) ? "2" : "3";
		var pointOpacity = getOpacity(filteredSelection[0].length);

		filteredSelection
			.attr("cx", function(d) { return xScale(d["x"]); })
			.attr("cy", function(d) { return yScale(250-d["y"]); })
			.style("fill", function(d) {
				if (d["type"] == "O") {
					return "#e41a1c";
				}
				if (d["des"] == "Single") {
					return "#1f78b4";
				}
				else if (d["des"] == "Double") {
					return "#984ea3";
				}
				else if (d["des"] == "Triple") {
					return "#252525";
				}
				else if (d["des"] == "Home Run") {
					return "#ff7f00";
				}
				else {
					return "black";
				}
			})
			.attr("r", pointRadius)
			.style("opacity", pointOpacity)
			.on("mouseover", function(d) {
				console.log(d);
				d3.select(this).style("stroke", "white")
								.style("stroke-width", "2px")
								.attr("r", "6");
			})
			.on("mouseout", function(d) {
				d3.select(this).style("stroke", "none")
								.attr("r", pointRadius);
			})
			// tooltip for each point
			.append("svg:title")
			.text(function(d) {
				return d["batter_name"] + " (" + d["batter_bats"] + ") " + 
						getVerb(d["des"]) + ((d["type"] == "O") ? "against " : "off ") +
						d["pitcher_name"] + " (" + d["pitcher_throws"] + ").";
			});
	}

	// helper function for creating tooltip text
	function getVerb(description) {
		switch (description) {
			case "Home Run":
				return "homered ";
				break;
			case "Groundout":
				return "grounded out ";
				break;
			case "Bunt Groundout":
				return "bunted out ";
				break;
			case "Flyout":
				return "flied out ";
				break;
			case "Pop Out":
				return "popped out ";
				break;
			case "Lineout":
				return "lined out ";
				break
			default:
				// a rare case of the English language making it easy to format strings
				return description.toLowerCase() + "d ";
				break;
		}
	}
	
	// this block for initializing button/form input logic
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
		}

		// create logic for autocomplete fields
		// includes unchecking of all relevant checkboxes
		$("#ballparks").autocomplete({ source: bps })
					.on("autocompletechange", function() {
						var group = "input:checkbox[name='ballparks']";	
						$(group).prop("checked", false);
					});
		$("#batters").autocomplete({ source: batterList })
					.on("autocompletechange", function() {
						batterSelection = "";
						var group = "input:checkbox[name='batters']";	
						$(group).prop("checked", false);
					});
		$("#pitchers").autocomplete({ source: pitcherList })
					.on("autocompletechange", function() {
						pitcherSelection = "";
						var group = "input:checkbox[name='pitchers']";	
						$(group).prop("checked", false);
					});

		$("input:checkbox").on('click', function() {
			var $box = $(this);

			// somewhat janky way of erasing text fields when corresponding box gets checked
			$("#" + $box.attr("name")).val("");

			// this just makes our checkboxes behave like radio buttons
			// so they allow for 1 or 0 selections
			if ($box.is(":checked")) {
				var group = "input:checkbox[name='" + $box.attr("name") + "']";
				$(group).prop("checked", false);
				$box.prop("checked", true);

				// do some background logic for filtering later
				switch ($box.attr("id")) {
					case "rightybatters":
						batterSelection = "RIGHTY_BATTERS";
						break;
					case "leftybatters":
						batterSelection = "LEFTY_BATTERS";
						break;
					case "allbatters":
						batterSelection = "ALL_BATTERS";
						break;
					case "rightypitchers":
						pitcherSelection = "RIGHTY_PITCHERS";
						break;
					case "leftypitchers":
						pitcherSelection = "SOUTHPAWS";
						break;
					case "allpitchers":
						pitcherSelection = "ALL_PITCHERS";
				}
			}
			else {
				$box.prop("checked", false);
			}
		});

		d3.select("#plotUpdate").on("click", function() {
			updatePoints();
		});
	});

	$("#allballparks").prop("checked", true);
	$("#allpitchers").prop("checked", true);
	$("#ballparks").val("");
	$("#batters").val("Mike Trout");
	$("#pitchers").val("");
	$("#hit-results").val(["out", "single", "double", "triple", "home run"]);
	updatePoints();
});

