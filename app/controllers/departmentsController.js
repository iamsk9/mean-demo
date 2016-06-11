
var DepartmentsHelper = require('../helpers/departmentsHelper.js');

exports.getDepartments = function(req,res){
	DepartmentsHelper.getDepartments().then(function(result){
		res.json({returnCode : "SUCCESS", data : result, errorCode : null});
	}, function(err){
		console.log(err);
		if(err.errorCode) {
			res.json({returnCode : "FAILURE", data : null, errorCode : err.errorCode})
		} else {
			console.log(err);
			res.json({returnCode : "FAILURE", data : null, errorCode : 1014})

		}
	});
};

exports.getDepartment = function(req,res){
	DepartmentsHelper.getDepartment(req.params.departmentId).then(function(result){
		res.json({returnCode : "SUCCESS", data : result, errorCode : null});
	}, function(err){
		console.log(err);
		if(err.errorCode) {
			res.json({returnCode : "FAILURE", data : null, errorCode : err.errorCode})
		} else {
			console.log(err);
			res.json({returnCode : "FAILURE", data : null, errorCode : 1014})

		}
	});
};

exports.createDepartment = function(req, res) {
	DepartmentsHelper.createDepartment(req.body).then(function(data) {
		res.json({returnCode : "SUCCESS", data : data, errorCode : null});
	}, function(err) {
		console.log(err);
		if(err.errorCode) {
			res.json({returnCode : "FAILURE", data : null, errorCode : err.errorCode});
		} else {
			res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
		}
	});
}

exports.removeDepartment = function(req, res) {
	DepartmentsHelper.removeDepartment(req.params.departmentId).then(function(data) {
		res.json({returnCode : "SUCCESS", data : data, errorCode : null});
	}, function(err) {
		console.log(err);
		if(err.errorCode) {
			res.json({returnCode : "FAILURE", data : null, errorCode : err.errorCode});
		} else {
			res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
		}
	});
}

exports.updateDepartment = function(req, res) {
	DepartmentsHelper.updateDepartment(req.params.departmentId, req.body).then(function(data){
		res.json({returnCode: "SUCCESS", data: data, errorCode : null});
	}, function(err) {
		if(err.errorCode) {
			res.json({returnCode : "FAILURE", data : null, errorCode : err.errorCode});
		} else {
			res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
		}
	});
}
