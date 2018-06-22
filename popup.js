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
	function clStr(content) {chrome.tabs.executeScript({code: "cl('" + content + "')"})}
	function round100(num) {return Math.round(num * 100) / 100}

	var acquiredPoints;
	var gradePercentage;
	var acquiredPointsMean;
	var gradePercentageMean;
	var totalPoints;
	var processedStats;

	//Extracts the data when the popup is opened
	chrome.tabs.executeScript({file: 'extractData.js'});

	//Updates Statistics table with current variables
	function updateStatistics() {
		if (!isNaN(acquiredPoints)){$('acquiredPoints').innerHTML =
			Math.round(acquiredPoints*100)/100};
		if (!isNaN(gradePercentage)){$('gradePercentage').innerHTML =
			Math.round(gradePercentage*100)/100};
		if (!isNaN(acquiredPointsMean)){$('acquiredPointsMean').innerHTML =
			Math.round(acquiredPointsMean*100)/100};
		if (!isNaN(gradePercentageMean)){$('gradePercentageMean').innerHTML =
			Math.round(gradePercentageMean*100)/100};
		if (!isNaN(totalPoints)){$('totalPoints').innerHTML =
			Math.round(totalPoints*100)/100};
	}

	//Collect data for an unweighted course
	$('unweightedCalc').addEventListener('click', function() {

		//chrome.tabs.executeScript({file: 'getScoresUnweighted.js'});
		$('statsTitle').innerHTML = "Statistics (unweighted)";

		chrome.storage.sync.get(['processedStats'], function(e) {
			createTable();
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
		})

	})

	//Collect data for an weighted course
	$('weightedCalc').addEventListener('click', function() {
		chrome.storage.sync.get(['processedStats'], function(e) {
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

			//TODO: add table weight input (with button)
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
				input.id = key
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
						var weight = $(key).value/100
						var myGrade = e.processedStats[key].myScore /
						e.processedStats[key].totalPoints;
						var meanGrade = e.processedStats[key].mean /
						e.processedStats[key].totalPoints;

						gradePercentage += weight * myGrade
						gradePercentageMean += weight * meanGrade
					}
					gradePercentage *= 100
					gradePercentageMean *= 100
					updateStatistics();
				})
			})
		})
	})



	//Creates the data table
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
					e1.appendChild(text1);
				} else {
					e1.appendChild(document.createTextNode("--"))
				}
				row1.appendChild(e1);

				var e2 = document.createElement("TD")
				var text2 = document.createTextNode(round100(e.processedStats[key].myScore))
				e2.appendChild(text2);
				row1.appendChild(e2);

				var e3 = document.createElement("TD")
				var text3 = document.createTextNode(round100(e.processedStats[key].totalPoints))
				e3.appendChild(text3);
				row1.appendChild(e3);

				table.appendChild(row1);
			}
			$('categoricalGrades').appendChild(table)
		})
	}

	//Make an edit to Statistics
	$('submitEdit').addEventListener('click', function() {
		var mod = parseFloat(gradeEdit.value);
		var element;
		var curNum;

		if (!isNaN(mod)) {
			if ($('subtractRadio').checked) {
				mod = -mod;
			}

			if ($('myGradesRadio').checked && $('percentageRadio').checked) {
				element = $('gradePercentage');
				gradePercentage += mod;
				acquiredPoints = totalPoints * gradePercentage / 100;
			} else if ($('myGradesRadio').checked && $('pointsRadio').checked
				&& !isNaN(acquiredPoints)) {
				element = $('acquiredPoints');
				acquiredPoints += mod;
				gradePercentage = acquiredPoints / totalPoints * 100;
			} else if ($('classGradesRadio').checked && $('percentageRadio').checked) {
				element = $('gradePercentageMean');
				gradePercentageMean += mod;
				acquiredPointsMean = totalPoints * gradePercentageMean / 100;
			} else if ($('classGradesRadio').checked && $('pointsRadio').checked
				&& !isNaN(acquiredPointsMean)) {
				element = $('acquiredPointsMean');
				acquiredPointsMean += mod;
				gradePercentageMean = acquiredPointsMean / totalPoints * 100;
			} else if ($('totalPointsRadio').checked) {
				element = $('totalPoints');
				totalPoints += mod;
				gradePercentage = acquiredPoints / totalPoints * 100;
				gradePercentageMean = acquiredPointsMean / totalPoints * 100;
			}
			updateStatistics()
		}
	})


	//Calculate minimum score required
	$('unweightedMinScore').addEventListener('click', function() {
		var desiredGrade = $('desiredGrade').value / 100;
		var gradeValue = parseInt($('gradeValue').value);
		var newTotalScore = gradeValue + totalPoints;
		var minPoints = Math.ceil((desiredGrade * 
			(totalPoints + gradeValue)) - acquiredPoints);
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
	})
}