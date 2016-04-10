Caweb.factory('UserService', function(Restangular, $q){
	var user = window.user;
	return {
		getUserDetails : function() {
			return user;
		},
		logout : function() {
			var logoutDefer = $q.defer();
			Restangular.one('/logout').get().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					logoutDefer.resolve();
				} else {
					logoutDefer.reject();
				}
			}, function(err) {
				logoutDefer.reject(err);
			})
			return logoutDefer.promise;
		}
	}
});