var q = require('q');

var db = require('../../db');

var jwt = require('jsonwebtoken');

var bcrypt = require('bcrypt-nodejs');

var moment = require('moment');

var emailer = require('../emailer');

var config = require('../../config/config');

var utils = require('../utils');

var SALT_WORK_FACTOR = 19204;

function generateHash(string) {
	var hashDefer = q.defer();
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) hashDefer.reject(err);
        // hash the password using our new salt
        bcrypt.hash(string, salt, null, function(err, hash) {
            if (err) hashDefer.reject(err);
            // override the cleartext password with the hashed one
            hashDefer.resolve(hash);
        });
    });
    return hashDefer.promise;
}

function comparePassword(candidatePassword, dbPassword) {
	var comparePasswordDefer = q.defer();
	bcrypt.compare(candidatePassword, dbPassword, function(err, isMatch) {
        if (err) comparePasswordDefer.reject(err);
        comparePasswordDefer.resolve(isMatch);
    });
    return comparePasswordDefer.promise;
}

var checkUserExists = function(connection, email) {
	var userExistsDefer = q.defer();
	if(typeof email !== "undefined") {
		var query = "SELECT * from users where email = ? and deleted_at is NULL";
		connection.query(query, [email], function(err, results) {
			if(err) {
				userExistsDefer.reject(err);
				connection.release();
				return;
			}
			if(results.length > 0) {
				connection.release();
				userExistsDefer.reject({userExists: true})
			} else {
				userExistsDefer.resolve();
			}
		});
	} else {
		userExistsDefer.resolve();
	}
	return userExistsDefer.promise;
}

exports.checkUserExists = checkUserExists;

exports.addUser = function(request) {
	var addUserDefer = q.defer();
	var insertUser = "INSERT INTO users (first_name, last_name, email, user_role, is_verified, created_at, modified_at, \
		reset_password_hash, request_password_hash_active, branch,department) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
	db.getConnection().then(function(connection) {
		checkUserExists(connection, request.email).then(function(data) {
			console.log("asdgasdg");
			generateHash('#' + request.first_name + '-' + request.email + '-' + moment().format('YYYY-MM-DD HH:mm:ss')).then(function(hash){
				console.log('inside hash');
				emailer.send('public/templates/_emailTemplate.html', {
					name : request.first_name,
					url : config.domain + '/user/resetpassword?hash=' + hash,
					role : 'User'
				}, request.email, "Team Consultancy - Set Password for the Account");
				connection.query(insertUser, [request.first_name, request.last_name, request.email,
				request.user_role, 0, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), hash, 1, request.branch,request.department]
				, function(err, results) {
					console.log("query");
					if(err) {
						addUserDefer.reject(err);
						connection.release();
						return;
					}
					addUserDefer.resolve();
					connection.release();
					console.log("User successfully inserted");
				});

			}, function(err) {
				connection.release();
				addUserDefer.reject(err);
			});
		}, function(err) {
			if(err.userExists) {
				addUserDefer.reject({errorCode : 1015});
			} else {
				addUserDefer.reject(err);
			}
		});
	}, function(err) {
		addUserDefer.reject(err);
	});
	return addUserDefer.promise;
}

