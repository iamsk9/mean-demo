'use strict'
var db = require('../db');
var utils = require('../app/utils.js');

exports.up = function(next) {
	var createBranches = "CREATE TABLE branches (id int NOT NULL AUTO_INCREMENT,\
		name varchar(255) NOT NULL, address varchar(255) NOT NULL, office_landline varchar(50),\
		created_at DATETIME, deleted_at DATETIME, modified_at DATETIME, PRIMARY KEY (id))";
	var connection;
	db.getConnection().then(function(conn){
		connection = conn;
		return utils.runQuery(connection, createBranches).then(function(results) {
			console.log(createBranches);
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
	var dropQuery = "DROP TABLE branches";
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
