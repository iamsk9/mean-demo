Caweb.controller('dashboardController', function($rootScope, $scope, CAService, $mdToast, $location){
	if($rootScope.user.role == "CLIENT") {
		$location.path('/documents/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Dashboard'];
	CAService.getDashboardDetails().then(function(data){
		$scope.dashboardDetails = data;
	}, function(err) {
		$mdToast.show($mdToast.simple()
		.textContent("Error in Fetching dashboard details.")
		.position("top right")
		.hideDelay(5000));
	})
});