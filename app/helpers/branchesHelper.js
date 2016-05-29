var q = require('q');

var db = require('../../db');

var moment = require('moment');

var utils = require('../utils');

exports.createBranch = function(request) {
	var createBranchDefer = q.defer();
	var insertBranch = "INSERT INTO branches (name, address, office_landline, created_at, modified_at) \
	VALUES (?,?,?,?,?)";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, insertBranch, [request.name, request.address, request.office_landline, 
			moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')]);
	}).then(function(results) {
		createBranchDefer.resolve();
	}).catch(function(err) {
		createBranchDefer.reject(err);
	});
	return createBranchDefer.promise;
}

exports.updateBranch = function(id, requestParams) {
	var updateBranchDefer = q.defer();
	requestParams.modified_at = moment().format('YYYY-MM-DD HH:mm:ss');
	var query = "UPDATE branches SET ?";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, query, requestParams);
	}).then(function(results) {
		updateBranchDefer.resolve(results);
	}).catch(function(err) {
		updateBranchDefer.reject(err);
	});
	return updateBranchDefer.promise;
}

exports.getBranches = function(params) {
	var getBranchesDefer = q.defer();
	if(params.get_deleted) {
		var query = "SELECT id, name, address, office_landline,mobile_number,deleted_at from branches;";
	} else {
		var query = "SELECT id, name, address, office_landline,mobile_number from branches where deleted_at is NULL";
	}
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, query);
	}).then(function(results) {
		getBranchesDefer.resolve(results);
	}).catch(function(err) {
		getBranchesDefer.reject(err);
	});
	return getBranchesDefer.promise;
}

exports.getBranch = function(id) {
	var getBranchDefer = q.defer();
	var getBranch = "SELECT id, name, address, office_landline,mobile_number from branches where id = ? and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, getbranch, [id]);
	}).then(function(results) {
		getBranchDefer.resolve(results);
	}).catch(function(err) {
		getBranchDefer.reject(err);
	});
	return getBranchDefer.promise;
}

exports.removeBranch = function(id) {
	var removeBranchDefer = q.defer();
	var removeBranch = "UPDATE branches SET deleted_at = ? where id = ? and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, removeBranch, [moment().format('YYYY-MM-DD HH:mm:ss'), id]);
	}).then(function(results) {
		removeBranchDefer.resolve(results);
	}).catch(function(err) {
		removeBranchDefer.reject(err);
	});
	return removeBranchDefer.promise;
}

exports.enableBranch = function(branchId) {
	var enableBranchDefer = q.defer();
	var enableBranch = "UPDATE branches SET deleted_at = ? where id = ?";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, enableBranch, [null, branchId]);
	}).then(function(results) {
		enableBranchDefer.resolve(results);
	}).catch(function(err) {
		enableBranchDefer.reject(err);
	});
	return enableBranchDefer.promise;
}