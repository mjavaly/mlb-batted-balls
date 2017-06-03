d3.json("bbs-2016.json", function(jsonData) {

	// svg dimensions
	var w = 1050;           
	var h = 1000;
	var margin = 120;
	var xVal = "x";
	var yVal = "y";
	var pointPlot = d3.select("#pointsSVG");

	// the scale we used to transform x- and y- coordinates to plot coordinates
	xScale = d3.scale.linear()
				.domain([0,250])
				.range([margin, w - margin]);
	yScale = d3.scale.linear()
				.domain([0,235])
				.range([h - margin, margin]);

	// baseball diamond dimensions
	var x_hp = 125;
	var y_hp = 43;
	var f_len = 150;
	var b_len = 45;
	var y_max = 250;
	var f_angl = Math.sqrt(2)/2;

	// draw the foul lines
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

	// draw the basepaths
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

	// initialize batter/pitcher/color scheme
	var batterSelection = "";
	var pitcherSelection = "ALL_PITCHERS";
	var binary_color = false;
	
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

		// change legend if binary color scheme chosen
		if (binary_color) {
			$("#color-list").html(`
				<li style="color:#377eb8;"><label>Hits</label></li>
				<li style="color:#e41a1c;"><label>Outs</label></li>`);
		}
		else {
			$("#color-list").html(`
				<li style="color:#ff7f00;"><label>Home Runs</label></li>
				<li style="color:#252525;"><label>Triples</label></li>
				<li style="color:#377e35;"><label>Doubles</label></li>
				<li style="color:#377eb8;"><label>Singles</label></li>
				<li style="color:#e41a1c;"><label>Outs</label></li>`);
		}

		var hitResults = $("#hit-results").val();
		
		// subset json data if not all stadiums are selected
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

		// remove previous plot before making new one
		pointPlot.selectAll("circle").remove();

		// if no hit results are selected, alert user
		if (!hitResults && !binary_color) {
			alert("No results!");
			return;
		}

		var circle = pointPlot.selectAll("circle")
				.data(data);
			circle.enter()
				.append("svg:circle");
		
		// filter json by selected filters
		var filteredSelection = circle.filter(function(d) {
			var p = pitcherFilter(d);
			var b = batterFilter(d);
			var j = d["type"] != "E" && !(d["x"] <= 1 && d["y"] <= 1);
			var correctHit = binary_color || (hitResults.includes(d["des"].toLowerCase()) || (hitResults.includes("out") && d["type"] == "O"));
			return correctHit && p && b && j;
		});

		// helper function for varying opacity given number of points
		function getOpacity(numPoints) {
			if (numPoints > 60000) { return "0.3"; }
			else if (numPoints > 4000) { return "0.6"; }
			else { return "1"; }
		}

		// helper functions for color schemes
		function multipleColorScheme(hitDesc) {
			if (hitDesc == "Single") { return "#1f78b4"; }
			else if (hitDesc == "Double") { return "#377e35"; }
			else if (hitDesc == "Triple") { return "#000000"; }
			else if (hitDesc == "Home Run") { return "#ff7f00"; }
		}
		function binaryColorScheme(hitDesc) {
			return "1f78b4";
		}

		var pointRadius = (filteredSelection[0].length > 4000) ? "2" : "3";
		var pointOpacity = getOpacity(filteredSelection[0].length);
		var colorScheme = (binary_color) ? binaryColorScheme : multipleColorScheme;

		filteredSelection
			.attr("cx", function(d) { return xScale(d["x"]); })
			.attr("cy", function(d) { return yScale(250-d["y"]); })
			.style("fill", function(d) {
				switch (d["type"]) {
					case "O":
						return "#e41a1c";
						break;
					case "H":
						return colorScheme(d["des"]);
						break;
				}
			})
			.attr("r", pointRadius)
			.style("opacity", pointOpacity)
			.on("mouseover", function(d) {
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
		for (team in jsonData) {
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

		$("#hit-results").on("change", function() {
						var group = "input:checkbox[name='hit-results']";	
						$(group).prop("checked", false);
						binary_color = false;
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
						break;
					case "binary_color":
						binary_color = true;
						break;
				}
			}
			else {
				$box.prop("checked", false);

				switch ($box.attr("id")) {
					case "rightybatters":
						batterSelection = "";
						break;
					case "leftybatters":
						batterSelection = "";
						break;
					case "allbatters":
						batterSelection = "";
						break;
					case "rightypitchers":
						pitcherSelection = "";
						break;
					case "leftypitchers":
						pitcherSelection = "";
						break;
					case "allpitchers":
						pitcherSelection = "";
						break;
					case "binary_color":
						binary_color = false;
						break;
				}
			}
		});

		d3.select("#plotUpdate").on("click", function() {
			updatePoints();
		});
	});

	// initialize text and checkbox fields
	$("#allballparks").prop("checked", true);
	$("#allpitchers").prop("checked", true);
	$("#ballparks").val("");
	$("#batters").val("Mike Trout");
	$("#pitchers").val("");
	$("#hit-results").val(["out", "single", "double", "triple", "home run"]);
	updatePoints();
});

