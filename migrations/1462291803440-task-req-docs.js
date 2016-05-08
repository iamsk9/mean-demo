'use strict'
var db = require('../db');

exports.up = function(next) {
	function executeQuery(connection, query, index) {
		connection.query(query[index], function(err, result) {
			if(err) {
				throw err;
			}
			console.log(query[index]);
			console.log("Successful");
			if(index == (query.length - 1)) {
  				next();
  			}
		});
	}
	db.getConnection().then(function(connection) {
		var query = [];
		query = ["INSERT INTO master_documents (name, created_at, modified_at) VALUES ('\
			Digital Photograph (3 x 3cms)', now(), now()), ('Copy of Passport (first & last page)/Voter’s I-Card/ Driving Licence/UID(Aadhar card)',\
			 now(), now()), ('Sale deed in case business premise is self-owned; or Rental/Lease Agreement, in case office is rented/ leased; or latest electricity/telephone bill', \
			 now(), now()), ('Bank Certificate as per ANF 2A(I)/Cancelled Cheque bearing pre-printed name',\
			 now(), now()), ('Copy of Partnership Deed', now(),\
			now()), ('Registration Certificate of the Society / Copy of the Trust Deed', now(), now()), \
			('Copy of PAN Card', now(), now()), ('Copy of Aadhar Card', now(), now()), ('Copy of Bank Statement', now(), now()),\
			('COMPETENT PERSONS QUALIFICATION CERTIFICATES', now(), now()), ('Building Plan Blue Print', \
			now(), now()), ('Copy of VAT/CST Certificate', now(), now()), ('Email Id', now(), now()), \
			('Phone Number', now(), now()), ('AOA/MOA', now(), now()), ('Certificate of incorporation as issued by the RoC',now(), now()),\
			('RENTAL DEED / LEASE DEED / HOUSE TAX RECEIPT IF OWNED HOUSE', now(), now())",
			"INSERT INTO master_tasks (task_name, created_at, modified_at) VALUES (\
			'Registration of Proprietership Firm', now(), now()), ('Registration of Partnership Firm', \
			now(), now()), ('Registration of LLP Firm', now(), now()), ('Government Undertaking', now(), now())\
			, ('Registration of a Public Limited Company', now(), now()), (\
			'Registration of a Private Limited Company', now(), now()), ('Section 25 Company', now(), now())\
			, ('Registered Society', now(), now()), ('Trust', now(), now()), ('HUF Firms', now(), now()), \
			('Drug License', now(), now()), ('VAT & CST Proprietership', now(), now()),\
			('VAT & CST Partnership Firm', now(), now()), ('VAT & CST Private Limited/Limited companies', now(), now())"];
		for(var i in query) {
			executeQuery(connection, query, i);
		}
	});
};

exports.down = function(next) {
	function executeQuery(connection, query, index) {
		connection.query(query[index], function(err, result) {
			if(err) {
				throw err;
			}
			if(index == (query.length - 1)) {
  				next();
  			}
		});
	}
	db.getConnection().then(function(connection) {
		var query = [];
		query = ["DELETE from master_documents", "DELETE from master_tasks"];
		for(var i in query) {
			executeQuery(connection, query, i);
		}
	});
};
