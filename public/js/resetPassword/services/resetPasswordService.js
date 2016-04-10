resetPasswordApp.factory('resetPasswordService', function($q, Restangular) {
	return {
		resetPassword : function(password) {
			var resetPasswordDefer = $q.defer();
			var payload = {
				password : password
			};
			Restangular.one('/resetPassword/' + user.id).post('', payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					resetPasswordDefer.resolve();
				} else {
					resetPasswordDefer.reject(data);
				}
			}, function(err) {
				resetPasswordDefer.reject(err);
			});
			return resetPasswordDefer.promise;
		}
	}
})