exports.updateUser = function(id, requestParams) {
	var updateUserDefer = q.defer();
	var query = "UPDATE users ";
	db.getConnection().then(function(connection) {
		if(requestParams.email) {
			console.log(requestParams.email);
			checkUserExists(connection, requestParams.email).then(function() {
				console.log("asdkgakljsdg");
				query = query + (query.indexOf('SET') > -1?", email = '" + requestParams.email +
					"'":" SET email = '" + requestParams.email + "'");
				console.log(query);
				if(requestParams.user_role) {
					query = query + (query.indexOf('SET') > -1?", user_role = '" + requestParams.user_role +
						"'":" SET user_role = '" + requestParams.user_role + "'");
				}
				if(requestParams.first_name) {
					query = query + (query.indexOf('SET') > -1?", first_name = '" + requestParams.first_name
						+ "'":" SET first_name = '" + requestParams.first_name + "'");
				}
				if(requestParams.branch) {
					query = query + (query.indexOf('SET') > -1?", branch = " + requestParams.branch :" SET branch = " + requestParams.branch);
				}
				if(requestParams.department) {
					query = query + (query.indexOf('SET') > -1?", department = " + requestParams.department :" SET department = " + requestParams.department);
				}
				generateHash('#' + requestParams.email + '-' + moment().format('YYYY-MM-DD HH:mm:ss')).then(function(hash){
					emailer.send('public/templates/_emailTemplate.html', {
						name : "asdfasd",
						url : config.domain + '/user/resetpassword?hash=' + hash,
						role : 'User'
					}, requestParams.email, "Team Consultancy - Set Password for the Account");
					console.log(query);
					query = query + (", reset_password_hash = '" + hash + "', request_password_hash_active = 1");
					query = query + (" where id = " + id);
					utils.runQuery(connection, query).then(function(results) {
						updateUserDefer.resolve(results);
					}, function(err) {
						updateUserDefer.reject(err);
					})
				}, function(err) {
					updateUserDefer.reject(err);
				});
			}, function(err) {
				if(err.userExists) {
					updateUserDefer.reject({errorCode : 1015});
				} else {
					updateUserDefer.reject(err);
				}
			});
		} else {
			if(requestParams.user_role) {
				query = query + (query.indexOf('SET') > -1?", user_role = '" + requestParams.user_role +
					"'":" SET user_role = '" + requestParams.user_role + "'");
			}
			if(requestParams.first_name) {
				query = query + (query.indexOf('SET') > -1?", first_name = '" + requestParams.first_name
					+ "'":" SET first_name = '" + requestParams.first_name + "'");
			}
			if(requestParams.branch) {
				query = query + (query.indexOf('SET') > -1?", branch = " + requestParams.branch :" SET branch = " + requestParams.branch);
			}
			if(requestParams.department) {
				query = query + (query.indexOf('SET') > -1?", department = " + requestParams.department :" SET department = " + requestParams.department);
			}
			query = query + (" where id = " + id);
			console.log(query);
			utils.runQuery(connection, query).then(function(results){
				updateUserDefer.resolve(results);
			}, function(err) {
				updateUserDefer.reject(err);
			});
		}
	}, function(err) {
		updateUserDefer.reject(err);
	});
	return updateUserDefer.promise;
}

exports.authenticateUser = function(req) {
	var authenticateUserDefer = q.defer();
	db.getConnection().then(function(connection) {
		var query = 'SELECT u.id as id, c.id as client_id, c.status as status, u.user_role, u.first_name, u.last_name, u.email, u.password \
		 from users u LEFT JOIN clients c on u.id = c.user_id WHERE u.email = ? and u.deleted_at is NULL';
		console.log(req.body.email);
		connection.query(query, [req.body.email], function(err, results){
			if(err) {
				console.log(err);
				authenticateUserDefer.reject(err);
				return;
			}
			console.log(results);
			if(results.length > 0) {
				var user = results[0];
				if(user.status == 'BLOCKED') {
					console.log("inside this");
					authenticateUserDefer.reject({errorCode : 1029});
					return;
				}
				console.log("askdjgasd");
				comparePassword(req.body.password, user.password).then(function(isMatch){
					if(isMatch) {
						var userToToken = {
							id : user.id,
							role : user.user_role,
							name : user.first_name + " " + user.last_name,
							email : user.email
						};
						console.log("kajsfk");
						var token = jwt.sign(userToToken, app.get('secret'), {expiresIn: 21600 });
						var insertToken = "INSERT into user_tokens (user_id, session_token, created_at, deleted_at) VALUES (?,?,?,?)";
						connection.query(insertToken, [user.id, token, moment().format('YYYY-MM-DD HH:mm:ss'), null], function(err, result) {
							if(err) {
								console.log(err);
								authenticateUserDefer.reject(err);
								return;
							}
							result = {
								returnCode : "SUCCESS", data : {name : userToToken.name, email : userToToken.email,
								userId : userToToken.id, role : user.user_role, tid : token}, errorCode : null
							};
							authenticateUserDefer.resolve(result);
						});
					} else {
						authenticateUserDefer.reject({errorCode : 1011});
					}
					connection.release();
				});
			} else {
				authenticateUserDefer.reject({errorCode : 1010});
			}
		})
	});
	return authenticateUserDefer.promise;
}

