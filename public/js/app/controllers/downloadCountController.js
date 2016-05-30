Caweb.controller('downloadCountController', function($scope, $rootScope, CAService, $mdToast, $location,
	$routeParams, $timeout) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/documents/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Download Count'];
	$scope.clients = [];
	$scope.search = {};
	$scope.clientsLoading = false;

	if(typeof $routeParams.clientId !== "undefined") {
		$scope.clientsLoading = "indeterminate";
		$scope.searched = true;
		CAService.getClientById($routeParams.clientId).then(function(data) {
			$scope.client = data;
		});
		CAService.getDocumentCountDetails($routeParams.clientId).then(function(data){
			$scope.clientSelected = true;
			console.log(data);
			$scope.downloadCountDetails = data.documentsDownload;
		}, function(err) {
			console.log(err);
			$mdToast.show($mdToast.simple()
			.textContent("Unable to fetch document download details")
			.position("top right")
			.hideDelay(5000));
		});
	} else {
		$scope.clientSelected = false;
	}

	$scope.addClient = function() {
		$location.path('/client/new');
	}

	$scope.openClient = function() {
		$location.path('/documents/' + $scope.client.id);
	}

	$scope.selectedClientChanged = function(client) {
		console.log(client);
		if(client) {
			$timeout(function(){
				$location.path('/downloadCount/' + client.id);
			}, 500);
		}
	}

	$scope.querySearch = function(searchText) {
		return CAService.searchClients(searchText);
	}

	$scope.getName = function(item) {
		return "#" + item.id + " - " + item.name;
	}
});