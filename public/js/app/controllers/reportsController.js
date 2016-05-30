Caweb.controller('reportsController', function($scope, $rootScope, CAService, $mdToast, $location,
	$routeParams, $timeout) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/documents/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Reports'];
	$scope.clients = [];
	$scope.search = {};
	$scope.clientsLoading = false;

	$scope.querySearch = function(searchText) {
		return CAService.searchClients(searchText);
	}

	$scope.getName = function(item) {
		return "#" + item.id + " - " + item.name;
	}
});