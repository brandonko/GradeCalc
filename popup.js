/*
Brandon Ko
11 June 2018
JavaScript for the GradeCalc Extension popup
*/

'use strict';
window.onload = function () {
	chrome.storage.sync.clear(function(){});
	function $(id) {return document.getElementById(id)}
	function cl(e) {console.log(e)}
	function $cn(id) {return document.getElementsByClassName(id)}
	function clStr(content) {chrome.tabs.executeScript({
		code: "cl('" + content + "')"})}
	function alrt(content) {chrome.tabs.executeScript({
		code: "alert('" + content + "')"})}
	function round100(num) {return Math.round(num * 100) / 100}

	var acquiredPoints;
	var gradePercentage;
	var acquiredPointsMean;
	var gradePercentageMean;
	var totalPoints;
	var processedStats;
	var weighted;
	var weightedGradeValues = {};

	//Extracts the data when the popup is opened
	chrome.tabs.executeScript({file: 'extractData.js'});

	//Updates Statistics table with current variables
	function updateStatistics() {
		if (!isNaN(acquiredPoints)) {
			$('acquiredPoints').innerHTML =
			Math.round(acquiredPoints*100)/100;
		} else {
			$('acquiredPoints').innerHTML = "--"
		}
		if (!isNaN(gradePercentage)) {
			$('gradePercentage').innerHTML =
			Math.round(gradePercentage*100)/100;
		} else {
			$('gradePercentage').innerHTML = "--";
		}
		if (!isNaN(acquiredPointsMean)) {
			$('acquiredPointsMean').innerHTML =
			Math.round(acquiredPointsMean*100)/100;
		} else {
			$('acquiredPointsMean').innerHTML = "--";
		}
		if (!isNaN(gradePercentageMean)) {
			$('gradePercentageMean').innerHTML =
			Math.round(gradePercentageMean*100)/100;
		} else {
			$('gradePercentageMean').innerHTML = "--";
		}
		if (!isNaN(totalPoints)) { 
			$('totalPoints').innerHTML =
			Math.round(totalPoints*100)/100;
		} else {
			$('totalPoints').innerHTML = "--";
		}
	}

	//Resets Popup
	function reset() {
		acquiredPoints = undefined;
		gradePercentage = undefined;
		acquiredPointsMean = undefined;
		gradePercentageMean = undefined;
		totalPoints = undefined;
		processedStats = undefined;
		updateStatistics();
		$('weightedPercentages').innerHTML = "";
		$('categoricalGrades').innerHTML = "";
		$('editFormSelect').innerHTML = "";
		$('minScoreSelection').innerHTML = "";
		$('statsTitle').innerHTML = "Statistics";
		clStr("Local data has been reset")
	}
	$('resetStatistics').addEventListener('click', function() {reset()})

	//Collect data for an unweighted course
	$('unweightedCalc').addEventListener('click', function() {
		reset();
		$('statsTitle').innerHTML = "Statistics (unweighted)";
		weighted = false;
		chrome.storage.sync.get(['processedStats'], function(e) {
			processedStats = e.processedStats;
			acquiredPoints = 0;
			totalPoints = 0;
			acquiredPointsMean = 0;
			for(var key in e.processedStats) {
				acquiredPoints += e.processedStats[key].myScore;
				totalPoints += e.processedStats[key].totalPoints;
				acquiredPointsMean += e.processedStats[key].mean;
			}
			gradePercentage = acquiredPoints/totalPoints * 100;
			gradePercentageMean = acquiredPointsMean/totalPoints * 100;
			createTable();
			updateStatistics();
			createEditForm();
		})
		clStr("Completed Unweighted Data Extraction")
	})

	//Collect data for an weighted course 
	$('weightedCalc').addEventListener('click', function() {
		reset();
		$('statsTitle').innerHTML = "Statistics (weighted)"
		weighted = true;
		chrome.storage.sync.get(['processedStats'], function(e) {
			processedStats = e.processedStats;
			acquiredPoints = 0;
			totalPoints = 0;
			acquiredPointsMean = 0;
			for(var key in e.processedStats) {
				acquiredPoints += e.processedStats[key].myScore;
				totalPoints += e.processedStats[key].totalPoints;
				acquiredPointsMean += e.processedStats[key].mean;
			}
			createTable();
			updateStatistics();
			createEditForm();

			//Creates table for weight input
			$('weightedPercentages').innerHTML = "";
			var table = document.createElement("TABLE")
			var row = document.createElement("TR")
			var label1 = document.createElement("TH")
			label1.appendChild(document.createTextNode("Category:"))
			row.appendChild(label1)
			var label2 = document.createElement("TH")
			label2.appendChild(document.createTextNode("Weight:"))
			row.appendChild(label2)
			table.appendChild(row)

			for (var key in e.processedStats) {
				var row = document.createElement("TR")
				var e = document.createElement("TD")
				var txt = document.createTextNode(key)
				e.appendChild(txt)
				row.appendChild(e)
				var input = document.createElement('INPUT');
				input.classList.add("gradeInput")
				input.type = "number"
				input.id = key + "Weight"
				row.appendChild(input)
				var e2 = document.createElement("TD")
				var txt2 = document.createTextNode("%")
				e2.appendChild(txt2)
				row.appendChild(e2)
				table.appendChild(row)
			}
			$('weightedPercentages').appendChild(table)
			var button = document.createElement("BUTTON")
			button.innerHTML = "Submit Percentages"
			button.id = "submitWeightedPercentages"
			$('weightedPercentages').appendChild(button)


			//Calculate grade percentages based on weighted values submitted by user
			$('submitWeightedPercentages').addEventListener('click', function() {
				chrome.storage.sync.get(['processedStats'], function(e) {
					gradePercentage = 0;
					gradePercentageMean = 0;
					for (var key in e.processedStats) {
						var weight = $(key + "Weight").value/100
						var myGrade = e.processedStats[key].myScore /
						e.processedStats[key].totalPoints;
						var meanGrade = e.processedStats[key].mean /
						e.processedStats[key].totalPoints;

						gradePercentage += weight * myGrade
						gradePercentageMean += weight * meanGrade
						weightedGradeValues[key] = {"gradePercentage" : weight * myGrade, 
						"gradePercentageMean" : weight * meanGrade, 
						"weight" : weight}
					}
					gradePercentage *= 100
					gradePercentageMean *= 100
					updateStatistics();
					clStr("Weighted Grade Percentages Calculated")
				})
			})
		})
		clStr("Completed Weighted Data Extraction")
	})

	//Create form for editing grades and min score calculation
	function createEditForm() {
		$('editFormSelect').innerHTML = ""

		for (var key in processedStats) {
			var option = document.createElement("OPTION")
			option.value = key
			option.appendChild(document.createTextNode(key))
			$('editFormSelect').appendChild(option)
		}

		for (var key in processedStats) {
			var option = document.createElement("OPTION")
			option.value = key
			option.appendChild(document.createTextNode(key))
			$('minScoreSelection').appendChild(option)
		}
	}


	//Create table with points in each grade category
	function createTable() {
		chrome.storage.sync.get(['processedStats'], function(e) {
			$('categoricalGrades').innerHTML = "";
			var table = document.createElement("TABLE")
			table.id = "gradesTable"
			var row = document.createElement("TR")
			row.id = "headerRow"
			row.appendChild(document.createElement("TH"))

			var hd1 = document.createElement("TH")
			var hd1txt = document.createTextNode("Mean")
			hd1.appendChild(hd1txt)
			row.appendChild(hd1)

			var hd2 = document.createElement("TH")
			var hd2txt = document.createTextNode("My Grades")
			hd2.appendChild(hd2txt)
			row.appendChild(hd2)

			var hd3 = document.createElement("TH")
			var hd3txt = document.createTextNode("Total Points")
			hd3.appendChild(hd3txt)
			row.appendChild(hd3)

			table.appendChild(row)

			for (var key in e.processedStats) {
				var row1 = document.createElement("TR");
				row1.id = key;

				var hd = document.createElement("TH");
				var hdTxt = document.createTextNode(key);
				hd.appendChild(hdTxt)
				row1.appendChild(hd)

				var e1 = document.createElement("TD")
				if (e.processedStats[key] != undefined) {
					var text1 = document.createTextNode(round100(e.processedStats[key].mean))
					e1.id = key + "meanTable"
					e1.appendChild(text1);
				} else {
					e1.appendChild(document.createTextNode("--"))
				}
				row1.appendChild(e1);

				var e2 = document.createElement("TD")
				e2.id = key + "myScoreTable"
				var text2 = document.createTextNode(round100(e.processedStats[key].myScore))
				e2.appendChild(text2);
				row1.appendChild(e2);

				var e3 = document.createElement("TD")
				var text3 = document.createTextNode(round100(e.processedStats[key].totalPoints))
				e3.id = key + "totalPointsTable"
				e3.appendChild(text3);
				row1.appendChild(e3);

				table.appendChild(row1);
			}
			$('categoricalGrades').appendChild(table)
		})
	}

	//Make an edit to Statistics
	$('submitEdit').addEventListener('click', function() {
		var category = $('editFormSelect').value;
		var column = $('editGroupSelect').value;
		clStr(category)
		clStr(column)
		var mod = parseFloat($('gradeEdit').value);
		if (isNaN(mod)) {
			mod = 0
		}
		if ($('editOperation').value == 'subtract') mod = -mod;
		processedStats[category][column] += mod

		var id = category + column + "Table"
		$(id).innerHTML = processedStats[category][column]

		if (weighted) {
			gradePercentage = 0;
			gradePercentageMean = 0;
			for (var key in processedStats) {
				var weight = weightedGradeValues[key].weight
				var myGrade = processedStats[key].myScore /
				processedStats[key].totalPoints;
				var meanGrade = processedStats[key].mean /
				processedStats[key].totalPoints;

				gradePercentage += weight * myGrade
				gradePercentageMean += weight * meanGrade
			}
			gradePercentage *= 100
			gradePercentageMean *= 100
		} else {
			acquiredPoints = 0;
			totalPoints = 0;
			acquiredPointsMean = 0;
			for(var key in processedStats) {
				acquiredPoints += processedStats[key].myScore;
				totalPoints += processedStats[key].totalPoints;
				acquiredPointsMean += processedStats[key].mean;
			}
			gradePercentage = acquiredPoints/totalPoints * 100;
			gradePercentageMean = acquiredPointsMean/totalPoints * 100;
		}
		updateStatistics();
		clStr("Completed Edit")
	})

	//Calculate minimum score required
	$('minScoreSubmit').addEventListener('click', function () {
		var desiredGrade = $('desiredGrade').value / 100;
		var gradeValue = parseInt($('gradeValue').value);
		var minPoints;
		if (weighted) {
			for (var key in processedStats) {
				var category;
				clStr(key)
				if ($('minScoreSelection').value == key) {
					category = key;
					clStr("selected")
				} else {
					if (weightedGradeValues[key] == undefined) {
						alrt("need to fill out weight of categories")
						break;
					} else {
						desiredGrade -= weightedGradeValues[key].gradePercentage
					}
				}
			}

			minPoints = desiredGrade / weightedGradeValues[category].weight
			* (gradeValue + processedStats[category].totalPoints) - 
			processedStats[category].myScore
		} else {
			var newTotalScore = gradeValue + totalPoints;
			minPoints = (desiredGrade * 
				(totalPoints + gradeValue)) - acquiredPoints;
		}

		minPoints = Math.ceil(minPoints)
		var minScore = Math.round(minPoints * 10000 / gradeValue)/100;
		if (isNaN(minPoints)) {
			$('minScoreRequired').innerHTML = "--";
			$('minGradeRequired').innerHTML = "--";
		} else if (minPoints > gradeValue) {
			$('minScoreRequired').innerHTML = "impossible";
			$('minGradeRequired').innerHTML = "--";
		} else if(minPoints < 0) {
			$('minScoreRequired').innerHTML = 0;
			$('minGradeRequired').innerHTML = 0;
		} else {
			$('minScoreRequired').innerHTML = minPoints;
			$('minGradeRequired').innerHTML = minScore;
		}
		clStr("Min Score Calculated")
	})
}