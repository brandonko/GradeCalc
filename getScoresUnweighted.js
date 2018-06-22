/*
Brandon Ko
18 June 2018
JavaScript that collects the data for unweighted grades
THIS PROGRAM IS OBSOLETE (replaced by extractData.js)
*/

'use strict';
function $(id) {return document.getElementById(id)}
function cl(e) {console.log(e)}
function $cn(id) {return document.getElementsByClassName(id)}

//Extract the total and acquired points from Canvas (personal grades)
var elementArray = $cn("student_assignment hard_coded final_grade");
if(elementArray[0] == undefined) {
	chrome.storage.sync.set({"onGradePage" : false},function(){});
	cl("Not on grade page");
} else {
	var frac = elementArray[0].getElementsByClassName('possible points_possible');
	var parseFrac = frac[0].innerHTML.split(" / ");
	var totalPoints = parseFrac[1];
	var acquiredPoints = parseFrac[0];

	chrome.storage.sync.set(
		{"onGradePage" : true, "totalPoints" : totalPoints, 
		"acquiredPoints" : acquiredPoints},
		function(){});
	cl("On grade page, just updated personal grades")
	chrome.storage.sync.get(['onGradePage'], function (e) {
		cl(e.onGradePage.toString())
	})
}

//Extract the class points from Canvas (class grades)
var elementArrayClass = $cn("ic-Table ic-Table--condensed score_details_table");
if (elementArrayClass[0] == undefined) {
	cl("class statistics not available")
	chrome.storage.sync.set({"classStatsAvail" : false},function(){});
} else {
	var totalPointsClassAcquired = 0;
	for(var i = 0; i < elementArrayClass.length; i++) {
		var mean = parseFloat(elementArrayClass[i].innerHTML.substring(522, 530));
		if (!isNaN(mean)) {
			totalPointsClassAcquired += mean;
		}
	}
	chrome.storage.sync.set(
		{"classStatsAvail" : true, 
		"acquiredPointsMean" : totalPointsClassAcquired}, function(){});
}

/* Old Code for $('unweightedCalc').addEventListener('click', function() {:
//Personal Statistics
chrome.storage.sync.get(['onGradePage', 'totalPoints',
	'acquiredPoints'], function(e) {
		clStr("callback personal stats")
		if (e.onGradePage) {
			clStr("on grade page")
			$('errorMessage').innerHTML = "";
			acquiredPoints = parseFloat(e.acquiredPoints);
			totalPoints = parseFloat(e.totalPoints.replace(',', ''));
			gradePercentage = acquiredPoints * 100 / totalPoints;
			chrome.tabs.executeScript({code: 'cl("totalPoints: " +' + totalPoints + ')'});
			updateStatistics();
		} else {
			clStr("not on grade page")
			$('errorMessage').innerHTML = "Error: Not on grades page";
			$('totalPoints').innerHTML = "--";
			$('acquiredPoints').innerHTML =  "--";
			$('gradePercentage').innerHTML =  "--";
		}
	})

//Class Statistics (Means)
chrome.storage.sync.get(['classStatsAvail', 'acquiredPointsMean', 
	'totalPoints'],
	function(e) {
		if(e.classStatsAvail) {
			$('errorMessage2').innerHTML = "";
			acquiredPointsMean = Math.round(e.acquiredPointsMean*100)/100;
			gradePercentageMean = acquiredPointsMean * 100 / totalPoints;
			updateStatistics();
		} else {
			$('errorMessage2').innerHTML = "No class Statistics available";
			$('acquiredPointsMean').innerHTML = "--";
			$('gradePercentageMean').innerHTML = "--";
		}
		*/