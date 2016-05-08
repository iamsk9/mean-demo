
var BranchesHelper = require('../helpers/branchesHelper.js');

exports.getBranches = function(req,res){
	BranchesHelper.getBranches().then(function(result){
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

exports.getBranch = function(req,res){
	BranchesHelper.getBranch(req.params.branchId).then(function(result){
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

exports.createBranch = function(req, res) {
	BranchesHelper.createBranch(req.body).then(function(data) {
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

exports.removeBranch = function(req, res) {
	BranchesHelper.removeBranch(req.params.branchId).then(function(data) {
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

exports.updateBranch = function(req, res) {
	BranchesHelper.updateBranch(req.params.branchId, req.body).then(function(data){
		res.json({returnCode: "SUCCESS", data: data, errorCode : null});
	}, function(err) {
		if(err.errorCode) {
			res.json({returnCode : "FAILURE", data : null, errorCode : err.errorCode});
		} else {
			res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
		}
	});
}