/*
Brandon Ko
18 June 2018
JavaScript that manually collects individual and class average scores for each
assignment entered into gradebook. Sorts this data by assignment category
and syncs it with chrome.storage as processedStats
*/
'use strict';
function $(id) {return document.getElementById(id)}
function cl(e) {console.log(e)}
function $cn(id) {return document.getElementsByClassName(id)}

var unprocessedStats = {};
var processedStats = {};

var dataSetPersonal = $cn('student_assignment assignment_graded editable')

for (var i = 0; i < dataSetPersonal.length; i++) {
	var category = dataSetPersonal[i].getElementsByClassName('context')[0].innerHTML;
	var totalPoints = parseFloat(dataSetPersonal[i].
		getElementsByClassName('possible points_possible')[0].innerHTML)
	var myScore = parseFloat(dataSetPersonal[i].
		getElementsByClassName('grade')[0].innerHTML.substring(395, 420))

	if (totalPoints != 0 && !isNaN(myScore)) {
		unprocessedStats[parseInt(dataSetPersonal[i].id.
			substring(11, dataSetPersonal[i].id.length))] = {"category" : category,
		"totalPoints" : totalPoints,
		"myScore" : myScore
		}
	}
}

var acquiredPointsMeanGroupedArray = 
$cn("ic-Table ic-Table--condensed score_details_table");
for (var i = 0; i < acquiredPointsMeanGroupedArray.length; i++) {
	var mean = parseFloat(acquiredPointsMeanGroupedArray[i].innerHTML.substring(522, 530));

	if (!isNaN(mean)) {
		unprocessedStats[parseInt(acquiredPointsMeanGroupedArray[i].id.
		substring(14, acquiredPointsMeanGroupedArray[i].id.length))].mean = mean;
	}
}

for (var key in unprocessedStats) {
	var category = unprocessedStats[key].category
	if (processedStats.hasOwnProperty(category)) {
		processedStats[category].totalPoints += unprocessedStats[key].totalPoints
		processedStats[category].myScore += unprocessedStats[key].myScore
		processedStats[category].mean += unprocessedStats[key].mean
	} else {
		processedStats[category] = 
		{"totalPoints" : unprocessedStats[key].totalPoints,
		"myScore" : unprocessedStats[key].myScore,
		"mean" : unprocessedStats[key].mean}
	}
}

//cl(JSON.stringify(processedStats))
chrome.storage.sync.set({"processedStats" : processedStats},function(){});