exports.logoutUser = function(req) {
	var logoutDefer = q.defer();
	var logoutQuery = "UPDATE user_tokens set deleted_at = ? where user_id = ? and session_token = ?";
	db.getConnection().then(function(connection) {
		console.log("ahsdkgjojunzos");
		connection.query(logoutQuery, [moment().format('YYYY-MM-DD HH:mm:ss'), req.user.id,
			req.cookies['x-ca-api-token']], function(err, results) {
				console.log("asdgadshash");
				if(err) {
					console.log(err);
					logoutDefer.reject(err);
					return;
				}
				logoutDefer.resolve();
				connection.release();
			});
	}, function(err){
		logoutDefer.reject(err);
	});
	return logoutDefer.promise;
}

exports.sendResetPassword = function(req) {
	var sendResetPasswordDefer = q.defer();
	var getUserDetails = "SELECT id, first_name, last_name, email, user_role from users where reset_password_hash = ? and request_password_hash_active = ?";
	db.getConnection().then(function(connection) {
		console.log(req.query.hash);
		connection.query(getUserDetails, [req.query.hash, 1], function(err, results) {
			if(err) {
				sendResetPasswordDefer.reject(err);
				connection.release();
				return;
			}
			if(results.length > 0) {
				connection.release();
				sendResetPasswordDefer.resolve(results[0]);
			} else {
				sendResetPasswordDefer.reject({errorCode : 1021});
				connection.release();
				return;
			}
		});
	});
	return sendResetPasswordDefer.promise;
}

exports.getUsers = function(req) {
	var getUsersDefer = q.defer();
	var params = [];
	if(req.query.branch_id) {
		params.push([req.query.branch_id]);
		var query = "SELECT id, first_name, user_role, email, is_verified, branch, department from users where branch = ? and user_role <> 'CLIENT' and deleted_at is NULL";
	} else {
		var query = "SELECT id, first_name, user_role, email, is_verified, branch, department from users where user_role <> 'CLIENT' and deleted_at is NULL";
	}
	db.getConnection().then(function(connection) {
		connection.query(query, params, function(err, results) {
			connection.release();
			if(err) {
				getUsersDefer.reject(err);
				return;
			}
			getUsersDefer.resolve(results);
		});
	});
	return getUsersDefer.promise;
}

exports.getUser = function(id) {
	var getUserDefer = q.defer();
	var getUser = "Select id, name, email, is_verified from users where id = ? and user_role <> 'CLIENT' and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		connection.query(getUser, [id], function(err, results) {
			connection.release();
			if(err) {
				getUserDefer.reject(err);
				return;
			}
			getUserDefer.resolve(results);
		});
	});
	return getUserDefer.promise;
}

exports.removeUser = function(id) {
	var removeUserDefer = q.defer();
	var removeUser = "UPDATE users SET deleted_at = ? where id = ? and user_role <> 'CLIENT' and deleted_at is NULL";
	db.getConnection().then(function(connection) {
		connection.query(removeUser, [id, moment().format('YYYY-MM-DD HH:mm:ss')], function(err, results) {
			connection.release();
			if(err) {
				removeUserDefer.reject(err);
				return;
			}
			removeUserDefer.resolve();
		});
	});
	return removeUserDefer.promise;
}

exports.resetPassword = function(req) {
	var resetPasswordDefer = q.defer();
	var query = "UPDATE users set password = ?, request_password_hash_active = ? where id = ?";
	generateHash(req.body.password).then(function(password){
		db.getConnection().then(function(connection) {
			console.log("in connection");
			connection.query(query, [password, 0, req.params.userId], function(err, results) {
				console.log("inside reset Password");
				console.log(results);
				if(err) {
					resetPasswordDefer.reject(err);
					connection.release();
					return;
				}
				connection.release();
				resetPasswordDefer.resolve();
			});
		}, function(err) {
			resetPasswordDefer.reject(err);
		});
	}, function(err) {
		resetPasswordDefer.reject();
	});
	return resetPasswordDefer.promise;
}
