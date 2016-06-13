'use strict'
var db = require('../db');
var utils = require('../app/utils.js');

exports.up = function(next) {
	var createDepartments = "CREATE TABLE departments (id int NOT NULL AUTO_INCREMENT,\
		name varchar(255) NOT NULL, head varchar(255) NOT NULL, task varchar(225) NOT NULL, email varchar(225) NOT NULL,\
		created_at DATETIME, deleted_at DATETIME, modified_at DATETIME, PRIMARY KEY (id))";
	var connection;
	db.getConnection().then(function(conn){
		connection = conn;
		return utils.runQuery(connection, createDepartments).then(function(results) {
			console.log(createDepartments);
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
	var dropQuery = "DROP TABLE departments";
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
