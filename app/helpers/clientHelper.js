
var q = require('q');

var moment = require('moment');

var db = require('../../db');

var UserHelper = require('./userHelper');

var emailer = require('../emailer');

var config = require('../../config/config');

var bcrypt = require('bcrypt-nodejs');

var utils  = require('../utils');

var SALT_WORK_FACTOR = 19204;

function generateHash(string) {
	var hashDefer = q.defer();
	console.log(string);
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) hashDefer.reject(err);
        // hash the password using our new salt
        bcrypt.hash(string, salt, null, function(err, hash) {
            if (err) hashDefer.reject(err);
            // override the cleartext password with the hashed one
            console.log("resolving the promise");
            hashDefer.resolve(hash);
        });
    });
    return hashDefer.promise;
}


function checkPancardExists(connection, panCard) {
	var pancardExistsDefer = q.defer();
	if(typeof panCard !== "undefined") {
		var query = "SELECT * from clients where company_pan_number = ? and deleted_at is NULL";
		connection.query(query, [panCard], function(err, results) {
			if(err) {
				pancardExistsDefer.reject(err);
				connection.release();
				return;
			}
			if(results.length > 0) {
				connection.release();
				pancardExistsDefer.reject({pancardExists: true})
			} else {
				pancardExistsDefer.resolve();
			}
		});
	} else {
		pancardExistsDefer.resolve();
	}
	return pancardExistsDefer.promise;
}

exports.addClient = function(req) {
	var addClientDeferred = q.defer();
	var insertUser = "INSERT INTO users (first_name, email, user_role, created_at, modified_at, is_verified, reset_password_hash, request_password_hash_active) VALUES (?,?,?,?,?,?,?,?)";
	var insertClient = "INSERT into clients (user_id, name, company_name, email, phone_number, \
		alt_phone_number, company_pan_number, created_at, modified_at, status) VALUES (?,?,?,?,?,?,?,?,?,?)";

	db.getConnection().then(function(connection) {
		UserHelper.checkUserExists(connection, req.email).then(function() {
			checkPancardExists(connection, req.company_pan_number).then(function() {
				console.log("Inside");
				generateHash("#" + req.client_name + " - " + req.email + " - " + req.phone_number).then(function(hash){
					console.log("asdkghasdg");
					emailer.send('public/templates/_emailTemplate.html', {
						name : req.client_name,
						url : config.domain + '/client/resetpassword?hash=' + hash,
						role : 'Client'
					}, req.email, "Team Consultancy - Set Password for the Account");
					console.log("here");
					connection.query(insertUser, [req.client_name, req.email, "CLIENT",
					moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), 0, hash, 1], function(err, result) {
						if(err) {
							addClientDeferred.reject(err);
							connection.release();
							return;
						}
						console.log(result);
						connection.query(insertClient, [result.insertId, req.client_name, req.company_name,
							req.email, req.phone_number, req.alt_phone_number?req.alt_phone_number:null,
							req.company_pan_number, moment().format('YYYY-MM-DD HH:mm:ss'),
							moment().format('YYYY-MM-DD HH:mm:ss'), 'ACTIVE'], function(err, results) {
							if(err) {
								addClientDeferred.reject(err);
								return;
							}
							addClientDeferred.resolve(results);
							connection.release();
						});
					});
				}, function(err) {
					addClientDeferred.reject(err);
					return;
				});
			}, function(err){
				if(err.pancardExists) {
					addClientDeferred.reject({errorCode : 1018});
				} else {
					addClientDeferred.reject(err);
				}
			});
		}, function(err) {
			if(err.userExists) {
				addClientDeferred.reject({errorCode : 1015});
			} else {
				addClientDeferred.reject(err);
			}
		});
	}, function(err) {
		addClientDeferred.reject(err);
	});
	return addClientDeferred.promise;
}

