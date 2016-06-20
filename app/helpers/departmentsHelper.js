var q = require('q');

var db = require('../../db');

var moment = require('moment');

var utils = require('../utils');

// exports.createDepartment = function(request) {
// 	var createDepartmentDefer = q.defer();
// 	var insertDepartment = "INSERT INTO departments (name, task, email, created_at, modified_at) \
// 	VALUES (?,?,?,?,?)";
// 	db.getConnection().then(function(connection) {
// 		return utils.runQuery(connection, insertDepartment, [request.name, request.task, request.email,
// 			moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')]);
// 	}).then(function(results) {
// 		createDepartmentDefer.resolve();
// 	}).catch(function(err) {
// 		createDepartmentDefer.reject(err);
// 	});
// 	return createDepartmentDefer.promise;
// }

function insertTask(dept_id,task_id, created_at, modified_at){
	var insertDeptTasks = "INSERT INTO departments_tasks (dept_id,task_id, created_at, modified_at) VALUES(?,?,?,?)";
	db.getConnection().then(function(connection) {
			     return utils.runQuery(connection, insertDeptTasks, [dept_id,task_id,created_at, modified_at]);
			 });
}

exports.createDepartment = function(request) {
	var createDepartmentDefer = q.defer();
	var created_at = moment().format('YYYY-MM-DD HH:mm:ss');
	var modified_at = moment().format('YYYY-MM-DD HH:mm:ss');
	var tasks = request.task;
	var insertDepartment = "INSERT INTO departments (name, email, created_at, modified_at) \
	VALUES (?,?,?,?)";
	db.getConnection().then(function(connection) {
		  return utils.runQuery(connection, insertDepartment, [request.name, request.email, created_at, modified_at]);	  
	}).then(function(result){
       var department_id = result.insertId;
       for(id in tasks){
	         insertTask(department_id,tasks[id].id, created_at, modified_at);
	   }		
    }).then(function() {	
		createDepartmentDefer.resolve();
	}).catch(function(err) {
		createDepartmentDefer.reject(err);
	});
	return createDepartmentDefer.promise;
}

// exports.updateDepartment = function(id, requestParams) {
// 	var updateDepartmentDefer = q.defer();
// 	requestParams.modified_at = moment().format('YYYY-MM-DD HH:mm:ss');
// 	var query = "UPDATE departments SET ? where id = ?";
// 	db.getConnection().then(function(connection) {
// 		return utils.runQuery(connection, query, [requestParams,id]);
// 	}).then(function(results) {
// 		updateDepartmentDefer.resolve(results);
// 	}).catch(function(err) {
// 		updateDepartmentDefer.reject(err);
// 	});
// 	return updateDepartmentDefer.promise;
// }

function updateTask(taskId, modified_at){
 	var updateTask = "UPDATE departments_tasks SET deleted_at = ? where task_id = ?";
    db.getConnection().then(function(connection) {
			   return utils.runQuery(connection, updateTask, [modified_at, taskId]);
    });	
 }

exports.updateDepartment = function(id, requestParams) {
	var updateDepartmentDefer = q.defer();
	var created_at = moment().format('YYYY-MM-DD HH:mm:ss');
	var modified_at = moment().format('YYYY-MM-DD HH:mm:ss');
	requestParams.details.modified_at = modified_at;
	var query = "UPDATE departments SET ? where id = ?";
	db.getConnection().then(function(connection) {
		utils.runQuery(connection, query, [requestParams.details, id]);
	}).then(function(){
			for(index in requestParams.added_tasks){
		         insertTask(id, requestParams.added_tasks[index].id, created_at, modified_at);
	           } 
			for(index in requestParams.removed_tasks){
			          updateTask(requestParams.removed_tasks[index].id, modified_at);
			    }  
    }).then(function() {
		updateDepartmentDefer.resolve();
	}).catch(function(err) {
		updateDepartmentDefer.reject(err);
	});
	return updateDepartmentDefer.promise;
}

exports.getDepartments = function() {
	var getDepartmentsDefer = q.defer();
	var query = "SELECT id, name, email from departments where deleted_at is NULL";
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
	var getDepartment = "SELECT id, name, email from departments where id = ? and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, getdepartment, [id]);
	}).then(function(results) {
		getDepartmentDefer.resolve(results);
	}).catch(function(err) {
		getDepartmentDefer.reject(err);
	});
	return getDepartmentDefer.promise;
}

function removeDepartmentTasks(id,deleted_at){
       var updateTasks = "UPDATE departments_tasks SET deleted_at = ? where dept_id = ?"
       db.getConnection().then(function(connection) {
		return utils.runQuery(connection, updateTasks, [deleted_at, id]);
	   });
}

exports.getDepartmentTasks = function(id) {
	var getDepartmentTasksDefer = q.defer();
	var getDepartmentTasks = "SELECT master_tasks.id, master_tasks.task_name as name FROM master_tasks LEFT JOIN\
	 departments_tasks ON master_tasks.id = departments_tasks.task_id where departments_tasks.dept_id = ?\
	  and departments_tasks.deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, getDepartmentTasks,[id]);
	}).then(function(results) {
		getDepartmentTasksDefer.resolve(results);
	}).catch(function(err) {
		getDepartmentTasksDefer.reject(err);
	});
	return getDepartmentTasksDefer.promise;
}

exports.removeDepartment = function(id) {
	var removeDepartmentDefer = q.defer();
	var removeDepartment = "UPDATE departments SET deleted_at = ? where id = ? and deleted_at is NULL";
	deleted_at = moment().format('YYYY-MM-DD HH:mm:ss');
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, removeDepartment, [deleted_at, id]);
	}).then(function(results) {
		removeDepartmentTasks(id,deleted_at);
	}).then(function(results) {
		removeDepartmentDefer.resolve(results);
	}).catch(function(err) {
		removeDepartmentDefer.reject(err);
	});
	return removeDepartmentDefer.promise;
}

