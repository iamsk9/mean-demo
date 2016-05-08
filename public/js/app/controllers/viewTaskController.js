Caweb.controller('viewTaskController', function($scope, $rootScope, $routeParams, CAService, $mdToast, $location, $mdDialog,
	UserService) {
	if($rootScope.user.role == "CLIENT") {
		$location.path('/clientArea/' + $rootScope.user.id);
		return;
	}
	$rootScope.selectedTab = $rootScope.tabsMap['Tasks'];
	var tasks;
	var originalTasks;
	function getTask() {
		CAService.getTask($routeParams.taskId).then(function(task){
			$scope.task = task;
			$scope.docStatus = {};
			for(var i = 0; i < $scope.task.docs.length; i++) {
				$scope.docStatus[$scope.task.docs[i].id] = $scope.task.docs[i];
			}
		}, function(err) {
			if(err.errorCode == 1025) {
				$location.path('/tasks');
				return;
			}
			$mdToast.show($mdToast.simple()
			.textContent("Unable to fetch Task Details")
			.position("top right")
			.hideDelay(5000));
		});
	}
	function getReqDocs() {
		CAService.getReqDocs($routeParams.taskId).then(function(reqDocs) {
			$scope.reqDocs = reqDocs;
		}, function(err) {
			$mdToast.show($mdToast.simple()
			.textContent("Unable to fetch Document Details")
			.position("top right")
			.hideDelay(5000));
		});
	}
	getTask();
	getReqDocs();
	$scope.back = function() {
		$location.path('/tasks');
	}
	$scope.updateTask = function() {
		$location.path('/task/' + $scope.task.id + '/edit');
	}
});