'use strict'
var db = require('../db');

exports.up = function(next) {
	var alterQuery = "ALTER TABLE users ADD COLUMN reset_password_hash varchar(255) NULL, \
	ADD COLUMN request_password_hash_active tinyint(1) NULL";
	db.getConnection().then(function(connection){
		connection.query(alterQuery, function(err, results){
			if(err) {
				throw err;
			}
			console.log(alterQuery);
			console.log("SUCCESSFUL");
			next();
		});
	}, function(err) {
		throw err;
	})
};

exports.down = function(next) {
	var alterQuery = "ALTER TABLE users DROP COLUMN reset_password_hash, DROP COLUMN request_password_hash_active";
	db.getConnection().then(function(connection){
		connection.query(alterQuery, function(err, results){
			if(err) {
				throw err;
			}
			console.log(alterQuery);
			console.log("SUCCESSFUL");
			next();
		});
	}, function(err) {
		throw err;
	});
};
