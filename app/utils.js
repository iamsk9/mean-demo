var q = require('q');

exports.runQuery = function(connection, query, params, notRelease) {
	var queryDefer = q.defer();
	console.log("asdg");
	console.log(params);
	if(!params) {
		params = [];
	}
	connection.query(query, params, function(err, results, fields){
		if(!notRelease) {
			connection.release();	
		}
		if(err) {
			queryDefer.reject(err);
			return;
		}
		queryDefer.resolve(results, fields);
	}, function(err) {
		queryDefer.reject(err);
		connection.release;
	});
	return queryDefer.promise;
}