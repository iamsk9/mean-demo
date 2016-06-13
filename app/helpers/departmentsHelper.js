var q = require('q');

var db = require('../../db');

var moment = require('moment');

var utils = require('../utils');

exports.createDepartment = function(request) {
	var createDepartmentDefer = q.defer();
	var insertDepartment = "INSERT INTO departments (name, head, task, email, created_at, modified_at) \
	VALUES (?,?,?,?,?,?)";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, insertDepartment, [request.name, request.head, request.task, request.email,
			moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')]);
	}).then(function(results) {
		createDepartmentDefer.resolve();
	}).catch(function(err) {
		createDepartmentDefer.reject(err);
	});
	return createDepartmentDefer.promise;
}

exports.updateDepartment = function(id, requestParams) {
	var updateDepartmentDefer = q.defer();
	requestParams.modified_at = moment().format('YYYY-MM-DD HH:mm:ss');
	var query = "UPDATE departments SET ? where id = ?";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, query, [requestParams,id]);
	}).then(function(results) {
		updateDepartmentDefer.resolve(results);
	}).catch(function(err) {
		updateDepartmentDefer.reject(err);
	});
	return updateDepartmentDefer.promise;
}

exports.getDepartments = function() {
	var getDepartmentsDefer = q.defer();
	var query = "SELECT id, name, head, task,email from departments where deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, query);
	}).then(function(results) {
		getDepartmentsDefer.resolve(results);
	}).catch(function(err) {
		getDepartmentsDefer.reject(err);
	});
	return getDepartmentsDefer.promise;
}

exports.getDepartment = function(id) {
	var getDepartmentDefer = q.defer();
	var getDepartment = "SELECT id, name, head, task, email from departments where id = ? and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, getdepartment, [id]);
	}).then(function(results) {
		getDepartmentDefer.resolve(results);
	}).catch(function(err) {
		getDepartmentDefer.reject(err);
	});
	return getDepartmentDefer.promise;
}

exports.removeDepartment = function(id) {
	var removeDepartmentDefer = q.defer();
	var removeDepartment = "UPDATE departments SET deleted_at = ? where id = ? and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, removeDepartment, [moment().format('YYYY-MM-DD HH:mm:ss'), id]);
	}).then(function(results) {
		removeDepartmentDefer.resolve(results);
	}).catch(function(err) {
		removeDepartmentDefer.reject(err);
	});
	return removeDepartmentDefer.promise;
}
