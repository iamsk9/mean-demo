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
		query = ["INSERT INTO master_task_document_mapping (task_id, req_doc_id, custom_label, created_at, modified_at) VALUES \
		(1, 1, ' - Proprieter', now(), now()),\
		(1, 7, ' - Proprieter', now(), now()),\
		(1, 2, '', now(), now()),\
		(1, 3, '', now(), now()),\
		(1, 4, '- Applicant', now(), now()),\
		(2, 1, ' - Managing Partner', now(), now()),\
		(2, 7, ' - Applicant Entity', now(), now()),\
		(2, 2, ' - Managing Partner', now(), now()),\
		(2, 5, '', now(), now()),\
		(2, 3, '', now(), now()),\
		(2, 4, ' - Applicant Entity', now(), now()),\
		(3, 1, ' - Designated Partner/Director of the Company signing the application', now(), now()),\
		(3, 7, ' - Applicant Entity', now(), now()),\
		(3, 2, ' - Managing Partner/Director signing the application', now(), now()),\
		(3, 16, '', now(), now()),\
		(3, 3, '', now(), now()),\
		(3, 4, ' - Company', now(), now()),\
		(4, 1, ' - Designated Partner/Director of the Company signing the application', now(), now()),\
		(4, 7, ' - Applicant Entity', now(), now()),\
		(4, 2, ' - Managing Partner/Director signing the application', now(), now()),\
		(4, 16, '', now(), now()),\
		(4, 3, '', now(), now()),\
		(4, 4, ' - Company', now(), now()),\
		(5, 1, ' - Designated Partner/Director of the Company signing the application', now(), now()),\
		(5, 7, ' - Applicant Entity', now(), now()),\
		(5, 2, ' - Managing Partner/Director signing the application', now(), now()),\
		(5, 16, '', now(), now()),\
		(5, 3, '', now(), now()),\
		(5, 4, ' - Company', now(), now()),\
		(6, 1, ' - Designated Partner/Director of the Company signing the application', now(), now()),\
		(6, 7, ' - Applicant Entity', now(), now()),\
		(6, 2, ' - Managing Partner/Director signing the application', now(), now()),\
		(6, 16, '', now(), now()),\
		(6, 3, '', now(), now()),\
		(6, 4, ' - Company', now(), now()),\
		(7, 1, ' - Designated Partner/Director of the Company signing the application', now(), now()),\
		(7, 7, ' - Applicant Entity', now(), now()),\
		(7, 2, ' - Managing Partner/Director signing the application', now(), now()),\
		(7, 16, '', now(), now()),\
		(7, 3, '', now(), now()),\
		(7, 4, ' - Company', now(), now()),\
		(8, 1, ' - signatory applicant/Secretary or Chief Executive', now(), now()),\
		(8, 7, ' - Applicant Entity', now(), now()),\
		(8, 2, ' - Secretary or Chief Executive signing the application', now(), now()),\
		(8, 3, '', now(), now()),\
		(8, 6, '', now(), now()),\
		(8, 4, ' - Registered Society', now(), now()),\
		(9, 1, ' - signatory applicant/Secretary or Chief Executive', now(), now()),\
		(9, 7, ' - Applicant Entity', now(), now()),\
		(9, 2, ' - Managing Trustee signing the application', now(), now()),\
		(9, 3, '', now(), now()),\
		(9, 6, '', now(), now()),\
		(9, 4, ' - Trust', now(), now()),\
		(10, 1, ' - Karta', now(), now()),\
		(10, 7, ' - Karta', now(), now()),\
		(10, 2, ' - Karta', now(), now()),\
		(10, 3, '', now(), now()),\
		(10, 4, ' - Applicant', now(), now()),\
		(11, 7, ' - All Partners', now(), now()),\
		(11, 8, ' - All Partners', now(), now()),\
		(11, 9, ' - Firm', now(), now()),\
		(11, 17, '', now(), now()),\
		(11, 1, ' - All Partners', now(), now()),\
		(11, 5, '', now(), now()),\
		(11, 7, ' - Firm', now(), now()),\
		(11, 10, '', now(), now()),\
		(11, 11, '', now(), now()),\
		(11, 12, '', now(), now()),\
		(11, 13, ' - All Partners', now(), now()),\
		(11, 14, ' - All Partners', now(), now()),\
		(12, 7, ' - Proprieter', now(), now()),\
		(12, 8, ' - Proprieter', now(), now()),\
		(12, 9, ' - Firm', now(), now()),\
		(12, 17, '', now(), now()),\
		(12, 1, ' - Proprieter', now(), now()),\
		(12, 13, ' - Proprieter', now(), now()),\
		(12, 14, ' - Proprieter', now(), now()),\
		(13, 7, ' - All Partners', now(), now()),\
		(13, 8, ' - All Partners', now(), now()),\
		(13, 9, ' - Firm', now(), now()),\
		(13, 17, '', now(), now()),\
		(13, 1, ' - All Partners', now(), now()),\
		(13, 5, '', now(), now()),\
		(13, 7, ' - Firm', now(), now()),\
		(13, 13, ' - All Partners', now(), now()),\
		(13, 14, ' - All Partners', now(), now()),\
		(14, 7, ' - All Directors', now(), now()),\
		(14, 8, ' - All Directors', now(), now()),\
		(14, 9, ' - Company', now(), now()),\
		(14, 17, '', now(), now()),\
		(14, 1, ' - All Directors', now(), now()),\
		(14, 15, '', now(), now()),\
		(14, 16, '', now(), now()),\
		(14, 13, ' - All Directors', now(), now()),\
		(14, 14, ' - All Directors', now(), now())"];
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
		query = ["DELETE from master_task_document_mapping"];
		for(var i in query) {
			executeQuery(connection, query, i);
		}
	});
};
