Caweb.controller('addClientController', function($scope, $rootScope, CAService, $mdToast) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/documents/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Add Client'];
	$scope.addClient = function() {
		if(validateDetails()) {
			$scope.addClientForm.$setPristine();
			$scope.addClientLoading = "indeterminate";
			CAService.addClient($scope.client).then(function(){
				$scope.addClientLoading = false;
				$mdToast.show($mdToast.simple()
					.textContent("Client is successfully Added")
					.position("top right")
					.hideDelay(5000));
				$scope.client = {};
				$scope.addClientForm.$setPristine(true);
				$scope.addClientForm.$setDirty(false);
				$scope.addClientForm.$setUntouched(true);
			}, function(err) {
				$scope.addClientLoading = false;
				if(err.errorCode == 1015) {
					$scope.addClientForm.email.$error.userExists = true;
					$scope.addClientForm.email.$invalid = true;
				} else if(err.errorCode == 1018) {
					$scope.addClientForm.panCard.$error.panCardExists = true;
					$scope.addClientForm.panCard.$invalid = true;
				} else {
					$mdToast.show($mdToast.simple()
					.textContent("Error occurred in adding client.")
					.position("top right")
					.hideDelay(5000));
				}
			});
		}
	}

	function validateDetails() {
		return (($scope.client.companyName && $scope.client.companyName != "") &&
			($scope.client.clientName && $scope.client.clientName != "") && 
			($scope.client.email && $scope.client.email != "") &&
			($scope.client.phoneNumber) && ($scope.client.panCardNumber && $scope.client.panCardNumber != ""));
	}
})