exports.getClients = function(request) {
	var getClientsDefer = q.defer();
	if(request.search_query) {
		var clientsQuery = "SELECT * from clients WHERE (CONCAT(id, company_pan_number, company_name, name) \
			LIKE '%" + request.search_query + "%') and deleted_at is NULL limit 10";
	} else {
		var clientsQuery = "SELECT * from clients ";
		if(request.client_id) {
			clientsQuery = clientsQuery + (clientsQuery.indexOf('where') == -1?" where":" and ");
			clientsQuery = clientsQuery + " id = " + request.client_id + " ";
		}
		if(request.company_pan_number) {
			clientsQuery = clientsQuery + (clientsQuery.indexOf('where') == -1?" where":" and ");
			clientsQuery = clientsQuery + (" company_pan_number like '%" + request.company_pan_number + "%' ");
		}
		if(request.client_name) {
			clientsQuery = clientsQuery + (clientsQuery.indexOf('where') == -1?" where":" and ");
			clientsQuery = clientsQuery + " name like '%" + request.client_name + "%' ";
	 	}
	 	if(request.company_name) {
	 		clientsQuery = clientsQuery + (clientsQuery.indexOf('where') == -1?" where":" and ");
	 		clientsQuery = clientsQuery + (" company_name like '%" + request.company_name + "%' ");
	 	}
	 	if(request.email) {
	 		clientsQuery = clientsQuery + (clientsQuery.indexOf('where') == -1?" where":" and ");
	 		clientsQuery = clientsQuery + " email like '%" + request.email + "%' ";
	 	}
	 	if(request.phone_number) {
	 		clientsQuery = clientsQuery + (clientsQuery.indexOf('where') == -1?" where":" and ");
	 		clientsQuery = clientsQuery + " phone_number like '%" + request.phone_number + "%' ";
	 	}
	 	clientsQuery = clientsQuery + (clientsQuery.indexOf('where') == -1?" where":" and ");
	 	clientsQuery = clientsQuery + " deleted_at is NULL";
 	}
 	db.getConnection().then(function(connection) {
 		var query = connection.query(clientsQuery, function(err, results) {
 			if(err) {
 				getClientsDefer.reject(err);
 				connection.release();
 				return;
 			}
 			connection.release();
 			getClientsDefer.resolve(results);
 		});
 		console.log(query.sql);
 	}, function(err) {
 		getClientsDefer.reject(err);
 	});
 	return getClientsDefer.promise;
}

exports.getClientDetails = function(id) {
	var getClientDetailsDefer = q.defer();
	var clientDetails = "SELECT * from clients where id = ? and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		connection.query(clientDetails, [id], function(err, results) {
			if(err) {
				getClientDetailsDefer.reject(err);
				connection.release();
				return;
			}
			if(results.length > 0) {
				getClientDetailsDefer.resolve(results[0]);
			} else {
				getClientDetailsDefer.reject({errorCode : 1019});
			}
			connection.release();
		});
	}, function(err){
		getClientDetailsDefer.reject(err);
	});
}

exports.updateClient = function(id, details) {
	var updateClientDefer = q.defer();
	var updateQuery = "UPDATE clients ";
	if(details.company_pan_number) {
		updateQuery = updateQuery + (updateQuery.indexOf('set') == -1?'set company_pan_number = "' + details.company_pan_number + '"':
		',company_pan_number = "' + details.company_pan_number + '"');
	}
	if(details.name) {
		updateQuery = updateQuery + (updateQuery.indexOf('set') == -1?'set name = "' + details.name + '"':
			', name = "' + details.name + '"');
	}
	if(details.company_name) {
		updateQuery = updateQuery + (updateQuery.indexOf('set') == -1?'set company_name = "' + details.company_name + '"':
			', company_name = "' + details.company_name + '"');
	}
	if(details.email) {
		updateQuery = updateQuery + (updateQuery.indexOf('set') == -1?'set email = "' + details.email + '"':
			', email = "' + details.email + '"');
	}
	if(details.phone_number) {
		updateQuery = updateQuery + (updateQuery.indexOf('set') == -1?'set phone_number = "' + details.phone_number + '"':
			', phone_number = "' + details.phone_number + '"');
	}
	if(details.alt_phone_number) {
		updateQuery = updateQuery + (updateQuery.indexOf('set') == -1?'set alt_phone_number = "' + details.alt_phone_number + '"':
			', alt_phone_number = "' + details.alt_phone_number + '"');
	}
	if(updateQuery.indexOf('set') > -1){
		updateQuery = updateQuery + ', modified_at = "' + moment().format('YYYY-MM-DD HH:mm:ss') +
			'" where id = ' + id;
	} else {
		updateClientDefer.reject({errorCode : 1020});
		return updateClientDefer.promise;
	}
	db.getConnection().then(function(connection){
		checkUserExists(connection, details.email).then(function() {
			checkPancardExists(connection, details.company_pan_number).then(function() {
				var query = connection.query(updateQuery, function(err, results) {
					connection.release();
					if(err) {
						updateClientDefer.reject(err);
						return;
					}
					updateClientDefer.resolve();
				});
			}, function(err) {
				if(err.pancardExists) {
					updateClientDefer.reject({errorCode : 1018});
				} else {
					updateClientDefer.reject(err);
				}
			});
		}, function(err) {
			if(err.userExists) {
				updateClientDefer.reject({errorCode : 1015});
			} else {
				updateClientDefer.reject(err);
			}
		});
	}, function(err) {
		updateClientDefer.reject(err);
	});
	return updateClientDefer.promise;
}

