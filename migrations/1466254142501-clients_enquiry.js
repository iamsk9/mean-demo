'use strict'
var db = require('../db');
var utils = require('../app/utils.js');

exports.up = function(next) {
	var createEnquiry = "CREATE TABLE clients_enquiry (id int NOT NULL AUTO_INCREMENT, name varchar(50),\
	 company varchar(50) NOT NULL, email varchar(50) NOT NULL, task int NOT NULL, mobile int NOT NULL,\
	 subject varchar(255) NULL, comment varchar(255) NOT NULL, created_at DATETIME, deleted_at DATETIME, modified_at DATETIME, PRIMARY KEY(id))";
	var connection;
	db.getConnection().then(function(conn){
		connection = conn;
		return utils.runQuery(connection, createEnquiry).then(function(results) {
			console.log(createEnquiry);
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
	var dropQuery = "DROP TABLE clients_enquiry";
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

