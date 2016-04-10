var mysql = require('mysql');
var config = require('./config/config');
var q = require('q');

var pool = mysql.createPool({
    connectionLimit : 100, 
    host     : config.database.hostName,
    user     : config.database.user,
    password : config.database.password,
    database : config.database.dbName,
    debug    :  false
});

exports.getConnection = function() {
	var connectionDefer = q.defer();
	pool.getConnection(function(err, connection) {
		if(err) {
			console.log(err);
			connectionDefer.reject(err);
			return;
		}
		connectionDefer.resolve(connection);
	});
	return connectionDefer.promise;
}