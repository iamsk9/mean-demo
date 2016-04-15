Caweb.controller('usersController', function($scope, $rootScope, CAService, $mdToast, $location) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/clientArea/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Manage Users'];
	
	CAService.getUsers().then(function(users){
		$scope.users = users;
	}, function(err) {
		$mdToast.show($mdToast.simple()
		.textContent("Unable to fetch users")
		.position("top right")
		.hideDelay(5000));
	})

	$scope.addUser = function() {
		
	}

	$scope.updateUser = function(index) {

	}

	$scope.openClient = function(client) {
		$location.path('/clientArea/' + client.id);
	}

});