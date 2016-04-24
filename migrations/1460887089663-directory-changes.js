'use strict'
var db = require('../db');

exports.up = function(next) {
	var alterQuery = "ALTER TABLE docs ADD COLUMN is_directory tinyint(1) NULL, \
	ADD COLUMN parent int(11) NULL, ADD FOREIGN KEY parent(parent) references docs(id)";
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
	var alterQuery = "ALTER TABLE docs DROP COLUMN is_directory, DROP COLUMN parent, DROP FOREIGN KEY parent";
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
