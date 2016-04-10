
var db = require('../../db');

var q = require('q');

var DocsHelper = require('../helpers/docsHelper');

var ClientHelper = require('../helpers/clientHelper');

exports.getDashboardData = function(req,res){
	var dashboardDetails = {todaysMetrics : {}, totalMetrics : {}};
	var promisesArray = [ClientHelper.getTodaysClientsCount(dashboardDetails), ClientHelper.getTotalClientsCount(dashboardDetails),
	DocsHelper.getTodaysDocs(dashboardDetails), DocsHelper.getTotalDocs(dashboardDetails),
	DocsHelper.getTodaysDownloads(dashboardDetails), DocsHelper.getTotalDownloads(dashboardDetails),
	ClientHelper.getLatestClient(dashboardDetails)];
	q.all(promisesArray).then(function() {
		console.log(dashboardDetails);
		res.json({returnCode : "SUCCESS", data : dashboardDetails, errorCode : null});
	}, function(err) {
		res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
	});
};