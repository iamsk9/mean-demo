'use strict'
var db = require('../db');

exports.up = function(next) {
	var alterQuery = "ALTER TABLE clients ADD COLUMN status varchar(255) NULL";
	var updateClients = "UPDATE clients SET status = 'ACTIVE'";
	db.getConnection().then(function(connection){
		connection.query(alterQuery, function(err, results){
			if(err) {
				throw err;
			}
			console.log(alterQuery);
			console.log("SUCCESSFUL");
			connection.query(updateClients, function(err, results) {
				if(err) {
					throw err;
				}
				console.log(updateClients);
				console.log("SUCCESSFUL");
				next();
			});
		});
	}, function(err) {
		throw err;
	})
};

exports.down = function(next) {
	var alterQuery = "ALTER TABLE clients DROP COLUMN status";
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
