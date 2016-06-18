'use strict'
var db = require('../db');
var utils = require('../app/utils.js');
exports.up = function(next) {
  var createTaskWorks = "CREATE TABLE departments_tasks (id int NOT NULL AUTO_INCREMENT,\
		dept_id int NOT NULL, task_id int NOT NULL, created_at DATETIME, deleted_at DATETIME, modified_at DATETIME, PRIMARY KEY (id), FOREIGN KEY (dept_id)\
		REFERENCES departments(id),FOREIGN KEY (task_id) REFERENCES master_tasks(id))";
	var connection;
	db.getConnection().then(function(conn){
		connection = conn;
		return utils.runQuery(connection, createTaskWorks).then(function(results) {
			console.log(createTaskWorks);
			console.log("SUCCESSFUL");
			next();
		}, function(err) {
			console.log(err);
			console.log("FAILURE");
		});
	}, function(err) {
		throw err;
	})
};

exports.down = function(next) {
  var dropQuery = "DROP TABLE departments_tasks";
	db.getConnection().then(function(connection){
		connection.query(dropQuery, function(err, results){
			if(err) {
				throw err;
			}
			console.log("SUCCESSFUL");
			next();
		});
	}, function(err) {
		throw err;
	});
};
