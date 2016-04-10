LoginApp.factory('loginService', function($q, Restangular) {
	return {
		signIn : function(login) {
			var signInDefer = $q.defer();
			Restangular.one('/authenticate').post('', login).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					signInDefer.resolve();	
				} else {
					signInDefer.reject(data);
				}
			}, function(err) {
				signInDefer.reject(err);
			});
			return signInDefer.promise;
		}
	}
})