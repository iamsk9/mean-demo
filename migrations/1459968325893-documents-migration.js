'use strict'

var db = require('../db');

exports.up = function(next) {
	var alterQuery = "ALTER TABLE docs ADD COLUMN client_id int(11) NOT NULL";
	var foreignKeyQuery = "ALTER TABLE docs ADD FOREIGN KEY client_key(client_id) REFERENCES clients (id)"
	db.getConnection().then(function(connection){
		connection.query(alterQuery, function(err, results){
			if(err) {
				throw err;
			}
			console.log(alterQuery);
			console.log("SUCCESSFUL");
			connection.query(foreignKeyQuery, function(err, results) {
				if(err) {
					throw err;
				}
				console.log(foreignKeyQuery);
				console.log("SUCCESSFUL");
				next();
			})
		});
	}, function(err) {
		throw err;
	})
};

exports.down = function(next) {
	var alterQuery = "ALTER TABLE users DROP COLUMN client_id , \
	DROP FOREIGN KEY client_key";
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
