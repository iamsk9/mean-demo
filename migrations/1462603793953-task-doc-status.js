'use strict'
var db = require('../db');
var utils = require('../app/utils.js');

exports.up = function(next) {
	var createTaskDocumentStatus = "CREATE TABLE task_document_status (id int NOT NULL AUTO_INCREMENT,\
		task_id int NOT NULL, doc_id int NOT NULL, status tinyint(1),\
		created_at DATETIME, deleted_at DATETIME, modified_at DATETIME, PRIMARY KEY (id), FOREIGN KEY (task_id)\
		REFERENCES tasks(id), FOREIGN KEY (doc_id) REFERENCES master_task_document_mapping(id))";
	var connection;
	db.getConnection().then(function(conn){
		connection = conn;
		return utils.runQuery(connection, createTaskDocumentStatus).then(function(results) {
			console.log(createTaskDocumentStatus);
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
	var dropQuery = "DROP TABLE task_document_status";
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
