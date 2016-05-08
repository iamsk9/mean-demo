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
		},
		isAdmin : function() {
			return user.user_role == 'admin';
		},
		getUsers : function(payload) {
			var usersDefer = $q.defer();
			Restangular.one('/users').get(payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					usersDefer.resolve(data.data);
				} else {
					usersDefer.reject();
				}
			}, function(err){
				usersDefer.reject(err);
			})
			return usersDefer.promise;
		},
		addUser : function(payload) {
			var addUserDefer = $q.defer();
			Restangular.one('/user').post('', payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					addUserDefer.resolve(data.data);
				} else {
					addUserDefer.reject(data);
				}
			}, function(err) {
				addUserDefer.reject(err);
			});
			return addUserDefer.promise;
		},
		removeUser : function(id) {
			var removeUserDefer = $q.defer();
			Restangular.one('/user/' + id).remove().then(function(data) {
				if(data.returnCode == "SUCCESS") {
					removeUserDefer.resolve(data.data);
				} else {
					removeUserDefer.reject(data);
				}
			});
			return removeUserDefer.promise;
		},
		updateUser : function(id, payload) {
			var updateUserDefer = $q.defer();
			Restangular.one('/user/' + id).patch(payload).then(function(data) {
				if(data.returnCode == "SUCCESS") {
					updateUserDefer.resolve(data);
				} else {
					updateUserDefer.reject(data);
				}
			}, function(err) {
				updateUserDefer.reject(err);
			})
			return updateUserDefer.promise;
		}
	}
});