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
		query = ["CREATE TABLE users (id int NOT NULL AUTO_INCREMENT, first_name varchar(255), last_name varchar(255), \
			email varchar(255) NOT NULL, password varchar(255) NULL, user_role varchar(255) NOT NULL,\
			 created_at DATETIME, deleted_at DATETIME,modified_at DATETIME, PRIMARY KEY(id));",
		"CREATE TABLE user_tokens (id int NOT NULL AUTO_INCREMENT, user_id int NOT NULL,\
		session_token varchar(255) NOT NULL, created_at DATETIME, deleted_at DATETIME, PRIMARY KEY (id),\
		FOREIGN KEY (user_id) REFERENCES users(id))",
		"CREATE TABLE clients (id int NOT NULL AUTO_INCREMENT, user_id int NOT NULL,\
		name varchar(255) NOT NULL, company_name varchar(255) NOT NULL, email varchar(50),\
		phone_number varchar(15), alt_phone_number varchar(15), company_pan_number varchar(50),\
		created_at DATETIME, deleted_at DATETIME, modified_at DATETIME, PRIMARY KEY (id),\
		FOREIGN KEY (user_id) REFERENCES users(id))",
		"CREATE TABLE docs (id int NOT NULL AUTO_INCREMENT, user_id int NOT NULL, url varchar(255) NOT NULL\
		, created_at DATETIME, deleted_at DATETIME, modified_at DATETIME, PRIMARY KEY (id), FOREIGN KEY (user_id) REFERENCES users(id))"];
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
		query = ["DROP TABLE user_tokens", "DROP TABLE clients","DROP TABLE docs","DROP TABLE users;"];
		for(var i in query) {
			executeQuery(connection, query, i);
		}
	});
};
