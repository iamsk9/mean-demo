
var template = require('swig');

var jwt = require('jsonwebtoken');

var db = require('../../db');

var utils = require('../utils');

exports.handle = function(req,res){
	console.log(req.cookies['x-ca-api-token']);
	if(req.cookies['x-ca-api-token'])
	{
		jwt.verify(req.cookies['x-ca-api-token'], app.get('secret'), function(err, decoded) {
			if (err) {
				console.log(err);
				res.sendfile('public/login.html');
			} else {
				// if everything is good, save to request for use in other routes
				console.log(decoded.group);
				var query = "SELECT * from user_tokens where session_token = ? and user_id = ? and deleted_at is NULL";
				var userQuery = "SELECT * from users where id = ?";
				var connection;
				db.getConnection().then(function(conn) {
					connection = conn;
					return utils.runQuery(connection, query, [req.cookies['x-ca-api-token'], decoded.id], true);
				}).then(function(results) {
					if(results.length > 0) {
						return utils.runQuery(connection, userQuery, [decoded.id]);
					} else {
						res.sendfile('public/login.html');
					}
				}).then(function(results) {
					console.log(results);
					if(results && results.length > 0) {
						template.invalidateCache();
						var tmpl = template.renderFile('public/index.html', {
							'apiKey' : req.cookies['x-ca-api-token'],
							'email' : results[0].email,
							'id' : decoded.id,
							'role' : results[0].user_role,
							'name' : results[0].first_name
						});
						res.send(tmpl);
					}
				}).catch(function(err) {
					console.log(err);
					res.sendfile('public/login.html');
				});
			}
		});
	} else {
		res.sendfile('public/login.html');
	}
};
