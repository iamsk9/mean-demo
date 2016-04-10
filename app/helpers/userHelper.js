var q = require('q');

var db = require('../../db');

var jwt = require('jsonwebtoken');

var bcrypt = require('bcrypt-nodejs');

var moment = require('moment');

var SALT_WORK_FACTOR = 19204;

function generateHash(password) {
	var hashDefer = q.defer();
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) hashDefer.reject(err);
        // hash the password using our new salt
        bcrypt.hash(password, salt, null, function(err, hash) {
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

exports.addUser = function(request) {
	var addUserDefer = q.defer();
	var checkUser = "SELECT * from users where email = ?";
	var insertUser = "INSERT INTO users (first_name, last_name, email, password, user_role, created_at, modified_at, is_verified) VALUES (?,?,?,?,?,?,?,?)";
	generateHash(request.password).then(function(password){
		console.log(password);
		db.getConnection().then(function(connection){
			connection.query(checkUser, [request.email], function(err, results) {
				if(err) {
					addUserDefer(err);
					connection.release();
					return;
				}
				if(results.length == 0) {
					connection.query(insertUser, [request.first_name, request.last_name, request.email, password,
					request.user_role, moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss'), request.is_verified]
					, function(err, results) {
						if(err) {
							addUserDefer(err);
							connection.release();
							return;
						}
						addUserDefer.resolve();
						connection.release();
						console.log("User successfully inserted");
					});
				} else {
					addUserDefer.reject({errorCode : 1015});
					connection.release();
				}
			});
		});
	}, function(err) {
		addUserDefer.reject(err);
	});
	return addUserDefer.promise;
}

exports.authenticateUser = function(req) {
	var authenticateUserDefer = q.defer();
	db.getConnection().then(function(connection) {
		var query = 'SELECT * from users WHERE email = ? and deleted_at is NULL';
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
				comparePassword(req.body.password, user.password).then(function(isMatch){
					if(isMatch) {
						var userToToken = {
							id : user.id,
							role : user.user_role,
							name : user.first_name + " " + user.last_name,
							email : user.email
						};
						var token = jwt.sign(userToToken, app.get('secret'))
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
	})
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
