var q = require('q');

var db = require('../../db');

var moment = require('moment');

var utils = require('../utils');

exports.getNotifications = function(params, user) {
	var getNotificationsDefer = q.defer();
	var notificationsQuery = "SELECT n.id, task_id, is_read, description,client_enquiry_id,ce.name,ce.mobile,ce.subject from notifications n INNER JOIN \
	clients_enquiry ce on n.client_enquiry_id = ce.id where user_id = ? and n.deleted_at is NULL and is_read = ? LIMIT 10 OFFSET ?";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, notificationsQuery, [user.id, 0, 10 * (params.page - 1)], true);
	}).then(function(results) {
		getNotificationsDefer.resolve(results);
	}).catch(function(err) {
		getNotificationsDefer.reject(err);
	});
	return getNotificationsDefer.promise;
}

exports.getNotificationsCount = function(user) {
	var getNotificationsCountDefer = q.defer();
	var countQuery = "SELECT count(*) as totalCount, SUM(if(is_read = 0,1,0)) as unreadCount from notifications where user_id = ? and deleted_at is null";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, countQuery, [user.id]);
	}).then(function(results) {
		getNotificationsCountDefer.resolve(results);
	}).catch(function(err) {
		getNotificationsCountDefer.reject(err);
	});
	return getNotificationsCountDefer.promise;
}

exports.markAllNotificationsAsRead = function(user) {
	var markAllNotificationsAsReadDefer = q.defer();
	var query = "UPDATE notifications set is_read = 1 where user_id = ? and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, query, [user.id]);
	}).then(function() {
		markAllNotificationsAsReadDefer.resolve();
	}).catch(function(err) {
		markAllNotificationsAsReadDefer.reject(err);
	});
	return markAllNotificationsAsReadDefer.promise;
}

exports.markNotificationAsRead = function(id, user) {
	var markNotificationAsReadDefer = q.defer();
	var query = "UPDATE notifications set is_read = 1 where id = ? and user_id = ? and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, query, [id, user.id]);
	}).then(function() {
		markNotificationAsReadDefer.resolve();
	}).catch(function(err) {
		markNotificationAsReadDefer.reject(err);
	});
	return markNotificationAsReadDefer.promise;
}