
var moment = require('moment');

var q = require('q');

var ClientHelper = require('../helpers/clientHelper');

function handleError(err) {
	console.log(err);
	if(typeof(err.errorCode) != "undefined") {
		this.res.json({returnCode : "FAILURE", data : null, errorCode : err.errorCode});
	} else {
		this.res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
	}
} 
exports.addClient = function(req, res) {
	this.res = res;
	this.req = req;
	ClientHelper.addClient(req.body).then(function(data) {
		res.json({returnCode : "SUCCESS", data : data, errorCode : null});
	}, handleError.bind(this));
}

exports.getClientDetails = function(req, res) {
	this.res = res;
	this.req = req;

	ClientHelper.getClientDetails(req.params.id).then(function(data) {
		res.json({returnCode : "SUCCESS", data : data, errorCode : null});
	}, handleError.bind(this))
}

exports.getClients = function(req, res) {
	this.res = res;
	this.req = req;
	if(typeof req.query.user_id != "undefined"){
		ClientHelper.getClientByUserId(req.query.user_id).then(function(data) {
			res.json({returnCode : "SUCCESS", data : data, errorCode : null});
		}, handleError.bind(this));
	} else {
		ClientHelper.getClients(req.query).then(function(data) {
			res.json({returnCode : "SUCCESS", data : data, errorCode : null});
		}, handleError.bind(this))	
	}
}

exports.updateClient = function(req, res) {
	this.res = res;
	this.req = req;
	ClientHelper.updateClient(req.params.id, req.body).then(function(data) {
		res.json({returnCode : "SUCCESS", data : data, errorCode : null});
	}, handleError.bind(this));
}