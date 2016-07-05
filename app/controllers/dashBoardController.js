
var db = require('../../db');

var q = require('q');

var DocsHelper = require('../helpers/docsHelper');

var ClientHelper = require('../helpers/clientHelper');

exports.getDashboardData = function(req,res){
	var dashboardDetails = {todaysMetrics : {}, totalMetrics : {}};
	var promisesArray = [ClientHelper.getTodaysClientsCount(dashboardDetails), ClientHelper.getTotalClientsCount(dashboardDetails),
	DocsHelper.getTodaysPendingTasks(dashboardDetails), DocsHelper.getTotalPendingTasks(dashboardDetails),
	DocsHelper.getTodaysTasks(dashboardDetails), DocsHelper.getTotalTasks(dashboardDetails),
	ClientHelper.getLatestClient(dashboardDetails)];
	q.all(promisesArray).then(function() {
		console.log(dashboardDetails);
		res.json({returnCode : "SUCCESS", data : dashboardDetails, errorCode : null});
	}, function(err) {
		res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
	});
};
