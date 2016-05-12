
var NotificationsHelper = require('../helpers/notificationsHelper.js');

exports.getNotifications = function(req, res) {
	NotificationsHelper.getNotifications(req.query, req.user).then(function(data) {
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

exports.getNotificationsCount = function(req, res) {
	NotificationsHelper.getNotificationsCount(req.user).then(function(data) {
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

exports.markAllNotificationsAsRead = function(req, res) {
	NotificationsHelper.markAllNotificationsAsRead(req.user).then(function(data) {
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

exports.markNotificationAsRead = function(req, res) {
	NotificationsHelper.markNotificationAsRead(req.params.notificationId, req.user).then(function(data) {
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