
var TaskHelper = require('../helpers/taskHelper.js');

exports.getTasks = function(req,res){
	TaskHelper.getTasks(req.user).then(function(result){
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

exports.getTask = function(req,res){
	TaskHelper.getTask(req.params.taskId, req.user).then(function(result){
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

exports.getReqDocs = function(req, res) {
	TaskHelper.getReqDocs(req.params.taskId).then(function(result){
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
}

exports.getTaskDocs = function(req, res) {
	TaskHelper.getTaskDocs(req.params.Id).then(function(result){
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
}

exports.assignTask = function(req, res) {
	TaskHelper.assignTask(req.body, req.user).then(function(data) {
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

exports.getMasterTasks = function(req, res) {
	TaskHelper.getMasterTasks().then(function(data) {
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

exports.removeTask = function(req, res) {
	TaskHelper.removeTask(req.params.taskId).then(function(data) {
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

exports.updateTask = function(req, res) {
	TaskHelper.updateTask(req.params.taskId, req.body, req.user).then(function(data){
		res.json({returnCode: "SUCCESS", data: data, errorCode : null});
	}, function(err) {
		console.log(err);
		if(err.errorCode) {
			res.json({returnCode : "FAILURE", data : null, errorCode : err.errorCode});
		} else {
			res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
		}
	});
}

exports.updateTaskStatus = function(req, res) {
	TaskHelper.updateTaskStatus(req.body).then(function(data){
		res.json({returnCode: "SUCCESS", data: data, errorCode : null});
	}, function(err) {
		console.log(err);
		if(err.errorCode) {
			res.json({returnCode : "FAILURE", data : null, errorCode : err.errorCode});
		} else {
			res.json({returnCode : "FAILURE", data : null, errorCode : 1014});
		}
	});
}