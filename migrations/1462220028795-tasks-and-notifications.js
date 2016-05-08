'use strict'
var db = require('../db');

exports.up = function(next) {
	function executeQuery(connection, query, index) {
		connection.query(query[index], function(err, result) {
			if(err) {
				throw err;
			}
			console.log(query[index]);
			console.log("Successful");
			if(index == (query.length - 1)) {
  				next();
  			}
		});
	}
	db.getConnection().then(function(connection) {
		var query = [];
		query = ["CREATE TABLE tasks (id int NOT NULL AUTO_INCREMENT, client_id int NULL, client_name varchar(255), \
			contact_number varchar(255) NULL, pan_card varchar(255) NULL, user_id int NOT NULL, task_description varchar(255) NOT NULL,\
			 date_of_appointment DATE, time_of_appointment TIME, type_of_appointment varchar(255) NULL, task_status varchar(255), assigned_by varchar(255) NOT NULL,\
			 created_at DATETIME, deleted_at DATETIME, modified_at DATETIME, PRIMARY KEY(id), \
			 FOREIGN KEY (client_id) REFERENCES clients(id), FOREIGN KEY (user_id) REFERENCES users(id));",
		"CREATE TABLE notifications (id int NOT NULL AUTO_INCREMENT, user_id int NOT NULL,\
		description varchar(255) NOT NULL, is_read tinyint(1) NOT NULL DEFAULT 0, task_id int NULL, \
		created_at DATETIME, deleted_at DATETIME, PRIMARY KEY (id),\
		FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (task_id) REFERENCES tasks(id))",
		"CREATE TABLE master_tasks (id int NOT NULL AUTO_INCREMENT, task_name varchar(255) NOT NULL,\
		created_at DATETIME, deleted_at DATETIME, modified_at DATETIME, PRIMARY KEY (id))",
		"CREATE TABLE master_documents (id int NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL\
		, created_at DATETIME, deleted_at DATETIME, modified_at DATETIME, PRIMARY KEY (id))",
		"CREATE TABLE master_task_document_mapping (id int not NULL AUTO_INCREMENT, task_id int NOT NULL, \
		req_doc_id int NOT NULL, custom_label varchar(255), created_at DATETIME, deleted_at DATETIME,\
		modified_at DATETIME, PRIMARY KEY (id), FOREIGN KEY (task_id) REFERENCES master_tasks(id), \
		FOREIGN KEY (req_doc_id) REFERENCES master_documents(id))"];
		for(var i in query) {
			executeQuery(connection, query, i);
		}
	});
};

exports.down = function(next) {
	function executeQuery(connection, query, index) {
		connection.query(query[index], function(err, result) {
			if(err) {
				throw err;
			}
			if(index == (query.length - 1)) {
  				next();
  			}
		});
	}
	db.getConnection().then(function(connection) {
		var query = [];
		query = ["DROP TABLE notifications", "DROP TABLE tasks","DROP TABLE master_task_document_mapping","DROP TABLE master_tasks","DROP TABLE master_documents",];
		for(var i in query) {
			executeQuery(connection, query, i);
		}
	});
};
