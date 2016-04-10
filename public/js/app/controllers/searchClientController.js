Caweb.controller('searchClientController', function($scope, $rootScope, CAService, $mdToast, $location) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/clientArea/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Search Client'];
	$scope.searched = false;
	$scope.clients = [];
	$scope.search = {};
	$scope.clientsLoading = false;

	$scope.search = function() {
		if(validateSearch()) {
			$scope.clientsLoading = "indeterminate";
			$scope.searched = true;
			CAService.getClients($scope.search).then(function(data){
				$scope.clientsLoading = false;
				$scope.clients = data;
			}, function(err) {
				$scope.clientsLoading = false;
				$mdToast.show($mdToast.simple()
					.textContent("Error occurred while fetching clients.")
					.position("top right")
					.hideDelay(5000));
			});
		} else {
			$mdToast.show($mdToast.simple()
					.textContent("Enter any of the options to search.")
					.position("top right")
					.hideDelay(5000));
		}
	}

	$scope.addClient = function() {
		$location.path('/client/new');
	}

	$scope.openClient = function(client) {
		$location.path('/clientArea/' + client.id);
	}

	function validateSearch() {
		return ($scope.search.clientId) ||
			($scope.search.companyName && $scope.search.companyName != "") ||
			($scope.search.clientName && $scope.search.clientName != "") ||
			($scope.search.email && $scope.search.email != "") ||
			($scope.search.phoneNumber && $scope.search.phoneNumber != "") ||
			($scope.search.panCardNumber && $scope.search.panCardNumber != "");
	}
});