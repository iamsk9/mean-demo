
var UserHelper = require('../helpers/userHelper.js');

var template = require('swig');

var jwt = require('jsonwebtoken');

exports.authenticate = function(req,res){
	UserHelper.authenticateUser(req).then(function(result){
		console.log(result.data.tid);
		res.cookie('x-ca-api-token', result.data.tid);
		res.json({returnCode : "SUCCESS", data : result, errorCode : null});
	}, function(err){
		console.log(err);
		if(typeof(err.errorCode) != "undefined") {
			res.json({returnCode : "FAILURE", data : null, errorCode : err.errorCode})
		} else {
			console.log(err);
			res.json({returnCode : "FAILURE", data : null, errorCode : 1014})

		}
	});
};

exports.logout = function(req, res) {
	console.log("Entered Log out ");
	UserHelper.logoutUser(req).then(function() {
		console.log("User Logged out");
		res.clearCookie('x-ca-api-token');
		res.json({returnCode : "SUCCESS", data : null, errorCode : null});
	}, function(err) {
		console.log(err);
		res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
	});
}

exports.register = function(req,res){
	var result;
	req.body.is_verified = 1;
	UserHelper.addUser(req.body).then(function(){
		console.log("User registered successfully - " + req.body.email);
		res.json({returnCode : "SUCCESS", data : null, errorCode : null});
	}, function(err) {
		console.log("Error while registering user - " + req.body.userName + " " + err);
		if(err.errorCode == 1015) {
			res.json({returnCode : "FAILURE", data : null, errorCode : 1015});
		} else {
			res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
		}
	});
};

exports.sendResetPassword = function(req, res) {
	UserHelper.sendResetPassword(req).then(function(data) {
		console.log(data);
		var tmpl = template.renderFile('public/resetPassword.html', {
			user : data,
		});
		res.send(tmpl);
	}, function(err) {
		console.log(err);
		res.status(403);
		res.send("Invalid Hash");
	});
}

exports.resetPassword = function(req, res) {
	UserHelper.resetPassword(req).then(function(data) {
		res.clearCookie('x-ca-api-token');
		res.json({returnCode : "SUCCESS", data : null, errorCode : null});
	}, function(err) {
		console.log(err);
		res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
	});
}