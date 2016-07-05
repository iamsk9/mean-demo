Caweb.controller('searchClientController', function($scope, $rootScope, CAService, $mdToast, $location, 
	$mdDialog) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/documents/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Clients'];
	$scope.searched = false;
	$scope.clients = [];
	$scope.search = {};
	$scope.clientsLoading = false;
	$scope.enableSearchClient = false;
	function getClients(search) {
		CAService.getClients(search).then(function(data){
			$scope.clientsLoading = false;
			$scope.clients = data;
		}, function(err) {
			$scope.clientsLoading = false;
			$mdToast.show($mdToast.simple()
				.textContent("Error occurred while fetching clients.")
				.position("top right")
				.hideDelay(5000));
		});
	}
	if(!$scope.enableSearchClient) {
		$scope.clientLoading = "indeterminate";
		$scope.searched = true;
		getClients();
	}
	$scope.search = function() {
		if(validateSearch()) {
			$scope.clientsLoading = "indeterminate";
			$scope.searched = true;
			getClients($scope.search);
		} else {
			$mdToast.show($mdToast.simple()
					.textContent("Enter any of the options to search.")
					.position("top right")
					.hideDelay(5000));
		}
	}

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
				getClients();
				$scope.closeDialog();
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

	$scope.closeDialog = function() {
		$mdDialog.cancel();
		$scope.client = {};
	}

	$scope.showAddClientDialog = function() {
		$mdDialog.show({
	    	controller : function($scope, theScope) {
	    		$scope.theScope = theScope
	    		$scope.$watch('addClientForm', function() {
	    			$scope.theScope.addClientForm = $scope.addClientForm;
	    		}, true);
	    	},
			templateUrl : 'addClient.tmpl.html',
			parent : angular.element(document.body),
			clickOutsideToClose:true,
			locals : {
				theScope : $scope
			}
		}).then(function(){
		});
	}

	$scope.openClient = function(client) {
		$location.path('/documents/' + client.id);
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