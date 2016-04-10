'use strict'
var db = require('../db');

exports.up = function(next) {
	var alterQuery = "CREATE TABLE client_downloads (id int NOT NULL AUTO_INCREMENT, doc_id int NOT NULL, \
		downloaded_at DATETIME, PRIMARY KEY (id), FOREIGN KEY (doc_id) REFERENCES docs(id))";
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
	var alterQuery = "DROP TABLE client_downloads";
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