exports.getTotalClientsCount = function (obj) {
	var clientCountDefer = q.defer();
	var clientCount = "SELECT count(*) as clientCount from clients where deleted_at is NULL";
	console.log("askdjhaslkjdg");
	db.getConnection().then(function(connection) {
		connection.query(clientCount, function(err, results) {
			if(err) {
				connection.release();
				clientCountDefer.reject(err);
			}
			if(results.length > 0) {
				obj.totalMetrics.clientCount = results[0].clientCount;
			} else {
				obj.totalMetrics.clientCount = 0;
			}
			connection.release();
			clientCountDefer.resolve();
		})
	}, function(err) {
		clientCountDefer.reject(err);
	});
	return clientCountDefer.promise;

}

exports.getTodaysClientsCount = function (obj) {
	var clientCountDefer = q.defer();
	var clientsAddedToday = "SELECT count(*) as clientCount from clients where DATE(created_at) = DATE(NOW()) and deleted_at is NULL"
	db.getConnection().then(function(connection) {
		connection.query(clientsAddedToday, function(err, results) {
			if(err) {
				connection.release();
				clientCountDefer.reject(err);
			}
			if(results.length > 0) {
				obj.todaysMetrics.clientCount = results[0].clientCount;
			} else {
				obj.todaysMetrics.clientCount = 0;
			}
			connection.release();
			clientCountDefer.resolve();
		})
	}, function(err) {
		clientCountDefer.reject(err);
	});
	return clientCountDefer.promise;
}

exports.getClientEnquiryDetails = function(id) {
	 var getClientEnquiryDetailsDefer = q.defer();
	var clientDetails = "SELECT * from clients_enquiry where id = ? and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		connection.query(clientDetails, [id], function(err, results) {
			if(err) {
				getClientEnquiryDetailsDefer.reject(err);
				connection.release();
				return;
			}
			if(results.length > 0) {
				connection.query("SELECT task_name from master_tasks where id = ?", [results[0].task], function(err, result) {
                   results[0].task_name = result[0].task_name;
	 			getClientEnquiryDetailsDefer.resolve(results[0]);
	 		 	});
			} else {
				getClientEnquiryDetailsDefer.reject({errorCode : 1019});
			}
			connection.release();
		});
	}, function(err){
		getClientEnquiryDetailsDefer.reject(err);
	});
	return getClientEnquiryDetailsDefer.promise;
}

exports.getLatestClient = function (obj) {
	var latestClientDefer = q.defer();
	var latestClient = "SELECT * from clients order by created_at DESC LIMIT 1";
	db.getConnection().then(function(connection) {
		connection.query(latestClient, function(err, results) {
			if(err) {
				connection.release();
				latestClientDefer.reject(err);
			}
			if(results.length > 0) {
				obj['latestClient'] = results[0];
			} else {
				obj['latestClient'] = {};
			}
			connection.release();
			console.log(results);
			latestClientDefer.resolve();
		})
	}, function(err) {
		latestClientDefer.reject(err);
	});
	return latestClientDefer.promise;
}

exports.getClientByUserId = function(id) {
	var getClientDetailsDefer = q.defer();
	var clientDetails = "SELECT * from clients where user_id = ? and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		connection.query(clientDetails, [id], function(err, results) {
			if(err) {
				getClientDetailsDefer.reject(err);
				connection.release();
				return;
			}
			console.log(results);
			if(results.length > 0) {
				getClientDetailsDefer.resolve(results);
			} else {
				getClientDetailsDefer.reject({errorCode : 1019});
			}
			connection.release();
		});
	}, function(err){
		getClientDetailsDefer.reject(err);
	});
	return getClientDetailsDefer.promise;
}

exports.updateClientStatus = function(clientId, status) {
	var updateClientStatusDefer = q.defer();
	var query = "UPDATE clients set status = ? where id = ?";
	db.getConnection().then(function(connection) {
		return utils.runQuery(connection, query, [status, clientId]);
	}).then(function(results) {
		updateClientStatusDefer.resolve()
	}).catch(function(err) {
		updateClientStatusDefer.reject(err);
	});
	return updateClientStatusDefer.promise;
}
