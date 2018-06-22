/*
Brandon Ko
17 June 2018
Background page for the GradeCalc Chrome Extension
Allows extension to be available only on canvas.uw.edu
*/

chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'canvas.uw.edu'}})],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });