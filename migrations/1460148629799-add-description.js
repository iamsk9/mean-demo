'use strict'
var db = require('../db');

exports.up = function(next) {
	var alterQuery = "ALTER TABLE docs ADD COLUMN description varchar(255) NULL";
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
	var alterQuery = "ALTER TABLE docs DROP COLUMN description";
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
