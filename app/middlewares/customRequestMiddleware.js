var jwt = require('jsonwebtoken');

var db = require('../../db');

exports.setUser = function(req, res, next) {
	// check header or url parameters or post parameters for token
	var token = req.cookies['x-ca-api-token'];
	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('secret'), function(err, decoded) {      
		  if (err) {
		  	console.log(err);
		    return res.json({ success: false, message: 'Failed to authenticate token.' });    
		  } else {
		    // if everything is good, save to request for use in other routes
		    var query = "SELECT * from user_tokens where session_token = ? and user_id = ? and deleted_at is NULL";
		    db.getConnection().then(function(connection) {
		    	connection.query(query, [req.cookies['x-ca-api-token'], decoded.id], function(err, results) {
		    		if(err) {
		    			console.log(err);
		    			connection.release();
		    			return;
		    		}
		    		if(results.length > 0) {
		    			req.user = decoded;
		    			connection.release();
		    			next();
		    		} else {
		    			connection.release();
		    			return res.status(403).json({
						    returnCode: 'FAILURE',
						    data: null,
						    errorCode: 1013
						});
		    		}
		    	});
		    });
		  }
		});

	} else {
		// if there is no token
		// return an error
		return res.status(403).json({
		    returnCode: 'FAILURE',
		    data: null,
		    errorCode: 1013
		});
	}
};