'use strict'
var db = require('../db');

exports.up = function(next) {
	var alterQuery = "ALTER TABLE users ADD COLUMN branch int(11) NULL, \
	ADD FOREIGN KEY branch(branch) references branches(id)";
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
	var alterQuery = "ALTER TABLE docs DROP COLUMN branch, DROP FOREIGN KEY branch";
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
