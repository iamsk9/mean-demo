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

function insertIntoDepartmentTasks(connection, work_id, dept_id) {
	var deptQuery = "INSERT INTO departments_tasks (task_id, dept_id, created_at, modified_at) VALUES (?,?,?,?)";
	return utils.runQuery(connection, deptQuery, [work_id, dept_id, 
	moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')]);
}

exports.addDepartmentWorks = function(request){
	var addDepartmentWorksDefer = q.defer();
	var insertQuery = "INSERT INTO master_tasks (task_name, created_at, modified_at) VALUES (?,?,?)";
	var connetion;
	db.getConnection().then(function(conn) {
		connection = conn;
		return utils.runQuery(connection, insertQuery, [request.work_name, 
			moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')], true);
	}).then(function(results) {	
		if(request.dept_id) {
			return insertIntoDepartmentTasks(connection, results.insertId, request.dept_id)
		} else {
			addDepartmentWorksDefer.resolve();
		}
	}).then(function() {
		addDepartmentWorksDefer.resolve();
	}).catch(function(err) {
		addDepartmentWorksDefer.reject(err);
	});
	return addDepartmentWorksDefer.promise;
}

exports.createDepartment = function(request) {
	var createDepartmentDefer = q.defer();
	var created_at = moment().format('YYYY-MM-DD HH:mm:ss');
	var modified_at = moment().format('YYYY-MM-DD HH:mm:ss');
	//var tasks = request.task;
	var insertDepartment = "INSERT INTO departments (name, email, created_at, modified_at) \
	VALUES (?,?,?,?)";
	db.getConnection().then(function(connection) {
		  return utils.runQuery(connection, insertDepartment, [request.name, request.email, created_at, modified_at]);	  
	// }).then(function(result){
 //       var department_id = result.insertId;
 //       for(id in tasks){
	//          insertTask(department_id,tasks[id].id, created_at, modified_at);
	//    }		
    }).then(function(results) {	
		createDepartmentDefer.resolve(results);
	}).catch(function(err) {
		createDepartmentDefer.reject(err);
	});
	return createDepartmentDefer.promise;
}

exports.updateDepartmentWorks = function(id, requestParams) {
	var updateDepartmentWorksDefer = q.defer();
	var updateWorkQuery = "UPDATE master_tasks SET task_name = ? where id = ?";;
	var updateDepartmentQuery = "UPDATE departments_tasks set dept_id = ? where task_id = ?";
	var getDepartmentQuery = "SELECT count(*) as count from departments_tasks where task_id = ?";
	var connection;
	db.getConnection().then(function(conn) {
		connection = conn;
		if(requestParams.work_name) {
			return utils.runQuery(connection, updateWorkQuery, [requestParams.work_name, id], true);
		}
	}).then(function(results) {
		if(requestParams.dept_id) {
			return utils.runQuery(connection, getDepartmentQuery, [id], true);
		}
	}).then(function(results) {
		console.log(results);
		if(results) {
			if(results[0].count >= 1) {
				return utils.runQuery(connection, updateDepartmentQuery, [requestParams.dept_id, id], true);	
			} else {
				return insertIntoDepartmentTasks(connection, id, requestParams.dept_id);
			}
		}
	}).then(function() {
		updateDepartmentWorksDefer.resolve();
	}).catch(function(err) {
		updateDepartmentWorksDefer.reject(err);
	});
	return updateDepartmentWorksDefer.promise;
}

exports.updateDepartment = function(id, requestParams) {
	var updateDepartmentDefer = q.defer();
	//var created_at = moment().format('YYYY-MM-DD HH:mm:ss');
	var modified_at = moment().format('YYYY-MM-DD HH:mm:ss');
	requestParams.modified_at = modified_at;
	var query = "UPDATE departments SET ? where id = ?";
	db.getConnection().then(function(connection) {
		utils.runQuery(connection, query, [requestParams, id]);
	// }).then(function(){
	// 		for(index in requestParams.added_tasks){
	// 	         insertTask(id, requestParams.added_tasks[index].id, created_at, modified_at);
	//            } 
	// 		for(index in requestParams.removed_tasks){
	// 		          updateTask(requestParams.removed_tasks[index].id, modified_at);
	// 		    }  
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

exports.getWorks = function() {
	var getWorksDefer = q.defer();
	var query = "SELECT mt.id as work_id, mt.task_name as work_name, d.id as dept_id, d.name as dept_name from master_tasks mt \
	LEFT JOIN departments_tasks dt on dt.task_id = mt.id \
	LEFT JOIN departments d on dt.dept_id = d.id \
	where mt.deleted_at is NULL and dt.deleted_at is NULL and d.deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, query);
	}).then(function(results) {
		getWorksDefer.resolve(results);
	}).catch(function(err) {
		getWorksDefer.reject(err);
	});
	return getWorksDefer.promise;
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
	  and departments_tasks.deleted_at is NULL and master_tasks.deleted_at is NULL";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, getDepartmentTasks,[id]);
	}).then(function(results) {
		getDepartmentTasksDefer.resolve(results);
	}).catch(function(err) {
		getDepartmentTasksDefer.reject(err);
	});
	return getDepartmentTasksDefer.promise;
}

exports.removeDepartment = function(id, remove) {
	var removeDepartmentDefer = q.defer();
	var removeDepartment = "UPDATE departments SET deleted_at = ? where id = ? and deleted_at is NULL";
	deleted_at = moment().format('YYYY-MM-DD HH:mm:ss');
	db.getConnection().then(function(connection) {
	  if(remove != 'yes')
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

exports.removeWork = function(id) {
	var removeWorkDefer = q.defer();
	var removeWork = "UPDATE master_tasks SET deleted_at = ? where id = ? and deleted_at is NULL";
	deleted_at = moment().format('YYYY-MM-DD HH:mm:ss');
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, removeWork, [deleted_at, id]);
	}).then(function(results) {
		removeWorkDefer.resolve(results);
	}).catch(function(err) {
		removeWorkDefer.reject(err);
	});
	return removeWorkDefer.promise;
}

