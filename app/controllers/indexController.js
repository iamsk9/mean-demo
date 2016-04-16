
var template = require('swig');

var jwt = require('jsonwebtoken');

var db = require('../../db');

exports.handle = function(req,res){
	console.log(req.cookies['x-ca-api-token']);
	if(req.cookies['x-ca-api-token'])
	{
		jwt.verify(req.cookies['x-ca-api-token'], app.get('secret'), function(err, decoded) {   
		  if (err) {
		  	console.log(err);
			res.sendfile('public/pages/examples/login.html');
		  } else {
		    // if everything is good, save to request for use in other routes
		    console.log(decoded.group);
		    var query = "SELECT * from user_tokens where session_token = ? and user_id = ? and deleted_at is NULL";
		    db.getConnection().then(function(connection) {
		    	connection.query(query, [req.cookies['x-ca-api-token'], decoded.id], function(err, results) {
		    		if(err) {
		    			throw err;
		    		}
		    		if(results.length > 0) {
		    			var tmpl = template.renderFile('public/index.html', {
							'apiKey' : req.cookies['x-ca-api-token'],
							'email' : decoded.email,
							'id' : decoded.id,
							'role' : decoded.role,
							'name' : decoded.name
						});
						res.send(tmpl);
		    			connection.release();
		    		} else {
		    			res.sendfile('public/login.html');
		    		}
		    	});
		    });
			
		  }
		});
	} else {
		res.sendfile('public/login.html');
	}
};