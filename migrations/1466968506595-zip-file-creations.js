'use strict'
var db = require('../db');

exports.up = function(next) {
    var alterQuery = "ALTER TABLE clients ADD COLUMN num_of_zip_jobs int(11) DEFAULT 0";
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

exports.down = function(next) {
	var alterQuery = "ALTER TABLE clients DROP COLUMN num_of_zip_jobs";
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
