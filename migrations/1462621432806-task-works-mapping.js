'use strict'
var db = require('../db');
var utils = require('../app/utils.js');

exports.up = function(next) {
	var createTaskWorks = "CREATE TABLE task_works (id int NOT NULL AUTO_INCREMENT,\
		task_id int NOT NULL, work_id int NOT NULL, created_at DATETIME, deleted_at DATETIME, modified_at DATETIME, PRIMARY KEY (id), FOREIGN KEY (task_id)\
		REFERENCES tasks(id), FOREIGN KEY (work_id) REFERENCES master_tasks(id))";
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
	var dropQuery = "DROP TABLE task_works";
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
